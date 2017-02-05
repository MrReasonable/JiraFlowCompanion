
function ThroughputGraphData(data){
    const self = this;
    self.data = data;
    const nvD3Trans = new NvD3Trans();

    self.throughputDataStreams = ()=>{
                if(data){
                    let chartData = [];
                    let throughputData = data;
                    
                    chartData.push(nvD3Trans.generateDataStream(
                            self.data[0][1]
                            ,"bar"
                            ,1
                            ,throughputData
                            ,[
                                nvD3Trans.transformToStream
                            ]));
                    chartData.push(nvD3Trans.generateDataStream(
                        "rolling Avg"
                        ,"line"
                        ,1
                        ,throughputData
                        ,[
                            nvD3Trans.rollingAverageTransformer( self.rollingAverage)
                            ,nvD3Trans.transformToStream
                        ]));
                     chartData.push(nvD3Trans.generateDataStream(
                         "acc Avg"
                        ,"line"
                        ,1
                        ,throughputData
                        ,[
                            nvD3Trans.rollingAverageTransformer( throughputData.length)
                            ,nvD3Trans.transformToStream
                        ]));
                    
                    self.sum =nvD3Trans.sum(data,1);
                    return chartData;
                }
                return ;
                
          }

          return self;
}

