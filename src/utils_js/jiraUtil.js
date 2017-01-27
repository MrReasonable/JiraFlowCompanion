function Url(location){
    var self = {};
    self.host = location.hostname||location.host;
    self.path = location.pathname||location.path;
    self.protocol = location.protocol||location.protocol;
    self.port = location.port;
    self.query = location.query||parseUrlQueryString(location.search);

    function parseUrlQueryString(queryString) {
        var query = queryString.substr(1);
        var result = {};
        query.split("&").forEach(function(part) {
            var item = part.split("=");
            if(!result[item[0]]){
                result[item[0]] = [];
            }
            result[item[0]].push( item[1]);//decodeURIComponent(item[1]);
        });
        return result;
    }

    return self;
}



function CfdUrl(location){
    
    let url  = new Url(location);   

    url.buildUrl = function(){
       return urlBuilder("rest/greenhopper/1.0/rapid/charts/cumulativeflowdiagram.json", url.buildCfdQueryString);
    }

    url.buildBoardConfigUrl = function(){
        return urlBuilder("rest/greenhopper/1.0/rapidviewconfig/editmodel.json",
                          function(query){
                              return "?rapidViewId="+query.rapidView[0];
                          });
    }

    url.hostWithPort= ()=>{
        var port = (url.port)?":"+url.port:url.port;
        return url.host + port;
    }
    
    url.buildRootUrl = function (){
        return url.protocol +"//"
                    + url.hostWithPort()
    }

    url.buildJiraIssueUrl = (issueKey)=>{
         return url.buildRootUrl()
                    + "/browse/"
                    + issueKey;
    }

    
    url.findIssuesByIssuekeys = function(issues,index){
        let query = jql.findIssuesInArray(issues,index);
        return url.buildRootUrl()
                +"/issues/?jql="
                +encodeURIComponent(query);
    }

    function urlBuilder(path,queryBuilder){
        var result = url.buildRootUrl() 
                    + url.path.replace(
                        "secure/RapidBoard.jspa"
                        ,path
                    ) 
                    + queryBuilder(url.query);
        console.log("Url Built:" + result);
        return result;
    }
    
    url.buildCfdQueryString = (query)=>{
        var result = "";
        if(query === undefined){
            query = url.query;
        }
        _.forEach(query, function(values,key){
            if(key != "view" & key != "chart" ){
                values.forEach(function(value){
                    result += key + "Id=" +value + "&" ;
                });
            }
        });
        result = "?" + result;
        return result;
    }

    url.getBoardId = function(){
        return url.query.rapidView
    }

    url.getProtocol = ()=>{
        return url.protocol//.replace(":","");
    }

    url.getUriFriendlyHostWithPort =()=>{
        return encodeURIComponent(url.hostWithPort());
    }

    url.getHostWithProtocol = function(){
        return  url.protocol +"//"+ url.host
    }

    return url;

}


let jql = {
    findIssuesInArray:function(arr,index){
        let issues;
        if(_.isUndefined(index)){
            index = 0;
        }
        issues = arr.map( issue => issue[index]);

        return "issueKey in ("+issues.toString()+")"
    }
}



