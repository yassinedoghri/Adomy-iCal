var fs = require('fs');
var myArgs = process.argv.slice(2); //put all the arguments given to the program from the thrid one
var fileToParse = myArgs[1];
var fileToWrite = (fileToParse.substring(0, fileToParse.length - 3) + "ics");
var nbCellules = 0; //Va compter le nombre de cellules parsées
var heureActuellementRegardee = 0;
var compteCellules = 0;

var launchCSVToICalendar = function () {
    //Ouverture et lecture d'un fichier
    try {
        var data = fs.readFileSync(myArgs[1], 'utf8'); //use synchrone call to prevent code execution with errors of loading files
        analyzer = new CSVToICalendar;
        analyzer.transform(data);
        console.log(fileToParse + " has been created as " + fileToParse.substring(0, fileToParse.length - 3) + "ics");
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
    //console.log(analyzer.parsedPOI);
}


// POI : RDV au format Pivot
var POI = function (date, duration, manager, location)
{
    this.date = date;
    this.duration = duration;
    this.manager = manager;
    this.location = location;
}


// CSVToICalendar
var CSVToICalendar = function () {
    // The list of POI parsed from the input file.
    this.parsedPOI = []
    this.symb = ["lundi;mardi;mercredi;jeudi;vendredi;samedi;dimanche"];
}

// Transformation procedure

// tokenize : tranform the data input into a list
// <eol> = CRLF
CSVToICalendar.prototype.tokenize = function (data) {
    //return data.split(/(\r\n|: )/);
    var separator = /(\r\n)/;
    data = data.split(separator);
    data = data.filter(function (val, idx) {
        return !val.match(separator);
    });
    return data;
}

CSVToICalendar.prototype.transform = function (data) {
    fs.appendFile(fileToWrite, "BEGIN:VCALENDAR\r\n" +
            "VERSION:2.0\r\n" +
            "PRODID:-//hacksw/handcal//NONSGML v1.0//EN\r\n", function (err) {
                if (err) {
                    return console.log(err);
                }
            });


    var tData = this.tokenize(data);
    //console.log(tData);
    this.header(tData);

    fs.appendFile(fileToWrite, "END:VCALENDAR", function (err) {
        if (err) {
            return console.log(err);
        }
    });
}

CSVToICalendar.prototype.err = function (msg, input) {
    console.log("Transformation Error ! -- msg : " + msg);
    process.exit(0);
}

// Read and return a symbol from input
CSVToICalendar.prototype.next = function (input) {
    var curS = input.shift();
    //console.log(curS);
    return curS
}

// accept : verify if the arg s is part of the language symbols.
CSVToICalendar.prototype.accept = function (s) {
    var idx = this.symb.indexOf(s);
    // index 0 exists
    if (idx === -1) {
        this.err("symbol " + s + " unknown", [" "]);
        return false;
    }

    return idx;
}



// check : check whether the arg elt is on the head of the list
CSVToICalendar.prototype.check = function (s, input) {
    if (this.accept(input[0]) == this.accept(s)) {
        return true;
    }
    return false;
}

// expect : expect the next symbol to be s.
CSVToICalendar.prototype.expect = function (s, input) {
    if (s == this.next(input)) {
        //console.log("Reckognized! "+s)
        return true;
    } else {
        this.err("symbol " + s + " doesn't match", input);
    }
    return false;
}


// Parser rules

// <header> = "lundi;mardi;mercredi;jeudi;vendredi;samedi;dimanche" <eol> <listPoi>
CSVToICalendar.prototype.header = function (input) {

    if (this.check("lundi;mardi;mercredi;jeudi;vendredi;samedi;dimanche", input)) {
        this.expect("lundi;mardi;mercredi;jeudi;vendredi;samedi;dimanche", input);
        this.listPoi(input);
        return true;
    } else {
        return false;
    }

}

// <listPoi> = *(RDV";"RDV";"RDV";"RDV";"RDV";"RDV";"RDV";"<eol>)
CSVToICalendar.prototype.listPoi = function (input) {
    var separator = /(;)/;

    //Reconcaténer la chaîne de caractère afin de la split
    var inputAsString = "";
    for (var i = 0; i < input.length; i++) {
        inputAsString += input[i];
    }

    //Split selon separator <;>
    var listRdv = inputAsString.split(separator);
    listRdv = listRdv.filter(function (val, idx) {
        return !val.match(separator);
    });

    //Si le nombre de rendez-vous n'est pas égal à 7x, renvoyer une erreur
    if (listRdv.length % 7 != 0)
        this.err("We don't have 7 events per week", new Object());

    //console.log(listRdv);

    this.rdv(listRdv);

    return;
}

// <rdv> = "vide"
// ou <rdv> = FONCTIONINTERVENANT.'-'.NOMINTERVENANT.'-'.PRENOMINTERVENANT.'-'.TELINTERVENANT.'-'.SOCIETEINTERVENANT.'-'.NOMPATIENT.'-'.PRENOMPATIENT.'-'.TELPATIENT.'-'.VILLEPATIENT.'-'.NUMRUEPATIENT RUEPATIENT.'-'.CODEPOSTALPATIENT
CSVToICalendar.prototype.rdv = function (input)
{
    //console.log(compteCellules);
    if (compteCellules == 7)
        compteCellules = 0;
    if ((compteCellules == 0) && (heureActuellementRegardee % 100 == 0)) {
        heureActuellementRegardee += 30;
    } else if ((compteCellules == 0) && (heureActuellementRegardee % 100 == 30)) {
        heureActuellementRegardee += 70;
    }

    //Si le rdv = "vide"
    if (input[0] == "vide") {
        //console.log(input[0]);
        nbCellules++;
        compteCellules++;

        this.next(input);
        this.rdv(input);
        return true;

        //Sinon c'est soit un rdv correct, soit un rdv avec une/des erreur(s)
    } else {
        //Si input n'est pas vide, on vérifie le prochain rdv
        if (input.length > 0) {
            var rdv = input[0];

            var separator = /(-)/;
            rdvInfos = rdv.split(separator);
            rdvInfos = rdvInfos.filter(function (val, idx) {
                return !val.match(separator);
            });


            this.isTextApostrophe(rdvInfos[0]);
            this.isTextApostrophe(rdvInfos[1]);
            this.isText(rdvInfos[2]);
            this.isTel(rdvInfos[3]);
            this.isSociety(rdvInfos[4]);
            this.isTextApostrophe(rdvInfos[5]);
            this.isText(rdvInfos[6]);
            this.isTel(rdvInfos[7]);
            this.isTextApostrophe(rdvInfos[8]);
            this.isStreet(rdvInfos[9]);
            this.isPostalCode(rdvInfos[10]);

            /* Création de l'objet rdv et ajout dans le tableau parsedPOI */
            var dateDuPlanning = "";
            var jourDuPlanning = 0;
            var moisDuPlanning = 0;
            var anneeDuPlanning = 0;
            var heureDuPlanning = "";

            if (myArgs[0].substring(0, 8).toLowerCase() == "domicile") {
                switch (myArgs[0].substring(12, 14)) {
                    case "01":
                    case "03":
                    case "05":
                    case "07":
                    case "08":
                    case "10":
                    case "12":
                        if (parseInt(myArgs[0].substring(9, 11)) + (nbCellules % 7) > 31) {
                            jourDuPlanning = (parseInt(myArgs[0].substring(9, 11)) + (nbCellules % 7)) % 31;
                            moisDuPlanning = parseInt(myArgs[0].substring(12, 14)) + 1;
                            if (moisDuPlanning > 12) {
                                moisDuPlanning = moisDuPlanning - 12;
                                anneeDuPlanning = parseInt(myArgs[0].substring(15, 19)) + 1;
                            } else {
                                anneeDuPlanning = parseInt(myArgs[0].substring(15, 19));
                            }
                        } else {
                            jourDuPlanning = parseInt(myArgs[0].substring(9, 11)) + (nbCellules % 7);
                            moisDuPlanning = parseInt(myArgs[0].substring(12, 14));
                            anneeDuPlanning = parseInt(myArgs[0].substring(15, 19));
                        }
                        break;

                    case "02":
                    case "04":
                    case "06":
                    case "09":
                    case "11":
                        if (parseInt(myArgs[0].substring(9, 11)) + (nbCellules % 7) > 31) {
                            jourDuPlanning = (parseInt(myArgs[0].substring(9, 11)) + (nbCellules % 7)) % 31;
                            moisDuPlanning = parseInt(myArgs[0].substring(12, 14)) + 1;
                            anneeDuPlanning = parseInt(myArgs[0].substring(15, 19));
                        } else {
                            jourDuPlanning = parseInt(myArgs[0].substring(9, 11)) + (nbCellules % 7);
                            moisDuPlanning = parseInt(myArgs[0].substring(12, 14));
                            anneeDuPlanning = parseInt(myArgs[0].substring(15, 19));
                        }
                        break;
                }
            }

            if (myArgs[0].substring(0, 11).toLowerCase() == "intervenant") {
                switch (myArgs[0].substring(12, 14)) {
                    case "01":
                    case "03":
                    case "05":
                    case "07":
                    case "08":
                    case "10":
                    case "12":
                        if (parseInt(myArgs[0].substring(12, 14)) + (nbCellules % 7) > 31) {
                            jourDuPlanning = (parseInt(myArgs[0].substring(12, 14)) + (nbCellules % 7)) % 31;
                            moisDuPlanning = parseInt(myArgs[0].substring(15, 17)) + 1;
                            if (moisDuPlanning > 12) {
                                moisDuPlanning = moisDuPlanning - 12;
                                anneeDuPlanning = parseInt(myArgs[0].substring(18, 22)) + 1;
                            } else {
                                anneeDuPlanning = parseInt(myArgs[0].substring(18, 22))
                            }
                        } else {
                            jourDuPlanning = parseInt(myArgs[0].substring(12, 14)) + (nbCellules % 7);
                            moisDuPlanning = parseInt(myArgs[0].substring(15, 17));
                            anneeDuPlanning = parseInt(myArgs[0].substring(18, 22));
                        }
                        break;

                    case "02":
                    case "04":
                    case "06":
                    case "09":
                    case "11":
                        if (parseInt(myArgs[0].substring(12, 14)) + (nbCellules % 7) > 31) {
                            jourDuPlanning = (parseInt(myArgs[0].substring(12, 14)) + (nbCellules % 7)) % 31;
                            moisDuPlanning = parseInt(myArgs[0].substring(15, 17)) + 1;
                            anneeDuPlanning = parseInt(myArgs[0].substring(18, 22));
                        } else {
                            jourDuPlanning = parseInt(myArgs[0].substring(12, 14)) + (nbCellules % 7);
                            moisDuPlanning = parseInt(myArgs[0].substring(15, 17));
                            anneeDuPlanning = parseInt(myArgs[0].substring(18, 22));
                        }
                        break;
                }
            }

            if (heureActuellementRegardee < 1000)
                dateDuPlanning = anneeDuPlanning.toString() + moisDuPlanning.toString() + jourDuPlanning.toString() + "T0" + heureActuellementRegardee.toString() + "00";
            else
                dateDuPlanning = anneeDuPlanning.toString() + moisDuPlanning.toString() + jourDuPlanning.toString() + "T" + heureActuellementRegardee.toString() + "00";

            var p = new POI(dateDuPlanning, "PT0H30M0S", rdvInfos[4], (rdvInfos[8] + "," + rdvInfos[9] + "," + rdvInfos[10]));

            this.parsedPOI.push(p);
            /* Fin création de l'objet rdv */

            nbCellules++;
            compteCellules++;

            fs.appendFile(fileToWrite, "BEGIN:VEVENT\r\n" +
                    "DTSTART:" + p.date + "\r\n" +
                    "DURATION:" + p.duration + "\r\n" +
                    "ORGANIZER:" + p.manager + "\r\n" +
                    "LOCATION:" + p.location + "\r\n" +
                    "CONTACT:" + rdvInfos[6] + " " + rdvInfos[5] + "\\," + rdvInfos[7] + "\r\n" +
                    "END:VEVENT\r\n", function (err) {
                        if (err) {
                            return console.log(err);
                        }
                    });

            this.next(input);
            this.rdv(input);
            return true;

            //Sinon on vérifie une ligne vide
        } else {
            //console.log(input);

            nbCellules++;
            compteCellules++
            return true;
        }
    }
}

// <textApostrophe> = 1*(VCHAR WSP VCHAR/VCHAR/VCHAR.'''.VCHAR)
CSVToICalendar.prototype.isTextApostrophe = function (input) {
    if (matched = input.match(/((?:[A-Z])+(?:\s[A-Z])*|(?:\'[A-Z])*|(?:[A-Z])*)*/i)) {
        //console.log(matched[0]);

        if (matched[0].length == input.length)
            return matched[0];
        else
            this.err("Invalid input next to " + matched[0], input);
    } else {
        this.err("Invalid input" + input, input);
    }
}

// <text> = 1*(VCHAR WSP VCHAR/VCHAR)
CSVToICalendar.prototype.isText = function (input) {
    if (matched = input.match(/((?:[A-Z])+(?:\s[A-Z])*|(?:[A-Z])*)*/i)) {
        //console.log(matched[0]);

        if (matched[0].length == input.length)
            return matched[0];
        else
            this.err("Invalid input next to " + matched[0], input);
    } else {
        this.err("Invalid input" + input, input);
    }
}

// <tel> = 10DIGIT
CSVToICalendar.prototype.isTel = function (input) {
    if (matched = input.match(/(0[0-9]{9})/)) {
        //console.log(matched[0]);

        if (matched[0].length == input.length)
            return matched[0];
        else
            this.err("Invalid input next to " + matched[0], input);
    } else {
        this.err("Invalid input" + input, input);
    }
}

// <society> = 1*(VCHAR WSP VCHAR/VCHAR/VCHAR.'''.VCHAR/DIGIT/DIGIT WSP VCHAR/VCHAR WSP DIGIT)
CSVToICalendar.prototype.isSociety = function (input) {
    if (matched = input.match(/((?:[A-Z]|[0-9])+(?:\s[A-Z])*|(?:\'[A-Z])*|(?:\s[0-9])*|(?:[A-Z]|[0-9])*)*/i)) {
        //console.log(matched[0]);

        if (matched[0].length == input.length)
            return matched[0];
        else
            this.err("Invalid input next to " + matched[0], input);
    } else {
        this.err("Invalid input" + input, input);
    }
}

// <street> = 1*DIGIT WSP 1*(VCHAR/VCHAR WSP VCHAR/VCHAR.'''.VCHAR)
CSVToICalendar.prototype.isStreet = function (input) {
    if (matched = input.match(/((?:[0-9])+(?:(?:\s[A-Z])+(?:\s[A-Z])*|(?:\'[A-Z])*|(?:[A-Z])*)*)/i)) {
        //console.log(matched[0]);

        if (matched[0].length === input.length)
            return matched[0];
        else
            this.err("Invalid input next to " + matched[0], input);
    } else {
        this.err("Invalid input" + input, input);
    }
};

// <postalCode> = 5DIGIT
CSVToICalendar.prototype.isPostalCode = function (input) {
    if (matched = input.match(/([0-9]{5})/i)) {
        //console.log(matched[0]);

        if (matched[0].length === input.length)
            return matched[0];
        else
            this.err("Invalid input next to " + matched[0], input);
    } else {
        this.err("Invalid input" + input, input);
    }
};

exports.launchCSVToICalendar = launchCSVToICalendar;