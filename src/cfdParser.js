function BoardData(){
    var self ={};

    self.tickets = {}

    self.registerCfdApiResponce = function (apiResponse){
        var changeTime;
        var columnChange;
        self.registerColumns(apiResponse.columns);
        self.registerColumnChanges(apiResponse.columnChanges);
    }

    self.registerColumnChanges = function(columnChanges){
       for(let changeTime in columnChanges){  
         _.forEach(columnChanges[changeTime], function(item){
                columnChange = {};
                columnChange.id = item.key;
                columnChange.enter = changeTime ;
                columnChange.column = self.columns[item.columnTo];
                
                self.registerColumnChange(columnChange);
            });
       }
    }

    self.registerColumns = function(jiraColumns){
        self.columns = jiraColumns.map((col,index)=>({"index":index,"name":col.name}));
    };
        
    self.registerColumnChange = function (columnChange){
        var ticket;
        if( ! self.boardCreated ){
            self.boardCreated = columnChange.enter;
        }

        self.latestChange = columnChange.enter;

        if  (self.tickets[columnChange.id]) {
            ticket = self.tickets[columnChange.id];
        } else {
            ticket = self.tickets[columnChange.id] =  new Ticket(columnChange.id);
        }

        ticket.registerColumnChange(columnChange);
    };

    self.registerBoardConfig = function(apiResponse){
        self.registerBoardId( apiResponse.id);
        self.registerBoardName( apiResponse.name);
        self.registerMappedColumns(apiResponse.rapidListConfig.mappedColumns);
        self.registerSwimlanesConfig(apiResponse.swimlanesConfig);
        self.registerQuickFilterConfig(apiResponse.quickFilterConfig);
    }
    
    self.registerBoardId = function(id){
        self.id = id;
    }

    self.registerBoardName = function(name){
        self.boardName = name;
    }

    self.registerMappedColumns = function (cols){
        self.mappedColumns = cols.map(item => ({"id":item.id, "name":item.name}));
    }

    self.registerSwimlanesConfig = function (swimlanesConfig){
        self.swimlanes = swimlanesConfig.swimlanes.map(item => ({"id":item.id, "name":item.name}));
    }

    self.registerQuickFilterConfig = function(quickFilterConfig){
        self.quickFilters = quickFilterConfig.quickFilters.map(item => ({"id":item.id, "name":item.name}));
    }

    self.registerjiraUrl = function(jiraUrl){
        self.jiraUrl = jiraUrl;
    }

    self.getActiveQuickfilters = function(){
        let filters = self.jiraUrl.query.quickFilter;
        let filterNames = [];
        if(!filters){
            return filterNames;
        }
        filters.forEach(filter=>{
            let qf = self.quickFilters.find(quickFilter=>{
                return quickFilter.id === parseInt(filter); 
            })
            filterNames.push(qf.name)
        })
        return filterNames;
    }
    
    self.getBacklogLength = (timestamp)=>{
        let count = 0;
        _.forEach(self.tickets,(ticket=>{
            let done = parseInt(ticket.getDoneTime(_.last(self.columns)));
            if( isNaN(done) || done>timestamp){
                count++
            }else{

            }
        }));
        return count;
    }

    self.getQuickfilters = ()=>{
        let quickFilters = _.cloneDeep(self.quickFilters);
        let activeFilters = self.jiraUrl.query.quickFilter||[];
        if(!quickFilters || !activeFilters){
            return {};
        }
        quickFilters.forEach((filter)=>{
            if(-1 != activeFilters.indexOf(filter.id)){
                filter.selected = true;
            }else{
                filter.selected = false;
            }
        });
        return quickFilters;
    }

    self.setActiveQuickFilters = (quickFilters)=>{
        let activeFilters = [];
        quickFilters.forEach(filter=>{
            if(filter.selected){
                activeFilters.push(filter.id);
            }
        });
        self.jiraUrl.query.quickFilter = activeFilters;
    }

    

    function  cfdSampleTimes(filter){
        var start = self.boardCreated;
        var end = self.latestChange;
        if(filter){
            if(filter.startMilliseconds){
                start = filter.startMilliseconds;
            }
            if(filter.endMilliseconds){
                end = filter.endMilliseconds;
            }
        }
        return cfdUtil.generateCfdSampleTimes(start,end);
    }


    self.getCfdData = function(filter){
        var columnIndexes = getCfdColumnIndexes();
        var sampleTimes = cfdSampleTimes(filter);
        var cfdGrid;
        var rowIndexes;
        if(!filter){
            filter = {};
        }
        filter.sampleTimes = sampleTimes
        console.log("getCfdData");
        cfdGrid = getCfdGrid(filter);
        rowIndexes = getCfdRowIndexes(cfdGrid);

        _.forEach(self.tickets,function(ticket){
            var cfdData = ticket.getCfdData(filter);
            _.forEach(cfdData,function(day){
                var isoDate,row,column;
                //console.log(jsonEncode(day));
                isoDate = ""+timeUtil.dayStart(day.milliseconds);
                row = rowIndexes[isoDate];
                column = columnIndexes[day.column];
                if(cfdGrid[row ] && column ){
                    cfdGrid[row][column]++;
                }
            });
        });

        return cfdGrid;
    };

   


    function getCfdRowIndexes(cfdGrid){
        var indexes = {};
        var row;
        console.log("getCfdRowIndexes");
        for(row = 0 ;row<cfdGrid.length;row++){
            indexes[""+cfdGrid[row][0]] = row;
        }
        return indexes;
    }

    function getCfdColumnIndexes(){
        var indexes = {};
        var index = 1;
        console.log("getCfdColumnIndexes");
        _.forEachRight(self.columns ,function(column){
            indexes[column.name] = index;
            index ++;
        })

        return indexes;
    }

    var getCfdGrid = function(filter){
        var laneHeaders = _.reverse(_.clone(self.columns).map(col => col.name));
        var grid;
        var row ;
        grid = gridOf(0,filter.sampleTimes.length+1,laneHeaders.length+1);
        row = 0;

        console.log("getCfdGrid");
        grid[row] = ["Date"].concat(laneHeaders);

        for(row = 0 ; row < filter.sampleTimes.length; row++){
            grid[row+1][0] = filter.sampleTimes[row];
        }
        return grid;
    };


     self.getThroughputReport = function (filter){
        let done = self.columns[self.columns.length-1];
        let throughputReport =new ThroughputReport(filter);
        _.forEach(self.tickets,function(ticket){
            throughputReport.registerDoneTicket( ticket.getDoneTime(_.last(self.columns)));
        });
        return throughputReport.getData();
    };


    self.getBacklogGrowthReport = function (filter){
        let throughput = self.getThroughputReport(filter);
        let inflow = self.getInflowReport(filter);
        let head = throughput.shift();
        inflow.shift();
        throughput =  throughput.map((row,index)=>{
            return [_.first(row),_.last(inflow[index])-_.last(row)];
        });
        throughput.unshift(head);
        return throughput;

    };

    self.getInflowReport = function (filter){
        let throughputReport =new ThroughputReport(filter);
        _.forEach(self.tickets,function(ticket){
            throughputReport.registerDoneTicket( ticket.enteredBoard());
        });
        return throughputReport.getData();
    };

    self.getIterationReport = (startTime,duration,startState)=>{
        let iterationReport = new IterationReport(startTime,duration,_.last(self.columns),startState);
        _.forEach(self.tickets,iterationReport.registerTicket);
        return iterationReport.getData();
    };

    self.getTickets = (filter, map)=>{
        let issues = _.filter(self.tickets,filter);
        return issues.map(map);
    };

    // filter {resolution:milliseconds,starttime:milliseconds}
    // resolution in milliseconds examples (day,week,month)
    // starttime in milliseconds Tickets done before starttime does not regiser 
    self.getSpectralAnalysisReport = function(filter){
        let done = self.columns[self.columns.length-1];
        filter = filter || {};
        let starttime = filter.starttime || 0;
        let resolution = filter.resolution||timeUtil.MILLISECONDS_DAY*7;
        let startState = filter.startState || _.first(self.columns);
        var spectralAnalysisReport = new SpectralAnalysisReport(resolution);
        
        _.forEach(self.tickets, function(ticket){
            if(ticket.getDoneTime(done) && ticket.getDoneTime(done)>starttime ){
                console.log(ticket.id+",");
                spectralAnalysisReport.registerLeadtime(ticket.getLeadtime(done,startState));
            }
        });
        return spectralAnalysisReport.getData();
    }

    self.getBacklogAgeReport = function(filter){
        let done = self.columns[self.columns.length-1];
        filter = filter || {};
        let starttime = filter.starttime || 0;
        let resolution = filter.resolution||timeUtil.MILLISECONDS_DAY*7;
        var spectralAnalysisReport = new SpectralAnalysisReport(resolution);
        _.forEach(self.tickets, function(ticket){
            if(!ticket.getDoneTime(done) || ticket.getDoneTime(done)>starttime ){
                console.log(ticket.id+",");
                spectralAnalysisReport.registerLeadtime(starttime-ticket.enteredBoard());
            }
        });
        let data = spectralAnalysisReport.getData();
        data[0][0] = filter.label 
        return spectralAnalysisReport.getData();
    }

    return self;
}

