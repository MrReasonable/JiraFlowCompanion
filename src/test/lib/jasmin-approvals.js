function jsonDecode(string) {
    try {
        return JSON.parse(string);
    } catch (e) {
        try{
            return JSON.decode(string);
        }catch(e2){
            return {};
        }
    }
}

function jsonEncode(obj) {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        try{
            return JSON.encode(obj);
        }catch(e2){
            return "{}";
        }

    }
}


beforeEach(function(){

    jasmine.addMatchers({
        approve: function() {
            return {
                compare: function(actual, expected) {
                    var result;
                    var actualString = actual;
                    var expectedString = expected;

                    if(typeof actual !== "string"){
                        actualString = jsonEncode(actual);
                    }

                    if(typeof expected !== "string"){
                        expectedString = jsonEncode(expectedString);
                    }
                    result  = {pass:actualString===expectedString};
                    result. message = "Recieved output  = "+ actualString + "\nApproved output = " +expectedString;
                    return result;
                }
            };
        },
        jsonToBe: function() {
        return {
            compare: function(actual, expected) {
                var result;
                var actualString = actual;
                var expectedString = expected;
                var div = document.createElement("div");

                if(typeof actual !== "string"){
                    actualString = jsonEncode(actual);
                }

                if(typeof expected !== "string"){
                    expectedString = jsonEncode(expectedString);
                }
                result  = {pass:actualString===expectedString};
                var diffArgs   = {
                    source: expectedString,
                    diff  : actualString,
                    lang  : "json"
                };
                div.innerHTML = prettydiff(diffArgs) + "<br>Result   = "+ actualString + "<br>Expected = " +expectedString;
                result.message = div;
                return result;
            }
        };
    }
    });
});

approvalTests = {};

function Approvals(done, testInfo){
    var self = {};
    self.verify = function(receivedResult){
        if(typeof receivedResult !=="string"){
            receivedResult = jsonEncode(receivedResult);
        }
        testInfo.actual = receivedResult;
        approvalTests[testInfo.description]= testInfo;
        expect(receivedResult).approve(testInfo.approvedOutput);
        done();
    };
    return self;
}


function approveIt(description, testToRun){
    var testInfo = {};
    testInfo.description = description;

    function avoidCache(){
        return "?"+new Date().getTime();
    }

    function getApprovedOutput(url) {
        // Return a new promise.
        return new Promise(function(resolve, reject) {
            // Do the usual XHR stuff
            var req = new XMLHttpRequest();
            req.open('GET', url);

            req.onload = function() {
                // This is called even on 404 etc
                // so check the status
                if (req.status == 200) {
                    // Resolve the promise with the response text
                    resolve(req.response);
                }
                else {
                    resolve('No approved output');
                }
            };

            // Handle network errors
            req.onerror = function() {
                resolve('No approved output');
                //reject(Error("Network Error"));
            };

            // Make the request
            req.send();
        });
    }

    function runApprovalTest(testToRun ,done, approvedOutput){
        var approvals =  new Approvals(done,testInfo);
        testInfo.approvedOutput = approvedOutput;
        testToRun(approvals);
    }



    it("(approval) " + description,function(done){
        var url = encodeURIComponent(description.split(" ").join("_"))+".approved.txt";
        testInfo.fileName = url;
        getApprovedOutput("approvals/"+url+avoidCache()).then(_.curry(runApprovalTest)(testToRun,done));
    });

}

function setDiff(){

    function approve(description){
        var approval = approvalTests[description];
        var blob = new Blob([approval.actual], {type: "data:application/txt;charset=utf-8"});
        saveAs(blob, approval.fileName);
    }

    var $failedTests = $(".spec-detail.failed");
    _.forEach($failedTests,function($failedTest){
        var $resultMessage = $($failedTest).find(".result-message")[0];
        var description = $($failedTest).find("a").attr("title").split(" (approval) ")[1];
        var innerHTML = $resultMessage.innerHTML;
        var approvalDescriptions = Object.keys(approvals);

        if(description && !$($failedTest).hasClass("handled")){
            innerHTML = innerHTML.replace("Recieved output  = ","");
            messageParts = innerHTML.split("\nApproved output = ");
            //messageParts[1]=messageParts[1].replace("'.","");
            var diffArgs   = {
                source: messageParts[1],
                diff  : messageParts[0],
                lang  : "json"
            };
            $resultMessage.innerHTML= prettydiff(diffArgs)+"<br>"+"Recieved output = " + diffArgs.diff + "\nApproved output = " + diffArgs.source;
            $($resultMessage).append("<button description='"+ description + "'>Approve Recieved output</button>");
            $("button").attr("description",description).click(function(){
                approve(description);
            });

        }

        $($($(".diff-left")).find(".texttitle")).html("Approved output");
        $($($(".diff-right")).find(".texttitle")).html("Recieved output");
        $($failedTest).addClass("handled");

    });
    setTimeout(setDiff,1000);
}
setTimeout(setDiff,1000);
var approvals = {};