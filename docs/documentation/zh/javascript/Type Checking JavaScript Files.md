---
title: JavaScript 文件的类型检查
layout: docs
permalink: /zh/docs/handbook/type-checking-javascript-files.html
oneline: 如何使用 TypeScript 为 JavaScript 文件添加类型检查
---

以下是 `.js` 文件和 `.ts` 文件类型检查工作方式的一些显著差异。

## 属性从类体中的赋值推断

ES2015 不提供在类中声明属性的方法。属性是动态分配的，就像对象字面量一样。

在 `.js` 文件中，编译器从类体内的属性赋值推断属性。属性的类型是构造函数中给出的类型，除非它未在构造函数中定义，或者构造函数中的类型是 undefined 或 null。在这种情况下，类型是所有右侧赋值类型的联合。构造函数中定义的属性总是被认为存在，而仅在方法、getter 或 setter 中定义的属性被认为是可选的。

```js twoslash
// @checkJs
// @errors: 2322
class C {
  constructor() {
    this.constructorOnly = 0;
    this.constructorUnknown = undefined;
  }
  method() {
    this.constructorOnly = false;
    this.constructorUnknown = "plunkbat"; // ok, constructorUnknown 是 string | undefined
    this.methodOnly = "ok"; // ok，但 methodOnly 也可能是 undefined
  }
  method2() {
    this.methodOnly = true; // 也 ok，methodOnly 的类型是 string | boolean | undefined
  }
}
```

如果属性在类体中从未设置，则它们被视为未知。如果类中有仅被读取的属性，请在构造函数中添加并注释声明，指定类型使用 JSDoc。即使稍后初始化，也无需提供值：

```js twoslash
// @checkJs
// @errors: 2322
class C {
  constructor() {
    /** @type {number | undefined} */
    this.prop = undefined;
    /** @type {number | undefined} */
    this.count;
  }
}

let c = new C();
c.prop = 0; // OK
c.count = "string";
```

## 构造函数等同于类

在 ES2015 之前，JavaScript 使用构造函数而不是类。编译器支持这种模式，并将构造函数视为等同于 ES2015 类。上述属性推断规则的工作方式完全相同。

```js twoslash
// @checkJs
// @errors: 2683 2322
function C() {
  this.constructorOnly = 0;
  this.constructorUnknown = undefined;
}
C.prototype.method = function () {
  this.constructorOnly = false;
  this.constructorUnknown = "plunkbat"; // OK，类型是 string | undefined
};
```

## 支持 CommonJS 模块

在 `.js` 文件中，TypeScript 理解 CommonJS 模块格式。对 `exports` 和 `module.exports` 的赋值被识别为导出声明。类似地，`require` 函数调用被识别为模块导入。例如：

```js
// 同于 `import module "fs"`
const fs = require("fs");

// 同于 `export function readFile`
module.exports.readFile = function (f) {
  return fs.readFileSync(f);
};
```

JavaScript 中的模块支持在语法上比 TypeScript 的模块支持更宽松。大多数赋值和声明的组合都是支持的。

## 类、函数和对象字面量是命名空间

在 `.js` 文件中，类可以作为命名空间。这可以用于嵌套类，例如：

```js twoslash
class C {}
C.D = class {};
```

对于 ES2015 之前的代码，它可以用来模拟静态方法：

```js twoslash
function Outer() {
  this.y = 2;
}

Outer.Inner = function () {
  this.yy = 2;
};

Outer.Inner();
```

它还可以用来创建简单的命名空间：

```js twoslash
var ns = {};
ns.C = class {};
ns.func = function () {};

ns;
```

其他变体也是允许的：

```js twoslash
// 自执行函数
var ns = (function (n) {
  return n || {};
})();
ns.CONST = 1;

// 默认为全局
var assign =
  assign ||
  function () {
    // 代码在这里
  };
assign.extra = 1;
```

## 对象字面量是开放式的

在 `.ts` 文件中，初始化变量声明的对象字面量会将其类型赋给该声明。不能添加在原始字面量中未指定的新成员。在 `.js` 文件中，这条规则放宽了；对象字面量具有开放式类型（索引签名），允许添加和查找原本未定义的属性。例如：

