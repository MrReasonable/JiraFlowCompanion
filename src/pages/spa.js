//spa.js

app.controller("SpectralController", 
                [
                    '$scope', 
                    'boardDataFactory', 
                    'nvD3TransformationsFactory',
                    "sharedState"
                   , function ($scope, boardDataFactory, nvD3Trans,state) {
      console.log ("SpectralController");
     $scope.state = state;
     $scope.loading = true;
     
     $scope.dt = new Date(state.startTime)||new Date();
     $scope.state.samples = $scope.state.samples||0 ;
     $scope.resolutions = state.resolutionOptions;
     $scope.state.resolution =  $scope.state.selectedOption($scope.resolutions,$scope.state.resolution)  || $scope.resolutions[1];

      $scope.reportTypes = [{
              label:"Lead time",
              count: "done tickets",
              fileName:"leadTimeData",
              value:true
          },{
              label:"Ticket age",
              count: "backlog tickets",
              fileName:"backlogAgeData",
              value:false
          }];
      $scope.state.leadTime = state.selectedOption($scope.reportTypes,$scope.state.leadTime )||$scope.reportTypes[0];
     

    function updateReport(){
        $scope.loading = true;
        
        function update(boardData){
            state.startTime = new Date($scope.dt).getTime();
            $scope.boardData = boardData;
            let filter = {
                "starttime": ($scope.state.leadTime.value)? state.startTime:new Date().getTime(),
                "resolution": $scope.state.resolution.value*timeUtil.MILLISECONDS_DAY,
                "label":$scope.state.leadTime.label,
                "done": $scope.state.leadTime.value
            }
            $scope.columns = boardData.columns;
            $scope.state.resolution =  $scope.state.selectedOption($scope.resolutions,$scope.state.resolution);
            $scope.state.startState = $scope.state.selectedOption($scope.columns,$scope.state.startState);
            if($scope.state.startState){
                filter.startState = $scope.state.startState;
            }
            $scope.header=[$scope.state.leadTime.label+" "+$scope.state.resolution.unit,$scope.state.leadTime.count]
            $scope.spectralData = boardData.getSpectralAnalysisReport(filter);
            $scope.sum = nvD3Trans.sum($scope.spectralData,1);
            $scope.average = nvD3Trans.averageLeadtime($scope.spectralData);
            $scope.median = nvD3Trans.medianLeadtime($scope.spectralData);
            $scope.url = $scope.boardData.jiraUrl.issueUrl(""); 
            $scope.loading = false;
            
        }

        boardDataFactory.updateReport(update);
       
    }

        $scope.startDateChanged = function () {

            console.log("In:" + $scope.dt);
            if(!new Date($scope.dt)){
                return;
            }
            state.startTime = new Date($scope.dt).getTime();
            updateReport();
        };

            $scope.updateResolution = function() {
                updateReport();
            };

            updateReport();


    }]);

//******************************************************************************************
// Throughput
//******************************************************************************************




// ThroughputController ----------------------------------------------------------------------

app.controller("ThroughputController", 
                ['$scope', 'boardDataFactory', 'nvD3TransformationsFactory','sharedState',"cfdFactory"
                , function ($scope, boardDataFactory, nvD3Trans,state,cfd) {
      console.log ("ThroughputController");
     $scope.title= "Throughput";
     $scope.hasData = false;
     $scope.state = state;
     $scope.state.rollingAverage = $scope.state.rollingAverage || 5;
     $scope.dt = new Date(state.startTime)||new Date();
     $scope.dlFormat = cfd.readableDatesOnCfdData;
     $scope.loading = true;
     $scope.sprintLengths = state.iterationLengths;

     $scope.reportTypes = [
         {label:"Troughput",value:"getThroughputReport"},
         {label:"Inflow",value:"getInflowReport"},
         {label:"Backlog growth",value:"getBacklogGrowthReport"},
         
    ]

    $scope.state.reportType = $scope.state.selectedOption($scope.reportTypes,$scope.state.reportType) || $scope.reportTypes[0]; 
    
    function updateReport(){
        $scope.loading = true;
        function update (boardData){
            $scope.state.startTime = new Date($scope.dt).getTime();
            console.log($scope.dt);
            $scope.boardData = boardData;
             $scope.url = $scope.boardData.jiraUrl.issueUrl(""); 
            setSprintLength();
            var filter = {
                sampleTimes: cfdUtil.generateSampleTimes( 
                    $scope.state.startTime, $scope.state.sprintLength.value),
                label: $scope.state.reportType.label
            };
            
            $scope.reportData = boardData[$scope.state.reportType.value](filter)
            $scope.title = $scope.state.reportType.label;
            $scope.sum = nvD3Trans.sum($scope.reportData,1);
            $scope.average = Math.floor($scope.sum/($scope.reportData.length-2));
            $scope.hasData = true;
            $scope.loading = false;
            console.log($scope.dt)
            
        }

         boardDataFactory.updateReport(update);

    }

    $scope.startDateChanged = function () {
        updateReport();
    };


    let setSprintLength = ()=>{
        $scope.state.sprintLength = $scope.state.selectedOption($scope.sprintLengths,$scope.state.sprintLength)  || $scope.sprintLengths[1];
    };
    
    $scope.updateSprintLength = function() {
            updateReport();
    };

    updateReport();
}]);




