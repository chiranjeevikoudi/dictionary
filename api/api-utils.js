let request = require("request");
let apiUrls = require("./api-urls");
let errorCodes = require("./error-codes");
let apiUtils = {};

function getWordDataFrom(url, callback) {
    let options = {
        url: url,
        method: "get",
        json: true
    };
    request(options, function (err, res) {
        if (err) {
            if (err.code === "ENETUNREACH") {
                callback(errorCodes.NO_INTERNET);
            }
            else{
                callback(errorCodes.INTERNAL_ERROR);
            }
        }
        else if(res && res.body) {
            callback(null, res.body);
        }
        else {
            callback(null, null);
        }
    });
}

function getDefinitions(word, callback) {
    let url = apiUrls.URLS.BASE_URL+"/"+word+"/"+ apiUrls.URLS.DEFINITIONS+"&api_key="+apiUrls.API_KEY;
    getWordDataFrom(url, function (err, definitions) {
        if (err) {
            callback(err);
        }
        else if (definitions) {
            if(Object.prototype.toString.call(definitions).indexOf("Array")>-1){
                definitions.forEach(function (definition,index) {
                    definitions[index] = {
                        "partOfSpeech": definition["partOfSpeech"],
                        "text": definition["text"]
                    };
                });
                callback(null,definitions);
            }
            else if(Object.prototype.toString.call(definitions).indexOf("Object")>-1 && definitions.message && definitions.message === "Invalid authentication credentials"){
                callback(errorCodes.INVALID_API_KEY);
            }
            else{
                callback(errorCodes.INTERNAL_ERROR);
            }
        }

        else{
            callback(null,null);
        }
    });
}


apiUtils.getDefinitions = getDefinitions;

module.exports = apiUtils;