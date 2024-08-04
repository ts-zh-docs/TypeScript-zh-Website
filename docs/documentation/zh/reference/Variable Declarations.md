---
title: 变量声明
layout: docs
permalink: /zh/docs/handbook/variable-declarations.html
oneline: TypeScript 如何处理变量声明
translatable: true
---

`let` 和 `const` 是 JavaScript 中用于变量声明的两个相对较新的概念。[正如我们之前提到的](/zh/docs/handbook/basic-types.html#a-note-about-let)，`let` 在某些方面与 `var` 类似，但使用户能够避免在 JavaScript 中常见的一些“陷阱”。

`const` 是对 `let` 的一种增强，它防止对变量进行重新赋值。

作为 JavaScript 的扩展，TypeScript 自然支持 `let` 和 `const`。在这里，我们将更详细地介绍这些新的声明方式以及为什么它们比 `var` 更优秀。

如果你曾经不经意间使用过 JavaScript，下一节可能是一个很好的回顾方式。如果你熟悉 JavaScript 中 `var` 声明的所有怪异之处，你可以直接跳过这一部分。

## `var` 声明

在 JavaScript 中，变量声明传统上是使用 `var` 关键字完成的。

```ts
var a = 10;
```

我们刚刚声明了一个名为 `a` 的变量，并赋予它值 `10`。

我们也可以在函数内部声明变量：

```ts
function f() {
  var message = "Hello, world!";

  return message;
}
```

我们还可以在其他函数中访问这些变量：

```ts
function f() {
  var a = 10;
  return function g() {
    var b = a + 1;
    return b;
  };
}

var g = f();
g(); // 返回‘11’
```

在上面的示例中，`g` 捕获了在 `f` 中声明的变量 `a`。每当调用 `g` 时，`a` 的值都会与 `f` 中 `a` 的值相关联。即使在 `f` 执行完毕后调用 `g`，它仍然能够访问和修改 `a`。

```ts
function f() {
  var a = 1;

  a = 2;
  var b = g();
  a = 3;

  return b;

  function g() {
    a += 1;
    return a;
  }
}

f(); // 返回‘2’
```

### 作用域规则

`var` 声明在作用域规则上有一些古怪的地方，对于那些习惯了其他语言的人来说可能会感到困惑。让我们来看一个示例：

```ts
function f(shouldInitialize: boolean) {
  if (shouldInitialize) {
    var x = 10;
  }

  return x;
}

f(true); // 返回‘10’
f(false); // 返回‘undefined’
```

有些读者可能会对这个例子感到困惑。变量 `x` 是在 `if` 块内部声明的，但我们却能从块外访问到它。这是因为 `var` 声明的作用域是在它们所在的函数、模块、命名空间或全局作用域内（我们稍后会讨论这些），而不受包含它的块的影响。有些人将这种行为称为 `var` 作用域或函数作用域。函数参数也遵循函数作用域的规则。

这些作用域规则可能会导致多种类型的错误。其中一个问题是，多次声明同一个变量并不会报错：

```ts
function sumMatrix(matrix: number[][]) {
  var sum = 0;
  for (var i = 0; i < matrix.length; i++) {
    var currentRow = matrix[i];
    for (var i = 0; i < currentRow.length; i++) {
      sum += currentRow[i];
    }
  }

  return sum;
}
```

尽管对于一些经验丰富的 JavaScript 开发人员来说，这个问题可能很容易发现，内部的 `for` 循环意外地覆盖了变量 `i`，因为 `i` 是在同一个函数作用域内被引用的。正如经验丰富的开发人员所知，这种类型的 bug 很容易在代码审查时被忽视，并且可能成为一个持续的挫败感来源。

### 变量捕获的怪现象

让我们来猜猜下面这段代码的输出结果：

```ts
for (var i = 0; i < 10; i++) {
  setTimeout(function () {
    console.log(i);
  }, 100 * i);
}
```

对于不熟悉的人来说，`setTimeout` 会尝试在经过指定的毫秒数后执行一个函数（当然，要等待其他所有代码执行完毕）。

准备好了吗？让我们看一下结果：

```
10
10
10
10
10
10
10
10
10
10
```

许多 JavaScript 开发人员都对这种行为非常熟悉，但如果你感到惊讶，那你并不孤单。大多数人期望的输出应该是：

```
0
1
2
3
4
5
6
7
8
9
```

还记得我们之前提到的变量捕获吗？我们传递给 `setTimeout` 的每个函数表达式实际上都引用了同一个作用域内的同一个 `i`。

让我们花点时间考虑一下这意味着什么。`setTimeout` 将在经过一些毫秒数后运行一个函数，*但是只有在* `for` 循环停止执行之后；当 `for` 循环停止执行时，`i` 的值为 `10`。所以每次函数被调用时都会打印出 `10`！

一个常见的解决方法是使用立即调用函数表达式（IIFE）来在每次迭代时捕获 `i`：

```ts
for (var i = 0; i < 10; i++) {
  // 通过调用一个带有当前值的函数来捕获‘i’的当前状态
  (function (i) {
    setTimeout(function () {
      console.log(i);
    }, 100 * i);
  })(i);
}
```

这种看起来很奇怪的模式实际上是相当常见的。参数列表中的 `i` 确实遮蔽了在 `for` 循环中声明的 `i`，但由于我们把它们命名为相同的名称，我们就不需要太多地修改循环体了。

## `let` 声明

你已经了解到 `var` 存在一些问题，这正是为什么引入了 `let` 语句。除了使用的关键字不同，`let` 语句的编写方式与 `var` 语句是一样的。

```ts
let hello = "Hello!";
```

关键的区别不在于语法，而在于语义，我们现在就来探讨这个问题。

### 块作用域

当使用 `let` 声明一个变量时，它使用的是所谓的*词法作用域*或*块作用域*。与使用 `var` 声明的变量其作用域会扩散到它们所在的函数中不同，块作用域变量的作用域仅限于它们最近的包含块或 `for` 循环内部。

```ts
function f(input: boolean) {
  let a = 100;

  if (input) {
    // 仍然可以引用‘a’
    let b = a + 1;
    return b;
  }

  // 错误：这里‘b’不存在
  return b;
}
```

在这里，我们有两个局部变量 `a` 和 `b`。`a` 的作用域仅限于 `f` 的函数体，而 `b` 的作用域仅限于包含它的 `if` 语句块。

在 `catch` 子句中声明的变量也有类似的作用域规则。

```ts
try {
  throw "oh no!";
} catch (e) {
  console.log("Oh well.");
}

// 错误：这里‘e’不存在
console.log(e);
```

块作用域变量的另一个特性是，在实际声明它们之前，你不能读写它们。虽然这些变量在整个作用域中都“存在”，但在声明之前的所有点都属于它们的*暂时性死区*。这只是一个复杂的方式来说明你不能在 `let` 语句之前访问它们，幸运的是，TypeScript 会提示你这种错误。

```ts
a++; // 在声明之前使用‘a’是非法的；
let a;
```

需要注意的是，你仍然可以在声明之前*捕获*一个块作用域变量。唯一的限制是在声明之前调用那个函数是非法的。如果目标是 ES2015，现代运行时会抛出一个错误；然而，现在 TypeScript 比较宽容，不会报告这种错误。

```ts
function foo() {
  // 捕获‘a’是可以的
  return a;
}

// 在‘a’声明之前调用‘foo’是非法的
// 运行时应该在这里抛出一个错误
foo();

let a;
```

关于暂时性死区的更多信息，请参阅 [Mozilla 开发者网络](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/let#暂时性死区)上的相关内容。

### 重新声明和变量屏蔽

在使用 `var` 声明时，我们提到无论你声明变量多少次，你只会得到一个变量。

```ts
function f(x) {
  var x;

  if (true) {
    var x;
  }
}
```

在上面的例子中，所有对 `x` 的声明实际上都指向*同一个*变量 `x`，而且这是完全有效的。这经常会导致 bug。幸运的是，`let` 声明不太宽容。

```ts
let x = 10;
let x = 20; // 错误：无法在同一作用域内重新声明‘x’
```

这两个变量不一定都需要块作用域，TypeScript 也会告诉我们存在问题。

```ts
function f(x) {
  let x = 100; // 错误：与参数声明冲突
}

function g() {
  let x = 100;
  var x = 100; // 错误：无法有两个‘x’的声明
}
```

这并不意味着块作用域变量永远不能与函数作用域变量同时声明。块作用域变量只需要在一个明显不同的块中声明即可。

```ts
function f(condition, x) {
  if (condition) {
    let x = 100;
    return x;
  }

  return x;
}

f(false, 0); // 返回‘0’
f(true, 0); // 返回‘100’
```

在更嵌套的作用域中引入一个新名称的行为被称为*变量屏蔽*。这是一把双刃剑，因为它既可能在发生意外变量屏蔽时引入某些 bug，同时也可以防止某些 bug。例如，想象一下，如果我们使用 `let` 变量来编写之前的 `sumMatrix` 函数。

```ts
function sumMatrix(matrix: number[][]) {
  let sum = 0;
  for (let i = 0; i < matrix.length; i++) {
    var currentRow = matrix[i];
    for (let i = 0; i < currentRow.length; i++) {
      sum += currentRow[i];
    }
  }

  return sum;
}
```

这个循环的版本将正确执行求和，因为内部循环的 `i` 屏蔽了外部循环的 `i`。

为了编写更清晰的代码，*通常*应避免使用变量屏蔽。虽然有些情况下可能适合利用它，但你应该根据实际情况判断是否使用。

### 块作用域变量的捕获

当我们首次接触使用 `var` 声明时，我们简要介绍了变量捕获的概念，以及变量在捕获后的行为。为了更好地理解，每当一个作用域运行时，它都会创建一个变量的“环境”。即使在作用域内的所有代码执行完毕后，这个环境和其中捕获的变量仍然存在。

```ts
function theCityThatAlwaysSleeps() {
  let getCity;

  if (true) {
    let city = "Seattle";
    getCity = function () {
      return city;
    };
  }

  return getCity();
}
```

因为我们从该环境中捕获了 `city`，所以尽管 `if` 块已经执行完毕，我们仍然能够访问它。

回想一下之前的 `setTimeout` 示例，我们最终需要使用 IIFE 来捕获每次 `for` 循环迭代的变量状态。实际上，我们正在为捕获的变量创建一个新的变量环境。这有点麻烦，但幸运的是，在 TypeScript 中你将不再需要这样做。

当 `let` 声明作为循环的一部分时，其行为与之前截然不同。它们不仅仅为循环本身引入一个新的环境，而是*在每次迭代中*创建一个新的作用域。由于这正是我们使用 IIFE 做的事情，我们可以将之前的 `setTimeout` 示例更改为只使用 `let` 声明。

```ts
for (let i = 0; i < 10; i++) {
  setTimeout(function () {
    console.log(i);
  }, 100 * i);
}
```

如预期，这将打印出：

```
0
1
2
3
4
5
6
7
8
9
```

## `const` 声明

`const` 声明是声明变量的另一种方式。

```ts
const numLivesForCat = 9;
```

它们与 `let` 声明类似，但是正如它们的名字所暗示的那样，一旦绑定了值，就无法更改它们。换句话说，它们具有与 `let` 相同的作用域规则，但不能对其重新赋值。

这不应与它们所引用的值是*不可变*的概念混淆。

```ts
const numLivesForCat = 9;
const kitty = {
  name: "Aurora",
  numLives: numLivesForCat,
};

// 错误
kitty = {
  name: "Danielle",
  numLives: numLivesForCat,
};

// 所有这些都是合法的
kitty.name = "Rory";
kitty.name = "Kitty";
kitty.name = "Cat";
kitty.numLives--;
```

除非你采取特定措施来避免，否则 `const` 变量的内部状态仍然是可修改的。幸运的是，TypeScript 允许你指定对象成员为 `readonly`。关于此内容的详细信息可以在[接口章节](/zh/docs/handbook/interfaces.html)中找到。

## `let` vs. `const`

考虑到我们有两种具有相似作用域语义的声明方式，很自然地会想知道该使用哪一种。像大多数广泛的问题一样，答案是：取决于情况。

根据[最小权限原则](https://zh.wikipedia.org/zh-cn/最小权限原则)，除了计划修改的声明之外，所有其他声明都应该使用 `const`。其理由是，如果一个变量不需要被写入，那么其他在同一代码库上工作的人不应该自动具有对该对象的写入权限，并且他们需要考虑是否真的需要重新分配变量。使用 `const` 还可以使代码在推理数据流时更加可预测。

请根据自己的判断力进行选择，并在适当的情况下与团队中的其他成员进行讨论。

本手册的大部分内容使用 `let` 声明。

## 解构

TypeScript 还支持 ECMAScript 2015 的另一个特性，即解构。关于解构的完整参考，请参阅 [MDN 上的文章](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)。在本节中，我们将进行简要概述。

### 数组解构

解构的最简单形式是数组解构赋值：

```ts
let input = [1, 2];
let [first, second] = input;
console.log(first); // 输出 1
console.log(second); // 输出 2
```

这将创建两个名为 `first` 和 `second` 的新变量。这相当于使用索引访问数组元素，但更加方便：

```ts
first = input[0];
second = input[1];
```

解构赋值也适用于已经声明的变量：

```ts
// 交换变量的值
[first, second] = [second, first];
```

还可以在函数参数中使用解构赋值：

```ts
function f([first, second]: [number, number]) {
  console.log(first);
  console.log(second);
}
f([1, 2]);
```

使用 `...` 语法可以创建一个变量来存储列表中的剩余项：

```ts
let [first, ...rest] = [1, 2, 3, 4];
console.log(first); // 输出 1
console.log(rest); // 输出 [ 2, 3, 4 ]
```

当然，由于这是 JavaScript，你也可以忽略不需要的尾部元素：

```ts
let [first] = [1, 2, 3, 4];
console.log(first); // 输出 1
```

或者忽略其他元素：

```ts
let [, second, , fourth] = [1, 2, 3, 4];
console.log(second); // 输出 2
console.log(fourth); // 输出 4
```

### 元组解构

元组可以像数组一样进行解构；解构的变量会获得相应元组元素的类型：

```ts
let tuple: [number, string, boolean] = [7, "hello", true];

let [a, b, c] = tuple; // a: number, b: string, c: boolean
```

在解构时超出元组元素范围会导致错误：

```ts
let [a, b, c, d] = tuple; // 错误，索引 3 处没有元素
```

与数组一样，可以使用 `...` 解构剩余的元组部分，以获得较短的元组：

```ts
let [a, ...bc] = tuple; // bc: [string, boolean]
let [a, b, c, ...d] = tuple; // d: []，空元组
```

也可以忽略尾随元素或其他元素：

```ts
let [a] = tuple; // a: number
let [, b] = tuple; // b: string
```

### 对象解构

你也可以对对象进行解构：

```ts
let o = {
  a: "foo",
  b: 12,
  c: "bar",
};
let { a, b } = o;
```

这将用 `o.a` 和 `o.b` 创建新的变量 `a` 和 `b`。如果你不需要 `c`，可以忽略它。

与数组解构类似，你可以进行赋值而无需声明：

```ts
({ a, b } = { a: "baz", b: 101 });
```

请注意，我们必须用括号将该语句括起来。JavaScript 通常将 `{` 解析为块的开始。

你可以使用 `...` 语法为对象中的剩余项创建一个变量：

```ts
let { a, ...passthrough } = o;
let total = passthrough.b + passthrough.c.length;
```

#### 属性重命名

你也可以给属性指定不同的名称：

```ts
let { a: newName1, b: newName2 } = o;
```

这里的语法开始变得混乱。你可以将 `a: newName1` 理解为“把 `a` 当作 `newName1`”。解构的方向是从左到右的，就好像你写成了：

```ts
let newName1 = o.a;
let newName2 = o.b;
```

令人困惑的是，这里的冒号*不*表示类型。如果你指定了类型的话，仍然需要将其写在整个解构之后：

```ts
let { a: newName1, b: newName2 }: { a: string; b: number } = o;
```

#### 默认值

默认值允许你在属性为 `undefined` 时指定一个默认值：

```ts
function keepWholeObject(wholeObject: { a: string; b?: number }) {
  let { a, b = 1001 } = wholeObject;
}
```

在这个例子中，`b?` 表示 `b` 是可选的，因此它可能是 `undefined`。`keepWholeObject` 现在有了一个包含属性 `a` 和 `b` 的变量 `wholeObject`，即使 `b` 是 `undefined`。

## 函数声明

解构也适用于函数声明。对于简单的情况，这很直观：

```ts
type C = { a: string; b?: number };
function f({ a, b }: C): void {
  // ...
}
```

但是，在参数中指定默认值更常见，而使用解构来正确设置默认值可能会有些棘手。首先，你需要记住在默认值之前放置解构模式。

```ts
function f({ a = "", b = 0 } = {}): void {
  // ...
}
f();
```

> 上述片段是类型推断的示例，在本手册前面有解释。

然后，你需要记住在解构的属性（而不是主初始化器）上给出可选属性的默认值。请记住，`C` 被定义为 `b` 是可选的：

```ts
function f({ a, b = 0 } = { a: "" }): void {
  // ...
}
f({ a: "yes" }); // 可行，b 默认为 0
f(); // 可行，默认为 { a: "" }，然后 b 默认为 0
f({}); // 错误，如果提供参数，则 'a' 是必需的
```

使用解构时请小心。正如前面的示例所示，除了最简单的解构表达式之外，其他任何表达式都会让人感到困惑。尤其是在深层嵌套的解构中，即使没有重命名、默认值和类型注解，也会变得非常难以理解。尽量保持解构表达式的简短和简单。你总是可以自己编写解构生成的赋值语句。

## 展开运算符

展开运算符是解构的相反操作。它允许你将一个数组展开到另一个数组中，或将一个对象展开到另一个对象中。例如：

```ts
let first = [1, 2];
let second = [3, 4];
let bothPlus = [0, ...first, ...second, 5];
```

这将使 `bothPlus` 的值变为 `[0, 1, 2, 3, 4, 5]`。展开操作创建了 `first` 和 `second` 的浅拷贝。原始数组不会被改变。

你也可以展开对象：

```ts
let defaults = { food: "spicy", price: "$$", ambiance: "noisy" };
let search = { ...defaults, food: "rich" };
```

现在 `search` 的值是 `{ food: "rich", price: "$$", ambiance: "noisy" }`。对象展开比数组展开更复杂。与数组展开类似，它从左到右进行展开，但结果仍然是一个对象。这意味着后面的属性会覆盖前面的属性。因此，如果我们修改上面的示例，在最后进行展开：

```ts
let defaults = { food: "spicy", price: "$$", ambiance: "noisy" };
let search = { food: "rich", ...defaults };
```

那么 `defaults` 中的 `food` 属性会覆盖 `food: "rich"`，这在这种情况下并不是我们想要的。

对象展开还有一些其他的限制。首先，它只包括对象[自身的可枚举属性](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Enumerability_and_ownership_of_properties)。基本上，这意味着在展开对象实例时会丢失方法：

```ts
class C {
  p = 12;
  m() {}
}
let c = new C();
let clone = { ...c };
clone.p; // 正常
clone.m(); // 报错！
```

其次，TypeScript 编译器不允许从泛型函数中展开类型参数。这个特性在未来的语言版本中有望实现。

## `using` 声明

`using` 声明是 JavaScript 即将推出的一个特性，它是 [Stage 3 显式资源管理](https://github.com/tc39/proposal-explicit-resource-management)提案的一部分。`using` 声明类似于 `const` 声明，但是它将绑定到声明的值的*生命周期*与变量的*作用域*结合起来。

当控制流离开包含 `using` 声明的块时，将执行声明值的 `[Symbol.dispose]()` 方法，从而允许该值执行清理操作：

```ts
function f() {
  using x = new C();
  doSomethingWith(x);
} // 调用 `x[Symbol.dispose]()` 方法
```

在运行时，这大致相当于以下操作：

```ts
function f() {
  const x = new C();
  try {
    doSomethingWith(x);
  }
  finally {
    x[Symbol.dispose]();
  }
}
```

`using` 声明在处理保存原生引用（如文件句柄）的 JavaScript 对象时非常有用，可以帮助避免内存泄漏。

```ts
{
  using file = await openFile();
  file.write(text);
  doSomethingThatMayThrow();
} // 即使抛出错误，`file` 也会被处理
```

或者在跟踪等作用域操作中，

```ts
function f() {
  using activity = new TraceActivity("f"); // 跟踪函数入口
  // ...
} // 跟踪函数退出

```

与 `var`、`let` 和 `const` 不同，`using` 声明不支持解构。

### `null` 和 `undefined`

需要注意的是，值可以是 `null` 或 `undefined`，在这种情况下，在块的末尾不会处理任何内容：

```ts
{
  using x = b ? new C() : null;
  // ...
}
```

大致相当于：

```ts
{
  const x = b ? new C() : null;
  try {
    // ...
  }
  finally {
    x?.[Symbol.dispose]();
  }
}
```

这允许你在声明 `using` 声明时有条件地获取资源，而无需复杂的分支或重复。

### 定义可处理资源

你可以通过实现 `Disposable` 接口来指示你生成的类或对象是可处理的：

```ts
// 来自默认库：
interface Disposable {
  [Symbol.dispose](): void;
}

// 用法：
class TraceActivity implements Disposable {
  readonly name: string;
  constructor(name: string) {
    this.name = name;
    console.log(`进入: ${name}`);
  }

  [Symbol.dispose](): void {
    console.log(`退出: ${name}`);
  }
}

function f() {
  using _activity = new TraceActivity("f");
  console.log("Hello world!");
}

f();
// 输出:
//   进入: f
//   Hello world!
//   退出: f
```

## `await using` 声明

某些资源或操作可能需要以异步方式执行清理工作。为了适应这一点，[明确资源管理](https://github.com/tc39/proposal-explicit-resource-management)提案还引入了 `await using` 声明：

```ts
async function f() {
  await using x = new C();
} // 调用 `await x[Symbol.asyncDispose]()` 方法
```

`await using` 声明在控制流离开包含块时调用并*等待*其值的 `[Symbol.asyncDispose]()` 方法。这允许进行异步清理，例如数据库事务执行回滚或提交，或文件流在关闭之前刷新任何待定写入存储的操作。

与 `await` 一样，`await using` 只能在 `async` 函数或方法中使用，或者在模块的顶层使用。

### 定义一个可异步处理的资源

就像 `using` 依赖于 `Disposable` 对象一样，`await using` 依赖于 `AsyncDisposable` 对象：

```ts
// 来自默认库:
interface AsyncDisposable {
  [Symbol.asyncDispose]: PromiseLike<void>;
}

// 用法:
class DatabaseTransaction implements AsyncDisposable {
  public success = false;
  private db: Database | undefined;

  private constructor(db: Database) {
    this.db = db;
  }

  static async create(db: Database) {
    await db.execAsync("BEGIN TRANSACTION");
    return new DatabaseTransaction(db);
  }

  async [Symbol.asyncDispose]() {
    if (this.db) {
      const db = this.db;
      this.db = undefined;
      if (this.success) {
        await db.execAsync("COMMIT TRANSACTION");
      }
      else {
        await db.execAsync("ROLLBACK TRANSACTION");
      }
    }
  }
}

async function transfer(db: Database, account1: Account, account2: Account, amount: number) {
  using tx = await DatabaseTransaction.create(db);
  if (await debitAccount(db, account1, amount)) {
    await creditAccount(db, account2, amount);
  }
  // 如果在此行之前抛出异常，事务将回滚
  tx.success = true;
  // 现在事务将提交
}
```

### `await using` 与 `await` 的区别

`await using` 声明中的 `await` 关键字仅表示资源的*处理*是被 `await` 的。它*不会* `await` 值本身：

```ts
{
  await using x = getResourceSynchronously();
} // 执行 `await x[Symbol.asyncDispose]()`

{
  await using y = await getResourceAsynchronously();
} // 执行 `await y[Symbol.asyncDispose]()`
```

### `await using` 和 `return`

需要注意的是，如果你在返回 `Promise` 的 `async` 函数中使用 `await using` 声明，并且没有首先 `await` 它，这种行为可能会出现一个小问题：

```ts
function g() {
  return Promise.reject("error!");
}

async function f() {
  await using x = new C();
  return g(); // 缺少一个 `await`
}
```

因为返回的 promise 没有被 `await`，在 `await` 异步处理 `x` 的同时，可能会导致 JavaScript 运行时报告未处理的拒绝，因为没有订阅返回的 promise。这并不是 `await using` 才有的问题，同样的情况也会发生在使用 `try..finally` 的 `async` 函数中：

```ts
async function f() {
  try {
    return g(); // 也会报告未处理的拒绝
  }
  finally {
    await somethingElse();
  }
}
```

为了避免这种情况，建议在可能返回 `Promise` 的情况下 `await` 返回值：

```ts
async function f() {
  await using x = new C();
  return await g();
}
```

## `for` 和 `for..of` 语句中的 `using` 和 `await using`

`using` 和 `await using` 都可以在 `for` 语句中使用：

```ts
for (using x = getReader(); !x.eof; x.next()) {
  // ...
}
```

在这种情况下，`x` 的生命周期仅限于整个 `for` 语句，并且只有在由于 `break`、`return`、`throw` 或循环条件为 false 而控制流离开循环时才会进行处理。

除了 `for` 语句之外，这两种声明也可以在 `for..of` 语句中使用：

```ts
function * g() {
  yield createResource1();
  yield createResource2();
}

for (using x of g()) {
  // ...
}
```

在这里，`x` 在*每次循环迭代*结束时被处理，然后用下一个值重新初始化。这在通过生成器逐个产生资源时特别有用。

## 在旧版运行时中使用 `using` 和 `await using`

只要你使用与 `Symbol.dispose`/`Symbol.asyncDispose` 兼容的 polyfill，比如最近的 NodeJS 版本中默认提供的 polyfill，就可以在目标是旧版 ECMAScript 版本时使用 `using` 和 `await using` 声明。