//******************************************************************************************
// CFD
//******************************************************************************************

app.controller("CfdController", ['$scope', '$route', '$window', '$routeParams', 'boardDataFactory', 'cfdFactory','sharedState', function ($scope, $route, $window, $routeParams, boardDataFactory, cfd,state) {
    $scope.state = state;
    $scope.cfdData = [{"key" : "No data" , "values" : [ [ 0 , 0]]}];
    //$scope.state.cfdStartTime = $scope.state.cfdStartTime || new Date();
    $scope.hasData = false;
    $scope.startTime = 0;
    $scope.loading = true;
    $scope.state.zeroDone = $scope.state.zeroDone || false;
    
    
    console.log("cfdController");
    $scope.dlFormat = cfd.readableDatesOnCfdData;

    function updateCfd() {
         $scope.loading = true;
        
        var filter = getFilterParameters();
        $scope.cfdDataTable = $scope.boardData.getCfdData(filter);
        if ($scope.cfdDataTable.length === 0) {
            return;
        }
        $scope.hasData = true;
        
        console.log($scope.state.cfdStartTime);
        $scope.loading = false;
    }

    
    
    function getFilterParameters(){
        var parameters = {};
        if(new Date($scope.state.cfdStartTime).getTime() !== $scope.start){
            parameters.startMilliseconds = new Date($scope.state.cfdStartTime).getTime();
        }
        return parameters;
    }

    $scope.startDateChanged = function () {
        console.log($scope.state.cfdStartTime);
        updateCfd();
    };

    boardDataFactory.getBoardData().then(function (response) {
        $scope.boardData = response;
        $scope.state.cfdStartTime =  $scope.state.cfdStartTime ||new Date(parseInt(response.boardCreated));
        updateCfd();
    },function(reject){
            $scope.loading = false;
            console.error ("failed to update report",reject);
        });


}]);



app.controller("IterationReportController",['$scope', 'boardDataFactory','sharedState',  
                function ($scope, boardDataFactory,state){
    $scope.state = state;
    $scope.loading = true;
    if(!$scope.state.iterationStart){
        $scope.state.iterationStart = new Date();
        $scope.state.iterationStart.setDate($scope.state.iterationStart.getDate()-7);
    }
    
    $scope.hasData = false;
    $scope.startTime = 0;
    $scope.url = "";

     $scope.startDateChanged = function () {
        updateReport();
    };


    $scope.sprintLengths = state.iterationLengths;

    $scope.state.sprintLength = state.selectedOption($scope.sprintLengths,$scope.state.sprintLength) || $scope.sprintLengths[1];
    
    $scope.updateSprintLength = function() {
            updateReport();
    };

    $scope.startStateChanged = ()=>{
        updateReport();
    }

    function updateReport(){
        
        boardDataFactory.getBoardData().then(function(boardData){
            $scope.startTime = new Date($scope.state.iterationStart).getTime();
            $scope.boardData = boardData;
            $scope.columns = boardData.columns;
            setStartState();
            
            $scope.url = $scope.boardData.jiraUrl.issueUrl("");        
            let reportData =  boardData.getIterationReport($scope.startTime
                                                          ,$scope.state.sprintLength.value * 7 * timeUtil.MILLISECONDS_DAY
                                                          ,$scope.state.startState);
            /*if($scope.state.startState){
                let now = new Date().getTime();
                let tickets = boardData.getTickets(
                    ticket => ticket.wasInColumn(now)===$scope.state.startState.name,
                    ticket => ticket.id
                )
                console.log ("Tickets in" + $scope.state.startState.name + JSON.stringify(tickets));
            }*/
            
            $scope.reportData = reportData.map(reportHelpers.formatGrid([,timeUtil.isoDateFormat,timeUtil.timeFormat,timeUtil.timeFormat,]));
            $scope.hasData = true;
            $scope.jiraIssues = boardData.jiraUrl.findIssuesByIssueKeys(_.tail(reportData),0);
            $scope.loading = false;
            //$scope.$apply();
        },function(reject){});
    }

    let setStartState = ()=>{
        if($scope.state.startState){
            $scope.state.startState = $scope.columns.find( col => {
               return col.index === $scope.state.startState.index;
            })
        } 
    }
 
   
    updateReport();

}]);

