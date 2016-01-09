function iCalParser(rawData) {
    this.rawData = rawData;
    this.fieldAssociations = {
        "VERSION": "version",
        "PRODID": "prodid",
        "DTSTART": "date",
        "DURATION": "duration",
        "ORGANIZER": "organizer",
        "LOCATION": "location",
        "CONTACT": "contact"
    };
    this.jsonData = {
        events: []
    };
}

iCalParser.prototype.parseToJSON = function () {
    var regex = /\r\nBEGIN:VEVENT\r\n/;
    var dataArr = this.rawData.split(regex);
    var dataArr = dataArr.filter(function (val, idx) {
        return !val.match(/^\r\n$/);
    });

    for (var i = 0; i < dataArr.length; i++) {
        var reg = /(BEGIN:VCALENDAR\r\n)|(\r\nEND:VEVENT\r\nEND:VCALENDAR)|(\r\nEND:VEVENT)/;
        dataArr[i] = dataArr[i].replace(reg, "");
    }

    for (var i = 0; i < dataArr.length; i++) {
        var json = {};
        data = this.tokenize(dataArr[i], /(\r\n)/);
        for (var j = 0; j < data.length; j++) {
            var d = data[j].split(":");
            json[this.fieldAssociations[d[0]]] = d[1];
        }

        if (json['version']) {
            this.jsonData['version'] = json['version'];
            this.jsonData['prodid'] = json['prodid'];
        } else {
            this.jsonData['events'].push(json);
        }
    }
};

iCalParser.prototype.tokenize = function (data, separator) {
    data = data.split(separator);
    data = data.filter(function (val, idx) {
        return !val.match(separator);
    });
    return data;
};

iCalParser.prototype.checkExtension = function (fileName) {
    var resRegex = [];
    var separator = /.{4}$/;

    resRegex = separator.exec(fileName);

    if (resRegex[0] === '.ics') {
        return true;
    } else {
        return false;
    }
};

String.prototype.startsWith = function (prefix) {
    return this.slice(0, prefix.length) === prefix;
};

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};



module.exports = iCalParser;