var fs = require('fs');
var iCalParser = require('./iCalParser');
var Meeting = require('./Meeting');
var Planning = require('./Planning');
var PlanningList = require('./PlanningList');
var async = require('async');
var Converter = require("csvtojson").Converter;
var prettyjson = require('prettyjson');

var options = {
    noColor: false
};

var args = process.argv.slice(2); //put all the arguments given to the program from the third one
var ef = args[0];

switch (ef) {
    case '1' :
        files = args.slice(1);
        if (files.length < 2) {
            console.log('Veuillez renseigner des fichiers ics');
        }
        generateConflictsPlanning(files);
        break;
    case '2':
        getVolumeHoraireTotalIntervenant();
        break;
    case '3':
        file = args[1];
        if (file === 'undefined') {
            console.log('Veuillez renseigner un fichier CSV pour l\'export');
            process.exit(0);
        }
        convertCSVFile(file);
        break;
    default :
        console.log('Veuillez indiquez une fonctionnalité comme troisième argument (1 à 3)');
        break;
}


// EF1
function generateConflictsPlanning(afiles) {
    var files = eliminateDuplicates(afiles);
    async.map(files, readAsync, function (err, results) {
        if (err) {
            console.log(err);
        }
        console.log(files);
        var planningList = new PlanningList();

        for (var i = 0, len = results.length; i < len; i++) {
            console.log(files[i]);
            // Check if ics file
            try {
                var analyzer = new iCalParser(results[i]);
                if (!analyzer.checkExtension(files[i])) {
                    console.log("Erreur : Le fichier " + files[i] + " n'est pas un fichier ics !");
                    process.exit(1);
                }
                analyzer.parseToJSON();
                var events = analyzer.jsonData['events'];
                var planning = new Planning();

                for (var j = 0, len2 = events.length; j < len2; j++) {
                    var meeting = new Meeting();

                    meeting.date = events[j]['date'];
                    meeting.duration = events[j]['duration'];
                    meeting.organizer = events[j]['organizer'];
                    meeting.location = events[j]['location'];
                    meeting.contact = events[j]['contact'];
                    planning.addMeeting(meeting);


                }
                planningList.addPlanning(planning);
            } catch (e) {
                console.log(e.message);
            }
        }

        // Conflits éventuels
        var location = "Compiegne,1 square Philibert Delorme,60200";
        var prospectiveConflicts = planningList.prospectiveConflicts(location);
        console.log(prettyjson.render(prospectiveConflicts, options));

        var conflictsPlanning = planningList.conflictsPlanning(prospectiveConflicts);

        console.log(prettyjson.render(conflictsPlanning, options));

        console.log(conflictsPlanning.exportToCSV());
    });
}

function readAsync(file, callback) {
    fs.readFile(file, 'utf8', callback);
}

function eliminateDuplicates(arr) {
    var i,
            len = arr.length,
            out = [],
            obj = {};

    for (i = 0; i < len; i++) {
        obj[arr[i]] = 0;
    }
    for (i in obj) {
        out.push(i);
    }
    return out;
}

// EF2
function convertCSVFile(file) {
    var lt = file.substr(file.indexOf('_') + 1, file.length);
    var locationTmp = (lt.replace(/_/g, ' ')).replace(/-/g, ',');
    var location = locationTmp.replace(/.csv/g, '');
    console.log(location);
    //new converter instance
    var csvConverter = new Converter({delimiter: ";"});

    //end_parsed will be emitted once parsing finished
    csvConverter.on("end_parsed", function (jsonObj) {

        var jsonPlanning = jsonObj;

        var tabDate = Object.keys(jsonPlanning[0]);
        var week = {};
        for (var i = 0; i < tabDate.length; i++) {
            week[tabDate[i]] = {
                cellTmp: "",
                currentCell: "vide",
                duration: 0
            };
        }

        var planning = new Planning();
        var time = 0; // heure en minutes
        var duration = 0;
        for (var i = 0; i < jsonPlanning.length; i++) {
            time += 30; // ajout de 30 minutes à chaque ligne
            for (var key in jsonPlanning[i]) {
                week[key].currentCell = jsonPlanning[i][key];
                if (week[key].cellTmp === "") {
                    week[key].cellTmp = week[key].currentCell;
                }
                if (week[key].cellTmp === week[key].currentCell) {
                    duration += 30;
                } else {
                    if (week[key].cellTmp !== "vide") {
                        try {
                            var meeting = new Meeting();
                            var cell = week[key].cellTmp.split("-");
                            meeting.organizer = cell[0];
                            meeting.contact = cell[1];
                            meeting.date = key.replace(/-/g, '') + 'T' + getFormatTime(time);
                            meeting.duration = getFormatDuration(duration);
                            meeting.location = location;
                            planning.add(meeting);
                        } catch (e) {
                            console.log(e.message);
                        }

                        if (week[key].currentCell === "vide") {
                            duration = 0;
                        } else {
                            duration = 30;
                        }
                    }
                }
                week[key].cellTmp = week[key].currentCell;
            }
        }
        console.log(planning.exportToCSV());
    });
    //read from file
    fs.createReadStream(file).pipe(csvConverter);
}

// get Time as HHMMSS
function getFormatTime(mins) {
    var totalSec = mins * 60;
    var hours = parseInt(totalSec / 3600) % 24;
    var minutes = parseInt(totalSec / 60) % 60;
    var seconds = parseInt(totalSec % 60, 10);
    console.log(seconds);

    if (minutes === "0") {
        minutes = "00";
    }
    if (seconds === "0") {
        seconds = "00";
    }
    console.log((hours < 10 ? "0" + hours : hours) + (minutes < 10 ? "0" + minutes : minutes) + (seconds < 10 ? "0" + seconds : seconds));
    
    return (hours < 10 ? "0" + hours : hours) + (minutes < 10 ? "0" + minutes : minutes) + (seconds < 10 ? "0" + seconds : seconds);
}

// format as PT1H00M0S
function getFormatDuration(mins) {
    var totalSec = mins * 60;
    var hours = parseInt(totalSec / 3600) % 24;
    var minutes = parseInt(totalSec / 60) % 60;
    var seconds = totalSec % 60;

    return 'PT' + hours + 'H' + minutes + 'M' + seconds + 'S';
}