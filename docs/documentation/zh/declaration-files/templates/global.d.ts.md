---
title: "Global .d.ts"
layout: docs
permalink: /zh/docs/handbook/declaration-files/templates/global-d-ts.html
---

## 全局库

<!-- 
TODO:

1. mention that global nearly always means 'browser'
2. if you have a global library that you suspect is UMD, look for instructions on
   a. how to import it
   b. -OR- how to make it work with webpack
3. Make the page follow the structure of documentation,usage,source example.

-->

全局库是可以从全局范围访问的库（即不使用任何形式的 `import`）。许多库只是简单地公开一个或多个全局变量供使用。例如，如果你正在使用 [jQuery](https://jquery.com/)，则可以通过简单地引用 `$` 变量来使用：

```ts
$(() => {
  console.log("你好！");
});
```

你通常会在全局库的文档中看到如何在 HTML 脚本标签中使用库的指导：

```html
<script src="http://a.great.cdn.for/someLib.js"></script>
```

如今，大多数流行的全局访问库实际上是以 UMD 库的形式编写的（请参见下文）。UMD 库文档很难与全局库文档区分开来。在编写全局声明文件之前，请确保库实际上不是 UMD。

## 从代码中识别全局库

全局库代码通常非常简单。一个全局的 "Hello, world" 库可能如下所示：

```js
function createGreeting(s) {
  return "你好，" + s;
}
```

或者像这样：

```js
window.createGreeting = function (s) {
  return "你好，" + s;
};
```

在查看全局库的代码时，你通常会看到：

- 顶层的 `var` 语句或 `function` 声明
- 一个或多个对 `window.someName` 的赋值
- 假设 DOM 原语如 `document` 或 `window` 存在

你*不会*看到：

- 检查或使用像 `require` 或 `define` 这样的模块加载器
- CommonJS/Node.js 风格的导入形式，如 `var fs = require("fs");`
- 调用 `define(...)`
- 描述如何 `require` 或导入库的文档

## 全局库示例

因为通常很容易将全局库转换为 UMD 库，所以很少有流行的库仍然以全局样式编写。但是，需要 DOM（或没有依赖性）的小型库可能仍然是全局的。
