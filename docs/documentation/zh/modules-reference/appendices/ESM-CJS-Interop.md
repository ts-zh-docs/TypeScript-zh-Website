---
title: 模块——ESM/CJS 互操作性
short: ESM/CJS 互操作性
layout: docs
permalink: /zh/docs/handbook/modules/appendices/esm-cjs-interop.html
oneline: 对 ES 模块和 CommonJS 模块之间的互操作性进行详细介绍
---

现在是 2015 年，你正在开发一个转译器，该转译器能够将 ECMAScript 模块（ESM）转换为 CommonJS（CJS）模块。尽管目前尚无具体规范指导此功能的实现，但你可以依据现有的 ES 模块间交互规范、CommonJS 模块间交互知识，以及你自身的问题解决能力来进行开发。请考虑以下一个 ES 模块的导出示例：

```ts
export const A = {};
export const B = {};
export default "Hello, world!";
```

你该如何将其转换为 CommonJS 模块呢？回想一下，默认导出实际上只是具有特殊语法的命名导出，似乎只有一种选择：

```ts
exports.A = {};
exports.B = {};
exports.default = "Hello, world!";
```

这是一个很好的类比，借此你能够在导入侧实现类似的特性：

```ts
import hello, { A, B } from "./module";
console.log(hello, A, B);

// 转译为：

const module_1 = require("./module");
console.log(module_1.default, module_1.A, module_1.B);
```

到目前为止，CJS 中的每个东西都能在 ESM 中找到对应的存在。进一步扩展上述等式，我们还可以看到：

```ts
import * as mod from "./module";
console.log(mod.default, mod.A, mod.B);

// 转译为：

const mod = require("./module");
console.log(mod.default, mod.A, mod.B);
```

你可能会注意到，在这种方案中，无法编写一个导出函数、类或基本类型值的 ESM 导出：

```ts
// @Filename: exports-function.js
module.exports = function hello() {
  console.log("Hello, world!");
};
```

但是现有的 CommonJS 模块经常采用这种形式。我们的转译器处理的 ESM 导入如何访问这个模块呢？我们刚刚确认了命名空间导入（`import *`）会转译为普通的 `require` 调用，因此我们可以支持以下输入：

```ts
import * as hello from "./exports-function";
hello();

// 转译为：

const hello = require("./exports-function");
hello();
```

