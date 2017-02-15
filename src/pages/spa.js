//spa.js



console.log(window.location.href);
var app = angular.module("kanban", ['ngRoute', 'ui.bootstrap','nvd3']);


app.component("iterationReportTable",{
    template:`<table class="table table-striped">
                <thead>
                    <tr>
                        <th  ng-repeat="cell in $ctrl.head track by $index">
                            {{cell}}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr  ng-repeat="row in $ctrl.data  track by $index">
                        <td >
                            <label><a href="{{$ctrl.url}}{{row[0]}}" target="_blank"> {{row[0]}}</a></label>
                        </td>
                        <td>
                            {{row[1]}}
                        </td>
                        <td>
                            {{row[2]}}
                        </td>
                        <td>
                            {{row[3]}}
                        </td>
                        <td>
                            {{row[4]}}
                        </td>
                    </tr>
                </tbody>
              </table>`,
    bindings:{
        reportData: '<',
        url:'<'
    },
    controller:function(){
        console.log("linkUrl:"+this.url);
        let self = this;
        self.$onChanges = function (changes) {
                if (changes.reportData) {
                    let reportData = _.cloneDeep(changes.reportData.currentValue);
                    if(reportData){
                        self.head = reportData.shift();
                        self.data = reportData;
                    }
                    
                }
          };  
    }
});

app.component("quickFilters",{
    template:` 
    <div class="row">QuickFilters</div>
    <div class="row" >
        <div class="col-lg-12>
            <div class="btn-group-lg">
                <button ng-repeat="filter in $ctrl.quickFilters" class="{{ $ctrl.getClass(filter.id) }}" ng-click="$ctrl.toggle(filter.id)">{{filter.name}} </button>
            </div>
        </div>
    </div>
    <div class="row">
        <button class="btn-primary" ng-click="$ctrl.apply()">Apply</buttom>
    </div>
    `,
    bindings:{
        quickFilters:'=',
        apply:'&'
    },
    controller: function(){
        self = this;
        
        function findFilter(id){
            return self.quickFilters.find((filter)=>{
                return filter.id === id
            });
        }
        
        self.getClass = (id)=>{
            if(findFilter(id).selected){
                return "btn-success";
            }
            return "btn_default";
        }

        self.toggle= (id)=>{
            findFilter(id).selected = !findFilter(id).selected;
        }
    }
});

app.component ("datePicker",{
    template: ` <p class="input-group">
                    <input type="text" class="form-control" uib-datepicker-popup="yyyy-MM-dd" ng-model="$ctrl.dt"  
                    ng-change="$ctrl.dateChanged()" ng-model-options='{ debounce: 1000 }' is-open="$ctrl.opened" min-date="$ctrl.start" 
                    max-date="$ctrl.today" ng-required="true" close-text="Close" />
                    <span class="input-group-btn">
                        <button type="button" class="btn btn-default" ng-click="$ctrl.open($event)"><i class="glyphicon glyphicon-calendar"></i></button>
                    </span>
                 </p>`,
    bindings:{
        dt: '=',
        dateChanged:'&',
        minDate: '<'
    },

    controller: function(){
        self = this
        self.today = new Date();
        
        
        
        self.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            self.opened = true;
        };
    }
});

