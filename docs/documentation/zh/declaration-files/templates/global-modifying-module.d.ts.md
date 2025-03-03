---
title: "全局修改模块"
layout: docs
permalink: /zh/docs/handbook/declaration-files/templates/global-modifying-module-d-ts.html
---

## 全局修改模块

全局修改模块在导入时会更改全局作用域中的现有值。例如，可能存在一个库，在导入时会向 `String.prototype` 添加新成员。这种模式有一定的风险，因为可能会发生运行时冲突，但我们仍然可以为其编写声明文件。

## 识别全局修改模块

全局修改模块通常可以通过其文档轻松识别。一般来说，它们类似于全局插件，但需要一个 `require` 调用来激活其效果。

你可能会看到如下文档：

```js
// 不使用返回值的 'require' 调用
var unused = require("magic-string-time");
/* 或 */
require("magic-string-time");

var x = "hello, world";
// 在内置类型上创建新方法
console.log(x.startsWithHello());

var y = [1, 2, 3];
// 在内置类型上创建新方法
console.log(y.reverseAndSort());
```

## 示例

```ts
// [~库名称~] [~可选版本号~] 的类型定义
// 项目: [~项目名称~]
// 定义者: [~你的姓名~] <[~你的网址~]>

/*~ 这是全局修改模块模板文件。你应该将其重命名为 index.d.ts
 *~ 并将其放在与模块同名的文件夹中。
 *~ 例如，如果你为 "super-greeter" 编写文件，则
 *~ 此文件应为 'super-greeter/index.d.ts'
 */

/*~ 注意：如果你的全局修改模块是可调用或可构造的，
 *~ 你需要将这里的模式与模块类或模块函数模板文件中的模式结合
 */
declare global {
  /*~ 在这里声明放入全局命名空间的内容，或增强
   *~ 全局命名空间中现有声明
   */
  interface String {
    fancyFormat(opts: StringFormatOptions): string;
  }
}

/*~ 如果你的模块导出类型或值，请按常规方式编写 */
export interface StringFormatOptions {
  fancinessLevel: number;
}

/*~ 例如，在模块上声明一个方法（除了其全局副作用） */
export function doSomething(): void;

/*~ 如果你的模块不导出任何内容，你需要这一行。否则，请删除它 */
export {};
```
