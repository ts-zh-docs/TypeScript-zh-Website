---
title: "模块: 函数"
layout: docs
permalink: /zh/docs/handbook/declaration-files/templates/module-function-d-ts.html
---

# 模块: 函数

当你想处理如下 JavaScript 代码时：

```ts
import greeter from "super-greeter";

greeter(2);
greeter("Hello world");
```

为了同时支持 UMD 和模块导入，你可以使用以下模板：

```ts
// [~库名称~] [~可选版本号~] 的类型定义
// 项目: [~项目名称~]
// 定义者: [~你的姓名~] <[~你的网址~]>

/*~ 这是函数模块的模块模板文件。
 *~ 你应该将其重命名为 index.d.ts 并将其放在与模块同名的文件夹中。
 *~ 例如，如果你为 "super-greeter" 编写文件，则
 *~ 此文件应为 'super-greeter/index.d.ts'
 */

// 注意，ES6 模块无法直接导出类对象。
// 此文件应使用 CommonJS 风格导入：
//   import x = require('[~模块~]');
//
// 或者，如果启用了 --allowSyntheticDefaultImports 或
// --esModuleInterop，可以将此文件作为默认导入：
//   import x from '[~模块~]';
//
// 请参阅 TypeScript 文档了解
// https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
// 以了解此 ES6 模块限制的常见解决方法。

/*~ 如果该模块是一个 UMD 模块，当在模块加载器环境之外加载时
 *~ 会暴露一个全局变量 'myFuncLib'，在此处声明该全局变量。
 *~ 否则，请删除此声明。
 */
export as namespace myFuncLib;

/*~ 此声明指定函数是从文件中导出的对象 */
export = Greeter;

/*~ 该示例显示如何为函数定义多个重载 */
declare function Greeter(name: string): Greeter.NamedReturnType;
declare function Greeter(length: number): Greeter.LengthReturnType;

/*~ 如果你还想暴露模块中的类型，可以
 *~ 将它们放在此块中。通常你会想描述
 *~ 函数的返回类型的形状；该类型应
 *~ 在这里声明，如此示例所示。
 *~
 *~ 注意，如果你决定包含此命名空间，模块可能会
 *~ 被错误地作为命名空间对象导入，除非
 *~ 启用了 --esModuleInterop：
 *~   import * as x from '[~模块~]'; // 错误！不要这样做！
 */
declare namespace Greeter {
  export interface LengthReturnType {
    width: number;
    height: number;
  }
  export interface NamedReturnType {
    firstName: string;
    lastName: string;
  }

  /*~ 如果模块还有属性，请在此声明。例如，
   *~ 此声明表示以下代码是合法的：
   *~   import f = require('super-greeter');
   *~   console.log(f.defaultName);
   */
  export const defaultName: string;
  export let defaultLength: number;
}
```