app.controller("MontecarloController", 
                ['$scope', 'boardDataFactory','sharedState',"cfdFactory"
                , function ($scope, boardDataFactory, state,cfd) {
      console.log ("MontecarloController");
     $scope.title= "Monte carlo simulation";
     
     $scope.hasData = false;
     $scope.state = state;
     $scope.dt = new Date();
     $scope.state.passedIterations = $scope.state.passedIterations || 10;
     $scope.state.simulations = $scope.state.simulations || 1000;
     $scope.state.maxRemaining = $scope.state.maxRemaining|| 100;
     $scope.state.focus = $scope.state.focus|| 100;
    
     
     $scope.sprintLengths = state.iterationLengths;

     $scope.scope = [{label:"Stable scope",value:true},{label:"Variable scope",value:false}];
     $scope.state.stableScope = state.selectedOption($scope.scope,$scope.state.stableScope )||$scope.scope[0];

     $scope.graph = [{label:"Throughput/Inflow",value:false},{label:"Remaining Iterations",value:true}];
     $scope.state.showRemaining = state.selectedOption($scope.graph,$scope.state.showRemaining )||$scope.graph[0];

    function updateReport(){        
        $scope.loading = true;
        boardDataFactory.getBoardData($scope.board).then(function(boardData){
            $scope.boardData = boardData;
            
            let startTime = $scope.dt.getTime()-(($scope.state.passedIterations) * $scope.state.sprintLength.value*7*timeUtil.MILLISECONDS_DAY );
            $scope.sampleTimes = cfdUtil.generateSampleTimes(startTime, $scope.state.sprintLength.value,$scope.dt.getTime());
            
            var filter = {
                sampleTimes: $scope.sampleTimes,
                label: "Tickets"
            };

            $scope.state.backlogLength = ($scope.state.useManualBacklog)?
                        $scope.state.backlogLength : 
                        boardData.getBacklogLength($scope.dt.getTime());
                         
            $scope.mc = {
                passedThroughputData: toValueArray(new NvD3Trans().countItems(boardData.getThroughputReport(filter))),
                passedInflowData: ($scope.state.stableScope.value)?[0]:toValueArray(new NvD3Trans().countItems(boardData.getInflowReport(filter))),
                backlogLength:  $scope.state.backlogLength,
                simulations:$scope.state.simulations,
                focus: $scope.state.focus,
                maxRemaining:$scope.state.maxRemaining
            }
            //console.log (JSON.stringify( mc));
            
            $scope.data = new MonteCarloSimulator($scope.mc).simulate();
            $scope.distributions =  $scope.data.aggregatedAsDistributions();
            //console.log ( JSON.stringify($scope.distributions));
            $scope.sampleTimes.pop();
            $scope.hasData = true;
            $scope.loading = false;
            console.log($scope.dt)
        },function(reject){});
    }

    $scope.startDateChanged = function () {
        updateReport();
    };

    $scope.toggleScope = function () {
        //$scope.state.stableScope = !$scope.state.stableScope ;
        updateReport();
    };

    

    $scope.updateSprintLength = function() {
            updateReport();
    };

    $scope.setBacklogLength = function() {
        if(!$scope.state.useManualBacklog){
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
        $scope.state.sprintLength = state.selectedOption($scope.sprintLengths,$scope.state.sprintLength)||$scope.sprintLengths[1];
    }

    setSprintLength();
    updateReport();
}]);





app.controller("TabController", [
        '$scope',
        '$location',
        '$routeParams',
        function ($scope, $location,$routeParams) {
            $scope.tabs = [];
            $scope.tabs.push({"caption": "CFD", "active": false, "route": "/cfd/"});
            $scope.tabs.push({"caption": "Flow", "active": false, "route": "/throughput/"});
            $scope.tabs.push({"caption": "Leadtimes", "active": false, "route": "/spectral/"});
            $scope.tabs.push({"caption": "Iteration Report", "active": false, "route": "/iteration-report/"});
            $scope.tabs.push({"caption": "Monte Carlo", "active": false, "route": "/montecarlo/"});
            
            $scope.tabs.push({"caption": "Settings", "active": false, "route": "/settings/"});
            
            $scope.setActiveTab = function (url) {
                _.forEach($scope.tabs, function (tab) {
                    if (url.indexOf(tab.route) > -1) {
                        tab.active = true;
                        return;
                    }
                    tab.active = false;
                });
            };

            $scope.goTo = function (route) {
                console.log("go from :"  + $location.url());
                $location.url(route + $routeParams.protocol + "/" + $routeParams.host +"/"+ $routeParams.query);
                $scope.setActiveTab($location.url());
                console.log("go to :"  +$location.url());
            };

            $scope.setActiveTab($location.url());
        }
    ]
);




