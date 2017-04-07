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
            };
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
         
    ];

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
            $scope.jiraIssues = boardData.jiraUrl.findIssuesByIssueKeys(_.tail(reportData),'id');
            $scope.loading = false;
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











