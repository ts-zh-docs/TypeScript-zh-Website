---
title: 面向函数式编程者的 TypeScript
short: 面向函数式编程者的 TypeScript
layout: docs
permalink: /zh/docs/handbook/typescript-in-5-minutes-func.html
oneline: 如果你有函数式编程背景，就来学习 TypeScript 吧
---

TypeScript 最初的目的是为 JavaScript 引入传统的面向对象类型系统，以便微软的程序员能够将传统的面向对象程序带到 web 上。随着其发展，TypeScript 的类型系统已经演化为更好地模拟原生 JavaScript 开发者编写的代码。最终其拥有一个强大、有趣且复杂的体系。

本介绍面向具有 Haskell 或 ML 编程背景的从业者，旨在介绍 TypeScript 的类型系统如何与 Haskell 的类型系统不同。本介绍还描述了 TypeScript 类型系统中由于模拟 JavaScript 代码而产生的独特特性。

本介绍不涉及面向对象编程。在实践中，TypeScript 中的面向对象程序与其他流行语言中的面向对象程序类似。

## 前提条件

在本介绍中，我们假定你已经具备以下知识：

- 使用 JavaScript 的核心部分进行编程。
- C 系列语言的类型语法。

如果你需要学习 JavaScript 的核心部分，请阅读[JavaScript 语言精粹](https://shop.oreilly.com/product/9780596517748.do)。如果你知道如何在一个以调用值为基础、词法作用域的语言中编程（这种语言具有大量的可变性而没有太多其他特性），那么你或许可以跳过这本书。[R<sup>4</sup>RS Scheme](https://people.csail.mit.edu/jaffer/r4rs.pdf) 就是一个很好的例子。

要学习 C 风格的类型声明语法，[C++ 编程语言](http://www.stroustrup.com/4th.html)是一个不错的选择。与 C++ 不同，TypeScript 使用后缀类型注解，例如 `x: string`，而不是 `string x`。

## Haskell 中不存在的概念

### 内置类型

JavaScript 定义了 8 种内置类型：

| 类型         | 说明                                     |
| ----------- | ---------------------------------------- |
| `Number`    | 双精度 IEEE 754 浮点数。                  |
| `String`    | 不可变的 UTF-16 字符串。                  |
| `BigInt`    | 以任意精度格式表示的整数。                 |
| `Boolean`   | `true` 和 `false`。                      |
| `Symbol`    | 唯一值，通常用作键。                      |
| `Null`      | 相当于单元类型。                          |
| `Undefined` | 也相当于单元类型。                        |
| `Object`    | 类似于记录。                             |

[请参见 MDN 页面以了解更多详细信息](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures)。

TypeScript 有相应的基本类型来对应这些内置类型：

- `number`
- `string`
- `bigint`
- `boolean`
- `symbol`
- `null`
- `undefined`
- `object`

#### TypeScript 的其他重要类型

| 类型           | 说明                                                                        |
| -------------- | ------------------------------------------------------------------------ |
| `unknown`      | 顶级类型。                                                                  |
| `never`        | 底层类型。                                                                  |
| 对象字面量     | 例如 `{ property: Type }`                                                   |
| `void`         | 无记录返回值的函数                                                           |
| `T[]`          | 可变数组，也可以写为 `Array<T>`                                               |
| `[T, T]`       | 元组，长度固定但可变                                                          |
| `(t: T) => U`  | 函数                                                                       |

注意：

1. 函数语法包括参数名称。这让人很难习惯！

   ```ts
   let fst: (a: any, b: any) => any = (a, b) => a;

   // 或更精确地：

   let fst: <T, U>(a: T, b: U) => T = (a, b) => a;
   ```

2. 对象字面量类型语法与对象字面量值语法非常相似：

   ```ts
   let o: { n: number; xs: object[] } = { n: 1, xs: [] };
   ```

3. `[T, T]` 是 `T[]` 的子类型。这不同于 Haskell，在 Haskell 中元组与列表无关。

#### 装箱类型

JavaScript 有基本类型的装箱等价物，包含程序员得以与这些类型相关联的方法。TypeScript 也反映了这一点，例如基本类型 `number` 和装箱类型 `Number` 之间的区别。装箱类型很少需要，因为它们的方法会返回基本类型。

```ts
(1).toExponential();
// 等价于
Number.prototype.toExponential.call(1);
```

请注意，要想用数字字面量调用方法，你需要将其括在括号中，以帮助解析器解析。

### 渐进式类型

TypeScript 使用类型 `any` 来表示任何它无法确定表达式类型的地方。与 `Dynamic` 相比，称 `any` 为类型是一种过度陈述。它只是在任何出现的地方关闭了类型检查器。例如，你可以将任何值推入 `any[]` 而不需要以任何方式标记该值：

```ts twoslash
// 在 tsconfig.json 中设置“noImplicitAny: false”，anys: any[]
const anys = [];
anys.push(1);
anys.push("oh no");
anys.push({ anything: "goes" });
```

并且你可以在任何地方使用类型为 `any` 的表达式：

```ts
anys.map(anys[1]); // oh no，“oh no”不是一个函数
```

`any` 也具有传染性——如果你用一个类型为 `any` 的表达式初始化一个变量，那么该变量也具有类型 `any`。

```ts
let sepsis = anys[0] + anys[1]; // 这可能意味着任何东西
```

要在 TypeScript 产生 `any` 时报错，请在 `tsconfig.json` 中设置 `"noImplicitAny": true` 或 `"strict": true`。

### 结构类型

结构类型是大多数函数式编程语言的一个常见概念，尽管 Haskell 和大多数 ML 语言都不是结构类型。它的基本形式非常简单：

```ts
// @strict: false
let o = { x: "hi", extra: 1 }; // 可以
let o2: { x: string } = o; // 可以
```

这里，对象字面量 `{ x: "hi", extra: 1 }` 有一个匹配的字面量类型 `{ x: string, extra: number }`。这种类型可以赋值给 `{ x: string }`，因为它包含了所有必需的属性，并且这些属性的类型是可赋值的。额外的属性并不会阻止赋值，它只是使它成为 `{ x: string }` 的子类型。

命名类型只是给类型一个名称；从可赋值性角度来说，下面的类型别名 `One` 和接口类型 `Two` 之间没有差异。它们都有属性 `p: string`。（类型别名和接口在递归定义和类型参数方面的行为是不同的。）

```ts twoslash
// @errors: 2322
type One = { p: string };
interface Two {
  p: string;
}
class Three {
  p = "Hello";
}

let x: One = { p: "hi" };
let two: Two = x;
two = new Three();
```

### 联合类型

在 TypeScript 中，联合类型是无标签的。换句话说，它们不是像 Haskell 中的 `data` 一样的判别式联合类型。然而，你通常可以使用内置的标签或其他属性来区分联合类型中的类型。

```ts twoslash
function start(
  arg: string | string[] | (() => string) | { s: string }
): string {
  // 这在 JavaScript 中非常常见
  if (typeof arg === "string") {
    return commonCase(arg);
  } else if (Array.isArray(arg)) {
    return arg.map(commonCase).join(",");
  } else if (typeof arg === "function") {
    return commonCase(arg());
  } else {
    return commonCase(arg.s);
  }

  function commonCase(s: string): string {
    // 最后，只需将字符串转换为另一个字符串
    return s;
  }
}
```

`string`、`Array` 和 `Function` 都有内置的类型谓词，可以方便地将对象类型留给 `else` 分支。但是，也可能生成难以在运行时区分的联合类型。对于新的代码，最好只构建判别式联合类型。

以下类型有内置的谓词：

| 类型       | 谓词                               |
| --------- | ---------------------------------- |
| string    | `typeof s === "string"`            |
| number    | `typeof n === "number"`            |
| bigint    | `typeof m === "bigint"`            |
| boolean   | `typeof b === "boolean"`           |
| symbol    | `typeof g === "symbol"`            |
| undefined | `typeof undefined === "undefined"` |
| function  | `typeof f === "function"`          |
| array     | `Array.isArray(a)`                 |
| object    | `typeof o === "object"`            |

请注意，函数和数组在运行时也是对象，但有自己的谓词。

#### 交叉类型

除了联合类型，TypeScript 还有交叉类型：

```ts twoslash
type Combined = { a: number } & { b: string };
type Conflicting = { a: number } & { a: string };
```

`Combined` 有两个属性 `a` 和 `b`，就像它们被写在一个对象字面量类型中一样。如果存在冲突，交叉和联合是递归的，所以 `Conflicting.a: number & string`。

### 单元类型

单元类型是基本类型的子类型，只包含一个基本值。例如，字符串 `"foo"` 的类型是 `"foo"`。由于 JavaScript 没有内置的枚举，通常使用一组众所周知的字符串代替。字符串字面量类型的联合允许 TypeScript 对此模式进行类型化：

```ts twoslash
declare function pad(s: string, n: number, direction: "left" | "right"): string;
pad("hi", 10, "left");
```

当需要时，编译器会将单元类型*扩展*（即转换为超类型）到原始类型，例如 `"foo"` 到 `string`。这在使用可变性时会发生，可能会妨碍一些可变变量的使用：

```ts twoslash
// @errors: 2345
declare function pad(s: string, n: number, direction: "left" | "right"): string;
// ---cut---
let s = "right";
pad("hi", 10, s); // 错误： ‘string’不可赋值给‘"left" | "right"’
```

错误发生的原因如下：

- `"right": "right"`
- `s: string` 因为在赋值给可变变量时，`"right"` 会扩展为 `string`。
- `string` 不可分配给 `"left" | "right"`

你可以用类型注解解决这个问题，但这反过来又会阻止将不是 `"left" | "right"` 类型的变量赋值给 `s`。

```ts twoslash
declare function pad(s: string, n: number, direction: "left" | "right"): string;
// ---cut---
let s: "left" | "right" = "right";
pad("hi", 10, s);
```

## Haskell 类似的概念

### 上下文类型推断

TypeScript 有一些明显可以推断类型的地方，比如变量声明：

```ts twoslash
let s = "I'm a string!";
```

但它也会在一些你可能没有预料到的地方推断类型，如果你之前使用过其他 C 语法的语言：

```ts twoslash
declare function map<T, U>(f: (t: T) => U, ts: T[]): U[];
let sns = map((n) => n.toString(), [1, 2, 3]);
```

这里，`n: number` 在这个例子中也是这样，尽管 `T` 和 `U` 在调用之前还没有被推断出来。事实上，在 `[1,2,3]` 被用来推断 `T=number` 之后，`n => n.toString()` 的返回类型被用来推断 `U=string`，导致 `sns` 的类型为 `string[]`。

请注意，推断会以任何顺序工作，但 intellisense 只会从左到右工作，所以 TypeScript 更倾向于将 `map` 声明为数组在前：

```ts twoslash
declare function map<T, U>(ts: T[], f: (t: T) => U): U[];
```

上下文类型推断还可以递归地在对象字面量中工作，并推断出原本会被推断为 `string` 或 `number` 的单元类型。它还可以通过上下文推断返回类型：

```ts twoslash
declare function run<T>(thunk: (t: T) => void): T;
let i: { inference: string } = run((o) => {
  o.inference = "INSERT STATE HERE";
});
```

`o` 的类型被确定为 `{ inference: string }`，因为：

1. 声明初始化程序的上下文类型由声明的类型确定：`{ inference: string }`。
2. 调用的返回类型使用上下文类型进行推断，所以编译器推断 `T={ inference: string }`。
3. 箭头函数使用上下文类型来类型化它们的参数，所以编译器给出 `o: { inference: string }`。

这一切都是在你键入时进行的，所以在键入 `o.` 之后，你会得到 `inference` 属性的补全，以及任何其他你在真实程序中会有的属性。总的来说，这个特性可以使 TypeScript 的类型推断看起来有点像一个统一的类型推断引擎，但它并不是这样。

### 类型别名

类型别名只是一个别名，就像 Haskell 中的 `type`。编译器会尝试在源代码中使用别名名称，但并不总是成功。

```ts twoslash
type Size = [number, number];
let x: Size = [101.1, 999.9];
```

最接近 `newtype` 的是 _tagged 交集_：

```ts
type FString = string & { __compileTimeOnly: any };
```

`FString` 就像一个普通的字符串，只是编译器认为它有一个名为 `__compileTimeOnly` 的属性，实际上并不存在。这意味着 `FString` 仍然可以被赋值给 `string`，但反过来却不行。

### 辨别联合类型

最接近 `data` 的是带有辨别属性的类型联合，通常称为 TypeScript 中的辨别联合：

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; x: number }
  | { kind: "triangle"; x: number; y: number };
```

与 Haskell 不同，标签或辨别符只是每个对象类型中的一个属性。每个变体都有一个相同的属性，但单元类型不同。这仍然是一个普通的联合类型；前面的 `|` 是联合类型语法中的可选部分。你可以使用普通的 JavaScript 代码来区分联合的成员：

```ts twoslash
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; x: number }
  | { kind: "triangle"; x: number; y: number };

