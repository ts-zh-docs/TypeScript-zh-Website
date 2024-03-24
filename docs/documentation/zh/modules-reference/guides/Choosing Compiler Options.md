---
title: 模块——选择编译器选项
short: 选择编译器选项
layout: docs
permalink: /zh/docs/handbook/modules/guides/choosing-compiler-options.html
oneline: 如何选择反映模块环境的编译器选项
translatable: true
---

## 我正在编写应用程序

单个 tsconfig.json 文件只能代表一个环境，无论是在可用的全局变量还是模块行为方面。如果你的应用程序包含服务器代码、DOM 代码、Web Worker 代码、测试代码以及所有这些代码共享的代码，每个代码部分都应该有自己的 tsconfig.json，并通过[项目引用](/zh/docs/handbook/project-references.html#handbook-content)进行连接。然后，对于每个 tsconfig.json，都请参考本指南。对于应用程序的库及类似的项目，特别是那些需要在多个运行时环境中运行的项目，请参考“[我正在编写一个库](#我正在撰写一个库)”部分。

### 我正在使用打包工具

除了采用以下设置外，目前建议*不要*设置 `{ "type": "module" }` 或在打包工具项目中使用 `.mts` 文件。[一些打包工具](https://andrewbranch.github.io/interop-test/#synthesizing-default-exports-for-cjs-modules)在这些情况下采用了不同的 ESM/CJS 互操作行为，TypeScript 目前无法使用 `"moduleResolution": "bundler"` 分析这些情况。有关更多信息，请参阅[问题 #54102](https://github.com/microsoft/TypeScript/issues/54102)。

```json5
{
  "compilerOptions": {
    // 这不是一个完整的模板；它只展示了相关的模块相关设置。
    // 请确保设置其他重要的选项，如 `target`、`lib` 和 `strict`。

    // 必填项
    "module": "esnext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,

    // 请参考你的打包工具的文档
    "customConditions": ["module"],

    // 推荐项
    "noEmit": true, // 或 `emitDeclarationOnly`
    "allowImportingTsExtensions": true,
    "allowArbitraryExtensions": true,
    "verbatimModuleSyntax": true, // 或 `isolatedModules`
  }
}
```

### 我正在编译并在 Node.js 中运行输出结果

请记得设置 `"type": "module"` 或者使用 `.mts` 文件，如果你打算生成 ES 模块。

```json5
{
  "compilerOptions": {
    // 这不是一个完整的模板；它只展示了相关的模块配置。
    // 请确保设置其他重要选项，如 `target`、`lib` 和 `strict`。

    // 必需的
    "module": "nodenext",

    // `"module": "nodenext"` 隐含了以下设置：
    // "moduleResolution": "nodenext",
    // "esModuleInterop": true,
    // "target": "esnext",

    // 推荐的设置
    "verbatimModuleSyntax": true,
  }
}
```

### 我正在使用 ts-node

ts-node 试图与可以用于[在 Node.js 中编译和运行 JS 输出](#im-compiling-and-running-the-outputs-in-node)的相同的代码和相同的 tsconfig.json 设置兼容。请参考 [ts-node 文档](https://typestrong.org/ts-node/)了解更多细节。

### 我正在使用 tsx

与 ts-node 默认情况下最小化修改 Node.js 的模块系统不同，[tsx](https://github.com/esbuild-kit/tsx) 的行为更像一个打包工具，允许无扩展名/index 模块规范，并且允许任意混合使用 ESM 和 CJS。对于 tsx，请使用与 [bundler 相同的设置](#我正在使用打包工具)。

### 我正在为浏览器编写 ES 模块，没有使用打包工具或模块编译器

目前，TypeScript 没有专门针对这种情况的选项，但是你可以通过使用 `nodenext` 的 ESM 模块解析算法和 `paths` 来近似实现，作为 URL 和导入映射支持的替代方案。

```json5
// tsconfig.json
{
  "compilerOptions": {
    // 这不是一个完整的模板；它仅展示与模块相关的设置。
    // 请确保设置其他重要选项，如`target`、`lib`和`strict`。

    // 结合本地 package.json 中的 `"type": "module"`，
    // 这将强制在相对路径导入上包含文件扩展名。
    "module": "nodenext",
    "paths": {
      // 将 TS 指向远程 URL 的本地类型声明：
      "https://esm.sh/lodash@4.17.21": ["./node_modules/@types/lodash/index.d.ts"],
      // 可选：将裸标识符导入指向空文件，以防止从未在此处列出的 node_modules 导入：
      "*": ["./empty-file.ts"]
    }
  }
}
```

这个设置允许明确列出的 HTTPS 导入使用本地安装的类型声明文件，同时在导入通常在 node_modules 中解析的情况下报错：

```ts
import {} from "lodash";
//             ^^^^^^^^
// 文件 '/project/empty-file.ts' 不是一个模块。ts(2306)
```

或者，你可以使用 [import maps](https://github.com/WICG/import-maps) 来明确地将一系列裸模块标识符映射到浏览器中的 URL，同时依赖于 `nodenext` 的默认 node_modules 查找，或者依赖于 `paths`，来指导 TypeScript 找到那些裸模块标识符导入的类型声明文件：

```html
<script type="importmap">
{
  "imports": {
    "lodash": "https://esm.sh/lodash@4.17.21"
  }
}
</script>
```

```ts
import {} from "lodash";
// 浏览器：https://esm.sh/lodash@4.17.21
// TypeScript：./node_modules/@types/lodash/index.d.ts
```

## 我正在撰写一个库

作为库的作者选择编译设置与作为应用程序的作者选择设置是完全不同的过程。当你编写应用程序时，你会根据运行时环境或打包工具（通常是具有已知行为的单一实体）来选择设置。而当你编写库时，理想情况下你会希望在*所有可能的*库使用者编译设置下测试你的代码。但由于这样做并不现实，你可以选择使用最严格的编译设置来进行测试，因为满足最严格的设置通常也就意味着能满足其他所有设置。

```json5
{
  "compilerOptions": {
    "module": "node16",
    "target": "es2020", // 设置为你支持的*最低*目标
    "strict": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "sourceMap": true,
    "declarationMap": true
  }
}
```

让我们来看看为什么选择了这些设置：

- **`module: "node16"`**。当一个代码库与 Node.js 的模块系统兼容时，它几乎总能在打包工具中正常工作。如果你使用第三方生成器来生成 ESM 输出，请确保在你的 package.json 中设置 `"type": "module"`，以便 TypeScript 将你的代码作为 ESM 进行检查。在 Node.js 中，ESM 使用比 CommonJS 更严格的模块解析算法。例如，让我们看看如果一个库使用 `"moduleResolution": "bundler"` 进行编译会发生什么：

  ```ts
  export * from "./utils";
  ```

  假设 `./utils.ts`（或 `./utils/index.ts`）存在，打包工具不会对这段代码有异议。如果使用 `"module": "esnext"` 进行编译，这个导出语句的输出 JavaScript 代码将与输入完全相同。如果将此 JavaScript 代码发布到 npm 上，它可以被使用打包工具的项目使用，但在 Node.js 中运行时会导致错误：

  ```
  Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../node_modules/dependency/utils' imported from .../node_modules/dependency/index.js
  Did you mean to import ./utils.js?
  ```

  另一方面，如果我们编写了：

  ```ts
  export * from "./utils.js";
  ```

  这将产生适用于 *Node.js* 和打包工具的输出代码。

  简而言之，`"moduleResolution": "bundler"` 是具有传染性的，允许生成仅在打包工具中有效的代码。同样地，`"moduleResolution": "nodenext"` 只检查输出是否在 Node.js 中有效，但在大多数情况下，适用于 Node.js 的模块代码也适用于其他运行时和打包工具。
- **``target: "es2020"``**。将此值设置为你打算支持的*最低* ECMAScript 版本，确保生成的代码不使用在较新版本中引入的语言特性。由于 `target` 还暗示了对应的 `lib` 值，这也确保你不会访问在旧环境中可能不可用的全局对象。
- **`strict: true`**。如果没有这个设置，你可能会编写类型级别的代码，该代码最终会出现在你的输出 `.d.ts` 文件中，并在使用者启用 `strict` 编译时报错。例如，以下 `extends` 子句：
  ```ts
  export interface Super {
    foo: string;
  }
  export interface Sub extends Super {
    foo: string | undefined;
  }
  ```
  只有在 `strictNullChecks` 下才会报错。另一方面，编写仅在 `strict` 被*禁用*时才会出错的代码非常困难，因此强烈建议库使用 `strict` 进行编译。
- **`verbatimModuleSyntax: true`**。该设置可以防止一些与模块相关的问题，这些问题可能会给库的使用者带来麻烦。首先，它阻止编写某些导入语句，这些语句根据用户的 `esModuleInterop` 或 `allowSyntheticDefaultImports` 的值可能会产生歧义。以前，库编译时尽量不要使用 `esModuleInterop`，因为在库中使用它可能会强制用户也采用该设置。然而，也存在仅在*没有* `esModuleInterop` 的情况下才能正常工作的导入语句，因此不管该设置设成什么值，都不能保证库的可移植性。`verbatimModuleSyntax` 则提供了这样的保证。[^1] 其次，它防止在以 CommonJS 形式输出的模块中使用 `export default`，这可能要求打包器用户和 Node.js ESM 用户以不同的方式使用该模块。有关更多详细信息，请参阅 [ESM/CJS Interop](/docs/handbook/modules/appendices/esm-cjs-interop.html#library-code-needs-special-considerations) 的附录部分。
- **`declaration: true`** 在输出的 JavaScript 旁边生成类型声明文件。库的使用者要想获取任何类型信息，都需要启用这个设置。
- **`sourceMap: true`** 和 **`declarationMap: true`** 分别为输出的 JavaScript 和类型声明文件生成源映射。这些只有在库还提供其源代码（`.ts` 文件）时才有用。通过提供源映射和源文件，库的使用者将能够更容易地调试库代码。通过提供声明映射和源文件，使用者者在将能够在对从库导入的语句运行 Go To Definition 后看到原始 TypeScript 源代码。这两者代表了开发者体验和库大小之间的权衡，因此是否包含它们取决于你。

### 打包库的考虑事项

如果你正在使用打包器来输出你的库，那么所有（非外部化的）导入都将由打包器以已知的行为进行处理，而不是由用户不可知的环境进行处理。在这种情况下，你可以使用 `"module": "esnext"` 和 `"moduleResolution": "bundler"`，但有两个注意事项：

1. TypeScript 无法模拟当一些文件被打包而另一些文件被外部化时的模块解析。在打包具有依赖关系的库时，通常将第一方库源代码打包到单个文件中，但将对外部依赖的导入留在打包输出中作为真正的导入。这实际上意味着模块解析在打包器和最终用户环境之间进行了分割。为了在 TypeScript 中对此进行建模，你需要使用 `"moduleResolution": "bundler"` 处理打包的导入，使用 `"moduleResolution": "nodenext"` 处理外部化的导入（或使用多个选项来检查在一系列最终用户环境中是否一切正常）。但是，TypeScript 无法配置为在同一编译中使用两个不同的模块解析设置。因此，使用 `"moduleResolution": "bundler"` 可能允许导入外部化的依赖项，在打包器中可以正常工作，但在 Node.js 中可能是不安全的。另一方面，使用 `"moduleResolution": "nodenext"` 可能会对打包的导入施加过于严格的要求。
2. 你必须确保你的声明文件也被打包在一起。回想一下[声明文件的首要原则](/zh/docs/handbook/modules/theory.html#the-role-of-declaration-files)：每个声明文件代表着一个 JavaScript 文件。如果你使用了 `"moduleResolution": "bundler"` 并且使用打包工具生成了一个 ESM（ECMAScript 模块）包，同时使用 `tsc` 来生成多个独立的声明文件，那么当在 `"module": "nodenext"` 下使用时，你的声明文件可能会导致错误。例如，以下输入文件：

   ```ts
   import { Component } from "./extensionless-relative-import";
   ```

   其中的导入语句将被 JavaScript 打包工具删除，但会生成一个具有相同导入语句的声明文件。然而，该导入语句在 Node.js 中包含一个无效的模块标识符，因为它缺少文件扩展名。对于 Node.js 用户来说，假设该依赖项会在运行时崩溃，那么 TypeScript 将会对声明文件报错，并将引用 `Component` 的类型感染为 `any`。

   如果你的 TypeScript 打包器没有生成打包的声明文件，请使用 `"moduleResolution": "nodenext"` 来确保在声明文件中保留的导入语句与最终用户的 TypeScript 设置兼容。更好的做法是考虑不要对你的库打包。

### 关于双重输出解决方案的注意事项

单个 TypeScript 编译（无论是输出还是仅进行类型检查）假设每个输入文件只会产生一个输出文件。即使 `tsc` 不进行输出，它对导入名称的类型检查也依赖于对输出文件在运行时行为的了解，这取决于在 tsconfig.json 中设置的模块和输出相关选项。虽然通常可以安全地将第三方输出器与 `tsc` 类型检查结合使用，只要 `tsc` 可以配置为理解其他输出器将要输出的内容，但是在仅进行一次类型检查的情况下输出两套不同模块格式的输出（至少）会导致其中一个输出未经检查。由于外部依赖项对 CommonJS 和 ESM 使用者公开的 API 可能不同，因此在单个编译中无法使用任何配置来保证两个输出都是类型安全的。实际上，大多数依赖项遵循最佳实践，并且双重输出是有效的。在发布之前，在所有输出的捆绑包上运行测试和[静态分析](https://npmjs.com/package/@arethetypeswrong/cli)可以显著降低未发现的严重问题的风险。

[^1]: 仅当 JS 输出器以 tsconfig.json、源文件扩展名和 package.json 的 `"type"` 给定的情况下，`tsc` 会输出的模块类型输出时，`verbatimModuleSyntax` 才能正常工作。该选项通过强制要求编写的 `import`/`require` 与输出的 `import`/`require` 完全相同来发挥作用。任何配置，如果其同时从同一源文件产生 ESM 和 CJS 输出，都与 `verbatimModuleSyntax` 不兼容，因为它的整个目的是防止你在任何会输出 `require` 的地方编写 `import`。`verbatimModuleSyntax` 可以通过配置一个第三方编译器来输出与 `tsc` 所不同的模块类型而被绕过。例如，在 tsconfig.json 中将 `"module"` 设置为 `"esnext"`，同时配置 Babel 以输出 CommonJS 模块。