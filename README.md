# testcafe-reporter-made-by-margarit
[![Build Status](https://travis-ci.org/margaritluch/testcafe-reporter-made-by-margarit.svg)](https://travis-ci.org/margaritluch/testcafe-reporter-made-by-margarit)

This is the **made-by-margarit** reporter plugin for [TestCafe](http://devexpress.github.io/testcafe).

<p align="center">
    <img src="https://raw.github.com/margaritluch/testcafe-reporter-made-by-margarit/master/media/preview.png" alt="preview" />
</p>

## Install

```
npm install testcafe-reporter-made-by-margarit
```

## Usage

When you run tests from the command line, specify the reporter name by using the `--reporter` option:

```
testcafe chrome 'path/to/test/file.js' --reporter made-by-margarit
```


When you use API, pass the reporter name to the `reporter()` method:

```js
testCafe
    .createRunner()
    .src('path/to/test/file.js')
    .browsers('chrome')
    .reporter('made-by-margarit') // <-
    .run();
```

## Author
Margarit 
