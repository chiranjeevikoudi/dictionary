let commands = {};
let apiUtils = require("../api/api-utils");
const COMMANDS = ["def", "syn", "ant", "ex", "dict"];
const COMMAND_MAP = {
    "def": apiUtils.getDefinitions,
    "syn": apiUtils.getSynonyms,
    "ant": apiUtils.getAntonyms,
    "ex": apiUtils.getExamples,
    "dict": apiUtils.getWordDetails,
    "wordOftheDay": apiUtils.getWordOfTheDayDetails,
    "randomWordDetails": apiUtils.getRandomWordDetails
};
const COMMAND_WORDS_MAP = {
    "def": "definitions",
    "syn": "synonyms",
    "ant": "antonyms",
    "ex": "examples"
};

function logDefinitions(definitions, delimiter) {
    for (let index = 0; index < definitions.length; index++) {
        console.log(delimiter+definitions[index]["partOfSpeech"]+":"+"\n"+delimiter+"\t"+definitions[index]["text"])
    }
}

function logSynonyms(synonyms, delimiter) {
    for (let index = 0; index < synonyms.length; index++) {
        console.log(delimiter+synonyms[index]);
    }
}

function logAntonyms(antonyms, delimiter) {
    for (let index = 0; index < antonyms.length; index++) {
        console.log(delimiter+antonyms[index]);
    }
}



commands.COMMANDS = COMMANDS;
commands.COMMAND_MAP = COMMAND_MAP;
commands.COMMAND_WORDS_MAP = COMMAND_WORDS_MAP;
commands.logDefinitions = logDefinitions;
commands.logSynonyms = logSynonyms;
commands.logAntonyms = logAntonyms;


module.exports = commands;