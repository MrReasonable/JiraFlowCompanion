let jiraUrl;
function messageHandler (request, sender, sendResponse) {
    "use strict";
    var data,settings,key;
    console.log ("Incoming request = " + jsonEncode(request));
    
    switch(request.type) {
        case "open-data-page"://board triggering spa page opening
           
                let page = "spa.html";
                jiraUrl = new JiraUrl(request.page);
                let url = jiraUrl.cfdApiUrl();
                console.log("spa page for"  + url + " requested");
                    page = page+"#!/cfd/";
                
                let newURL = "pages/"+page 
                    + jiraUrl.angularUrl();
                chrome.tabs.create({ url: newURL });
                sendResponse("OK");
                console.log("open-data-page handled spa.html#/cfd/"+ request.page +" opened");
           

            break;
        case "getUrl":
            
            sendResponse(jiraUrl);
            break;
    }
    return true;
}

chrome.extension.onMessage.addListener(messageHandler)