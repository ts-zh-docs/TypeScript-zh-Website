---
title: Babel 搭配 TypeScript
layout: docs
permalink: /zh/docs/handbook/babel-with-typescript.html
oneline: 如何创建一个 Babel + TypeScript 的混合项目
translatable: true
---

## Babel 与 `tsc` 在 TypeScript 中的应用

当你要开发一个现代化的 JavaScript 项目时，你可能会问自己该如何将 TypeScript 文件转换为 JavaScript 文件?

很多时候，答案可能是*“这要看情况”*或*“这可能已经由某人决定了”*，这取决于你的项目。如果你正在使用像 [tsdx](https://tsdx.io)、[Angular](https://angular.io/)、[NestJS](https://nestjs.com/) 或[入门指南](/zh/docs/home) 中提到的任何框架来构建你的项目，那么这个决定将由你来做出。

但是，我们可以给出一个有用的启发式规则：

- 如果你的构建输出与源文件基本相同，那么使用 `tsc`。
- 如果你需要一个具有多种潜在输出的构建流水线，那么使用 `babel` 进行转译，使用 `tsc` 进行类型检查。

## 使用 Babel 进行转译，使用 `tsc` 进行类型检查

这是一种常见的模式，适用于已经从 JavaScript 代码库移植到 TypeScript 的项目，并且具有现有的构建基础设施。

这种方法是一种混合方法，使用 Babel 的 [preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript) 生成 JS 文件，然后使用 TypeScript 进行类型检查和 `.d.ts` 文件生成。

通过使用 Babel 对 TypeScript 的支持，你可以与现有的构建管道进行交互，并且 JS 输出的速度可能会更快，因为 Babel 不会对你的代码进行类型检查。

#### 类型检查和 .d.ts 文件生成

使用 Babel 的缺点是，你在从 TS 转换到 JS 的过程中不会进行类型检查。这意味着在编辑器中没有捕获到的类型错误可能会进入生产代码中。

此外，Babel 无法为你的 TypeScript 创建 `.d.ts` 文件，这可能会使你的项目（如果它是一个库）更难使用。

为了解决这些问题，你可能需要设置一个命令来使用 TSC 对你的项目进行类型检查。这可能意味着将你的 Babel 配置的一些内容复制到一个相应的 [`tsconfig.json`](/zh/tsconfig) 中，并确保启用以下标志：

```json tsconfig
"compilerOptions": {
  // 确保 tsc 生成 .d.ts 文件,而不是 .js 文件
  "declaration": true,
  "emitDeclarationOnly": true,
  // 确保 Babel 可以安全地转译 TypeScript 项目中的文件
  "isolatedModules": true
}
```

有关这些标志的更多信息：

- [`isolatedModules`](/zh/tsconfig#isolatedModules)
- [`declaration`](/zh/tsconfig#declaration), [`emitDeclarationOnly`](/zh/tsconfig#emitDeclarationOnly)
