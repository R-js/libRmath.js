

#### Istanbul reporters

##### nycrc.reporter

* `clover`: creates file `coverage/clover.xml`.
* `cobertura`: creates file `coverage/cobertura-coverage.xml`
* `html`: creates files in `coverage/` root folder,
  * `base.css`
  * `index.html`
  * `prettify.css`
  * `prettify.js`
  * `sort-arrow-sprite.png`
  * `sorter.js`
  *  ..and subdirectories of html files following the project source directory structure
* `json`: creates file `coverage/coverage-final.json`
* `json-summary`: creates file `coverage/coverage-summary.json`
* `lcov`: creates 
  * `coverage/lcov.info`
  * `coverage/lcov-report/*[html,css,js]` same as `html` option, but under `lcov-report/*` subdir.
* `lcovonly`: generates only `coverage/lcov.info`
* `none`: generates nothing
* `teamcity`: no creation of `coverage` subdir, only small table of statistics to `stdout`, doesnt make sense to specify in `.nycrc` file. Usage probably looks more like this `nyc report --reporter=teamcity > somefile`
* `text`: prints ascii table (colored) to the console, no file is created, Usage probably looks more like: `nyc report --reporter=text > somefile`
* `text-lcov`: prints `lcov` information to `stdout`. Usage looks more like this `nyc report --reporter=teamcity > lcov.info`
* `text-summary`: prints summary info (colorized) to the console. Usage probably looks more like `nyc report --reporter=text-summary > somefile`


##### nyrc.check-coverage

If this is true it will fail in a weird way. The error looks like this

```bash
events.js:137
      throw er; // Unhandled 'error' event
      ^

Error: spawn nyc ENOENT
    at notFoundError (C:\Users\jacob\git-projects\libRmath.js\node_modules\cross-spawn\lib\enoent.js:11:11)
    at verifyENOENT (C:\Users\jacob\git-projects\libRmath.js\node_modules\cross-spawn\lib\enoent.js:46:16)
    at ChildProcess.cp.emit (C:\Users\jacob\git-projects\libRmath.js\node_modules\cross-spawn\lib\enoent.js:33:19)
    at Process.ChildProcess._handle.onexit (internal/child_process.js:209:12)
```

Despite the error (and in the case of no error in case all goes well) `/coverage/*`
 directory will be created and populated
 (dependent on the `nycrc.reporter` option settings).