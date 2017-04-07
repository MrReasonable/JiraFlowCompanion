app.controller("MontecarloController",
    ['boardDataFactory','sharedState',"cfdFactory"
        , function ( boardDataFactory, state,cfd) {
        let self = this;
        console.log ("MontecarloController");
        self.title= "Monte carlo simulation";

        self.hasData = false;
        self.state = state;
        self.dt = new Date();
        self.state.passedIterations = self.state.passedIterations || 5;
        self.state.simulations = self.state.simulations || 1000;
        self.state.maxRemaining = self.state.maxRemaining|| 100;
        self.state.focus = self.state.focus|| 100;


        self.sprintLengths = state.iterationLengths;

        self.scope = [{label:"Stable scope",value:true},{label:"Variable scope",value:false}];
        self.state.stableScope = state.selectedOption(self.scope,self.state.stableScope )||self.scope[0];

        self.graph = [{label:"Throughput/Inflow",value:false},{label:"Remaining Iterations",value:true}];
        self.state.showRemaining = state.selectedOption(self.graph,self.state.showRemaining )||self.graph[0];

        function updateReport(){
            self.loading = true;
            boardDataFactory.getBoardData(self.board).then(function(boardData){
                self.boardData = boardData;

                let startTime = self.dt.getTime()-((self.state.passedIterations) * self.state.sprintLength.value*7*timeUtil.MILLISECONDS_DAY );
                self.sampleTimes = cfdUtil.generateSampleTimes(startTime, self.state.sprintLength.value,self.dt.getTime());

                var filter = {
                    sampleTimes: self.sampleTimes,
                    label: "Tickets"
                };

                self.state.backlogLength = (self.state.useManualBacklog)?
                    self.state.backlogLength :
                    boardData.getBacklogLength(self.dt.getTime());

                self.mc = {
                    passedThroughputData: toValueArray(new NvD3Trans().countItems(boardData.getThroughputReport(filter))),
                    passedInflowData: (self.state.stableScope.value)?[0]:toValueArray(new NvD3Trans().countItems(boardData.getInflowReport(filter))),
                    backlogLength:  self.state.backlogLength,
                    simulations:self.state.simulations,
                    focus: self.state.focus,
                    maxRemaining:self.state.maxRemaining
                }
                //console.log (JSON.stringify( mc));

                self.data = new MonteCarloSimulator(self.mc).simulate();
                self.distributions =  self.data.aggregatedAsDistributions();
                //console.log ( JSON.stringify($scope.distributions));
                self.sampleTimes.pop();
                self.hasData = true;
                self.loading = false;
                console.log(self.dt)
            },function(reject){});
        }

        self.startDateChanged = function () {
            updateReport();
        };

        self.toggleScope = function () {
            //$scope.state.stableScope = !$scope.state.stableScope ;
            updateReport();
        };



        self.updateSprintLength = function() {
            updateReport();
        };

        self.setBacklogLength = function() {
            if(!self.state.useManualBacklog){
                updateReport();
            }

        };

        function toValueArray(arr){
            let result = arr.map(item=>item[1]);
            result.shift();
            result.pop();
            return result;
        }

        let setSprintLength = ()=>{
            self.state.sprintLength = state.selectedOption(self.sprintLengths,self.state.sprintLength)||self.sprintLengths[1];
        }

        setSprintLength();
        updateReport();
    }]);

