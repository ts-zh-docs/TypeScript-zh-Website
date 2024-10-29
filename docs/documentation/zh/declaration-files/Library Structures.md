---
title: 库结构
layout: docs
permalink: /zh/docs/handbook/declaration-files/library-structures.html
oneline: 如何组织你的 d.ts 文件
---

总的来说，你的声明文件的*结构*取决于库的使用方式。在 JavaScript 中有许多种提供库的方式，你需要编写声明文件以匹配它。本指南涵盖了如何识别常见的库模式，以及如何编写与该模式相对应的声明文件。

每种主要库结构模式都在[模板](/zh/docs/handbook/declaration-files/templates.html)部分有对应的文件。你可以从这些模板开始，以帮助你更快地入门。

## 识别库的类型

首先，我们将回顾 TypeScript 声明文件可以表示的库的种类。我们将简要展示每种库的*使用*方式、*编写*方式，并列出一些来自现实世界的示例库。

识别库的结构是编写其声明文件的第一步。我们将提供关于如何基于其*使用方式*和*代码*来识别结构的提示。根据库的文档和组织方式，其中一种可能比另一种更容易。我们建议使用你更熟悉的那种方式。

### 你应该寻找什么？

在尝试为库编写类型时，请问自己以下问题。

1. 你如何获取这个库？

   例如，你*只能*通过 npm 获取它吗，还是只能从 CDN 获取？

2. 你如何导入它？

   它是否会添加全局对象？它是否使用 `require` 或 `import`/`export` 语句？

### 不同类型库的小样本

### 模块化库

几乎每个现代 Node.js 库都属于模块。这类库只能在带有模块加载器的 JS 环境下工作。例如，`express` 只能在 Node.js 中工作，并且必须使用 CommonJS 的 `require` 函数加载。

ECMAScript 2015（也称为 ES2015、ECMAScript 6 和 ES6）、CommonJS 和 RequireJS 都有类似的*导入模块*的概念。在 JavaScript CommonJS（Node.js）中，你需要这样写：

```js
var fs = require("fs");
```

在 TypeScript 或 ES6 中，`import` 关键字具有相同的作用：

```ts
import * as fs from "fs";
```

通常，你会在模块化库的文档中看到以下一行代码：

```js
var someLib = require("someLib");
```

或者

```js
define(..., ['someLib'], function(someLib) {

});
```

