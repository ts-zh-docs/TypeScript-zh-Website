---
title: Symbol
layout: docs
permalink: /zh/docs/handbook/symbols.html
oneline: 在 TypeScript 中使用 JavaScript 的 Symbol 原始数据类型
translatable: true
---

从 ECMAScript 2015 开始，`symbol` 成为一种原始数据类型，类似于 `number` 和 `string`。

`symbol` 值是通过调用 `Symbol` 构造函数创建的。

```ts
let sym1 = Symbol();

let sym2 = Symbol("key"); // 可选的字符串键
```

Symbol 不可变且唯一。

```ts
let sym2 = Symbol("key");
let sym3 = Symbol("key");

sym2 === sym3; // false，symbol 唯一
```

符号可以像字符串一样用作对象属性的键。

```ts
const sym = Symbol();

let obj = {
  [sym]: "value",
};

console.log(obj[sym]); // "value"
```

符号也可以与计算属性声明结合使用，用于定义对象属性和类成员。

```ts
const getClassNameSymbol = Symbol();

class C {
  [getClassNameSymbol]() {
    return "C";
  }
}

let c = new C();
let className = c[getClassNameSymbol](); // "C"
```

## `unique symbol`

为了将符号视为唯一字面量，TypeScript 提供了一种特殊类型 `unique symbol`。`unique symbol` 是 `symbol` 的子类型，仅通过调用 `Symbol()` 或 `Symbol.for()`，或通过显式类型注解生成。此类型只能用于 `const` 声明和 `readonly static` 属性。要引用特定的唯一符号，必须使用 `typeof` 操作符。每个对唯一符号的引用都意味着与给定声明关联的完全独特的身份。

```ts twoslash
// @errors: 1332
declare const sym1: unique symbol;

// sym2 只能是常量引用。
let sym2: unique symbol = Symbol();

// 正常工作 - 引用一个唯一符号，但其身份与 'sym1' 绑定。
let sym3: typeof sym1 = sym1;

// 也正常工作。
class C {
  static readonly StaticSymbol: unique symbol = Symbol();
}
```

由于每个 `unique symbol` 具有完全独立的身份，因此没有两个 `unique symbol` 类型可以互相赋值或比较。

```ts twoslash
// @errors: 2367
const sym2 = Symbol();
const sym3 = Symbol();

if (sym2 === sym3) {
  // ...
}
```

## 内置符号

除了用户自定义的符号外，JavaScript 还提供了一些内置的著名符号。这些符号用于表示语言的内部行为。

以下是著名符号的列表：

### `Symbol.asyncIterator`

返回对象的异步迭代器的方法，适用于 `for await..of` 循环。

### `Symbol.hasInstance`

判断一个构造函数对象是否将某个对象视为该构造函数的实例的方法。由 `instanceof` 操作符的语义调用。

### `Symbol.isConcatSpreadable`

一个布尔值，指示对象是否应该在 `Array.prototype.concat` 中被展平为其数组元素。

### `Symbol.iterator`

返回对象的默认迭代器的方法。由 `for-of` 语句的语义调用。

### `Symbol.match`

一个正则表达式方法，将正则表达式与字符串进行匹配。由 `String.prototype.match` 方法调用。

### `Symbol.replace`

一个正则表达式方法，用于替换字符串中匹配的子字符串。由 `String.prototype.replace` 方法调用。

### `Symbol.search`

一个正则表达式方法，返回字符串中与正则表达式匹配的索引。由 `String.prototype.search` 方法调用。

### `Symbol.species`

一个函数值属性，表示用于创建派生对象的构造函数。

### `Symbol.split`

一个正则表达式方法，根据匹配正则表达式的索引拆分字符串。由 `String.prototype.split` 方法调用。

### `Symbol.toPrimitive`

将对象转换为对应原始值的方法。由 `ToPrimitive` 抽象操作调用。

### `Symbol.toStringTag`

用于生成对象默认字符串描述的字符串值。由内置方法 `Object.prototype.toString` 调用。

### `Symbol.unscopables`

一个对象，其自身属性名称是与关联对象的 'with' 环境绑定中排除的属性名称。
