function SpectralGraphData(data){
    const self = this;
    self.data = data;
    let nvD3Trans = new NvD3Trans();
    self. spectralAnalysisDataStream = (samples)=>{
        
        if(self.data){
            let chartData = [];
            let spectralData = nvD3Trans.countItems( nvD3Trans.createContinousData(self.data));
            let drop = samples||spectralData.length;
            chartData.push(nvD3Trans.generateDataStream(
                "Tickets"
                ,"bar"
                ,1
                ,spectralData
                ,[
                    //nvD3Trans.increaseIndexByOne,
                    nvD3Trans.addEmptyRowFirst
                    ,nvD3Trans.transformToStream
                    ,_.curry(nvD3Trans.dropRight)(spectralData.length -drop)
                ]));
            chartData.push(nvD3Trans.generateDataStream(
                "Percent"
                ,"line"
                ,2
                ,spectralData
                ,[
                    //nvD3Trans.increaseIndexByOne,
                    nvD3Trans.addEmptyRowFirst
                    ,nvD3Trans.transformToAccSum
                    ,nvD3Trans.transformAccSumToAccPercentage
                    ,_.curry(nvD3Trans.dropRight)(spectralData.length -drop)
                ]));
            
            
            return chartData;
        }
        return ;
        
    }
    return self;

}

 