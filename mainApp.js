var fs = require('fs');
var icalendarParserFile = require('./icalendarParser.js');
var EF1file = require('./EF1.js');
var EF3file = require('./EF3.js');
var CsvParserFile = require('./CsvParser.js');
var EF2File = require('./EF2.js');

matchLocation = EF1file.matchLocation;

var myArgs = process.argv.slice(2); //put all the arguments given to the program from the third one
var toDo = myArgs[0];

myArgs.shift(); //remove the first argument which is the number of the function to execute

var readFile = function(myArgs)
{
    var contents; 
    var arrayOfData = [];

    for(var i = 0; i <  myArgs.length; i++)
    {
        try{
            contents = fs.readFileSync(myArgs[i], 'utf8'); //use synchrone call to prevent code execution with errors of loading files
        }
        catch(e){
            console.log(e);
            process.exit(1);        }

        arrayOfData.push(contents);
    }

    return arrayOfData;
}

var parseIcalFiles = function(myArgs)
{
    var data = readFile(myArgs); //data is an array composed of files' information
    var parsedPOI = []; //contains parsed icalendar. First dimension is files, second dimension events.

    for(var i=0; i<data.length; i++)
    {
        var analyzer = new icalendarParserFile.icalendarParser;

        if(!analyzer.checkExtension(myArgs[i])){
            console.log("Error : file " + myArgs[i] + " is not an ics file.");
            process.exit(1);
        }

        analyzer.parse(data[i]);
        parsedPOI.push(analyzer.parsedPOI);  
        console.log("File " + myArgs[i] + " has been parsed with success."); 
    }
    console.log('\n\r');

    return(parsedPOI);
}

var manageInterventions = function()
{
    if(myArgs.length < 3)
    {
        console.log("Error : Number of arguments smaller than 3.");
        process.exit(1);
    }

    var location = myArgs[0];
    myArgs.shift();

    var parsedPOI = parseIcalFiles(myArgs);
    matchLocation(parsedPOI, location);
}

var personnalInformations = function()
{
    if(myArgs.length < 2)
    {
        console.log("Error : No files given.");
        process.exit(1);
    }

    var mondayDate = myArgs[0]; //dd/mm/yyyy
    myArgs.shift();

    var regex = /(^(((0[1-9]|1[0-9]|2[0-8])[\/](0[1-9]|1[012]))|((29|30|31)[\/](0[13578]|1[02]))|((29|30)[\/](0[4,6,9]|11)))[\/](19|[2-9][0-9])\d\d$)|(^29[\/]02[\/](19|[2-9][0-9])(00|04|08|12|16|20|24|28|32|36|40|44|48|52|56|60|64|68|72|76|80|84|88|92|96)$)/;
    
    if(!regex.exec(mondayDate))
    {
        console.log("Error : date must be on dd/mm/yyyy format.");
        process.exit(1);
    }

    for(var i=0; i < myArgs.length; i++)
    {
        for(var j=i+1; j < myArgs.length; j++)
        {
            if(myArgs[i] == myArgs[j])
            {
                console.log("Error : You cannot give more than once the same file");
                process.exit(1);
            }
        }
    }

    var parsedPOI = parseIcalFiles(myArgs);
    eventSort = EF3file.eventSort;
    eventSort(parsedPOI, mondayDate);
}

var launchFunction = function(inputValue)
{   
    switch(inputValue) 
    {
        case '1':
            console.log("1 : Gérer les interventions.\n\r");
            manageInterventions();
            console.log('\n\rEnd of execution.');
            break;
        case '2':
            console.log("2 : Convertir au format iCalendar.\n\r");
            if(myArgs.length > 0) 
                EF2File.launchCSVToICalendar();
            else {
                console.log("Error : No files given.");
                process.exit(1);
            }
            break;
        case '3':
            console.log("3 : Consulter les informations sur les intervenants.\n\r");
            personnalInformations();
            console.log('\n\rEnd of execution.');
            break;
        default:
            return("Wrong charactere inputted.");
            console.log('\n\rEnd of execution.');
            break;
    }   
}

launchFunction(toDo);