```js twoslash
var obj = { a: 1 };
obj.b = 2; // 允许
```

对象字面量的行为就像拥有一个索引签名 `[x:string]: any`，这使得它们可以被视为开放映射，而不是封闭对象。

与其他特殊的 JS 检查行为一样，通过为变量指定 JSDoc 类型，可以改变这种行为。例如：

```js twoslash
// @checkJs
// @errors: 2339
/** @type {{a: number}} */
var obj = { a: 1 };
obj.b = 2;
```

## null、undefined 和空数组初始化器的类型为 any 或 any[]

任何用 null 或 undefined 初始化的变量、参数或属性的类型将为 any，即使开启了严格的 null 检查。任何用 [] 初始化的变量、参数或属性的类型将为 any[]，即使开启了严格的 null 检查。唯一的例外是具有多个初始化器的属性，如上所述。

```js twoslash
function Foo(i = null) {
  if (!i) i = 1;
  var j = undefined;
  j = 2;
  this.l = [];
}

var foo = new Foo();
foo.l.push(foo.i);
foo.l.push("end");
```

## 函数参数默认是可选的

由于在 ES2015 之前的 JavaScript 中无法指定参数的可选性，因此在 `.js` 文件中的所有函数参数都被视为可选。调用时，如果提供的参数少于声明的参数数量是允许的。

需要注意的是，调用函数时提供过多参数会导致错误。

例如：

```js twoslash
// @checkJs
// @strict: false
// @errors: 7006 7006 2554
function bar(a, b) {
  console.log(a + " " + b);
}

bar(1); // OK，第二个参数被视为可选
bar(1, 2);
bar(1, 2, 3); // 错误，参数过多
```

带有 JSDoc 注释的函数不受此规则的限制。使用 JSDoc 可选参数语法（`[` `]`）来表示可选性。例如：

```js twoslash
/**
 * @param {string} [somebody] - 某人的名字。
 */
function sayHello(somebody) {
  if (!somebody) {
    somebody = "John Doe";
  }
  console.log("Hello " + somebody);
}

sayHello();
```

## 从 `arguments` 的使用推断可变参数声明

函数体中引用 `arguments` 的函数隐式地被认为具有可变参数（即 `(...arg: any[]) => any`）。使用 JSDoc 可变参数语法来指定参数的类型。

```js twoslash
/** @param {...number} args */
function sum(/* numbers */) {
  var total = 0;
  for (var i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}
```

## 未指定的类型参数默认值为 `any`

由于在 JavaScript 中没有自然的语法来指定泛型类型参数，未指定的类型参数默认值为 `any`。

### 在 extends 子句中

例如，`React.Component` 被定义为具有两个类型参数 `Props` 和 `State`。在 `.js` 文件中，没有合法的方法在 extends 子句中指定这些参数。默认情况下，类型参数将为 `any`：

```js
import { Component } from "react";

class MyComponent extends Component {
  render() {
    this.props.b; // 允许，因为 this.props 的类型为 any
  }
}
```

使用 JSDoc 的 `@augments` 来显式指定类型。例如：

```js
import { Component } from "react";

/**
 * @augments {Component<{a: number}, State>}
 */
class MyComponent extends Component {
  render() {
    this.props.b; // 错误：b 在 {a:number} 上不存在
  }
}
```

### 在 JSDoc 引用中

JSDoc 中未指定的类型参数默认值为 any：

```js twoslash
/** @type{Array} */
var x = [];

x.push(1); // OK
x.push("string"); // OK，x 的类型为 Array<any>

/** @type{Array.<number>} */
var y = [];

y.push(1); // OK
y.push("string"); // 错误，string 不能赋值给 number
```

### 在函数调用中

调用一个泛型函数时，会使用参数推断类型参数。有时这个过程无法推断出任何类型，主要是由于缺乏推断来源；在这些情况下，类型参数将默认为 any。例如：

```js
var p = new Promise((resolve, reject) => {
  reject();
});

p; // Promise<any>;
```

要了解 JSDoc 中可用的所有功能，请参见 [参考文档](/docs/handbook/jsdoc-supported-types.html)。
