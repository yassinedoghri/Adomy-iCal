var Meeting = require("./Meeting.js");
var fs = require('fs');
var _ = require('lodash');
var json2csv = require('json2csv');

/**
 * Planning class
 * Définit un objet planning contenant une liste d'objets Meetings (rendez-vous)
 *
 * @class Planning
 * @property {Array} meetings liste d'objets Meeting (rendez-vous)
 */
function Planning() {
    this.meetings = [];
    this.week = {};
}

Planning.prototype.size = function () {
    return this.meetings.length;
};

Planning.prototype.addMeeting = function (meeting) {
    if (meeting instanceof Meeting) {
        if (_.size(this.week) < 1) {
            var monday = _.clone(meeting.date);
            this.generateWeekDays(monday.getMonday());
        } else {
            var formattedDate = formatDate(meeting['date']);
            if (!formattedDate in this.week) {
                // rendez-vous ne fait pas partie de cette semaine
                throw  {name: "wrongDateMeeting", type: "error", message: "Un planning est un document d'une semaine, veuillez vérifier les dates"};
            }
        }
        this.meetings.push(meeting);
    } else {
        throw {name: "addMeeting", type: "error", message: "L'élément que vous voulez ajouter n'est pas un Objet Rendez-vous"};
    }
};

Planning.prototype.volume = function () {
    var volumeHoraire = 0;
    for (var i = 0; i < Planning.length(); i++) {
        volumeHoraire += this.meetings[i]['duration'];
    }
    return volume;
};

Planning.prototype.generateWeekDays = function (monday) {
    for (var i = 0; i < 6; i++) {
        var key = formatDate(monday.addDays(i));
        this.week[key] = "vide";
    }
};

Planning.prototype.csvStructure = function () {
    var time = 0;
    var fileLines = (24 * 60) / 30;
    var cells = [];
    for (var i = 0; i < fileLines; i++) {
        var weekDays = _.clone(this.week);
        time += 30;
        cells.push(weekDays);
        var meeting = this.getMeetingByDuration(time);
        if (meeting !== "vide") {
            var key = formatDate(meeting.date);
            cells[i][key] = meeting.getCSVCell();
        }
    }
    return cells;
};

Planning.prototype.exportToCSV = function () {
    fields = Object.keys(this.week).map(function (key) {
        return key;
    });
    // Creating export directory if it doesn't exist
    var dir = './exports';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    var loc;
    if (this.meetings.length > 0) {
        var loc = this.meetings[0].location;
    }
    file = dir + '/conflict_' + loc.replace(/\s+|,/g, '-').toLowerCase() + '.csv';
    json2csv({data: this.csvStructure(), fields: fields}, function (err, csv) {
        if (err) {
            throw err;
        }
        fs.writeFile(file, csv, function (err) {
            if (err) {
                throw err;
            } else {
                console.log("L'export du planning de conflits en CSV a réussi ! " + file + " a été Sauvegardé !");
            }
        });
    });
};


Planning.prototype.getMeetingByDuration = function (time) {
    // inacurrate
    for (var i = 0; i < this.size(); i++) {
        if (getDurationSeconds(this.meetings[i].date) === time * 60) {
            return this.meetings[i];
        }
    }
    return "vide";
};

function formatDate(date) {
    var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

Date.prototype.getMonday = function () {
    var day = this.getDay(),
            diff = this.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(this.setDate(diff));
};

Date.prototype.addDays = function (days)
{
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
};

function getDurationSeconds(date) {
    // retrieve each time element with 'PT01H30M00S' format
    var H = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();

    return H * 3600 + m * 60 + s * 1; // return duration in seconds
}

module.exports = Planning;