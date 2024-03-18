# TypeScript 中文文档

TypeScript 中文文档源码仓库。

### 环境配置

请先配置好 [TypeScript-Website](https://github.com/ts-zh-docs/TypeScript-Website)。对于本仓库你应该使用 Node 16.x 完成以下操作：

```sh
yarn
yarn pull-en
```

### 翻译是如何运作的？ 

通过具有匹配文件路径的特定语言文件来处理翻译：

例如：`/packages/documentation/copy/en/reference/JSX.md` 对应的路径应该是 `/packages/documentation/copy/zh/reference/JSX.md`.

本翻译的 release notes 部分来自于 @zhongsp 的[翻译](https://github.com/zhongsp/TypeScript)，在此向他表示感谢。
