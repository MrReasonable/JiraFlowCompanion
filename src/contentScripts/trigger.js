console.log("CFD_trigger: ");

function addButton() {
    var button ;

    if($("#trigger-button").length){
        return;
    }
    console.log("addButton");
    let query =  $('#ghx-board-name') ? '#ghx-board-name':'#ghx-chart-title';

    button = document.createElement('input');
    button.type = 'button';
    button.value = "Analyse flow";
    button.setAttribute("id","trigger-button");

    $("#ghx-board-name").append(button);
    $("#trigger-button").click(function(){
        var jiraUrl = ( identifyCFDPage())? new JiraUrl(window.location):getReportParametersFromBoard();
        console.log("jiraUrl: " + jiraUrl.cfdApiUrl());
        sendExtensionMessage({"type":"open-data-page","page":jiraUrl});
    });
    console.log("button Appended");
}

function getReportParametersFromBoard(){
    "use strict";
    let jiraUrl = new JiraUrl(window.location);
    jiraUrl.query.column = [];

    $.each($(".ghx-column[data-id]"),function (){
        jiraUrl.query.column.push($(this).attr('data-id'))
    });
    jiraUrl.query.swimlane =[];
    $.each($(".ghx-swimlane[swimlane-id]"),function (){
        jiraUrl.query.swimlane.push($(this).attr('swimlane-id'))
    });
    return jiraUrl;

}

function identifyCFDPage(){
    let isCFD = false;

    if($('#subnav-trigger-report').length & $('#subnav-trigger-report').text()==="Cumulative Flow Diagram"){
        isCFD = true;
    } else if ( $('#subnav-title').text()==="Cumulative Flow Diagram"){
        isCFD = true;
    } else if ( $('#ghx-chart-title').length & $('#ghx-chart-title').text()==="Cumulative Flow Diagram"  ){
        isCFD = true;
    }

    return isCFD;
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

/*
Old jira structure

<div id="ghx-chart-header-primary" class="aui-item">
    <div id="ghx-chart-title">
        <h2>Cumulative Flow Diagram</h2>
    </div>
    <div id="ghx-chart-selector">
    </div>
    <div id="ghx-chart-controls" style="display: block;">
        <div id="ghx-chart-timeframe">
            <button id="js-chart-timeframe" class="aui-button aui-button-subtle ghx-dropdown-trigger js-timeframe-info ghx-pull-left">
                3/Apr/17 to 24/Apr/17 (Custom)
            </button>
        </div>
        <div id="ghx-chart-filter">
            <button id="js-chart-filter" class="aui-button aui-button-icon aui-button-subtle ghx-dropdown-trigger">
                <span class="aui-icon ghx-iconfont aui-icon-small aui-iconfont-info" title=" Chart is using non-default settings ">
                     Chart is using non-default settings 
                </span> 
                Refine report
            </button>
        </div>
    </div>
    <div id="ghx-chart-help" class="ghx-closed">
        <div class="ghx-howto-trigger ghx-closed">
            <span class="ghx-iconfont ghx-iconfont-inactive aui-icon aui-icon-small aui-iconfont-help"></span> 
            <a class="aui-button aui-button-link js-chart-intro-toggle" tabindex="0">
                How to read this chart<
            /a>
        </div>
    </div>
    <div id="ghx-chart-snapshot">
    </div>
</div>

*/