---
title: 对 DOM 的操作
layout: docs
permalink: /zh/docs/handbook/dom-manipulation.html
oneline: 使用 TypeScript 操作 DOM
translatable: true
---

## 对 DOM 的操作

### _探索 `HTMLElement` 类型_

自从标准化以来的 20 多年里，JavaScript 已经取得了长足的进步。尽管在 2020 年，JavaScript 可以在服务器、数据科学甚至物联网设备上使用，但重要的是要记住它最广泛的应用场景：web 浏览器。

网站由 HTML 和/或 XML 文档组成。这些文档是静态的，不会改变。*文档对象模型（DOM）*是浏览器实现的一个编程接口，用于使静态网站变得可操作。DOM API 可用于更改文档结构、样式和内容。该 API 十分强大，强大到无数前端框架（jQuery、React 以及 Angular 等）都是围绕它开发的，其使得动态网站的开发变得更加容易。

TypeScript 是 JavaScript 的一个有类型的超集，它提供了 DOM API 的类型定义。这些定义在任何默认的 TypeScript 项目中都可以使用。在 _lib.dom.d.ts_ 的 两万多行定义中，有一个脱颖而出：`HTMLElement`。这个类型是使用 TypeScript 操作 DOM 的关键。

> 你可以探索 [DOM 类型定义](https://github.com/microsoft/TypeScript/blob/main/src/lib/dom.generated.d.ts)的源代码

## 基本示例

给定一个简化的 _index.html_ 文件：

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head><title>TypeScript DOM 操作</title></head>
  <body>
    <div id="app"></div>
    <!-- 假设 index.js 是 index.ts 的编译输出 -->
    <script src="index.js"></script>
  </body>
</html>
```

让我们探讨一个 TypeScript 脚本，该脚本将 `<p>Hello, World!</p>` 元素添加到 `#app` 元素中。

```ts
// 1. 使用 id 属性选择 div 元素
const app = document.getElementById("app");

// 2.以编程方式创建一个新的 <p></p> 元素
const p = document.createElement("p");

// 3. 添加文本内容
p.textContent = "Hello, World!";

// 4. 将 p 元素附加到 div 元素中
app?.appendChild(p);
```

编译并运行 _index.html_ 页面后，生成的 HTML 将为：

```html
<div id="app">
  <p>Hello, World!</p>
</div>
```

## `Document` 接口

TypeScript 代码的第一行使用了全局变量 `document`。检查这个变量显示它是由 _lib.dom.d.ts_ 文件中的 `Document` 接口定义的。代码片段包含对两个方法的调用：`getElementById` 和 `createElement`。

### `Document.getElementById`

该方法的定义如下：

```ts
getElementById(elementId: string): HTMLElement | null;
```

向它传递一个元素 id 字符串，它将返回 `HTMLElement` 或 `null`。这个方法引入了最重要的类型之一：`HTMLElement`。它是每个其他元素接口的基础接口。例如，代码示例中的 `p` 变量的类型为 `HTMLParagraphElement`。另外，请注意这个方法可能返回 `null`。这是因为该方法在运行时无法确定是否能找到指定的元素。在代码片段的最后一行，我们使用了新的*可选链接（optional chaining）*运算符来调用 `appendChild`。

### `Document.createElement`

这个方法的定义如下（我省略了*已弃用*的定义）:

```ts
createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K];
createElement(tagName: string, options?: ElementCreationOptions): HTMLElement;
```

这是一个重载的函数定义。第二个重载是最简单的，与 `getElementById` 方法的工作方式很相似。向它传递任何 `string`，它将返回标准的 HTMLElement。这个定义使开发者能够创建独特的 HTML 元素标签。

例如，`document.createElement('xyz')` 返回一个 `<xyz></xyz>` 元素，显然这不是 HTML 规范中指定的元素。

> 对于感兴趣的人来说，你可以使用 `document.getElementsByTagName` 与自定义标签元素进行交互。

对于 `createElement` 的第一个定义，它使用了一些高级的泛型模式。将其拆解成几小部分来分析会更容易理解，从泛型表达式开始: `<K extends keyof HTMLElementTagNameMap>`。这个表达式定义了一个泛型参数 `K`，它被*限制*为符合 `HTMLElementTagNameMap` 接口的键。这个映射接口包含了每个指定的 HTML 标签名及其对应的类型接口。例如，这里是前 5 个映射值：

```ts
interface HTMLElementTagNameMap {
    "a": HTMLAnchorElement;
    "abbr": HTMLElement;
    "address": HTMLElement;
    "applet": HTMLAppletElement;
    "area": HTMLAreaElement;
        ...
}
```

一些元素并没有独特的属性，因此它们只返回 `HTMLElement`，但其他类型确实有独特的属性和方法，所以它们返回特定的接口（这些接口将继承或实现 `HTMLElement`）。

现在，我们探索一下 `createElement` 定义的其余部分：`(tagName: K， options?: ElementCreationOptions): HTMLElementTagNameMap[K]`。第一个参数 `tagName` 被定义为泛型参数 `K`。TypeScript 解释器足够智能，能够从这个参数*推断*出泛型参数。这意味着开发者在使用这个方法时不必指定泛型参数；传递给 `tagName` 参数的任何值都将被推断为 `K`，因此可以在定义的其余部分中使用。实际情况也正是如此；返回值 `HTMLElementTagNameMap[K]` 获取 `tagName` 参数，并使用它返回相应的类型。这个定义就是代码片段中 `p` 变量获得 `HTMLParagraphElement` 类型的方式。如果代码是 `document.createElement('a')`，那么它将是 `HTMLAnchorElement` 类型的元素。

## `Node` 接口

`document.getElementById` 函数会返回 `HTMLElement`。`HTMLElement` 接口继承自 `Element` 接口，而 `Element` 又继承自 `Node` 接口。这种原型扩展允许所有 `HTMLElements` 使用一组标准方法的子集。在代码片段中，我们使用定义在 `Node` 接口上的属性来将新的 `p` 元素附加到网站上。

### `Node.appendChild`

代码片段的最后一行是 `app?.appendChild(p)`。前面的 `document.getElementById` 部分详细介绍了使用*可选链接*运算符的原因，因为 `app` 在运行时可能为 null。`appendChild` 方法的定义如下:

```ts
appendChild<T extends Node>(newChild: T): T;
```

这个方法的工作方式与 `createElement` 方法类似，因为泛型参数 `T` 是从 `newChild` 参数推断出来的。`T` 被*限制*为符合另一个基础接口 `Node`。

## `children` 和 `childNodes` 的区别

之前，本文详细介绍了 `HTMLElement` 接口继承自 `Element`，而 `Element` 又继承自 `Node`。在 DOM API 中，有一个称为*子级（children）*元素的概念。例如，在以下 HTML 中，`p` 标签是 `div` 元素的子级

```tsx
<div>
  <p>Hello, World</p>
  <p>TypeScript!</p>
</div>;

const div = document.getElementsByTagName("div")[0];

div.children;
// HTMLCollection(2) [p, p]

div.childNodes;
// NodeList(2) [p, p]
```

在获取 `div` 元素后，`children` 属性将返回一个包含 `HTMLParagraphElements` 的 `HTMLCollection` 列表。`childNodes` 属性将返回一个类似的包含节点的 `NodeList` 列表。每个 `p` 标签仍会是 `HTMLParagraphElements` 类型，但 `NodeList` 可以包含 `HTMLCollection` 列表无法包含的其他 *HTML节点*。

修改 HTML 代码，删除其中一个 `p` 标签，但保留文本内容。

```tsx
<div>
  <p>Hello, World</p>
  TypeScript!
</div>;

const div = document.getElementsByTagName("div")[0];

div.children;
// HTMLCollection(1) [p]

div.childNodes;
// NodeList(2) [p, text]
```

观察两个列表的变化。`children` 现在只包含 `<p>Hello， World</p>` 元素，而 `childNodes` 包含一个 `text` 节点，而不是两个 `p` 节点。`NodeList` 中的 `text` 部分是包含 `TypeScript!` 文本的 `Node`。`children` 列表中不包含这个 `Node`，因为它不被视为 `HTMLElement`。

## `querySelector` 和 `querySelectorAll` 方法

这两个方法都是很好的工具，可以获取符合更多独特约束条件的 DOM 元素列表。它们在 _lib.dom.d.ts_ 中定义如下：

```ts
/**
 * 返回 node 的后代中匹配选择器的第一个元素。
 */
querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
querySelector<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null;
querySelector<E extends Element = Element>(selectors: string): E | null;

/**
 * 返回 node 的所有后代元素中匹配选择器的元素。
 */
querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
querySelectorAll<K extends keyof SVGElementTagNameMap>(selectors: K): NodeListOf<SVGElementTagNameMap[K]>;
querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
```

`querySelectorAll` 的定义类似于 `getElementsByTagName`，不同之处在于它返回一个新的类型：`NodeListOf`。这个返回类型本质上是标准 JavaScript 列表元素的自定义实现。可以说，将 `NodeListOf<E>` 替换为 `E[]` 将会得到非常相似的用户体验。`NodeListOf` 只实现了以下属性和方法：`length`、`item(index)`、`forEach((value， key， parent) => void)` 和数字索引。此外，这个方法返回*元素*列表，而不是从 `.childNodes` 方法返回的*节点*列表。虽然这可能看起来有些矛盾，但请注意 `Element` 接口继承自 `Node` 接口。

要查看这些方法的实际应用，我们可以修改现有的代码如下:

```tsx
<ul>
  <li>第一个 :)</li>
  <li>第二个!</li>
  <li>第三个也不错。</li>
</ul>;

const first = document.querySelector("li"); // 返回第一个 li 元素
const all = document.querySelectorAll("li"); // 返回所有 li 元素的列表
```

## 想了解更多？

_lib.dom.d.ts_ 类型定义的最大好处就是它们反映了 Mozilla Developer Network (MDN) 文档网站中的类型注释。例如，`HTMLElement` 接口在 MDN 上有专门的 [HTMLElement 页面](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement)进行了记录。这些页面列出了所有可用的属性、方法，有时还会提供示例。这些页面的另一个优点是它们提供了指向相应标准文档的链接。这是 [W3C 对 HTMLElement 的建议](https://www.w3.org/TR/html52/dom.html#htmlelement)。

参考资料:

- [ECMA-262 标准](http://www.ecma-international.org/ecma-262/10.0/index.html)
- [DOM 简介](https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model/Introduction)
