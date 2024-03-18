---
title: TypeScript 5.3
layout: docs
permalink: /zh/docs/handbook/release-notes/typescript-5-3.html
oneline: TypeScript 5.3 Release Notes
---

## 导入属性（Import Attributes）

TypeScript 5.3 支持了最新的 [import attributes](https://github.com/tc39/proposal-import-attributes) 提案。

该特性的一个用例是为运行时提供期望的模块格式信息。

```ts
// We only want this to be interpreted as JSON,
// not a runnable/malicious JavaScript file with a `.json` extension.
import obj from "./something.json" with { type: "json" };
```

TypeScript 不会检查属性内容，因为它们是宿主环境相关的。
TypeScript 会原样保留它们，浏览器和运行时会处理它们。

```ts
// TypeScript is fine with this.
// But your browser? Probably not.
import * as foo from "./foo.js" with { type: "fluffy bunny" };
```

动态的 `import()` 调用也可以在第二个参数里使用该特性。

```ts
const obj = await import('./something.json', {
  with: { type: 'json' },
});
```

第二个参数的期望类型为 `ImportCallOptions`，默认只支持一个名为 `with` 的属性。

请注意，导入属性是之前提案[“导入断言”](https://devblogs.microsoft.com/typescript/announcing-typescript-4-5/#import-assertions)的演进，该提案已在 TypeScript 4.5 中实现。
最明显的区别是使用`with`关键字而不是`assert`关键字。
但不太明显的区别是，现在运行时可以自由地使用属性来指导导入路径的解析和解释，而导入断言只能在加载模块后断言某些特性。

随着时间的推移，TypeScript 将逐渐弃用旧的导入断言语法，转而采用导入属性的提议语法。现有的使用`assert`的代码应该迁移到`with`关键字。而需要导入属性的新代码应该完全使用`with`关键字。

感谢 Oleksandr Tarasiuk 实现了这个功能！
也感谢 Wenlu Wang 实现了 import assertions!

## 稳定支持 `import type` 上的 `resolution-mode`

TypeScript 4.7 在 `/// <reference types="..." />` 里支持了 `resolution-mode` 属性，
它用来控制一个描述符是使用 `import` 还是 `require` 语义来解析。

```ts
/// <reference types="pkg" resolution-mode="require" />

// or

/// <reference types="pkg" resolution-mode="import" />
```

在 type-only 导入上，导入断言也引入了相应的字段；
然而，它仅在 TypeScript 的夜间版本中得到支持
其原因是在精神上，导入断言并不打算指导模块解析。
因此，这个特性以实验性的方式仅在夜间版本中发布，以获得更多的反馈。

但是，导入属性（Import Attributes）可以指导解析，并且我们也已经看到了有意义的用例，
TypeScript 5.3 在 `import type` 上支持了 `resolution-mode`。

```ts
// Resolve `pkg` as if we were importing with a `require()`
import type { TypeFromRequire } from "pkg" with {
    "resolution-mode": "require"
};

// Resolve `pkg` as if we were importing with an `import`
import type { TypeFromImport } from "pkg" with {
    "resolution-mode": "import"
};

export interface MergedType extends TypeFromRequire, TypeFromImport {}
```

这些导入属性也可以用在 `import()` 类型上。

```ts
export type TypeFromRequire =
    import("pkg", { with: { "resolution-mode": "require" } }).TypeFromRequire;

export type TypeFromImport =
    import("pkg", { with: { "resolution-mode": "import" } }).TypeFromImport;

export interface MergedType extends TypeFromRequire, TypeFromImport {}
```

更多详情，请参考[PR](https://github.com/microsoft/TypeScript/pull/55725)。

## 在所有模块模式中支持 `resolution-mode`

此前，仅在 `moduleResolution` 为 `node16` 和 `nodenext` 时支持 `resolution-mode`。
为了使查找模块更容易，尤其针对类型，`resolution-mode` 现在可以在所有其它的 `moduleResolution` 选项下工作，例如 `bundler`、`node10`，甚至在 `classic` 下也不报错。

更多详情，请参考[PR](https://github.com/microsoft/TypeScript/pull/55725)。

## `switch (true)` 类型细化

TypeScript 5.3 会针对 `switch (true)` 里的每一个 `case` 条件进行类型细化。

```ts
function f(x: unknown) {
  switch (true) {
    case typeof x === 'string':
      // 'x' is a 'string' here
      console.log(x.toUpperCase());
    // falls through...

    case Array.isArray(x):
      // 'x' is a 'string | any[]' here.
      console.log(x.length);
    // falls through...

    default:
    // 'x' is 'unknown' here.
    // ...
  }
}
```

感谢 Mateusz Burzyński 的[贡献](https://github.com/microsoft/TypeScript/pull/55991)。

## 类型细化与布尔值的比较

有时，您可能会发现自己在条件语句中直接与 `true` 或 `false` 进行比较。
通常情况下，这些比较是不必要的，但您可能出于风格上的考虑或为了避免 JavaScript 中真值相关的某些问题而偏好这样做。
不过，之前 TypeScript 在进行类型细化时并不识别这样的形式。

TypeScript 5.3 在类型细化时可以理解这类表达式。

```ts
interface A {
  a: string;
}

interface B {
  b: string;
}

type MyType = A | B;

function isA(x: MyType): x is A {
  return 'a' in x;
}

function someFn(x: MyType) {
  if (isA(x) === true) {
    console.log(x.a); // works!
  }
}
```

感谢 Mateusz Burzyński 的 [PR](https://github.com/microsoft/TypeScript/pull/53681)。

## 利用 `Symbol.hasInstance` 来细化 `instanceof`

JavaScript 的一个稍微晦涩的特性是可以覆盖 `instanceof` 运算符的行为。
为此，`instanceof` 运算符右侧的值需要具有一个名为 `Symbol.hasInstance` 的特定方法。

```ts
class Weirdo {
  static [Symbol.hasInstance](testedValue) {
    // wait, what?
    return testedValue === undefined;
  }
}

// false
console.log(new Thing() instanceof Weirdo);

// true
console.log(undefined instanceof Weirdo);
```

为了更好地支持 `instanceof` 的行为，TypeScript 现在会检查是否存在 `[Symbol.hasInstance]` 方法且被定义为类型判定函数。
如果有的话，`instanceof` 运算符左侧的值会按照类型判定进行细化。

```ts
interface PointLike {
  x: number;
  y: number;
}

class Point implements PointLike {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  distanceFromOrigin() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  static [Symbol.hasInstance](val: unknown): val is PointLike {
    return (
      !!val &&
      typeof val === 'object' &&
      'x' in val &&
      'y' in val &&
      typeof val.x === 'number' &&
      typeof val.y === 'number'
    );
  }
}

function f(value: unknown) {
  if (value instanceof Point) {
    // Can access both of these - correct!
    value.x;
    value.y;

    // Can't access this - we have a 'PointLike',
    // but we don't *actually* have a 'Point'.
    value.distanceFromOrigin();
  }
}
```

能够看到例子中，`Point` 定义了自己的 `[Symbol.hasInstance]` 方法。
它实际上充当了对称为 `PointLike` 的单独类型的自定义类型保护。
在函数 `f` 中，我们能够使用 `instanceof` 将 `value` 细化为 `PointLike`，但不能细化到 `Point`。
这意味着我们可以访问属性 `x` 和 `y`，但无法访问 `distanceFromOrigin` 方法。

更多详情请参考[PR](https://github.com/microsoft/TypeScript/pull/55052)。

## 在实例字段上检查 `super` 属性访问

在 JavaScript 中，能够使用 `super` 关键字来访问基类中的声明。

```ts
class Base {
  someMethod() {
    console.log('Base method called!');
  }
}

class Derived extends Base {
  someMethod() {
    console.log('Derived method called!');
    super.someMethod();
  }
}

new Derived().someMethod();
// Prints:
//   Derived method called!
//   Base method called!
```

这与 `this.someMethod()` 是不同的，因为它可能调用的是重写的方法。
这是一个微妙的区别，而且通常情况下，如果一个声明从未被覆盖，这两者可以互换，使得区别更加微妙。

```ts
class Base {
  someMethod() {
    console.log('someMethod called!');
  }
}

class Derived extends Base {
  someOtherMethod() {
    // These act identically.
    this.someMethod();
    super.someMethod();
  }
}

new Derived().someOtherMethod();
// Prints:
//   someMethod called!
//   someMethod called!
```

将它们互换使用的问题在于，`super` 关键字仅适用于在原型上声明的成员，而不适用于实例属性。
这意味着，如果您编写了 `super.someMethod()`，但 `someMethod` 被定义为一个字段，那么您将会得到一个运行时错误！

```ts
class Base {
  someMethod = () => {
    console.log('someMethod called!');
  };
}

class Derived extends Base {
  someOtherMethod() {
    super.someMethod();
  }
}

new Derived().someOtherMethod();
//
// Doesn't work because 'super.someMethod' is 'undefined'.
```

TypeScript 5.3 现在更仔细地检查 `super` 属性访问/方法调用，以确定它们是否对应于类字段。
如果是这样，我们现在将会得到一个类型检查错误。

[这个检查](https://github.com/microsoft/TypeScript/pull/54056)是由 Jack Works 开发！

## 可以交互的类型内嵌提示

TypeScript 的内嵌提示支持跳转到类型定义！
这便利在代码间跳转变得简单。

更多详情请参考[PR](https://github.com/microsoft/TypeScript/pull/55141)。

## 设置偏好 `type` 自动导入

之前，当 TypeScript 为类型自动生成导入语句时，它会根据配置添加 `type` 修饰符。
例如，当为 `Person` 生成自动导入语句时：

```ts
export let p: Person;
```

TypeScript 通常会这样生成 `Person` 导入：

```ts
import { Person } from './types';

export let p: Person;
```

如果设置了 `verbatimModuleSyntax`，它会添加 `type` 修饰符：

```ts
import { type Person } from './types';

export let p: Person;
```

然而，也许你的编辑器不支持这些选项；或者你偏好显式地使用 `type` 导入。

[最近的一项改动](https://github.com/microsoft/TypeScript/pull/56090)，TypeScript 把它变成了针对编辑器的配置项。
在 Visual Studio Code 中，你可以在 "TypeScript › Preferences: Prefer Type Only Auto Imports" 启用该功能，或者在 JSON 配置文件中的 `typescript.preferences.preferTypeOnlyAutoImports` 设置。

## 优化：略过 JSDoc 解析

当通过 `tsc` 运行 TypeScript 时，编译器现在将避免解析 JSDoc。
这不仅减少了解析时间，还减少了存储注释以及垃圾回收所花费的内存使用量。
总体而言，您应该会看到编译速度稍微更快，并在 `--watch` 模式下获得更快的反馈。

[具体改动在这](https://github.com/microsoft/TypeScript/pull/52921)。

由于并非每个使用 TypeScript 的工具都需要存储 JSDoc（例如 typescript-eslint 和 Prettier），因此这种解析策略已作为 API 的一部分公开。
这使得这些工具能够获得与 TypeScript 编译器相同的内存和速度改进。
注释解析策略的新选项在 `JSDocParsingMode` 中进行了描述。
关于此拉取请求的更多信息，请参阅[PR](https://github.com/microsoft/TypeScript/pull/55739)。

## 通过比较非规范化的交叉类型进行优化

在 TypeScript 中，联合类型和交叉类型始终遵循特定的形式，其中交叉类型不能包含联合类型。
这意味着当我们在一个联合类型上创建一个交叉类型，例如 `A & (B | C)`，该交叉类型将被规范化为 `(A & B) | (A & C)`。
然而，在某些情况下，类型系统会保留原始形式以供显示目的使用。

事实证明，原始形式可以用于一些巧妙的快速路径类型比较。

例如，假设我们有 `SomeType & (Type1 | Type2 | ... | Type99999NINE)`，我们想要确定它是否可以赋值给 `SomeType`。
回想一下，我们实际上没有一个交叉类型作为源类型，而是一个联合类型，看起来像是 `(SomeType & Type1) | (SomeType & Type2) | ... | (SomeType & Type99999NINE)`。
当检查一个联合类型是否可以赋值给目标类型时，我们必须检查联合类型的每个成员是否可以赋值给目标类型，这可能非常慢。

在 TypeScript 5.3 中，我们查看了我们能够隐藏的原始交叉类型形式。
当我们比较这些类型时，我们会快速检查目标类型是否存在于源交叉类型的任何组成部分中。

更多详情请参考[PR](https://github.com/microsoft/TypeScript/pull/55851)。

## 合并 `tsserverlibrary.js` 和 `typescript.js`

TypeScript 本身包含两个库文件：`tsserverlibrary.js` 和 `typescript.js`。
在 `tsserverlibrary.js` 中有一些仅在其中可用的 API（如 `ProjectService API`），对某些导入者可能很有用。
尽管如此，这两个是不同的捆绑包，有很多重叠的部分，在包中重复了一些代码。
更重要的是，由于自动导入或肌肉记忆的原因，要始终一致地使用其中一个可能是具有挑战性的。
意外加载两个模块太容易了，而且代码可能在 API 的不同实例上无法正常工作。
即使它可以工作，加载第二个捆绑包会增加资源使用量。

基于此，我们决定合并这两个文件。
`typescript.js` 现在包含了以前在 `tsserverlibrary.js` 中的内容，而 `tsserverlibrary.js` 现在只是重新导出 `typescript.js`。
在这个合并前后，我们看到了以下包大小的减小：

|          | Before    | After     | Diff      | Diff (percent) |
| -------- | --------- | --------- | --------- | -------------- |
| Packed   | 6.90 MiB  | 5.48 MiB  | -1.42 MiB | -20.61%        |
| Unpacked | 38.74 MiB | 30.41 MiB | -8.33 MiB | -21.50%        |

|                          | Before     | After      | Diff        | Diff (percent) |
| ------------------------ | ---------- | ---------- | ----------- | -------------- |
| lib/tsserverlibrary.d.ts | 570.95 KiB | 865.00 B   | -570.10 KiB | -99.85%        |
| lib/tsserverlibrary.js   | 8.57 MiB   | 1012.00 B  | -8.57 MiB   | -99.99%        |
| lib/typescript.d.ts      | 396.27 KiB | 570.95 KiB | +174.68 KiB | +44.08%        |
| lib/typescript.js        | 7.95 MiB   | 8.57 MiB   | +637.53 KiB | +7.84%         |

换句话说，这意味着包大小减小了超过 20.5%。

更多详情请参考 [PR](https://github.com/microsoft/TypeScript/pull/55273)。
