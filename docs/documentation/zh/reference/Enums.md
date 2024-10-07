---
title: Enums
layout: docs
permalink: /zh/docs/handbook/enums.html
oneline: TypeScript enum 是如何工作的
handbook: "true"
---

枚举是 TypeScript 具有的少数几个不是在 JavaScript 的类型方面扩展的特性之一。

- 借助枚举，开发者可以定义一组命名常量。
- 使用枚举可以更容易地记录意图，或创建一组不同的用例。
- TypeScript 提供了基于数字和基于字符串的枚举。

## 数字枚举

我们首先从数字枚举开始，如果你以前用过其他语言，可能会比较熟悉这种类型。你可以使用 `enum` 关键字来定义枚举。

```ts twoslash
enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}
```

在上面的例子中，我们有一个数字枚举，其中 `Up` 被初始化为 `1`。从那开始，所有后续成员都会自动递增。换句话说，`Direction.Up` 的值是 `1`，`Down` 的值是 `2`，`Left` 的值是 `3`，`Right` 的值是 `4`。

如果我们愿意，我们可以完全省略初始化声明：

```ts twoslash
enum Direction {
  Up,
  Down,
  Left,
  Right,
}
```

在这里，`Up` 的值是 `0`，`Down` 的值是 `1`，以此类推。这种自动递增的行为在我们可能不关心成员值本身，但确保每个值与同一枚举中的其他值不同的情况下非常有用。

枚举很容易使用：只需将任何成员作为枚举本身的属性访问，并使用枚举的名称声明类型：

```ts twoslash
enum UserResponse {
  No = 0,
  Yes = 1,
}

function respond(recipient: string, message: UserResponse): void {
  // ...
}

respond("卡罗琳公主", UserResponse.Yes);
```