function area(s: Shape) {
  if (s.kind === "circle") {
    return Math.PI * s.radius * s.radius;
  } else if (s.kind === "square") {
    return s.x * s.x;
  } else {
    return (s.x * s.y) / 2;
  }
}
```

请注意，`area` 的返回类型被推断为 `number`，因为 TypeScript 知道该函数是完整的。如果没有涵盖某个变体，`area` 的返回类型将是 `number | undefined`。

另外，与 Haskell 不同，公共属性出现在任何联合中，所以你可以有效区分联合的多个成员：

```ts twoslash
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; x: number }
  | { kind: "triangle"; x: number; y: number };
// ---cut---
function height(s: Shape) {
  if (s.kind === "circle") {
    return 2 * s.radius;
  } else {
    // s.kind: "square" | "triangle"
    return s.x;
  }
}
```

### 类型参数

与大多数 C 系语言一样，TypeScript 需要声明类型参数：

```ts
function liftArray<T>(t: T): Array<T> {
  return [t];
}
```

这里没有大小写要求，但是类型参数通常使用单个大写字母。类型参数也可以被限制为某种类型，这有点像类型类约束：

```ts
function firstish<T extends { length: number }>(t1: T, t2: T): T {
  return t1.length > t2.length ? t1 : t2;
}
```

TypeScript 通常可以根据参数的类型推断出类型参数，所以通常不需要指定类型参数。

由于 TypeScript 是结构化的，它不像名义系统那样需要大量使用类型参数。具体来说，不需要使用类型参数来使一个函数具有多态性。类型参数应该只用于*传播*类型信息，比如限制参数必须是相同的类型：

```ts
function length<T extends ArrayLike<unknown>>(t: T): number {}

