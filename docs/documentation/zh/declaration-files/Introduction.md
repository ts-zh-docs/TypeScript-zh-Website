---
title: 介绍
layout: docs
permalink: /zh/docs/handbook/declaration-files/introduction.html
oneline: "如何编写高质量的 TypeScript 声明文件 (d.ts)"
---

声明文件部分旨在教你如何编写高质量的 TypeScript 声明文件。开始前，我们假设你对 TypeScript 语言有基本的了解。

如果还没有，你应该先阅读[TypeScript 手册](/docs/handbook/2/basic-types.html)以熟悉基本概念，尤其是类型和模块。

学习 .d.ts 文件如何工作的最常见情况是，你需要为一个没有类型的 npm 包添加类型定义。
在这种情况下，你可以直接跳转到[Modules .d.ts](/docs/handbook/declaration-files/templates/module-d-ts.html).

声明文件部分分为以下几个章节。

## [声明参考](/docs/handbook/declaration-files/by-example.html)

我们常常需要在只有底层库示例的情况下编写声明文件。
[声明参考](/docs/handbook/declaration-files/by-example.html)部分展示了许多常见的 API 模式，以及如何为每个模式编写声明。
本指南面向 TypeScript 新手，他们可能还不熟悉 TypeScript 中的所有语言结构。

## [库结构](/docs/handbook/declaration-files/library-structures.html)

[库结构](/docs/handbook/declaration-files/library-structures.html)部分帮助你理解常见的库格式，以及如何为每种格式编写合适的声明文件。
如果你正在编辑现有文件，可能不需要阅读本部分。
强烈建议新声明文件的作者阅读本部分，以正确理解库的格式如何影响声明文件的编写。

在模板部分，你会发现一些声明文件，它们可以作为编写新文件时的有用起点。如果你已经知道自己的结构，请参阅侧边栏中的 d.ts 模板部分。

## [注意事项](/docs/handbook/declaration-files/do-s-and-don-ts.html)

许多常见的声明文件错误都可以轻松避免。
[注意事项](/docs/handbook/declaration-files/do-s-and-don-ts.html)部分列出了常见错误，描述了如何检测它们，以及如何解决它们。
每个人都应该阅读此部分，以帮助自己避免常见错误。

## [深入研究](/docs/handbook/declaration-files/deep-dive.html)

对于有经验的作者，如果想了解声明文件的底层工作机制，
[深入研究](/docs/handbook/declaration-files/deep-dive.html)部分解释了声明文件编写中的许多高级概念，以及如何利用这些概念创建更简洁、更直观的声明文件。

## [发布到 npm](/docs/handbook/declaration-files/publishing.html)

[发布](/docs/handbook/declaration-files/publishing.html)部分介绍了如何将声明文件发布到 npm 包，并展示了如何管理依赖包。

## [查找和安装声明文件](/docs/handbook/declaration-files/consumption.html)

对于 JavaScript 库用户来说，[使用](/docs/handbook/declaration-files/consumption.html)部分提供了几个简单的步骤来查找和安装相应的声明文件。
