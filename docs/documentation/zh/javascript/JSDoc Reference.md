---
title: JSDoc 参考
layout: docs
permalink: /zh/docs/handbook/jsdoc-supported-types.html
oneline: TypeScript 支持哪些 JSDoc 构造？
translatable: true
---

下面的列表概述了在 JavaScript 文件中使用 JSDoc 注释提供类型信息时，当前支持的构造。

- 请注意，任何未在下方明确列出的标签（如 `@async`）都尚未得到支持。
- TypeScript 文件只支持文档标记。其余标记仅在 JavaScript 文件中受支持。

#### 类型

- [`@type`](#类型)
- [`@param`](#param-和-returns)（或 [`@arg`](#param-和-returns) 或 [`@argument`](#param-和-returns)）
- [`@returns`](#param-和-returns)（或 [`@return`](#param-和-returns)）
- [`@typedef`](typedef-callback-和-param)
- [`@callback`](typedef-callback-和-param)
- [`@template`](#template)
- [`@satisfies`](#satisfies)


#### 类

- [属性修饰符](#属性修饰符) `@public`、`@private`、`@protected`、`@readonly`
- [`@override`](#override)
- [`@extends`](#extends)（或 [`@augments`](#extends)）
- [`@implements`](#implements)
- [`@class`](#constructor)（或 [`@constructor`](#constructor)）
- [`@this`](#this)

#### 文档

文档标签在 TypeScript 和 JavaScript 中都可以使用。

- [`@deprecated`](#deprecated)
- [`@see`](#see)
- [`@link`](#link)

#### 其他

- [`@enum`](#enum)
- [`@author`](#author)
- [其他支持的模式](#其他支持的模式)
- [不支持的模式](#不支持的模式)
- [不支持的标签](#不支持的标签)

其含义通常与 [jsdoc.app](https://jsdoc.app) 上给出的标签含义相同或更广泛。下面的代码描述了差异并给出了每个标签的示例用法。

**备注：** 你可以[在演练场探索 JSDoc 支持](/zh/play?useJavaScript=truee=4#example/jsdoc-support)。

## 类型

### `@type`

你可以使用“@type”标签引用类型。类型可以是：

1. 基本类型，如 `string` 或 `number`。
2. 在 TypeScript 声明部分中声明（可以是全局的也可以是导入的）。
3. 在 JSDoc [`@typedef`](typedef-callback-和-param) 标签中声明。

你可以使用大部分 JSDoc 类型语法以及任何 TypeScript 语法，从[最基本的 `string`](/zh/docs/handbook/2/basic-types.html) 到[最复杂的条件类型](/zh/docs/handbook/2/conditional-types.html)都可以。

```js twoslash
/**
 * @type {string}
 */
var s;

/** @type {Window} */
var win;

/** @type {PromiseLike<string>} */
var promisedString;

// 你可以使用 DOM 属性指定 HTML 元素
/** @type {HTMLElement} */
var myElement = document.querySelector(selector);
element.dataset.myData = "";
```

`@type` 可以指定联合类型——例如，某些内容可以是字符串或布尔值。

```js twoslash
/**
 * @type {string | boolean}
 */
var sb;
```

你可以使用多种语法指定数组类型：

```js twoslash
/** @type {number[]} */
var ns;
/** @type {Array.<number>} */
var jsdoc;
/** @type {Array<number>} */
var nas;
```

你还可以指定对象字面量类型。例如，一个具有‘a’（字符串）和‘b’（数字）属性的对象使用以下语法：

```js twoslash
/** @type {{ a: string, b: number }} */
var var9;
```

你可以使用字符串和数字索引签名来指定类似 map 和类似数组的对象。你既可以使用标准 JSDoc 语法，也可以使用 TypeScript 语法。

```js twoslash
/**
 * 一个类似 map 的对象，将任意 `string` 属性映射到 `number`。
 *
 * @type {Object.<string, number>}
 */
var stringToNumber;

/** @type {Object.<number, object>} */
var arrayLike;
```

前两种类型等同于 TypeScript 类型 `{ [x: string]: number }` 和 `{ [x: number]: any }`。编译器理解这两种语法。

你可以使用 TypeScript 或 Google Closure 语法指定函数类型：

```js twoslash
/** @type {function(string, boolean): number} Closure 语法 */
var sbn;
/** @type {(s: string, b: boolean) => number} TypeScript 语法 */
var sbn2;
```

或者你可以使用未指定的 `Function` 类型：

```js twoslash
/** @type {Function} */
var fn7;
/** @type {function} */
var fn6;
```

Closure 中的其他类型也适用：

```js twoslash
/**
 * @type {*}——可以是任意类型
 */
var star;
/**
 * @type {?}——未知类型（与‘any’相同）
 */
var question;
```

#### 类型转换

TypeScript 借鉴了 Google Closure 的类型转换语法。这使你可以通过在任何括号表达式前添加 `@type` 标签将类型转换为其他类型。

```js twoslash
/**
 * @type {number | string}
 */
var numberOrString = Math.random() < 0.5 ? "hello" : 100;
var typeAssertedNumber = /** @type {number} */ (numberOrString);
```

你甚至可以像 TypeScript 一样转换为 `const`：

```js twoslash
let one = /** @type {const} */(1);
```

#### 导入类型

你可以使用导入类型从其他文件导入声明。这种语法是特定于 TypeScript 的，与 JSDoc 标准有所不同：

```js twoslash
// @filename: types.d.ts
export type Pet = {
  name: string,
};

// @filename: main.js
/**
 * @param {import("./types").Pet} p
 */
function walk(p) {
  console.log(`正在遛${p.name}...`);
}
```

导入类型可以在类型别名声明中使用：

```js twoslash
// @filename: types.d.ts
export type Pet = {
  name: string,
};
// @filename: main.js
// ---cut---
/**
 * @typedef {import("./types").Pet} Pet
 */

/**
 * @type {Pet}
 */
var myPet;
myPet.name;
```

如果你不知道类型，或者类型太大而令人讨厌输入，可以使用导入类型从模块中获取值的类型：

```js twoslash
// @filename: accounts.d.ts
export const userAccount = {
  name: "Name",
  address: "An address",
  postalCode: "",
  country: "",
  planet: "",
  system: "",
  galaxy: "",
  universe: "",
};
// @filename: main.js
// ---cut---
/**
 * @type {typeof import("./accounts").userAccount}
 */
var x = require("./accounts").userAccount;
```

### `@param` 和 `@returns`

`@param` 使用与 `@type` 相同的类型语法，但多了参数名称。参数也可以通过将名称括在方括号中来声明为可选：

```js twoslash
// 参数可以采用各种语法形式声明
/**
 * @param {string}  p1 — 一个字符串类型的参数。
 * @param {string=} p2 — 一个可选参数（Google Closure 语法）。
 * @param {string} [p3] — 另一个可选参数（JSDoc 语法）。
 * @param {string} [p4="test"] — 一个带有默认值的可选参数。
 * @returns {string} 这是结果。
 */
function stringsStringStrings(p1, p2, p3, p4) {
  // TODO
}
```

同样地，对于函数的返回类型：

```js twoslash
/**
 * @return {PromiseLike<string>}
 */
function ps() {}

/**
 * @returns {{ a: string, b: number }} — 也可以使用 '@returns' 而不是 '@return'
 */
function ab() {}
```

### `@typedef`，`@callback` 和 `@param`

你可以使用 `@typedef` 定义复杂类型。类似的语法也适用于 `@param`。

```js twoslash
/**
 * @typedef {Object} SpecialType - 创建一个名为‘SpecialType’的新类型
 * @property {string} prop1 - SpecialType 的一个字符串属性
 * @property {number} prop2 - SpecialType 的一个数字属性
 * @property {number=} prop3 - SpecialType 的一个可选数字属性
 * @prop {number} [prop4] - SpecialType 的一个可选数字属性
 * @prop {number} [prop5=42] - SpecialType 的一个可选数字属性，带有默认值
 */

/** @type {SpecialType} */
var specialTypeObject;
specialTypeObject.prop3;
```

在第一行，你既可以使用 `object`，也可以使用 `Object`。

```js twoslash
/**
 * @typedef {object} SpecialType1 - 创建一个名为‘SpecialType1’的新类型
 * @property {string} prop1 - SpecialType1 的一个字符串属性
 * @property {number} prop2 - SpecialType1 的一个数字属性
 * @property {number=} prop3 - SpecialType1 的一个可选数字属性
 */

/** @type {SpecialType1} */
var specialTypeObject1;
```

`@param` 允许使用类似的语法用于一次性的类型规范。请注意，嵌套属性名称必须以参数名称为前缀：

```js twoslash
/**
 * @param {Object} options - 结构与上面的 SpecialType 相同
 * @param {string} options.prop1
 * @param {number} options.prop2
 * @param {number=} options.prop3
 * @param {number} [options.prop4]
 * @param {number} [options.prop5=42]
 */
function special(options) {
  return (options.prop4 || 1001) + options.prop5;
}
```

`@callback` 类似于 `@typedef`，但它指定的是函数类型而不是对象类型：

```js twoslash
/**
 * @callback Predicate
 * @param {string} data
 * @param {number} [index]
 * @returns {boolean}
 */

/** @type {Predicate} */
const ok = (s) => !(s.length % 2);
```

当然，这些类型都可以使用 TypeScript 语法在单行 `@typedef` 中声明：

```js
/** @typedef {{ prop1: string, prop2: string, prop3?: number }} SpecialType */
/** @typedef {(data: string, index?: number) => boolean} Predicate */
```

### `@template`

你可以使用 `@template` 标签声明类型参数。借助它你可以创建泛型函数、类或类型：

```js twoslash
/**
 * @template T
 * @param {T} x - 流向返回类型的泛型参数
 * @returns {T}
 */
function id(x) {
  return x;
}

const a = id("string");
const b = id(123);
const c = id({});
```

使用逗号或多个标签来声明多个类型参数：

```js
/**
 * @template T,U,V
 * @template W,X
 */
```

你也可以在类型参数名称之前指定一个类型约束。只有列表中的第一个类型参数会被约束：

```js twoslash
/**
 * @template {string} K - K 必须是字符串或字符串字面量
 * @template {{ serious(): string }} Seriousalizable - 必须有一个 serious 方法
 * @param {K} key
 * @param {Seriousalizable} object
 */
function seriousalize(key, object) {
  // ????
}
```

最后，你可以为类型参数指定一个默认值：

```js twoslash
/** @template [T=object] */
class Cache {
    /** @param {T} initial */
    constructor(initial) {
    }
}
let c = new Cache()
```

### `@satisfies`

`@satisfies` 提供了对 TypeScript 中后缀 [`satisfies` 运算符](/zh/docs/handbook/release-notes/typescript-4-9.html)的访问。Satisfies 用于声明一个值实现了某个类型，但不影响该值的类型。

```js twoslash
// @errors: 1360
// @ts-check
/**
 * @typedef {"hello world" | "Hello, world"} WelcomeMessage
 */

/** @satisfies {WelcomeMessage} */
const message = "hello world"
//     ^?

/** @satisfies {WelcomeMessage} */
const failingMessage = "Hello world!"

/** @type {WelcomeMessage} */
const messageUsingType = "hello world"
//     ^?
```


## 类

类可以声明为 ES6 类。

```js twoslash
class C {
  /**
   * @param {number} data
   */
  constructor(data) {
    // 属性类型可以推断出来
    this.name = "foo";

    // 或者显式设置
    /** @type {string | null} */
    this.title = null;

    // 或者如果它们在其他地方设置，只需注解即可
    /** @type {number} */
    this.size;

    this.initialize(data); // 应该报错，初始化函数期望一个字符串
  }
  /**
   * @param {string} s
   */
  initialize = function (s) {
    this.size = s.length;
  };
}

var c = new C(0);

// C 应该只能用 new 调用，但由于它是 JavaScript，
// 这种做法是允许的，并被视为‘any’。
var result = C(1);
```

它们也可以声明为构造函数；对此请使用 [`@constructor`](#constructor) 以及 [`@this`](#this)。

### 属性修饰符
<div id="jsdoc-property-modifiers"></div>


`@public`、`@private` 和 `@protected` 的工作方式与 TypeScript 中的 `public`、`private` 和 `protected` 完全一致：

```js twoslash
// @errors: 2341
// @ts-check

class Car {
  constructor() {
    /** @private */
    this.identifier = 100;
  }

  printIdentifier() {
    console.log(this.identifier);
  }
}

const c = new Car();
console.log(c.identifier);
```

- `@public` 总是默认选项，可以省略，但意味着属性可以从任何地方访问。
- `@private` 意味着属性只能在包含它的类中使用。
- `@protected` 意味着属性只能在包含它的类及其派生的子类中使用，但不能在其他的类实例中使用。

`@public`、`@private` 和 `@protected` 无法在构造函数中工作。

### `@readonly`

`@readonly` 修饰符可确保属性只能在初始化期间写入。

```js twoslash
// @errors: 2540
// @ts-check

class Car {
  constructor() {
    /** @readonly */
    this.identifier = 100;
  }

  printIdentifier() {
    console.log(this.identifier);
  }
}

const c = new Car();
console.log(c.identifier);
```

### `@override`

`@override` 的工作方式与 TypeScript 中相同；在重写基类中的方法时使用它：

```js twoslash
export class C {
  m() { }
}
class D extends C {
  /** @override */
  m() { }
}
```

在 tsconfig 中设置 `noImplicitOverride: true` 可以检查重写。

### `@extends`

当 JavaScript 类继承一个泛型基类时，JavaScript 语法中没有传递类型参数的方法。`@extends` 标签允许这样做：

```js twoslash
/**
 * @template T
 * @extends {Set<T>}
 */
class SortableSet extends Set {
  // ...
}
```

请注意，`@extends` 仅适用于类。目前，构造函数无法继承类。

### `@implements`

同样地，JavaScript 语法中也没有实现 TypeScript 接口的方法。`@implements` 标签的工作方式与 TypeScript 中相同：

```js twoslash
/** @implements {Print} */
class TextBook {
  print() {
    // TODO
  }
}
```

### `@constructor`

编译器根据 this 属性赋值推断构造函数，但如果添加 `@constructor` 标签，可以使检查更加严格，建议也会更好：

```js twoslash
// @checkJs
// @errors: 2345 2348
/**
 * @constructor
 * @param {number} data
 */
function C(data) {
  // 可以推断属性类型
  this.name = "foo";

  // 或者显式设置
  /** @type {string | null} */
  this.title = null;

  // 或者简单注释，如果它们在其他地方设置
  /** @type {number} */
  this.size;

  this.initialize(data);
}
/**
 * @param {string} s
 */
C.prototype.initialize = function (s) {
  this.size = s.length;
};

var c = new C(0);
c.size;

var result = C(1);
```

> 备注：错误消息只在启用了 [JSConfig](/zh/docs/handbook/tsconfig-json.html) 和 [`checkJs`](/tsconfig#checkJs) 的 JS 代码库中显示。

使用 `@constructor`，在构造函数 `C` 内部会检查 `this`，因此你会得到 `initialize` 方法的建议，并在传递数字时遇到错误。如果你调用 `C` 而不是构造它，编辑器也可能会显示警告。

不幸的是，这意味着同时可调用的构造函数无法使用 `@constructor`。

### `@this`

当编译器有一些上下文可以使用时，通常可以确定 `this` 的类型。如果它无法确定，你可以使用 `@this` 明确指定 `this` 的类型：

```js twoslash
/**
 * @this {HTMLElement}
 * @param {*} e
 */
function callbackForLater(e) {
  this.clientHeight = parseInt(e); // 应该没问题！
}
```

## 文档

### `@deprecated`
<div id="deprecated-comments"></div>

当一个函数、方法或属性已被弃用时，你可以使用 `/** @deprecated */` JSDoc 注释让用户知道。这些信息会在补全列表中显示，并作为编辑器可以特殊处理的诊断建议。在像 VS Code 这样的编辑器中，已弃用的值通常以删除线样式显示，~~就像这样~~。

```js twoslash
// @noErrors
/** @deprecated */
const apiV1 = {};
const apiV2 = {};

apiV;
// ^|


```

### `@see`

`@see` 让你可以链接到程序中的其他名称：

```ts twoslash
type Box<T> = { t: T }
/** @see Box 了解实现细节 */
type Boxify<T> = { [K in keyof T]: Box<T> };
```

一些编辑器会将 `Box` 变成一个链接，以便于跳转到那里并返回。

### `@link`

`@link` 类似于 `@see`，只是它可以用在其他标签内部：

```ts twoslash
type Box<T> = { t: T }
/** @returns 包含参数的 {@link Box}。 */
function box<U>(u: U): Box<U> {
  return { t: u };
}
```

## 其他

### `@enum`

`@enum` 标签允许你创建一个所有成员都是指定类型的对象字面量。与 JavaScript 中的大多数对象字面量不同，它不允许有其他成员。`@enum` 旨在与 Google Closure 的 `@enum` 标签兼容。

```js twoslash
/** @enum {number} */
const JSDocState = {
  BeginningOfLine: 0,
  SawAsterisk: 1,
  SavingComments: 2,
};

JSDocState.SawAsterisk;
```

请注意，`@enum` 与 TypeScript 的 `enum` 大不相同，而且要简单得多。但是，与 TypeScript 的枚举不同，`@enum` 可以有任何类型：

```js twoslash
/** @enum {function(number): number} */
const MathFuncs = {
  add1: (n) => n + 1,
  id: (n) => -n,
  sub1: (n) => n - 1,
};

MathFuncs.add1;
```

### `@author`

你可以使用 `@author` 指定某个项目的作者：

```ts twoslash
/**
 * 欢迎来到 awesome.ts
 * @author Ian Awesome <i.am.awesome@example.com>
 */
```

请记住用尖括号括起电子邮件地址。否则，`@example` 将被解析为一个新标签。

### 其他支持的模式

```js twoslash
class Foo {}
// ---cut---
var someObj = {
  /**
   * @param {string} param1 - 属性赋值上的 JSDocs 也可以起作用
   */
  x: function (param1) {},
};

/**
 * 变量赋值上的 jsdocs 同样有效
 * @return {Window}
 */
let someFunc = function () {};

/**
 * 以及类方法
 * @param {string} greeting 要使用的问候语
 */
Foo.prototype.sayHi = (greeting) => console.log("Hi!");

/**
 * 还有箭头函数表达式
 * @param {number} x - 一个乘数
 */
let myArrow = (x) => x * x;

/**
 * 这意味着它也适用于 JSX 中的函数组件
 * @param {{a: string, b: number}} props - 一些参数
 */
var fc = (props) => <div>{props.a.charAt(0)}</div>;

/**
 * 参数可以是类构造函数，使用 Google Closure 语法。
 *
 * @param {{new(...args: any[]): object}} C - 要注册的类
 */
function registerClass(C) {}

/**
 * @param {...string} p1 - 一个字符串‘rest’参数（数组）。（被视为‘any’）
 */
function fn10(p1) {}

/**
 * @param {...string} p1 - 一个字符串‘rest’参数（数组）。（被视为‘any’）
 */
function fn9(p1) {
  return p1.join();
}
```

### 不支持的模式

在对象字面量类型中，属性类型的后缀等号不能指定属性为可选：

```js twoslash
/**
 * @type {{ a: string, b: number= }}
 */
var wrong;
/**
 * 应使用属性名后缀问号代替：
 * @type {{ a: string, b?: number }}
 */
var right;
```

可空类型只在启用 [`strictNullChecks`](/tsconfig#strictNullChecks) 时有意义：

```js twoslash
/**
 * @type {?number}
 * 当 strictNullChecks 为 true 时——number | null
 * 当 strictNullChecks 为 false 时——number
 */
var nullable;
```

TypeScript 原生语法是使用联合类型：

```js twoslash
/**
 * @type {number | null}
 * 当 strictNullChecks 为 true 时——number | null
 * 当 strictNullChecks 为 false 时——number
 */
var unionNullable;
```

不可空类型没有意义，会被视为原始类型：

```js twoslash
/**
 * @type {!number}
 * 只有 number 类型
 */
var normal;
```

与 JSDoc 的类型系统不同，TypeScript 只允许你标记类型是否包含 null。没有明确的不可空性——如果 strictNullChecks 启用，那么 `number` 就是不可空的。如果被禁用，那么 `number` 就是可空的。

### 不支持的标签

TypeScript 会忽略任何不支持的 JSDoc 标签。

以下标签在支持方面有问题：

- `@memberof` ([issue #7237](https://github.com/Microsoft/TypeScript/issues/7237))
- `@yields` ([issue #23857](https://github.com/Microsoft/TypeScript/issues/23857))

### 旧类型同义词

许多常见的类型都有别名，这是为了与旧 JavaScript 代码的兼容性。有些别名与现有类型相同，尽管它们中的大多数很少使用。例如，`String` 被视为 `string` 的别名。尽管 `String` 是 TypeScript 中的一种类型，但在旧的 JSDoc 中它通常用来表示 `string`。此外，在 TypeScript 中，基本类型的大写版本都是包装类型——使用它们通常是个错误。因此，编译器根据旧 JSDoc 中的使用情况将这些类型视为同义词：

- `String -> string`
- `Number -> number`
- `Boolean -> boolean`
- `Void -> void`
- `Undefined -> undefined`
- `Null -> null`
- `function -> Function`
- `array -> Array<any>`
- `promise -> Promise<any>`
- `Object -> any`
- `object -> any`

当 `noImplicitAny: true` 时，最后四个别名将被禁用：

- `object` 和 `Object` 是内置类型，尽管 `Object` 很少使用。
- `array` 和 `promise` 不是内置类型，但可能在你的程序中声明过。
