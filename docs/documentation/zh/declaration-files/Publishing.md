---
title: 发布
layout: docs
permalink: /zh/docs/handbook/declaration-files/publishing.html
oneline: 如何向用户提供 d.ts 文件
---

现在你已经按照本指南的步骤编写了声明文件，是时候将其发布到 npm 上了。主要有两种方式可以将你的声明文件发布到 npm：

1. 将其与你的 npm 包捆绑在一起。
2. 将其发布到 npm 上的 [@types 组织](https://www.npmjs.com/~types)。

如果你的类型是由源代码生成的，请与源代码一起发布这些类型。TypeScript 和 JavaScript 项目都可以通过 [`declaration`](/zh/tsconfig#declaration) 生成类型。

否则，我们建议将这些类型提交到 DefinitelyTyped，DefinitelyTyped 将会将它们发布到 npm 上的 `@types` 组织中。

## 在你的 npm 包中包含声明文件

如果你的包有一个主要的 `.js` 文件，你需要在你的 `package.json` 文件中指定主要的声明文件。将 `types` 属性设置为指向捆绑的声明文件。例如：
     
```json
{
  "name": "awesome",
  "author": "Vandelay Industries",
  "version": "1.0.0",
  "main": "./lib/main.js",
  "types": "./lib/main.d.ts"
}
```

请注意，`"typings"` 字段与 `types` 同义，也可以使用。

## 依赖

所有依赖关系由 npm 管理。确保你所依赖的所有声明包在你的 `package.json` 文件的 `"dependencies"` 部分中得到适当标记。例如，假设我们编写了一个使用 Browserify 和 TypeScript 的包。

```json
{
  "name": "browserify-typescript-extension",
  "author": "Vandelay Industries",
  "version": "1.0.0",
  "main": "./lib/main.js",
  "types": "./lib/main.d.ts",
  "dependencies": {
    "browserify": "latest",
    "@types/browserify": "latest",
    "typescript": "next"
  }
}
```

在这里，我们的包依赖于 `browserify` 和 `typescript` 包。`browserify` 没有将其声明文件与其 npm 包捆绑在一起，因此我们需要依赖于 `@types/browserify` 来获取其声明。另一方面，`typescript` 包含其声明文件，因此不需要任何额外的依赖。

我们的包在每个包中公开了声明，因此我们的 `browserify-typescript-extension` 包的任何用户也需要具有这些依赖项。因此，我们使用了 `"dependencies"` 而不是 `"devDependencies"`，否则我们的消费者将需要手动安装这些包。如果我们只是编写了一个命令行应用程序，而不希望我们的包被用作库，那么我们可以使用 `devDependencies`。

## 标识

### `/// <reference path="..." />`

在你的声明文件中*不要*使用 `/// <reference path="..." />`。

```ts
/// <reference path="../typescript/lib/typescriptServices.d.ts" />
....
```

相反，*要*使用 `/// <reference types="..." />`。

```ts
/// <reference types="typescript" />
....
```

确保查看[消耗依赖项](/zh/docs/handbook/declaration-files/library-structures.html#consuming-dependencies) 部分以获取更多信息。

### 打包依赖声明

如果你的类型定义依赖于另一个包：

- *不要*将其与你的包合并在一起，保持每个包在自己的文件中。
- *不要*复制在你的包中的声明。
- 如果它没有将其声明文件打包在一起，*要*依赖于 npm 类型声明包。

## 使用 `typesVersions` 进行版本选择

当 TypeScript 打开一个 `package.json` 文件以确定需要读取的文件时，首先查看一个名为 `typesVersions` 的字段。

#### 文件夹重定向（使用 `*`）

具有 `typesVersions` 字段的 `package.json` 可能如下所示：

```json
{
  "name": "package-name",
  "version": "1.0.0",
  "types": "./index.d.ts",
  "typesVersions": {
    ">=3.1": { "*": ["ts3.1/*"] }
  }
}
```

这个 `package.json` 告诉 TypeScript 首先检查当前版本的 TypeScript。如果是 3.1 或更高版本，TypeScript 将查找你相对于包导入的路径，并从包的 `ts3.1` 文件夹中读取。

这就是 `{ "*": ["ts3.1/*"] }` 的含义——如果你熟悉[路径映射](/zh/tsconfig#paths)，它的工作方式与此相同。

在上面的示例中，如果我们导入 `"package-name"`，TypeScript 将尝试在 TypeScript 3.1 运行时从 `[...]/node_modules/package-name/ts3.1/index.d.ts`（以及其他相关路径）解析。如果我们导入 `package-name/foo`，TypeScript 将尝试查找 `[...]/node_modules/package-name/ts3.1/foo.d.ts` 和 `[...]/node_modules/package-name/ts3.1/foo/index.d.ts`。

在这个示例中，如果我们没有在 TypeScript 3.1 中运行会发生什么呢？如果 `typesVersions` 中没有任何字段匹配，TypeScript 将退回到 `types` 字段，因此在这里，TypeScript 3.0 及更早版本将被重定向到 `[...]/node_modules/package-name/index.d.ts`。

#### 文件重定向

当你只想一次更改单个文件的解析时，你可以通过传递确切的文件名告诉 TypeScript 差异性地解析文件：

```json
{
  "name": "package-name",
  "version": "1.0.0",
  "types": "./index.d.ts",
  "typesVersions": {
    "<4.0": { "index.d.ts": ["index.v3.d.ts"] }
  }
}
```

在 TypeScript 4.0 及更高版本中，对 `"package-name"` 的导入将解析为 `./index.d.ts`，而对于 3.9 及以下版本则解析为 `"./index.v3.d.ts"`。

请注意，重定向仅影响包的*外部* API；`typesVersions` 不会影响项目内的导入解析。例如，前面示例中包含 `import * as foo from "./index"` 的 `d.ts` 文件仍将映射到 `index.d.ts`，而另一个导入 `import * as foo from "package-name"` 的包将获取 `index.v3.d.ts`。

## 匹配行为

TypeScript 通过使用 Node 的 [semver 范围](https://github.com/npm/node-semver#ranges)来决定编译器和语言版本是否匹配。

## 多个字段

`typesVersions` 可以支持多个字段，其中每个字段名称由要匹配的范围指定。

```json tsconfig
{
  "name": "package-name",
  "version": "1.0",
  "types": "./index.d.ts",
  "typesVersions": {
    ">=3.2": { "*": ["ts3.2/*"] },
    ">=3.1": { "*": ["ts3.1/*"] }
  }
}
```

由于范围有可能重叠，确定应用哪个重定向是有序的。这意味着在上面的示例中，即使 `>=3.2` 和 `>=3.1` 匹配器都支持 TypeScript 3.2 及更高版本，但颠倒顺序可能会有不同的行为，因此上面的示例将不等同于以下内容。

```jsonc tsconfig
{
  "name": "package-name",
  "version": "1.0",
  "types": "./index.d.ts",
  "typesVersions": {
    // 注意：这样做不起作用！
    ">=3.1": { "*": ["ts3.1/*"] },
    ">=3.2": { "*": ["ts3.2/*"] }
  }
}
```

## 发布至 [@types](https://www.npmjs.com/~types)

[@types](https://www.npmjs.com/~types) 组织下包是通过 [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) 使用 [types-publisher 工具](https://github.com/microsoft/DefinitelyTyped-tools/tree/master/packages/publisher) 自动发布的。要将你的声明发布为 @types 包，请向 [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) 提交拉取请求。你可以在[贡献指南页面](https://definitelytyped.github.io/guides/contributing.html)中找到更多详细信息。
