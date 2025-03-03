---
title: 注意事项
layout: docs
permalink: /zh/docs/handbook/declaration-files/do-s-and-don-ts.html
oneline: "编写 d.ts 文件方面的建议"
---

## 一般类型

### `Number`、`String`、`Boolean`、`Symbol` 和 `Object`

❌ **不要**使用类型 `Number`、`String`、`Boolean`、`Symbol` 或 `Object`。这些类型指的是非基本类型的装箱对象，在 JavaScript 代码中几乎从未被正确使用。

```ts
/* 错误 */
function reverse(s: String): String;
```

✅ **要**使用类型 `number`、`string`、`boolean` 和 `symbol`。

```ts
/* 正确 */
function reverse(s: string): string;
```

不要使用 `Object`，请使用非基本类型 `object`（[在 TypeScript 2.2 中添加](../release-notes/typescript-2-2.html#object-type)）。

### 泛型

❌ **不要**使用不带类型参数的泛型类型。更多细节请参见 [TypeScript 常见问题页面](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-type-inference-work-on-this-interface-interface-foot--).

### any

❌ **不要**将 `any` 用作类型，除非你正在将 JavaScript 项目迁移到 TypeScript。编译器*实际上*将 `any` 视为“请关闭对这个东西的类型检查”。这类似于在每次使用变量时添加 `@ts-ignore` 注释。当你首次将 JavaScript 项目迁移到 TypeScript 时，这非常有帮助，因为你可以将尚未迁移的内容的类型设置为 `any`，但在完整的 TypeScript 项目中，所有使用它的程序部分的类型检查将会被禁用。

在你不知道想要接受什么类型，或希望接受任何内容（不与其交互而盲目传入它）的情况下，可以使用 [`unknown`](/zh/play/#example/unknown-and-never)。

<!-- TODO: 更多 -->

## 回调类型

### 回调的返回类型

<!-- TODO: 重新措辞；这些示例在声明文件的上下文中没有意义 -->

❌ **不要**为返回值将被忽略的回调使用返回类型 `any`：

```ts
/* 错误 */
function fn(x: () => any) {
  x();
}
```

✅ **要**为返回值将被忽略的回调使用返回类型 `void`：

```ts
/* 正确 */
function fn(x: () => void) {
  x();
}
```

❔ **为什么：** 使用 `void` 更安全，因为它可以防止你意外地以不受检查的方式使用 `x` 的返回值：

```ts
function fn(x: () => void) {
  var k = x(); // 哎呀！本来想做其他事情
  k.doSomething(); // 错误，但如果返回类型是‘any’就不会有问题
}
```

### 回调中的可选参数

❌ **不要**在回调中使用可选参数，除非你真的想这样做：

```ts
/* 错误 */
interface Fetcher {
  getObject(done: (data: unknown, elapsedTime?: number) => void): void;
}
```

这有一个非常具体的含义：`done` 回调可能会在被调用时传递 1 个参数，或传递 2 个参数。作者可能意图表达回调可能不关心 `elapsedTime` 参数，但没有必要将该参数设为可选——回调可以合法地接受更少的参数。

✅ **要**将回调参数写为非可选：

```ts
/* 正确 */
interface Fetcher {
  getObject(done: (data: unknown, elapsedTime: number) => void): void;
}
```

### 重载和回调

❌ **不要**编写仅在回调参数个数上有所不同的单独重载：

```ts
/* 错误 */
declare function beforeAll(action: () => void, timeout?: number): void;
declare function beforeAll(
  action: (done: DoneFn) => void,
  timeout?: number
): void;
```

✅ **要**使用最大参数个数编写单个重载：

```ts
/* 正确 */
declare function beforeAll(
  action: (done: DoneFn) => void,
  timeout?: number
): void;
```

❔ **为什么：**回调可以合法地忽略参数，因此没有必要提供较短的重载。优先提供较短的回调会导致类型不正确的函数被错误传入，因为它们匹配了第一个重载。

## 函数重载

### 排序

❌ **不要** 将更一般的重载放在更具体的重载之前：

```ts
/* 错误 */
declare function fn(x: unknown): unknown;
declare function fn(x: HTMLElement): number;
declare function fn(x: HTMLDivElement): string;

var myElem: HTMLDivElement;
var x = fn(myElem); // x: unknown, 什么情况？
```

✅ **要** 通过将更具体的签名放在更一般的签名之前来排序重载：

```ts
/* 正确 */
declare function fn(x: HTMLDivElement): string;
declare function fn(x: HTMLElement): number;
declare function fn(x: unknown): unknown;

var myElem: HTMLDivElement;
var x = fn(myElem); // x: string, :) 
```

❔ **为什么：**TypeScript 在解析函数调用时选择*第一个匹配的重载*。当前面的重载比后面的重载“更一般”时，后面的重载实际上被隐藏，无法被调用。

### 使用可选参数

❌ **不要**编写多个仅在尾部参数上有所不同的重载：

```ts
/* 错误 */
interface Example {
  diff(one: string): number;
  diff(one: string, two: string): number;
  diff(one: string, two: string, three: boolean): number;
}
```

✅ **要**尽可能使用可选参数：

```ts
/* 正确 */
interface Example {
  diff(one: string, two?: string, three?: boolean): number;
}
```

注意，这种合并仅在所有重载具有相同的返回类型时发生。

❔ **为什么：**这很重要，有两个原因。

TypeScript 通过检查目标的任何签名是否可以使用源的参数调用来解析签名兼容性，*并且允许多余的参数*。例如，这段代码只有在使用可选参数正确编写签名时才会暴露错误：

```ts
function fn(x: (a: string, b: number, c: number) => void) {}
var x: Example;
// 当使用重载编写时，OK——使用第一个重载
// 当使用可选参数编写时，如预期般出现了错误
fn(x.diff);
```

第二个原因是当消费者使用 TypeScript 的“严格空检查”特性时。由于未指定的参数在 JavaScript 中会表现为 `undefined`，通常可以将显式的 `undefined` 传递给具有可选参数的函数。例如，这段代码在严格空检查下应该是 OK 的：

```ts
var x: Example;
// 当使用重载编写时，错误地因为将‘undefined’传递给‘string’而报错
// 当使用可选参数编写时，正确 OK
x.diff("something", true ? undefined : "hour");
```

### 使用联合类型

❌ **不要**编写仅在一个参数位置的类型不同的重载：

```ts
/* 错误 */
interface Moment {
  utcOffset(): number;
  utcOffset(b: number): Moment;
  utcOffset(b: string): Moment;
}
```

✅ **要**尽可能使用联合类型：

```ts
/* 正确 */
interface Moment {
  utcOffset(): number;
  utcOffset(b: number | string): Moment;
}
```

注意我们没有将 `b` 设置为可选，因为这些签名的返回类型不同。

❔ **为什么：** 这对那些“传递”值到你的函数的人很重要：

```ts
function fn(x: string): Moment;
function fn(x: number): Moment;
function fn(x: number | string) {
  // 当使用单独的重载时，出现了错误
  // 当使用联合类型时，正确 OK
  return moment().utcOffset(x);
}
```
