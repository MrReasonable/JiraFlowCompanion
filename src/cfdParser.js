/*
cfdData ={

        columns:["column1","column2","column3"]
        tickets: [
            {
                id:"ABC-01",
                columnChanges:{
                    "1234567892":{
                        toColumn : "column1"
                        timestamp:"1234567892"
                    },
                    "1324567892":{
                        column : "column2"
                        timestamp:"1234567892"
                    }
                }

            }
        ]
}*/


function CfdApiResponceParser(){
    var self = {};

    self.parse = function (json){
        var boardData = new BoardData();
        var changeTime;
        var columnChange;
        boardData.columns = parseColumns(json.columns);

        for(changeTime in json.columnChanges){
            _.forEach(json.columnChanges[changeTime], function(item){
                columnChange = {};
                columnChange.id = item.key;
                columnChange.enter = changeTime ;
                columnChange.column = boardData.columns[item.columnTo];

                boardData.registerColumnChange(columnChange);
            })

        }


        return boardData ;
    }



    function parseColumns(jiraColumns){
        var columns = [];
        _.forEach(jiraColumns, function(col){
            columns.push(col.name);
        });
        return columns;
    }


    return self;
}

function BoardData(){
    var self ={};

    self.tickets = {}

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
            indexes[column] = index;
            index ++;
        })

        return indexes;
    }

    var getCfdGrid = function(filter){
        var laneHeaders = _.reverse(_.clone(self.columns));
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
            throughputReport.registerDoneTicket( ticket.getDoneTime(self.columns[self.columns.length-1]));
        });
        return throughputReport.getData();
    };

    // filter {resolution:milliseconds,starttime:milliseconds}
    // resolution in milliseconds examples (day,week,month)
    // starttime in milliseconds Tickets done before starttime does not regiser 
    self.getSpectralAnalysisReport = function(filter){
        let done = self.columns[self.columns.length-1];
        filter = filter || {};
        let starttime = filter.starttime || 0;
        let resolution = filter.resolution||timeUtil.MILLISECONDS_DAY*7;
        var spectralAnalysisReport = new SpectralAnalysisReport(resolution);
        _.forEach(self.tickets, function(ticket){
            if(ticket.getDoneTime(done) && ticket.getDoneTime(done)>starttime ){
                spectralAnalysisReport.registerLeadtime(ticket.getLeadtime(done));
            }
            
        });
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

    self.wasInColumn = function(timestamp){
        var column = "";
        _.forEach(self.columnChanges,function(columnChange){
            if(columnChange.enter <= timestamp){
                column = columnChange.column;
            }else{
                return false;
            }
        });
        return column;
    }

    self.enteredBoard = function (){
        return _.first(columnChangeTimes());
    }

    self.getLeadtime = function(doneState){
        var  result = null;
        var done = self.getDoneTime(doneState);
        if(done){
            result = done -self.enteredBoard();
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
        if(self.columnChanges[_.last(columnChanges)].column === doneState){
            result = _.last(columnChanges);
        }
        return result;
    }

    return self;
}

function ThroughputReport(filter){
    
    function buildThroughputGrid(filter){
        let throughputGrid = gridOf(0,filter.sampleTimes.length+1,2);
        throughputGrid[0][0] = "Period";
        throughputGrid[0][1] = "Throughput"; 
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
        if(!time){
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
            data.push([index,item]);
        })
        data.sort(function(a,b){
            return a[0]-b[0];
        })
       data.unshift(["Leadtime","item count"]); 
       return  data;
    } 
    return self;
}