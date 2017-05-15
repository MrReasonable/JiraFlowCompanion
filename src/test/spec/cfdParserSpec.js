


describe("jira CFD api responce parser ", function() {
	var basicResponse = {
		"columns": [{"name": "Inbox"}, {"name": "Refine"}, {"name": "TODO"}, {"name": "DOING"}, {"name": "DONE"}],
		"columnChanges": {
			"1318524408000": [{"key": "DFOL-79", "columnTo": 2, "statusTo": "1"}],
			"1352135771000":[{"key":"DFOL-79","columnFrom":2,"columnTo":4,"statusTo":"6"}]
		}
	};

	var boardData = new BoardData();


	approveIt("should parse columns", function(approvals) {
		boardData.registerCfdApiResponce(basicResponse);
		approvals.verify(boardData.columns);
	});

	approveIt("should registerColumnChange", function(approvals) {
		boardData.registerCfdApiResponce(basicResponse);
		approvals.verify(boardData.tickets);
	});
});

describe ("BoardData", function(){

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

	describe("Flow", function(){
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

		approveIt("should give throughput data",function(approvals){
			let throughputReport = flowData.getThroughputReport(filter);
			approvals.verify(throughputReport);
		});

		approveIt("should give inflow data",function(approvals){
			let throughputReport = flowData.getInflowReport(filter);
			approvals.verify(throughputReport);
		});

		approveIt("should give backlog growth data",function(approvals){
			let backlogGrowthReport = flowData.getBacklogGrowthReport(filter);
			approvals.verify(backlogGrowthReport);
		});


	});

	describe("Lead Times",()=>{
		var flowData = new BoardData();
		flowData.registerCfdApiResponce(cfdApiResponse);
		
		function leadTimeReport(spectralReportFilter){
			return  flowData.getSpectralAnalysisReport(spectralReportFilter);
		}

		approveIt("should give lead time report",function(approvals){
			approvals.verify(leadTimeReport({"starttime":1460376510030,"resolution":604800000,"label":"Lead time","done":true}));
		});

		approveIt("should give lead time report with 1 day resolution",function(approvals){
			approvals.verify(leadTimeReport({"starttime":1460376510030,"resolution":86400000,"label":"Lead time","done":true}));
		});

		approveIt("should give cycle time report with 1 day resolution",function(approvals){
			approvals.verify(leadTimeReport({"starttime":1460376510030,"resolution":86400000,"label":"Lead time","done":true,"startState":{"index":4,"name":"Analyze"}}));
		});

		
		approveIt("should give ongoing since report with 1 day resolution",function(approvals){
			approvals.verify(leadTimeReport({"starttime":1491914186437,"resolution":604800000,"label":"Ticket age","done":false,"startState":{"index":4,"name":"Analyze"}}));
		});

		approveIt("should give backlog age report with 1 day resolution",function(approvals){
			approvals.verify(leadTimeReport({"starttime":1491914186437,"resolution":604800000,"label":"Ticket age","done":false}));
		});


	});

	describe("Iteration report",()=>{
		//getIterationReport (startTime,duration,startState)
		var flowData = new BoardData();
		flowData.registerCfdApiResponce(cfdApiResponse);

		approveIt("should give empty iteration report",function(approvals){
			approvals.verify(flowData.getIterationReport(1483258930088,604800000));
		});
		
		approveIt("should give iteration report",function(approvals){
			approvals.verify(flowData.getIterationReport(1485764530088,604800000));
		});

		approveIt("should give iteration report with cycle times",function(approvals){
			approvals.verify(flowData.getIterationReport(1485764530088,604800000,{"index":4,"name":"Analyze"}));
		});
		
	});

	
	

	
});

describe("CFD ticket representation",function(){

	it("should have id and columnChanges",function(){
		var ticket = new Ticket("ABC-1");

		expect(ticket.id).toEqual("ABC-1");
		expect(ticket.columnChanges).toEqual({});

	});


} );