app.component("quickfilters",{
      template: `<span><strong>{{$ctrl.boardName}}</strong> Filters: | </span>
                 <span ng-repeat="filter in $ctrl.filters"> {{filter}} | </span>
                `,
      bindings:{
          boardData:'<'
      },
      controller: function(){
         var self =this;
         self.filters= [];
         self.boardName = "(jiraBoard)";
         self.$onChanges = function (changes) {
                if (changes.boardData) {
                    let boardData = changes.boardData.currentValue;
                    if(boardData){
                        self.boardData = boardData
                        self.filters = boardData.getActiveQuickfilters();
                        self.boardName = self.boardData.boardName;
                    }
                    
                }
          };  
      }
  });
 
 app.component("download",{
      template: ' <button type="button" class="btn btn-default navbar-btn" ng-click="$ctrl.asCSV()">CSV</button><button type="button" class="btn btn-default navbar-btn" ng-click="$ctrl.asJson()">JSON</button>',
      bindings: { 
          format: '&',
          filename: '@',
          data: '<'
      },
      controller: function(){
        var self =this;

        self.asCSV = function () {
          downloadAsCSV(format(self.data), self.filename);
        };

        self.asJson = function () {
            downloadAsJson(format(self.data), self.filename);
        };

        function format (){
            var data = self.data;
            if(_.isFunction(self.format())){
                data = self.format()(data);
            }
            return data;
        };

      }
  });

  app.component("cfdGraph",{
      template: '<nvd3 options="$ctrl.options" data="$ctrl.chartData" config="$ctrl.config" ></nvd3>',
      bindings: {
          data: '<',
          zero: '<'
      },
      controller: [ 'cfdFactory', function(cfd){
          var self = this;

          self.chartData; 
          this.$onChanges = function (changes) {
                if (changes.data) {
                    self.chartData = transform(changes.data.currentValue);
                }
          }; 
          
          function transform(data){
                if(data){
                    let cfdChartData = cfd.buildCfdChartData(data);
                    if (self.zero) {
                        cfdChartData = cfd.doneStartsFrom0(cfdChartData);
                    }
                    return cfdChartData;
                }
                return ;
                
          }

          self.options = {
                chart: {
                    type: 'stackedAreaChart',
                    height: 450,
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 30,
                        left: 40
                    },
                    x: function(d){return d[0];},
                    y: function(d){return d[1];},
                    useVoronoi: false,
                    clipEdge: true,
                    duration: 100,
                    useInteractiveGuideline: true,
                    xAxis: {
                        showMaxMin: false,
                        tickFormat: function(d) {
                            return d3.time.format('%Y-%m-%d')(new Date(d))
                        }
                    },
                    yAxis: {
                        rotateLabels: 45,
                        tickFormat: function(d){
                            return d3.format(',.0f')(d);
                        }
                    },
                    zoom: {
                        enabled: true,
                        scaleExtent: [1, 10],
                        useFixedDomain: false,
                        useNiceScale: false,
                        horizontalOff: false,
                        verticalOff: true,
                        unzoomEventType: 'dblclick.zoom'
                    }
                }
            };
        
        
          self.config = {
              refreshDataOnly: false, // default: true
          };
        
      }]
  });


app.component("spectralGraph",{
      template: '<nvd3 options="$ctrl.options" data="$ctrl.chartData" config="$ctrl.config" ></nvd3>',
      bindings: {
          data: '<',
          samples:'<?',
          label: '@'
      },
      controller: [ 'nvD3TransformationsFactory', function(nvD3Trans){
          var self = this;
          self.samples = self.samples || 0;
          self.chartData={};
          this.$onChanges = function (changes) {
                if (changes.data) {
                    self.chartData = new SpectralGraphData(changes.data.currentValue).spectralAnalysisDataStream(self.samples);
                }
                if(changes.label){
                    self.options.chart.xAxis.axisLabel = changes.label.currentValue;
                }
          }; 
          
           self.options = new NvD3ChartOptions().spectralGraph();
          
        
          self.config = {
              refreshDataOnly: false, // default: true
          };
        
      }]
  });

