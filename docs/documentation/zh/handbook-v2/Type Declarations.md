---
title: 类型声明
layout: docs
permalink: /zh/docs/handbook/2/type-declarations.html
oneline: "TypeScript 如何为无类型的 JavaScript 提供类型"
---

在之前学习的各个章节中，我们一直使用所有 JavaScript 运行时中都存在的内置函数来演示基本的 TypeScript 概念。然而，现今的大多数 JavaScript 都包含许多用于完成常见任务的库。为你的应用程序中*非*自己代码的部分提供类型将极大地改善你的 TypeScript 使用体验。那这些类型是从哪里来的呢？

## 类型声明长什么样？

假设你写了如下的代码：

```ts twoslash
// @errors: 2339
const k = Math.max(5, 6);
const j = Math.mix(7, 8);
```

TypeScript 是如何知道 `max` 存在但 `mix` 不存在的，即使 `Math` 的实现不是你的代码的一部分？

答案是存在*声明文件*来描述这些内置对象。声明文件使我们可以*声明*某些值或类型的存在，而无需了解它们的实现过程。

## `.d.ts` 文件

TypeScript 有两种主要的文件类型。`.ts` 文件是包含类型和可执行代码的*实现*文件。这些文件会生成 `.js` 输出，通常是你编写代码的地方。

`.d.ts` 文件是只包含类型信息的*声明*文件。这些文件不会生成 `.js` 输出，它们仅用于类型检查。我们将在后面学习如何编写自己的声明文件。

## 内置类型定义

TypeScript 包含了所有 JavaScript 运行时标准内置 API 的声明文件。这包括内置类型（如 `string` 或 `function`）、顶级名称（如 `Math` 和 `Object`）以及它们相关的类型的方法和属性。默认情况下，TypeScript 还包括在浏览器内运行时可用的类型，例如 `window` 和 `document`，这些类型统称为 DOM API。

TypeScript 以 `lib.[something].d.ts` 的模式命名这些声明文件。这种名称的文件是平台的一些内置部分，而不是用户代码。

### `target` 设置

你可以使用的方法、属性和函数实际上取决于你的代码在哪个 JavaScript 的*版本*上运行。例如，字符串的 `startsWith` 方法仅在被称为 _ECMAScript 6_ 的 JavaScript 版本中才可用。

了解你的代码最终在什么 JavaScript 版本上运行很重要，因为你不能使用比你部署到的平台更新的 API。这是 [`target`](/zh/tsconfig#target) 编译器选项的一个特性。

TypeScript 会根据你的 [`target`](/tsconfig#target) 设置来决定默认包含哪些 `lib` 文件，借此帮助解决这个问题。例如，如果 [`target`](/zh/tsconfig#target) 是 `ES5`，这时尝试使用 `startsWith` 方法就会遇到错误，因为该方法仅在 `ES6` 或更高版本中可用。

### `lib` 设置

[`lib`](/zh/tsconfig#lib) 设置允许更精细地控制哪些内置声明文件在你的程序中可用。详细信息，请参阅关于 [`lib`](/zh/tsconfig#lib) 的文档页面。

## 外部定义

对于非内置 API，你可以通过多种方式获取声明文件。你应该根据你要获取类型的具体库选择适合的方式。

### 捆绑的类型

如果你正在使用的库是作为一个 npm 包发布，它可能已经包含了类型声明文件，作为其分发的一部分。你可以阅读该项目的文档来了解详情，或者简单地尝试导入该包，并查看 TypeScript 是否能够自动解析类型。

如果你是某个包的作者，并考虑将类型定义与包一起捆绑，你可以阅读我们关于[捆绑类型定义](/zh/docs/handbook/declaration-files/publishing.html#including-declarations-in-your-npm-package)的指南。

### DefinitelyTyped / `@types`

[DefinitelyTyped 仓库](https://github.com/DefinitelyTyped/DefinitelyTyped/)是一个集中存储了数千个库的声明文件的仓库。绝大多数常用库在 DefinitelyTyped 上都有可用的声明文件。

在 DefinitelyTyped 上的定义也会自动发布到 npm，并以 `@types` 作用域进行命名。类型包的名称与对应包的名称始终相同。例如，如果你安装了 `react` npm 包，你可以通过运行以下命令安装相应的类型：

```sh
npm install --save-dev @types/react
```

TypeScript 会自动在 `node_modules/@types` 下查找类型定义，因此在你的程序中无需进行其他操作即可使用这些类型。

### 自定义

在极少数情况下，某个库既没有捆绑自己的类型，也没有在 DefinitelyTyped 上有定义，这时你可以自己编写声明文件。请参阅附录[编写声明文件](/zh/docs/handbook/declaration-files/introduction.html)获取指南。

如果你不想编写特定模块的声明文件而又想要消除警告，你还可以通过在项目的一个 `.d.ts` 文件中写入空声明，来将该模块快速声明为类型 `any`。例如，如果你想要使用名为 `some-untyped-module` 的模块但没有该模块的定义，你可以写入以下内容：

```ts twoslash
declare module "some-untyped-module";
```
