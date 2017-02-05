function SpectralGraphData(data){
    self = this;
    self.data = data;
    let nvD3Trans = new NvD3Trans();
    self. spectralAnalysisDataStream = ()=>{
        if(self.data){
            let chartData = [];
            let spectralData = nvD3Trans.createContinousData(self.data);
            let samples = self.samples||spectralData.length;
            chartData.push(nvD3Trans.generateDataStream(
                "Tickets"
                ,"bar"
                ,1
                ,spectralData
                ,[
                    nvD3Trans.increaseIndexByOne
                    ,nvD3Trans.addEmptyRowFirst
                    ,nvD3Trans.transformToStream
                    ,_.curry(nvD3Trans.dropRight)(spectralData.length -samples)
                ]));
            chartData.push(nvD3Trans.generateDataStream(
                "Percent"
                ,"line"
                ,2
                ,spectralData
                ,[
                    nvD3Trans.increaseIndexByOne
                    ,nvD3Trans.addEmptyRowFirst
                    ,nvD3Trans.transformToAccSum
                    ,nvD3Trans.transformAccSumToAccPercentage
                    ,_.curry(nvD3Trans.dropRight)(spectralData.length -samples)
                ]));
            
            
            return chartData;
        }
        return ;
        
    }
    return self;

}

 