function Ticket(id){
    var self = {};
    self.id = id;
    self.columnChanges = {};

    self.registerColumnChange = function(columnChange){
        if(!columnChangeCount() || columnChange.column != self.latestColumnChange().column){
            self.columnChanges[columnChange.enter] = columnChange;
        }
    }

    self.latestColumnChange = function (){
        return self.columnChanges[_.last(columnChangeTimes())];
    }

    function columnChangeCount(){
        return columnChangeTimes().length;
    } 

    function columnChangeTimes(){
        return Object.keys(self.columnChanges);
    } 

    self.isInColumn =()=>{
        return self.columnChanges[_.last(columnChangeTimes())].column.name;
    };
    
    self.wasInColumn = function(timestamp){
        var column = "";
        _.forEach(self.columnChanges,function(columnChange){
            if(columnChange.enter <= timestamp /*&& columnChange.column*/){
                if(!columnChange.column){
                    return;
                    //console.log("Change Missing Column: " + JSON.stringify(self));
                }
                column = columnChange.column.name;
            }else{
                return false;
            }
        });
        return column;
    }

    self.enteredBoard = function (){
        return _.first(columnChangeTimes());
    }

    self.getLeadtime = function(doneState,startState){
        var  result = null;
        var done = self.getDoneTime(doneState);
        
        if(done){
            if(startState){
                result = done - self.passedState(startState);
            } else {
                result = done -self.enteredBoard();
            }
            
        }
        return result;
    }

    self.getCfdData = function(filter){
        var start = self.enteredBoard();
        var ticketData = [];
        var dayRecord;
        _.forEach (filter.sampleTimes, function(sampleTime){
            if(sampleTime>=start){
                dayRecord = {"column":self.wasInColumn(sampleTime),milliseconds : sampleTime};
                ticketData.push(dayRecord);
            }
        });
        return ticketData;
    };

    self.getDoneTime = function(doneState){
        let result = null;
        let columnChanges = columnChangeTimes();
        if(self.columnChanges[_.last(columnChanges)].column.name === doneState.name){
            result = _.last(columnChanges);
        }
        return result;
    }

    self.passedState = (startState)=>{
         let result = null;
        _.forEach(self.columnChanges,(item)=>{
           
            if(item.column && item.column.index>=startState.index){
                result = item.enter;
                return false;
            }
        });
        return result;
    }

    return self;
}

