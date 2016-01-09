var fs = require('fs');

var getday = function (input) {
    var day = input.split('T');
    return (day[0][0] + day[0][1] + day[0][2] + day[0][3] + '/' + day[0][4] + day[0][5] + '/' + day[0][6] + day[0][7]);
}

var getBeginningHour = function (input) {
    var beginningHour = input.split('T');
    return (beginningHour[1][0] + beginningHour[1][1] + ':' + beginningHour[1][2] + beginningHour[1][3] + ':' + beginningHour[1][4] + beginningHour[1][5]);
}

var getAgentJob = function (input) {
    var agentJob = input.split(',');
    return agentJob[1];
}

var getAgentName = function (input) {
    var agentName = input.split(',');
    return agentName[0];
}

var getEnterprise = function (input) {
    var enterprise = input.split(',');
    return enterprise[2];
}

var getAgentPhone = function (input) {
    var agentPhone = input.split(',');
    return agentPhone[3];
}

var contentConflictsFile = function ()
{
    var content = new String();
    var day, beginningHour, endingHour, agentJob, agentLastName, agentFirstName, enterprise, agentPhone;

    for (var i = 0; i < listOfConflict.length; i++)
    {
        for (var j = 0; j < listOfConflict[i].length; j++)
        {
            day = getday(listOfConflict[i][j].date);
            beginningHour = getBeginningHour(listOfConflict[i][j].date);//xx:xx:xx
            endingHour = listOfConflict[i][j].endIntervention;
            agentJob = getAgentJob(listOfConflict[i][j].manager);
            agentName = getAgentName(listOfConflict[i][j].manager);
            enterprise = getEnterprise(listOfConflict[i][j].manager);
            agentPhone = getAgentPhone(listOfConflict[i][j].manager);

            if (content.length > 1) {
                content = content + day + '-' + beginningHour + '-' + endingHour + '-' + agentJob + '-' + agentName + '-' + enterprise + '-' + agentPhone;
            } else {
                content = day + '-' + beginningHour + '-' + endingHour + '-' + agentJob + '-' + agentName + '-' + enterprise + '-' + agentPhone;
            }

            if (j != listOfConflict[i].length - 1) {
                content = content + ';';
            }
        }
        content = content + "\n";
    }

    return content;
};

var createConflictsFile = function (location)
{
    var concatLocation = location.split(',').join('_');
    var content = contentConflictsFile();

    fs.writeFile('./conflits/conflict-' + concatLocation + '.csv', content, function (err) {
        if (err) {
            return console.log(err);
        }
    });
};

var findConflict = function (beginDate1, beginDate2, endDate1, endDate2)
{
    if ((beginDate2 >= beginDate1 && beginDate2 <= endDate1) || (endDate2 >= beginDate1 && endDate2 <= endDate1) || (beginDate1 >= beginDate2 && beginDate1 <= endDate2) || (endDate1 >= beginDate2 && endDate1 <= endDate2)) {
        return true;
    }
    return false;
}

//find the end of an intervention with the beggining et the end of it
var finalHour = function (beginDate, duration)
{
    var temp = [];
    var j = 0;

    for (var i = 0; i < (beginDate.length) / 2; i++)
    {
        temp[i] = beginDate[j] + beginDate[j + 1];
        j += 2;
    }

    var v = new Array(parseInt(temp[0]) + parseInt(duration[0]), parseInt(temp[1]) + parseInt(duration[1]), parseInt(temp[2]) + parseInt(duration[2]))

    return((v[0] + Math.floor(v[1] / 60)) % 24 + ':' + (v[1] + Math.floor(v[2] / 60)) % 60 + ':' + v[2] % 60);
}

//match if the intervention's date is the same as the intervention's date given
var matchDate = function (re, input)
{
    var date1 = re.date.split("T");
    var date2 = input.date.split("T");

    if (date1[0] == date2[0]) //if the interventions are the same day
    {
        var beginDate1 = date1[1];
        var beginDate2 = date2[1];
        var endDate1 = [];
        var endDate2 = [];

        var duration1 = re.duration.split(/\D/);
        duration1 = duration1.filter(function (val, idx) {
            return val.match(/[0-9]/);
        });

        var duration2 = input.duration.split(/\D/);
        duration2 = duration2.filter(function (val, idx) {
            return val.match(/[0-9]/);
        });

        endDate1 = finalHour(beginDate1, duration1);
        endDate2 = finalHour(beginDate2, duration2);

        var onConflict = findConflict(beginDate1, beginDate2, endDate1, endDate2);

        if (onConflict)
        {
            input.endIntervention = endDate2;

            if (conflict.length == 0)
            {
                re.endIntervention = endDate1;

                conflict.push(re);
                conflict.push(input);
            } else {
                conflict.push(input);
            }
        }
    }
};


var compareIntervention = function (k, parsedPOI, re, location)//re = reference event
{
    for (var i = k; i < parsedPOI.length; i++)
    {
        for (var j = 0; j < parsedPOI[i].length; j++)
        {
            if (parsedPOI[i][j].location == location) {
                matchDate(re, parsedPOI[i][j]);
            }
        }
    }
};

//find interventions at the location given
var matchLocation = function (parsedPOI, location)
{
    listOfConflict = [];

    for (var i = 0; i < parsedPOI.length; i++)
    {
        for (j = 0; j < parsedPOI[i].length; j++)
        {
            if (parsedPOI[i][j].location == location)
            {
                var k = i + 1; // to browse events of another intervenant
                conflict = [];
                compareIntervention(k, parsedPOI, parsedPOI[i][j], location);

                if (conflict.length > 0) {
                    listOfConflict.push(conflict);
                }
            }
        }
    }

    if (listOfConflict.length > 0) {
        createConflictsFile(location);
    } else {
        console.log("msg-- no conflict found.");
    }
};


exports.matchLocation = matchLocation;