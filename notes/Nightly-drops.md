A nightly build from the [main](https://github.com/Microsoft/TypeScript/tree/main) branch is published nightly to NPM and NuGet. Here is how you can get it and use it with your tools.

## Using npm

```shell
npm install -g typescript@next
```

## Using NuGet with MSBuild:

> Note: You'll need to configure your project to use the NuGet packages. Please see [Configuring MSBuild projects to use NuGet](https://github.com/Microsoft/TypeScript/wiki/Configuring-MSBuild-projects-to-use-NuGet) for more information.

The nightlies are available on https://www.myget.org/gallery/typescript-preview

There are two packages:

* `Microsoft.TypeScript.Compiler`: Tools only (`tsc.exe`, `lib.d.ts`, etc.) .
* `Microsoft.TypeScript.MSBuild`: Tools as above, as well as MSBuild tasks and targets (`Microsoft.TypeScript.targets`, `Microsoft.TypeScript.Default.props`, etc.)


## Visual Studio Code 

1. Install the npm package `npm install typescript@next`, to your local `node_modules` folder.
2. Update, `.vscode/settings.json` with the following:

   ```json
   "typescript.tsdk": "<path to your folder>/node_modules/typescript/lib"
   ```

## Sublime Text

1. Install the npm package `npm install typescript@next`, to a local `node_modules` folder, then
2. Update the `Settings - User` file with the following:

   ```json
   "typescript_tsdk": "<path to your folder>/node_modules/typescript/lib"
   ```

More information is available at: https://github.com/Microsoft/TypeScript-Sublime-Plugin#installation
