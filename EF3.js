var isTheSameWeek = function (mondayDate, inputDate)
{
    var i = mondayDate.split('/');
    var tmp = i[2] + i[1] + i[0];

    var splittedInputDate = inputDate.split('T');

    if (((parseInt(splittedInputDate[0]) - parseInt(tmp)) > 6) || ((parseInt(splittedInputDate[0]) - parseInt(tmp)) < 0)) {
        return false;
    } else {
        return true;
    }
}

var isOnTheList = function (input, list)
{
    var found = false;

    for (var i = 0; i < list.length; i++)
    {
        var splittedInputName = input.manager.split(',');
        var splittedListName = list[i][0].manager.split(',');

        if (splittedInputName[0] == splittedListName[0])
        {
            list[i].push(input);
            found = true;
        }
    }

    if (found == false)
    {
        var listOfEvent = [];
        listOfEvent.push(input);
        list.push(listOfEvent);
    }

    return list;
}

var countHandInt = function (list) //count hours per week and number of intervention
{
    for (var i = 0; i < list.length; i++)
    {
        var name = list[i][0].manager.split(',');
        var sum;
        var res = [];

        for (j = 0; j < list[i].length; j++)
        {

            var bg = list[i][j].date.split("T");
            var duration = list[i][j].duration.split(/\D/);

            duration = duration.filter(function (val, idx) {
                return val.match(/[0-9]/);
            });

            if (res.length == 0)
            {
                for (var k = 0; k < 3; k++) {
                    res[k] = parseInt(duration[k]);
                }
            } else {
                for (var k = 0; k < 3; k++) {
                    res[k] = parseInt(res[k]) + parseInt(duration[k]);
                }
            }
        }

        sum = (res[0] + Math.floor(res[1] / 60)) % 24 + ' heure(s) ' + (res[1] + Math.floor(res[2] / 60)) % 60 + ' minute(s) et ' + res[2] % 60 + ' seconde(s)';
        console.log(name[0] + " a réalisé " + list[i].length + " interventions pour un total de " + sum)
    }

}

var eventSort = function (parsedPOI, mondayDate)
{
    var listOfManagersEvents = [];

    for (var i = 0; i < parsedPOI.length; i++)
    {
        for (j = 0; j < parsedPOI[i].length; j++)
        {
            if (isTheSameWeek(mondayDate, parsedPOI[i][j].date))
            {
                listOfManagersEvents = isOnTheList(parsedPOI[i][j], listOfManagersEvents);
            }
        }
    }

    countHandInt(listOfManagersEvents);
}

exports.eventSort = eventSort;