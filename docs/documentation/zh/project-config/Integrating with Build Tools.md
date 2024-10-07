---
title: 与构建工具集成
layout: docs
permalink: /zh/docs/handbook/integrating-with-build-tools.html
oneline: 如何将 TypeScript 与其他构建工具一起使用
---

## Babel

### 安装

```sh
npm install @babel/cli @babel/core @babel/preset-typescript --save-dev
```

### .babelrc

```js
{
  "presets": ["@babel/preset-typescript"]
}
```

### 使用命令行接口

```sh
./node_modules/.bin/babel --out-file bundle.js src/index.ts
```

### package.json

```js
{
  "scripts": {
    "build": "babel --out-file bundle.js main.ts"
  },
}
```

### 通过命令行执行 Babel

```sh
npm run build
```

## Browserify

### 安装

```sh
npm install tsify
```

### 使用命令行接口

```sh
browserify main.ts -p [ tsify --noImplicitAny ] > bundle.js
```

### 使用 API

```js
var browserify = require("browserify");
var tsify = require("tsify");

browserify()
  .add("main.ts")
  .plugin("tsify", { noImplicitAny: true })
  .bundle()
  .pipe(process.stdout);
```

更多细节，详见：[smrq/tsify](https://github.com/smrq/tsify)

## Grunt

### 使用 `grunt-ts`（已停止维护）

#### 安装

```sh
npm install grunt-ts --save-dev
```

#### 基础的 Gruntfile.js

```js
module.exports = function (grunt) {
  grunt.initConfig({
    ts: {
      default: {
        src: ["**/*.ts", "!node_modules/**/*.ts"],
      },
    },
  });
  grunt.loadNpmTasks("grunt-ts");
  grunt.registerTask("default", ["ts"]);
};
```

更多细节，详见：[TypeStrong/grunt-ts](https://github.com/TypeStrong/grunt-ts)

### 将 `grunt-browserify` 以及 `tsify` 组合在一起使用

#### 安装

```sh
npm install grunt-browserify tsify --save-dev
```

#### 基础的 Gruntfile.js

```js
module.exports = function (grunt) {
  grunt.initConfig({
    browserify: {
      all: {
        src: "src/main.ts",
        dest: "dist/main.js",
        options: {
          plugin: ["tsify"],
        },
      },
    },
  });
  grunt.loadNpmTasks("grunt-browserify");
  grunt.registerTask("default", ["browserify"]);
};
```

更多细节，参见：[jmreidy/grunt-browserify](https://github.com/jmreidy/grunt-browserify)、[TypeStrong/tsify](https://github.com/TypeStrong/tsify)

## Gulp

### 安装

```sh
npm install gulp-typescript
```

### 基础的 gulpfile.js

```js
var gulp = require("gulp");
var ts = require("gulp-typescript");

gulp.task("default", function () {
  var tsResult = gulp.src("src/*.ts").pipe(
    ts({
      noImplicitAny: true,
      out: "output.js",
    })
  );
  return tsResult.js.pipe(gulp.dest("built/local"));
});
```

更多细节，参见：[ivogabe/gulp-typescript](https://github.com/ivogabe/gulp-typescript)

## Jspm

### 安装

```sh
npm install -g jspm@beta
```

_注： 目前， TypeScript 在 jspm 中的 0.16beta 版本中受支持。_

更多细节，参见：[TypeScriptSamples/jspm](https://github.com/Microsoft/TypeScriptSamples/tree/master/jspm)

## MSBuild

更新项目文件以包含本地安装的 `Microsoft.TypeScript.Default.props`（位于顶部）和 `Microsoft.TypeScript.target`（位于底部）文件：

```xml
<?xml version="1.0" encoding="utf-8"?>
<Project ToolsVersion="4.0" DefaultTargets="Build" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <!-- 在顶部包含默认属性 -->
  <Import
      Project="$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.Default.props"
      Condition="Exists('$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.Default.props')" />

  <!-- TypeScript 配置在这里 -->
  <PropertyGroup Condition="'$(Configuration)' == 'Debug'">
    <TypeScriptRemoveComments>false</TypeScriptRemoveComments>
    <TypeScriptSourceMap>true</TypeScriptSourceMap>
  </PropertyGroup>
  <PropertyGroup Condition="'$(Configuration)' == 'Release'">
    <TypeScriptRemoveComments>true</TypeScriptRemoveComments>
    <TypeScriptSourceMap>false</TypeScriptSourceMap>
  </PropertyGroup>

  <!-- 默认目标在底部 -->
  <Import
      Project="$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.targets"
      Condition="Exists('$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.targets')" />
</Project>
```

有关配置 MSBuild 编译器选项的更多详情：[在 MSBuild 项目中设置编译器选项](/docs/handbook/compiler-options-in-msbuild.html)

## NuGet

- 右击 -> 管理 NuGet 软件包
- 搜索 `Microsoft.TypeScript.MSBuild`
- 点击 `Install`
- 安装完成后，重新构建！

更多详情，请参阅[软件包管理器对话框](http://docs.nuget.org/Consume/Package-Manager-Dialog) 和[使用 NuGet 进行每日构建](https://github.com/Microsoft/TypeScript/wiki/Nightly-drops#using-nuget-with-msbuild)

## Rollup

### 安装

```
npm install @rollup/plugin-typescript --save-dev
```

请注意，`typescript` 和 `tslib` 都是该插件的对等依赖项，需要单独安装。

### 用法

创建 `rollup.config.js` [配置文件](https://www.rollupjs.org/guide/en/#configuration-files) 并导入插件：

```js
// rollup.config.js
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'output',
    format: 'cjs'
  },
  plugins: [typescript()]
};
```

## Svelte 编译器

### 安装

```
npm install --save-dev svelte-preprocess
```

请注意，`typescript` 是本插件的可选对等依赖项，需要单独安装。`tslib` 也没有被提供。

你也可以考虑使用 [`svelte-check`](https://www.npmjs.com/package/svelte-check)进行命令行类型检查。

### 用法

创建 `svelte.config.js` 配置文件并导入插件：

```js
// svelte.config.js
import preprocess from 'svelte-preprocess';

const config = {
  // 查询 https://github.com/sveltejs/svelte-preprocess
  // 获取更多有关预处理器的信息
  preprocess: preprocess()
};

export default config;
```

现在，你可以指定使用 TypeScript 编写脚本块：

```
<script lang="ts">
```

## Vite

Vite 原生支持导入 `.ts` 文件。 它只进行转译，不进行类型检查。它还要求某些 `compilerOptions` 具有特定的值。详情请参见 [Vite 文档](https://vitejs.dev/guide/features.html#typescript)。

## Webpack

### 安装

```sh
npm install ts-loader --save-dev
```

### 使用 Webpack 5 或 4 时的基础 webpack.config.js

```js
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
```

此处参见 [ts-loader 的更多详情](https://www.npmjs.com/package/ts-loader)。

替代品：

- [awesome-typescript-loader](https://www.npmjs.com/package/awesome-typescript-loader)
