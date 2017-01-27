function jsonDecode(string) {
    try {
        return JSON.parse(string);
    } catch (e) {
        try {
            return JSON.decode(string);
        } catch (e2) {
            return {};
        }
    }
}

function jsonEncode(obj) {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        try {
            return JSON.encode(obj);
        } catch (e2) {
            return "{}";
        }

    }
}

function cloneObjectData(obj) {
    return jsonDecode(jsonEncode(obj));
}

function objectDataIsEqual(obj1, obj2) {
    return jsonEncode(obj1) === jsonEncode(obj2);
}

function TimeUtil() {
    const self = this;
    self.MILLISECONDS_DAY = 86400000; //24*60*60*1000=86400000
    self.MILLISECONDS_HOUR = this.MILLISECONDS_DAY / 24;
    this.now = function () {
        return new Date();
    };

    this.enter = function () {
        return this.dateFormat(this.now().getTime());
    };

    this.daysSince = function (date) {
        return Math.floor((this.now() - date) / this.MILLISECONDS_DAY);
    };

    this.daysUntil = function (date) {
        return Math.floor((date - this.now()) / this.MILLISECONDS_DAY);
    };

    this.highlightTime = function (days, old) {
        if (!old) {
            old = 50;
        }
        if (days < 2) {
            return "new";
        } else if (days > old) {
            return days + " (old)";
        }
        return days;
    };

    this.dayStart = function (milliseconds) {
        return this.daysSinceEpoc(milliseconds) * this.MILLISECONDS_DAY;
    };

    this.getMonday = function(d) {
        d = new Date(d);
        var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
        return new Date(d.setDate(diff)).getTime();
    };

    this.daysSinceEpoc = function (milliseconds) {
        return Math.floor(milliseconds / this.MILLISECONDS_DAY);
    };


    this.dateFormat = function (milliseconds) {
        var time = new Date(milliseconds);
        var formatedDate = "" + time.getFullYear() + "-" + twoDigits(time.getMonth() + 1) +
            "-" + twoDigits(time.getDate()) +
            " " + twoDigits(time.getHours()) +
            ":" + twoDigits(time.getMinutes());
        return formatedDate;
    };

    this.isoDateFormat = function (milliseconds) {
        var time = new Date(parseInt(milliseconds));
        var formatedDate = "" + time.getFullYear() + "-" + twoDigits(time.getMonth() + 1) +
            "-" + twoDigits(time.getDate());
        return formatedDate;
    };

    this.timeFormat = function (milliseconds) {
        milliseconds = parseInt(milliseconds);
        if(!milliseconds){
            return;
        }
        let time = new Date(milliseconds);
        var days = Math.floor(milliseconds / self.MILLISECONDS_DAY);
        var hours;
        var minutes;
        milliseconds = milliseconds % self.MILLISECONDS_DAY;
        hours = Math.floor(milliseconds / (self.MILLISECONDS_HOUR));
        minutes = Math.floor((milliseconds % self.MILLISECONDS_HOUR) / 60000);
        return "" + days + ":" + twoDigits(hours) + ":" + twoDigits(minutes);
    };

    return this;
}

timeUtil = new TimeUtil();


function arrayOfNulls(length) {
    var self = [];
    var i;
    for (i = 0; i < length; i++) {
        self[i] = null;
    }

    return self;
}

