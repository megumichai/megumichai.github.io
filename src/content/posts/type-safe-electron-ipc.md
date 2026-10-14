---
title: 类型安全的 Electron 通信
description: 用一张 IpcChannel 类型表驱动 ipcMain 与 ipcRenderer，让 IPC 通道名、参数和返回值全部获得 TypeScript 的类型检查与补全。
pubDate: 2026-10-14
tags: ["TypeScript", "Electron"]
---

[TypeScript Playground](https://www.typescriptlang.org/play/?#code/PTAEBMDoBcGcCgCWBbADgewE7VAIgKYA2+AxtJugHa4Dc884phAhpvqAOaHoBGzhoAN7xQoYACpxI0eNDQAnqnwBaAGb5YOAPLJE0AJKVGADwDKiDpWbQArm1AABQokoBrIQAto0VLABcIBx6HjY8kCToyMCwLuBssFghsMAKSmoa0AC+0qDiwNL4xhjYcorsOnqGJuaW1nb4ADxaPABWpNAAKmUAfKAAvEI5oADaANL48l1KoC6grhPoqqDNbWRT7MywQpmghdD4RlsASqRY4A3jk2UANKA2bpToAO6U3UMA-KCU+ABu+JhDPygS7rAC6QJW7XWYwmYLookydGkLn2mFUzBI7H0qBIAGEPMxKN8BHsDuBjqdMOdNJgXBxbgAKSDM1gcfygQnyYaggCU-V6nN6glA2WkqSxOIAsswXAAJQngYgAGUQmgO-wuvQGo12xn2hzmCyW2LxBKJRA+oAZQ1EvwO0CBAFFiGQKJRICbpS5DD90PNHX9KNBrjbQMzIKz2QAFVjMZD4VGwBom-GE4ljUFvUSiPl9Xops3p0ag3X68kzSjqTCgABilFDnzrpbJWyZLMwbKBnO5ud6LiroCODcHoaB3z+AOz2bHdsn06+s7oopAoFMCdAAANYK5EKgVTx8aRXBu5OgZpYsOxoB52P8KJgEIwSCx7Mh0OAbMQ8ER2m7cINRCseNYFQDF2FxGxNEiZ1fyoADsxRf50UxUBPRlShmwNGDXSoD0pXQ+CpzNRVGh1UkDXmeRFmWXQDCMQoaisWw2GTHFU3NQhum6a0pynEhCyIIFRhDXjs2cNVvkwIE0LlBVlVVfUNVGboRN4nkgV9RBwHhbNsj4qhNBmfCXGk4zKCRKcVy0a9-lgcMhkQtEwNQnETnothq3I8tsPIXCTTcxgPKEEVpFFW0iiwHABggqDkB8t0l3oFc4HoJ8X3YLheH4eDHOQiVTTTIhCLkDIgQZXtQE08AhlAzA43ZBlmCBGk6VuHgxxsZAeH+Cqqpq2NkFgAAmMreBaIFhSa0AWsoelQHar5Ou66tMl69AtKGeJPwdK0Ksm5ryFa+aOq6-4QoReBshQYocGFXcSC9DCdlUChkG-F1fOoJF7seyBiOIBlcHuVxHheAB9SjcEZPaRR5JAzL+uT8EB-ZNCh3b+WC1b4Ye9DEaMAHcFq+r0YZMG7SDW5wzByMYdW0QV1ldAJ1AGmOy2BVpvwK8b1KaZVRGKaZrmhbKCW-5QRx37-uRgByYnBqG2XGXJwNg3glco3iLZcXIQgAGpTFAlDoDPWBubkXnYBsDgOAyRADMuum4Z+vGZYZWWtsIaBlYxvMrWEUQpoARluFd1lAWWxdOzBZZmLZHhwTYYlqHgv1Nvn2Fl4XZekBbg6duGgA)

---

Electron 的进程间通信（IPC）建立在字符串通道名之上：`ipcMain.handle("foo", ...)` 与 `ipcRenderer.invoke("foo")` 之间唯一的联系就是那段字符串。原生类型定义里，通道名是 `string`，参数是 `any[]`，返回值是 `Promise<any>`——写错一个字母、参数顺序颠倒、返回值结构对不上，编译期全都不会报错，只能等到运行时才发现。

本文介绍一种基于**接口合并（Declaration Merging）**的改造方式：先用一张 `IpcChannel` 类型表描述「每个通道收什么参数、返回什么」，再让这份类型表去约束 `ipcMain` 与 `ipcRenderer`。最终效果是——通道名有补全、参数有类型、返回值有约束。

## 核心思路

整体分两步：

1. **定义类型表**：写一个 `IpcChannel` 接口，key 是通道名，value 是通道处理函数的签名。这个接口是「唯一事实来源」。
2. **增强 electron 模块**：给 `Electron.IpcMain` / `Electron.IpcRenderer` 的 `handle` / `invoke` 签名加上泛型约束，让它们从 `IpcChannel` 里推导出每个通道的参数与返回值。

## 第一步：定义通道类型表

先声明一份全局的 `IpcChannel` 接口。为了能在任意文件里补全，把它放进 `declare global`：

```ts
// src/global.d.ts

declare global {
  interface IpcChannel {
    test: () => void;
    params: (a: string, b: number) => void;
    params2: (obj: { a: string; b: number }) => void;
    result: () => { a: string; b: number };
  }
}

export {};
```

约定：

- **key** 是 IPC 通道名（如 `"params"`）；
- **value 的参数**是渲染进程传给主进程的参数（不含 `event`，`event` 由 Electron 注入）；
- **value 的返回值**是通道的返回结果，`ipcRenderer.invoke` 拿到的就是这个类型。

> `export {}` 是为了让文件成为模块，这样 `declare global` 才生效。

## 第二步：增强 electron 的类型

接下来是这套方案的核心。我们在 `src/global.d.ts` 中通过 `declare module "electron"` 给 `electron` 模块打补丁：

```ts
// src/global.d.ts
import "electron";

declare global {
  /**
   * 去掉索引签名，只保留显式的键。
   * @see https://github.com/sindresorhus/type-fest
   */
  export type OmitIndexSignature<ObjectType> = {
    [
      KeyType in keyof ObjectType as {} extends Record<KeyType, unknown> ? never : KeyType
    ]: ObjectType[KeyType];
  };

  /** 空接口，供后续 declare global 合并扩展 */
  interface IpcChannel extends Record<string, (...args: any[]) => any> {}

  /** 从通道名 K 推导出 ipcMain.handle 的监听器签名 */
  type IpcMainHandleListener<K> = K extends keyof IpcChannel
    ? (
        event: Electron.IpcMainInvokeEvent,
        ...args: Parameters<IpcChannel[K]>
      ) => IpcChannel[K] extends infer Fn
        ? Fn extends (...args: any[]) => infer R
          ? R
          : never
        : never
    : never;

  /** 从通道名 K 推导出 ipcRenderer.invoke 的返回类型 */
  type IpcRendererInvokeResult<K> = K extends keyof IpcChannel
    ? IpcChannel[K] extends (...args: any[]) => infer R
      ? R
      : never
    : never;
}

// 需要把 skipLibCheck 打开，否则会与 Electron 内置类型冲突
declare module "electron" {
  namespace CustomElectron {
    interface IpcMain extends Electron.IpcMain {
      handle<K extends keyof OmitIndexSignature<IpcChannel>>(
        channel: K,
        listener: IpcMainHandleListener<K>,
      ): void;
    }

    interface IpcRenderer extends Electron.IpcRenderer {
      invoke<K extends keyof OmitIndexSignature<IpcChannel>>(
        channel: K,
        ...args: Parameters<IpcChannel[K]>
      ): Promise<IpcRendererInvokeResult<K>>;
    }

    const ipcMain: IpcMain;
    const ipcRenderer: IpcRenderer;
  }

  export = CustomElectron;
}
```

### 关键类型说明

- **`OmitIndexSignature`**：`IpcChannel` 为了能被任意合并扩展，带了一条 `Record<string, ...>` 的索引签名。如果不把它去掉，`keyof IpcChannel` 会退化成 `string`，`"unknown_key"` 这种任意字符串都能通过检查。这个工具类型把索引签名过滤掉，只留下显式声明的通道名，通道名才能收窄成字面量联合类型。

- **`IpcMainHandleListener<K>`**：通过 `Parameters<IpcChannel[K]>` 取出参数元组，再把 `event` 拼在最前面，得到监听器的完整签名；返回值则用 `infer R` 从通道签名里推导出来。这样 `ipcMain.handle("result", ...)` 的返回值就必须匹配 `{ a: string; b: number }`。

- **`IpcRendererInvokeResult<K>`**：渲染侧用同样的方式推导返回值类型，`invoke` 的 `Promise` 里包的就是通道的返回类型。

- **`declare module "electron"`**：把 `CustomElectron` 重新 `export =`，等于替换了 `electron` 模块对外的类型。`skipLibCheck: true` 是必须的——它让 TypeScript 跳过内置库（含 Electron 原始 d.ts）的检查，从而不去计较这里的重定义。

## 第三步：主进程 —— ipcMain.handle

类型表就位后，主进程的写法完全不变，但每一处都会自动获得约束：

```ts
import { ipcMain } from "electron";

// ❌ 类型错误：'"unknown_key"' 不在允许的通道名里
ipcMain.handle("unknown_key", () => {});

ipcMain.handle("test", () => {});

// 悬停 _args 可以看到类型是 [a: string, b: number]
ipcMain.handle("params", (_event, ..._args) => {});

ipcMain.handle(
  "params2",
  (
    _event,
    {
      // 按 Ctrl+Space，会提示 a、b 两个字段
    },
  ) => {},
);

// ❌ 类型错误：'number' 不能赋值给 'string'
ipcMain.handle("result", () => ({
  a: 1,
  b: 1,
}));
```

三个约束同时生效：

- `handle` 的第一个参数只接受 `IpcChannel` 里声明过的通道名，拼错或不存在的通道名会直接报错；
- 监听器的剩余参数由通道签名推导，顺序和类型都有提示；
- 监听器的返回值必须与通道声明的返回类型一致。

## 第四步：渲染进程 —— ipcRenderer.invoke

同样的约束也作用在渲染侧：

```ts
import { ipcRenderer } from "electron";

// 返回值类型为 { a: string; b: number }
const result = await ipcRenderer.invoke("result");
console.log(result.a.toUpperCase());

// 参数按通道签名校验：第一个必须是 string，第二个必须是 number
await ipcRenderer.invoke("params", "hello", 42);

// ❌ 类型错误：第二个参数应为 number
await ipcRenderer.invoke("params", "hello", "world");

// ❌ 类型错误：'"unknown_key"' 不在允许的通道名里
await ipcRenderer.invoke("unknown_key");
```

`invoke` 的 `...args` 直接复用 `Parameters<IpcChannel[K]>`，返回类型则由 `IpcRendererInvokeResult<K>` 推导，因此**参数和返回值两端都与主进程的声明对齐**——改动类型表一处，主进程和渲染进程会同时收到报错或补全。

## 实践建议

- **单一事实来源**：所有通道都只在 `IpcChannel` 里声明一次，主进程和渲染进程各自 `import` 同一份类型文件，避免两边各写一份签名。
- **按域拆分**：通道多起来后，可以在多个 `.d.ts` 里分别 `declare global { interface IpcChannel { ... } }`，接口会自动合并，天然支持按功能模块切分。
- **配合 `skipLibCheck`**：如前所述，这个方案依赖 `tsconfig.json` 中的 `skipLibCheck: true`；如果项目因其他原因不便开启，需要评估与 Electron 内置类型的冲突。

通过这一改造，IPC 不再是一条「靠字符串维系」的隐形契约，而是一张被 TypeScript 完全检查的类型表：**通道名、参数、返回值，任一环节写错都会在编译期暴露**，而不是等到运行时才发现通信两端已经对不上。
