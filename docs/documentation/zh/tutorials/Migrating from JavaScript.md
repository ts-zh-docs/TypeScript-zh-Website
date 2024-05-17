---
title: 从 JavaScript 迁移
layout: docs
permalink: /zh/docs/handbook/migrating-from-javascript.html
oneline: 如何从 JavaScript 迁移到 TypeScript
---

TypeScript 并非孤立存在。它是基于 JavaScript 生态系统而构建的，而且现今有很多 JavaScript 代码存在。将 JavaScript 代码转换为 TypeScript，尽管可能有些繁琐，通常不会太难。在本教程中，我们将介绍如何开始迁移过程。我们假设你已经阅读了足够多的手册内容，可以编写新的 TypeScript 代码。

如果你想要转换 React 项目，我们建议首先查看 [React 转换指南](https://github.com/Microsoft/TypeScript-React-Conversion-Guide#typescript-react-conversion-guide)。

## 设置目录结构

如果你编写代码使用的是纯 JavaScript 语法，那么你可以直接运行你的 JavaScript 代码。其中你的 `.js` 文件位于 `src`、`lib` 或 `dist` 目录，并按需要运行。

如果是这种情况，那么你编写的文件将作为 TypeScript 的输入，并运行它生成的输出结果。在 JS 到 TS 的迁移过程中，我们需要分离输入文件，以防止 TypeScript 覆盖它们。如果你的输出文件需要放置在特定的目录中，那么该目录将成为你的输出目录。

你可能还会对你的 JavaScript 运行一些中间步骤，例如打包或使用其他转译器（如 Babel）。在这种情况下，你可能已经设置了类似以下结构的文件夹。

从此开始，我们假设你的目录结构类似于以下结构：

```
projectRoot
├── src
│   ├── file1.js
│   └── file2.js
├── built
└── tsconfig.json
```

如果你位于 `src` 目录之外有一个 `tests` 文件夹，你可能会在 `src` 和 `tests` 中各有一个 `tsconfig.json` 文件。

## 编写配置文件

TypeScript 使用一个名为 `tsconfig.json` 的文件来管理项目的选项，例如要包含哪些文件以及要执行哪些类型的检查。让我们为项目创建一个最基本的配置文件：

```json
{
  "compilerOptions": {
    "outDir": "./built",
    "allowJs": true,
    "target": "es5"
  },
  "include": ["./src/**/*"]
}
```

在本例中，我们向 TypeScript 指定了一些内容：

1. 读取 `src` 目录中任何它理解的文件（使用 [`include`](/zh/tsconfig#include)）。
2. 允许将 JavaScript 文件作为输入（使用 [`allowJs`](/zh/tsconfig#allowJs)）。
3. 将所有输出文件生成到 `built` 目录中（使用 [`outDir`](/zh/tsconfig#outDir)）。
4. 将较新的 JavaScript 构造转换为较旧的版本，例如 ECMAScript 5（使用 [`target`](/zh/tsconfig#target)）。

此时，如果你尝试在项目的根目录运行 `tsc` 命令，你应该会在 `built` 目录中看到输出文件。`built` 目录中的文件布局应与 `src` 目录中的文件布局相同。现在，你应该已经成功将 TypeScript 集成到你的项目中了。

## 早期好处

即使在当前这个阶段，借助 TypeScript 对你的项目的理解，你也可以获得一些好处。如果你打开像 [VS Code](https://code.visualstudio.com) 或 [Visual Studio](https://visualstudio.com) 这样的编辑器，通常可以得到一些工具支持，如自动完成。你还可以通过以下选项捕获某些错误：

- [`noImplicitReturns`](/zh/tsconfig#noImplicitReturns) 可以防止你忘记在函数末尾添加返回语句。
- [`noFallthroughCasesInSwitch`](/zh/tsconfig#noFallthroughCasesInSwitch) 可以防止你忘记在 `switch` 语句块的 `case` 之间添加 `break` 语句。

TypeScript 还会警告不可达代码和标签，你可以分别使用 [`allowUnreachableCode`](/zh/tsconfig#allowUnreachableCode) 和 [`allowUnusedLabels`](/zh/tsconfig#allowUnusedLabels) 进行禁用。

## 与构建工具集成

你的构建流程中可能还有一些其他的构建步骤。也许你会将一些内容添加到每个文件中。每个构建工具都不同，但我们将尽力概述大致的操作过程。

### Gulp

如果你以某种方式使用 Gulp，我们有一个关于[使用 Gulp](/zh/docs/handbook/gulp.html) 搭配 TypeScript，以及与常见构建工具如 Browserify、Babelify 和 Uglify 集成的教程。你可以在那里阅读更多信息。

### Webpack

Webpack 的集成非常简单。你可以使用 `ts-loader`，这是一个 TypeScript 加载器，结合 `source-map-loader` 可以很方便地进行调试。只需运行以下命令：

```shell
npm install ts-loader source-map-loader
```

然后将以下选项合并到你的 `webpack.config.js` 文件中：

```js
module.exports = {
  entry: "./src/index.ts",
  output: {
    filename: "./dist/bundle.js",
  },

  // 为调试 webpack 的输出启用源映射。
  devtool: "source-map",

  resolve: {
    // 将‘.ts’和‘.tsx’添加为可解析的扩展名。
    extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
  },

  module: {
    rules: [
      // 所有具有‘.ts’或‘.tsx’拓展名的文件将由‘ts-loader’处理。
      { test: /\.tsx?$/, loader: "ts-loader" },

      // 所有输出的‘.js’文件将由‘source-map-loader’重新处理任何源映射。
      { test: /\.js$/, loader: "source-map-loader" },
    ],
  },

  // 其他选项...
};
```

需要注意的是，ts-loader 需要在其他处理 `.js` 文件的加载器之前运行。

你可以在我们的 [React 和 Webpack 教程](/zh/docs/handbook/react-&-webpack.html)中看到使用 Webpack 的示例。

## 迁移到 TypeScript 文件

现在，你可能已经准备好开始使用 TypeScript 文件了。第一步是将你的某个 `.js` 文件重命名为 `.ts`。如果你的文件使用了 JSX，你需要将其重命名为 `.tsx`。

完成这一步了吗？太好了！你已经成功将一个文件从 JavaScript 迁移到 TypeScript！

当然，这可能感觉有些不对劲。如果你在支持 TypeScript 的编辑器中打开该文件（或者运行 `tsc --pretty`），你可能会在某些行上看到红色的波浪线。你可以把它们类比作 Microsoft Word 中的拼写错误提示。TypeScript 仍然会翻译你的代码，就像 Word 仍然允许你打印文档一样。

如果这样的行为对你来说太宽松了，你可以收紧它。例如，如果你**不希望** TypeScript 在出现错误时仍将代码编译为 JavaScript，你可以使用 [`noEmitOnError`](/zh/tsconfig#noEmitOnError) 选项。从这个意义上说，TypeScript 对其严格性有一个调节开关，你可以将其调到任意水平。

如果你计划使用 TypeScript 提供的更严格的设置，最好现在就打开它们（参见下面的[获取更严格的检查](#获取更严格的检查)）。例如，如果你不希望 TypeScript 在没有显式指定时自动推断类型为 `any`，你可以在开始修改文件之前使用 [`noImplicitAny`](/zh/tsconfig#noImplicitAny)。虽然可能会感到有些压力，但长期收益很快就会显现出来。

### 消除错误

正如我们提到的，转换后出现错误消息是正常的。重要的是逐个处理这些错误，并决定如何处理它们。通常这些错误是合法的 bug，但有时你需要更好地向 TypeScript 解释你的意图。

#### 从模块中导入

你可能会遇到一堆错误，例如 `Cannot find name 'require'` 和 `Cannot find name 'define'`。在这些情况下，很可能你正在使用模块。虽然你可以通过编写以下代码来告诉 TypeScript 这些名称是存在的：

```ts
// 对于 Node/CommonJS
declare function require(path: string): any;
```

或者

```ts
// 对于 RequireJS/AMD
declare function define(...args: any[]): any;
```

但最好的做法是不去使用这些调用语句，转而使用 TypeScript 的导入语法。

首先，你需要通过设置 TypeScript 的 [`module`](/zh/tsconfig#module) 选项来启用某种模块系统。有效的选项有 `commonjs`、`amd`、`system` 和 `umd`。

如果你有以下的 Node/CommonJS 代码：

```js
var foo = require("foo");

foo.doStuff();
```

或者以下的 RequireJS/AMD 代码：

```js
define(["foo"], function (foo) {
  foo.doStuff();
});
```

那么你应该编写以下的 TypeScript 代码：

```ts
import foo = require("foo");

foo.doStuff();
```

#### 获取声明文件

如果你开始转换为 TypeScript 导入语句，可能会遇到类似 `Cannot find module 'foo'.` 的错误。问题可能在于你没有描述库的*声明文件*。幸运的是这很容易解决。如果 TypeScript 发出警告，警告与一个名为 `lodash` 的包有关，你可以执行以下命令：

```shell
npm install -S @types/lodash
```

如果你使用的模块选项不是 `commonjs`，你需要将你的 [`moduleResolution`](/tsconfig#moduleResolution) 选项设置为 `node`。

之后，你就可以顺利导入 lodash，并获得精准的自动完成。

#### 从模块导出

通常，从模块导出涉及向值（如 `exports` 或 `module.exports`）添加属性。TypeScript 允许你使用顶级导出语句（top-level export statement）。例如，如果你想这样导出一个函数：

```js
module.exports.feedPets = function (pets) {
  // ...
};
```

你可以使用以下方式来编写：

```ts
export function feedPets(pets) {
  // ...
}
```

有时你可能会完全覆盖导出对象。这种模式很常见，人们借此来使他们的模块可以立即调用，就像这个片段中的示例：

```js
var express = require("express");
var app = express();
```

你以前可能会这样写：

```js
function foo() {
  // ...
}
module.exports = foo;
```

在 TypeScript 中，你可以使用 `export =` 构造来模拟这个行为。

```ts
function foo() {
  // ...
}
export = foo;
```

#### 太多/太少参数

有时候调用一个函数时参数会过多或过少。通常情况下，这是一个 bug，但在某些情况下，你可能已经声明了一个使用 `arguments` 对象而不是编写参数的函数。

```js
function myCoolFunction() {
  if (arguments.length == 2 && !Array.isArray(arguments[1])) {
    var f = arguments[0];
    var arr = arguments[1];
    // ...
  }
  // ...
}

myCoolFunction(
  function (x) {
    console.log(x);
  },
  [1, 2, 3, 4]
);
myCoolFunction(
  function (x) {
    console.log(x);
  },
  1,
  2,
  3,
  4
);
```

在这种情况下，我们需要使用 TypeScript 来告诉我们的任何调用者可以使用函数重载来调用 `myCoolFunction` 的方式。

```ts
function myCoolFunction(f: (x: number) => void, nums: number[]): void;
function myCoolFunction(f: (x: number) => void, ...nums: number[]): void;
function myCoolFunction() {
  if (arguments.length == 2 && !Array.isArray(arguments[1])) {
    var f = arguments[0];
    var arr = arguments[1];
    // ...
  }
  // ...
}
```

我们为 `myCoolFunction` 添加了两个重载签名。第一个声明了 `myCoolFunction` 接受一个函数（该函数接受一个 `number`）和一个 `number` 数组作为参数。第二个声明了它也接受一个函数，然后使用剩余参数（`...nums`）来表示在此之后的参数可以是任意数量的 `number`。

#### 按顺序添加的属性

有些人认为在创建对象后立即添加属性的方式更有美感，就像这样：

```js
var options = {};
options.color = "red";
options.volume = 11;
```

TypeScript 会报错，说无法赋值给 `color` 和 `volume`，因为它首先确定了 `options` 的类型为 `{}`，而该类型没有任何属性。如果将声明直接移到对象字面量中，就不会出现错误：

```ts
let options = {
  color: "red",
  volume: 11,
};
```

你还可以定义 `options` 的类型，并在对象字面量上添加类型断言。

```ts
interface Options {
  color: string;
  volume: number;
}

let options = {} as Options;
options.color = "red";
options.volume = 11;
```

或者，你可以将 `options` 声明为 `any` 类型，这是最简单的方法，但效果最差。

#### `any`, `Object`, and `{}`

你可能会尝试使用 `Object` 或 `{}` 来表示一个值可以拥有任意属性，因为 `Object` 在大多数情况下是最通用的类型。然而，在这些情况下，**实际上你应该使用 `any` 类型**，因为它是最*灵活*的类型。

例如，如果你将某个值类型定义为 `Object`，你将无法调用 `toLowerCase()` 等方法。更通用通常意味着你可以对类型做的事情更少，但 `any` 是一个特例，它是最通用的类型，同时允许你对它进行任何操作。这意味着你可以调用它、构造它、访问它的属性等等。然而请记住，使用 `any` 时，你将失去大部分 TypeScript 提供的错误检查和编辑器支持。

如果在使用 `Object` 和 `{}` 之间做决策，你应该选择 `{}`。虽然它们在大多数情况下相同，但从技术上讲，`{}` 在某些特殊情况下比 `Object` 更通用。

### 获取更严格的检查

TypeScript 带有某些检查功能，可为你的程序提供更多安全保障和分析。一旦你将代码库转换为 TypeScript，你就可以启用这些检查，以获得更高的安全性。

#### 禁止隐式的 `any`

在某些情况下，TypeScript 无法确定某些类型的正确值。为了尽可能地宽松，它会决定使用类型 `any` 代替。虽然这对于迁移来说很方便，但使用 `any` 的话，你无法获得任何类型安全性，并且你也无法获得其他工具的支持。你可以通过 [`noImplicitAny`](/zh/tsconfig#noImplicitAny) 选项告诉 TypeScript 标记这些位置，并给出错误提示。

#### 严格的 `null` 和 `undefined` 检查

默认情况下，TypeScript 假设 `null` 和 `undefined` 存在于每种类型。这意味着用 `number` 类型声明的任何内容都可能是 `null` 或 `undefined`。由于在 JavaScript 和 TypeScript 中，`null` 和 `undefined` 经常是 bug 的根源，TypeScript 提供了 [`strictNullChecks`](/zh/tsconfig#strictNullChecks) 选项，让你不必担心这些问题。

在启用了 [`strictNullChecks`](/zh/tsconfig#strictNullChecks) 后，`null` 和 `undefined` 将分别拥有自己的类型 `null` 和 `undefined`。每当某个值*可能*是 `null` 时，你可以使用与该原始类型联合的联合类型。例如，如果某个值可能是 `number` 或 `null`，你可以将类型写为 `number | null`。

如果 TypeScript 认为某个值可能是 `null`/`undefined`，但实际上你知道它不是，你可以使用后缀 `!` 运算符来告诉 TypeScript。

```ts
declare var foo: string[] | null;

foo.length; // 错误——‘foo’可能为‘null’

foo!.length; // 正确——‘foo!’的类型为‘string[]’
```

需要注意的是，当使用 [`strictNullChecks`](/zh/tsconfig#strictNullChecks) 时，你的依赖项可能需要更新以同时使用 [`strictNullChecks`](/zh/tsconfig#strictNullChecks)。

#### 不允许隐式的 `any` 类型用于 `this`

当你在类外部使用 `this` 关键字时，默认情况下它的类型是 `any`。例如，想象一个 `Point` 类，并想象一个我们希望添加为方法的函数：

```ts
class Point {
  constructor(public x, public y) {}
  getDistance(p: Point) {
    let dx = p.x - this.x;
    let dy = p.y - this.y;
    return Math.sqrt(dx ** 2 + dy ** 2);
  }
}
// ...

// 扩展接口。
interface Point {
  distanceFromOrigin(): number;
}
Point.prototype.distanceFromOrigin = function () {
  return this.getDistance({ x: 0, y: 0 });
};
```

这个例子中存在与前面提到的问题相同的问题——我们很容易拼写错误 `getDistance` 而没有得到错误提示。为此，TypeScript 提供了 [`noImplicitThis`](/zh/tsconfig#noImplicitThis) 选项。当设置了该选项时，TypeScript 在 `this` 使用时没有明确的（或推断的）类型时会抛出错误。修复方法是在接口或函数本身中使用 `this` 参数来给出明确的类型：

```ts
Point.prototype.distanceFromOrigin = function (this: Point) {
  return this.getDistance({ x: 0, y: 0 });
};
```
