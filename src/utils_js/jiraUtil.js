function Url(location){
    var self = {};
    self.host = location.hostname||location.host;
    //self.path = location.pathname||location.path;
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



function JiraUrl(location){
    
    let url  = (location)? new Url(location):{};   

    url.cfdApiUrl = function(){
       return urlBuilder("/rest/greenhopper/1.0/rapid/charts/cumulativeflowdiagram.json", url.cfdQueryString);
    }

    url.boardConfigApiUrl = function(){
        return urlBuilder("/rest/greenhopper/1.0/rapidviewconfig/editmodel.json",
                          function(query){
                              return "?rapidViewId="+query.rapidView[0];
                          });
    }

    url.hostWithPort= ()=>{
        var port = (url.port)?":"+url.port:url.port;
        return url.host + port;
    }
    
    url.rootUrl = function (){
        return url.protocol +"//"
                    + url.hostWithPort()
    }

    url.issueUrl = (issueKey)=>{
         return url.rootUrl()
                    + "/browse/"
                    + issueKey;
    }

    
    url.findIssuesByIssueKeys = function(issues,index){
        let query = jql.findIssuesInArray(issues,index);
        return url.rootUrl()
                +"/issues/?jql="
                +encodeURIComponent(query);
    }

    function urlBuilder(path,queryBuilder){
        var result = url.rootUrl() 
                    + path
                    + queryBuilder(url.query);
        return result;
    }
    
    url.cfdQueryString = (query)=>{
        var result = "";
        if(query === undefined){
            query = url.query;
        }
        _.forEach(query, function(values,key){
            if(key != "view" & key != "chart" & key != "days"  ){
                values.forEach(function(value){
                    result += key + "Id=" +value + "&" ;
                });
            }
        });
        result = "?" + result;
        return result;
    }


    url.angularUrl = ()=>{
        return jiraUrl.protocol +"/"
        + jiraUrl.uriFriendlyHostWithPort() +"/"
        + jiraUrl.angularQueryString()
    };

    url.angularQueryString = ()=>{
        let result = "";
        _.forEach(url.query,(value,key)=>{
            if(value.toString!="" & ["view","chart","days"].indexOf(key)===-1){
                 result += key + "=" + value.toString() +"&"
            }
        });
        return result.slice(0, -1);
    }

    url.parseAngularQueryString = (queryString)=>{
        let query ={};
        let components = queryString.split("&");
        components.forEach(component=>{
            let parts = component.split("=");
            query[_.first(parts)] = JSON.parse("["+_.last(parts)+"]");
        })
        url.query = query;
        return query;
    }

    url.getBoardId = function(){
        return url.query.rapidView
    }


    url.uriFriendlyHostWithPort =()=>{
        return encodeURIComponent(url.hostWithPort());
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



