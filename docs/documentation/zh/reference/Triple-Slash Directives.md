---
title: 三斜线指令
layout: docs
permalink: /zh/docs/handbook/triple-slash-directives.html
oneline: 如何在 TypeScript 中使用三斜线指令
translatable: true
---

三斜杠指令是包含单个 XML 标记的单行注释，其内容用于提供编译器指令。

请注意，三斜杠指令**仅**在所在文件的顶部有效。这些指令只能位于单行或多行注释之前，包括其他三斜杠指令。如果它们出现在语句或声明之后，则会被视为常规单行注释，不具有特殊含义。

## `/// <reference path="..." />`

`/// <reference path="..." />` 指令是其中最常见的。它用作文件之间的*依赖*声明。

三斜杠引用指示编译器在编译过程中包含其他文件。

此外，当使用 [`out`](/zh/tsconfig#out) 或 [`outFile`](/zh/tsconfig#outFile) 时，它们还可以用来对输出进行排序。预处理完成后，文件会按照输入的顺序写入到输出文件位置。

### 预处理输入文件

在编译过程中，编译器会对输入文件执行预处理，以解析所有三斜杠引用指令，并将其他文件添加到编译中。

该过程从一组*根文件*开始，这些根文件是在命令行或 `tsconfig.json` 文件的 [`files`](/zh/tsconfig#files) 列表中指定的文件名。根文件按照它们被指定的顺序进行预处理。在将文件添加到列表之前，会解析其中的所有三斜杠引用指令，并包含它们的目标文件。三斜杠引用指令按照深度优先的顺序解析，依据它们在文件中的出现顺序进行处理。

当使用相对路径时，三斜杠引用路径将相对于包含该引用的文件进行解析。

### 错误

引用不存在的文件将导致错误。文件包含对自身的三斜杠引用也会导致错误。

### 使用 `--noResolve`

如果指定了编译器标志 [`noResolve`](/zh/tsconfig#noResolve)，则三斜杠引用会被忽略，不会添加新文件，也不会改变提供文件的顺序。

## `/// <reference types="..." />`

与 `/// <reference path="..." />` 指令用作*依赖*声明类似，`/// <reference types="..." />` 指令声明对包的依赖。

解析这些包名称的过程类似于解析 `import` 语句中的模块名称的过程。可以将三斜杠引用类型指令视为声明包的简单 `import` 方式。

例如，声明文件中包含 `/// <reference types="node" />` 表示该文件使用在 `@types/node/index.d.ts` 中声明的名称；因此，需要将此包与声明文件一起包含在编译中。

这些指令仅在手动编写 `d.ts` 文件时使用。

在编译过程中生成的声明文件中，编译器会自动为你添加 `/// <reference types="..." />`。在生成的声明文件中，仅当结果文件使用了来自所引用包的任何声明时，才会添加 `/// <reference types="..." />`。

要在 `.ts` 文件中声明对 `@types` 包的依赖，请在命令行或 `tsconfig.json` 文件中使用 [`types`](/tsconfig#types)。有关更多详细信息，请参阅[在 `tsconfig.json` 文件中使用 `@types`、`typeRoots` 和 `types`](/zh/docs/handbook/tsconfig-json.html#types-typeroots-and-types)。

## `/// <reference lib="..." />`

该指令允许文件显式包含现有的内置 _lib_ 文件。

引用内置 _lib_ 文件的方式与 _tsconfig.json_ 中的 [`lib`](/zh/tsconfig#lib) 编译器选项相同（例如使用 `lib="es2015"` 而不是 `lib="lib.es2015.d.ts"`）。

对于依赖内置类型的声明文件作者，例如 DOM API 或内置 JS 运行时构造函数（如 `Symbol` 或 `Iterable`），建议使用三斜杠引用 lib 指令。以前，这些 .d.ts 文件必须添加这些类型的前向/重复声明。

例如，在编译中的文件中添加 `/// <reference lib="es2017.string" />` 相当于使用 `--lib es2017.string` 进行编译。

```ts
/// <reference lib="es2017.string" />

"foo".padStart(4);
```

## `/// <reference no-default-lib="true"/>`

该指令将文件标记为*默认库*。你会在 `lib.d.ts` 及其变体的顶部看到此注释。

此指令指示编译器在编译过程中*不要*包含默认库（即 `lib.d.ts`）。其效果类似于在命令行上传递 [`noLib`](/zh/tsconfig#noLib)。

此外，请注意，当传递 [`skipDefaultLibCheck`](/zh/tsconfig#skipDefaultLibCheck) 时，编译器将仅跳过带有 `/// <reference no-default-lib="true"/>` 注释的文件的检查。

## `/// <amd-module />`

默认情况下，会生成匿名的 AMD 模块。当使用其他工具处理生成的模块时（例如打包工具 `r.js`），这可能会导致问题。

`amd-module` 指令允许向编译器传递一个可选的模块名称：

##### amdModule.ts

```ts
/// <amd-module name="NamedModule"/>
export class C {}
```

将导致在调用 AMD `define` 时将名称 `NamedModule` 分配给模块：

##### amdModule.js

```js
define("NamedModule", ["require", "exports"], function (require, exports) {
  var C = (function () {
    function C() {}
    return C;
  })();
  exports.C = C;
});
```

## `/// <amd-dependency />`

> **注意**: 此指令已被弃用。请改用 `import "moduleName";` 语句。

`/// <amd-dependency path="x" />` 通知编译器有一个非 TypeScript 模块依赖项需要注入到生成模块的 require 调用中。

`amd-dependency` 指令也可以具有可选的 `name` 属性；这允许为 amd-dependency 传递一个可选名称：

```ts
/// <amd-dependency path="legacy/moduleA" name="moduleA"/>
declare var moduleA: MyType;
moduleA.callStuff();
```

生成的 JS 代码：

```js
define(["require", "exports", "legacy/moduleA"], function (
  require,
  exports,
  moduleA
) {
  moduleA.callStuff();
});
```