function ThroughputReport(filter){
    
    function buildThroughputGrid(filter){
        let throughputGrid = gridOf(0,filter.sampleTimes.length+1,2);
        throughputGrid[0][0] = "Period";
        throughputGrid[0][1] = filter.label; 
        _.forEach(filter.sampleTimes,function (sampleTime,index){
            throughputGrid[index+1][0] = sampleTime;
        });
        
        return throughputGrid;
    }
    
    let self = {};
    let throughputReport = buildThroughputGrid(filter);
    self.registerDoneTicket = function (doneTime){
        if(!doneTime){
            return
        }
        _.forEachRight(filter.sampleTimes,function (sampleTime,index){
            if(doneTime>= sampleTime){
                throughputReport[index+1][1] ++;
                return false;
            }
        });
    }
    
    self.getData = function (){
        return _.clone(throughputReport);
    }
    
    return self;
}

function SpectralAnalysisReport(resolution ){
    let self = {};
    
    self.resolution = resolution || timeUtil.MILLISECONDS_DAY*7;
    let spectralAnalysisData = {}

    self.registerLeadtime = function(time){
        var index = Math.floor(time/self.resolution); 
        if(time==null){
            return;
        }
        if(!spectralAnalysisData[index]){
            spectralAnalysisData[index]= 0
        }
        spectralAnalysisData[index]+=1;
    }

    self.getData = function(){
        let data = [];
        _.forEach(spectralAnalysisData,function(item,index){
            data.push([parseInt(index),item]);
        })
        data.sort(function(a,b){
            return a[0]-b[0];
        })
       data.unshift(["Leadtime","item count"]); 
       //console.log(JSON.stringify(data));
       return  data;
    } 
    return self;
}

function IterationReport(startTime,duration,doneState,startState){
    const self = this;
    const tickets = [];
    
    self.registerTicket= (ticket) =>{
        let doneTime = ticket.getDoneTime(doneState); 
        if(doneTime && doneTime<startTime+duration && doneTime > startTime ){
            tickets.push(ticket);
        }
    }

    

    self.getData = () =>{
        let data = [];
        function columnNameOrEmpty(ticket,startTime){
            result = "";
            if(ticket.wasInColumn(startTime)){
                result = ticket.wasInColumn(startTime);
            }
            return result
        }
    
        data.push(["Ticket","Done","Lead time","Cycle time","Started in"])
        tickets.forEach(ticket=>{
            let row = [
                ticket.id,
                ticket.getDoneTime(doneState),
                ticket.getLeadtime(doneState),
                (startState)?ticket.getLeadtime(doneState,startState):null,
                columnNameOrEmpty(ticket,startTime)
            ];
            data.push(row);
        });
        return data;
    }
}

