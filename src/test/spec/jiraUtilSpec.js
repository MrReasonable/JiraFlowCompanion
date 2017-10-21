describe("Parse angular query sting ", function() {
	
	approveIt("should parse standard query string ", function(approvals) {
		approvals.verify(JiraUrl().parseAngularQueryString("rapidView=570&swimlane=1226,1225&column=2988,2970,2964,2965,2966"));
	});

	approveIt("should handle parsing errors gracefully", function(approvals) {
		approvals.verify(JiraUrl().parseAngularQueryString("rapidView=570&swimlane=1226,1225&column=2988,2970,2964,2965,2966&from=2017-04-01"));
	});

    approveIt("shouldBuildIssueRestApiQueryUrl",(approvals)=>{
		"use strict";
        let requestUrl = JiraUrl(window.location).issueDetailsRestApiGetUrl(["abc123","abc345"],['key',"summary"]);
		approvals.verify(requestUrl);
	})
});