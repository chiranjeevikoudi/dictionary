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
                if(definitions.length !== 0){
                    definitions.forEach(function (definition,index) {
                        definitions[index] = {
                            "partOfSpeech": definition["partOfSpeech"],
                            "text": definition["text"]
                        };
                    });
                    callback(null,definitions);
                }
                else{
                    callback(null,null);
                }
            }
            else if(isApiKeyValid(definitions)){
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

function isApiKeyValid(response) {
    return (Object.prototype.toString.call(response).indexOf("Object")>-1 && response.message && response.message === "Invalid authentication credentials")
}

function getSynonyms(word, callback) {
    let url = apiUrls.URLS.BASE_URL+"/"+word+"/"+ apiUrls.URLS.SYNONYMS+"&api_key="+apiUrls.API_KEY;
    getWordDataFrom(url, function (err, synonyms) {
        if (err) {
            callback(err);
        }
        else if (synonyms) {
            if(Object.prototype.toString.call(synonyms).indexOf("Array")>-1){
                if(synonyms.length !== 0){
                    let synonymsArray = [];
                    for(let index=0; index<synonyms.length; index++){
                        if(synonyms[index]["relationshipType"] && synonyms[index]["relationshipType"] === "synonym"){
                            if(synonyms[index]["words"]){
                                synonymsArray = synonyms[index]["words"];
                            }
                            break;
                        }
                    }
                    if(synonymsArray.length !== 0){
                        callback(null,synonymsArray);
                    }
                    else{
                        callback(null,null);
                    }
                }
                else{
                    callback(null,null);
                }
            }
            else if(isApiKeyValid(synonyms)){
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

apiUtils.getSynonyms = getSynonyms;


module.exports = apiUtils;