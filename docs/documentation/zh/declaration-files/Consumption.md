---
title: Consumption
layout: docs
permalink: /zh/docs/handbook/declaration-files/consumption.html
oneline: "如何下载 .d.ts 文件以供你的项目使用"
---

## 下载

你只需 npm 即可获取类型声明。

例如，仅需以下命令即可获得类似 lodash 这样库的声明文件

```cmd
npm install --save-dev @types/lodash
```

值得注意的是，如果 npm 包已经包含其声明文件，如[发布](/zh/docs/handbook/declaration-files/publishing.html)中所述，那么不需要下载相应的 `@types` 包。

## 使用

之后，你就可以在 TypeScript 代码中轻松使用 lodash。这适用于模块和全局代码。

例如，一旦你通过 `npm install` 安装了类型声明，你就可以使用导入并编写

```ts
import * as _ from "lodash";
_.padStart("Hello TypeScript!", 20, " ");
```

或者，如果你不使用模块，你可以直接使用全局变量 `_`。

```ts
_.padStart("Hello TypeScript!", 20, " ");
```

## 搜索

在大多数情况下，类型声明包的名称应与 `npm` 上的包名称相同，但前缀为 `@types/`，但如果需要，你可以使用 [Yarn 包搜索](https://yarnpkg.com/)来查找你喜欢的库的包。

> 注意：如果你正在搜索的声明文件不存在，你可以随时贡献并帮助下一个寻找它的开发人员。
> 请参阅 DefinitelyTyped 的[贡献指南页面](https://definitelytyped.org/guides/contributing.html)以获取详细信息。"