与全局模块一样，你也可能会在 [UMD](#umd) 模块的文档中看到这些示例，因此请务必检查代码或文档。

#### 从代码中识别模块化库

模块化库通常至少具有以下一些特征：

- 对 `require` 或 `define` 的无条件调用
- 声明，如 `import * as a from 'b';` 或 `export c;`
- 对 `exports` 或 `module.exports` 的赋值

它们很少具有：

- 对 `window` 或 `global` 属性的赋值

#### 模块的模板

有四种可用于模块的模板，[`module.d.ts`](/zh/docs/handbook/declaration-files/templates/module-d-ts.html)、[`module-class.d.ts`](/zh/docs/handbook/declaration-files/templates/module-class-d-ts.html)、[`module-function.d.ts`](/zh/docs/handbook/declaration-files/templates/module-function-d-ts.html) 和 [`module-plugin.d.ts`](/zh/docs/handbook/declaration-files/templates/module-plugin-d-ts.html)。

你应首先阅读 [`module.d.ts`](/zh/docs/handbook/declaration-files/templates/module-d-ts.html) 以大致了解它们的工作方式。

然后，如果你的模块可以像函数一样*调用*，请使用模板 [`module-function.d.ts`](/zh/docs/handbook/declaration-files/templates/module-function-d-ts.html):

```js
const x = require("foo");
// 注意：将‘x’当作函数调用
const y = x(42);
```

如果你的模块可以使用 `new` *构造*，请使用模板 [`module-class.d.ts`](/zh/docs/handbook/declaration-files/templates/module-class-d-ts.html):

```js
const x = require("bar");
// 注意：对导入的变量使用‘new’操作符
const y = new x("hello");
```

如果你有一个模块，其在导入时会对其他模块进行更改，请使用模板 [`module-plugin.d.ts`](/zh/docs/handbook/declaration-files/templates/module-plugin-d-ts.html):

```js
const jest = require("jest");
require("jest-matchers-files");
```

### 全局库

一个*全局*库是指可以从全局范围访问的库（即无需使用任何形式的 `import`）。许多库只是简单地暴露一个或多个全局变量供使用。例如，如果你正在使用 [jQuery](https://jquery.com/)，则可以通过简单地引用 `$` 变量来使用它：

```ts
$(() => {
  console.log("你好！");
});
```

通常，在全局库的文档中会看到如何在 HTML 脚本标签中使用库的指导：

```html
<script src="http://a.great.cdn.for/someLib.js"></script>
```

如今，大多数流行的全局访问库实际上是以 UMD 库的形式编写的（见下文）。UMD 库的文档很难与全局库的文档区分开来。在编写全局声明文件之前，请确保该库实际上不是 UMD。

#### 从代码中识别全局库

全局库的代码通常非常简单。一个全局的“Hello, world”库可能如下所示：

```js
function createGreeting(s) {
  return "Hello, " + s;
}
```

或者像这样：

```js
// Web
window.createGreeting = function (s) {
  return "Hello, " + s;
};

// Node
global.createGreeting = function (s) {
  return "Hello, " + s;
};

// 可能在任何运行时
globalThis.createGreeting = function (s) {
  return "Hello, " + s;
};
```

查看全局库的代码时，通常会看到：

- 顶级 `var` 声明或 `function` 声明
- 对 `window.someName` 进行一个或多个赋值
- 假定 DOM 基本元素如 `document` 或 `window` 存在

你*不会*看到：

- 对模块加载器如 `require` 或 `define` 的检查或使用
- CommonJS/Node.js 风格的导入形式，如 `var fs = require("fs");`
- 对 `define(...)` 的调用
- 描述如何 `require` 或导入库的文档

#### 全局库示例

由于通常很容易将全局库转换为 UMD 库，因此很少有流行的库仍然以全局样式编写。然而，那些体积小且需要 DOM（或*没有*依赖关系）的库可能仍然是全局的。

#### 全局库模板

模板文件 [`global.d.ts`](/zh/docs/handbook/declaration-files/templates/global-d-ts.html) 定义了示例库 `myLib`。请务必阅读[“避免名称冲突”脚注](#避免名称冲突)。

### *UMD*

UMD模块是一种*既*可以作为模块（通过导入），又可以作为全局变量（在没有模块加载器的环境中运行）的模块。许多流行的库，例如 [Moment.js](https://momentjs.com/)，都是以这种方式编写的。例如，在 Node.js 或使用 RequireJS 时，你会这样写：

```ts
import moment = require("moment");
console.log(moment.format());
```

而在纯浏览器环境中，你会这样写：

```js
console.log(moment.format());
```

识别 UMD 库

[UMD 模块](https://github.com/umdjs/umd)会检查模块加载器环境的存在。这是一个很容易识别的模式，看起来像这样：

```js
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["libName"], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory(require("libName"));
    } else {
        root.returnExports = factory(root.libName);
    }
}(this, function (b) {
```

如果你在库的代码中看到对 `typeof define`、`typeof window` 或 `typeof module` 的测试，尤其是在文件顶部，那几乎总是 UMD 库。

UMD 库的文档通常还会展示一个“在Node.js 中使用”的示例，显示 `require`，以及一个“在浏览器中使用”的示例，显示使用 `<script>` 标签加载脚本。

#### UMD库示例

现在，大多数流行的库都作为 UMD 包提供了。示例包括 [jQuery](https://jquery.com/)、[Moment.js](https://momentjs.com/) 以及 [lodash](https://lodash.com/)等等。

#### 模板

使用 [`module-plugin.d.ts`](/zh/docs/handbook/declaration-files/templates/module-plugin-d-ts.html) 模板。

## 消费依赖项

你的库可能有几种依赖关系。本节展示如何将它们导入到声明文件中。

### 依赖于全局库

如果你的库依赖于全局库，请使用 `/// <reference types="..." />` 指令：

```ts
/// <reference types="someLib" />

function getThing(): someLib.thing;
```

### 依赖于模块

如果你的库依赖于模块，请使用 `import` 语句：

```ts
import * as moment from "moment";

function getThing(): moment;
```

### 依赖于 UMD 库

#### 来自全局库

如果你的全局库依赖于一个 UMD 模块，请使用 `/// <reference types` 指令：

```ts
/// <reference types="moment" />

function getThing(): moment;
```

#### 来自模块或 UMD 库

如果你的模块或 UMD 库依赖于一个 UMD 库，请使用 `import` 语句：

```ts
import * as someLib from "someLib";
```

*不要*使用 `/// <reference` 指令来声明对 UMD 库的依赖！

## 脚注

### 避免名称冲突

请注意，在编写全局声明文件时，可能会在全局范围内定义许多类型。我们强烈反对这样做，因为当项目中有许多声明文件时，可能会导致无法解决的名称冲突。

遵循的一个简单规则是只声明由库定义的全局变量命名空间。例如，如果库定义了全局值‘cats’，你应该这样写

```ts
declare namespace cats {
  interface KittySettings {}
}
```

而不是

```ts
// 在顶层
interface CatsKittySettings {}
```

这些指导原则还确保了库可以过渡到 UMD 而不会破坏声明文件用户。

### ES6 对模块调用签名的影响

许多流行的库，比如 Express，在导入时会将自身暴露为可调用函数。例如，典型的 Express 用法如下：

```ts
import exp = require("express");
var app = exp();
```

在符合 ES6 的模块加载器中，顶级对象（这里作为 `exp` 导入）只能具有属性；顶级模块对象*永远*不能是可调用的。

在这里最常见的解决方案是为可调用/可构造对象定义一个 `default` 导出；模块加载器通常会自动检测到这种情况，并用 `default` 导出替换顶级对象。如果你在 tsconfig.json 中有 [`"esModuleInterop": true`](/zh/tsconfig/#esModuleInterop)，TypeScript 可以为你处理这个问题。
