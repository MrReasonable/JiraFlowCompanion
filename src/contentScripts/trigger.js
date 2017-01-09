console.log("CFD_trigger: ");

function triggerCFD(){
    var url = {};
    url.host = window.location.hostname;
    url.path = window.location.pathname;
    url.protocol = window.location.protocol;
    url.query = parseUrlQueryString(window.location.search);
    return url;
}

function parseUrlQueryString(queryString) {
  var query = queryString.substr(1);
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    if(!result[item[0]]){
        result[item[0]] = []
    }
    result[item[0]].push( item[1]);//decodeURIComponent(item[1]);
  });
  return result;
}

function buildCfdUrl(url){
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
    result = "?" + result + "_=" + (new Date()).getTime();
    return result;
}

function addButton() {
        var textbox ;

        if($("#trigger-button").length){
            return;
        }
        
        
        if($('#subnav-trigger-report').length)  {
            textbox = document.createElement('input');
            textbox.type = 'button';
            textbox.value = "Analyse";
            textbox.setAttribute("id","trigger-button");
            //textbox.setAttribute("style","padding-left:10px;");
            $('#ghx-view-selector').append(textbox);
             $("#trigger-button").click(function(){
            var url = triggerCFD();
            var cfdUrl = buildCfdUrl(url);
            console.log("CFDURL: " +buildCfdUrl(url));
            sendExtensionMessage({"type":"open-data-page","page":cfdUrl});

        });
            console.log("button Appended");
        }

       

    }

function highlightActiveFilters(){
    $(".ghx-chart-filters").find(".aui-button.active").attr("style", "background-color:#A9BCF5;");
    $(".ghx-chart-filters").find(".aui-button:not(.active)").attr("style", "");
}

function improvePage(){
    highlightActiveFilters();
    addButton();
}

setInterval(improvePage, 500);


//http://jira1.srv.volvo.com/secure/RapidBoard.jspa?rapidView=785&view=reporting&chart=cumulativeFlowDiagram&swimlane=4542&column=7435&column=7436&column=7437&column=7438&column=7439&quickFilter=5699&quickFilter=5698
//http://jira1.srv.volvo.com/rest/greenhopper/1.0/rapid/charts/cumulativeflowdiagram.json?rapidViewId=785&swimlaneId=4542&quickFilterId=5699&quickFilterId=5698&columnId=7435&columnId=7436&columnId=7437&columnId=7438&columnId=7439&_=1483445038482