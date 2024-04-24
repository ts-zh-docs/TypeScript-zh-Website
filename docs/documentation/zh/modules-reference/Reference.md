---
title: 模块——参考
short: Reference
layout: docs
permalink: /zh/docs/handbook/modules/reference.html
oneline: 模块语法和编译器选项参考
translatable: true
---

## 模块语法

TypeScript 编译器支持 TypeScript 和 JavaScript 文件中的标准 [ECMAScript 模块语法](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)，以及 JavaScript 文件中的许多形式的 [CommonJS 语法](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html#commonjs-modules-are-supported)。

此外，还有一些 TypeScript 特定的语法扩展，可以在 TypeScript 文件和/或 JSDoc 注释中使用。

### 导入和导出 TypeScript 特定声明

类型别名、接口、枚举和命名空间可以使用 `export` 修饰符从模块中导出，就像任何标准 JavaScript 声明一样：

```ts
// 标准 JavaScript 语法...
export function f() {}
// ...扩展至类型声明
export type SomeType = /* ... */;
export interface SomeInterface { /* ... */ }
```

它们也可以在命名导出中引用，甚至可以与标准 JavaScript 声明一起引用：

```ts
export { f, SomeType, SomeInterface };
```

导出的类型（以及其他 TypeScript 特定声明）可以使用标准的 ECMAScript 导入语法导入：

```ts
import { f, SomeType, SomeInterface } from "./module.js";
```

当使用命名空间导入或导出时，如果在类型位置引用，导出的类型将在命名空间上可用：

```ts
import * as mod from "./module.js";
mod.f();
mod.SomeType; // 类型 'typeof import("./module.js")' 上不存在属性 'SomeType'
let x: mod.SomeType; // 正确
```

### 仅限类型的导入和导出

在将导入和导出转换为 JavaScript 代码时，默认情况下，TypeScript 会自动省略（不生成）仅在类型位置使用的导入语句和仅涉及类型的导出语句。你可以使用仅限类型的导入和导出来强制这样做，并明确指出省略。使用 `import type` 编写的导入声明，使用 `export type { ... }` 编写的导出声明，以及带有 `type` 关键字前缀的导入或导出标识符都将在生成的 JavaScript 代码中被省略。

```ts
// @Filename: main.ts
import { f, type SomeInterface } from "./module.js";
import type { SomeType } from "./module.js";

class C implements SomeInterface {
  constructor(p: SomeType) {
    f();
  }
}

export type { C };

// @Filename: main.js
import { f } from "./module.js";

class C {
  constructor(p) {
    f();
  }
}
```

`import type` 其实也可以导入值，但由于它们在生成的 JavaScript 代码中不存在，因此只能在非生成位置使用：

```ts
import type { f } from "./module.js";
f(); // ‘f’不能作为值使用，因为它是使用‘import type’导入的
let otherFunction: typeof f = () => {}; // 正确
```

仅限类型的导入声明不能同时声明默认导入和命名绑定，因为不清楚 `type` 是应用于默认导入还是整个导入声明。可以将导入声明拆分为两个声明，或者将 `default` 用作命名绑定：

```ts
import type fs, { BigIntOptions } from "fs";
//          ^^^^^^^^^^^^^^^^^^^^^
// 错误：仅限类型的导入可以指定默认导入或命名绑定，但不能同时存在两者。

import type { default as fs, BigIntOptions } from "fs"; // 正确
```

### `import()` 类型

TypeScript 提供了一种类似于 JavaScript 动态 `import` 的类型语法，用于引用模块的类型而无需编写导入声明：

```ts
// 获取导出的类型：
type WriteFileOptions = import("fs").WriteFileOptions;
// 获取导出值的类型：
type WriteFileFunction = typeof import("fs").writeFile;
```

这在 JavaScript 文件的 JSDoc 注释中特别有用，因为否则无法导入类型：

```ts
/** @type {import("webpack").Configuration} */
module.exports = {
  // ...
}
```

### `export =` 和 `import = require()`

在输出 CommonJS 模块时，TypeScript 文件可以使用与 JavaScript `module.exports = ...` 和 `const mod = require("...")` 直接对应的语法：

```ts
// @Filename: main.ts
import fs = require("fs");
export = fs.readFileSync("...");

// @Filename: main.js
"use strict";
const fs = require("fs");
module.exports = fs.readFileSync("...");
```

相比 JavaScript，选择使用这种语法是因为变量声明和属性赋值不能引用 TypeScript 类型，而特定的 TypeScript 语法可以：

```ts
// @Filename: a.ts
interface Options { /* ... */ }
module.exports = Options; // 错误：‘Options’只引用类型，但在此处被当作值使用。
export = Options; // 正确

// @Filename: b.ts
const Options = require("./a");
const options: Options = { /* ... */ }; // 错误：‘Options’引用值，但在此处被当作类型使用。

// @Filename: c.ts
import Options = require("./a");
const options: Options = { /* ... */ }; // 正确
```

### 环境模块

TypeScript 支持在脚本文件（非模块文件）中声明在运行时存在但没有对应文件的模块。这些*环境模块（ambient module）*通常表示运行时提供的模块，比如 Node.js 中的 `"fs"` 或 `"path"`：

```ts
declare module "path" {
  export function normalize(p: string): string;
  export function join(...paths: any[]): string;
  export var sep: string;
}
```

一旦环境模块被加载到 TypeScript 程序中，TypeScript 将会识别其他文件中对声明模块的导入：

```ts
// 👇 确保环境模块已加载——
//    如果 path.d.ts 通过项目的 tsconfig.json
//    在某种方式下被包含，则可能不需要此语句。
/// <reference path="path.d.ts" />

import { normalize, join } from "path";
```

环境模块声明很容易与[模块扩展](/zh/docs/handbook/declaration-merging.html#module-augmentation)混淆，因为它们使用相同的语法。如果文件是一个模块，换言之它具有顶级的 `import` 或 `export` 语句（或受到 [`--moduleDetection force` 或 `auto`](/zh/tsconfig#moduleDetection) 的影响），这个模块声明语法将变成模块扩展：

```ts
// 不再是环境模块声明！
export {};
declare module "path" {
  export function normalize(p: string): string;
  export function join(...paths: any[]): string;
  export var sep: string;
}
```

环境模块可以在模块声明体内使用导入语句来引用其他模块，而不会将包含该导入语句的文件转换为模块（这将使环境模块声明成为模块扩展）：

```ts
declare module "m" {
  // 将其移到“m”外部会完全改变文件的含义！
  import { SomeType } from "other";
  export function f(): SomeType;
}
```

*模式（pattern）*环境模块的名称中包含一个 `*` 通配符，用于匹配导入路径中的零个或多个字符。我们可以借此声明由自定义加载器提供的模块：

```ts
declare module "*.html" {
  const content: string;
  export default content;
}
```

## `module` 编译选项

本节将讨论每个 `module` 编译选项值的详细信息。有关该选项是什么以及它如何适用于整个编译过程的更多背景，请参阅[*模块输出格式*](/docs/handbook/modules/theory.html#模块输出格式)理论部分。简而言之，`module` 编译选项在历史上仅用于控制所输出的 JavaScript 文件的输出模块格式。然而，较新的 `node16` 和 `nodenext` 值描述了 Node.js 模块系统的各种特性，包括支持哪些模块格式、如何确定每个文件的模块格式以及不同模块格式之间的互操作性。

### `node16`，`nodenext`

Node.js 同时支持 CommonJS 和 ECMAScript 模块，对于每个文件可以使用特定规则确定使用哪种格式，并允许两种格式进行互操作。`node16` 和 `nodenext` 描述了 Node.js 双格式模块系统的全部行为范围，并且**以 CommonJS 或 ESM 格式输出文件**。这与其他 `module` 选项不同，其他选项与运行时无关，并会将强制输出为单一格式，用户需要确保输出可在运行时正常运行。

> 一个常见的误解是 `node16` 和 `nodenext` 仅输出 ES 模块。实际上，`node16` 和 `nodenext` 描述的是*支持* ES 模块的 Node.js 版本，而不仅仅是*使用* ES 模块的项目。根据每个文件[检测到的模块格式](#模块格式检测)，同时支持输出 ESM 和 CommonJS。由于 `node16` 和 `nodenext` 是唯一反映 Node.js 双模块系统复杂性的 `module` 选项，它们是所有旨在在 Node.js v12 或更高版本中运行的应用程序和库的**唯一正确的 `module` 选项**，无论它们是否使用 ES 模块。

`node16` 和 `nodenext` 目前作用一样，唯一的区别在于它们[暗示不同的 `target` 选项值](#implied-and-enforced-options)。如果 Node.js 将来对其模块系统进行重大更改，`node16` 将被冻结，而 `nodenext` 将被更新以反映新的行为。

#### 模块格式检测

- `.mts`/`.mjs`/`.d.mts` 文件始终是 ES 模块。
- `.cts`/`.cjs`/`.d.cts` 文件始终是 CommonJS 模块。
- 如果文件夹层级最接近的 package.json 文件中包含 `"type": "module"`，那么 `.ts`/`.tsx`/`.js`/`.jsx`/`.d.ts` 文件将根据此确定为 ES 模块，否则为 CommonJS 模块。

输入的 `.ts`/`.tsx`/`.mts`/`.cts` 文件的检测到的模块格式决定了生成的 JavaScript 文件的模块格式。例如，一个完全由 `.ts` 文件组成的项目默认情况下会在 `--module nodenext` 下全部生成 CommonJS 模块，通过在项目的 package.json 中添加 `"type": "module"` 可以使其全部生成 ES 模块。

#### 互操作规则

- **ES 模块引用 CommonJS 模块：**
  - CommonJS 模块的 `module.exports` 可以作为 ES 模块的默认导入使用。
  - CommonJS 模块的 `module.exports` 的属性（除了 `default`）可能可用作 ES 模块的命名导入，也可能不可用。Node.js 通过[静态分析](https://github.com/nodejs/cjs-module-lexer)来尽可能使其可用。TypeScript 无法根据声明文件确定静态分析的结果，因此乐观地假设它可以成功。这限制了 TypeScript 捕获可能在运行时崩溃的命名导入的能力。详细信息请参见 [#54018](https://github.com/nodejs/cjs-module-lexer)。
- **CommonJS 模块引用 ES 模块：**
  - `require` 不能引用 ES 模块。对于 TypeScript，这包括在被[检测](#模块格式检测)为 CommonJS 模块的文件中的 `import` 语句，因为这些 `import` 语句将在生成的 JavaScript 中转换为 `require` 调用。
  - 可以使用动态的 `import()` 调用来导入 ES 模块。它返回模块的模块命名空间对象的 Promise（从另一个 ES 模块中的 `import * as ns from "./module.js"` 中获得的对象）。

#### 生成

每个文件的生成格式取决于每个文件的[检测到的模块格式](#模块格式检测)。ESM 生成类似于 [`--module esnext`](#es2015-es2020-es2022-esnext)，但对 `import x = require("...")` 进行了特殊的转换，而在 `--module esnext` 中是不允许的：

```ts
import x = require("mod");
```

```js
import { createRequire as _createRequire } from "module";
const __require = _createRequire(import.meta.url);
const x = __require("mod");
```

CommonJS 的输出与 [`--module commonjs`](#commonjs) 类似，但不会转换动态的 `import()` 调用。这里的输出是启用 `esModuleInterop` 的。

```ts
import fs from "fs"; // 被转换
const dynamic = import("mod"); // 未转换
```

```js
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs")); // 被转换
const dynamic = import("mod"); // 未转换
```

#### 隐含和强制选项

- `--module nodenext` 或 `node16` 隐含并强制使用同名的 `moduleResolution`。
- `--module nodenext` 隐含使用 `--target esnext`。
- `--module node16` 隐含使用 `--target es2022`。
- `--module nodenext` 或 `node16` 隐含使用 `--esModuleInterop`。

#### 总结

- 对于所有打算在 Node.js v12 或更高版本中运行的应用程序和库，无论它们是否使用 ES 模块，`node16` 和 `nodenext` 是唯一正确的 `module` 选项。
- `node16` 和 `nodenext` 根据每个文件的[检测到的模块格式](#模块格式检测)生成 CommonJS 或 ESM 格式的文件。
- Node.js 在 ESM 和 CJS 之间的互操作规则反映在类型检查中。
- ESM 生成将 `import x = require("...")` 转换为使用 `createRequire` 导入构造的 `require` 调用。
- CommonJS 生成不对动态的 `import()` 调用进行转换，因此 CommonJS 模块可以异步导入 ES 模块。

### `es2015`, `es2020`, `es2022`, `esnext`

#### 总结

- 对于打包工具、Bun 和 tsx，请使用 `--moduleResolution bundler` 和 `esnext`。
- 不适用于 Node.js。在 package.json 中使用 `"type": "module"` 并配合 `node16` 或 `nodenext` 选项以生成适用于 Node.js 的 ES 模块。
- 非声明文件中不允许使用 `import mod = require("mod")`。
- `es2020` 添加了对 `import.meta` 属性的支持。
- `es2022` 添加了对顶层 `await` 的支持。
- `esnext` 是一个不断发展的目标，可能包括对 ECMAScript 模块的 Stage 3 提案的支持。
- 生成的文件是 ES 模块，但依赖项可以是任何格式。

#### 示例

```ts
import x, { y, z } from "mod";
import * as mod from "mod";
const dynamic = import("mod");
console.log(x, y, z, mod, dynamic);

export const e1 = 0;
export default "default export";
```

```js
import x, { y, z } from "mod";
import * as mod from "mod";
const dynamic = import("mod");
console.log(x, y, z, mod, dynamic);

export const e1 = 0;
export default "default export";
```

### `commonjs`

#### 总结

- 你可能不应该使用这个选项。请使用 `node16` 或 `nodenext` 以生成适用于 Node.js 的 CommonJS 模块。
- 生成的文件是 CommonJS 模块，但依赖项可以是任何格式。
- 动态的 `import()` 会转换为 `require()` 调用的 Promise。
- `esModuleInterop` 会影响默认导入和命名空间导入的输出代码。

#### 示例

> 输出代码是在 `esModuleInterop: false` 的情况下显示的。

```ts
import x, { y, z } from "mod";
import * as mod from "mod";
const dynamic = import("mod");
console.log(x, y, z, mod, dynamic);

export const e1 = 0;
export default "default export";
```

```js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.e1 = void 0;
const mod_1 = require("mod");
const mod = require("mod");
const dynamic = Promise.resolve().then(() => require("mod"));

console.log(mod_1.default, mod_1.y, mod_1.z, mod);
exports.e1 = 0;
exports.default = "default export";
```

```ts
import mod = require("mod");
console.log(mod);

export = {
    p1: true,
    p2: false
};
```

```js
"use strict";
const mod = require("mod");
console.log(mod);

module.exports = {
    p1: true,
    p2: false
};
```

### `system`

#### 概述

- 专为与 [SystemJS 模块加载器](https://github.com/systemjs/systemjs)配合使用而设计。

#### 示例

```ts
import x, { y, z } from "mod";
import * as mod from "mod";
const dynamic = import("mod");
console.log(x, y, z, mod, dynamic);

export const e1 = 0;
export default "default export";
```

```js
System.register(["mod"], function (exports_1, context_1) {
    "use strict";
    var mod_1, mod, dynamic, e1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (mod_1_1) {
                mod_1 = mod_1_1;
                mod = mod_1_1;
            }
        ],
        execute: function () {
            dynamic = context_1.import("mod");
            console.log(mod_1.default, mod_1.y, mod_1.z, mod, dynamic);
            exports_1("e1", e1 = 0);
            exports_1("default", "default export");
        }
    };
});
```

### `amd`

#### 概述

- 专为像 RequireJS 这样的 AMD 加载器设计。
- 你大概不应该使用它，而应该使用打包工具。
- 生成的文件是 AMD 模块，但依赖可以是任意格式。
- 支持 `outFile` 选项。

#### 示例

```ts
import x, { y, z } from "mod";
import * as mod from "mod";
const dynamic = import("mod");
console.log(x, y, z, mod, dynamic);

export const e1 = 0;
export default "default export";
```

```js
define(["require", "exports", "mod", "mod"], function (require, exports, mod_1, mod) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.e1 = void 0;
    const dynamic = new Promise((resolve_1, reject_1) => { require(["mod"], resolve_1, reject_1); });

    console.log(mod_1.default, mod_1.y, mod_1.z, mod, dynamic);
    exports.e1 = 0;
    exports.default = "default export";
});
```

### `umd`

#### 概述

- 专为 AMD 或 CommonJS 加载器设计。
- 不像大多数其他 UMD 包装器一样暴露全局变量。
- 你大概不应该使用它，而应该使用打包工具。
- 生成的文件是 UMD 模块，但依赖可以是任意格式。

#### 示例

```ts
import x, { y, z } from "mod";
import * as mod from "mod";
const dynamic = import("mod");
console.log(x, y, z, mod, dynamic);

export const e1 = 0;
export default "default export";
```

```js
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "mod", "mod"], factory);
    }
})(function (require, exports) {
    "use strict";
    var __syncRequire = typeof module === "object" && typeof module.exports === "object";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.e1 = void 0;
    const mod_1 = require("mod");
    const mod = require("mod");
    const dynamic = __syncRequire ? Promise.resolve().then(() => require("mod")) : new Promise((resolve_1, reject_1) => { require(["mod"], resolve_1, reject_1); });

    console.log(mod_1.default, mod_1.y, mod_1.z, mod, dynamic);
    exports.e1 = 0;
    exports.default = "default export";
});
```

## `moduleResolution` 编译选项

本节描述了多个 `moduleResolution` 模式共享的模块解析功能和过程，然后详细说明了每个模式的细节。有关该选项是什么以及它如何适应整体编译过程的更多背景信息，请参阅[*模块解析*](/zh/docs/handbook/modules/theory.html#模块解析)理论部分。简而言之，`moduleResolution` 控制 TypeScript 如何将*模块标识符*（`import`/`export`/`require` 语句中的字符串字面量）解析为磁盘上的文件，并且其应该根据目标运行时或打包工具使用的模块解析器进行设置。

### 共同的特性和过程

#### 文件扩展名替换

TypeScript 总是希望首先解析为可以提供类型信息的文件，同时确保运行时或打包工具可以使用相同的路径解析为提供 JavaScript 实现的文件。对于（根据指定的 `moduleResolution` 算法）任何会触发运行时或打包工具对 JavaScript 文件的查找行为的模块标识符，TypeScript 首先尝试查找具有相同名称和类似文件扩展名的 TypeScript 实现文件或类型声明文件。

| 运行时查找 | TypeScript 查找 #1 | TypeScript 查找 #2 | TypeScript 查找 #3 | TypeScript 查找 #4 | TypeScript 查找 #5 |
| -------------- | -------------------- | -------------------- | -------------------- | -------------------- | -------------------- |
| `/mod.js`      | `/mod.ts`            | `/mod.tsx`           | `/mod.d.ts`          | `/mod.js`            | `./mod.jsx`          |
| `/mod.mjs`     | `/mod.mts`           | `/mod.d.mts`         | `/mod.mjs`           |                      |                      |
| `/mod.cjs`     | `/mod.cts`           | `/mod.d.cts`         | `/mod.cjs`           |                      |                      |

请注意，此行为独立于导入中实际写入的实际模块标识符。这意味着，即使模块规范器明确使用 `.js` 文件扩展名，TypeScript 仍然可以解析为 `.ts` 或 `.d.ts` 文件：

```ts
import x from "./mod.js";
// 运行时查找: "./mod.js"
// TypeScript 查找 #1: "./mod.ts"
// TypeScript 查找 #2: "./mod.d.ts"
// TypeScript 查找 #3: "./mod.js"
```

有关 TypeScript 模块解析方式的解释，请参阅[*TypeScript 模仿主机的模块解析，但带有类型*](/docs/handbook/modules/theory.html#typescript-模拟-host-的模块解析，但包含类型信息)。

#### 相对文件路径解析

TypeScript 的 `moduleResolution` 算法都支持使用包含文件扩展名的相对路径引用模块（根据[上述规则](#文件扩展名替换)进行替换）：

```ts
// @Filename: a.ts
export {};

// @Filename: b.ts
import {} from "./a.js"; // ✅ 在每种 `moduleResolution` 中都有效
```

#### 无扩展名的相对路径

在某些情况下，运行时或捆绑器允许省略相对路径中的 `.js` 文件扩展名。TypeScript 在 `moduleResolution` 设置和上下文对运行时或捆绑器的指示支持此行为的情况下，也支持此行为：

```ts
// @Filename: a.ts
export {};

// @Filename: b.ts
import {} from "./a";
```

如果 TypeScript 确定运行时将根据模块说明符 `"./a"` 查找 `./a.js`，则 `./a.js` 将经过[扩展名替换](#文件扩展名替换)，在此示例中解析为文件 `a.ts`。

Node.js 的 `import` 路径不支持无扩展名的相对路径，而且在 package.json 文件中指定的文件路径中也不总是支持。尽管某些运行时和捆绑器支持此功能，但 TypeScript 目前不支持省略 `.mjs`/`.mts` 或 `.cjs`/`.cts` 文件扩展名。

#### 目录模块（索引文件解析）

在某些情况下，可以将目录（而不是文件）作为模块的引用。在最简单和最常见的情况下，运行时或捆绑器会在目录中查找名为 `index.js` 的文件。TypeScript 支持此行为，前提是 `moduleResolution` 设置和上下文对运行时或捆绑器的指示支持它：

```ts
// @Filename: dir/index.ts
export {};

// @Filename: b.ts
import {} from "./dir";
```

如果 TypeScript 确定运行时将根据模块规范符号 `"./dir"` 查找 `./dir/index.js`，则在本示例中，`./dir/index.js` 将进行[扩展替换](#文件拓展名替换)，并解析为文件 `dir/index.ts`。

目录模块还可以包含 package.json 文件，其中支持解析 [`"main"`和`"types"`](#package.json-的-main-和-types) 字段，并优先于 `index.js` 查找。目录模块还支持 [`"typesVersions"`](#packagejson-的-typesVersions) 字段。

请注意，目录模块与 [`node_modules` 包](#node_modules-包查找) 不同，它们仅支持一部分包的功能，并且在某些情况下根本不受支持。Node.js 将其视为[遗留功能](https://nodejs.org/dist/latest-v20.x/docs/api/modules.html#folders-as-modules)。

#### `paths`

##### 概述

TypeScript 提供了一种使用 `paths` 编译选项覆盖编译器对裸规范符号的模块解析的方式。虽然该功能最初设计用于与 AMD 模块加载器一起使用（一种在 ESM 存在或广泛使用打包程序之前在浏览器中运行模块的方法），但在今天仍然有用（当运行时或打包器支持 TypeScript 未建模的模块解析特性时）。例如，当使用 `--experimental-network-imports` 运行 Node.js 时，可以手动指定特定 `https://` 导入的本地类型定义文件：

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "paths": {
      "https://esm.sh/lodash@4.17.21": ["./node_modules/@types/lodash/index.d.ts"]
    }
  }
}
```

```ts
// 由于 `paths` 条目，此模块的类型被 `./node_modules/@types/lodash/index.d.ts` 定义
import { add } from "https://esm.sh/lodash@4.17.21";
```

对于使用打包器构建的应用程序，常见做法是在打包器配置中定义便捷路径别名，然后使用 `paths` 通知 TypeScript 这些别名：

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "paths": {
      "@app/*": ["./src/*"]
    }
  }
}
```

##### `paths` 对生成不起作用

`paths` 选项*不会*改变 TypeScript 生成的代码中的导入路径。因此，虽然我们可以在 TypeScript 中创建看似有效的路径别名，但在运行时会导致崩溃：

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "paths": {
      "node-不知道这是什么": ["./oops.ts"]
    }
  }
}
```

```ts
// TypeScript: ✅
// Node.js: 💥
import {} from "node-不知道这是什么";
```

尽管为打包的应用程序设置 `paths` 是可行的，但是发布的库千万*不要*这样做，因为生成的 JavaScript 在没有为 TypeScript 和打包器设置相同别名的情况下无法正常工作。对于库和应用程序，可以考虑使用 [package.json 的 `"imports"`](#packagejson-imports-and-self-name-imports) 作为方便的 `paths` 别名的标准替代方案。

##### `paths` 不应指向 monorepo 包或 node_modules 包

虽然与 `paths` 别名匹配的模块标识符是裸标识符，但一旦解析了别名，模块解析将继续把解析后的路径作为相对路径进行。因此，在 `paths` 别名匹配时不会发生 [`node_modules` 包查找](#node_modules-包查找)中发生的解析特性，包括 package.json 的 `"exports"` 字段支持。如果使用 `paths` 指向 `node_modules` 包，可能会导致意外的行为：

```ts
{
  "compilerOptions": {
    "paths": {
      "pkg": ["./node_modules/pkg/dist/index.d.ts"],
      "pkg/*": ["./node_modules/pkg/*"]
    }
  }
}
```

尽管此配置可能模拟某些包解析行为，但它会覆盖包的 `package.json` 文件定义的任何 `main`、`types`、`exports` 和 `typesVersions`，并且从该包中导入的内容可能在运行时失败。

相同的注意事项也适用于在 monorepo 中相互引用的包。不要使用 `paths` 来使 TypeScript 人为地解析 `"@my-scope/lib"` 为一个同级包，而是最好使用通过 [npm](https://docs.npmjs.com/cli/v7/using-npm/workspaces)、[yarn](https://classic.yarnpkg.com/en/docs/workspaces/) 或 [pnpm](https://pnpm.io/workspaces) 将你的包符号链接到 `node_modules`，这样 TypeScript 和运行时或打包器将执行真正的 `node_modules` 包查找。如果 monorepo 包将被发布到 npm，则尤其重要——一旦用户安装了这些包，它们将通过 `node_modules` 包查找相互引用，并且使用工作区从而你借此可以在本地开发期间测试该行为。

##### 与 `baseUrl` 的关系

如果提供了 [`baseUrl`](#baseurl)，则每个 `paths` 数组中的值将相对于 `baseUrl` 进行解析。否则，它们将相对于定义它们的 `tsconfig.json` 文件进行解析。

##### 通配符替换

`paths` 模式可以包含单个 `*` 通配符，用于匹配任意字符串。然后，可以在文件路径值中使用 `*` 标记来替换匹配的字符串：

```json
{
  "compilerOptions": {
    "paths": {
      "@app/*": ["./src/*"]
    }
  }
}
```

当解析 `"@app/components/Button"` 的导入时，TypeScript 将匹配 `@app/*`，将 `*` 绑定到 `components/Button`，然后尝试相对于 `tsconfig.json` 路径解析路径 `./src/components/Button`。此查找的其余部分将根据 `moduleResolution` 设置遵循与任何其他[相对路径查找](#相对文件路径解析)相同的规则。

当多个模式匹配同一个模块标识符时，将使用具有最长匹配前缀（在任何 `*` 标记之前）的模式：

```json
{
  "compilerOptions": {
    "paths": {
      "*": ["./src/foo/one.ts"],
      "foo/*": ["./src/foo/two.ts"],
      "foo/bar": ["./src/foo/three.ts"]
    }
  }
}
```

当解析 `"foo/bar"` 的导入时，所有三个 `paths` 模式都匹配，但是最后一个被使用，因为 `"foo/bar"` 比 `"foo/"` 和 `""` 长。

##### 回退

对于每个路径映射，你可以提供多个文件路径。如果一个路径解析失败，则会尝试数组中的下一个路径，直到解析成功或达到数组的末尾。

```json
{
  "compilerOptions": {
    "paths": {
      "*": ["./vendor/*", "./types/*"]
    }
  }
}
```

#### `baseUrl`

> `baseUrl` 是为 AMD 模块加载器设计的。如果你不使用 AMD 模块加载器，可能也不需要使用 `baseUrl`。自 TypeScript 4.1 起，[`paths`](#paths) 不再需要 `baseUrl`，并且不应仅用于设置 `paths` 值解析的目录。

`baseUrl` 编译选项可以与任何 `moduleResolution` 模式结合使用，并且可以指定裸模块标识符（bare specifier）（不以 `./`、`../` 或 `/` 开头的模块标识符）的解析目录。在支持它们的 `moduleResolution` 模式中，`baseUrl` 优先级高于 [`node_modules`软件包查找](#node_modules-包查找)。

在执行 `baseUrl` 查找时，解析会遵循与其他相对路径解析相同的规则。例如，在支持[无扩展名的相对路径](#无扩展名的相对路径)的 `moduleResolution` 模式中，模块标识符 `"some-file"` 可能解析为 `/src/some-file.ts`（如果 `baseUrl` 设置为 `/src`）。

相对模块标识符的解析不会受 `baseUrl` 选项的影响。

#### `node_modules` 包查找

Node.js 将不是相对路径、绝对路径或 URL 的模块标识符视为对 `node_modules` 子目录中的包的引用。打包工具采用了这种行为，允许用户使用与 Node.js 中相同的依赖管理系统，甚至使用相同的依赖项（这是一种常见的作法），非常的方便。除了 `classic` 之外，TypeScript 的所有 `moduleResolution` 选项都支持 `node_modules` 的查找。（`classic` 仅在其他解析方法都失败时才支持在 `node_modules/@types` 中查找，但从不直接在 `node_modules` 文件夹中查找包。）每个 `node_modules` 包查找都具有以下流程（在高优先级的裸模块标识符规则（例如 `paths`、`baseUrl`、自身名称导入和 package.json 中的 `"imports"` 查找）用尽后开始）：

1. 对于导入文件的每个祖先目录，如果其中存在 `node_modules` 目录：
   1. 如果 `node_modules` 中存在与包同名的目录：
      1. 尝试从包目录中解析类型。
      2. 如果找到结果，则返回并停止搜索。
   2. 如果 `node_modules/@types` 中存在与包同名的目录：
      1. 尝试从 `@types` 包目录中解析类型。
      2. 如果找到结果，则返回并停止搜索。
2. 对所有的 `node_modules` 文件夹重复上述搜索，但这次允许结果是 JavaScript 文件，并且不在 `@types` 目录中搜索。

所有的 `moduleResolution` 模式（除了 `classic`）都是这样，但它们在定位到包目录后的解析细节有所不同，下面的小节中会进行解释。

#### package.json 的 `"exports"`

如果 `moduleResolution` 设置为 `node16`、`nodenext` 或 `bundler`，且未禁用 `resolvePackageJsonExports`，TypeScript 在通过[裸模块 `node_modules` 包查找](#node_modules-包查找)触发的包目录解析时，遵循 Node.js [package.json 的 `"exports"` 规范](https://nodejs.org/api/packages.html#packages_package_entry_points)。

TypeScript 在将模块标识符通过 `"exports"` 解析为文件路径时完全按照 Node.js 的实现。但是，一旦解析出文件路径，TypeScript 仍然会[尝试多个文件扩展名](#文件拓展名替换)，以便优先找到类型。

在通过[有条件的 `"exports"`](https://nodejs.org/api/packages.html#conditional-exports) 进行解析时，TypeScript 总是匹配 `"types"` 和 `"default"` 条件（如果存在）。此外，TypeScript 还将匹配形如 `"types@{selector}"` 的带有版本的类型条件（其中 `{selector}` 是符合 `"typesVersions"` 版本选择器的字符串），遵循与 [`"typesVersions"`](#packagejson-typesversions) 实现的相同版本匹配规则。其他不可配置的条件取决于 `moduleResolution` 模式，并在以下章节中指定。可以使用 `customConditions` 编译器选项配置其他条件进行匹配。

请注意，`"exports"` 的存在会阻止未在 `"exports"` 中明确列出或与模式匹配的子路径被解析。

##### 示例：子路径、条件和扩展名替换

场景：在具有以下 package.json 的包目录中，使用条件 `["types", "node", "require"]`（由 `moduleResolution` 的设置和触发模块解析请求的上下文确定）请求了 `"pkg/subpath"`：

```json
{
  "name": "pkg",
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.cjs"
    },
    "./subpath": {
      "import": "./subpath/index.mjs",
      "require": "./subpath/index.cjs"
    }
  }
}
```

包目录内的解析过程：

1. 是否存在 `"exports"`？**是**。
2. `"exports"` 是否有 `"./subpath"` 条目？**是**。
3. `exports["./subpath"]` 的值是一个对象，它必须指定条件。
4. 第一个条件 `"import"` 是否与此请求匹配？**否**。
5. 第二个条件 `"require"` 是否与此请求匹配？**是**。
6. 路径 `"./subpath/index.cjs"` 是否具有 TypeScript 文件扩展名？**否**，因此使用扩展名替换。
7. 通过[扩展名替换](#文件拓展名替换) ，尝试以下路径，返回第一个存在的路径，否则返回 `undefined`：
   1. `./subpath/index.cts`
   2. `./subpath/index.d.cts`
   3. `./subpath/index.cjs`

如果 `./subpath/index.cts` 或 `./subpath.d.cts` 存在，则解析完成。否则，解析将按照 [`node_modules` 包查找](#node_modules-包查找)规则搜索 `node_modules/@types/pkg` 和其他 `node_modules` 目录，以尝试解析类型。如果找不到类型，则在所有 `node_modules` 中进行第二次解析，查找路径为 `./subpath/index.cjs` 的模块（如果存在），尽管这会被视为成功的解析，但因其不提供类型，导致导入的类型为 `any`，如果启用了 `noImplicitAny`，则会出现错误。

##### 示例：显式的 `"types"` 条件

场景：在具有以下 package.json 的包目录中，使用条件 `["types", "node", "import"]`（由 `moduleResolution` 的设置和触发模块解析请求的上下文确定）请求了 `"pkg/subpath"`：

```json
{
  "name": "pkg",
  "exports": {
    "./subpath": {
      "import": {
        "types": "./types/subpath/index.d.mts",
        "default": "./es/subpath/index.mjs"
      },
      "require": {
        "types": "./types/subpath/index.d.cts",
        "default": "./cjs/subpath/index.cjs"
      }
    }
  }
}
```

包目录内的解析过程：

1. 是否存在 `"exports"`？**是**。
2. `"exports"` 是否有 `"./subpath"` 条目？**是**。
3. `exports["./subpath"]` 的值是一个对象，它必须指定条件。
4. 第一个条件 `"import"` 是否与此请求匹配？**是**。
5. `exports["./subpath"].import` 的值是一个对象，它必须指定条件。
6. 第一个条件 `"types"` 是否与此请求匹配？**是**。
7. 路径 `"./types/subpath/index.d.mts"` 是否具有 TypeScript 文件扩展名？**是，因此不使用扩展名替换**。
8. 如果文件存在，则返回路径 `"./types/subpath/index.d.mts"`，否则返回 `undefined`。

##### 示例：带版本的 `"types"` 条件

场景：使用 TypeScript 4.7.5，在具有以下 package.json 的包目录中，使用条件 `["types", "node", "import"]`（由 `moduleResolution` 的设置和触发模块解析请求的上下文确定）请求了 `"pkg/subpath"`：

```json
{
  "name": "pkg",
  "exports": {
    "./subpath": {
      "types@>=5.2": "./ts5.2/subpath/index.d.ts",
      "types@>=4.6": "./ts4.6/subpath/index.d.ts",
      "types": "./tsold/subpath/index.d.ts",
      "default": "./dist/subpath/index.js"
    }
  }
}
```

包目录内的解析过程：

1. 是否存在 `"exports"`？**是**。
2. `"exports"` 是否有 `"./subpath"` 条目？**是**。
3. `exports["./subpath"]` 的值是一个对象，它必须指定条件。
4. 第一个条件 `"types@>=5.2"` 是否与此请求匹配？**否，4.7.5 不大于或等于 5.2**。
5. 第二个条件 `"types@>=4.6"` 是否与此请求匹配？**是，4.7.5 大于或等于 4.6**。
6. 路径 `"./ts4.6/subpath/index.d.ts"` 是否具有 TypeScript 文件扩展名？**是**，因此不使用扩展名替换。
7. 如果文件存在，则返回路径 `"./ts4.6/subpath/index.d.ts"`，否则返回 `undefined`。

##### 示例：子路径模式

场景：在具有以下 package.json 的包目录中，使用条件 `["types", "node", "import"]`（由 `moduleResolution` 的设置和触发模块解析请求的上下文确定）请求了 `"pkg/wildcard.js"`：

```json
{
  "name": "pkg",
  "type": "module",
  "exports": {
    "./*.js": {
      "types": "./types/*.d.ts",
      "default": "./dist/*.js"
    }
  }
}
```

包目录内的解析过程：

1. 是否存在 `"exports"`？**是**。
2. `"exports"` 是否有 `"./wildcard.js"` 条目？**否**。
3. 是否有任何带有 `*` 的键与 `"./wildcard.js"` 匹配？**是，`"./*.js"` 匹配并将 `wildcard` 设置为替换值**。
4. `exports["./*.js"]` 的值是一个对象，它必须指定条件。
5. 第一个条件 `"types"` 是否与此请求匹配？**是**。
6. 在 `./types/*.d.ts` 中，将 `*` 替换为替换值 `wildcard`。**`./types/wildcard.d.ts`**
7. 路径 `"./types/wildcard.d.ts"` 是否具有 TypeScript 文件扩展名？**是，因此不使用扩展名替换。**
8. 如果文件存在，则返回路径 `"./types/wildcard.d.ts"`，否则返回 `undefined`。

##### 示例: `"exports"` 阻止其他子路径

场景：在包目录中请求 `"pkg/dist/index.js"`，该目录下的 package.json 如下所示：

```json
{
  "name": "pkg",
  "main": "./dist/index.js",
  "exports": "./dist/index.js"
}
```

包目录内的解析过程：

1. 是否存在 `"exports"`? **是。**
2. `exports` 的值是一个字符串，它必须是相对于包根目录 (`"."`) 的文件路径。
3. 请求的路径 `"pkg/dist/index.js"` 是否是包根目录? **不是，它包含子路径 `dist/index.js`。**
4. 解析失败；返回 `undefined`。

如果没有 `"exports"`，该请求可能会成功，但是 `"exports"` 的存在会阻止解析无法通过 `"exports"` 匹配的子路径。

#### package.json 的 `"typesVersions"`

[`node_modules` 包](#node_modules-包查找)或[目录模块](#目录模块-索引文件解析)可以在其 package.json 中指定 `"typesVersions"` 字段，来根据 TypeScript 编译器版本和正在解析的子路径，重定向 TypeScript 的解析过程。包作者借此可以在一组类型定义中包含新的 TypeScript 语法，同时为了与旧的 TypeScript 版本向后兼容提供另一组类型定义（通过类似 [downlevel-dts](https://github.com/sandersn/downlevel-dts) 的工具）。`"typesVersions"` 在所有的 `moduleResolution` 模式下都受支持；但是，在读取 [package.json 的 `"exports"`](#packagejson-的-exports) 时不会读取该字段。

##### 示例：重定向所有请求到子目录

场景：某模块使用 TypeScript 5.2 导入 `"pkg"`，其中 `node_modules/pkg/package.json` 文件内容如下：

```json
{
  "name": "pkg",
  "version": "1.0.0",
  "types": "./index.d.ts",
  "typesVersions": {
    ">=3.1": {
      "*": ["ts3.1/*"]
    }
  }
}
```

解析过程：

1.（根据编译器选项）存在 `"exports"` 吗？**否。**
2. 存在 `"typesVersions"` 吗？**是。**
3. TypeScript 版本是否 `>=3.1`？**是。记住映射关系 `"*": ["ts3.1/*"]`。**
4. 我们是否在解析包名后的子路径？**不是，只是根路径下的 `"pkg"`。**
5. 存在 `"types"` 吗？**是的。**
6. `"typesVersions"` 中是否有任何键与 `./index.d.ts` 匹配？**是，`"*"` 匹配并将 `index.d.ts` 设置为替换值。**
7. 在 `ts3.1/*` 中，将 `*` 替换为替换值 `./index.d.ts`：**`ts3.1/index.d.ts`**。
8. 路径 `./ts3.1/index.d.ts` 是否具有 TypeScript 文件扩展名？**是，因此不使用扩展名替换。**
9. 如果文件存在，则返回路径 `./ts3.1/index.d.ts`，否则返回 `undefined`。

##### 示例：重定向对特定文件的请求

场景：一个模块使用 TypeScript 3.9 导入 `"pkg"`，其中 `node_modules/pkg/package.json` 文件内容如下：

```json
{
  "name": "pkg",
  "version": "1.0.0",
  "types": "./index.d.ts",
  "typesVersions": {
    "<4.0": { "index.d.ts": ["index.v3.d.ts"] }
  }
}
```

解析过程：

1.（根据编译器选项）存在 `"exports"` 吗？**否。**
2. 存在 `"typesVersions"` 吗？**是。**
3. TypeScript 版本是否 `<4.0`？**是。记住映射关系 `"index.d.ts": ["index.v3.d.ts"]`。**
4. 我们是否在解析包名后的子路径？**不是，只是根路径下的 `"pkg"`。**
5. 存在 `"types"` 吗？**是的。**
6. `"typesVersions"` 中是否有任何键与 `./index.d.ts` 匹配？**是，`"index.d.ts"` 匹配。**
7. 路径 `./index.v3.d.ts` 是否具有 TypeScript 文件扩展名？**是的，因此不使用扩展名替换。**
8. 如果文件存在，则返回路径 `./index.v3.d.ts`，否则返回 `undefined`。

#### package.json 的 `"main"` 和 `"types"`

如果一个目录的 [package.json `"exports"`](#packagejson-exports) 字段没有被读取（要么是由于编译器选项，要么是因为该字段不存在，要么是因为该目录被解析为[目录模块](#目录模块-索引文件解析)，而不是[`node_modules` 包](#node_modules-包查找)），并且模块标识符在包名或包含 package.json 的目录后没有子路径时，TypeScript 将按照以下顺序尝试从这些 package.json 字段中解析，以查找包或目录的主模块：

- `"types"`
- `"typings"`（已弃用）
- `"main"`

在 `"types"` 字段找到的声明文件被假定为与在 `"main"` 中找到的实现文件相对应。如果找不到或无法解析 `"types"` 和 `"typings"`，TypeScript 将读取 `"main"` 字段并执行[扩展名替换](#文件拓展名替换)以找到声明文件。

当将一个带有类型的包发布到 npm 上时，建议即使[扩展名替换](#文件拓展名替换)或 [package.json `"exports"`](#packagejson-exports) 使其变得不必要，也要包含一个 `"types"` 字段，因为 npm 仅在 package.json 中包含 `"types"` 字段时才会在包注册表列表上显示 TS 图标。

#### 相对于包的文件路径

如果既不满足 [package.json `"exports"`](#packagejson-exports) 也不满足 [package.json `"typesVersions"`](#packagejson-typesversions)，则裸包路径的子路径将相对于包的目录进行解析，遵循适用的[相对路径](#相对文件路径解析)解析规则。在遵循 [package.json `"exports"`] 的模式中，即使导入无法通过 `"exports"` 解析，只要包的 package.json 中存在 `"exports"` 字段，此行为就会被阻止，如[上面的示例](#示例-exports-阻止其他子路径)所示。另一方面，如果导入无法通过 `"typesVersions"` 解析，将尝试以相对包的文件路径解析作为后备。

当支持包相对路径时，它们将根据 `moduleResolution` 模式和上下文遵循与任何其他相对路径相同的解析规则。例如，在 [`--moduleResolution nodenext`](#node16-nodenext-1) 中，[目录模块](#目录模块-索引文件解析)和[无扩展名路径](#无拓展名相对路径)仅在 `require` 调用中受支持，而不在 `import` 中：

```ts
// @Filename: module.mts
import "pkg/dist/foo";                // ❌ import，需要 `.js` 扩展名
import "pkg/dist/foo.js";             // ✅
import foo = require("pkg/dist/foo"); // ✅ require，无需扩展名
```

#### package.json `"imports"` 和自身名称导入

如果 `moduleResolution` 设置为 `node16`、`nodenext` 或 `bundler`，且未禁用 `resolvePackageJsonImports`，TypeScript 将尝试通过导入文件的最近祖先 package.json 的 `"imports"` 字段解析以 `#` 开头的导入路径。类似地，当启用 [package.json `"exports"` 查找](#packagejson-exports)时，TypeScript 将尝试通过当前包名称开始的导入路径（即导入文件最近祖先 package.json 中的 `"name"` 字段的值）通过该 package.json 的 `"exports"` 字段进行解析。这两个特性允许一个包中的文件导入同一包中的其他文件，替换相对导入路径。

TypeScript 在解析 [`"imports"`](https://nodejs.org/api/packages.html#subpath-imports) 和[自引用](https://nodejs.org/api/packages.html#self-referencing-a-package-using-its-name)时，完全遵循 Node.js 的解析算法，直到解析出文件路径为止。在那一点上，TypeScript 的解析算法会根据正在解析的包含 `"imports"` 或 `"exports"` 的 package.json 属于 `node_modules` 依赖项还是本地项目被编译（即其目录包含包含导入文件的 tsconfig.json 文件的项目）进行分叉处理：

- 如果 package.json 在 `node_modules` 中，TypeScript 将对文件路径应用[扩展名替换](#文件拓展名替换)，如果文件路径尚未具有 TypeScript 文件扩展名，则检查生成的文件路径是否存在。
- 如果 package.json 是本地项目的一部分，则会执行额外的重映射步骤，以查找将从 `"imports"` 解析的输出 JavaScript 或声明文件路径最终生成的*输入* TypeScript 实现文件。如果没有这个步骤，解析 `"imports"` 路径的任何编译将引用*上一次编译*的输出文件，而不是当前编译中打算包含的其他输入文件。此重映射使用 tsconfig.json 的 `outDir`/`declarationDir` 和 `rootDir`，因此使用 `"imports"` 通常需要设置显式的 `rootDir`。

这个变化使得包作者能够编写 `"imports"` 和 `"exports"` 字段，只引用将要发布到 npm 的编译输出，同时仍然允许本地开发使用原始的 TypeScript 源文件。

##### 示例：具有条件的本地项目

场景：在一个带有 tsconfig.json 和 package.json 的项目目录中，`"/src/main.mts"` 在条件 `["types", "node", "import"]`（由 `moduleResolution` 的设置和触发模块解析请求的上下文决定）下引入了 `"#utils"`。

```json5
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node16",
    "resolvePackageJsonImports": true,
    "rootDir": "./src",
    "outDir": "./dist"
  }
}
```

```json5
// package.json
{
  "name": "pkg",
  "imports": {
    "#utils": {
      "import": "./dist/utils.d.mts",
      "require": "./dist/utils.d.cts"
    }
  }
}
```

解析过程：

1. 导入路径以 `#` 开头，尝试通过 `"imports"` 进行解析。
2. 最近的上层 `package.json` 中存在 `"imports"` 吗？**是。**
3. `"imports"` 对象中是否存在 `"#utils"`？**是。**
4. `imports["#utils"]` 的值是一个对象，它必须指定条件。
5. 第一个条件 `"import"` 是否与此请求匹配？**是。**
6. 我们是否应该尝试将输出路径映射到输入路径？**是，因为：**
   - `package.json` 是否在 `node_modules` 中？**不是，它在本地项目中。**
   - `tsconfig.json` 是否在 `package.json` 目录中？**是的。**
7. 在 `./dist/utils.d.mts` 中，用 `rootDir` 替换 `outDir` 前缀。**`./src/utils.d.mts`**
8. 将输出扩展名 `.d.mts` 替换为相应的输入扩展名 `.mts`。**`./src/utils.mts`**
9. 如果文件存在，则返回路径 `"./src/utils.mts"`。
10. 否则，如果文件存在，则返回路径 `"./dist/utils.d.mts"`。

##### 示例：具有子路径模式的 `node_modules` 依赖项

场景：`"/node_modules/pkg/main.mts"` 使用条件 `["types", "node", "import"]`（由 `moduleResolution` 的设置和触发模块解析请求的上下文决定）导入了 `"#internal/utils"`，具有以下 `package.json`：

```json5
// /node_modules/pkg/package.json
{
  "name": "pkg",
  "imports": {
    "#internal/*": {
      "import": "./dist/internal/*.mjs",
      "require": "./dist/internal/*.cjs"
    }
  }
}
```

解析过程：

1. 导入路径以 `#` 开头，尝试通过 `"imports"` 进行解析。
2. 最近的上层 `package.json` 中存在 `"imports"` 吗？**是。**
3. `"imports"` 对象中是否存在 `"#internal/utils"`？**否，检查模式匹配。**
4. 是否有任何带有 `*` 的键匹配 `"#internal/utils"`？**是，`"#internal/*"` 匹配并将 `utils` 设置为替换值。**
5. `imports["#internal/*"]` 的值是一个对象，它必须指定条件。
6. 第一个条件 `"import"` 是否与此请求匹配？**是。**
7. 我们是否应该尝试将输出路径映射到输入路径？**否，因为 `package.json` 在 `node_modules` 中。**
8. 在 `./dist/internal/*.mjs` 中，用替换值 `utils` 替换 `*`。**`./dist/internal/utils.mjs`**
9. 路径 `./dist/internal/utils.mjs` 是否具有 TypeScript 文件扩展名？**否，尝试扩展名替换。**
10. 通过[扩展名替换](#文件拓展名替换)，尝试以下路径，返回第一个存在的路径，如果不存在则返回 `undefined`：
    1. `./dist/internal/utils.mts`
    2. `./dist/internal/utils.d.mts`
    3. `./dist/internal/utils.mjs`

### `node16`、`nodenext`

这些模式反映了 Node.js v12 及更高版本的模块解析行为。（`node16` 和 `nodenext` 目前是相同的，但如果 Node.js 在未来对其模块系统进行重大更改，`node16` 将被冻结，而 `nodenext` 将更新以反映新的行为。）在 Node.js 中，用于 ECMAScript 导入的解析算法与用于 CommonJS 的 `require` 调用的算法有显著的区别。对于正在解析的每个模块标识符，首先使用语法和导入文件的[模块格式](#模块格式检测)来确定模块标识符在生成的 JavaScript 中是 `import` 还是 `require`。然后将该信息传递给模块解析器，以确定使用哪个解析算法（以及是否对 package.json 的 `"exports"`（#packagejson-exports）或 `"imports"`（#package.json-imports-和自身名称导入）使用 `"import"` 或 `"require"` 条件）。

> [被确定为 CommonJS 格式](模块格式检测)的 TypeScript 文件在默认情况下仍然可以使用 `import` 和 `export` 语法，但生成的 JavaScript 代码将使用 `require` 和 `module.exports`。这意味着经常会看到使用 `require` 算法解析的 `import` 语句。如果这造成了困惑，可以启用 `verbatimModuleSyntax` 编译选项，该选项禁止使用会被生成为 `require` 调用的 `import` 语句。

需要注意的是，动态的 `import()` 调用始终使用 `import` 算法进行解析，符合 Node.js 的行为。然而，`import()` 类型的解析是根据导入文件（译注：不是被导入，例如如果 A 导入 B，则这里说的是 A）的格式进行的（为了与现有的 CommonJS 格式的类型声明向后兼容）：

```ts
// @Filename: module.mts
import x from "./mod.js";             // 由于文件格式，使用 `import` 算法（按原样输出）
import("./mod.js");                   // 由于语法，使用 `import` 算法（按原样输出）
type Mod = typeof import("./mod.js"); // 由于文件格式，使用 `import` 算法
import mod = require("./mod");        // 由于语法，使用 `require` 算法（输出为 `require`）

// @Filename: commonjs.cts
import x from "./mod";                // 由于文件格式，使用 `require` 算法（输出为 `require`）
import("./mod.js");                   // 由于语法，使用 `import` 算法（按原样输出）
type Mod = typeof import("./mod");    // 由于文件格式，使用 `require` 算法
import mod = require("./mod");        // 由于语法，使用 `require` 算法（输出为 `require`）
```

#### 隐含和强制选项

- `--moduleResolution node16` 和 `nodenext` 必须与它们[对应的 `module` 值](#node16-nodenext)配对使用。

#### 支持的特性

特性按优先顺序列出。

| | `import` | `require` |
|-| -------- | --------- |
| [`paths`](#paths) | ✅ | ✅ |
| [`baseUrl`](#baseurl) | ✅ | ✅ |
| [node_modules 包查找](#node_modules-包查找) | ✅ | ✅ |
| [package.json 中的 `"exports"`](#packagejson-exports) | ✅ 匹配 `types`、`node`、`import` | ✅ 匹配 `types`、`node`、`require` |
| [package.json 中的 `"imports"` 和自命名导入](#packagejson-imports-和自身名称导入) | ✅ 匹配 `types`、`node`、`import` | ✅ 匹配 `types`、`node`、`require` |
| [package.json 中的 `"typesVersions"`](#packagejson-typesversions) | ✅ | ✅ |
| [相对于包的路径](#相对于包的文件路径) | ✅ 当不存在 `exports` 时 | ✅ 当不存在 `exports` 时 |
| [完整的相对路径](#相对文件路径解析) | ✅ | ✅ |
| [无扩展名的相对路径](#无拓展名的相对路径) | ❌ | ✅ |
| [目录模块](#目录模块-索引文件解析) | ❌ | ✅ |

### `bundler`

`--moduleResolution bundler` 旨在模拟大多数 JavaScript 打包工具的模块解析行为。简而言之，这意味着支持与 Node.js 的 CommonJS `require` 解析算法相关的所有行为，例如 [`node_modules`查找](#node_modules-包查找)、[目录模块](#目录模块-索引文件解析)和[无扩展名路径](#无拓展名的相对路径)，同时也支持较新的 Node.js 解析功能，如 [package.json 中的 `"exports"`](#packagejson-exports) 和 [package.json 中的 `"imports"`](#packagejson-imports-自身名称导入)。

这与在 CommonJS 模式下 [`node16` 和 `nodenext`](node16-nodenext-1) 解析的行为非常相似，但在 `bundler` 中，用于解析 package.json 中 `"exports"` 和 `"imports"` 的条件始终是 `"types"` 和 `"import"`。为了理解其中的原因，让我们来看一下在 `nodenext` 中一个 `.ts` 文件中的导入会发生什么：

```ts
// index.ts
import { foo } from "pkg";
```

在 `--module nodenext --moduleResolution nodenext` 中，`--module` 设置首先[确定](#模块格式检测)导入将作为 `import` 还是 `require` 调用写入 `.js` 文件，并将该信息传递给 TypeScript 的模块解析器，该解析器根据需要匹配 `"import"` 或 `"require"` 条件。这确保了 TypeScript 的模块解析过程，尽管是从输入的 `.ts` 文件开始，但能够反映在运行输出的 `.js` 文件时 Node.js 的模块解析过程将会发生什么。

另一方面，在使用打包工具时，通常打包工具直接处理原始的 `.ts` 文件，并基于未经转换的 `import` 语句运行其模块解析过程。在这种情况下，考虑 TypeScript 如何生成 `import` 并没有太多意义，因为 TypeScript 根本不用于生成任何内容。对于打包工具来说，`import` 就是 `import`，`require` 就是 `require`，因此用于解析 `package.json` 中的 `"exports"` 和 `"imports"` 的条件由输入的 `.ts` 文件中的语法决定。同样，TypeScript 在 `--moduleResolution bundler` 中使用的模块解析过程中的条件*也*由输入 TypeScript 文件中的语法决定，只是 `require` 调用目前根本不会被解析：

```ts
// 某个库文件：
declare function require(module: string): any;

// index.ts
import { foo } from "pkg";    // 使用“import”条件解析
import pkg2 = require("pkg"); // 不允许
const pkg = require("pkg");   // 不会出错，但没有解析到任何内容
   // ^? any
```

由于 TypeScript 当前不支持在 `--moduleResolution bundler` 中解析 `require` 调用，因此它解析的所有内容*都*使用 `"import"` 条件。

#### 隐含和强制选项

- `--moduleResolution bundler` 必须与 `--module esnext` 选项配对使用。
- `--moduleResolution bundler` 隐含了 `--allowSyntheticDefaultImports` 选项。

#### 支持的特性

- [`paths`](#paths) ✅
- [`baseUrl`](#baseurl) ✅
- [`node_modules` 包查找](#node_modules-包查找) ✅
- [package.json 中的 `"exports"`](#packagejson-exports) ✅ 匹配 `types`，`import`
- [package.json 中的 `"imports"` 和自身命名导入](#package.json-imports-和自身名称导入) ✅ 匹配 `types`，`import`
- [package.json 中的 `"typesVersions"`](#packagejson-typesversions) ✅
- [相对于包的路径](#相对于包的文件路径) ✅（当不存在 `exports` 时）
- [完整的相对路径](#相对文件路径解析) ✅
- [无扩展名的相对路径](#无拓展名的相对路径) ✅
- [目录模块](#目录模块-索引文件解析) ✅

### `node10`（之前称为 `node`）

`--moduleResolution node` 在 TypeScript 5.0 中更名为 `node10`（为了向后兼容性保留 `node` 作为别名）。它反映了在 Node.js v12 之前的版本中存在的 CommonJS 模块解析算法。不应再使用该选项。

#### 支持的特性

- [`paths`](#paths) ✅
- [`baseUrl`](#baseurl) ✅
- [`node_modules` 包查找](#node_modules-包查找) ✅
- [package.json 中的 `"exports"`](#packagejson-exports) ❌
- [package.json 中的 `"imports"` 和自身命名导入](#packagejson-imports-和自身命名导入) ❌
- [package.json 中的 `"typesVersions"`](#packagejson-typesversions) ✅
- [相对于包的路径](#相对于包的文件路径) ✅
- [完整的相对路径](#相对文件路径解析) ✅
- [无扩展名的相对路径](#无拓展名的相对路径) ✅
- [目录模块](#目录模块-索引文件解析) ✅

### `classic`

不要使用 `classic` 选项。
