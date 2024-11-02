---
title: "Module: Plugin"
layout: docs
permalink: /zh/docs/handbook/declaration-files/templates/module-plugin-d-ts.html
---

例如，当你想要使用扩展另一个库的 JavaScript 代码时。

```ts
import { greeter } from "super-greeter";

// 正常的问候 API
greeter(2);
greeter("Hello world");

// 现在我们在运行时用一个新函数扩展对象
import "hyper-super-greeter";
greeter.hyperGreet();
```

对于“super-greeter”的定义：

```ts
/*~ 此示例展示了如何让函数有多个重载 */
export interface GreeterFunction {
  (name: string): void
  (time: number): void
}

/*~ 此示例展示了如何导出由接口指定的函数 */
export const greeter: GreeterFunction;
```

我们可以像下面这样扩展现有模块：

```ts
// 类型定义为 [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// 项目: [~THE PROJECT NAME~]
// 定义者: [~YOUR NAME~] <[~A URL FOR YOU~]>

/*~ 这是模块插件模板文件。你应该将其重命名为 index.d.ts
 *~ 并将其放在与模块同名的文件夹中。
 *~ 例如，如果你为 "super-greeter" 编写一个文件，此
 *~ 文件应该是 'super-greeter/index.d.ts'
 */

/*~ 在此行上，导入此模块添加的模块 */
import { greeter } from "super-greeter";

/*~ 在此处，声明与上面导入的模块相同的模块
 *~ 然后我们扩展 greeter 函数的现有声明
 */
export module "super-greeter" {
  export interface GreeterFunction {
    /** 更好的问候！ */
    hyperGreet(): void;
  }
}
```

这使用了[声明合并](/zh/docs/handbook/declaration-merging.html)

## ES6 对模块插件的影响

有些插件在现有模块上添加或修改顶级导出。虽然这在 CommonJS 和其他加载器中是合法的，但 ES6 模块被认为是不可变的，这种模式将不再可能。由于 TypeScript 是与加载器无关的，因此没有编译时强制执行此策略，但打算迁移到 ES6 模块加载器的开发人员应该注意这一点。
