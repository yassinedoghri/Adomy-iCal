/**
 * Meeting class
 * Définit un objet contact en renseignant son prénom, nom, entreprise,
 * fonction, numéros de téléphone(fixe et portable) et son email.
 *
 * @class Meeting
 * @property {Date} date date du rendez-vous
 * @property {int} duration Nom du contact
 * @property {Array} manager Entreprise(s) dans laquelle travaille le contact
 * @property {Array} location Fonction(s) du contact
 * @property {Array} contact Numéro(s) de téléphone fixe (travail ou domicile) du contact
 */
function Meeting() {
    var date, duration, organizer, location, contact;
    Object.defineProperties(this, {
        "date": {
            get: function () {
                return date;
            },
            set: function (value) {
                var matched = value.match(/\d{4}[0-1][0-2][0-3][0-9]T[0-2][0-9][0-6][0-9][0-6][0-9]/);
                if (matched) {
                    var dtstart = matched[0].split('T');
                    var dt = getDateArray(dtstart[0]);
                    var tm = getTimeArray(dtstart[1]);

                    // Format date as yyyy-MM-ddTHH:mm:ss
                    dateFormat = dt[0] + '-' + dt[1] + '-' + dt[2] + 'T' + tm[0] + ':' + tm[1] + ':' + tm[2];
                    date = new Date(dateFormat);
                } else {
                    throw {name: "dateValue", type: "error", message: "Le format de la Date est incorrect pour '" + value + "'"};
                }
            }
        },
        "duration": {
            get: function () {
                return duration;
            },
            set: function (value) {
                var matched = value.match(/PT([0-1][0-9]|[2][0-3]|[0-9])H([0-5][0-9]|[0-9])M([0-5][0-9]|[0-9])S/);
                if (matched) {
                    duration = getDurationSeconds(matched[0]);
                } else {
                    throw {name: "durationValue", type: "error", message: "Le format de la Durée est incorrect pour '" + value + "'"};
                }
            }
        },
        "organizer": {
            get: function () {
                return organizer;
            },
            set: function (value) {
                var matched = value.match(/[a-zA-Z]+([a-zA-Z]|\s(?=[a-zA-Z]))*,[a-zA-Z]+([a-zA-Z]|\s(?=[a-zA-Z]))*,[a-zA-Z0-9]+([a-zA-Z0-9]|\s(?=[a-zA-Z0-9]))*,[0-9]{10}/);
                if (matched) {
                    organizer = matched[0];
                } else {
                    throw {name: "managerValue", type: "error", message: "Le format du Manager est incorrect pour '" + value + "'"};
                }
            }
        },
        "location": {
            get: function () {
                return location;
            },
            set: function (value) {
                var matched = value.match(/[a-zA-Z]+([a-zA-Z]|\s(?=[a-zA-Z])|('(?=[a-zA-Z])))*,[a-zA-Z0-9]+([a-zA-Z0-9]|\s(?=[a-zA-Z0-9])|('(?=[a-zA-Z])))*,[0-9]{5}/);
                if (matched) {
                    location = matched[0];
                } else {
                    throw {name: "locationValue", type: "error", message: "Le format de la Location est incorrect pour '" + value + "'"};
                }
            }
        },
        "contact": {
            get: function () {
                return contact;
            },
            set: function (value) {
                var matched = value.match(/[a-zA-Z]+([a-zA-Z]|\s(?=[a-zA-Z]))*\\,[0-9]{10}/);
                if (matched) {
                    contact = matched[0];
                } else {
                    throw {name: "contactValue", type: "error", message: "Le format du Contact est incorrect pour '" + value + "'"};
                }
            }
        }
    });
}

Meeting.prototype.isOverlapping = function (meeting) {
    var maxDate = this.maxDuration(meeting);
    var minDate = this.minDuration(meeting);
    // Vrai Si da1 = da2 ET l1 = l2 ET Max(h1, h2) <= Min(h1, h2) + Duree(Min(Rdv1, Rdv2))
    // duree en milliseconds
    if ((this.date.isSameDateAs(meeting.date)) && (this.location === meeting['location']) &&
            (maxDate <= minDate + this.durationOfMinDate(meeting))) {
        return true;
    }
    return false;
};

Meeting.prototype.durationOfMinDate = function (meeting) {
    if (this.date.getTime() < meeting.date.getTime()) {
        return this.duration * 1000;
    } else {
        return meeting.duration * 1000;
    }
};

Meeting.prototype.minDuration = function (meeting) {
    return Math.min(this.date.getTime(), meeting.date.getTime());
};

Meeting.prototype.maxDuration = function (meeting) {
    return Math.max(this.date.getTime(), meeting.date.getTime());
};

Meeting.prototype.getCSVCell = function () {
    return this.organizer + '-' + this.contact;
};

Meeting.prototype.getDateFormat = function () {
    console.log(this.date.yyyymmdd + 'T' + getFormatTime(this.duration));
    return this.date.yyyymmdd() + 'T' + getFormatTime(this.duration);
};

Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]); // padding
};

// get Time as HHMMSS
function getFormatTime(mins) {
    var totalSec = mins * 60;
    var hours = parseInt(totalSec / 3600) % 24;
    var minutes = parseInt(totalSec / 60) % 60;
    var seconds = parseInt(totalSec % 60, 10);
//    console.log(seconds);

    return (hours < 10 ? "0" + hours.toString() : hours.toString()) + (minutes < 10 ? "0" + minutes : minutes) + (seconds < 10 ? "0" + seconds : seconds);
}

// format as PT1H00M0S
Meeting.prototype.getFormatDuration = function () {
    var totalSec = this.duration * 60;
    var hours = parseInt(totalSec / 3600) % 24;
    var minutes = parseInt(totalSec / 60) % 60;
    var seconds = totalSec % 60;

    return 'PT' + hours + 'H' + minutes + 'M' + seconds + 'S';
};

function getDateArray(dateString) {
    var yyyy = dateString.substring(0, 4);
    var MM = dateString.substring(4, 6);
    var dd = dateString.substring(6, 8);

    return [yyyy, MM, dd];
}

function getTimeArray(timeString) {
    var HH = timeString.substring(0, 2);
    var mm = timeString.substring(2, 4);
    var ss = timeString.substring(4, 6);

    return [HH, mm, ss];
}

function getDurationSeconds(duration) {
    // retrieve each time element with 'PT01H30M00S' format
    var H = duration.substring(duration.lastIndexOf("T") + 1, duration.lastIndexOf("H"));
    var m = duration.substring(duration.lastIndexOf("H") + 1, duration.lastIndexOf("M"));
    var s = duration.substring(duration.lastIndexOf("M") + 1, duration.lastIndexOf("S"));

    return H * 3600 + m * 60 + s * 1; // return duration in seconds
}

Date.prototype.isSameDateAs = function (pDate) {
    return (
            this.getFullYear() === pDate.getFullYear() &&
            this.getMonth() === pDate.getMonth() &&
            this.getDate() === pDate.getDate()
            );
};

module.exports = Meeting;
