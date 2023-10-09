# Quick List

* [alm.tools](#alm)
* [Atom](#atom)
* [CATS](#cats)
* [Eclipse](#eclipse)
* [Emacs](#emacs)
* [NeoVim](#neovim)
* [NetBeans](#netbeans)
* [Notepad++](#notepad)
* [Sublime Text](#sublime-text)
* [Vim](#vim)
* [Visual Studio](#visual-studio-20132015)
* [Visual Studio Code](#visual-studio-code)
* [WebStorm](#webstorm)

# alm

[alm.tools](http://alm.tools/) a complete TypeScript development environment available as a simple npm package.

```shell
npm i alm -g
```

# Atom

[Atom-TypeScript](https://atom.io/packages/atom-typescript), a TypeScript language service for Atom developed by TypeStrong

# CATS

[Code Assistant for TypeScript (CATS)](https://github.com/jbaron/cats) -  is an open source TypeScript development environment that runs on OS X, Windows, and Linux.
Since it is also written in TypeScript, it can be easily extended if required.

# Eclipse

* [TypeScript IDE for Eclipse](https://github.com/angelozerr/typescript.java/wiki/Getting-Started), an Eclipse plugin developed by Angelo Zerr.
* [Eclipse TypeScript Plug-in](https://github.com/palantir/eclipse-typescript), an Eclipse plugin developed by Palantir.

# Emacs

[tide](https://github.com/ananthakumaran/tide) - TypeScript Interactive Development Environment for Emacs

# NeoVim

TypeScript support is enabled via the built-in [Language Server Protocol](https://neovim.io/doc/user/lsp.html) client included in NeoVim since version 0.5.

# NetBeans

* [nbts](https://github.com/Everlaw/nbts) - NetBeans TypeScript editor plugin

# Notepad++

* [notepadplus-typescript](https://github.com/chai2010/notepadplus-typescript) - Notepad++ colorization support for TypeScript.

# Sublime Text

The [TypeScript Plugin for Sublime](https://github.com/Microsoft/TypeScript-Sublime-Plugin), available through [Package Control](https://packagecontrol.io/) for both Sublime Text 3 and Sublime Text 2.

# Vim

### Syntax highlighting

* [leafgarland/typescript-vim](https://github.com/leafgarland/typescript-vim) provides syntax files for highlighting `.ts` and `.d.ts` files.
* [HerringtonDarkholme/yats.vim](https://github.com/HerringtonDarkholme/yats.vim) provides more syntax highlighting and DOM keywords.

### Language Service Tools

* [Quramy/tsuquyomi](https://github.com/Quramy/tsuquyomi)

  If you would like to have as-you-type completion, you can install [YouCompleteMe](https://github.com/Valloric/YouCompleteMe) and add the following code into your `.vimrc` to specify what token will trigger the completion. YouCompleteMe will call into its respective TypeScript Plugin for semantic queries.

  ```vimscript
  if !exists("g:ycm_semantic_triggers")
    let g:ycm_semantic_triggers = {}
  endif
  let g:ycm_semantic_triggers['typescript'] = ['.']
  ```

* [mhartington/nvim-typescript](https://github.com/mhartington/nvim-typescript)

  As-you-type deoplete asynchronous completion framework for Vim 8. Needs [Shougo/deoplete.nvim](https://github.com/Shougo/deoplete.nvim) in order to work.

* [ALE](https://github.com/w0rp/ale)

  ALE (Asynchronous Lint Engine) supports as-you-type completion for TypeScript out of the box.

  ```vimscript
  " Enable completion where available.
  " This setting must be set before ALE is loaded.
  let g:ale_completion_enabled = 1
  ```

* [coc.nvim](https://github.com/neoclide/coc.nvim)

Install [coc-tsserver](https://github.com/neoclide/coc-tsserver) by command:

``` vim
:CocInstall coc-tsserver
```

[coc-tsserver](https://github.com/neoclide/coc-tsserver) provide almost same features as typescript language extension of VSCode, including completion of function calls as snippets, auto import after completion etc.

# Visual Studio

[Visual Studio](https://www.visualstudio.com/) comes with TypeScript when installing Microsoft Web Tools.

TypeScript for Visual Studio 2019 and Visual Studio 2017 (with [version 15.2 or later](https://www.visualstudio.com/en-us/news/releasenotes/vs2017-relnotes-v15.2)) can be found [here](https://marketplace.visualstudio.com/publishers/TypeScriptTeam)

TypeScript for Visual Studio 2015 with [update 3](https://www.visualstudio.com/en-us/news/releasenotes/vs2015-update3-vs) can be found [here](http://www.microsoft.com/en-us/download/details.aspx?id=48593)

TypeScript for Visual Studio 2013 can be found [here](https://www.microsoft.com/en-us/download/details.aspx?id=48739); however, its latest supported version is TypeScript 1.8.5.

# Visual Studio Code

[Visual Studio Code](https://code.visualstudio.com/), a lightweight cross-platform editor, comes with TypeScript support built in.

# Webstorm

[WebStorm](https://www.jetbrains.com/webstorm/), as well as other JetBrains IDEs, contain TypeScript language support out of the box.
