


describe("jira CFD api responce parser ", function() {
	var basicResponse = {
		"columns": [{"name": "Inbox"}, {"name": "Refine"}, {"name": "TODO"}, {"name": "DOING"}, {"name": "DONE"}],
		"columnChanges": {
			"1318524408000": [{"key": "DFOL-79", "columnTo": 2, "statusTo": "1"}],
			"1352135771000":[{"key":"DFOL-79","columnFrom":2,"columnTo":4,"statusTo":"6"}]
		}
	};

	var cfdParser = new CfdApiResponceParser();


	approveIt("should parse columns", function(approvals) {
		var flowData  = cfdParser.parse(basicResponse);
		approvals.verify(flowData.columns);
	});

	approveIt("should registerColumnChange", function(approvals) {
		var flowData  = cfdParser.parse(basicResponse);
		approvals.verify(flowData.tickets);
	});
});

describe ("FlowData", function(){

	var columns = ["column1", "column2", "done"];

	var columnChange1 = {
		id: "ABC-1",
		column: "column1",
		enter: timeUtil.MILLISECONDS_DAY*2
	};

	var columnChange2 = {
		id: "ABC-1",
		column: "column2",
		enter: timeUtil.MILLISECONDS_DAY*4
	};

	var columnChange3 = {
		id: "ABC-1",
		column: "done",
		enter: timeUtil.MILLISECONDS_DAY*6
	};


	approveIt("should register column change", function(approvals){
		var flowData = new BoardData();
		flowData.registerColumnChange(columnChange1);

		approvals.verify(flowData)
	});

	approveIt("should register column changes", function(approvals){
		var flowData = new BoardData();
		flowData.registerColumnChange(columnChange1);
		flowData.registerColumnChange(columnChange2);
		approvals.verify(flowData)
	});

	approveIt("should trace ticket across the board",function(approvals){
		var flowData = new BoardData();
		var cfdMatrix;
		flowData.columns = columns;
		flowData.registerColumnChange(columnChange1);
		flowData.registerColumnChange(columnChange2);
		flowData.registerColumnChange(columnChange3);

		cfdMatrix = flowData.getCfdData();

		approvals.verify(cfdMatrix);

	});

	approveIt("should give throughput data",function(approvals){
		var flowData = new BoardData();
		var cfdMatrix;
		
		let filter = {
			"sampleTimes":[
				timeUtil.MILLISECONDS_DAY*1,
				timeUtil.MILLISECONDS_DAY*3,
				timeUtil.MILLISECONDS_DAY*5,
				timeUtil.MILLISECONDS_DAY*7
			]
		}
		
		flowData.columns = columns;
		flowData.registerColumnChange(columnChange1);
		flowData.registerColumnChange(columnChange2);
		flowData.registerColumnChange(columnChange3);

		let throughputReport = flowData.getThroughputReport(filter);

		approvals.verify(throughputReport);

	});

	
});

describe("CFD ticket representation",function(){

	it("should have id and columnChanges",function(){
		var ticket = new Ticket("ABC-1");

		expect(ticket.id).toEqual("ABC-1");
		expect(ticket.columnChanges).toEqual({});

	});


} );
