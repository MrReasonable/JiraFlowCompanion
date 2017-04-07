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
            controller: 'MontecarloController',
            controllerAs: 'vm'
        }).when('/settings/'+jiraUrl, {
            templateUrl: 'templates/settings.html',
            controller: 'SettingsController',
            controllerAs: 'vm'
        }).otherwise({
            redirectTo: '/cfd/'+jiraUrl
        });
    }]);
