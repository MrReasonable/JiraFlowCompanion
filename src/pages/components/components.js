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
                    ng-change="$ctrl.change();" ng-model-options='{ debounce: 1000 }' is-open="$ctrl.opened" min-date="$ctrl.start"
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

    controller: ['$timeout',function($timeout){
        self = this
        self.today = new Date();
        self.change = ()=>{
            $timeout(
                ()=>{
                    self.dateChanged();
                }
            )

        };


        self.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            self.opened = true;
        };
    }]
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

app.component("reportTicketsTable",{
    template:`<div class="row">
                    <div class='col-md-2'  >
                        {{$ctrl.head[0]}}
                    </div>
                    <div class='col-md-10'  >
                        {{$ctrl.head[1]}}
                    </div>
                </div>
                <div class="row"  ng-repeat="row in $ctrl.data  track by $index">
                    <div class='col-md-2' ng-if="row[1].length" >
                        {{row[0]}}
                    </div>

                    <div class="col-md-8">
                        <div class="col-sm-2" ng-repeat="ticket in row[1]  track by $index">
                            <label ><a href="{{$ctrl.url}}{{ticket}}" target="_blank">{{ticket}}</a></label>
                        </div>
                    </div>
                    <div class="col-md-2" ng-if="row[1].length">
                        <jira-find-issues-link issues="row[1]"></jira-find-issues-link>
                    </div>
                </div>`,
    bindings:{
        reportData: '<',
        url:'<',
        header:'<?',
        format: '&',
    },
    controller:function(){
        console.log("linkUrl:"+this.url);
        let self = this;

        function format (data){
            if(_.isFunction(self.format())){
                data = self.format()(data);
            }
            return data;
        };

        self.$onChanges = function (changes) {
            if (changes.reportData) {
                let reportData = format(_.cloneDeep(changes.reportData.currentValue));
                if(reportData){
                    if(!self.header){
                        self.head = reportData.shift();
                    }else{
                        self.head = self.header;
                    }

                    self.data = reportData;
                }

            }
        };
    }
});

app.component("jiraFindIssuesLink",{
    template: `<a calss" button-default " href="{{$ctrl.queryLink}}" target="_blank">See in Jira</a>`,
    bindings:{
        issues:'<'
    },
    controller: ['boardDataFactory',function( boardData){
        let self = this;

        self.$onChanges = function (changes) {
            if (changes.issues) {
                let issues = changes.issues.currentValue;
                if(issues){

                    boardData.getBoardData().then(data=>{
                        self.queryLink = data.jiraUrl.findIssuesByIssueKeys(issues);
                    } );
                }

            }
        };
    }]
});

app.component("cfdGraph",{
    template: '<nvd3 options="$ctrl.options" data="$ctrl.chartData" config="$ctrl.config" ></nvd3>',
    bindings: {
        data: '<',
        zero: '<'
    },
    controller: [ 'cfdFactory', function(cfd){
        var self = this;

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

        this.$onChanges = function (changes) {
            if (changes.data.currentValue) {
                self.chartData = new ThroughputGraphData(changes.data.currentValue,self.rollingAverage).throughputDataStreams();
            }
        };

        self.options = new NvD3ChartOptions().historicalBarChart();


        self.config = {
            refreshDataOnly: false, // default: true
        };

    }]
});