虽然我们的输出在运行时可以正常工作，但是我们有一个规范上的问题：根据 JavaScript 规范，命名空间导入始终解析为[*模块命名空间对象*](https://tc39.es/ecma262/#sec-module-namespace-objects)（一个对象，其成员是模块的导出）。在这种情况下，`require` 将返回函数 `hello`，但是 `import *` 永远无法返回函数。我们之前假设的对应关系似乎是无效的。

值得在这里退一步，弄清楚*目标*是什么。自从模块出现在 ES2015 规范中，支持将 ESM 转译为 CJS 的转译器很快就出现了。借此用户可以在运行时实现对新语法的支持之前就采用新语法。甚至有人认为，编写 ESM 代码是“面向未来”新项目的好方法。要做到这一点，就需要有一个无缝的迁移路径（从执行转译器的 CJS 输出迁移到运行时开发出对 ESM 输入的支持后直接执行 ESM 输入）。我们的目标是找到一种方法，可以将 ESM 降级为 CJS。同时，这种方法还应允许在未来的运行时中，用原始的 ESM 输入替换任何或所有这些转译输出，而不会在行为上产生任何可观察的变化。

通过遵循规范，转译器很容易找到一组转换操作，使其转译的 CommonJS 输出的语义与其 ESM 输入的指定语义相匹配（箭头表示导入关系）：

![一个包含两个相似流程的流程图，左边是 ESM，右边是 ESM 转换为 CJS。在 ESM 流程中：“导入模块”通过标有“指定行为”的箭头流向“被导入模块”。在 ESM 转换为 CJS 的流程中：“导入模块”通过标有“基于规范的设计”的箭头流向“被导入模块”。](../diagrams/esm-cjs-interop.md-1.svg)

然而，CommonJS 模块（以 CommonJS 编写，而非 ESM 转译为 CommonJS）在 Node.js 生态系统中已经得到了很好的建立，因此不可避免地会出现 ESM 转译为 CJS 的模块“导入” CommonJS 模块的情况。然而，ES2015 并未对这种互操作性的行为进行规定，而且在任何实际运行时中也不存在这种行为。

![一个并排显示的有三个区域的流程图。左侧是 ESM，中间是真正的 CJS，右侧是 ESM 转译为 CJS。左侧：ESM 的“导入模块”通过标有“指定行为”的箭头连接到 ESM 的“被导入模块”，并通过带有“未指定行为”的虚线箭头连接到真正的 CJS 的“被导入模块”。右侧：ESM 转译为 CJS 的“导入模块”通过标有“基于规范设计”的箭头连接到 ESM 转译为 CJS 的“被导入模块”，并通过带有“❓🤷‍♂️❓”的虚线箭头连接到真正的 CJS 的“被导入模块”](../diagrams/esm-cjs-interop.md-2.svg)

即使转译器的作者什么也不做，已有的语义在转译代码中的 `require` 调用和现有的 CJS 模块中定义的 `exports` 之间仍然会产生一种行为。为了让用户能够在运行时支持时从转译的 ESM 到真正的 ESM 无缝过渡，这种行为必须与运行时选择实现的行为相匹配。

对于运行时将支持的互操作性行为的猜测不仅限于 ESM 导入“真正的 CJS”模块。ESM 是否能够将从 CJS 转译而来的 ESM 与 CJS 区分开来，以及 CJS 是否能够 `require` ES 模块，这些也都未经规定。甚至 ESM 导入是否将使用与 CJS 的 `require` 调用相同的模块解析算法都是无法预知的。所有这些变数都必须准确地预测，以便转译器用户可以平滑迁移向 ESM。

## `allowSyntheticDefaultImports` 和 `esModuleInterop`

让我们回到我们之前提到的规范兼容性问题，其中 `import *` 被转译为 `require`：

```ts
// 根据规范是无效的：
import * as hello from "./exports-function";
hello();

// 但是转译是有效的：
const hello = require("./exports-function");
hello();
```

当 TypeScript 首次引入对 ES 模块的编写和转译支持时，为了解决这个问题，如果对一个模块进行任何命名空间导入（而该模块的 `exports` 不是命名空间对象），编译器会报错：

```ts
import * as hello from "./exports-function";
// TS2497              ^^^^^^^^^^^^^^^^^^^^
// 外部模块 '"./exports-function"' 解析为非模块实体，
// 不能使用此结构进行导入。
```

唯一的解决方法是让用户回到使用旧的 TypeScript 导入语法来表示 CommonJS 的 `require`：

```ts
import hello = require("./exports-function");
```

强制用户回到非 ESM 语法实质上是承认了“我们不知道或者不确定像 `"./exports-function"` 这样的 CJS 模块在将来是否可以通过 ESM 导入访问，但我们知道它*不能*通过 `import *` 来实现，尽管在我们使用的转译方案中它在运行时可以工作。”这并不符合允许该文件在不改动的情况下迁移到真正的 ESM 的目标，但是允许 `import *` 与函数建立链接的替代方案也不符合这个目标。这仍然是 TypeScript 今天的行为（当禁用 `allowSyntheticDefaultImports` 和 `esModuleInterop` 时）。

> 不幸的是，这是一个略微简化了的描述——TypeScript 并没有完全通过这个错误来避免规范兼容性问题，因为它允许函数的命名空间导入工作，并保留它们的调用签名，只要函数声明与命名空间声明合并，即使命名空间是空的。因此，尽管一个导出裸函数的模块被识别为“非模块实体”：
> ```ts
> declare function $(selector: string): any;
> export = $; // 不能 `import *` 这个模块 👍
> ```
> 但是一个应该毫无意义的更改却允许了无效的导入在类型检查时不报错：
> ```ts
> declare namespace $ {}
> declare function $(selector: string): any;
> export = $; // 允许 `import *` 这个模块并调用它 😱
> ```

与此同时，其他的转译器也在寻找解决相同问题的方法。思路大致如下：

1. 要导入一个导出函数或原始值的 CJS 模块，显然需要使用默认导入。命名空间导入是不合法的，在这里使用命名导入也没有意义。
2. 很可能，实现 ESM/CJS 互操作性的运行时将选择使 CJS 模块的默认导入*总是*直接链接到整个 `exports`，而不仅仅在 `exports` 是函数或基本类型值时才这样做。
3. 因此，真正的 CJS 模块的默认导入应该与 `require` 调用的行为相同。但是，我们需要一种区分真正的 CJS 模块和我们转译的 CJS 模块的方法，这样我们仍然可以将 `export default "hello"` 转译为 `exports.default = "hello"`，并且对该模块的默认导入链接到 `exports.default`。基本上，我们自己转译的模块的默认导入需要以某种方式工作（以模拟 ESM 到 ESM 导入），而对于其他任何现有 CJS 模块的默认导入，需要以另一种方式工作（以模拟我们认为的 ESM 到 CJS 导入将如何工作）。
4. 当我们将 ES 模块转译为 CJS 时，让我们在输出中添加一个特殊的额外字段：
   ```ts
   exports.A = {};
   exports.B = {};
   exports.default = "Hello, world!";
   // 额外的特殊标记！
   exports.__esModule = true;
   ```
   我们可以在转译默认导入时进行检查：
   ```ts
   // import hello from "./modue";
   const _mod = require("./module");
   const hello = _mod.__esModule ? _mod.default : _mod;
   ```

`__esModule` 标志首次出现在 Traceur 中，然后在 Babel、SystemJS 和 Webpack 中不久之后也加入了该标志。TypeScript 在 1.8 版本中添加了 `allowSyntheticDefaultImports` 选项，以便类型检查器能够直接将默认导入与任何缺少 `export default` 声明的模块类型的 `exports` 关联起来，而不是 `exports.default`。该标志不会修改导入或导出的生成方式，但它允许默认导入反映其他转换器对它们进行处理的方式。换句话说，它允许默认导入用于解析到“非模块实体”，而使用 `import *` 将会报错。

```ts
// 错误：
import * as hello from "./exports-function";

// 旧的解决方法：
import hello = require("./exports-function");

// 新的方法，使用`allowSyntheticDefaultImports`：
import hello from "./exports-function";
```

这通常足以让 Babel 和 Webpack 的用户编写在这些系统中已经工作的代码，而无需 TypeScript 抱怨，但这只是部分解决方案，仍然存在一些问题未解决：

1. Babel 和其他转译器根据目标模块是否存在 `__esModule` 属性来改变其默认导入行为，但是 `allowSyntheticDefaultImports` 只在目标模块的类型中找不到默认导出时启用*回退*行为。如果目标模块有 `__esModule` 标志，但是*没有*默认导出，这就造成了不一致性。转译器和打包工具仍然会将这样一个模块的默认导入链接到它的 `exports.default`，而这将是 `undefined`，在 TypeScript 中理想情况下应该是一个错误，因为如果无法链接真正的 ESM 导入，就会导致错误。但是使用 `allowSyntheticDefaultImports`，TypeScript 会认为这样一个导入的默认导入链接到整个 `exports` 对象，允许通过它的属性访问命名导出。
2. `allowSyntheticDefaultImports` 没有改变命名空间导入的类型，导致了一种奇怪的不一致性，即两者都可以使用，并且具有相同的类型：
   ```ts
   // @Filename: exportEqualsObject.d.ts
   declare const obj: object;
   export = obj;

   // @Filename: main.ts
   import objDefault from "./exportEqualsObject";
   import * as objNamespace from "./exportEqualsObject";

   // 这在运行时应该是 true，但是 TypeScript 报错了：
   objNamespace.default === objDefault;
   //           ^^^^^^^ 类型‘typeof import("./exportEqualsObject")’的属性‘default’不存在。
   ```
3. 最重要的是，`allowSyntheticDefaultImports` 没有改变 `tsc` 输出的 JavaScript。因此，尽管该标志在将代码输入到 Babel 或 Webpack 等工具中时可以确保更准确的检查，但对于那些使用 `tsc` 输出 `--module commonjs` 并在 Node.js 中运行的用户来说，它带来了真正的风险。如果他们在 `import *` 中遇到错误，启用 `allowSyntheticDefaultImports` 可能看起来可以解决问题，但实际上只是掩盖了编译时的错误，而生成的代码将在 Node 中崩溃。

TypeScript 在 2.7 中引入了 `esModuleInterop` 标志，它对导入的类型检查进行了改进，以解决 TypeScript 分析和现有转译器及打包工具中使用的互操作行为之间的剩余不一致性，并且关键地采用了与转译器多年前采用的基于 `__esModule` 条件的 CommonJS 输出方式。（为 `import *` 引入的另一个新的发出助手确保结果始终是一个对象，并且去除了调用签名，完全解决了前面提到的“解析为非模块实体”的错误没有完全避免的规范兼容性问题。）最后，启用新的标志后，TypeScript 的类型检查、输出和其他转译及打包工具之间达成了一致，采用了符合规范的 CJS/ESM 互操作方案，并且也许可以被 Node 采纳。

## Node.js 中的互操作性

Node.js 在 v12 版本中无需标记即可支持 ES 模块。与打包工具和转译器几年前开始做的一样，Node.js 为 CommonJS 模块的 exports 对象提供了一个“合成默认导出”，使得我们可以通过从 ESM 进行默认导入来访问整个模块内容。

```ts
// @Filename: export.cjs
module.exports = { hello: "world" };

// @Filename: import.mjs
import greeting from "./export.cjs";
greeting.hello; // "world"
```

无缝迁移！不幸的是，相似之处在很大程度上只有这么多。

### 没有 `__esModule` 检测（“双重默认导出”问题）

Node.js 无法识别 `__esModule` 标志以改变其默认导入行为。因此，当一个具有“默认导出”的经过转译的模块，被另一个经过转译的模块“导入”时，它的行为方式与在 Node.js 中由真正的 ES 模块导入的行为方式不同：

```ts
// @Filename: node_modules/dependency/index.js
exports.__esModule = true;
exports.default = function doSomething() { /*...*/ }

// @Filename: transpile-vs-run-directly.{js/mjs}
import doSomething from "dependency";
// 经过转译后可以工作，但在 Node.js ESM 中不是一个函数：
doSomething();
// 经过转译后不存在，但可以在 Node.js ESM 中工作：
doSomething.default();
```

虽然经过转译的默认导入仅在目标模块缺少 `__esModule` 标志时才生成合成的默认导出，但是 Node.js *始终*会合成默认导出，在转译的模块上创建了“双重默认导出”。

### 不可靠的命名导出

除了将 CommonJS 模块的 `exports` 对象作为默认导入进行使用外，Node.js 还尝试查找 `exports` 的属性，以作为命名导入进行使用。这种行为在与打包工具和转译器一起使用时是匹配的；然而，Node.js 会在任何代码执行之前使用[语法分析](https://github.com/nodejs/cjs-module-lexer)来合成命名导出，而转译后的模块在运行时解析它们的命名导入。其结果是，在转译模块中有效的 CJS 模块中的导入在 Node.js 中可能不起作用。

```ts
// @Filename: named-exports.cjs
exports.hello = "world";
exports["worl" + "d"] = "hello";

// @Filename: transpile-vs-run-directly.{js/mjs}
import { hello, world } from "./named-exports.cjs";
// 在 Node.js 中，`hello` 可以工作，但是 `world` 会丢失 💥

import mod from "./named-exports.cjs";
mod.world;
// 从默认导出中访问属性始终可以正常工作 ✅
```

### 无法 `require` 真正的 ES 模块

真正的 CommonJS 模块可以 `require` 一个经过 ESM 转译为 CJS 的模块，因为它们在运行时都是 CommonJS。但是在 Node.js 中，如果 `require` 解析到一个 ES 模块，它就会崩溃。这意味着发布的库无法从转译后的模块迁移到真正的 ESM，否则将破坏其 CommonJS（真正的或转译后的）使用者：

```ts
// @Filename: node_modules/dependency/index.js
export function doSomething() { /* ... */ }

// @Filename: dependent.js
import { doSomething } from "dependency";
// ✅ 如果 dependent 和 dependency 都是转译后的模块，那么可以正常工作
// ✅ 如果 dependent 和 dependency 都是真正的 ESM，那么可以正常工作
// ✅ 如果 dependent 是真正的 ESM，而 dependency 是转译后的模块，那么可以正常工作
// 💥 如果 dependent 是转译后的模块，而 dependency 是真正的 ESM，那么会崩溃
```

### 不同的模块解析算法

Node.js 引入了一种新的模块解析算法，用于解析 ESM 导入，该算法与解析 `require` 调用的长期算法有很大的差异。虽然与 CJS 和 ES 模块之间的互操作性没有直接关系，但这种差异是从转译后的模块无缝迁移到真正的 ESM 可能无法实现的又一个原因：

```ts
// @Filename: add.js
export function add(a, b) {
  return a + b;
}

// @Filename: math.js
export * from "./add";
//            ^^^^^^^
// 在转译为 CJS 时可以工作，
// 但在 Node.js ESM 中必须改为 "./add.js"
```

## 结论

显然，在 Node.js 中无法实现从转译后的模块到 ESM 的无缝迁移。这给我们带来了什么结果？

### 设置正确的 `module` 编译选项至关重要

由于不同的 host 环境之间的互操作规则不同，除非 TypeScript 理解每个文件表示的模块类型及应用于它们的规则，否则它无法提供正确的检查行为。这就是 `module` 编译选项的目的。（特别是，用于在 Node.js 中运行的代码受到比在打包工具中处理的代码更严格的规则限制。除非将 `module` 设置为 `node16` 或 `nodenext`，否则编译器的输出不会被检查是否与 Node.js 兼容。）

### 在带有 CommonJS 代码的应用中，应始终启用 `esModuleInterop`

在 TypeScript 的*应用程序*（与可能由他人使用的库相对）中，使用 `tsc` 输出 JavaScript 文件时，启用或禁用 `esModuleInterop` 并不会产生重大后果。你编写某些类型模块的导入方式将发生变化，但 TypeScript 的检查和生成是同步的，因此无错误的代码应该可以在任何模式下安全运行。在这种情况下，禁用 `esModuleInterop` 的缺点是它允许你编写违反 ECMAScript 规范的语义的 JavaScript 代码，这会混淆对命名空间导入的直觉，并使将来迁移到运行 ES 模块变得更加困难。

另一方面，在由第三方转译器或打包工具处理的应用程序中，启用 `esModuleInterop` 更为重要。所有主要的打包工具和转译器都使用类似于 `esModuleInterop` 的输出策略，因此 TypeScript 需要调整其检查以匹配此策略。（编译器始终推理出 `tsc` 输出的 JavaScript 文件中会发生的情况，因此即使在使用 `tsc` 之外的其他工具替代 `tsc`，仍应将影响发出的编译选项设置为尽可能与该工具的输出保持一致。）

应避免在没有启用 `esModuleInterop` 的情况下使用 `allowSyntheticDefaultImports`。它会更改编译器的检查行为，而不会更改 `tsc` 输出的代码，从而可能导致输出潜在不安全的 JavaScript 代码。此外，它引入的检查更改是 `esModuleInterop` 引入的检查更改的不完整版本。即使不使用 `tsc` 进行输出，启用 `esModuleInterop` 而不是 `allowSyntheticDefaultImports` 也更好。

有些人反对在启用 `esModuleInterop` 时在 `tsc` 的 JavaScript 输出中包含 `__importDefault` 和 `__importStar` 辅助函数，这要么是因为它在磁盘上略微增加了输出大小，要么是因为这些辅助函数使用的互操作算法似乎通过检查 `__esModule` 来错误地表示了 Node.js 的互操作行为，从而导致了前面讨论的问题。这些反对意见可以在不接受禁用 `esModuleInterop` 时出现的错误检查行为的情况下，至少部分地得到解决。首先，可以使用 `importHelpers` 编译选项从 `tslib` 导入辅助函数，而不是将它们内联到每个需要它们的文件中。为了讨论第二个反对意见，让我们看一个最后的例子：

```ts
// @Filename: node_modules/transpiled-dependency/index.js
exports.__esModule = true;
exports.default = function doSomething() { /* ... */ };
exports.something = "something";

// @Filename: node_modules/true-cjs-dependency/index.js
module.exports = function doSomethingElse() { /* ... */ };

// @Filename: src/sayHello.ts
export default function sayHello() { /* ... */ }
export const hello = "hello";

// @Filename: src/main.ts
import doSomething from "transpiled-dependency";
import doSomethingElse from "true-cjs-dependency";
import sayHello from "./sayHello.js";
```

假设我们将 `src` 编译为 CommonJS 以在 Node.js 中使用。如果没有使用 `allowSyntheticDefaultImports` 或 `esModuleInterop`，则从 `"true-cjs-dependency"` 导入的 `doSomethingElse` 将会报错，而其他导入则不会。为了修复此错误而不更改任何编译选项，你可以将导入更改为 `import doSomethingElse = require("true-cjs-dependency")`。然而，根据模块的类型定义方式（未显示），你还可以编写和调用命名空间导入，这将违反语言级别的规范。通过使用 `esModuleInterop`，所有所示的导入都不会报错（且可调用），但是无效的命名空间导入将会被捕获。

如果我们决定将 `src` 迁移到 Node.js 的真正 ESM（例如，在根目录的 package.json 中添加 `"type": "module"`），会发生什么变化？第一个导入 `doSomething` 来自 `"transpiled-dependency"` 将不再可调用-它呈现出“双重默认”问题，我们必须调用 `doSomething.default()` 而不是 `doSomething()`。（TypeScript 在 `--module node16` 和 `nodenext` 下可以理解并捕获此问题。）但值得注意的是，第二个导入 `doSomethingElse` 在编译为真正的 ESM 时需要 `esModuleInterop` 才能正常工作。

如果有什么要抱怨的，那不是 `esModuleInterop` 对第二个导入的处理方式。它所做的更改，既允许默认导入又阻止可调用的命名空间导入，完全符合 Node.js 的真正 ESM/CJS 互操作策略，并且使迁移到真正 ESM 变得更加容易。如果存在问题，那么问题似乎是 `esModuleInterop` 似乎无法为第一个导入提供无缝迁移路径。但是启用 `esModuleInterop` 并不会引入此问题；第一个导入完全不受其影响。不幸的是，这个问题无法解决，而不会破坏 `main.ts` 和 `sayHello.ts` 之间的语义契约，因为 `sayHello.ts` 的 CommonJS 输出在结构上与 `transpiled-dependency/index.js` 完全相同。如果 `esModuleInterop` 改变了转译后的 `doSomething` 导入的工作方式，使其与在 Node.js ESM 中的工作方式完全相同，那么它也会以同样的方式改变 `sayHello` 导入的行为，使输入代码违反 ESM 语义（因此仍然阻止 `src` 目录在不进行更改的情况下迁移到 ESM）。

正如我们所看到的，从转译模块到真正的 ESM 之间并没有无缝的迁移路径。但是 `esModuleInterop` 是朝正确方向迈出的一步。对于那些仍然希望尽量减少模块语法转换和包含导入辅助函数的人来说，启用 `verbatimModuleSyntax` 比禁用 `esModuleInterop` 更好。`verbatimModuleSyntax` 强制在发出 CommonJS 文件时使用 `import mod = require("mod")` 和 `export = ns` 语法，避免了我们讨论过的所有导入模糊性问题，但牺牲了迁移到真正 ESM 的便利性。

### 库代码需要特别考虑

（发布声明文件的）库应特别注意确保他们编写的类型在广泛的编译选项下没有错误。例如，可以编写一个扩展另一个接口的接口，该接口只在禁用 `strictNullChecks` 时编译成功。如果一个库发布了这样的类型，它会强制所有用户也禁用 `strictNullChecks`。`esModuleInterop` 可以允许类型声明包含类似的“传染性”默认导入：

```ts
// @Filename: /node_modules/dependency/index.d.ts
import express from "express";
declare function doSomething(req: express.Request): any;
export = doSomething;
```

假设*只有*启用 `esModuleInterop` 才能正常工作并且在没有该选项的用户引用该文件时会导致错误。用户应该无论如何启用 `esModuleInterop`，但通常认为库使其配置具有传染性是不好的做法。库最好发布类似以下的声明文件：

```ts
import express = require("express");
// ...
```

像这样的示例包含了传统智慧，即库*不*应启用 `esModuleInterop`。这个建议是一个合理的起点，但我们已经看过了一些示例，其中命名空间导入的类型在启用 `esModuleInterop` 时发生变化，可能会引入错误。因此，无论库是使用还是不使用 `esModuleInterop` 进行编译，它们都有可能编写出使其选择具有传染性的语法。

希望超越最大兼容性的库作者应该根据一系列编译选项来验证其声明文件。但是，使用 `verbatimModuleSyntax` 完全规避了 `esModuleInterop` 的问题，因为它强制 CommonJS 发布文件使用 CommonJS 风格的导入和导出语法。此外，由于 `esModuleInterop` 只影响 CommonJS，随着越来越多的库随着时间的推移转向仅发布 ESM，这个问题的相关性将会下降。

<!--

https://github.com/babel/babel/issues/493
https://github.com/babel/babel/issues/95
https://github.com/nodejs/node/pull/16675
https://github.com/nodejs/ecmascript-modules/pull/31
https://github.com/google/traceur-compiler/pull/785#issuecomment-35633727
https://github.com/microsoft/TypeScript/pull/2460
https://github.com/systemjs/systemjs/commit/3b3b03a4b8ffc0f71fab263ef9d5c70f0adc5339
https://github.com/microsoft/TypeScript/pull/5577
https://github.com/microsoft/TypeScript/pull/19675
https://github.com/microsoft/TypeScript/issues/16093
https://github.com/nodejs/modules/issues/139
https://github.com/microsoft/TypeScript/issues/54212

-->