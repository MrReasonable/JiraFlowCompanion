app.controller("TabController", [

        '$location',
        '$routeParams',
        function ( $location,$routeParams) {
            let self = this;
            self.tabs = [];
            self.tabs.push({"caption": "CFD", "active": false, "route": "/cfd/"});
            self.tabs.push({"caption": "Flow", "active": false, "route": "/throughput/"});
            self.tabs.push({"caption": "Lead times", "active": false, "route": "/spectral/"});
            self.tabs.push({"caption": "Iteration Report", "active": false, "route": "/iteration-report/"});
            self.tabs.push({"caption": "Monte Carlo", "active": false, "route": "/montecarlo/"});

            self.tabs.push({"caption": "Settings", "active": false, "route": "/settings/"});

            self.setActiveTab = function (url) {
                _.forEach(self.tabs, function (tab) {
                    if (url.indexOf(tab.route) > -1) {
                        tab.active = true;
                        return;
                    }
                    tab.active = false;
                });
            };

            self.goTo = function (route) {
                console.log("go from :"  + $location.url());
                $location.url(route + $routeParams.protocol + "/" + $routeParams.host +"/"+ $routeParams.query);
                self.setActiveTab($location.url());
                console.log("go to :"  +$location.url());
            };

            self.setActiveTab($location.url());
        }
    ]
);