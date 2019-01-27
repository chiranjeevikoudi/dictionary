let commands = require("./commands/commands");
const readline = require('readline');
let commandLineArgs = process.argv;
let errorCodes = require("./api/error-codes");
if (commandLineArgs.length >= 4) {
    if (commands.COMMANDS.indexOf(commandLineArgs[2]) > -1) {
        commands.COMMAND_MAP[commandLineArgs[2]](commandLineArgs[3], function (err, details) {
            if (err) {
                logError(err);
            }
            else if (details) {
                console.log(JSON.stringify(details,null,2));
            }
            else {
                logNoDataFound();
            }
        });
    }
    else {
        let error = errorCodes.INVALID_COMMAND;
        error.message = commandLineArgs[2] + " " + error.message + " Available commands : " + commands.COMMANDS;
        logError(error);
    }
}
else if (commandLineArgs.length === 3) {
    if (commandLineArgs[2] === "play") {
        playWordGame();
    }
    else {
        commands.COMMAND_MAP["dict"](commandLineArgs[2], function (err, details) {
            if (err) {
                logError(err);
            }
            else if (details) {
                console.log(JSON.stringify(details,null,2));
            }
            else {
                logNoDataFound();
            }
        });
    }
}
else {
    commands.COMMAND_MAP["wordOftheDay"](function (err, details) {
        if (err) {
            logError(err);
        }
        else if (details) {
            console.log(JSON.stringify(details,null,2));
        }
        else {
            logNoDataFound();
        }
    });
}



function logError(err) {
    console.log("ERROR: " + err.code + "\n" + "\t" + err.message);
}

function logNoDataFound() {
    console.log("NO_DATA: no data found.");
}

function playWordGame() {
    commands.COMMAND_MAP["randomWordDetails"](function (err,randomWordDetails) {
        if (err) {
            logError(err);
        }
        else if (randomWordDetails) {
            if(randomWordDetails.definitions){
                console.log("definition :"+"\n\t"+JSON.stringify(randomWordDetails.definitions[0]["text"],null,2));
            }
            if(randomWordDetails.synonyms){
                console.log("synonym :"+"\n\t"+JSON.stringify(randomWordDetails.synonyms[0],null,2));
            }
            else if(randomWordDetails.antonyms){
                console.log("antonym :"+"\n\t"+JSON.stringify(randomWordDetails.antonyms[0],null,2));
            }
            takeUserInput("Enter the word : ",function (enteredWord) {
                checkUserInput(randomWordDetails,enteredWord,0);
            });
        }
        else {
            logNoDataFound();
        }
    });
}

function takeUserInput(question,cb) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(question, (answer) => {
        rl.close();
        cb(answer)
    });
}

function checkUserInput(wordDetails,enteredWord,index) {
    if(enteredWord === wordDetails.word || (wordDetails.synonyms && wordDetails.synonyms.indexOf(enteredWord)>-1 && wordDetails.synonyms.indexOf(enteredWord) !== index)){
        console.log("word is correct");
    }
    else {
        console.log("word is incorrect\n1 : try again\n2 : hint\n3 : quit");
        takeUserInput("Enter a option : ",function (option) {
            if(option === "1"){
                takeUserInput("Enter the word : ",function (enteredWord) {
                    checkUserInput(wordDetails,enteredWord,index);
                });

            }
            else if(option === "2"){
                let randomHint = getRandomHint(wordDetails);
                console.log(Object.keys(randomHint)[0]," : ",randomHint[Object.keys(randomHint)[0]]);
                takeUserInput("Enter the word : ",function (enteredWord) {
                    checkUserInput(wordDetails,enteredWord,index);
                });
            }
            else if(option === "3"){
                console.log("word : ",wordDetails.word);
                console.log(JSON.stringify(wordDetails,null,2));
            }
            else{
                console.log("option is invalid")
            }
        });
    }
}

function getJumbledWord(word) {
    let jumbledWord = [];
    let randomNumber = parseInt(Math.random() * word.length-1)+1;
    let temp = word[0];
    for(let i=0;i<word.length;i++){
        jumbledWord.push(word[i]);
    }
    jumbledWord[0] = jumbledWord[randomNumber];
    jumbledWord[randomNumber]= temp;
    return jumbledWord.join('');
}

function getRandomHint(wordDetails) {
    let randomHint = {};
    let randomNumber;
    if(wordDetails.synonyms && wordDetails.antonyms){
        randomNumber = parseInt(Math.random() * 4);
    }
    else if(wordDetails.synonyms){
        randomNumber = parseInt(Math.random() * 3);
    }
    else if(wordDetails.antonyms){
        randomNumber = parseInt(Math.random() * 3);
        if(randomNumber === 2){
            randomNumber = 3;
        }
    }
    else{
        randomNumber = parseInt(Math.random() * 2);
    }
    switch (randomNumber){
        case 1:
            randomHint["definition"] = getRandomElementFromArray(wordDetails.definitions).text;
            break;
        case 2:
            randomHint["synonym"] = getRandomElementFromArray(wordDetails.synonyms);
            break;
        case 3:
            randomHint["antonym"] = getRandomElementFromArray(wordDetails.antonyms);
            break;
        default:
            randomHint["jumbled_word"] = getJumbledWord(wordDetails.word);
    }
    return randomHint;
}

function getRandomElementFromArray(arrayElements) {
    let randomNumber = parseInt(Math.random() * arrayElements.length);
    return arrayElements[randomNumber];
}