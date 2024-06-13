---
title: 为 .js 文件创建 .d.ts 文件
layout: docs
permalink: /zh/docs/handbook/declaration-files/dts-from-js.html
oneline: "如何为 JavaScript 项目添加 d.ts 生成"
translatable: true
---

[TypeScript 3.7](/zh/docs/handbook/release-notes/typescript-3-7.html#--declaration-和---allowjs)增加了使用 JSDoc 语法为 JavaScript 生成 .d.ts 文件的支持。

这一设置意味着你可以拥有 TypeScript 编辑器的编辑体验，而无需将项目移植到 TypeScript，也无需在代码库中维护 .d.ts 文件。TypeScript 支持大部分 JSDoc 标签，你可以在[这里](/zh/docs/handbook/type-checking-javascript-files.html#支持的-jsdoc)找到参考。

## 设置项目以生成 .d.ts 文件

要在项目中添加 .d.ts 文件的创建，你最多需要执行四个步骤:

- 将 TypeScript 添加到你的开发依赖项中
- 添加一个 `tsconfig.json` 来配置 TypeScript
- 运行 TypeScript 编译器以为 JS 文件生成相应的 d.ts 文件
- （可选）编辑你的 package.json 以引用类型

### 添加 TypeScript

你可以在我们的[安装页面](/zh/download)上了解如何操作。

### TSConfig

TSConfig 是一个 jsonc 文件，用于配置编译器标志和声明文件位置。在这种情况下，你需要一个类似以下的文件：

```jsonc tsconfig
{
  // 将此更改以匹配你的项目
  "include": ["src/**/*"],

  "compilerOptions": {
    // 告诉 TypeScript 读取 JS 文件，因为
    // 通常它们被忽略为源文件
    "allowJs": true,
    // 生成 d.ts 文件
    "declaration": true,
    // 此编译器运行应
    // 只输出 d.ts 文件
    "emitDeclarationOnly": true,
    // 类型应该进入此目录。
    // 删除它会将 .d.ts 文件放置在
    // 与 .js 文件相邻的位置
    "outDir": "dist",
    // 在使用 IDE 功能时转到 js 文件，如
    // VSCode 中的"转到定义"
    "declarationMap": true
  }
}
```

你可以在 [tsconfig 参考](/zh/tsconfig)中了解有关选项的更多信息。使用 CLI 是另一种替代 TSConfig 文件的方法，这与 CLI 命令的行为是相同的。

```sh
npx -p typescript tsc src/**/*.js --declaration --allowJs --emitDeclarationOnly --outDir types
```

## 运行编译器

你可以在我们的[安装页面](/zh/download)上了解如何操作。如果你在项目的 `.gitignore` 中包含了这些文件，请确保它们包含在你的软件包中。

## 编辑 package.json

TypeScript 在 `package.json` 中复制 node 模块解析，并额外添加了查找 .d.ts 文件的步骤。大致来说，解析会先检查可选的 `types` 字段，然后检查 `"main"` 字段，最后尝试在根目录下查找 `index.d.ts`。

| Package.json              | 默认 .d.ts 文件位置        |
| :------------------------ | :----------------------------- |
| 没有“types”字段          | 检查“main”，然后 index.d.ts |
| “types”: “main.d.ts”      | main.d.ts                      |
| “types”: “./dist/main.js” | ./dist/main.d.ts               

如果不存在，则使用 "main"

| Package.json             | 默认 .d.ts 文件位置 |
| :----------------------- | :------------------------ |
| 没有“main”字段          | index.d.ts                |
| “main”:“index.js”        | index.d.ts                |
| “main”:“./dist/index.js” | ./dist/index.d.ts         |

## 小技巧

如果你想为 .d.ts 文件编写测试，可以尝试使用 [tsd](https://github.com/SamVerschueren/tsd)。
