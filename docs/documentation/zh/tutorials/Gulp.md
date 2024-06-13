---
title: Gulp
layout: docs
permalink: /zh/docs/handbook/gulp.html
oneline: 使用 Gulp 和 TypeScript
deprecated: true
---

这个快速入门指南将教你如何使用 [gulp](https://gulpjs.com) 构建 TypeScript 项目，并将 [Browserify](https://browserify.org)、[terser](https://terser.org) 或 [Watchify](https://github.com/substack/watchify) 添加到 gulp 流程中。本指南还展示了如何使用 [Babelify](https://github.com/babel/babelify) 添加 [Babel](https://babeljs.io/) 功能。

我们假设你使用的是 [Node.js](https://nodejs.org/) 和 [npm](https://www.npmjs.com/)。

## 最小项目

让我们从建立新目录开始。我们暂且将其命名为 `proj`，但你可以根据需要进行修改。

```shell
mkdir proj
cd proj
```

首先，我们将按照以下方式组织我们的项目：

```
proj/
   ├─ src/
   └─ dist/
```

TypeScript 文件将始于你的 `src` 文件夹，经过 TypeScript 编译器处理后最终将位于 `dist` 文件夹。

让我们创建这些文件夹：

```shell
mkdir src
mkdir dist
```

### 初始化项目

接下来，我们将把这个文件夹转换为 npm 包。

```shell
npm init
```

你将会得到一系列提示。你可以使用默认值，只需修改入口点。对于入口点，请使用 `./dist/main.js`。你随后可以随时返回并在生成的 `package.json` 文件中进行修改。

### 安装依赖项

现在我们可以使用 `npm install` 来安装包。首先全局安装 `gulp-cli`（如果你使用的是 Unix 系统，可能需要在本指南中的 `npm install` 命令前加上 `sudo`）。

```shell
npm install -g gulp-cli
```

然后在你的项目的开发依赖中安装 `typescript`、`gulp` 和 `gulp-typescript`。[Gulp-typescript](https://www.npmjs.com/package/gulp-typescript) 是一个用于 TypeScript 的 gulp 插件。

```shell
npm install --save-dev typescript gulp@4.0.0 gulp-typescript
```

### 编写一个简单的示例

让我们编写 Hello World 程序。在 `src` 目录下创建文件 `main.ts`：

```ts
function hello(compiler: string) {
  console.log(`Hello from ${compiler}`);
}
hello("TypeScript");
```

在项目根目录（`proj`）下，创建文件 `tsconfig.json`：

```json tsconfig
{
  "files": ["src/main.ts"],
  "compilerOptions": {
    "noImplicitAny": true,
    "target": "es5"
  }
}
```

### 创建 `gulpfile.js`

在项目根目录下，创建文件 `gulpfile.js`：

```js
var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

gulp.task("default", function () {
  return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest("dist"));
});
```

### 测试生成的应用程序

```shell
gulp
node dist/main.js
```

该程序应该会输出“Hello from TypeScript!”。

## 向代码添加模块

在我们开始使用 Browserify 之前，让我们扩展我们的代码并添加模块。这是你在实际应用程序中更有可能使用的结构。

创建一个名为 `src/greet.ts` 的文件：

```ts
export function sayHello(name: string) {
  return `Hello from ${name}`;
}
```

现在将 `src/main.ts` 中的代码更改为从 `greet.ts` 导入 `sayHello`：

```ts
import { sayHello } from "./greet";

console.log(sayHello("TypeScript"));
```

最后，将 `src/greet.ts` 添加到 `tsconfig.json`：

```json tsconfig
{
  "files": ["src/main.ts", "src/greet.ts"],
  "compilerOptions": {
    "noImplicitAny": true,
    "target": "es5"
  }
}
```

通过运行 `gulp` 并在 Node 中进行测试，确保模块能够正常工作：

```shell
gulp
node dist/main.js
```

请注意，即使我们使用了 ES2015 的模块语法，TypeScript 也会生成 Node 使用的 CommonJS 模块。在本教程中，我们将继续使用 CommonJS，但你可以通过在选项对象中设置 `module` 来进行更改。

## Browserify

现在让我们将这个项目从 Node 移植到浏览器中。为了做到这一点，我们希望将所有的模块捆绑到单个 JavaScript 文件中。幸运的是，这正是 Browserify 所做的。更好的是，它允许我们使用 Node 所使用的 CommonJS 模块系统，这也是 TypeScript 的默认输出。这意味着我们的 TypeScript 和 Node 设置基本上可以无缝迁移到浏览器中。

首先，安装 browserify、[tsify](https://www.npmjs.com/package/tsify) 和 vinyl-source-stream。tsify 是 Browserify 的一个插件，与 gulp-typescript 类似，可以访问 TypeScript 编译器。vinyl-source-stream 让我们能够将 Browserify 的文件输出适配回 gulp 可以理解的一种格式，这种格式名为 [vinyl](https://github.com/gulpjs/vinyl)。

```shell
npm install --save-dev browserify tsify vinyl-source-stream
```

### 创建一个页面

在 `src` 目录下创建一个名为 `index.html` 的文件：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Hello World!</title>
  </head>
  <body>
    <p id="greeting">Loading ...</p>
    <script src="bundle.js"></script>
  </body>
</html>
```

现在修改 `main.ts` 来更新页面内容：

```ts
import { sayHello } from "./greet";

function showHello(divName: string, name: string) {
  const elt = document.getElementById(divName);
  elt.innerText = sayHello(name);
}

showHello("greeting", "TypeScript");
```

调用 `showHello` 函数会调用 `sayHello` 函数来改变段落的文本内容。现在修改你的 gulpfile 如下所示：

```js
var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var tsify = require("tsify");
var paths = {
  pages: ["src/*.html"],
};

gulp.task("copy-html", function () {
  return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

gulp.task(
  "default",
  gulp.series(gulp.parallel("copy-html"), function () {
    return browserify({
      basedir: ".",
      debug: true,
      entries: ["src/main.ts"],
      cache: {},
      packageCache: {},
    })
      .plugin(tsify)
      .bundle()
      .pipe(source("bundle.js"))
      .pipe(gulp.dest("dist"));
  })
);
```

这里添加了 `copy-html` 任务，并将其作为 `default` 的依赖项。这意味着每次运行 `default` 任务时，必须首先运行 `copy-html` 任务。我们还将 `default` 修改为使用带有 tsify 插件的 Browserify 调用，而不是使用 gulp-typescript。方便的是，它们都允许我们将相同的选项对象传递给 TypeScript 编译器。

在调用 `bundle` 后，我们使用 `source`（我们为 vinyl-source-stream 设置的别名）将输出包命名为 `bundle.js`。

通过运行 gulp 并在浏览器中打开 `dist/index.html` 来测试页面。你应该在页面上看到“Hello from TypeScript”。

注意我们在 Browserify 中指定了 `debug: true`。这会导致 tsify 在打包的 JavaScript 文件中生成源映射。源映射允许你在浏览器中调试原始的 TypeScript 代码，而不是打包后的 JavaScript 代码。你可以通过打开浏览器的调试器，并在 `main.ts` 中设置断点来测试源映射是否正常工作。当你刷新页面时，断点应该会暂停页面，并让你调试 `greet.ts` 文件。

## Watchify、Babel 以及 Terser

现在我们正在使用 Browserify 和 tsify 来打包代码，我们可以通过 browserify 插件添加各种特性到我们的构建过程中。

- Watchify 启动 gulp 并保持其运行，每当你保存文件时，它会进行增量编译。这使得你可以在浏览器中保持编辑-保存-刷新的循环进行。

- Babel 是一个非常灵活的编译器，可以将 ES2015 及更高版本转换为 ES5 和 ES3。这使你可以添加广泛且定制化的转换，而 TypeScript 不支持这些转换。

- Terser 可以压缩你的代码，以减少下载时间。

### Watchify

我们将从 Watchify 开始，以提供后台编译功能：

```shell
npm install --save-dev watchify fancy-log
```

现在将你的 gulpfile 修改为以下内容：

```shell
npm install --save-dev watchify fancy-log
```

现在将你的 gulpfile 改为以下内容：

```js
var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var watchify = require("watchify");
var tsify = require("tsify");
var fancy_log = require("fancy-log");
var paths = {
  pages: ["src/*.html"],
};

var watchedBrowserify = watchify(
  browserify({
    basedir: ".",
    debug: true,
    entries: ["src/main.ts"],
    cache: {},
    packageCache: {},
  }).plugin(tsify)
);

gulp.task("copy-html", function () {
  return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

function bundle() {
  return watchedBrowserify
    .bundle()
    .on("error", fancy_log)
    .pipe(source("bundle.js"))
    .pipe(gulp.dest("dist"));
}

gulp.task("default", gulp.series(gulp.parallel("copy-html"), bundle));
watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", fancy_log);
```

这里基本上有三个变化，但它们需要你对代码进行一些重构。

1. 我们将 `browserify` 实例包装在 `watchify` 的调用中，并将结果保存下来。
2. 我们调用 `watchedBrowserify.on('update', bundle);`，这样当你的任何一个 TypeScript 文件发生更改时，Browserify 将运行 `bundle` 函数。
3. 我们调用 `watchedBrowserify.on('log', fancy_log);` 将日志记录到控制台中。

通过 (1) 和 (2)，我们需要将对 `browserify` 的调用移出 `default` 任务。并且我们需要给 `default` 函数一个名称，因为 Watchify 和 Gulp 都需要调用它。添加 (3) 的日志记录是可选的，但对于调试你的设置非常有用。

现在当你运行 Gulp 时，它应该开始运行并保持运行状态。尝试更改 `main.ts` 中的 `showHello` 函数的代码并保存它。你应该会看到类似以下的输出：

```shell
proj$ gulp
[10:34:20] Using gulpfile ~/src/proj/gulpfile.js
[10:34:20] Starting 'copy-html'...
[10:34:20] Finished 'copy-html' after 26 ms
[10:34:20] Starting 'default'...
[10:34:21] 2824 bytes written (0.13 seconds)
[10:34:21] Finished 'default' after 1.36 s
[10:35:22] 2261 bytes written (0.02 seconds)
[10:35:24] 2808 bytes written (0.05 seconds)
```

### Terser

首先安装 Terser。由于 Terser 的用途是混淆你的代码，我们还需要安装 vinyl-buffer 和 gulp-sourcemaps 来保持源映射的工作。

```shell
npm install --save-dev gulp-terser vinyl-buffer gulp-sourcemaps
```

现在将你的 gulpfile 修改为以下内容：

```js
var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var terser = require("gulp-terser");
var tsify = require("tsify");
var sourcemaps = require("gulp-sourcemaps");
var buffer = require("vinyl-buffer");
var paths = {
  pages: ["src/*.html"],
};

gulp.task("copy-html", function () {
  return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

gulp.task(
  "default",
  gulp.series(gulp.parallel("copy-html"), function () {
    return browserify({
      basedir: ".",
      debug: true,
      entries: ["src/main.ts"],
      cache: {},
      packageCache: {},
    })
      .plugin(tsify)
      .bundle()
      .pipe(source("bundle.js"))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(terser())
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest("dist"));
  })
);
```

请注意，`terser` 本身只有一个调用，`buffer` 和 `sourcemaps` 的调用是为了确保源映射继续工作。这些调用使我们获得了一个单独的源映射文件，而不是像之前那样使用内联源映射。现在可以运行 Gulp，并检查 `bundle.js` 是否被压缩成一个难以阅读的混乱代码：

```shell
gulp
cat dist/bundle.js
```

### Babel

首先安装 Babelify 和 ES2015 的 Babel preset。与 Terser 类似，Babelify 会混淆代码，因此我们需要 vinyl-buffer 和 gulp-sourcemaps。默认情况下，Babelify 只会处理带有 `.js`、`.es`、`.es6` 和 `.jsx` 扩展名的文件，所以我们需要将 `.ts` 扩展名添加为 Babelify 的选项。

```shell
npm install --save-dev babelify@8 babel-core babel-preset-es2015 vinyl-buffer gulp-sourcemaps
```

现在将你的 gulpfile 修改为以下内容：

```js
var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var tsify = require("tsify");
var sourcemaps = require("gulp-sourcemaps");
var buffer = require("vinyl-buffer");
var paths = {
  pages: ["src/*.html"],
};

gulp.task("copy-html", function () {
  return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

gulp.task(
  "default",
  gulp.series(gulp.parallel("copy-html"), function () {
    return browserify({
      basedir: ".",
      debug: true,
      entries: ["src/main.ts"],
      cache: {},
      packageCache: {},
    })
      .plugin(tsify)
      .transform("babelify", {
        presets: ["es2015"],
        extensions: [".ts"],
      })
      .bundle()
      .pipe(source("bundle.js"))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest("dist"));
  })
);
```

我们还需要将 TypeScript 的目标设置为 ES2015。然后，Babel 将根据 TypeScript 生成的 ES2015 代码生成 ES5 代码。让我们修改 `tsconfig.json` 文件：

```json tsconfig
{
  "files": ["src/main.ts"],
  "compilerOptions": {
    "noImplicitAny": true,
    "target": "es2015"
  }
}
```

对于这样一个简单的脚本，Babel 生成的 ES5 输出应该与 TypeScript 的输出非常相似。
