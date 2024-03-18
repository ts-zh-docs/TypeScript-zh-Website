---
title: 模块——理论
short: 理论
layout: docs
permalink: /zh/docs/handbook/modules/theory.html
oneline: TypeScript 处理 JavaScript 模块的方式
translatable: true
---

## JavaScript 中的脚本和模块

早期的 JavaScript，当只能在浏览器中运行时，并没有模块的概念。但是我们仍然可以通过在 HTML 中使用多个 `script` 标签，将单个网页的 JavaScript 代码拆分成多个文件：

```html
<html>
  <head>
    <script src="a.js"></script>
    <script src="b.js"></script>
  </head>
  <body></body>
</html>
```

这种方法不够完美，对于庞大而复杂的网页来说尤其如此。尤其是，所有加载到同一个页面的脚本共享相同的作用域，被称为“全局作用域”。这意味着我们必须小心处理这些脚本，避免互相覆盖变量和函数。

任何系统，只要它可以通过为文件提供独立作用域的方式，并且仍然能够将代码片段提供给其他文件，都可以称为“模块系统”（module system）。（每个模块系统中的文件被称为“模块”，虽然这可能显而易见，但“模块”这个术语通常用于与在模块系统外、全局作用域中运行的*脚本*文件相对比。）

> [模块系统有许多种](https://github.com/myshov/history-of-javascript/tree/master/4_evolution_of_js_modularity)，[其中多种](https://www.typescriptlang.org/tsconfig/#module)为 TypeScript 所支持，但本文档将重点关注当今最重要的两个系统：ECMAScript 模块（ESM）和 CommonJS（CJS）。
>
> ECMAScript 模块（ESM）是语言内置的模块系统，在现代浏览器和 Node.js v12 以上版本中得到支持。它使用专用的 `import` 和 `export` 语法：
>
> ```js
> // a.js
> export default "Hello from a.js";
> ```
>
> ```js
> // b.js
> import a from "./a.js";
> console.log(a); // 'Hello from a.js'
> ```
>
> CommonJS（CJS）最初在 Node.js 中发布，在 ECMAScript 模块成为语言规范之前是语言规范的一部分。它仍然在 Node.js 中与 ESM 并存。它使用普通的 JavaScript 对象和函数 `exports` 以及 `require`：
>
> ```js
> // a.js
> exports.message = "Hello from a.js";
> ```
>
> ```js
> // b.js
> const a = require("./a");
> console.log(a.message); // 'Hello from a.js'
> ```

因此，当 TypeScript 检测到某个文件是 CommonJS 或 ECMAScript 模块时，它首先假设该文件有自己的作用域。除此之外，编译器的工作变得稍微复杂了一些。

## TypeScript 对模块的处理任务

TypeScript 编译器的主要目标是防止某些类型的运行时错误。此目标通过在编译时捕捉错误来完成。无论是否涉及模块，编译器都需要了解代码的预期运行环境（例如可用的全局变量）。当涉及到模块时，编译器还需要处理一些额外的问题，才能完成其工作。让我们以几行输入代码为例，思考在分析它的过程中所需的所有信息：

```ts
import sayHello from "greetings";
sayHello("world");
```

为了检查这个文件，编译器需要知道 `sayHello` 的类型（它是可以接受单个字符串为实参的函数吗？）。这就引出了一些额外的问题：

1. 模块系统会直接加载这个 TypeScript 文件，还是会加载由我（或其他编译器）从这个 TypeScript 文件生成的 JavaScript 文件？
2. 基于加载的文件名和其在磁盘上的位置，模块系统期望找到什么样的模块？
3. 如果输出 JavaScript，那么在输出代码中，这个文件的模块语法会如何转换？
4. 模块系统将在哪里查找由 `"greetings"` 指定的模块？查找是否成功？
5. 通过查找解析出来的文件是什么样的模块？
6. 模块系统是否允许在（2）中检测到的模块类型，使用（3）中决定的语法，来引用（5）中检测到的模块类型？
7. 分析完 `"greetings"` 模块后，该模块的哪一部分与 `sayHello` 绑定？

请注意，所有这些问题都取决于 _host_ 的特性。常见的 host 系统分为运行时（如 Node.js）和打包工具（如 Webpack）。host 系统负责运行或处理最终输出的 JavaScript（或原始的 TypeScript），并指导最终输出的代码的模块加载行为。

ECMAScript 规范定义了 ESM 的导入和导出如何链接在一起，但它并没有规定（4）中的文件查找，即*模块解析*是如何进行的，也没有提到其他模块系统（如 CommonJS）。因此，运行时和打包工具，尤其是那些希望支持 ESM 和 CJS 的工具，可以自由设计自己的规则。所以，TypeScript 对上述问题的回答，可能会因代码的运行环境不同而有很大的差异。并没有唯一的正确答案，所以我们必须通过配置选项告诉编译器规则。

另一个需要牢记的关键概念是，TypeScript 几乎总是从其*输出*的 JavaScript 文件的角度来考虑问题，而不是从*输入*它的 TypeScript（或 JavaScript！）文件的角度。如今，一些运行时和打包工具支持直接加载 TypeScript 文件。在这些情况下，将输入和输出文件区分开是没有意义的。本文档大部分内容讨论的是将 TypeScript 文件编译为 JavaScript 文件，然后由运行时模块系统加载编译成果的情况。研究这些情况可以帮助我们理解编译器的选项和行为——以此为起点，之后在思考 esbuild、Bun 和其他[以 TypeScript 为首的运行时和打包工具](#module-resolution-for-bundlers-typescript-runtimes-and-nodejs-loaders)时进行简化。因此，目前我们可以从输出文件的角度，总结 TypeScript 在模块方面的工作：

充分了解 **host 的规则**以

1. 编译文件为有效的**输出模块格式**，
2. 确保这些**输出文件**中的导入语句能够**成功解析**，以及
3. 知道要为**导入的名称**分配什么**类型**。

## host 是谁？

在我们继续之前，应当确保我们对术语 _host_ 有相同的理解，因为它会频繁出现。我们之前定义过它是“最终运行或处理输出代码，并指导输出代码的模块加载行为的系统”。换句话说，它是 TypeScript 之外的系统。TypeScript 的模块分析试图对 host 进行建模：

- 当输出代码（无论是由 `tsc` 还是第三方转译器生成）直接在像 Node.js 这样的运行时中运行时，host 就是该运行时。
- 当运行时直接运行/处理 TypeScript 文件，而没有输出代码时，host 仍然是运行时。
- 当打包工具运行/处理 TypeScript 输入或输出并生成捆绑包时，host 是打包工具，因为它查看了原始的导入（import）/引用（require）集合，查找了它们引用的文件，并生成了一个新的文件或一组文件。在新文件中，原始的导入和引用被删除或转换得面目全非。（该捆绑包本身可能包含模块，并且运行该捆绑包的运行时将成为它的 host，但是 TypeScript 对捆绑后发生的任何事情一无所知。）
- 如果另一个转译器、优化器或格式化工具处理 TypeScript 的输出，只要它不对其导入和导出语句进行更改，它就*不是* TypeScript 关心的 host。
- 在 Web 浏览器中加载模块时，TypeScript 需要建模的行为实际上是分散在 Web 服务器和在浏览器中运行的模块系统之间的。浏览器的 JavaScript 引擎（或基于脚本的模块加载框架，如 RequireJS）控制着接受哪些模块格式，而 Web 服务器则决定在一个模块触发请求加载另一个模块时发送哪个文件。
- TypeScript 编译器本身不是 host，因为除了试图模拟其他 host 的行为之外，它没有与模块相关的任何行为。

## 模块输出格式

在任何项目中，我们首先需要回答的关于模块的问题是，host 期望的模块类型是什么，这样 TypeScript 就可以设置每个文件的输出格式来匹配。有时，host 只会*支持*一种模块类型，例如在浏览器中支持 ESM，或者在 Node.js v11 及更早版本中支持 CJS。Node.js v12 及更高版本同时接受 CJS 和 ES 模块，但使用文件扩展名和 `package.json` 文件来确定每个文件应该是什么格式，并且如果文件内容与期望的格式不匹配，会抛出错误。

`module` 编译选项向编译器提供了这些信息。它的主要用途是控制在编译过程中生成的任何 JavaScript 的模块格式，但它还用于通知编译器如何检测每个文件的模块类型，不同的模块类型如何允许互相导入，以及是否可用 `import.meta` 和顶级 `await` 等特性。因此，即使 TypeScript 项目使用了 `noEmit`，选择正确的 `module` 设置仍然很重要。正如我们之前所确定的，编译器需要准确理解模块系统，以便可以对导入进行类型检查（并提供 IntelliSense）。请参阅[*选择编译选项*](/docs/handbook/modules/guides/choosing-compiler-options.html)，以获取有关为项目选择正确的 `module` 设置的指导。

可用的 `module` 设置有：

- [**`node16`**](/docs/handbook/modules/reference.html#node16-nodenext)：反映了 Node.js v16+ 的模块系统，支持 ES 模块和 CJS 模块并存，具有特定的互操作性和检测规则。
- [**`nodenext`**](/docs/handbook/modules/reference.html#node16-nodenext)：当前与 `node16` 相同，但将会不断更新，反映最新的 Node.js 版本，因为 Node.js 的模块系统不断发展。
- [**`es2015`**](/docs/handbook/modules/reference.html#es2015-es2020-es2022-esnext)：反映了 JavaScript 模块的 ES2015 语言规范（首次引入了 `import` 和 `export`）。
- [**`es2020`**](/docs/handbook/modules/reference.html#es2015-es2020-es2022-esnext)：在 `es2015` 的基础上，添加了对 `import.meta` 和 `export * as ns from "mod"` 的支持。
- [**`es2022`**](/docs/handbook/modules/reference.html#es2015-es2020-es2022-esnext)：在 `es2020` 的基础上，添加了对顶级 `await` 的支持。
- [**`esnext`**](/docs/handbook/modules/reference.html#es2015-es2020-es2022-esnext)：当前与 `es2022` 相同，但将会不断更新，反映最新的 ECMAScript 规范。预计 `esnext` 将包含即将发布的规范版本中，与模块相关的 Stage 3+ 提案。
- **[`commonjs`](/docs/handbook/modules/reference.html#commonjs)、[`system`](/docs/handbook/modules/reference.html#system)、[`amd`](/docs/handbook/modules/reference.html#amd) 和 [`umd`](/docs/handbook/modules/reference.html#umd)**：每个选项都会导致编译器以名称相同的模块系统形式，生成所有内容。使用这些选项时，编译器会假设所有内容都可以成功导入该模块系统。这些选项不再推荐用于新项目，并且本文档不会详细介绍它们。

> 由于 Node.js 的模块格式检测和互操作性规则，我们不能在运行于 Node.js 的项目中将 `module` 设置为 `esnext` 或 `commonjs`，即使所有由 `tsc` 生成的文件都是 ESM 或 CJS。对于打算在 Node.js 中运行的项目，唯一正确的 `module` 设置是 `node16` 和 `nodenext`。尽管在完全使用 ESM 的 Node.js 项目中，使用 `esnext` 和 `nodenext` 进行编译得到的 JavaScript 看起来可能是相同的，但类型检查可能会有所不同。有关更多详细信息，请参阅有关 `nodenext` 的[参考部分](/docs/handbook/modules/reference.html#node16-nodenext)。

### 模块格式检测

Node.js 同时支持 ES 模块和 CJS 模块，但每个文件的格式由其文件扩展名，和在文件目录及其所有父目录中，检索到的第一个 `package.json` 文件的 `type` 字段确定：

- `.mjs` 文件始终被解释为 ES 模块，`.cjs` 文件始终被解释为 CJS 模块。
- 如果最近的 `package.json` 文件包含值为 `"module"` 的 `type` 字段，则解释 `.js` 文件为 ES 模块。如果没有 `package.json` 文件，或者 `type` 字段缺失或具有其他值，则 `.js` 文件被解释为 CJS 模块。

如果在评估过程中，Node.js 根据这些规则，确定文件为 ES 模块，那么，不会将 CommonJS 的 `module` 和 `require` 对象注入到文件的作用域中，因此尝试使用它们的文件将崩溃。相反，如果 Node.js 确定文件为 CJS 模块，那么文件中的 `import` 和 `export` 声明将导致语法错误类型的崩溃。

当 `module` 编译选项设置为 `node16` 或 `nodenext` 时，TypeScript 将应用相同的算法，确定项目的*输入文件*对应的*输出文件*的模块类型。让我们看使用 `--module nodenext` 的示例项目中，模块格式如何检测的例子：

| 输入文件名                       | 内容                   | 输出文件名       | 模块类型 | 原因                                  |
| ------------------------------ | ---------------------- | ---------------- | --------- | ------------------------------------- |
| `/package.json`                | `{}`                   |                  |           |                                       |
| `/main.mts`                    |                        | `/main.mjs`      | ESM       | 文件扩展名                            |
| `/utils.cts`                   |                        | `/utils.cjs`     | CJS       | 文件扩展名                            |
| `/example.ts`                  |                        | `/example.js`    | CJS       | `package.json` 中没有 `"type": "module"` |
| `/node_modules/pkg/package.json` | `{ "type": "module" }` |                  |           |                                       |
| `/node_modules/pkg/index.d.ts` |                        |                  | ESM       | `package.json` 中有 `"type": "module"`    |
| `/node_modules/pkg/index.d.cts` |                        |                  | CJS       | 文件扩展名                            |

当输入文件扩展名为 `.mts` 或 `.cts` 时，TypeScript 知道将该文件视为 ES 模块或 CJS 模块，因为 Node.js 将会将输出的扩展名为 `.mjs` 的文件视为 ES 模块，或者将输出的扩展名为 `.cjs` 的文件视为 CJS 模块。当输入文件扩展名为 `.ts` 时，TypeScript 必须查找最近的 `package.json` 文件来确定模块格式，因为这是 Node.js 在遇到输出的 `.js` 文件时要执行的操作。（请注意，相同的规则适用于 `pkg` 依赖项中的 `.d.cts` 和 `.d.ts` 声明文件：尽管它们不会生成编译输出文件，但存在 `.d.ts` 文件意味着存在相应的 `.js` 文件——可能是库 `pkg` 的作者对他们自己的 `.ts` 输入文件运行 `tsc` 时创建的——由于其扩展名为 `.js` 并且 `/node_modules/pkg/package.json` 中存在 `"type": "module"` 字段，Node.js 必须将其解释为 ES 模块。关于声明文件的详细信息将在[后面的部分](#declaration-files)中介绍。）

检测到的输入文件模块格式由 TypeScript 使用，以确保在每个输出文件中生成的语法，符合 Node.js 期望。如果 TypeScript 生成带有 `import` 和 `export` 语句的 `/example.js` 文件，那么 Node.js 在解析该文件时将崩溃。如果 TypeScript 生成带有 `require` 调用的 `/main.mjs` 文件，Node.js 在评估过程中将崩溃。除了用于生成过程之外，模块格式还用于确定类型检查和模块解析的规则，我们将在后续的章节中讨论。

再次强调，TypeScript 在 `--module node16` 和 `--module nodenext` 选项下的行为完全受 Node.js 行为的影响。由于 TypeScript 的目标是在编译时捕捉潜在的运行时错误，它需要对运行时的行为有非常准确的模型。这个相当复杂的模块类型检测规则集，对于检查将在 Node.js 中运行的代码非常*必要*，但如果应用于非 Node.js host，可能过于严格或不正确。

### 输入模块语法

需要注意的是，在输入源文件中的*输入*模块语法，与生成到 JS 文件中的输出模块语法关系不大。也就是说，具有 ESM 导入的文件：

```ts
import { sayHello } from "greetings";
sayHello("world");
```

可能会以 ESM 格式完全原样生成，也可能生成为 CommonJS 格式：

```ts
Object.defineProperty(exports, "__esModule", { value: true });
const greetings_1 = require("greetings");
(0, greetings_1.sayHello)("world");
```

这取决于 `module` 编译选项（以及任何适用的[模块格式检测](#模块格式检测)规则，如果 `module` 选项支持多种模块类型）。这意味着，通常情况下，仅仅查看输入文件的内容，不足以确定它是一个 ES 模块还是 CJS 模块。

> 如今，无论输出格式是什么，大多数 TypeScript 文件都使用 ESM 语法（`import` 和 `export` 语句）进行编写。这在很大程度上归功于 ESM 长期发展，得到了广泛支持。ECMAScript 模块在 2015 年标准化，在 2017 年时大多数浏览器都已经支持它，而在 2019 年，它也出现在了 Node.js v12 中。在这个时间窗口的大部分时间里，显而易见 ESM 是 JavaScript 模块的未来，但很少有运行时能够支持它。像 Babel 这样的工具使得 JavaScript 可以使用 ESM 语法编写，并将其降级为在 Node.js 或浏览器中可用的模块格式。TypeScript 也效仿此举，添加了对 ES 模块语法的支持，并在 [1.5 版本发布](https://devblogs.microsoft.com/typescript/announcing-typescript-1-5/)时软性地不鼓励使用原始的基于 CommonJS 的 `import fs = require("fs")` 语法。
>
> 这种“使用 ESM 进行编写，输出任何格式”的策略的好处是，TypeScript 可以使用标准的 JavaScript 语法，使得新手编写时更容易上手，并且（理论上）使得项目在将来可以轻松地输出 ESM。然而，这种策略也有三个明显的不足，这些不足在 ESM 和 CJS 模块被允许共存，相互操作于 Node.js 中之后完全显现了出来：
>
> 1. 早期关于 ESM/CJS 在 Node.js 中如何相互操作的假设被证明是错误的，如今，Node.js 和打包工具之间的互操作规则存在差异。因此，TypeScript 模块的配置空间变得很大。
> 2. 当输入文件中的语法看起来全部像是 ESM 时，作者或代码审阅者很容易忘记某个文件在运行时是哪种模块。而且，由于 Node.js 的互操作规则，了解每个文件的模块类型变得非常重要。
> 3. 当输入文件使用 ESM 编写时，类型声明输出（`.d.ts` 文件）中的语法也看起来像是 ESM。但是，由于相应的 JavaScript 文件可能以任何模块格式发出，TypeScript 无法仅仅通过查看类型声明的内容来确定文件的模块类型。而且，由于 ESM/CJS 互操作的性质，TypeScript *必须*知道每个模块的模块类型，以提供正确的类型并防止导入错误导致的崩溃。
>
在 TypeScript 5.0 中，我们引入了一个名为 `verbatimModuleSyntax` 的新编译选项，以帮助 TypeScript 作者准确了解其 `import` 和 `export` 语句将如何生成。启用该标志后，该文件中的导入和导出必须以特殊形式编写，确保在生成之前经历最少转换。因此，如果我们想要某个文件以 ESM 形式生成，那么导入和导出必须使用 ESM 语法；如果我们想要某个文件以 CJS 形式发出，则必须使用基于 CommonJS 的 TypeScript 语法（`import fs = require("fs")` 和 `export = {}`）。这个设置特别适用于那些大多数文件使用 ESM，但仍有一些特定的文件使用 CJS 的 Node.js 项目。对于当前目标为 CJS，但将来可能需要目标为 ESM 的项目，不建议使用此设置。

### ESM 和 CJS 的互操作性

ES 模块能否 `import` CommonJS 模块？如果可以，那么默认导入会链接到 `exports` 还是 `exports.default`？CommonJS 模块能否 `require` ES 模块？由于 CommonJS 不是 ECMAScript 规范的一部分，因此即使 ESM 在 2015 年被标准化，运行时、打包工具和转译器也一直可以根据自己的需求来制定这些问题的答案，继而没有一套标准的互操作性规则存在。目前，运行时和打包工具主要分为以下三类：

1. **仅支持 ESM。** 某些运行时（比如浏览器引擎）只支持实际属于该语言的部分：ECMAScript 模块。
2. **打包工具及相似工具。** 在以前主流的 JavaScript 引擎还不能运行 ES 模块的时候，开发人员可以使用 Babel，将 ES 模块转译为 CommonJS。这样，开发人员就可以很方便地编写使用 ES 模块。这些由 ESM 转译后得到的 CJS 文件与手写的 CJS 文件之间的交互，基于一组宽松的互操作性规则，这些规则对于打包工具和转译器而言已是事实上的标准。
3. **Node.js。** 在 Node.js 中，CommonJS 模块不能同步加载 ES 模块（使用`require`），它们只能使用动态的 `import()` 调用来异步加载。ES 模块可以默认导入 CJS 模块，后者总是绑定到 `exports`。（这意味着类似于 Babel 的 CJS 输出的默认导入行为（使用 `__esModule`）在 Node.js 和一些打包工具之间有所不同。）

TypeScript 需要假设适当的规则集，以便为（特别是 `default`）导入提供正确的类型，并在遇到那些会在运行时崩溃的导入时报错。当将 `module` 编译选项设置为 `node16` 或 `nodenext` 时，将强制执行 Node.js 的规则。所有其他 `module` 设置，结合 [`esModuleInterop`](/docs/handbook/modules/reference.html#esModuleInterop) 选项，在 TypeScript 中会产生类似打包工具的互操作性。（虽然使用 `--module esnext` 会阻止你*编写* CommonJS 模块，但它不会阻止你将其作为依赖项*导入*。目前没有适用于直接面向浏览器代码的 TypeScript 设置可以防止 ES 模块导入 CommonJS 模块。）

### 模块标识符不会转换

虽然 `module` 编译选项可以在输出文件时将输入文件中的导入和导出转换为不同模块格式，但模块*规范符号*（你 `import` 或传递给 `require` 的字符串）始终按原样输出。例如，如下的输入：

```ts
import { add } from "./math.mjs";
add(1, 2);
```

可能会被编译为以下两种形式：

```ts
import { add } from "./math.mjs";
add(1, 2);
```

或者：

```ts
const math_1 = require("./math.mjs");
math_1.add(1, 2);
```

这取决于 `module` 编译选项，但模块标识符始终是 `"./math.mjs"`。没有编译选项可以启用转换、替换或重写模块标识符。因此，模块标识符必须以适用于代码目标运行时或打包工具的方式编写，而 TypeScript 的工作是理解这些与*输出*相关的规范符号。找到与模块标识符引用的文件相关的过程称为*模块解析*。

## 模块解析

让我们回到我们的[第一个示例](#TypeScript 对模块的处理任务)，并回顾一下到目前为止我们所学到的知识：

```ts
import sayHello from "greetings";
sayHello("world");
```

到目前为止，我们已经讨论了主机的模块系统和 TypeScript 的 `module` 编译选项如何影响这段代码。我们知道尽管输入语法看起来像 ESM，但输出格式取决于 `module` 编译选项，可能还取决于文件扩展名和 `package.json` 的 `"type"` 字段。我们还知道 `sayHello` 绑定到什么，甚至是否允许导入可能取决于该文件和目标文件的模块类型。但我们还没有讨论如何*找到*目标文件。

### 模块解析由 host 定义

虽然 ECMAScript 规范定义了如何解析 `import` 和 `export` 语句，但将模块解析留给了 host。如果你创建了一个新的 JavaScript 运行时，你可以自由地创造模块解析方案，例如：

```ts
import monkey from "🐒"; // 寻找 './eats/bananas.js'
import cow from "🐄";    // 寻找 './eats/grass.js'
import lion from "🦁";   // 寻找 './eats/you.js'
```

并且仍然声称实现了“符合标准的 ESM”。不用说，TypeScript 没有办法在不知道运行时的模块解析算法的情况下确定要为 `monkey`、`cow` 和 `lion` 分配什么类型。就像 `module` 向编译器提供 host 期望的模块格式的信息一样，`moduleResolution` 以及一些自定义选项指定了 host 用于将模块标识符解析为文件的算法。这也解释了为什么 TypeScript 在输出时不会修改导入标识符：导入标识符与磁盘上的文件（如果存在）之间的关系（如果有）是由 host 定义的，并且 TypeScript 不是 host。

可用的 `moduleResolution` 选项有：

- [**`classic`**](/docs/handbook/modules/reference.html#classic)：TypeScript 最古老的模块解析模式，不幸的是除了 `commonjs`、`node16` 以及 `nodenext` 之外的任何 `module` 设置都会默认使用它。制作它的目的可能是为各种 [RequireJS](https://requirejs.org/docs/api.html#packages) 配置尽力提供解析方案。它不应该用于新项目（甚至不使用 RequireJS 或其他 AMD 模块加载器的旧项目）。开发团队计划在 TypeScript 6.0 中停用它。
- [**`node10`**](/docs/handbook/modules/reference.html#node10-formerly-known-as-node)：以前称为 `node`，很遗憾，这是 `module` 设置为 `commonjs` 时的默认值。它相当好地模拟了 Node.js v12 之前的版本，并且有时近似大多数打包工具的模块解析方式。它支持从 `node_modules` 中查找包，加载目录中的 `index.js` 文件，并省略相对模块标识符中的 `.js` 扩展名。然而，由于 Node.js v12 引入的 ES 模块解析规则有所不同，所以对于现代版本的 Node.js 来说，它是一个非常糟糕的模型。它不应该用于新项目。
- [**`node16`**](/docs/handbook/modules/reference.html#node16-nodenext-1)：这是与 `--module node16` 相对应的模式，并且在使用该 `module` 设置时，它是默认设置。Node.js v12 及更高版本同时支持 ESM 和 CJS 模块，每种模块都使用自己的模块解析算法。在 Node.js 中，import 语句和动态 `import()` 调用中的模块标识符不允许省略文件扩展名或 `/index.js` 后缀，而 `require` 调用中的模块标识符允许省略。此模块解析模式在必要时理解并强制执行此限制，是否必要由 `--module node16` 引入的[模块格式检测规则](#模块格式检测)确定（对于 `node16` 和 `nodenext`，`module` 和 `moduleResolution` 是相辅相成的：将其中一个设置为 `node16` 或 `nodenext`，同时将另一个设置为其他值将产生预期之外的行为，并且将来可能会出错）。
- [**`nodenext`**](/docs/handbook/modules/reference.html#node16-nodenext-1)：目前与 `node16` 相同，这是与 `--module nodenext` 相对应的模式，并且在使用该 `module` 设置时是默认设置。它旨在成为一个前瞻性的模式，将支持最新的 Node.js 模块解析特性。
- [**`bundler`**](/docs/handbook/modules/reference.html#bundler)：Node.js v12 引入了一些新的模块解析特性，这些特性用于导入 npm 包（`package.json` 的 `"exports"` 和 `"imports"` 字段），并且许多打包工具采用了这些特性，但没有采用 ESM 导入的更严格规则。此模块解析模式为针对打包工具的代码提供了基本算法。它默认支持 `package.json` 的 `"exports"` 和 `"imports"`，但可以配置为忽略它们。我们需要将 `module` 设置为 `esnext` 才能使用它。

### TypeScript 模拟 host 的模块解析，但包含类型信息

还记得 TypeScript 关于模块的[工作](#关于模块的 TypeScript 工作)的三个部分吗？

1. 将文件编译为有效的**输出模块格式**
2. 确保这些**输出文件**中的导入将会**成功解析**
3. 知道要为**导入的名称**分配什么**类型**

要实现后两个，我们需要进行模块解析。但是如果我们大部分时间都在处理输入文件，就很容易忽略第二个部分——模块解析的关键部分是验证输出文件中的导入语句或 `require` 调用（包含[模块标识符](#模块标识符不会被转换)，这些模块标识符与输入文件中的相同）是否在运行时可以正常工作。让我们看某个包含多个文件的新例子：

```ts
// @Filename: math.ts
export function add(a: number, b: number) {
  return a + b;
}

// @Filename: main.ts
import { add } from "./math";
add(1, 2);
```

当我们看到来自 `"./math"` 的导入时，可能会想：“这是一个 TypeScript 文件引用另一个 TypeScript 的方式。编译器遵循这个（没有扩展名的）路径，以便为 `add` 分配一个类型。”

<img src="./diagrams/theory.md-1.svg" width="400" alt="一个简单的流程图，一个文件（矩形节点）main.ts 将模块标识符 './math' 解析（标记的箭头）到另一个文件 math.ts。" />

这并不完全错误，但实际情况更加深入。`"./math"` 的解析（以及随后的 `add` 的类型）需要反映出*输出*文件在运行时发生的实际情况。更全面的思考这个过程的方式如下所示：

![一个流程图，有两组文件：输入文件和输出文件。main.ts（一个输入文件）映射到输出文件 main.js，它通过模块标识符 "./math" 解析到 math.js（另一个输出文件），然后映射回输入文件 math.ts。](./diagrams/theory.md-2.svg)

这个模型清楚地表明，对于 TypeScript 来说，模块解析主要是准确地模拟 host 在输出文件之间的模块解析算法，同时还应用了一些重新映射以查找类型信息。让我们再来看一个例子，从简单模型的角度看，这个例子似乎并不直观，但从稳健模型的角度看，这个例子却非常合理：

```ts
// @moduleResolution: node16
// @rootDir: src
// @outDir: dist

// @Filename: src/math.mts
export function add(a: number, b: number) {
  return a + b;
}

// @Filename: src/main.mts
import { add } from "./math.mjs";
add(1, 2);
```

Node.js ESM `import` 声明使用的模块解析算法很严格，要求相对路径包含文件扩展名。当我们只考虑输入文件时，`"./math.mjs"` 解析为 `math.mts` 看起来有点奇怪。由于我们使用了 `outDir` 将编译输出放在另一个目录中，`math.mjs` 甚至不存在于 `main.mts` 的旁边！为什么这个解析会成功呢？使用我们的新心智模型，这没有问题：

![一个流程图，结构与上面的图相同。有两组文件：输入文件和输出文件。src/main.mts（一个输入文件）映射到输出文件 dist/main.mjs，它通过模块标识符“./math.mjs”解析到 dist/math.mjs（另一个输出文件），然后映射回输入文件 src/math.mts。](./diagrams/theory.md-3.svg)

即使理解了这个心智模型，你也可能不会立即消除在输入文件中看到输出文件扩展名时的奇怪感觉，以及很自然地使用快捷方式思考：*"`"./math.mjs"` 引用了输入文件 `math.mts`。我必须写出输出文件的扩展名，但编译器知道我写 `.mjs` 时要查找 `.mts`。*这种快捷方式甚至是编译器内部的工作方式，但更全面的心智模型解释了*为什么* TypeScript 的模块解析以这种方式工作：假设输出文件中的模块标识符将与输入文件中的[相同](#模块标识符不会转换)，这是唯一能实现验证输出文件以及分配类型这两个目标的过程。

### 声明文件的作用

在前面的例子中，我们了解了模块解析中的“重新映射”部分是如何在输入和输出文件之间起作用的。但是当我们导入库代码时会发生什么呢？即使该库是用 TypeScript 编写的，它可能没有发布其源代码。如果我们不能依赖将库的 JavaScript 文件映射回一个 TypeScript 文件，我们虽仍然可以在运行时验证我们的导入是否正确，但是如何实现我们的第二个目标，即为其分配类型呢？

这就是声明文件（`.d.ts`、`.d.mts` 等）的作用。理解声明文件的解析方式最好的方法是了解它们的来源。当你在对输入文件运行 `tsc --declaration` 时，你会得到一个输出的 JavaScript 文件和一个输出的声明文件：

<img src="./diagrams/declaration-files.svg" width="400" style="background-color: white; border-radius: 8px;" alt="一个图表，显示不同文件类型之间的关系。一个 .ts 文件（顶部）有两个标有‘generates’的箭头分别指向一个 .js 文件（左下角）和一个 .d.ts 文件（右下角）。另外一个标有‘implies’的箭头从 .d.ts 文件指向 .js 文件。" />

由于这种关系，编译器*假设*只要它看到一个声明文件，就会有一个对应的 JavaScript 文件，该文件与声明文件中的类型信息完全一致。出于性能原因，在每种模块解析模式下，编译器总是首先查找 TypeScript 和声明文件，如果找到了其中一个，就不会继续寻找相应的 JavaScript 文件。如果找到了一个 TypeScript 输入文件，它知道在编译之后*会*存在一个 JavaScript 文件；如果找到了一个声明文件，它知道在编译时（也许是其他人的编译）已经创建了一个 JavaScript 文件，与声明文件同时存在。

声明文件不仅告诉编译器存在一个 JavaScript 文件，还告诉它文件的名称和扩展名：

| 声明文件扩展名 | JavaScript 文件扩展名 | TypeScript 文件扩展名 |
| -------------- | --------------------- | --------------------- |
| `.d.ts`        | `.js`                 | `.ts`                 |
| `.d.ts`        | `.js`                 | `.tsx`                |
| `.d.mts`       | `.mjs`                | `.mts`                |
| `.d.cts`       | `.cjs`                | `.cts`                |
| `.d.*.ts`      | `.*`                  |                       |

最后一行表示非 JS 文件可以通过 `allowArbitraryExtensions` 编译器选项进行类型标注，以支持某些模块系统支持将非 JS 文件作为 JavaScript 对象导入的情况。例如，名为 `styles.css` 的文件可以由名为 `styles.d.css.ts` 的声明文件表示。

> “但是等等！还有很多声明文件是手动编写的，*而不是*由 `tsc` 生成的。听说过 DefinitelyTyped 吗？”你可能会问道。确实如此，手动编写声明文件，甚至移动/复制/重命名它们以表示外部构建工具的输出，是一项危险且容易出错的任务。DefinitelyTyped 的贡献者和未使用 `tsc` 生成 JavaScript 和声明文件的类型库的作者应确保每个 JavaScript 文件都有一个同名且扩展名匹配的兄弟声明文件。偏离这种结构可能会导致最终用户出现错误的 TypeScript 错误。npm 包 [`@arethetypeswrong/cli`](https://www.npmjs.com/package/@arethetypeswrong/cli) 可以帮助在发布之前捕获并解释这些错误。

### 模块解析器用于打包工具、TypeScript 运行时和 Node.js 加载器

到目前为止，我们认真强调了*输入文件*和*输出文件*的区别。回想一下，当在相对模块标识符上指定文件扩展名时，TypeScript通常会[要求你使用*输出*文件扩展名](#typescript-imitates-the-hosts-module-resolution-but-with-types):

```ts
// @Filename: src/math.ts
export function add(a: number, b: number) {
  return a + b;
}

// @Filename: src/main.ts
import { add } from "./math.ts";
//                  ^^^^^^^^^^^
// 当‘allowImportingTsExtensions’被启用时，导入路径只能以‘.ts’扩展名结尾。
```

由于 TypeScript 不会将扩展名重写为 `.js`，如果 `"./math.ts"` 出现在输出的 JS 文件中，该导入在运行时将无法解析为另一个 JS 文件。TypeScript 希望防止生成不安全的 JS 输出文件。但是，如果没有输出 JS 文件呢？如果你处于以下情况之一：

- 你正在打包此代码，打包工具配置为在内存中转译 TypeScript 文件，并且最终将消耗和删除你编写的所有导入以生成一个捆绑包。
- 你直接在 TypeScript 运行时（如 Deno 或 Bun）中运行此代码。
- 你在 Node.js 中使用 `ts-node`、`tsx` 或其他转译加载器。

在这些情况下，你可以打开 `noEmit`（或 `emitDeclarationOnly`）和 `allowImportingTsExtensions`，以禁用生成不安全的 JavaScript 文件并消除 `.ts` 扩展名导入时的错误。

无论是否启用 `allowImportingTsExtensions`，对模块解析 host 来说，选择最合适的 `moduleResolution` 设置仍然非常重要。对于打包工具和 Bun 运行时，它是 `bundler`。这些模块解析器受到 Node.js 的启发，但没有采用 Node.js 应用于导入的严格 ESM 解析算法（该算法禁用了[扩展名搜索](extension-searching-and-directory-index-files)）。`bundler` 模块解析设置反映了这一点，它启用了类似 `node16` 和 `nodenext` 的 `package.json` 的 `"exports"` 支持，同时始终允许无扩展名导入。有关更多指导，请参阅[_选择编译选项_](/docs/handbook/modules/guides/choosing-compiler-options.html)。

### 用于库的模块解析

在编译应用程序时，你应根据模块解析的 [host](#module-resolution-is-host-defined) 选择 TypeScript 项目的 `moduleResolution` 选项。在编译库时，你不知道输出的代码将在哪里运行，但希望它能在尽可能多的地方运行。使用 `"module": "nodenext"`（连同隐含的 [`"moduleResolution": "nodenext"`](/docs/handbook/modules/reference.html#node16-nodenext)）是最好的选择，以最大程度地提高输出 JavaScript 模块规范的兼容性，因为它将强制你遵守 Node.js 对 `import` 模块解析的更严格规则。让我们看看如果一个库使用 `"moduleResolution": "bundler"`（或更糟糕的是 `"node10"`）进行编译会发生什么：

```ts
export * from "./utils";
```

假设 `./utils.ts`（或 `./utils/index.ts`）存在，打包工具就可以正常处理代码，所以 `"moduleResolution": "bundler"` 不会报错。如果使用 `"module": "esnext"` 进行编译，这个导出语句的输出 JavaScript 代码将与输入代码完全相同。如果将该 JavaScript 代码发布到 npm，它可以在使用打包工具的项目中使用，但在 Node.js 中运行时会导致错误：

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../node_modules/dependency/utils' imported from .../node_modules/dependency/index.js
Did you mean to import ./utils.js?
```

另一方面，如果我们写成：

```ts
export * from "./utils.js";
```

这将产生在 Node.js 中*和*打包工具中都能正常工作的输出代码。

简而言之，`"moduleResolution": "bundler"` 具有传染性，允许生成仅在打包工具中工作的代码。同样，`"moduleResolution": "nodenext"` 只检查输出在 Node.js 中是否工作，但在大多数情况下，可以在其他运行时和打包工具中工作的模块代码也将在 Node.js 中工作。

当然，这个指南只适用于库在 `tsc` 中生成输出的情况。如果库在发布之前被打包，那么 `"moduleResolution": "bundler"` 可能是可接受的。任何在生成库的最终构建时更改模块格式或模块标识符的构建工具，都有责任确保产品的模块代码的安全性和兼容性，而 `tsc` 无法再为此任务做出贡献，因为它无法知道运行时将存在哪些模块代码。
