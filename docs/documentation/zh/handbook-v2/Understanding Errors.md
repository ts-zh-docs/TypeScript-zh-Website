---
title: 理解错误
layout: docs
permalink: /zh/docs/handbook/2/understanding-errors.html
oneline: "如何阅读 TypeScript 错误信息"
---

# 理解错误

每当 TypeScript 发现错误时，它会尽可能详细地解释出错的原因。由于 TypeScript 的类型系统是结构化的，这通常意味着提供对问题出现位置的详细描述。

## 术语

在错误信息中，你会经常看到一些术语，理解这些术语对于我们有所帮助。

#### _assignable to_

如果一个类型可以接受另一个类型作为替代，TypeScript 就认为这后者可以赋值给前者。换句话说，如果 `Cat` 可以作为 `Animal` 的替代，那么 `Cat` 就可以赋值给 `Animal`。

正如其名称所示，这种关系用于检查赋值 `t = s;` 的有效性，这通过检查 `t` 和 `s` 的类型完成。它还用于检查大多数其他的两个类型交互的情况。例如，在调用函数时，每个实参的类型必须是可赋值给参数的声明类型的。

非正式地说，如果你看到 `T is not assignable to S`，你可以理解为 TypeScript 在说“`T` 和 `S` 不兼容”。但是需要注意的是，这是一种*单向*关系：`S` 可以赋值给 `T` 并不意味着 `T` 可以赋值给 `S`。

## 示例

让我们看一些示例错误消息，并理解其中发生了什么。

### 错误详细信息

每个错误都以一个主要的消息开头，有时会跟随更多的子消息。你可以将每个子消息看作是对上面消息的一个“为什么？”的回答。让我们通过一些示例来看看它们在实践中是如何工作的。

这是一个产生比示例本身还长的错误消息的示例：

```ts twoslash
// @errors: 2322
let a: { m: number[] };
let b = { m: [""] };
a = b;
```

TypeScript 在检查最后一行时发现了一个错误。它发出错误的逻辑遵循于确定赋值是否正确的逻辑：

1. `b` 的类型是否可以赋值给 `a` 的类型？否。为什么？
2. 因为 `m` 属性的类型不兼容。为什么？
3. 因为 `b` 的 `m` 属性（`string[]`）不能赋值给 `a` 的 `m` 属性（`number[]`）。为什么？
4. 因为一个数组的元素类型（`string`）不能赋值给另一个（`number`）。

### 额外属性

```ts twoslash
// @errors: 2322
type A = { m: number };
const a: A = { m: 10, n: "" };
```

### 联合类型赋值

```ts twoslash
// @errors: 2322
type Thing = "none" | { name: string };

const a: Thing = { name: 0 };
```