数字枚举可以与[计算成员和常量成员（见下文）](#计算成员和常量成员) 混合使用。简单来说，没有初始化声明的枚举要么需要放在首位，要么必须在使用数字常量或其他常量枚举成员初始化的数字枚举之后。换句话说，以下情况是不允许的：

```ts twoslash
// @errors: 1061
const getSomeValue = () => 23;
// ---cut---
enum E {
  A = getSomeValue(),
  B,
}
```

## 字符串枚举

字符串枚举概念类似，但它有一些微妙的[运行时差异](#enums-at-runtime)（在稍后的内容中有介绍）。在字符串枚举中，每个成员都必须使用字符串字面量或另一个字符串枚举成员进行常量初始化。

```ts twoslash
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}
```

虽然字符串枚举没有自动递增的行为，但字符串枚举的好处在于它们能很好地“序列化”。换句话说，如果你在调试时必须读取数字枚举的运行时值，该值通常是不透明的——它本身不传达任何有用的含义（尽管 [反向映射](#反向映射)通常会有所帮助）。字符串枚举允许在代码运行时为你提供有意义且可读的值，而不依赖于枚举成员本身的名称。

## 异构枚举

从技术上讲，枚举可以将字符串和数字成员混合在一起，但不清楚为什么你会希望这样做：

```ts twoslash
enum BooleanLikeHeterogeneousEnum {
  No = 0,
  Yes = "YES",
}
```

除非你真的想以某种巧妙的方式利用 JavaScript 的运行时行为，否则建议你不要这样做。

## 计算和常量成员

每个枚举成员都与一个值相关联，该值可以是*常量*或*计算出来*的。如果一个枚举成员满足以下条件之一，则它会被认为是常量：

- 它是枚举中的第一个成员，并且没有初始化器，在这种情况下，它被赋予值 `0`：

  ```ts twoslash
  // E.X 是常量:
  enum E {
    X,
  }
  ```

- 它没有初始化器，并且前一个枚举成员是一个*数字*常量。在这种情况下，当前枚举成员的值将是前一个枚举成员的值加一。

  ```ts twoslash
  // ‘E1’和‘E2’中的所有枚举成员都是常量。

  enum E1 {
    X,
    Y,
    Z,
  }

  enum E2 {
    A = 1,
    B,
    C,
  }
  ```

- 枚举成员使用常量枚举表达式进行初始化。常量枚举表达式是 TypeScript 表达式的一个子集，可以在编译时完全评估。如果表达式是以下情况之一，则它是常量枚举表达式：

  1. 字面枚举表达式（基本上是字符串字面量或数字字面量）
  2. 引用先前定义的常量枚举成员（可以来自不同的枚举）
  3. 带括号的常量枚举表达式
  4. 应用于常量枚举表达式的 `+`, `-`, `~` 一元运算符
  5. 带有常量枚举表达式作为操作数的 `+`, `-`, `*`, `/`, `%`, `<<`, `>>`, `>>>`, `&`, `|`, `^` 二元运算符

  对于常量枚举表达式被评估为 `NaN` 或 `Infinity` 是编译时错误。

在所有其他情况下，枚举成员被视为计算出来的。

```ts twoslash
enum FileAccess {
  // 常量成员
  None,
  Read = 1 << 1,
  Write = 1 << 2,
  ReadWrite = Read | Write,
  // 计算成员
  G = "123".length,
}
```

## 联合枚举和枚举成员类型

有一种特殊的常量枚举成员子集不是计算出来的：字面枚举成员。字面枚举成员是一个没有初始化值的常量枚举成员，或者初始化为以下值的常量枚举成员：

- 任何字符串字面量（例如 `"foo"`, `"bar"`, `"baz"`）
- 任何数字字面量（例如 `1`, `100`）
- 应用于任何数字字面量的一元减号（例如 `-1`, `-100`）

当枚举中的所有成员都具有字面枚举值时，一些特殊的语义就会出现。

首先是枚举成员也变成了类型！例如，我们可以说某些成员*只能*拥有枚举成员的值：

```ts twoslash
// @errors: 2322
enum ShapeKind {
  Circle,
  Square,
}

interface Circle {
  kind: ShapeKind.Circle;
  radius: number;
}

interface Square {
  kind: ShapeKind.Square;
  sideLength: number;
}

let c: Circle = {
  kind: ShapeKind.Square,
  radius: 100,
};
```

另一个变化是枚举类型本身实际上成为每个枚举成员的“联合”。通过使用联合枚举，类型系统能够利用其对枚举值集的确切了解。因此，TypeScript 可以捕捉到我们可能不合理地比较值的错误。

例如：

```ts twoslash
// @errors: 2367
enum E {
  Foo,
  Bar,
}

function f(x: E) {
  if (x !== E.Foo || x !== E.Bar) {
    //
  }
}
```

在这个例子中，我们首先检查 `x` 是否*不是* `E.Foo`。如果这个检查成功，那么我们的 `||` 将不会运行，并且‘if’的主体将运行。但是，如果检查不成功，那么 `x` 只能是 `E.Foo`，因此看它是否*不等于* `E.Bar` 是没有意义的。

## 运行时的枚举

枚举是实际存在于运行时的真实对象。例如，以下枚举

```ts twoslash
enum E {
  X,
  Y,
  Z,
}
```

实际上可以传递给函数

```ts twoslash
enum E {
  X,
  Y,
  Z,
}

function f(obj: { X: number }) {
  return obj.X;
}

// 可以工作，因为‘E’有一个名为‘X’的属性，其值是一个数字。
f(E);
```

## 编译时的枚举

尽管枚举是实际存在于运行时的真实对象，但 `keyof` 关键字在处理枚举时与你对典型对象的预期有所不同。相反，使用 `keyof typeof` 可以获得一个表示所有枚举键的字符串类型。

```ts twoslash
enum LogLevel {
  ERROR,
  WARN,
  INFO,
  DEBUG,
}

/**
 * 这等同于:
 * type LogLevelStrings = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
 */
type LogLevelStrings = keyof typeof LogLevel;

function printImportant(key: LogLevelStrings, message: string) {
  const num = LogLevel[key];
  if (num <= LogLevel.WARN) {
    console.log("Log level key is:", key);
    console.log("Log level value is:", num);
    console.log("Log level message is:", message);
  }
}
printImportant("ERROR", "This is a message");
```

### 反向映射

除了为成员创建具有属性名称的对象之外，数字枚举成员还会获得从枚举值到枚举名称的*反向映射*。例如，在这个例子中:

```ts twoslash
enum Enum {
  A,
}

let a = Enum.A;
let nameOfA = Enum[a]; // "A"
```

TypeScript 将其编译为以下 JavaScript 代码：

```ts twoslash
// @showEmit
enum Enum {
  A,
}

let a = Enum.A;
let nameOfA = Enum[a]; // "A"
```

在这个生成的代码中，枚举被编译为一个对象，该对象存储着正向（`名称` -> `值`）和反向（`值` -> `名称`）的映射。对其他枚举成员的引用总是作为属性访问发出，而不会内联。

请记住，字符串枚举成员*不会*生成反向映射。

### `const` 枚举

在大多数情况下，枚举是一个完全有效的解决方案。但有时候需求更为严格。为了避免在访问枚举值时付出额外生成的代码成本和额外的间接性，可以使用 `const` 枚举。使用 `const` 修饰符定义我们的枚举，如下所示：

```ts twoslash
const enum Enum {
  A = 1,
  B = A * 2,
}
```

`const` 枚举只能使用常量枚举表达式，与常规枚举不同，在编译过程中完全移除了 `const` 枚举。`const` 枚举成员在使用处被内联。这是因为 `const` 枚举不能有计算成员。

```ts twoslash
const enum Direction {
  Up,
  Down,
  Left,
  Right,
}

let directions = [
  Direction.Up,
  Direction.Down,
  Direction.Left,
  Direction.Right,
];
```

在生成的代码中将变为

```ts twoslash
// @showEmit
const enum Direction {
  Up,
  Down,
  Left,
  Right,
}

let directions = [
  Direction.Up,
  Direction.Down,
  Direction.Left,
  Direction.Right,
];
```

#### 常量枚举的陷阱

首先，内联枚举值在一开始看起来很简单，但实际上存在微妙的影响。这些陷阱仅适用于*环境*常量枚举（基本上是 `.d.ts` 文件中的常量枚举）以及在项目之间共享它们，但如果你发布或使用 `.d.ts` 文件，这些陷阱可能会影响你，因为 `tsc --declaration` 将 `.ts` 文件转换为 `.d.ts` 文件。

1. 出于 [`isolatedModules` 文档](/tsconfig#references-to-const-enum-members)中阐述的原因，该模式与环境常量枚举在根本上是不兼容的。
   这意味着，如果你发布环境常量枚举，下游使用者将无法同时使用 [`isolatedModules`](/tsconfig#isolatedModules) 和这些枚举值。
2. 在编译时，你可以轻松地内联依赖项版本 A 的值，并在运行时导入版本 B。如果你不非常小心，版本 A 和 B 的枚举可以具有不同的值，导致[令人惊讶的错误](https://github.com/microsoft/TypeScript/issues/5219#issue-110947903)，例如执行`if`语句时选择错误的分支。这些错误尤为恶劣，因为通常在构建项目时几乎同时运行自动化测试，使用相同的依赖项版本，这会完全忽略这些错误。

3. [`importsNotUsedAsValues: "preserve"`](/tsconfig#importsNotUsedAsValues) 不会删除用作值的常量枚举的导入，但环境常量枚举不保证运行时存在`.js`文件。无法解析的导入会导致运行时错误。目前，消除导入的通常方法，[仅限类型导入](/docs/handbook/modules/reference.html#type-only-imports-and-exports)，[不允许使用常量枚举值](https://github.com/microsoft/TypeScript/issues/40344)。

以下是避免这些陷阱的两种方法：

1. 完全不使用常量枚举。你可以借助代码检查工具轻松地[禁用常量枚举](https://typescript-eslint.io/linting/troubleshooting#how-can-i-ban-specific-language-feature)。显然，这样可以避免任何与常量枚举相关的问题，但会阻止项目内联自己的枚举。与从其他项目内联枚举不同，内联项目自己的枚举并不会存在问题，并且会影响性能。
2. 不要发布环境常量枚举，而是通过[`preserveConstEnums`](/tsconfig#preserveConstEnums) 将其转换为非常量枚举。这是[TypeScript 项目本身](https://github.com/microsoft/TypeScript/pull/5422)内部采取的方法。[`preserveConstEnums`](/tsconfig#preserveConstEnums) 会为常量枚举生成与普通枚举相同的 JavaScript 代码。然后，你可以安全地从构建步骤中的`.d.ts`文件中删除`const`修饰符[（示例见此处）](https://github.com/microsoft/TypeScript/blob/1a981d1df1810c868a66b3828497f049a944951c/Gulpfile.js#L144)。

   这样，下游消费者将不会内联你项目中的枚举，避免上述的陷阱，但项目仍然可以内联自己的枚举，不像完全禁止使用常量枚举那样。

## 环境枚举

环境枚举用于描述已存在的枚举类型的特征。

```ts twoslash
declare enum Enum {
  A = 1,
  B,
  C = 2,
}
```

环境枚举和非环境枚举之间一个重要的区别在于，在常规枚举中，如果成员没有初始化，则会被视为常量（如果前一个枚举成员被视为常量）。相比之下，环境（非常量）枚举成员如果没有初始化则始终被视为计算出来的。

## 对象与枚举对比

在现代 TypeScript 中，当一个带有 `as const` 的对象可以胜任时，你可能不需要枚举：

```ts twoslash
const enum EDirection {
  Up,
  Down,
  Left,
  Right,
}

const ODirection = {
  Up: 0,
  Down: 1,
  Left: 2,
  Right: 3,
} as const;

EDirection.Up;
//         ^?

ODirection.Up;
//         ^?

// 将枚举用作参数
function walk(dir: EDirection) {}

// 需要额外的一行来提取值
type Direction = typeof ODirection[keyof typeof ODirection];
function run(dir: Direction) {}

walk(EDirection.Left);
run(ODirection.Right);
```

这种格式比 TypeScript 的 `enum` 更有利的最大论点是，它使你的代码库与 JavaScript 的状态保持一致，而且当 JavaScript 添加枚举时，你可以切换到额外的语法。
