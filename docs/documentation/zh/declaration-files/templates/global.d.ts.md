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

## 全局库模板

以下是一个示例类型定义（Type Definitions, DTS）：

```ts
// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: [~THE PROJECT NAME~]
// Definitions by: [~YOUR NAME~] <[~A URL FOR YOU~]>

/*~ 如果这个库可以调用（例如，可以像 myLib(3) 一样调用），
 *~ 请在这里包含这些调用签名。
 *~ 否则，删除此部分。
 */
declare function myLib(a: string): string;
declare function myLib(a: number): number;

/*~ 如果你想让这个库的名称成为一个有效的类型名称，
 *~ 你可以在这里这样做。
 *~
 *~ 例如，这允许我们写 'var x: myLib'；
 *~ 确保这实际上是有意义的！如果没有意义，删除此声明并
 *~ 在下面的命名空间中添加类型。
 */
interface myLib {
  name: string;
  length: number;
  extras?: string[];
}

/*~ 如果你的库有在全局变量上暴露的属性，
 *~ 请在这里放置它们。
 *~ 你还应该在这里放置类型（接口和类型别名）。
 */
declare namespace myLib {
  //~ 我们可以写 'myLib.timeout = 50;'
  let timeout: number;

  //~ 我们可以访问 'myLib.version'，但不能更改它
  const version: string;

  //~ 有一个类可以通过 'let c = new myLib.Cat(42)' 创建
  //~ 或引用，例如 'function f(c: myLib.Cat) { ... }'
  class Cat {
    constructor(n: number);

    //~ 我们可以从 'Cat' 实例中读取 'c.age'
    readonly age: number;

    //~ 我们可以从 'Cat' 实例中调用 'c.purr()'
    purr(): void;
  }

  //~ 我们可以将变量声明为
  //~   'var s: myLib.CatSettings = { weight: 5, name: "Maru" };'
  interface CatSettings {
    weight: number;
    name: string;
    tailLength?: number;
  }

  //~ 我们可以写 'const v: myLib.VetID = 42;'
  //~  或 'const v: myLib.VetID = "bob";'
  type VetID = string | number;

  //~ 我们可以调用 'myLib.checkCat(c)' 或 'myLib.checkCat(c, v);'
  function checkCat(c: Cat, s?: VetID);
}
```