app.component("mcGraph",{
      template: '<nvd3 options="$ctrl.options" data="$ctrl.chartData" config="$ctrl.config" ></nvd3>',
      bindings: {
          data: '<'
      },
      controller: [ 'nvD3TransformationsFactory', function(nvD3Trans){
          const self = this;
          self.chartData;
          
          this.$onChanges = function (changes) {
                if (changes.data) {
                    self.chartData = new MonteCarloGraphData(changes.data.currentValue).backlogDevelopmentStreams();
                }
          }; 
          
         
           self.options = new NvD3ChartOptions().spectralGraph();
           self.options.chart.yAxis1.axisLabel = "Likelyhood %";
           self.options.chart.yAxis2.axisLabel = "Confidence %";
           self.options.chart.xAxis.axisLabel = "Throughput, In flow / iteration ";
        
          self.config = {
              refreshDataOnly: false, // default: true
          };
        
      }]
  });

  app.component("mcRemainingGraph",{
      template: '<nvd3 options="$ctrl.options" data="$ctrl.chartData" config="$ctrl.config" ></nvd3>',
      bindings: {
          data: '<'
      },
      controller: [ 'nvD3TransformationsFactory', function(nvd3Trans){
          const self = this;
          self.chartData;
          
          self.$onChanges = function (changes) {
                if (changes.simulationCount){
                    self.simulationCount = changes.simulationCount.currentValue;
                }
                if (changes.data) {
                    self.chartData = MonteCarloGraphData(changes.data.currentValue)
                                        .remainingIterationsDataStreams();
                }
          }; 
          
          self.options = new NvD3ChartOptions().spectralGraph();
          self.options.chart.yAxis1.axisLabel = "Likelyhood %";
          self.options.chart.yAxis2.axisLabel = "Confidence %";
          self.options.chart.xAxis.axisLabel = "Iterations until done";

          self.config = {
              refreshDataOnly: false, // default: true
          };
        
      }]
  });


app.component("throughputGraph",{
      template: `<nvd3 options="$ctrl.options" data="$ctrl.chartData" config="$ctrl.config" ></nvd3>`,
      bindings: {
          data: '<',
          rollingAverage: '<'
      },
      controller: [ 'nvD3TransformationsFactory', function(nvD3Trans){
          var self = this;

          self.chartData;
          this.$onChanges = function (changes) {
                if (changes.data) {
                    self.chartData = new ThroughputGraphData(changes.data.currentValue,self.rollingAverage).throughputDataStreams(); 
                }
          }; 
          
           self.options = new NvD3ChartOptions().historicalBarChart(); 
        
        
          self.config = {
              refreshDataOnly: false, // default: true
          };
        
      }]
  });



app.factory("cfdFactory", function () {
    var factory = {};

    factory.buildCfdChartData = function (cfdData) {
        var chartData = [];
        var lane, day;
        var laneData;
        console.log("buildCfdChartData");
        if (cfdData.length === 0) {
            return cfdData;
        }
        for (lane = 1; lane < cfdData[0].length; lane++) {
            laneData = {};
            laneData.key = cfdData[0][lane];
            laneData.values = [];
            for (day = 1; day < cfdData.length; day++) {
                laneData.values.push([cfdData[day][0], cfdData[day][lane]]);
            }
            chartData.push(laneData);
        }
        return chartData;
    };

    factory.readableDatesOnCfdData = cfdUtil.readableDatesOnCfdData;

    factory.doneStartsFrom0 = function (cfdChartData) {
        cfdChartData = _.cloneDeep(cfdChartData);
        var doneAccumulated = cfdChartData[0].values[0][1];
        _.forEach(cfdChartData[0].values, function (value) {
            value[1] = value[1] - doneAccumulated;
        });
        return cfdChartData;
    };

    return factory;
});


app.factory("boardDataFactory",['$routeParams', function (routeParams) {
    var factory = {};
    var data;
    var jiraUrl;
    var boardConfig; 
    
    function parseRouteParams(){
        let url = {};
        let hostParts;
        url.protocol = routeParams.protocol;
        hostParts = routeParams.host.split(":")
        url.host = _.first(hostParts);
        url.port = (hostParts.length = 2)?_.last(hostParts):"";
        url.query = JiraUrl().parseAngularQueryString(routeParams.query);
        return new JiraUrl(url); 
    }

    factory.fetchApiData = function(){
       jiraUrl = jiraUrl||parseRouteParams();
       return new Promise((resolve,reject)=>{
            let configPromise =  sendRestRequest(jiraUrl.boardConfigApiUrl());
            let cfdDataPromise = sendRestRequest(jiraUrl.cfdApiUrl());
            Promise.all([configPromise,cfdDataPromise]).then(response => {
                let boardConfig = _.first(response);
                let cfdData = _.last(response)
                data = new BoardData();
                data.registerCfdApiResponce(cfdData);
                data.registerBoardConfig(boardConfig);
                data.registerjiraUrl(jiraUrl);
                resolve(data);
            });
        })
    };

    factory.updateBoardData = ()=>{
        return factory.fetchApiData();
    }
    
    factory.getBoardData = function (url) {
         return new Promise(function (resolve, reject) {
             if(data){
                 resolve(data);
             }else{
                factory.fetchApiData().then(boardData =>  {
                    data = boardData;
                    resolve(data)
                },function(error){
                    reject();
                });
             }
        });
    };
         
    return factory;
}]);

