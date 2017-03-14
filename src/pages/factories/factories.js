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


app.factory("boardDataFactory",['$routeParams','$q','$http','$rootScope','$timeout', function (routeParams, $q, $http,$rootScope,$timeout) {
    const self = {};
    var data;
    var jiraUrl;

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

    self.fetchApiData = function(){
        jiraUrl = jiraUrl||parseRouteParams();
        return new $q((resolve,reject)=>{
            let configPromise = $http({
                method : "GET",
                url : jiraUrl.boardConfigApiUrl()
            });
            let cfdDataPromise = $http({
                method : "GET",
                url : jiraUrl.cfdApiUrl()
            });
            $q.all([configPromise,cfdDataPromise]).then(response => {
                let boardConfig = _.first(response).data;
                let cfdData = _.last(response).data
                data = new BoardData();
                data.registerCfdApiResponce(cfdData);
                data.registerBoardConfig(boardConfig);
                data.registerjiraUrl(jiraUrl);
                resolve(data);

            },()=>reject);
        })
    };

    self.fetchIssueData =(issues)=>{

    }

    self.updateBoardData = ()=>{
        return self.fetchApiData();
    }

    self.getBoardData = function () {
        return new $q(function (resolve, reject) {
            if(data){
                resolve(data);

            }else{
                self.fetchApiData().then(boardData =>  {
                    data = boardData;
                    resolve(data)

                },function(){
                    reject();

                });
            }
        });
    };

    self.updateReport =function(update){

        if(data){
            update(data);
        }else{
            self.getBoardData().then(update,function(reject){
                //$scope.loading = false;
                console.error ("failed to fetch data from jira",reject);
                alert("failed to fetch data from jira");
            });
        }

    };

    return self;
}]);

app.factory("nvD3TransformationsFactory", function () {
    return new NvD3Trans();
});

app.factory("sharedState",function(){
    var state = {
        "startTime": new Date().getTime()-365*timeUtil.MILLISECONDS_DAY,
    };

    state.resolutionOptions = [
        {value:1, label:"1 day",unit:"days"},
        {value:7, label:"1 week",unit:"weeks"},
        {value:14, label:"2 weeks",unit:"iterations"},
        {value:21, label:"3 weeks",unit:"iterations"},
        {value:30, label:"1 month",unit:"months"}
    ];

    state.iterationLengths = [
        {"value":1/7,"label":"1 day"},
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
        };
        _.forEach(options,option=>{
            let found =match(option,selected);
            result = option;
            if(found){
                return false;
            }
        });
        return result;
    };
    return state;
});