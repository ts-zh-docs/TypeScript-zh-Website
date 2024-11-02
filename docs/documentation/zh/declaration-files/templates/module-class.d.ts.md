---
title: "模块：类"
layout: 文档
permalink: /zh/docs/handbook/declaration-files/templates/module-class-d-ts.html
---

<!--
TODO:

1. 不清楚为什么在这里加入 UMD。
2. 给出 CommonJS 和 ES 模块的示例。
-->

例如，当你希望使用类似以下 JavaScript 代码时：

```ts
const Greeter = require("super-greeter");

const greeter = new Greeter();
greeter.greet();
```

处理通过 UMD 和模块导入的情况：

```ts
// 类型定义为 [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// 项目: [~THE PROJECT NAME~]
// 定义者: [~YOUR NAME~] <[~A URL FOR YOU~]>

/*~ 这是用于类模块的模块模板文件。
 *~ 你应该将其重命名为 index.d.ts，并将其放在与模块同名的文件夹中。
 *~ 例如，如果你为 "super-greeter" 编写一个文件，此
 *~ 文件应该是 'super-greeter/index.d.ts'
 */

// 请注意，ES6 模块无法直接导出类对象。
// 该文件应该使用 CommonJS 风格导入：
//   import x = require('[~THE MODULE~]');
//
// 或者，如果 --allowSyntheticDefaultImports 或
// --esModuleInterop 打开，该文件也可以作为默认导入导入：
//   import x from '[~THE MODULE~]';
//
// 请参阅 TypeScript 文档
// https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
// 了解 ES6 模块的此限制的常见解决方法。

/*~ 如果此模块是一个 UMD 模块，在加载到模块加载器环境之外时公开全局变量 'myClassLib'，
 *~ 请在此处声明该全局变量。
 *~ 否则，请删除此声明。
 */
export as namespace "super-greeter";

/*~ 此声明指定类构造函数
 *~ 是文件中导出的对象
 */
export = Greeter;

/*~ 在此类中编写你模块的方法和属性 */
declare class Greeter {
  constructor(customGreeting?: string);

  greet: void;

  myMethod(opts: MyClass.MyClassMethodOptions): number;
}

/*~ 如果你还想公开模块的类型，你可以
 *~ 将它们放在此块中。
 *~
 *~ 请注意，如果决定包含此命名空间，则可能会
 *~ 错误地将模块导入为命名空间对象，除非
 *~ 打开了 --esModuleInterop：
 *~   import * as x from '[~THE MODULE~]'; // 错误！不要这样做！
 */
declare namespace MyClass {
  export interface MyClassMethodOptions {
    width?: number;
    height?: number;
  }
}
```
