/*dotenv is a module that loads environment variables from a .env file into process.env */
require("dotenv").config();

const TestRail = require("@dlenroc/testrail");

exports["default"] = function () {
    return {
        //default values
        noColors: false,
        startTime: null,
        testCount: 0,
        agents: "",
        ProjectName: "",
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
        agents: "",
        passed: "",
        failed: "",
        totalTaskTime: "",
        errorTestData: [],
        creationDate: "",
        PlanName: "",
        PlanID: 0,
        ProjectID: 0,
        ProjectName: "",
        ConfigID: [],

        reportTaskStart: function reportTaskStart(userAgents, testCount) {
            this.startTime = this.startTime;
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
            this.ProjectName = process.env.PROJECT_NAME;
            this.EnableTestrail = process.env.TESTRAIL_ENABLE == "true";
            this.TestrailHost = process.env.TESTRAIL_HOST;
            this.TestrailPassword = process.env.TESTRAIL_PASS;
            this.TestrailUserName = process.env.TESTRAIL_USER;
            this.SuiteID = Number(process.env.SUITE_ID);
            if (this.EnableTestrail) {
                if (
                    !this.ProjectName ||
                    !this.TestrailHost ||
                    !this.TestrailPass ||
                    !this.TestrailUser
                ) {
                    this.newline().write(
                        this.chalk.red.bold(
                            "Error:  TESTRAIL_HOST, TESTRAIL_USER, TESTRAIL_PASS and PROJECT_NAME must be set as environment variables inside .env file for the reporter plugin to push the result to the Testrail"
                        )
                    );
                    process.exit(1);
                }
            }

            this.PlanName = process.env.PLAN_NAME || "TestAutomation_default";
        },

        reportFixtureStart: function reportFixtureStart(name) {
            this.currentFixtureName = name;
        },

        renderErrors: function renderErrors(errs) {
            this.setIndent(3).newline();

            errs.forEach(function (err, idx) {
                var prefix = _this2.chalk.red(idx + 1 + ") ");

                this.newline()
                    .write(_this2.formatError(err, prefix))
                    .newline()
                    .newline();
            });
        },

        reportTestDone: function reportTestDone(name, testRunInfo, meta) {
            this.testEndTime = new Date();

            const hasErr = testRunInfo.errs.length;
            const result =
                hasErr === 0
                    ? this.chalk.green("Passed")
                    : this.chalk.red("Failed");
            const fixtureName = this.currentFixtureName + " - " + name;

            const title = result + " " + fixtureName;

            this.write(title).newline();
            const testOutput = {};

            this.testStartTime = new Date();
            const testStatus = "";

            if (testRunInfo.skipped) {
                testStatus = "Skipped";
            } else if (hasErr === 0) {
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
            const error = {};

            if (testRunInfo.skipped) {
                this.skipped++;
            }

            if (hasErr > 0) {
                error[0] = this.currentFixtureName;
                error[1] = name;
                error[2] = "";
                testOutput[4] = "";
                this.renderErrors(testRunInfo.errs);

                testRunInfo.errs.forEach(function (err, idx) {
                    error[2] += _this
                        .formatError(err, idx + 1 + ") ")
                        .replace(/(?:\r\n|\r|\n)/g, "<br />")
                        .replace(
                            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
                            ""
                        );
                    testOutput[4] += _this
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

        publishResultToTestrail: function publishResultToTestrail() {
            const api = new TestRail({
                host: this.TestrailHost,
                username: this.TestrailUserName,
                password: this.TestrailPassword,
            });

            const resultsTestcases = [];
            const caseidList = [];
            this.newline()
                .newline()
                .write("------------------------------------------------------")
                .newline()
                .write(
                    this.chalk.green("Publishing the result to testrail...")
                );

            for (let index in this.testResult) {
                const testDesc = this.testResult[index][1].split("|"); // split the Test Description
                const caseID = null;

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

                const _status = this.testResult[index][2];
                const comment = null;

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

                const Testresult = {};

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

            this.getProject(api);

            if (this.ProjectID === 0) return;

            this.getPlanID(api);

            if (this.PlanID === 0) return;

            this.getSuiteID(api);

            if (this.SuiteID === 0) return;

            var AgentDetails = this.agents[0].split("/");
            var rundetails = {
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

            const runId = null;
            const result = null;

            api.addPlanEntry(
                this.PlanID,
                rundetails,
                function (err, response, run) {
                    if (err !== "null") {
                        runId = run.runs[0].id;
                        this.newline()
                            .write(
                                "------------------------------------------------------"
                            )
                            .newline()
                            .write(this.chalk.green("Run added successfully."))
                            .newline()
                            .write(this.chalk.blue.bold("Run name   "))
                            .write(
                                this.chalk.yellow(
                                    "Run_" +
                                        this.creationDate +
                                        "(" +
                                        AgentDetails[0] +
                                        "_" +
                                        AgentDetails[1] +
                                        ")"
                                )
                            );

                        result = {
                            results: resultsTestcases,
                        };

                        api.addResultsForCases(
                            runId,
                            result,
                            function (err1, response1, results) {
                                if (err1 === "null") {
                                    this.newline()
                                        .write(
                                            this.chalk.blue(
                                                "---------Error at Add result -----"
                                            )
                                        )
                                        .newline()
                                        .write(err1);
                                } else if (results.length == 0) {
                                    this.newline()
                                        .write(
                                            this.chalk.red(
                                                "No Data has been published to Testrail."
                                            )
                                        )
                                        .newline()
                                        .write(err1);
                                } else {
                                    this.newline()
                                        .write(
                                            "------------------------------------------------------"
                                        )
                                        .newline()
                                        .write(
                                            this.chalk.green(
                                                "Result added to the testrail Successfully"
                                            )
                                        );
                                }
                            }
                        );
                    } else {
                        this.newline()
                            .write(
                                this.chalk.blue(
                                    "-------------Error at AddPlanEntry ----------------"
                                )
                            )
                            .newline()
                            .write(err);
                    }
                }
            );
        },

        // attention
        getProject: function getProject(api) {
            api.getProjects(function (err, response, project) {
                if (err !== "null" && typeof project !== "undefined") {
                    project.forEach(function (project) {
                        if (project.name === String(this.ProjectName)) {
                            this.ProjectID = project.id;
                            this.newline()
                                .write(
                                    this.chalk.blue.bold("Project name(id) ")
                                )
                                .write(
                                    this.chalk.yellow(
                                        this.ProjectName +
                                            "(" +
                                            project.id +
                                            ")"
                                    )
                                );
                        }
                    });
                } else {
                    this.newline()
                        .write(
                            this.chalk.blue(
                                "-------------Error at Get Projects  ----------------"
                            )
                        )
                        .newline();
                    console.log(err);

                    this.ProjectID = 0;
                }
            });
        },

        getPlanID: function getPlanID(api) {
            api.getPlans(this.ProjectID, function (err, response, plan) {
                const planid = "";
                if (err !== "null") {
                    for (let index in plan) {
                        if (plan[index].name === this.PlanName) {
                            this.newline()
                                .write(this.chalk.blue.bold("Plan name(id) "))
                                .write(
                                    this.chalk.yellow(
                                        plan[index].name +
                                            "(" +
                                            plan[index].id +
                                            ")"
                                    )
                                );
                            planid = plan[index].id;
                            break;
                        }
                    }

                    if (planid === "") {
                        this.addNewPlan(api);
                    } else {
                        this.PlanID = planid;
                    }
                } else {
                    this.newline()
                        .write(
                            this.chalk.blue(
                                "-------------Error at Get Plans  ----------------"
                            )
                        )
                        .newline();
                    console.log(err);
                    this.PlanID = 0;
                }
            });
        },
        addNewPlan: function addNewPlan(api) {
            api.addPlan(
                this.ProjectID,
                {
                    name: this.PlanName,
                    desription: "Added From Automation reporter plugin",
                },
                function (err, response, plan) {
                    if (err !== "null") {
                        if (typeof plan.id === "undefined") {
                            this.newline().write(
                                this.chalk.red("Plan Id found as undefined")
                            );
                            this.PlanID = 0;
                        } else {
                            this.newline()
                                .write(
                                    _this6.chalk.green("New Plan is created")
                                )
                                .newline()
                                .write(this.chalk.blue.bold("Plan name(id) "))
                                .write(
                                    this.chalk.yellow(
                                        plan.name + "(" + plan.id + ")"
                                    )
                                );
                            this.PlanID = plan.id;
                        }
                    } else {
                        this.newline()
                            .write(
                                this.chalk.blue(
                                    "-------------Error at Add New Plan  ----------------"
                                )
                            )
                            .newline();
                        console.log(err);

                        this.PlanID = 0;
                    }
                }
            );
        },

        getSuiteID: function getSuiteID(api) {
            api.getSuites(this.ProjectID, function (err, response, suites) {
                if (err !== "null") {
                    if (suites.length === 0) {
                        this.newline().write(
                            this.chalk.red(
                                "The project doesnt contain any suite"
                            )
                        );
                        this.SuiteID = 0;
                    } else {
                        const suite =
                            suites.find((suite) => suite.id === this.SuiteID) ||
                            suites[0];
                        this.newline()
                            .write(this.chalk.blue.bold("Suite name(id) "))
                            .write(
                                this.chalk.yellow(
                                    suite.name + "(" + suite.id + ")"
                                )
                            );
                        this.SuiteID = suite.id;
                    }
                } else {
                    this.newline()
                        .write(
                            this.chalk.blue(
                                "-------------Error at Get Suites  ----------------"
                            )
                        )
                        .newline();
                    console.log(err);
                    this.SuiteID = 0;
                }
            });
        },

        reportTaskDone: function reportTaskDone(endTime, passed) {
            const durationMs = endTime - this.startTime;

            const durationStr = this.moment
                .duration(durationMs)
                .format("h[h] mm[m] ss[s]");

            this.totalTaskTime = durationStr;
            const footer =
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

            const date = new Date();

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
    };
};
module.exports = exports["default"];
