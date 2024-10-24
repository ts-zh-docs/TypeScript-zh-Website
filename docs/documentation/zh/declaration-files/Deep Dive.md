---
title: 深入探讨
layout: docs
permalink: /zh/docs/handbook/declaration-files/deep-dive.html
oneline: "深入解析 d.ts 文件如何工作"
---

## 声明文件理论：深入探讨

构建模块以提供所需的精确 API 结构可能会相当复杂。例如，我们可能希望一个模块既可以在有 `new` 也可以在没有 `new` 的情况下被调用，以生成不同的类型，并且在层次结构中提供多种命名类型，同时还在模块对象上包含一些属性。

通过阅读本指南，你将掌握编写复杂声明文件的技巧，从而提供友好的 API 接口。本指南专注于模块（或 UMD）库，因为它们更加灵活，选择更多。

## 关键概念

通过理解一些 TypeScript 的关键概念，你可以完全理解如何进行各种结构的声明。

### 类型

如果你在阅读本指南，你可能已经大致了解 TypeScript 中的类型。更明确地说，*类型（type）*是通过以下方式引入的：

- 类型别名声明（`type sn = number | string;`）
- 接口声明（`interface I { x: number[]; }`）
- 类声明（`class C { }`）
- 枚举声明（`enum E { A, B, C }`）
- 引用类型的 `import` 声明

这些声明形式中的每一种都创建了新的类型名称。

### 值

和类型一样，你可能已经理解了值是什么。值是我们在表达式中可以引用的运行时名称。例如，`let x = 5;` 创建了一个名为 `x` 的值。

同样，明确地说，以下内容会创建值：

- `let`、`const` 和 `var` 声明
- 包含值的 `namespace` 或 `module` 声明
- 枚举声明
- 类声明
- 引用值的 `import` 声明
- 函数声明

### 命名空间

类型可以存在于*命名空间*中。例如，如果我们声明 `let x: A.B.C`，我们会说类型 `C` 来自于 `A.B` 命名空间。

这种区别是微妙而重要的——在这里，`A.B` 不一定是一个类型或一个值。

## 简单组合：一个名称，多种含义

给定一个名称 `A`，我们可能会发现 `A` 有多达三种不同的含义：类型、值或命名空间。名称的解释取决于它所使用的上下文。例如，在声明 `let m: A.A = A;` 中，`A` 首先用作命名空间，然后用作类型名称，最后用作值。这些含义可能最终指向完全不同的声明！

这可能会令人困惑，但只要我们不滥用，它实际上非常方便。让我们看看这种组合行为的一些有用方面。

### 内置组合

敏锐的读者会注意到，例如，`class` 在*类型*和*值*列表中都出现过。声明 `class C { }` 创建了两个东西：一个*类型* `C`，指的是类的实例结构，以及一个*值* `C`，指的是类的构造函数。枚举声明的行为类似。

### 用户组合

假设我们写了一个模块文件 `foo.d.ts`：

```ts
export var SomeVar: { a: SomeType };
export interface SomeType {
  count: number;
}
```

然后使用它：

```ts
import * as foo from "./foo";
let x: foo.SomeType = foo.SomeVar.a;
console.log(x.count);
```

这样工作得很好，但我们可能想象 `SomeType` 和 `SomeVar` 非常密切相关，以至于希望它们有相同的名称。我们可以使用组合将这两个不同的对象（值和类型）以相同的名称 `Bar` 展现出来：

```ts
export var Bar: { a: Bar };
export interface Bar {
  count: number;
}
```

这为使用其的代码中的解构提供了很好的机会：

```ts
import { Bar } from "./foo";
let x: Bar = Bar.a;
console.log(x.count);
```

同样，我们在这里将 `Bar` 用作了类型和值。请注意，我们不需要将 `Bar` 值声明为 `Bar` 类型——它们是独立的。

## 高级组合

某些类型的声明可以跨多个声明进行组合。例如，`class C { }` 和 `interface C { }` 可以共存，并且都可以向 `C` 类型贡献属性。

只要不产生冲突，这样的组合是合法的。一般来说，值总是与同名的其他值冲突，除非它们被声明为 `namespace`；而类型如果用类型别名声明（`type s = string`）则会冲突，命名空间之间则永远不会冲突。

让我们看看如何使用这一点。

### 使用 `interface` 添加成员

我们可以通过一个 `interface` 声明向另一个 `interface` 添加额外的成员：

```ts
interface Foo {
  x: number;
}
// ... 在其他地方 ...
interface Foo {
  y: number;
}
let a: Foo = ...;
console.log(a.x + a.y); // OK
```

这同样适用于类：

```ts
class Foo {
  x: number;
}
// ... 在其他地方 ...
interface Foo {
  y: number;
}
let a: Foo = ...;
console.log(a.x + a.y); // OK
```

请注意，我们不能使用接口向类型别名（`type s = string;`）添加成员。

### 使用 `namespace` 添加成员

`namespace` 声明可以用来以不产生冲突的方式添加新的类型、值和命名空间。

例如，我们可以向类添加一个静态成员：

```ts
class C {}
// ... 在其他地方 ...
namespace C {
  export let x: number;
}
let y = C.x; // OK
```

请注意，在这个例子中，我们向 `C` 的*静态*部分（其构造函数）添加了一个值。这是因为我们添加了一个*值*，而所有值的容器是另一个值（类型由命名空间包含，命名空间又由其他命名空间包含）。

我们也可以向类添加命名空间类型：

```ts
class C {}
// ... 在其他地方 ...
namespace C {
  export interface D {}
}
let y: C.D; // OK
```

在这个例子中，在我们为 `C` 编写 `namespace` 声明之前，并没有命名空间 `C`。`C` 作为命名空间的含义与由类创建的值或类型 `C` 的含义不冲突。

最后，我们可以使用 `namespace` 声明进行多种不同的合并。虽然这不是一个特别现实的例子，但展示了各种有趣的行为：

```ts
namespace X {
  export interface Y {}
  export class Z {}
}

// ... 在其他地方 ...
namespace X {
  export var Y: number;
  export namespace Z {
    export class C {}
  }
}
type X = string;
```

在这个例子中，第一个块创建了以下名称含义：

- 一个值 `X`（因为 `namespace` 声明包含一个值 `Z`）
- 一个命名空间 `X`（因为 `namespace` 声明包含一个类型 `Y`）
- 一个在 `X` 命名空间中的类型 `Y`
- 一个在 `X` 命名空间中的类型 `Z`（类的实例结构）
- 一个作为 `X` 值属性的值 `Z`（类的构造函数）

第二个块创建了以下名称含义：

- 一个值 `Y`（类型为 `number`），是 `X` 值的属性
- 一个命名空间 `Z`
- 一个作为 `X` 值属性的值 `Z`
- 一个在 `X.Z` 命名空间中的类型 `C`
- 一个作为 `X.Z` 值属性的值 `C`
- 一个类型 `X`
