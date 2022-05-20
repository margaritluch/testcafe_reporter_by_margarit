/*dotenv is a module that loads environment variables from a .env file into process.env */
require("dotenv").config();

let TestRail = require("@dlenroc/testrail");

exports["default"] = function () {
    return {
        //default values
        noColors: false,
        startTime: null,
        testCount: 0,
        agents: "",
        passed: "",
        failed: "",
        EnableTestrail: false,
        SuiteID: 0,
        PlanName: "",
        currentFixtureName: null,
        TestrailUserName: null,
        TestrailPassword: null,
        TestrailHost: null,
        testEndTime: "",
        totalTaskTime: "",
        afterErrList: false,
        skipped: 0,
        output: "",
        testResult: [],
        passed: "",
        failed: "",
        totalTaskTime: "",
        errorTestData: [],
        creationDate: "",
        PlanID: 0,
        ProjectID: 0,
        ConfigID: [],

        reportTaskStart(startTime, userAgents, testCount) {
            this.startTime = new Date();
            this.testCount = testCount;
            this.setIndent(2)
                .useWordWrap(true)
                .write(
                    "--------------------------------------------------------------------"
                )
                .newline()
                .write("|        Running tests in:")
                .write(this.chalk.blue(userAgents))
                .write("|")
                .newline()
                .write(
                    "--------------------------------------------------------------------"
                )
                .newline();
            this.agents = userAgents;
            this.EnableTestrail = process.env.TESTRAIL_ENABLE == "true";
            this.TestrailHost = process.env.TESTRAIL_HOST;
            this.TestrailPassword = process.env.TESTRAIL_PASS;
            this.TestrailUserName = process.env.TESTRAIL_USER;
            this.ProjectID = Number(process.env.PROJECT_ID);
            this.PlanID = Number(process.env.PLAN_ID);
            this.SuiteID = Number(process.env.SUITE_ID);

            if (this.EnableTestrail) {
                if (
                    !this.ProjectID ||
                    !this.SuiteID ||
                    !this.PlanID ||
                    !this.TestrailHost ||
                    !this.TestrailPassword ||
                    !this.TestrailUserName
                ) {
                    this.newline().write(
                        this.chalk.red.bold(
                            "Error:  TESTRAIL_HOST, TESTRAIL_USER, TESTRAIL_PASS, PROJECT_ID, PLAN_ID and SUITE_ID must be set as environment variables inside .env file for the reporter plugin to push the result to the Testrail"
                        )
                    );
                    process.exit(1);
                }
            }
        },

        reportFixtureStart(name) {
            this.currentFixtureName = name;
        },

        reportTestDone(name, testRunInfo, meta) {
            this.testEndTime = new Date();
            let numberOfErrors = testRunInfo.errs.length;
            let result =
                numberOfErrors === 0
                    ? this.chalk.green("Passed")
                    : this.chalk.red("Failed");
            let fixtureName = this.currentFixtureName + " - " + name;
            let title = result + " " + fixtureName;
            this.write(title).newline();
            let testOutput = {};
            let testStatus = "";

            if (testRunInfo.skipped) {
                testStatus = "Skipped";
            } else if (numberOfErrors === 0) {
                testStatus = "Passed";
            } else {
                testStatus = "Failed";
            }
            testOutput[0] = this.currentFixtureName;
            testOutput[1] = name;
            testOutput[2] = testStatus;
            testOutput[3] = this.moment
                .duration(testRunInfo.durationMs)
                .format("h[h] mm[m] ss[s]");
            testOutput[5] = meta.steps;
            console.log("testoutput 2 is " + testOutput[2]);
            let error = {};
            //let screenshots ={};

            if (testRunInfo.skipped) {
                this.skipped++;
            }
            let self = this;
            if (numberOfErrors > 0) {
                error[0] = this.currentFixtureName;
                error[1] = name;
                error[2] = "";
                testOutput[4] = "";
                this.renderErrors(testRunInfo.errs);
                testRunInfo.errs.forEach(function (err, idx) {
                    error[2] += self
                        .formatError(err, idx + 1 + ") ")
                        .replace(/(?:\r\n|\r|\n)/g, "<br />")
                        .replace(
                            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
                            ""
                        );
                    testOutput[4] += self
                        .formatError(err, idx + 1 + ") ")
                        .replace(
                            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
                            ""
                        );
                });
                this.errorTestData.push(error);
            }

            this.testResult.push(testOutput);
        },

        reportTaskDone(endTime, passed) {
            let durationMs = endTime - this.startTime;
            let durationStr = this.moment
                .duration(durationMs)
                .format("h[h] mm[m] ss[s]");
            this.totalTaskTime = durationStr;
            let footer =
                passed === this.testCount
                    ? this.testCount + " Passed"
                    : this.testCount -
                      passed +
                      "/" +
                      this.testCount +
                      " Failed";
            footer += " (Duration: " + durationStr + ")";

            if (this.skipped > 0) {
                this.write(
                    this.chalk.cyan(this.skipped + " Skipped")
                ).newline();
            }

            this.passed = passed;
            this.failed = this.testCount - passed;
            this.write(footer).newline();
            let date = new Date();
            this.creationDate =
                date.getDate() +
                "_" +
                (date.getMonth() + 1) +
                "_" +
                date.getFullYear() +
                "_" +
                date.getHours() +
                "_" +
                date.getMinutes() +
                "_" +
                date.getSeconds();

            if (this.EnableTestrail) {
                this.publishResultToTestrail();
            }
        },

        renderErrors(errs) {
            let self = this;
            self.setIndent(3).newline();
            errs.forEach(function (err, idx) {
                let prefix = self.chalk.red(idx + 1 + ") ");
                self.newline()
                    .write(self.formatError(err, prefix))
                    .newline()
                    .newline();
            });
        },

        publishResultToTestrail() {
            let resultsTestcases = [];
            let caseidList = [];
            this.newline()
                .newline()
                .write("------------------------------------------------------")
                .newline()
                .write(
                    this.chalk.green("Publishing the result to testrail...")
                );

            for (let index in this.testResult) {
                let testDesc = this.testResult[index][1].split("|"); // split the Test Description

                let caseID = null;

                if (typeof testDesc[2] === "undefined") {
                    // verify that Case_ID  of test is present
                    this.newline()
                        .write(this.chalk.red.bold(this.symbols.err))
                        .write(
                            "Warning:  Test: " +
                                this.testResult[index][1] +
                                " missing the Testrail ID"
                        );
                    continue;
                }

                caseID = String(testDesc[2]).toUpperCase().replace("C", ""); // remove the prefix C from CaseID
                //to check that caseID is valid ID using isnumber function

                if (isNaN(caseID)) {
                    this.newline()
                        .write(this.chalk.red.bold(this.symbols.err))
                        .write(
                            "Warning:  Test: " +
                                this.testResult[index][1] +
                                " contains invalid Test rail Case id"
                        );
                    continue;
                }

                let _status = this.testResult[index][2];
                let comment = null;

                if (_status === "Skipped") {
                    _status = 6;
                    comment = "Test Skipped";
                } else if (_status === "Passed") {
                    _status = 1;
                    comment =
                        typeof this.testResult[index][5] !== "undefined" &&
                        this.testResult[index][5].length > 0
                            ? "Test passed" + this.testResult[index][5]
                            : "Test passed";
                } else {
                    _status = 5;
                    comment =
                        typeof this.testResult[index][5] !== "undefined" &&
                        this.testResult[index][5].length > 0
                            ? this.testResult[index][4] +
                              this.testResult[index][5]
                            : this.testResult[index][4]; // if error found for the Test, It will populated in the comment
                }

                let Testresult = {};
                Testresult["case_id"] = caseID.trim();
                Testresult["status_id"] = _status;
                Testresult["comment"] = comment;
                resultsTestcases.push(Testresult);
                caseidList.push(caseID.trim());
            }

            if (caseidList.length == 0) {
                this.newline()
                    .write(this.chalk.red.bold(this.symbols.err))
                    .write("No test case data found to publish");
                return;
            }

            let testrail_api = new TestRail({
                host: this.TestrailHost,
                username: this.TestrailUserName,
                password: this.TestrailPassword,
            });

            let AgentDetails = this.agents[0].split("/");

            let rundetails = {
                suite_id: this.SuiteID,
                include_all: false,
                case_ids: caseidList,
                name:
                    "Run_" +
                    this.creationDate +
                    "(" +
                    AgentDetails[0] +
                    "_" +
                    AgentDetails[1] +
                    ")",
            };
            let runId = null;
            let result = null;

            testrail_api
                .addPlanEntry(this.PlanID, rundetails)
                .then(function (response) {
                    runId = response.runs[0].id;
                    result = {
                        results: resultsTestcases,
                    };

                    testrail_api
                        .addResultsForCases(runId, result)
                        .then(function (response) {
                            result.results.forEach(function (res, idx) {
                                testrail_api
                                    .addResultForCase(runId, res.caseID)
                                    .then(function (response) {});
                                testrail_api
                                    .addResult(res.caseID, result)
                                    .then(function (response) {});
                            });
                        });
                });
        },
    };
};

module.exports = exports["default"];
