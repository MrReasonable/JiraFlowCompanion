function Url(location){
    var self = {};
    self.host = location.hostname||location.host;
    self.path = location.pathname||location.path;
    self.protocol = location.protocol||location.protocol;
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
        var result = url.protocol +"//"
                    + url.host 
                    + url.path.replace(
                        "secure/RapidBoard.jspa"
                        ,"rest/greenhopper/1.0/rapid/charts/cumulativeflowdiagram.json"
                    ) 
                    + buildCfdQueryString(url.query);
        return result;
    }

    function buildCfdQueryString(query){
        var result = "";
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

    return url;

}