function arraysAreIdentical(arr1, arr2) {
    if (!arr1 || !arr2)
        return false;

    // compare lengths - can save a lot of time
    if (arr1.length != arr2.length)
        return false;

    for (var i = 0, l = arr1.length; i < l; i++) {
        // Check if we have nested arrays
        if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
            // recurse into the nested arrays
            if (!arraysAreIdentical(arr1, arr2[i])) {
                return false;
            }

        }
        else if (arr1[i] !== arr2[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

function twoDigits(input) {
    var output = "0" + input;
    return output.substring(output.length - 2, output.length);
}

function downloadAsJson(data, filePrefix) {
    var blob = new Blob([jsonEncode(data)], {type: "data:application/json;charset=utf-8"});
    saveAs(blob, filePrefix + timeUtil.enter() + ".json");
}

function downloadAsCSV(data, filePrefix) {
    var blob = new Blob([jsonGridToCSV(data)], {type: "data:application/csv;charset=utf-8"});
    saveAs(blob, filePrefix + timeUtil.enter() + ".csv");
}


function jsonGridToCSV(grid) {
    var i;
    var j;
    var csv = "";
    var row = "";
    var value = "";
    for (i = 0; i < grid.length; i++) {
        row = "";
        for (j = 0; j < grid[i].length; j++) {
            value = grid[i][j];
            if (value === undefined) {
                value = "";
            }
            row = row + '"' + value + ((grid[i].length - 1 === j) ? '"' : '",');
        }
        csv = csv + row + ((grid.length - 1 === i) ? '' : '\r\n');
    }
    return csv;
}

function arrayOf(value, length) {
    var arr = [];
    for (var i = 0; i < length; i++) {
        arr[i] = value;
    }
    return arr;
}

function gridOf(value, rows, columns) {
    var grid = [];
    for (var i = 0; i < rows; i++) {
        grid[i] = arrayOf(value, columns);
    }
    return grid;
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function sendRestRequest(url) {
    // Return a new promise.
    return new Promise(function (resolve, reject) {
           $.get(url,function(response,status){
               if(status === "success"){
                   resolve(response);
               }else{
                   reject(status);
               }
               
           });
            
        
    });
}


function sendExtensionMessage(message) {
    // Return a new promise.
    return new Promise(function (resolve, reject) {
        chrome.runtime.sendMessage(message, function (response) {
            resolve(response);
        });
    });
}

function decodeUrlKeepEncodedSpaces(url) {
    return decodeURIComponent(url).replace(/ /g, "%20");
}

function decodeUrl(encoded) {
    return encoded.replace(/\(_\)/g, ':').replace(/\(-\)/g, '/').replace(/ /g, "%20").replace("%3F","?");
}

function encodeUrl(url) {
    var withoutColons = url.replace(/:/g, "(_)");
    var withoutSlashes = url.replace(/\//g, "(-)");
    return url.replace(/:/g, "(_)").replace(/\//g, "(-)").replace(/\?/g,"%3F");
}
function filterArray(arr, filterFunc) {
    var filteredArray = [];
    _.forEach(arr, function (item) {
        if (filterFunc(item)) {
            filteredArray.push(item);
        }
    });

    return filteredArray;
}

function caseInsensitiveSort (a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
}

function exportTableToCSV($table, filename, trigger) {
    var $rows;

    if (!trigger) {
        trigger = this;
    }
    $rows = $table.find('tr:has(td),tr:has(th)');
    function getCsvData() {
        // Temporary delimiter characters unlikely to be typed by keyboard
        // This is to avoid accidentally splitting the actual contents
        var tmpColDelim = String.fromCharCode(11); // vertical tab character
        var tmpRowDelim = String.fromCharCode(0); // null character

        // actual delimiter characters for CSV format
        var colDelim = '";"';
        var rowDelim = '"\r\n"';

        // Grab text from table into CSV formatted string
        var csv = '"' + $rows.map(function (i, row) {
                var $row = $(row),
                    $cols = $row.find('td,th');

                return $cols.map(function (j, col) {
                    var $col = $(col),
                        text = $col.text();

                    return text.replace('"', '""'); // escape double quotes

                }).get().join(tmpColDelim);

            }).get().join(tmpRowDelim)
                .split(tmpRowDelim).join(rowDelim)
                .split(tmpColDelim).join(colDelim) + '"';

        return csv;

    }

    // Data URI
    csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(getCsvData());

    $(trigger)
        .attr({
            'download': filename,
            'href': csvData,
            'target': '_blank'
        });
}


function _forEachIndex(collection, func) {
    var index;
    var breakLoop;
    for (index in collection) {
        breakLoop = func(collection[index], index);
        if (breakLoop === false) {
            break;
        }
    }
}

function _transform(arr, transFunction) {
    var result = [];
    _.forEach(arr, function (element) {
        result.push(transFunction(element))
    });
    return result;
}

var cfdUtil = {
    cfdSamplingIntervall: function (start, end) {
        var days = Math.floor((end - start) / timeUtil.MILLISECONDS_DAY);
        var interval = Math.floor(days / 50);
        if (interval === 0) {
            interval = 1;
        }
        return interval;
    },
    generateCfdSampleTimes: function (start, end) {
        var interval;
        var sampleTimes = [];
        start = timeUtil.dayStart(start);
        end = timeUtil.dayStart(end);
        end = end + timeUtil.MILLISECONDS_DAY;
        interval = cfdUtil.cfdSamplingIntervall(start, end);
        start = start - interval * timeUtil.MILLISECONDS_DAY;
        while (end > start) {
            sampleTimes.push(end);
            end -= timeUtil.MILLISECONDS_DAY * interval;
        }
        return sampleTimes.reverse();
    },
    generateSampleTimes:function (start,weeksInterval){
        interval = weeksInterval || 1;
        var week = timeUtil.MILLISECONDS_DAY*7;
        var end = new Date().getTime() + week;
        var first = timeUtil.getMonday(parseInt(start));
        var samples = [];

        for(let index=0; (first + index*week*interval)<end;index++){
            samples.push(first + index*week*interval);
        }
        return samples;
    },
    readableDatesOnCfdData: function (data) {
        var copy = _.cloneDeep(data);
        var index;
        for (index = 1; index < data.length; index++) {

            if (!isNaN(data[index][0])) {
                copy[index][0] = timeUtil.isoDateFormat(data[index][0]);
            }
        }
        return copy;
    }
};

reportHelpers = {
    columnToReadableDates:(grid,columns)=>{
        columns = columns || 0;
        
        if(!_.isArray(columns)){
            columns = [columns]
        }

        return grid.map(row=>{
            
            columns.forEach((col)=>{
                if(parseInt(row[col])){
                    row[col] = timeUtil.isoDateFormat(row[col]);
                }
            })
            return row;
        });
    },

    //tansforms the grid contents with the provided functions by columns
    // example
    // let data = [[1.5,2],[2.5,1]];
    // let result = data.map(reportHelpers.formatGrid([Math.floor,x=>x/2]));
    // result === [[1,1],[2,0.5]];
    formatGrid:(formatters)=>{
       let mapFunc = (row)=>{
           formatters.forEach((formatter,index)=>{
               if(_.isFunction(formatter)&& !isNaN(row[index])){
                  row[index] = formatter(row[index]); 
               }
           });
           return row;
       } 
       return mapFunc;  
    }


}