function length(t: ArrayLike<unknown>): number {}
```

在第一个 `length` 中，T 是不必要的；请注意，它只被引用了一次，所以它不用于限制返回值或其他参数的类型。

#### 高阶类型

TypeScript 没有高阶类型，所以以下代码是无效的：

```ts
function length<T extends ArrayLike<unknown>, U>(m: T<U>) {}
```

#### 无点编程

在 JavaScript 中，无点编程（大量使用柯里化和函数组合）是可行的，但可能会很冗长。在 TypeScript 中，无点编程的类型推断往往会失败，所以最终你虽然不需要指定值参数，但需要指定类型参数。结果太冗长了，所以通常最好避免使用无点编程。

### 模块系统

JavaScript 的现代模块语法有点类似 Haskell，只不过任何包含 `import` 或 `export` 的文件都是一个模块：

```ts
import { value, Type } from "npm-package";
import { other, Types } from "./local-package";
import * as prefix from "../lib/third-package";
```

你也可以导入 CommonJS 模块（使用 Node.js 模块系统编写的模块）：

```ts
import f = require("single-function-package");
```

你可以使用导出列表导出：

```ts
export { f };

function f() {
  return g();
}
function g() {} // g 没有被导出
```

或者将每个导出单独标记：

```ts
export function f() { return g() }
function g() { }
```

后一种方式更常见，但两种方式都可行的，甚至在单个文件中可以同时使用。

### `readonly` 和 `const`

在 JavaScript 中，可变性是默认的，尽管它允许使用 `const` 进行变量声明（其声明*引用*是不可变的），但引用的内容仍然是可变的：

```js
const a = [1, 2, 3];
a.push(102); // ):
a[0] = 101; // D:
```

TypeScript 还有一个 `readonly` 修饰符用来修饰属性。

```ts
interface Rx {
  readonly x: number;
}
let rx: Rx = { x: 1 };
rx.x = 12; // 错误
```

它还附带映射类型 `Readonly<T>`，可以将所有属性设置为 `readonly`：

```ts
interface X {
  x: number;
}
let rx: Readonly<X> = { x: 1 };
rx.x = 12; // 错误
```

它还有一个特定的 `ReadonlyArray<T>` 类型，可以移除有副作用的方法，并防止写入数组索引，同时这种类型的特殊的语法也会移除：

```ts
let a: ReadonlyArray<number> = [1, 2, 3];
let b: readonly number[] = [1, 2, 3];
a.push(102); // 错误
b[0] = 101; // 错误
```

你也可以使用 const 断言，它可以作用于数组和对象字面量：

```ts
let a = [1, 2, 3] as const;
a.push(102); // 错误
a[0] = 101; // 错误
```

但是，这些选项都不是默认的，所以在 TypeScript 代码中并不总是一致地使用。

### 下一步

本文档是日常代码中使用的语法和类型的概述。之后你应该：

- [从头到尾](/zh/docs/handbook/intro.html)阅读完整的手册
- 探索[演练场的示例](/play#show-examples)
