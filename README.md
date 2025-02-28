# testcafe-reporter-made-by-margarit

[![Build Status](https://travis-ci.org/margaritluch/testcafe-reporter-made-by-margarit.svg)](https://travis-ci.org/margaritluch/testcafe-reporter-made-by-margarit)

This is the **made-by-margarit** reporter plugin for [TestCafe](http://devexpress.github.io/testcafe).

## Install

```
npm install testcafe-reporter-made-by-margarit
```

## Usage

Before using Testrail publisher, You need to set testcase description in `specific format` as per below.

##### Format:

```
test('<< Group Name>> | << Test Name >> | << Testrail Case_ID >> ', async t => { .... });

<< Group Name >> - It can be any like smoke, sanity, functional.
<< Test Name >>  - Test name of the test case
<< Testrail Case_ID >>  - case ID of testrail's test case (The testcase should be present in the given PROJECT_NAME). Case id-s can be found in testrail

Example:

test('Regression | Verify the Login Page | C875986 ', async t=> { ... });
```

If you want you can also add test steps in the comment field every time tests are run. You can do it the following way:

```
const LoiginTest_Steps =[];
test.meta({ steps: LoginTest_Steps })('<< Group Name>> | << Test Name >> | << Testrail Case_ID >> ', async t => {
    await t.click(x_button);
    LoginTest_Steps.push("I click on x button);
});
```

You can also use meta for conditionally skipping the test. If you use the word 'skipped', when adding message to meta object then the test will be skipped, fx

```
const LoiginTest_Steps =[];
test.meta({ steps: LoginTest_Steps })('<< Group Name>> | << Test Name >> | << Testrail Case_ID >> ', async t => {
    let a = 5;
    let b = 5;
    if(a===b)
    {
       LoginTest_Steps.push("I skipped the test because a=b);
    }else{
    await t.click(x_button);
    LoginTest_Steps.push("I click on x button);
    }
});
```

The result will look like this in Testrail:
![Steps in Testrail](/media/reporter_steps.png)

##### Environment Variables

You need to add a file with .env extension into your project and define all the environment variables there.

```
TESTRAIL_ENABLE : set true to enable Testrail api | default: false
TESTRAIL_HOST : the url to your testrail api
TESTRAIL_USER : username
TESTRAIL_PASS : password or api key
RUN_ID : the id of the testrun where the reesults will be added
```

When you run tests from the command line, specify the reporter name by using the `--reporter` option:

```
testcafe chrome 'path/to/test/file.js' --reporter made-by-margarit
```

When you use API, pass the reporter name to the `reporter()` method:

```js
testCafe
    .createRunner()
    .src("path/to/test/file.js")
    .browsers("chrome")
    .reporter("made-by-margarit") // <-
    .run();
```

## Author

Margarit Holm
