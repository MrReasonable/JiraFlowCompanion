function jsonDecode(string) {
    try {
        return JSON.parse(string);
    } catch (e) {
        try{
            return JSON.decode(string);
        }catch(e2){
            return {};
        }
    }
}

function jsonEncode(obj) {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        try{
            return JSON.encode(obj);
        }catch(e2){
            return "{}";
        }
        
    }
}

function cloneObjectData(obj){
    return jsonDecode(jsonEncode(obj));
}