---
title: JSX
layout: docs
permalink: /zh/docs/handbook/jsx.html
oneline: 将 JSX 与 TypeScript 结合使用
translatable: true
---

[JSX](https://facebook.github.io/jsx/) 是一种可嵌入的 XML 类型的语法。它旨在转换为有效的 JavaScript，尽管该转换的语义是特定于实现的。JSX 在 [React](https://reactjs.org/) 框架中广受欢迎，但也已经出现在其他实现中。TypeScript 支持直接将 JSX 嵌入、类型检查和编译为 JavaScript。

## 基本用法

要使用 JSX，你必须做两件事：

1. 将你的文件命名为 `.tsx` 扩展名
2. 启用 [`jsx`](/zh/tsconfig#jsx) 选项

TypeScript 附带了三种 JSX 模式：`preserve`、`react` 和 `react-native`。这些模式仅影响输出阶段——类型检查是不受影响的。`preserve` 模式会保留 JSX 作为输出的一部分，以供进一步的转换步骤使用（例如 [Babel](https://babeljs.io/)）。另外，输出将有 `.jsx` 文件扩展名。`react` 模式将输出 `React.createElement`，在使用前无需经过 JSX 转换，输出将有 `.js` 文件扩展名。`react-native` 模式类似于 `preserve`，它保留了所有的 JSX，但输出将有 `.js` 文件扩展名。

| 模式           | 输入     | 输出                                            | 输出文件扩展名 |
| -------------- | --------- | ------------------------------------------------- | --------------- |
| `preserve`     | `<div />` | `<div />`                                         | `.jsx`          |
| `react`        | `<div />` | `React.createElement("div")`                      | `.js`           |
| `react-native` | `<div />` | `<div />`                                         | `.js`           |
| `react-jsx`    | `<div />` | `_jsx("div", {}, void 0);`                        | `.js`           |
| `react-jsxdev` | `<div />` | `_jsxDEV("div", {}, void 0, false, {...}, this);` | `.js`           |

你可以使用 [`jsx`](/zh/tsconfig#jsx) 命令行标志或在 tsconfig.json 文件中相应的 [`jsx`](/zh/tsconfig#jsx) 选项来指定此模式。

> \*备注：你可以使用 [`jsxFactory`](/zh/tsconfig#jsxFactory) 选项指定目标 react JSX 输出时使用的 JSX 工厂函数（默认为 `React.createElement`）

## `as` 操作符

回想一下如何编写类型断言：

```ts
const foo = <foo>bar;
```

这会声明变量 `bar` 的类型为 `foo`。由于 TypeScript 也使用尖括号进行类型断言，与 JSX 的语法相结合会造成某些解析困难。因此，TypeScript 在 `.tsx` 文件中禁止使用尖括号类型断言。

由于上述语法在 `.tsx` 文件中不能使用，我们应该使用一个替代的类型断言操作符：`as`。示例可以很容易地用 `as` 操作符重写。

```ts
const foo = bar as foo;
```

`as` 操作符在 `.ts` 和 `.tsx` 文件中都可用，它与尖括号类型断言的行为是相同的。

## 类型检查

为了理解 JSX 的类型检查，你首先需要了解内置元素和基于值的元素之间的区别。给定一个 JSX 表达式 `<expr />`，`expr` 可能指的是环境中的某个内置元素（例如 DOM 环境中的 `div` 或 `span`）或者你自己创建的自定义组件。这一点很重要，因为：

1. 对于 React 来说，内置元素会作为字符串（`React.createElement("div")`）输出，而你创建的组件则不是（`React.createElement(MyComponent)`）。
2. 传递给 JSX 元素的属性类型应该以不同的方式查找。内置元素的属性应该是**内置的**，而组件可能需要指定自己的属性集合。

TypeScript 使用[与 React 相同的约定](http://facebook.github.io/react/docs/jsx-in-depth.html#html-tags-vs.-react-components)来区分这两者。内置元素总是以小写字母开头，而基于值的元素总是以大写字母开头。

### 内置元素

内置元素通过特殊接口 `JSX.IntrinsicElements` 查找。默认情况下，如果没有指定这个接口，那么一切都可以，内置元素不会进行类型检查。但是，如果定义了这个接口，那么内置元素的名称就会在 `JSX.IntrinsicElements` 接口上查找。例如：

```ts
declare namespace JSX {
  interface IntrinsicElements {
    foo: any;
  }
}

<foo />; // 正确
<bar />; // 错误
```

在上面的例子中，`<foo />` 可以正常工作，但 `<bar />` 会报错，因为它没有在 `JSX.IntrinsicElements` 中指定。

> 备注：你也可以在 `JSX.IntrinsicElements` 上指定一个通用的字符串索引器，如下所示：

```ts
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
```

### 基于值的元素

基于值的元素只需要查找当前作用域内的标识符。

```ts
import MyComponent from "./myComponent";

<MyComponent />; // 正确
<SomeOtherComponent />; // 错误
```

有两种定义基于值的元素的方式：

1. 函数组件
2. 类组件

因为这两种类型的基于值的元素在 JSX 表达式中是无法区分的，所以 TypeScript 首先会尝试使用函数组件的重载解析来解析表达式。如果成功，则 TS 会完成对该声明的解析。如果无法解析为函数组件，则 TS 会尝试将其解析为类组件。如果仍然失败，TS 会报错。

#### 函数组件

顾名思义，组件被定义为一个 JavaScript 函数，它的第一个参数是一个 `props` 对象。TypeScript 强制要求它的返回类型必须可赋值给 `JSX.Element`。

```ts
interface FooProp {
  name: string;
  X: number;
  Y: number;
}

declare function AnotherComponent(prop: { name: string });
function ComponentFoo(prop: FooProp) {
  return <AnotherComponent name={prop.name} />;
}

const Button = (prop: { value: string }, context: { color: string }) => (
  <button />
);
```

由于函数组件只是一个 JavaScript 函数，因此这里也可以使用函数重载：

```ts twoslash
// @noErrors
declare module JSX {
  interface Element {}
  interface IntrinsicElements {
    [s: string]: any;
  }
}
// ---cut---
interface ClickableProps {
  children: JSX.Element[] | JSX.Element;
}

interface HomeProps extends ClickableProps {
  home: JSX.Element;
}

interface SideProps extends ClickableProps {
  side: JSX.Element | string;
}

function MainButton(prop: HomeProps): JSX.Element;
function MainButton(prop: SideProps): JSX.Element;
function MainButton(prop: ClickableProps): JSX.Element {
  // ...
}
```

> 备注：函数组件曾经被称为无状态函数组件（SFC）。由于在最新版本的 React 中，函数组件不再被视为无状态的，所以 `SFC` 类型及其别名 `StatelessComponent` 已被弃用。

#### 类组件

可以定义类组件的类型。但是，要做到这一点，最好先了解两个新术语：*元素类型*和*元素实例类型*。

给定 `<Expr />`，*元素类型*是 `Expr` 的类型。所以在上面的例子中，如果 `MyComponent` 是一个 ES6 类，那么类型就是该类的构造函数和静态成员。如果 `MyComponent` 是一个工厂函数，那么类型就是那个函数。

确定了元素类型之后，实例类型由该类型的构造函数或调用签名（取决于哪个存在）的返回类型的联合类型决定。所以在 ES6 类的情况下，实例类型就是该类的实例类型，在工厂函数的情况下，它就是函数返回值的类型。

```ts
class MyComponent {
  render() {}
}

// 使用构造签名
const myComponent = new MyComponent();

// 元素类型 => MyComponent
// 元素实例类型 => { render: () => void }

function MyFactoryFunction() {
  return {
    render: () => {},
  };
}

// 使用调用签名
const myComponent = MyFactoryFunction();

// 元素类型 => MyFactoryFunction
// 元素实例类型 => { render: () => void }
```

元素实例类型很有趣，因为它必须可赋值给 `JSX.ElementClass`，否则会出现错误。默认情况下，`JSX.ElementClass` 是 `{}`，但可以对其进行扩充，以限制 JSX 的使用只能在符合特定接口的类型上使用。

```ts
declare namespace JSX {
  interface ElementClass {
    render: any;
  }
}

class MyComponent {
  render() {}
}
function MyFactoryFunction() {
  return { render: () => {} };
}

<MyComponent />; // 正确
<MyFactoryFunction />; // 正确

class NotAValidComponent {}
function NotAValidFactoryFunction() {
  return {};
}

<NotAValidComponent />; // 错误
<NotAValidFactoryFunction />; // 错误
```

### 属性类型检查

属性类型检查的第一步是确定*元素属性类型*。这在固有元素和基于值的元素之间略有不同。

对于固有元素，它是 `JSX.IntrinsicElements` 上的属性类型。

```ts
declare namespace JSX {
  interface IntrinsicElements {
    foo: { bar?: boolean };
  }
}

// ‘foo’的元素属性类型为‘{bar?: boolean}’
<foo bar />;
```

对于基于值的元素，它就更加复杂了。它由之前确定的*元素实例类型*上的属性类型决定。使用哪个属性是由 `JSX.ElementAttributesProperty` 来决定的。它应该被声明为具有单个属性。该属性的名称将被使用。从 TypeScript 2.8 开始，如果没有提供 `JSX.ElementAttributesProperty`，则将使用类元素构造函数或函数组件调用的第一个参数的类型。

```ts
declare namespace JSX {
  interface ElementAttributesProperty {
    props; // 指定要使用的属性名称
  }
}

class MyComponent {
  // 在元素实例类型上指定属性
  props: {
    foo?: string;
  };
}

// ‘MyComponent’的元素属性类型为‘{foo?: string}’
<MyComponent foo="bar" />;
```

元素属性类型用于对 JSX 中的属性进行类型检查。支持可选属性和必填属性。

```ts
declare namespace JSX {
  interface IntrinsicElements {
    foo: { requiredProp: string; optionalProp?: number };
  }
}

<foo requiredProp="bar" />; // 正确
<foo requiredProp="bar" optionalProp={0} />; // 正确
<foo />; // 错误，缺少 requiredProp
<foo requiredProp={0} />; // 错误，requiredProp 应该是字符串
<foo requiredProp="bar" unknownProp />; // 错误，unknownProp 不存在
<foo requiredProp="bar" some-unknown-prop />; // 正确，因为 'some-unknown-prop' 不是有效的标识符
```

> 备注：如果属性名不是有效的 JS 标识符（如 `data-*` 属性），即使它不在元素属性类型中，也不会被视为错误。

此外，可以使用 `JSX.IntrinsicAttributes` 接口来指定 JSX 框架使用的额外属性，这些属性通常不用于组件的 props 或参数——例如 React 中的 `key`。 进一步专门化，泛型 `JSX.IntrinsicClassAttributes<T>` 类型也可用于指定同种额外属性，但仅针对类组件（而不是函数组件）。在这种类型中，泛型参数对应于类实例类型。在 React 中，这用于允许 `ref` 属性的类型为 `Ref<T>`。 通常来说，除非你希望 JSX 框架的用户在每个标签上都提供某些属性，否则这些接口上的所有属性都应该是可选的。

扩展运算符也可以使用：

```ts
const props = { requiredProp: "bar" };
<foo {...props} />; // 正确

const badProps = {};
<foo {...badProps} />; // 错误
```

### 子类型检查

在 TypeScript 2.3 中，TS 引入了对 _children_ 的类型检查。_children_ 是元素属性类型中的一个特殊属性，其中子 *JSXExpression* 被视为插入到属性中。类似于 TS 使用 `JSX.ElementAttributesProperty` 来确定 _props_ 的名称，TS 使用 `JSX.ElementChildrenAttribute` 来确定这些 props 中 _children_ 的名称。`JSX.ElementChildrenAttribute` 应该使用单个属性进行声明。

```ts
declare namespace JSX {
  interface ElementChildrenAttribute {
    children: {}; // 指定要使用的 children 名称
  }
}
```

```ts
<div>
  <h1>Hello</h1>
</div>;

<div>
  <h1>Hello</h1>
  World
</div>;

const CustomComp = (props) => <div>{props.children}</div>
<CustomComp>
  <div>Hello World</div>
  {"这只是一个 JS 表达式..." + 1000}
</CustomComp>
```

你可以像指定任何其他属性一样指定 _children_ 的类型。这会覆盖来自例如 [React typings](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react) 的默认类型。

```ts
interface PropsType {
  children: JSX.Element
  name: string
}

class Component extends React.Component<PropsType, {}> {
  render() {
    return (
      <h2>
        {this.props.children}
      </h2>
    )
  }
}

// 正确
<Component name="foo">
  <h1>你好世界</h1>
</Component>

// 错误：children 的类型是 JSX.Element 而不是 JSX.Element 数组
<Component name="bar">
  <h1>你好世界</h1>
  <h2>你好世界</h2>
</Component>

// 错误：children 的类型是 JSX.Element 而不是 JSX.Element 数组或字符串
<Component name="baz">
  <h1>你好</h1>
  世界
</Component>
```

## JSX 结果类型

默认情况下，JSX 表达式的结果类型为 `any`。你可以通过指定 `JSX.Element` 接口来自定义类型。但是，无法从此接口中获取有关 JSX 元素、属性或子元素的类型信息。它是一个黑盒。

## 嵌入表达式

JSX 允许你通过将表达式括在大括号 (`{ }`) 中来嵌入表达式。

```ts
const a = (
  <div>
    {["foo", "bar"].map((i) => (
      <span>{i / 2}</span>
    ))}
  </div>
);
```

上述代码将导致错误, 因为你不能将字符串除以数字。使用 `preserve` 选项时，输出如下：

```ts
const a = (
  <div>
    {["foo", "bar"].map(function (i) {
      return <span>{i / 2}</span>;
    })}
  </div>
);
```

## React 集成

要在 React 中使用 JSX，你应该使用 [React 类型定义](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react)。这些类型定义适当地为 React 定义了 `JSX` 命名空间。

```ts
/// <reference path="react.d.ts" />

interface Props {
  foo: string;
}

class MyComponent extends React.Component<Props, {}> {
  render() {
    return <span>{this.props.foo}</span>;
  }
}

<MyComponent foo="bar" />; // 正确
<MyComponent foo={0} />; // 错误
```

### 配置 JSX

有多个编译器标志可用于自定义你的 JSX，它们既可用作编译器标志，也可用作每个文件内联的语法。要了解更多信息，请参阅它们的 tsconfig 参考页面：

- [`jsxFactory`](/zh/tsconfig#jsxFactory)
- [`jsxFragmentFactory`](/zh/tsconfig#jsxFragmentFactory)
- [`jsxImportSource`](/zh/tsconfig#jsxImportSource)
