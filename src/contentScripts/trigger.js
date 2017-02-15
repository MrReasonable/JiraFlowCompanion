console.log("CFD_trigger: ");

function addButton() {
    var textbox ;

    if($("#trigger-button").length & $('#subnav-trigger-report').text() != "Cumulative Flow Diagram"){
        $("#trigger-button").remove();
        return;
    }else if($("#trigger-button").length){
        return;
    }

    
    if($('#subnav-trigger-report').length & $('#subnav-trigger-report').text()==="Cumulative Flow Diagram")  {
        textbox = document.createElement('input');
        textbox.type = 'button';
        textbox.value = "Analyse";
        textbox.setAttribute("id","trigger-button");
        //textbox.setAttribute("style","padding-left:10px;");
        $('#ghx-view-selector').append(textbox);
        $("#trigger-button").click(function(){
        var jiraUrl = new JiraUrl(window.location);
        console.log("jiraUrl: " + jiraUrl.cfdApiUrl());
        sendExtensionMessage({"type":"open-data-page","page":jiraUrl});
    });
        console.log("button Appended");
    }
}

function highlightActiveFilters(){
    $(".ghx-chart-filters").find(".aui-button.active").attr("style", "background-color:#A9BCF5;");
    $(".ghx-chart-filters").find(".aui-button:not(.active)").attr("style", "");
    $(".aui-inline-dialog-contents").css("overflow","scroll");
    
}

function improvePage(){
    highlightActiveFilters();
    addButton();
}

setInterval(improvePage, 500);