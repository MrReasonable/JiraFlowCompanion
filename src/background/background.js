function messageHandler (request, sender, sendResponse) {
    "use strict";
    var data,settings,key;
    console.log ("Incoming request = " + jsonEncode(request));
    switch(request.type) {
        case "open-data-page"://board triggering spa page opening
           
                let page = "spa.html";
                let url = decodeUrlKeepEncodedSpaces(request.page);
                console.log("spa page for"  + request.page + " requested");
                    page = page+"#!/cfd/";
                
                let newURL = "pages/"+page+encodeUrl(url);
                chrome.tabs.create({ url: newURL });
                sendResponse("OK");
                console.log("open-data-page handled spa.html#/cfd/"+ request.page +" opened");
           

            break;
    }
    return true;
}

chrome.extension.onMessage.addListener(messageHandler)