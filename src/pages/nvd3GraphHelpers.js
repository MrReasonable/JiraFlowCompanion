function NvD3Trans() {
    var self= {};
    self.generateChartData = function (data){
        return [{
            "key" : "Troughput" ,
            "bar": true,
            "values" : _.drop(data)
        }];
    };

    self.count = (data)=>{
         let count = 0;
         data.forEach(item=>{
             if(!isNaN(item[1])){
                 count+=item[1];
             }
         });
         return count;
     }

     self.toPercentage = (total)=>{
         return self.mapWrapper(item => {
            return [item[0],Math.floor(1000*item[1]/total)/10]
        });
     }

     self.countItems = function(data){
        return data.map(item=>{
            if(Array.isArray(item[1])){
                return [item[0],item[1].length];
            }else{
                return item;
            }
        })
    };
     

    self.generateDataStream = function (key,type,yAxis, data, transform){
        let result = _.drop(_.clone(data));
        if(!_.isArray(transform)){
            transform = [transform];
        }
        //console.log("original data =" + JSON.stringify(result));
        transform.forEach( function(trans){
            result = trans(result);
        });
        //console.log("transformed data =" + JSON.stringify(result));

        return {
            "key" : key ,
            "type": type,
            "yAxis":yAxis,
            "values" :result
        };
    };

    self.dropRight = function(n,array){
        return _.dropRight(array,n);
    }
    
    self.createContinousData = function(data){
        let header = data.shift();
        let max = _.last(data)[0];
        let grid = gridOf(0,max,2);

        grid = grid.map(function(item,index){
            return [index,0];
        });

        data.forEach(function(item){
            grid[item[0]]=item;
        });
        grid.unshift(header);
        return grid;
    }

    self.alignArrays= (arr1,arr2)=>{
         let align = (a1,a2) =>{
             if(_.last(a2)[0]<_.last(a1)[0]){
                 a2.push([_.last(a1)[0],0]);
             }
         }
         
         if(_.last(arr1)[0]<_.last(arr2)[0]){
            align(arr2,arr1); 
         }else{
             align(arr1,arr2);
         }
            
    }

    //utility function to return a function(array) that will apply return arr.map(mapFunction) 
    self.mapWrapper = (mapFunction)=>{
        return (arr)=>{
            return arr.map(mapFunction);
        }
    }

    // pair [1,2] -> {x:1,y:2}
    //usage array.map()
    self.transformToStream = self.mapWrapper(function(pair){
        return{x:parseInt(pair[0]),y:pair[1]};
    });
    
    
    //make index 1 based [[0,22],[1,8]] -> [[1,22],[2,8]]
    // usage array.map(increaseIndexByOne); 
    self.increaseIndexByOne = self.mapWrapper(function(pair){
        return [pair[0]+1,pair[1]];
    });

    self.addEmptyRowFirst = (arr)=>{
        let result = _.clone(arr);
        result.unshift([0,0]);
        return result;
    }

    // Accu
    let sum;
    self.transformToAccSum = self.mapWrapper(function(pair,index){
        let result;
        if(index === 0){
            sum = 0;
        }
        sum += pair[1];
        result = {x:parseInt(pair[0]),y:sum};
       
        return result;
    });

    self.inversePercentage= self.mapWrapper(item=>{
        return {x:item.x,y:Math.floor(10*(100-item.y))/10};
    });

    

    self.rollingAverageTransformer = function(over){
        
        return self.mapWrapper(function(value,index,arr){
            let sum = 0;
            let samples = 0;
            let avg; 
            for(let i=index-(over-1);i<=index;i++){
                if(i>=0){
                    sum += _.last(arr[i]);
                    samples++;
                }
            }
            avg = Math.floor(100*sum/samples)/100;
            //console.log("sum/samples=avg =" + sum +"/"+ samples +"=" + avg);
            return [_.first(value),avg];
        });
    };

    

    // data = [[1,2],[3,4]]
    // sum = facory.sum(data,1);
    // sum = 6

    self.sum = (data,column)=>{
        column = column || 1;
        let sum = 0;
        data.forEach(row =>{
            if(Array.isArray(row[column])){
                 sum +=  row[column].length;
            }else if(!isNaN(row[column])){
                sum +=  row[column];
            }
        });
        return sum;
    };

    
    self.averageLeadtime = data => {
        let total= 0;
        const oneBased = 1;
        const iLeadtime = 0;
        const iDoneTickets = 1 
        data.forEach(row =>{
            if(!isNaN(row[iLeadtime])){ 
                 if(Array.isArray(row[iDoneTickets])){
                    total +=  (oneBased+row[iLeadtime])*row[iDoneTickets].length;
                }else if( !isNaN(row[iDoneTickets])){
                    total +=  (oneBased+row[iLeadtime])*row[iDoneTickets];
                }
            }
           
        });
        return Math.ceil(total/self.sum(data,1));
    };

   
    self.medianLeadtime = data => {
        let halfThroghput= self.sum(data,1)/2;
        let sum = 0;
        let median = 0;
        _.forEach(data,row =>{
             if(Array.isArray(row[1])){
                 sum +=  row[1].length;
            }else if(!isNaN(row[1])){
                sum +=  row[1];
            }
            if(sum >= halfThroghput){
                   median = 1+ row[0];
                   return false; 
            }
        });
        return median;
    };
    
    self.transformAccSumToAccPercentage = self.mapWrapper(function(value,index,arr){
        if(index === 0){
            sum = _.last(arr).y;
        }
        return{x:value.x,y:Math.floor(value.y/sum*1000)/10};
    });

     
    return self;
}

function NvD3ChartOptions(){
    const self = this;

    self.historicalBarChart = ()=>{
         return {
            
            chart: {
                type: 'multiChart',
                height: 450,
                margin : {
                    top: 30,
                    right: 60,
                    bottom: 50,
                    left: 100
                },
                color: d3.scale.category10().range(),
                useInteractiveGuideline: true,
                duration: 500,
                xAxis: {
                    tickFormat: function(d) {
                        return d3.time.format('%Y-%m-%d')(new Date(d));
                    }
                },
                yAxis1: {
                    axisLabel:"Tickets",
                    tickFormat: function(d){
                        return d3.format(',.0f')(d);
                    }
                }
            }
        };
    }

    self.spectralGraph = () =>{
        return {
            chart: {
                type: 'multiChart',
                height: 450,
                margin : {
                    top: 30,
                    right: 100,
                    bottom: 100,
                    left: 100
                },
                color: d3.scale.category10().range(),
                useInteractiveGuideline: true,
                duration: 500,
                xAxis: {
                    axisLabel:"Lead time",
                    tickFormat: function(d){
                        return d3.format(',f')(d);
                    }
                },
                yAxis1: {
                    axisLabel:"Tickets",
                    tickFormat: function(d){
                        return d3.format(',.0f')(d);
                    }
                },
                yAxis2: {
                    axisLabel:"Acc %",
                    tickFormat: function(d){
                        return d3.format(',.0f')(d);
                    }
                },
            }
        };
    }
}