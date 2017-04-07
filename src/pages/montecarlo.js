//usage params ={
     //           passedThroughputData: array with passed throughput data example [1,5,7,4,6] ,
     //           passedInflowData: array with passed inflos data example [1,5,7,4,6] for stable scope [0],
     //           backlogLength: backlog starting point for simulation,
     //           simulations: Number of simulations to do
     //           maxRemaining:limit the maximum iterations remaining for the simulation default = 100;
     //       }
     function MonteCarloSimulator(params){
        const self = this;
        let maxRemaining = params.maxRemaining||100;
        self.simulate = ()=>{
            let result = [];
            
            for(let i=0;i<params.simulations;i++){
                let simulation = {};
                simulation.remaining = maxRemaining
                simulation.throughput = generateSample(params.passedThroughputData);
                simulation.inflow = generateSample(params.passedInflowData);
                if(simulation.throughput && (simulation.throughput > simulation.inflow)){
                    simulation.remaining = limitRemaining(Math.ceil(params.backlogLength/((simulation.throughput*params.focus/100)-simulation.inflow)));
                }
                result.push(simulation);
            }
            return new MonteCarloResult(result);
        }

        let limitRemaining =(value)=>{
            return (maxRemaining>=value)?value:maxRemaining;
        }

        let generateSample = (arr)=>{
            const len = arr.length;
            result = 0;
            for(let i=0;i<len;i++){
                result += arr[Math.floor(len*Math.random())];
            }
            return result/len;

        }
        return self;
    }

// Aggregate to distributions
//____________________________________________________________________________________________    

    function MonteCarloResult(data){
        let self = this;
        self.data = data;
    
        self.aggregatedAsDistributions = ()=>{
            let distributions ={
                throughput : aggregate(self.data,(item)=>Math.floor(item.throughput)),
                inflow : aggregate(self.data,(item)=>Math.ceil(item.inflow)),
                remaining : aggregate(self.data,item=>item.remaining)
            }
            return distributions;
        }

        function toKeyValueArray(obj){
            let data = [];
            _.forEach(obj,function(item,index){
                data.push([parseInt(index),item]);
            })
            data.sort(function(a,b){
                return a[0]-b[0];
            })
            return data;
        }

        function aggregate(arr,transformer){
            result = {}
            arr.forEach(item=>{
                let transformed = transformer(item);
                if (!result[transformed]){
                    result[transformed] = 0;
                };
                result[transformed]++;
            });
            console.log (JSON.stringify(result));
            return toKeyValueArray(result);
        }

        return self;
    }

//Transform to graph data
//_______________________________________________________________________________________________________________________________

    function MonteCarloGraphData(data){
        const self = this;
        self.data = data;
        const transformer = new NvD3Trans();
        
        self.remainingIterationsDataStreams = ()=>{
                if(self.data){
                    let chartData = [];
                    let simulationCount = transformer.count(self.data.remaining);
                    
                    
                    self.data.remaining.unshift([,]);
                    let remainingIterations = transformer.createContinousData(self.data.remaining);
                    chartData.push(transformer.generateDataStream(
                        "Likelyhood %"
                        ,"area"
                        ,1
                        ,remainingIterations
                        ,[
                            transformer.toPercentage(simulationCount),
                            transformer.transformToStream
                        ]));
                    chartData.push(transformer.generateDataStream(
                        "Confidence %"
                        ,"line"
                        ,2
                        ,remainingIterations
                        ,[
                            transformer.transformToAccSum
                            ,transformer.transformAccSumToAccPercentage
                            
                        ]));
                    return chartData;
                }
                return ;
                
          }

           self.backlogDevelopmentStreams = ()=>{
                if(self.data){
                    let chartData = [];
                    let simulationCount = transformer.count(self.data.throughput);
                    self.data.throughput.unshift([,]);
                    self.data.inflow.unshift([,]);
                     if(self.data.inflow.length != 2){
                         transformer.alignArrays(self.data.throughput,self.data.inflow);
                     }
                    let throughputData = transformer.createContinousData(self.data.throughput);
                    let inflowData = transformer.createContinousData(self.data.inflow);
                    chartData.push(transformer.generateDataStream(
                        "TP Likleyhood %"
                        ,"area"
                        ,1
                        ,throughputData
                        ,[
                            transformer.toPercentage(simulationCount),
                            transformer.transformToStream
                           
                            
                        ]));
                    chartData.push(transformer.generateDataStream(
                        "TP confidence %"
                        ,"line"
                        ,2
                        ,throughputData
                        ,[
                            transformer.transformToAccSum,
                            transformer.transformAccSumToAccPercentage
                            ,transformer.inversePercentage
                            
                        ]));
                    if(inflowData.length != 2){
                        chartData.push(transformer.generateDataStream(
                        "Inflow likleyhood %"
                        ,"bar"
                        ,1
                        ,inflowData
                        ,[
                            transformer.toPercentage(simulationCount),
                            transformer.transformToStream
                        ]));
                    chartData.push(transformer.generateDataStream(
                        "Inflow confidence"
                        ,"line"
                        ,2
                        ,inflowData
                        ,[
                            transformer.transformToAccSum
                            ,transformer.transformAccSumToAccPercentage
                            ,transformer.inversePercentage
                        ]));
                    }
                    
                    
                    
                    return chartData;
                }
                return ;
                
          }

          return self;
        
    }