app.factory("nvD3TransformationsFactory", function () {
    return new NvD3Trans();
});

app.factory("sharedState",function(){
    var state = {
        "startTime": new Date().getTime()-365*timeUtil.MILLISECONDS_DAY,
    }

    state.resolutionOptions = [
        {value:1, label:"1 day"},
        {value:7, label:"1 week"},
        {value:14, label:"2 weeks"},
        {value:21, label:"3 weeks"},
        {value:30, label:"1 month"}
    ];

    state.iterationLengths = [
        {"value":1,"label":"1 week"},
        {"value":2,"label":"2 weeks"},
        {"value":3,"label":"3 weeks"},
        {"value":4,"label":"4 weeks"},
     ];

    state.selectedOption = (options,selected)=>{
        let result = null;
        if(!selected){
            return result;
        }
        let match = (option,selected) =>{
           let same = true;
            _.forEach(option,(value,key)=>{
                if(key.indexOf("$$")=== -1){
                    same = value === selected[key];
                    return !same;
                }
            });
          return same;  
        }
        _.forEach(options,option=>{
            let found =match(option,selected);
            result = option;
            if(found){
                return false;
            }
        }); 
        return result;
    }
    return state;
});

app.controller("SpectralController", 
                [
                    '$scope', 
                    'boardDataFactory', 
                    'nvD3TransformationsFactory',
                    "sharedState"
                   , function ($scope, boardDataFactory, nvD3Trans,state) {
      console.log ("SpectralController");
     let sum;
     $scope.state = state;
     $scope.data ;
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
        
        boardDataFactory.getBoardData().then(function(boardData){
            let spectralData;
            state.startTime = new Date($scope.dt).getTime();
            $scope.boardData = boardData;
            let filter = {
                "starttime": ($scope.state.leadTime.value)? state.startTime:new Date().getTime(),
                "resolution": $scope.state.resolution.value*timeUtil.MILLISECONDS_DAY,
                "label":"Done Tickets",
                "done": $scope.state.leadTime.value
            }
            $scope.columns = boardData.columns;
            $scope.state.resolution =  $scope.state.selectedOption($scope.resolutions,$scope.state.resolution);
            $scope.state.startState = $scope.state.selectedOption($scope.columns,$scope.state.startState);
            if($scope.state.startState){
                filter.startState = $scope.state.startState;
            }
            
            $scope.spectralData = boardData.getSpectralAnalysisReport(filter);
            $scope.sum = nvD3Trans.sum($scope.spectralData,1);
            $scope.average = nvD3Trans.averageLeadtime($scope.spectralData);
            $scope.median = nvD3Trans.medianLeadtime($scope.spectralData);
            $scope.loading = false;
            $scope.$apply();
        },function(reject){
            $scope.loading = false;
            console.error ("failed to update report",reject);
        });
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
        boardDataFactory.getBoardData($scope.board).then(function(boardData){
            $scope.state.startTime = new Date($scope.dt).getTime();
            console.log($scope.dt)
            $scope.boardData = boardData;
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
            $scope.$apply();
            console.log($scope.dt)
        },function(reject){
            $scope.loading = false;
            console.error ("failed to update report",reject);
        });
    }

    $scope.startDateChanged = function () {
        updateReport();
    };


    let setSprintLength = ()=>{
        $scope.state.sprintLength = $scope.state.selectedOption($scope.sprintLengths,$scope.state.sprintLength)  || $scope.sprintLengths[0];
    }
    
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
        setTimeout(()=>{
            var filter = getFilterParameters();
            $scope.cfdDataTable = $scope.boardData.getCfdData(filter);
            if ($scope.cfdDataTable.length === 0) {
                return;
            }
            $scope.hasData = true;
           
            console.log($scope.state.cfdStartTime);
            $scope.loading = false;
            $scope.$apply();
        },50)
        
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

app.controller("SettingsController", [
    '$scope',
    '$location',
    '$routeParams', 
    'boardDataFactory',
    'sharedState', 
    function ($scope,$location,$routeParams, boardDataFactory,state) {
        $scope.state = state;
        $scope.state.loading  = ($scope.state.loading)? $scope.state.loading +1 : 1;

        function recieveBoardData (boardData){
            $scope.state.loading-=1;
            
            $scope.boardData = boardData;
            $scope.quickFilters = $scope.boardData.getQuickfilters();
            $scope.$apply(); 
        }

        function getBoardData(){
            if($scope.state.loading === 2){
                 boardDataFactory.fetchApiData().then(recieveBoardData,function(reject){
                    $scope.state.loading -=1;
                    console.error ("failed to update report",reject);
       
                });
                $scope.state.loading-=1;
                return
            }
            boardDataFactory.getBoardData().then(recieveBoardData,function(reject){
                $scope.state.loading -=1;
                console.error ("failed to update report",reject);
            });

           
        }

        $scope.apply = ()=>{
            console.log("Apply");
            $scope.state.loading += 1 ;
            $scope.boardData.setActiveQuickFilters($scope.quickFilters);
            updateUrl("/settings/");
            
        };

        let updateUrl = function (route) {
            $location.url(route + $scope.boardData.jiraUrl.angularUrl());
            console.log("New url :"  +$location.url());
        };

        getBoardData();
       
       
    }
]);


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

    $scope.state.sprintLength = state.selectedOption($scope.sprintLengths,$scope.state.sprintLength) || $scope.sprintLengths[0];
    
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
            //$scope.state.sprintLength = $scope.sprintLengths.find(sprintlength=> sprintlength.value === $scope.state.sprintLength.value);
           
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
            $scope.$apply();
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
     
     $scope.data ;
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
                passedThroughputData: toValueArray(boardData.getThroughputReport(filter)),
                passedInflowData: ($scope.state.stableScope.value)?[0]:toValueArray(boardData.getInflowReport(filter)),
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
            $scope.$apply();
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
        $scope.state.sprintLength = state.selectedOption($scope.sprintLengths,$scope.state.sprintLength)||$scope.sprintLengths[0];
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




app.config(['$routeProvider',
    
    function ($routeProvider) {
        let jiraUrl = ":protocol/:host/:query/";
        $routeProvider.
            when('/cfd/'+jiraUrl, {
               templateUrl: 'templates/cumulative-flow-diagram.html',
               controller: 'CfdController'
            }).when('/throughput/'+jiraUrl, {
                templateUrl: 'templates/throughput.html',
                controller: 'ThroughputController'
            }).when('/spectral/'+jiraUrl, {
                templateUrl: 'templates/spectral.html',
                controller: 'SpectralController'
            }).when('/iteration-report/'+jiraUrl, {
                templateUrl: 'templates/iterationReport.html',
                controller: 'IterationReportController'
            }).when('/montecarlo/'+jiraUrl, {
                templateUrl: 'templates/montecarlo.html',
                controller: 'MontecarloController'
            }).when('/settings/'+jiraUrl, {
                templateUrl: 'templates/settings.html',
                controller: 'SettingsController'
            }).otherwise({
                redirectTo: '/cfd/'+jiraUrl
            });
    }]);
