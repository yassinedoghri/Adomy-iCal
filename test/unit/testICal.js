//QUnit.module("Program Semantic test");
QUnit.module("Analyser la syntaxe d’un fichier iCalendar");
    var analyzer = new icalendarParser();
    var fs = require('fs');

QUnit.test("Parse iCalendar File", function (assert) {
    var data = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//hacksw/handcal//NONSGML v1.0//EN\r\nBEGIN:VEVENT\r\nDTSTART:20151217T110000\r\nDURATION:PT2H0M0S\r\nORGANIZER:Maxime DELARUE,Alimentaire,Carrefour,0322368514\r\nLOCATION:Troyes,4 rue Brunneval,10000\r\nCONTACT:Max CORINCHE\,0322368514\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART:20151210T160000\r\nDURATION:PT2H0M0S\r\nORGANIZER:Maxime DELARUE,Alimentaire,Carrefour,0322368514\r\nLOCATION:Compiegne,1 square Philibert Delorme,60200\r\nCONTACT:Remi BERAUX\,0322368514\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART:20151210T120000\r\nDURATION:PT1H0M0S\r\nORGANIZER:Maxime DELARUE,Alimentaire,Carrefour,0322368514\r\nLOCATION:Troyes,4 rue Brunneval,10000\r\nCONTACT:Max CORINCHE\,0322368514\r\nEND:VEVENT\r\nEND:VCALENDAR";
//    console.log(data);
//    var parsedData = analyzer.parse(data);
    
//    var parsedData;
//    fs.readFile('./test/test.ics', 'utf8', function (err, data) {
//        if (err) {
//            return console.log(err);
//        }
//        
//        
//    });
    assert.ok(analyzer.parse(data), "iCalendar Data Parsed");
//    return false;
//    console.log(d);
    
    
});


QUnit.test("Create Meeting Object", function (assert) {
    var meeting = new POI("20151217T110000", "PT2H0M0S", "Maxime DELARUE,Alimentaire,Carrefour,0322368514", "Compiegne,1 square Philibert Delorme,60200");
    
    console.log(meeting);

    assert.ok(meeting, "Meeting created");
    assert.equal(meeting.date, "20151217T110000", "Date recorded");
    assert.equal(meeting.duration, "PT2H0M0S", "Duration recorded");
    assert.equal(meeting.manager, "Maxime DELARUE,Alimentaire,Carrefour,0322368514", "Manager recorded");
    assert.equal(meeting.location, "Compiegne,1 square Philibert Delorme,60200", "Location recorded");
});
//
//QUnit.test("Parse wrong iCalendar File", function (assert) {
//    var wrongData = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//hacksw/handcal//NONSGML v1.0//EN\r\nBEGIN:VEVENT\r\nDTSTART:20151217T110000\r\nDURATION:PT2H0M0S\r\nORGANIZER:Maxime DELARUE,Alimentaire,Carrefour,0322368514\r\nLOCATION:Troyes,4 rue Brunneval,10000\r\nCONTACT:Max CORINCHE\,0322368514\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART:20151210T160000\r\nDURATION:PT2H0M0S\r\nORGANIZER:Maxime DELARUE,Alimentaire,Carrefour,0322368514\r\nLOCATION:Compiegne,1 square Philibert Delorme,60200\r\nCONTACT:Remi BERAUX\,0322368514\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART:20151210T120000\r\nDURATION:PT1H0M0S\r\nORGANIZER:Maxime DELARUE,Alimentaire,Carrefour,0322368514\r\nLOCATION:Troyes,4 rue Brunneval,10000\r\nCONTACT:Max CORINCHE\,0322368514\r\nEND:VEVENT\r\nEND:VCALENDAR";
//    var parsedData = analyser.parse(wrongData);
//
//    assert.ok(!parsedData, "iCalendar Data not Parsed");
//});
//


QUnit.module("Program Syntatic parsing");
    var analyzer = new icalendarParser();

QUnit.test("Date", function (assert) {
    var inpt = ["DTSTART", "20151217T110000"];
    assert.equal(analyzer.date(inpt), "20151217T110000", "Date matched and returned");
});
QUnit.test("Duration", function (assert) {
    var input = ["DURATION", "PT2H0M0S"];
    assert.equal(analyzer.duration(input), "PT2H0M0S", "Duration matched and returned");
});
QUnit.test("Manager", function (assert) {
    var input = ["ORGANIZER", "Maxime DELARUE,Alimentaire,Carrefour,0322368514"];
    assert.equal(analyzer.manager(input), "Maxime DELARUE,Alimentaire,Carrefour,0322368514", "Manager matched and returned");
});
QUnit.test("Location", function (assert) {
    var input = ["LOCATION", "Compiegne,1 square Philibert Delorme,60200"];
    assert.equal(analyzer.location(input), "Compiegne,1 square Philibert Delorme,60200", "Location matched and returned");
});
// PROBLEME CONTACT !!!

