---
title: 声明文件参考
layout: docs
permalink: /zh/docs/handbook/declaration-files/by-example.html
oneline: "如何为一个模块创建一个 d.ts 文件"
---

本指南的目的是教你如何编写高质量的声明文件。本指南通过展示某些 API 的文档、API 的示例用法，并解释如何编写相应的声明。

这些示例大致按照复杂性递增的顺序排列。

## 带有属性的对象

_文档_

> 全局变量 `myLib` 有一个用于创建问候语的函数 `makeGreeting`，以及一个表示到目前为止已经制造的问候语数量的属性 `numberOfGreetings`。

_代码_

```ts
let result = myLib.makeGreeting("hello, world");
console.log("The computed greeting is:" + result);

let count = myLib.numberOfGreetings;
```

_声明_

使用 `declare namespace` 来描述通过点符号访问的类型或值。

```ts
declare namespace myLib {
  function makeGreeting(s: string): string;
  let numberOfGreetings: number;
}
```

## 重载函数

_文档_

`getWidget` 函数接受一个数字并返回一个 Widget，或接受一个字符串并返回一个 Widget 数组。

_代码_

```ts
let x: Widget = getWidget(43);

let arr: Widget[] = getWidget("all of them");
```

_声明_

```ts
declare function getWidget(n: number): Widget;
declare function getWidget(s: string): Widget[];
```

## 可复用类型（接口）

_文档_

> 指定问候语时，你必须传递一个 `GreetingSettings` 对象。
> 此对象具有以下属性：
>
> 1 - greeting: 必需的字符串
>
> 2 - duration: 可选的持续时间（以毫秒为单位）
>
> 3 - color: 可选的字符串，比如'#ff00ff'

_代码_

```ts
greet({
  greeting: "hello world",
  duration: 4000
});
```

_声明_

使用`接口`来定义具有属性的类型。

```ts
interface GreetingSettings {
  greeting: string;
  duration?: number;
  color?: string;
}

declare function greet(setting: GreetingSettings): void;
```

## 可复用类型（类型别名）

_文档_

> 任何需要问候语的地方，你都可以提供一个 `string`，一个返回 `string` 的函数，或一个 `Greeter` 实例。

_代码_

```ts
function getGreeting() {
  return "howdy";
}
class MyGreeter extends Greeter {}

greet("hello");
greet(getGreeting);
greet(new MyGreeter());
```

_声明_

你可以使用类型别名来为一个类型做简写：

```ts
type GreetingLike = string | (() => string) | MyGreeter;

declare function greet(g: GreetingLike): void;
```

## 组织类型

_文档_

> `greeter` 对象可以记录到文件或显示警告。
> 你可以向 `.log(...)` 提供 LogOptions，向 `.alert(...)` 提供警报选项

_代码_

```ts
const g = new Greeter("Hello");
g.log({ verbose: true });
g.alert({ modal: false, title: "Current Greeting" });
```

_声明_

使用命名空间来组织类型。

```ts
declare namespace GreetingLib {
  interface LogOptions {
    verbose?: boolean;
  }
  interface AlertOptions {
    modal: boolean;
    title?: string;
    color?: string;
  }
}
```

你还可以在一个声明中创建嵌套命名空间：

```ts
declare namespace GreetingLib.Options {
  // Refer to via GreetingLib.Options.Log
  interface Log {
    verbose?: boolean;
  }
  interface Alert {
    modal: boolean;
    title?: string;
    color?: string;
  }
}
```

## 类

_文档_

> 你可以通过实例化 `Greeter` 对象来创建一个问候者，或通过继承它来创建一个定制的问候者。

_代码_

```ts
const myGreeter = new Greeter("hello, world");
myGreeter.greeting = "howdy";
myGreeter.showGreeting();

class SpecialGreeter extends Greeter {
  constructor() {
    super("Very special greetings");
  }
}
```

_声明_

使用 `declare class` 来描述一个类或类似类的对象。
类可以有属性和方法以及构造函数。

```ts
declare class Greeter {
  constructor(greeting: string);

  greeting: string;
  showGreeting(): void;
}
```

## 全局变量

_文档_

> 全局变量 `foo` 包含当前存在的小部件数量。

_代码_

```ts
console.log("Half the number of widgets is " + foo / 2);
```

_声明_

使用 `declare var` 来声明变量。如果变量是只读的，你可以使用 `declare const`。如果变量是块作用域的，你也可以使用 `declare let`。

```ts
/** The number of widgets present */
declare var foo: number;
```

## Global Functions

_文档_

> 你可以用一个字符串调用函数 `greet` 来向用户显示问候语。

_代码_

```ts
greet("hello, world");
```

_声明_

使用 `declare function` 来声明函数。

```ts
declare function greet(greeting: string): void;
```
