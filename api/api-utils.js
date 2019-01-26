let request = require("request");
let apiUrls = require("./api-urls");
let errorCodes = require("./error-codes");
let urlEncode = require('urlencode');
let async = require("async");
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
    let url = apiUrls.URLS.BASE_URL+"/word.json/"+urlEncode(word)+"/"+ apiUrls.URLS.DEFINITIONS+"&api_key="+apiUrls.API_KEY;
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

function getSynonyms(word, callback) {
    let url = apiUrls.URLS.BASE_URL+"/word.json/"+urlEncode(word)+"/"+ apiUrls.URLS.SYNONYMS+"&api_key="+apiUrls.API_KEY;
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

function getAntonyms(word, callback) {
    let url = apiUrls.URLS.BASE_URL+"/word.json/"+urlEncode(word)+"/"+ apiUrls.URLS.ANTONYMS+"&api_key="+apiUrls.API_KEY;
    getWordDataFrom(url, function (err, antonyms) {
        if (err) {
            callback(err);
        }
        else if (antonyms) {
            if(Object.prototype.toString.call(antonyms).indexOf("Array")>-1){
                if(antonyms.length !== 0){
                    let antonymsArray = [];
                    for(let index=0; index<antonyms.length; index++){
                        if(antonyms[index]["relationshipType"] && antonyms[index]["relationshipType"] === "antonym"){
                            if(antonyms[index]["words"]){
                                antonymsArray = antonyms[index]["words"];
                            }
                            break;
                        }
                    }
                    if(antonymsArray.length !== 0){
                        callback(null,antonymsArray);
                    }
                    else{
                        callback(null,null);
                    }
                }
                else{
                    callback(null,null);
                }
            }
            else if(isApiKeyValid(antonyms)){
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

function getExamples(word, callback) {
    let url = apiUrls.URLS.BASE_URL+"/word.json/"+urlEncode(word)+"/"+ apiUrls.URLS.EXAMPLES+"&api_key="+apiUrls.API_KEY;
    getWordDataFrom(url, function (err, examples) {
        if (err) {
            callback(err);
        }
        else if (examples) {
            if(Object.prototype.toString.call(examples).indexOf("Object")>-1 && examples.examples && examples.examples.length !== 0){
                let examplesArray = [];
                for(let index=0; index<examples.examples.length; index++){
                    if(examples.examples[index]["text"]){
                        examplesArray.push(examples.examples[index]["text"]);
                    }
                }
                if(examplesArray.length !== 0){
                    callback(null,examplesArray);
                }
                else{
                    callback(null,null);
                }
            }
            else if(Object.keys(examples).length === 0){
                callback(null,null);
            }
            else if(isApiKeyValid(examples)){
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

function getWordOfTheDay(callback) {
    let url = apiUrls.URLS.BASE_URL+"/words.json/"+ apiUrls.URLS.WORD_OF_THE_DAY+"?api_key="+apiUrls.API_KEY;
    getWordDataFrom(url, function (err, wordOfTheDay) {
        if (err) {
            callback(err);
        }
        else if (wordOfTheDay) {
            if(Object.prototype.toString.call(wordOfTheDay).indexOf("Object")>-1 && wordOfTheDay.word){
                callback(null,wordOfTheDay.word);
            }
            else if(Object.keys(wordOfTheDay).length === 0){
                callback(null,null);
            }
            else if(isApiKeyValid(wordOfTheDay)){
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

function getWordDetails(word, callback) {
    async.parallel({
        "definitions":function (cb) {
            getDefinitions(word,cb);
        },
        "synonyms":function (cb) {
            getSynonyms(word,cb);
        },
        "antonyms":function (cb) {
            getAntonyms(word,cb);
        },
        "examples":function (cb) {
            getExamples(word,cb);
        }
    },function (err,wordDetails) {
        if(err){
            callback(err);
        }
        else{
            for(let property in wordDetails){
                if(wordDetails[property] === null){
                    delete wordDetails[property];
                }
            }
        }
        callback(err,wordDetails);
    });
}

function getWordOfTheDayDetails(callback) {
    getWordOfTheDay(function (err, wordOfTheDay) {
        if(err){
            callback(err);
        }
        else if(wordOfTheDay){
            async.parallel({
                "definitions":function (cb) {
                    getDefinitions(wordOfTheDay,cb);
                },
                "synonyms":function (cb) {
                    getSynonyms(wordOfTheDay,cb);
                },
                "antonyms":function (cb) {
                    getAntonyms(wordOfTheDay,cb);
                },
                "examples":function (cb) {
                    getExamples(wordOfTheDay,cb);
                }
            },function (err,wordDetails) {
                if(err){
                    callback(err);
                }
                else{
                    for(let property in wordDetails){
                        if(wordDetails[property] === null){
                            delete wordDetails[property];
                        }
                    }
                    wordDetails["word"] = wordOfTheDay;
                }
                callback(err,wordDetails);
            });

        }
        else{
            callback(null,null);
        }
    });
}

function getRandomWord(callback) {
    let url = apiUrls.URLS.BASE_URL+"/words.json/"+ apiUrls.URLS.RANDOM_WORD+"&api_key="+apiUrls.API_KEY;
    getWordDataFrom(url, function (err, randomWord) {
        if (err) {
            callback(err);
        }
        else if (randomWord) {
            if(Object.prototype.toString.call(randomWord).indexOf("Object")>-1 && randomWord.word){
                callback(null,randomWord.word);
            }
            else if(Object.keys(randomWord).length === 0){
                callback(null,null);
            }
            else if(isApiKeyValid(randomWord)){
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

function getRandomWordDetails(callback) {
    getRandomWord(function (err, randomWord) {
        if(err){
            callback(err);
        }
        else if(randomWord){
            async.parallel({
                "definitions":function (cb) {
                    getDefinitions(randomWord,cb);
                },
                "synonyms":function (cb) {
                    getSynonyms(randomWord,cb);
                },
                "antonyms":function (cb) {
                    getAntonyms(randomWord,cb);
                },
                "examples":function (cb) {
                    getExamples(randomWord,cb);
                }
            },function (err,wordDetails) {
                if(err){
                    callback(err);
                }
                else{
                    for(let property in wordDetails){
                        if(wordDetails[property] === null){
                            delete wordDetails[property];
                        }
                    }
                    wordDetails["word"] = randomWord;
                }
                callback(err,wordDetails);
            });

        }
        else{
            callback(null,null);
        }
    });
}

function isApiKeyValid(response) {
    return (Object.prototype.toString.call(response).indexOf("Object")>-1 && response.message && response.message === "Invalid authentication credentials")
}




apiUtils.getDefinitions = getDefinitions;
apiUtils.getSynonyms = getSynonyms;
apiUtils.getAntonyms = getAntonyms;
apiUtils.getExamples = getExamples;
apiUtils.getWordOfTheDay = getWordOfTheDay;
apiUtils.getWordDetails = getWordDetails;
apiUtils.getWordOfTheDayDetails = getWordOfTheDayDetails;
apiUtils.getRandomWord = getRandomWord;
apiUtils.getRandomWordDetails = getRandomWordDetails;


module.exports = apiUtils;