---
title: mixin
layout: docs
permalink: /zh/docs/handbook/mixins.html
oneline: 在 TypeScript 中使用 mixin
translatable: true
---

除了传统的面向对象层次结构之外，另一种常用的构建类的方式是通过组合较简单的部分类来实现可重用组件。你可能熟悉类似 Scala 等语言中的 mixin 或 trait 的概念，这种模式在 JavaScript 社区中也相当流行。

## mixin 是如何工作的？

该模式依赖于使用类继承的泛型来扩展基类。TypeScript 最好的 mixin 支持是通过类表达式模式实现的。你可以在[这里](https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/)阅读更多关于此模式在 JavaScript 中的工作方式。

作为起点，我们编写一个应用 mixin 的类：

```ts twoslash
class Sprite {
  name = "";
  x = 0;
  y = 0;

  constructor(name: string) {
    this.name = name;
  }
}
```

然后，你需要一个类型和一个工厂函数，该函数返回一个扩展基类的类表达式。

```ts twoslash
// 要开始，我们需要一个类型，我们将使用它来扩展
// 其他类。其主要职责是声明
// 传入的类型是一个类。

type Constructor = new (...args: any[]) => {};

// 此 mixin 添加一个 scale 属性，该属性具有用于更改它的 getter 和 setter
// 以及一个封装的私有属性：

function Scale<TBase extends Constructor>(Base: TBase) {
  return class Scaling extends Base {
    // mixin 可能不会声明私有/受保护属性
    // 但你可以使用 ES2020 私有字段
    _scale = 1;

    setScale(scale: number) {
      this._scale = scale;
    }

    get scale(): number {
      return this._scale;
    }
  };
}
```

设置好这些之后，你可以创建一个表示已应用 mixin 的基类的类：

```ts twoslash
class Sprite {
  name = "";
  x = 0;
  y = 0;

  constructor(name: string) {
    this.name = name;
  }
}
type Constructor = new (...args: any[]) => {};
function Scale<TBase extends Constructor>(Base: TBase) {
  return class Scaling extends Base {
    // 混合类可能不能声明私有/受保护属性
    // 但是，你可以使用 ES2020 私有字段
    _scale = 1;

    setScale(scale: number) {
      this._scale = scale;
    }

    get scale(): number {
      return this._scale;
    }
  };
}
// ---cut---
// 从 Sprite 类组合一个新类，
// 使用 Mixin Scale：
const EightBitSprite = Scale(Sprite);

const flappySprite = new EightBitSprite("Bird");
flappySprite.setScale(0.8);
console.log(flappySprite.scale);
```

## 有限制的 Mixin

在上面的形式中，mixin 没有关于类的基础知识，这可能会使得创建你想要的设计变得困难。

为了模拟这一点，我们修改原始构造函数类型以接受一个泛型参数。

```ts twoslash
// 这是我们先前的构造函数：
type Constructor = new (...args: any[]) => {};
// 现在我们使用一个泛型版本，它可以对应用此 mixin 的类施加约束
type GConstructor<T = {}> = new (...args: any[]) => T;
```

这样可以创建仅适用于有约束基类的类：

```ts twoslash
type GConstructor<T = {}> = new (...args: any[]) => T;
class Sprite {
  name = "";
  x = 0;
  y = 0;

  constructor(name: string) {
    this.name = name;
  }
}
// ---cut---
type Positionable = GConstructor<{ setPos: (x: number, y: number) => void }>;
type Spritable = GConstructor<Sprite>;
type Loggable = GConstructor<{ print: () => void }>;
```

然后，你可以创建仅在有特定基类时才起作用的 mixins：

```ts twoslash
type GConstructor<T = {}> = new (...args: any[]) => T;
class Sprite {
  name = "";
  x = 0;
  y = 0;

  constructor(name: string) {
    this.name = name;
  }
}
type Positionable = GConstructor<{ setPos: (x: number, y: number) => void }>;
type Spritable = GConstructor<Sprite>;
type Loggable = GConstructor<{ print: () => void }>;
// ---cut---

function Jumpable<TBase extends Positionable>(Base: TBase) {
  return class Jumpable extends Base {
    jump() {
      // 只有在传递了具有 setPos 定义的基类时，这个 mixin 才能起作用，这是由于 Positionable 的约束。
      this.setPos(0, 20);
    }
  };
}
```

## 替代模式

本文档的先前版本推荐一种编写 mixins 的方式，其中你分别创建运行时层次结构和类型层次结构，然后在最后将它们合并：

```ts twoslash
// @strict: false
// 每个 mixin 都是一个传统的 ES 类
class Jumpable {
  jump() {}
}

class Duckable {
  duck() {}
}

// 包括基类
class Sprite {
  x = 0;
  y = 0;
}

// 然后你创建一个接口，将期望的 mixins 与与基类同名的接口合并
interface Sprite extends Jumpable, Duckable {}
// 通过运行时的 JS 将 mixins 应用到基类
applyMixins(Sprite, [Jumpable, Duckable]);

let player = new Sprite();
player.jump();
console.log(player.x, player.y);

// 这段代码可以放在代码库中的任何位置：
function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
          Object.create(null)
      );
    });
  });
}
```

这种模式更少地依赖于编译器，更多地依赖于你的代码库来确保运行时和类型系统正确地保持同步。

## 约束

在 TypeScript 编译器内部，通过代码流分析本地支持 mixin 模式。有一些情况会使你触及本地支持的边缘。

#### 装饰器和 Mixins [`#4881`](https://github.com/microsoft/TypeScript/issues/4881)

你不能使用装饰器通过代码流分析提供 mixins：

```ts twoslash
// @experimentalDecorators
// @errors: 2339
// 一个复制 mixin 模式的装饰器函数：
const Pausable = (target: typeof Player) => {
  return class Pausable extends target {
    shouldFreeze = false;
  };
};

@Pausable
class Player {
  x = 0;
  y = 0;
}

// Player 类没有合并装饰器的类型：
const player = new Player();
player.shouldFreeze;

// 可以通过手动复制运行时方面来复制
// 类型组合或接口合并。
type FreezablePlayer = Player & { shouldFreeze: boolean };

const playerTwo = (new Player() as unknown) as FreezablePlayer;
playerTwo.shouldFreeze;
```

#### 静态属性 Mixins [`#17829`](https://github.com/microsoft/TypeScript/issues/17829)

更多是一个要注意的地方，而不是一个约束。类表达式模式创建单例，因此无法在类型系统中映射它们以支持不同的变量类型。

你可以通过使用函数返回基于泛型不同的类来解决这个问题：

```ts twoslash
function base<T>() {
  class Base {
    static prop: T;
  }
  return Base;
}

function derived<T>() {
  class Derived extends base<T>() {
    static anotherProp: T;
  }
  return Derived;
}

class Spec extends derived<string>() {}

Spec.prop; // string
Spec.anotherProp; // string
```
