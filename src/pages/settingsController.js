 app.controller("SettingsController", [
 '$location',
 '$routeParams',
 'boardDataFactory',
 'sharedState',
 function ($location,$routeParams, boardDataFactory,state) {
        let self = this;
        self.state = state;
        self.state.loading  = (self.state.loading)? self.state.loading +1 : 1;

        function recieveBoardData (boardData){
            self.state.loading-=1;

            self.boardData = boardData;
            self.quickFilters = self.boardData.getQuickfilters();
            //self.$apply();
        }

        function getBoardData(){
            if(self.state.loading === 2){
                 boardDataFactory.fetchApiData().then(recieveBoardData,function(reject){
                    self.state.loading -=1;
                    console.error ("failed to update report",reject);

                });
                self.state.loading-=1;
                return
            }
            boardDataFactory.getBoardData().then(recieveBoardData,function(reject){
                self.state.loading -=1;
                console.error ("failed to update report",reject);
            });


        }

        self.apply = ()=>{
            console.log("Apply");
            self.state.loading += 1 ;
            self.boardData.setActiveQuickFilters(self.quickFilters);
            updateUrl("/settings/");

        };

        let updateUrl = function (route) {
            $location.url(route + self.boardData.jiraUrl.angularUrl());
            console.log("New url :"  +$location.url());
        };

        getBoardData();


    }
 ]);
