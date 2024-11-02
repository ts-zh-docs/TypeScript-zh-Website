---
title: Modules .d.ts
layout: docs
permalink: /zh/docs/handbook/declaration-files/templates/module-d-ts.html
---

## 将 JavaScript 与示例 DTS 进行比较

## 常见 CommonJS 模式

使用 CommonJS 模式的模块使用 `module.exports` 来描述导出的值。例如，这里是导出函数和数值常量的模块示例：

```js
const maxInterval = 12;

function getArrayLength(arr) {
  return arr.length;
}

module.exports = {
  getArrayLength,
  maxInterval,
};
```

这可以通过以下 `.d.ts` 来描述：

```ts
export function getArrayLength(arr: any[]): number;
export const maxInterval: 12;
```

TypeScript 演练场可以展示 JavaScript 代码对应的 `.d.ts`。你可以[在这里自行尝试](/play?useJavaScript=true#code/GYVwdgxgLglg9mABAcwKZQIICcsEMCeAMqmMlABYAUuOAlIgN6IBQiiW6IWSNWAdABsSZcswC+zCAgDOURAFtcADwAq5GKUQBeRAEYATM2by4AExBC+qJQAc4WKNO2NWKdNjxFhFADSvFquqk4sxAA)。

`.d.ts` 语法有意地看起来像 [ES 模块](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)语法。ES 模块在 2015 年由 TC39 正式通过，作为 ES2015（ES6）的一部分，尽管它已经通过转译器长时间可用，但如果你有一个使用 ES 模块的 JavaScript 代码库：

```js
export function getArrayLength(arr) {
  return arr.length;
}
```

这将具有以下 `.d.ts` 等效内容：

```ts
export function getArrayLength(arr: any[]): number;
```

### 默认导出

在 CommonJS 中，你可以将任何值作为默认导出，例如下面是一个正则表达式模块：

```js
module.exports = /hello( world)?/;
```

可以通过以下 `.d.ts` 来描述：

```ts
declare const helloWorld: RegExp;
export default helloWorld;
```

或者一个数字：

```js
module.exports = 3.142;
```

```ts
declare const pi: number;
export default pi;
```

CommonJS 中一种导出的方式是导出一个函数。因为函数也是一个对象，所以额外的字段可以被添加并包含在导出中。

```js
function getArrayLength(arr) {
  return arr.length;
}
getArrayLength.maxInterval = 12;

module.exports = getArrayLength;
```

可以这样描述：

```ts
export default function getArrayLength(arr: any[]): number;
export const maxInterval: 12;
```

请注意，在你的 .d.ts 文件中使用 `export default` 需要设置 [`esModuleInterop: true`](/zh/tsconfig#esModuleInterop) 才能正常工作。如果你的项目无法使用 `esModuleInterop: true`，比如当你向 Definitely Typed 提交 PR 时，你就不得不使用 `export=` 语法。这种较老的语法使用起来较困难，但在任何地方都可以正常工作。以下是如何使用 `export=` 来编写上述示例：

```ts
declare function getArrayLength(arr: any[]): number;
declare namespace getArrayLength {
  declare const maxInterval: 12;
}

export = getArrayLength;
```

请查看[模块：函数](/zh/docs/handbook/declaration-files/templates/module-function-d-ts.html)以了解其工作原理的详细信息，以及[模块参考](/zh/docs/handbook/modules.html)页面。

## 处理多种导入方式

在现代的消费者代码中，有许多导入模块的方式：

```ts
const fastify = require("fastify");
const { fastify } = require("fastify");
import fastify = require("fastify");
import * as Fastify from "fastify";
import { fastify, FastifyInstance } from "fastify";
import fastify from "fastify";
import fastify, { FastifyInstance } from "fastify";
```

要涵盖所有这些情况，需要 JavaScript 代码实际上支持所有这些模式。为了支持其中多种模式，一个 CommonJS 模块需要类似以下形式：

```js
class FastifyInstance {}

function fastify() {
  return new FastifyInstance();
}

fastify.FastifyInstance = FastifyInstance;

// 允许 { fastify }
fastify.fastify = fastify;
// 允许严格的 ES 模块支持
fastify.default = fastify;
// 设置默认导出
module.exports = fastify;
```

## 模块中的类型

你可能希望为 JavaScript 代码提供一个不存在的类型：

```js
function getArrayMetadata(arr) {
  return {
    length: getArrayLength(arr),
    firstObject: arr[0],
  };
}

module.exports = {
  getArrayMetadata,
};
```

这可以用以下方式描述：

```ts
export type ArrayMetadata = {
  length: number;
  firstObject: any | undefined;
};
export function getArrayMetadata(arr: any[]): ArrayMetadata;
```

这个例子是一个很好的使用[泛型](/zh/docs/handbook/generics.html#generic-types)来提供更丰富类型信息的案例：

```ts
export type ArrayMetadata<ArrType> = {
  length: number;
  firstObject: ArrType | undefined;
};

export function getArrayMetadata<ArrType>(
  arr: ArrType[]
): ArrayMetadata<ArrType>;
```

现在数组的类型会传播到 `ArrayMetadata` 类型中。

导出的类型可以被模块的消费者通过在 TypeScript 代码中使用 `import` 或 `import type`，或者 [JSDoc 导入](/zh/docs/handbook/jsdoc-supported-types.html#import-types)来重复使用。

### 模块代码中的命名空间

描述 JavaScript 代码的运行时关系可能有些棘手。当类似 ES 模块的语法无法提供足够的工具来描述导出时，你可以使用 `命名空间`。

例如，你可能有足够复杂的类型需要描述，选择将它们放你的 `.d.ts` 文件的命名空间中：

```ts
// 这代表在运行时可用的 JavaScript 类
export class API {
  constructor(baseURL: string);
  getInfo(opts: API.InfoRequest): API.InfoResponse;
}

// 这个命名空间与 API 类合并，允许消费者和这个文件拥有被嵌套在自己部分中的类型。
declare namespace API {
  export interface InfoRequest {
    id: string;
  }

  export interface InfoResponse {
    width: number;
    height: number;
  }
}
```

要了解命名空间在 `.d.ts` 文件中的工作原理，请阅读 [`.d.ts` 深入研究](/zh/docs/handbook/declaration-files/deep-dive.html)。

### 可选全局使用

你可以使用 `export as namespace` 来声明你的模块将在 UMD 上下文中以全局范围可用：

```ts
export as namespace moduleName;
```

## 参考示例

为了让你了解所有这些部分如何结合在一起，这里是一个参考的 `.d.ts`，可以在创建新模块时使用。

```ts
// 类型定义 for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// 项目: [~THE PROJECT NAME~]
// 定义者: [~YOUR NAME~] <[~A URL FOR YOU~]>

/*~ 这是模块模板文件。你应该将其重命名为 index.d.ts
 *~ 并将其放在与模块同名的文件夹中。
 *~ 例如，如果你正在为 "super-greeter" 编写文件，那么
 *~ 文件应该是 'super-greeter/index.d.ts'
 */

/*~ 如果此模块是一个 UMD 模块，在加载到模块加载器环境之外时会暴露一个全局变量 'myLib'，请在这里声明全局变量。
 *~ 否则，请删除此声明。
 */
export as namespace myLib;

/*~ 如果此模块导出函数，请这样声明。
 */
export function myFunction(a: string): string;
export function myOtherFunction(a: number): number;

/*~ 你可以声明通过导入模块可用的类型 */
export interface SomeType {
  name: string;
  length: number;
  extras?: string[];
}

/*~ 你可以使用 const、let 或 var 声明模块的属性 */
export const myField: number;
```

### 库文件布局

你的声明文件的布局应该与库的布局相对应。

一个库可以由多个模块组成，比如

```
myLib
  +---- index.js
  +---- foo.js
  +---- bar
         +---- index.js
         +---- baz.js
```

这些可以被导入为

```js
var a = require("myLib");
var b = require("myLib/foo");
var c = require("myLib/bar");
var d = require("myLib/bar/baz");
```

因此，你的声明文件应该是

```
@types/myLib
  +---- index.d.ts
  +---- foo.d.ts
  +---- bar
         +---- index.d.ts
         +---- baz.d.ts
```

### 测试你的类型

如果你计划将这些更改提交给 DefinitelyTyped，以供其他人使用，那么我们建议你：

> 1. 在 `node_modules/@types/[libname]` 中创建一个新文件夹
> 2. 在该文件夹中创建一个 `index.d.ts`，并将示例复制进去
> 3. 查看你对模块的使用出现问题的地方，并开始填写 index.d.ts
> 4. 当你满意时，克隆 [DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped) 并按照 README 中的说明操作。

否则

> 1. 在你源代码树的根目录中创建一个新文件：`[libname].d.ts`
> 2. 添加 `declare module "[libname]" {  }`
> 3. 在 declare module 的大括号内添加模板，并查看你的使用出现问题的地方
