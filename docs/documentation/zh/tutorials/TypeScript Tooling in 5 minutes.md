---
title: 5 分钟了解 TypeScript 工具
layout: docs
permalink: /zh/docs/handbook/typescript-tooling-in-5-minutes.html
oneline: 一个教程，帮助你了解如何使用 TypeScript 创建简单的网站
translatable: true
---

让我们从使用 TypeScript 构建一个简单的 Web 应用程序来开始。

## 安装 TypeScript

主要有两种方法可以将 TypeScript 添加到你的项目中：

- 通过 npm（Node.js 包管理器）
- 通过安装 TypeScript 的 Visual Studio 插件

Visual Studio 2017 和 Visual Studio 2015 Update 3 默认包含 TypeScript 语言支持，但不包含 TypeScript 编译器 `tsc`。如果你没有在 Visual Studio 中安装 TypeScript，还可以[下载它](/zh/download)。

对于 npm 用户：

```shell
> npm install -g typescript
```

## 构建你的第一个 TypeScript 文件

在你的编辑器中，输入以下 JavaScript 代码到 `greeter.ts` 文件中：

```ts twoslash
// @noImplicitAny: false
function greeter(person) {
  return "Hello, " + person;
}

let user = "Jane User";

document.body.textContent = greeter(user);
```

## 编译你的代码

虽然我们使用了 `.ts` 扩展名，但这段代码实际上是 JavaScript 代码。你可以直接从现有的 JavaScript 应用程序中复制/粘贴这段代码。

在命令行中运行 TypeScript 编译器：

```shell
tsc greeter.ts
```

结果会是一个名为 `greeter.js` 的文件，其中包含与输入相同的 JavaScript 代码。我们已经开始在 JavaScript 应用程序中使用 TypeScript 了！

现在，我们可以开始利用 TypeScript 提供的一些新工具了。向‘person’函数参数添加 `: string` 类型注解，如下所示：

```ts twoslash
function greeter(person: string) {
  return "Hello, " + person;
}

let user = "Jane User";

document.body.textContent = greeter(user);
```

## 类型注解

在 TypeScript 中，类型注解是一种轻量级的记录函数或变量预期约定的方式。在本例中，我们希望 greeter 函数只接收一个字符串参数。我们可以尝试更改 greeter 的调用，传递一个数组：

```ts twoslash
// @errors: 2345
function greeter(person: string) {
  return "Hello, " + person;
}

let user = [0, 1, 2];

document.body.textContent = greeter(user);
```

重新编译，你将会看到报错：

```shell
error TS2345: Argument of type 'number[]' is not assignable to parameter of type 'string'.
```

同样地，尝试删除 greeter 调用的所有实参。TypeScript 将会提醒你，你调用函数时使用的实参数量并非预期值。在这两种情况下，TypeScript 可以基于代码结构和提供的类型注解进行静态分析。

请注意，尽管存在错误，`greeter.js` 文件仍然被创建了。即使代码中存在错误，你仍然可以使用 TypeScript。但在这种情况下，TypeScript 会警告你，你的代码可能无法按预期运行。

## 接口

让我们进一步开发我们的示例。接下来我们使用一个接口来描述具有 `firstName` 和 `lastName` 字段的对象。在 TypeScript 中，只要两个类型的内部结构相互兼容，那么这两个类型就相互兼容。这使得我们可以通过使接口具有所需的结构来实现接口，而无需显式使用 `implements` 子句。

```ts twoslash
interface Person {
  firstName: string;
  lastName: string;
}

function greeter(person: Person) {
  return "Hello, " + person.firstName + " " + person.lastName;
}

let user = { firstName: "Jane", lastName: "User" };

document.body.textContent = greeter(user);
```

## 类

最后，让我们通过类进一步扩展示例。TypeScript 支持 JavaScript 的新特性，例如支持基于类的面向对象编程。

接下来，我们需要创建 `Student` 类，它具有一个构造函数和一些公共字段。需要注意的是，类和接口可以很好地配合使用，程序员借此可以决定哪种抽象级别合适。

另外需要注意的是，构造函数参数上的 `public` 关键字是一种简写形式，借此我们可以自动创建具有相同名称的属性。

```ts twoslash
class Student {
  fullName: string;
  constructor(
    public firstName: string,
    public middleInitial: string,
    public lastName: string
  ) {
    this.fullName = firstName + " " + middleInitial + " " + lastName;
  }
}

interface Person {
  firstName: string;
  lastName: string;
}

function greeter(person: Person) {
  return "Hello, " + person.firstName + " " + person.lastName;
}

let user = new Student("Jane", "M.", "User");

document.body.textContent = greeter(user);
```

重新运行 `tsc greeter.ts`，你会注意到新生成的 JavaScript 代码与之前的代码相同。TypeScript 中的类只是 JavaScript 中经常使用的基于原型的面向对象的一种简写形式。

## 运行你的 TypeScript Web 应用

现在在 `greeter.html` 中输入以下内容：

```html
<!DOCTYPE html>
<html>
  <head>
    <title>TypeScript Greeter</title>
  </head>
  <body>
    <script src="greeter.js"></script>
  </body>
</html>
```

在浏览器中打开 `greeter.html`，运行你的第一个简单的 TypeScript Web 应用程序！

可选项：在 Visual Studio 中打开 `greeter.ts`，或将代码复制到 TypeScript 演练场中。你可以将鼠标悬停在标识符上，查看它们的类型。注意，在某些情况下，这些类型会自动为你推断出来。重新输入最后一行，查看基于 DOM 元素类型的自动完成列表和参数帮助。将光标放在对 greeter 函数的引用上，按 F12 键跳转到其定义处。同时，注意你可以右键点击一个符号，然后使用重构工具重命名它。

类型信息加上工具的帮助，可以处理应用程序规模的 JavaScript。有关 TypeScript 的更多示例，请参阅本站的示例部分。

![Visual Studio 图片](/images/docs/greet_person.png)
