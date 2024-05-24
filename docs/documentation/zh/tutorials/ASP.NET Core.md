---
title: ASP.NET Core
layout: docs
permalink: /zh/docs/handbook/asp-net-core.html
oneline: 在 ASP.NET Core 中使用 TypeScript
---

## 安装 ASP.NET Core 和 TypeScript

首先，如果你需要的话，安装 [ASP.NET Core](https://dotnet.microsoft.com/apps/aspnet)。本快速入门指南需要 Visual Studio 2015 或 2017。

接下来，如果你的 Visual Studio 版本尚未包含最新的 TypeScript，你可以[安装它](https://www.typescriptlang.org/index.html#download-links)。

## 创建新项目

1. 选择 **文件**
2. 选择 **新建项目**（Ctrl + Shift + N）
3. 在项目搜索框中查找 **.NET Core**
4. 选择 **ASP.NET Core Web 应用程序**然后按*下一步*按钮

![Visual Studio 项目窗口截图](/images/tutorials/aspnet/createwebapp.png)

5. 给你的项目和解决方案命名。然后选择*创建*按钮

![Visual Studio 新项目窗口截图](/images/tutorials/aspnet/namewebapp.png)

6. 在最后一个窗口，选择**空**模板，然后按*创建*按钮

![Visual Studio Web 应用程序截图](/images/tutorials/aspnet/emptytemplate.png)

运行应用程序，确保它能正常工作。

![Edge 浏览器显示“Hello World”的成功截图](/images/tutorials/aspnet/workingsite.png)

### 设置服务器

打开**依赖项 > 管理 NuGet 程序包 > 浏览**。搜索并安装 `Microsoft.AspNetCore.StaticFiles` 和 `Microsoft.TypeScript.MSBuild`：

![Visual Studio 搜索 Nuget 的示例图像](/images/tutorials/aspnet/downloaddependency.png)

打开你的 `Startup.cs` 文件并编辑 `Configure` 函数使其如下所示：

```cs
public void Configure(IApplicationBuilder app, IHostEnvironment env)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }

    app.UseDefaultFiles();
    app.UseStaticFiles();
}
```

你可能需要重启 Visual Studio，使 `UseDefaultFiles` 和 `UseStaticFiles` 下面的红色波浪线消失。

## 添加 TypeScript

接下来我们将创建一个新文件夹，命名为 `scripts`。

![在 Visual Studio 中向 Web 项目添加新文件夹的步骤](/images/tutorials/aspnet/newfolder.png)

![文件夹“scripts”的位置](/images/tutorials/aspnet/scripts.png)

## 添加 TypeScript 代码

右击 `scripts` 文件夹，选择**新建项**。然后选择**TypeScript 文件**并将其命名为 `app.ts`。

![新建 TypeScript 文件的步骤](/images/tutorials/aspnet/tsfile.png)

### 添加示例代码

在 `app.ts` 文件中添加以下代码：

```ts
function sayHello() {
  const compiler = (document.getElementById("compiler") as HTMLInputElement)
    .value;
  const framework = (document.getElementById("framework") as HTMLInputElement)
    .value;
  return `来自 ${compiler} 和 ${framework} 的问候!`;
}
```

## 配置构建

_配置 TypeScript 编译器_

首先我们需要告诉 TypeScript 如何构建。右击 `scripts` 文件夹，选择 **新建项**。然后选择 **TypeScript 配置文件**并使用默认名称 `tsconfig.json`。

![新建文件对话框中选择 TypeScript JSON 配置的截图](/images/tutorials/aspnet/tsconfig.png)

将 `tsconfig.json` 文件的内容替换为：

```json tsconfig
{
  "compilerOptions": {
    "noEmitOnError": true,
    "noImplicitAny": true,
    "sourceMap": true,
    "target": "es6"
  },
  "files": ["./app.ts"],
  "compileOnSave": true
}
```

- [`noEmitOnError`](/zh/tsconfig#noEmitOnError)：如果报告任何错误，则不要发出输出。
- [`noImplicitAny`](/zh/tsconfig#noImplicitAny)：在表达式和声明中隐式 `any` 类型会引发错误。
- [`sourceMap`](/zh/tsconfig#sourceMap)：生成相应的 `.map` 文件。
- [`target`](/zh/tsconfig#target)：指定 ECMAScript 目标版本。

注意: `"ESNext"` 目标最新支持的版本。

[`noImplicitAny`](/zh/tsconfig#noImplicitAny) 是编写新代码时的一个好主意——你可以确保不会无意中编写任何未定类型的代码。通过 `"compileOnSave"`，你可以很容易地更新运行中的 web 应用程序的代码。

#### _配置 NPM_

我们需要配置 NPM 以便可以下载 JavaScript 包。右击项目并选择**新建项**。然后选择 **NPM 配置文件**并使用默认名称 `package.json`。

![在 VS 中显示新建文件对话框并选择‘npm 配置文件’的截图](/images/tutorials/aspnet/packagejson.png)

在 `package.json` 文件的 `"devDependencies"` 部分， 添加 _gulp_ 和 _del_：

```json tsconfig
"devDependencies": {
    "gulp": "4.0.2",
    "del": "5.1.0"
}
```

保存文件后，Visual Studio 应该会立即开始安装 gulp 和 del。如果没有，右击 package.json，然后选择 Restore Packages。

之后你应该在解决方案资源管理器中看到 `npm` 文件夹。

![显示 npm 文件夹的 VS 截图](/images/tutorials/aspnet/npm.png)

#### _配置 gulp_

右击项目并单击**新建项**。然后选择 **JavaScript 文件**并使用名称 `gulpfile.js`

```js
/// <binding AfterBuild='default' Clean='clean' />
/*
本文件是定义 Gulp 任务和使用 Gulp 插件的主要入口点。
点击这里了解更多信息。http://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require("gulp");
var del = require("del");

var paths = {
  scripts: ["scripts/**/*.js", "scripts/**/*.ts", "scripts/**/*.map"],
};

gulp.task("clean", function () {
  return del(["wwwroot/scripts/**/*"]);
});

gulp.task("default", function (done) {
    gulp.src(paths.scripts).pipe(gulp.dest("wwwroot/scripts"));
    done();
});
```

第一行告诉 Visual Studio 在构建完成后运行‘default’任务。它还将在你要求 Visual Studio 清理构建时运行‘clean’任务。

现在右击 `gulpfile.js` 并单击任务运行程序资源管理器。

![右击“Gulpfile.js”并选择‘任务运行程序资源管理器’的截图](/images/tutorials/aspnet/taskrunner.png)

如果‘default’和‘clean’任务没有显示，请刷新资源管理器：

![任务资源管理器中显示“Gulpfile.js”的截图](/images/tutorials/aspnet/taskrunnerrefresh.png)

## 编写 HTML 页面

右击 `wwwroot` 文件夹（如果看不到该文件夹，请尝试构建项目），并在其中添加一个名为 `index.html` 的新项。将以下代码添加进 `index.html`

```
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <script src="scripts/app.js"></script>
    <title></title>
</head>
<body>
    <div id="message"></div>
    <div>
        编译器：<input id="compiler" value="TypeScript" onkeyup="document.getElementById('message').innerText = sayHello()" /><br />
        框架：<input id="framework" value="ASP.NET" onkeyup="document.getElementById('message').innerText = sayHello()" />
    </div>
</body>
</html>
```

## 测试

1. 运行项目
2. 当你在文本框中输入时，你应该会看到消息出现/改变！

![在 Edge 中显示你刚刚编写的代码的 GIF](https://media.giphy.com/media/U3mTibRAx34DG3zhAN/giphy.gif)

## 调试

1. 在 Edge 中，按下 F12 并单击调试器选项卡。
2. 查看第一个 localhost 文件夹，然后是 scripts/app.ts
3. 在 return 语句所在的行上设置一个断点。
4. 在文本框中输入，并确认断点已命中TypeScript 代码，并且检查正常工作。

![显示你刚刚编写的代码的调试器正在运行的图像](/images/tutorials/aspnet/debugger.png)

恭喜你已经构建了自己的 .NET Core 项目，并拥有一个 TypeScript 前端。
