// POI
var POI = function(date, duration, manager, location)
{
	this.date = date;
	this.duration = duration;
	this.manager = manager;
	this.location = location;
}
	

// icalendarParser
var icalendarParser = function(){
	// The list of POI parsed from the input file.
	this.parsedPOI = [];
	this.symb = ["BEGIN:VCALENDAR","VERSION","PRODID","BEGIN:VEVENT","DTSTART","DURATION","ORGANIZER","LOCATION","CONTACT","END:VEVENT","END:VCALENDAR"];
}


// Parser procedure

// tokenize : tranform the data input into a list
// <eol> = CRLF
icalendarParser.prototype.tokenize = function(data)
{
	var separator = /(\r\n|:(?!VCALENDAR|VEVENT))/;
	data = data.split(separator);
	data = data.filter(function(val, idx){ 
						return !val.match(separator); 	
					});
	return data;
}

// parse : analyze data by calling the first non terminal rule of the grammar
icalendarParser.prototype.parse = function(data)
{
	var tData = this.tokenize(data);
	//console.log(tData);
	this.listPoi(tData);
}

//is an ics or not ?
icalendarParser.prototype.checkExtension = function(fileName)
{
	var resRegex = [];
	var separator = /.{4}$/;
	
	resRegex = separator.exec(fileName);

	if(resRegex[0] == '.ics' )
		return true;
	else
		return false;
}

// Parser operand
icalendarParser.prototype.err = function(msg){
	console.log("Parsing Error ! -- msg : "+msg);
	process.exit(1);
}


// Read and return a symbol from input
icalendarParser.prototype.next = function(input)
{
	var curS = input.shift();
	return curS
}

// accept : verify if the arg s is part of the language symbols.
icalendarParser.prototype.accept = function(s)
{
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if(idx === -1){
		this.err("symbol "+s+" unknown", [" "]);
		return false;
	}

	return idx;
}



// check : check whether the arg elt is on the head of the list
icalendarParser.prototype.check = function(s, input)
{
	if(this.accept(input[0]) == this.accept(s)){
		return true;	
	}
	return false;
}

// expect : expect the next symbol to be s.
icalendarParser.prototype.expect = function(s, input)
{
	if(s == this.next(input)){
		//console.log("Reckognized! "+s)
		return true;
	}else{
		this.err("symbol "+s+" doesn't match", input);
	}
	return false;
}

// Parser rules

// <liste_poi> = "BEGIN:VCALENDAR" <infoVcalendar> *(<poi>) "END:VCALENDAR"
icalendarParser.prototype.listPoi = function(input){
	this.expect("BEGIN:VCALENDAR", input);
	this.infoVcalendar(input);
	this.poi(input);
	this.expect("END:VCALENDAR", input);
}

//<infoVcalendar> = <version> <eol> <prodid> <eol>
icalendarParser.prototype.infoVcalendar = function(input)
{
	this.expect("VERSION", input);
	var curS = this.next(input);
	if(matched = curS.match(/[0-9]+\.[0-9]+/)){
		if(matched[0] != curS){
			this.err("Invalid version.", input);
		}
	}else{
		this.err("Invalid version.", input);
	}
			
	this.expect("PRODID", input);
	curS = this.next(input);
	if(matched = curS.match(/.+/)){
		if(matched[0] != curS){
			this.err("Invalid prodid.", input);
		}
	}else{
		this.err("Invalid prodid.", input);
	}
}

// <poi> = <BEGIN:VEVENT> <eol> <vevent> <eol> <END:VEVENT>
icalendarParser.prototype.poi = function(input)
{
	if(this.check("BEGIN:VEVENT", input)){
		this.expect("BEGIN:VEVENT", input);
		var args = this.vevent(input);
		var p = new POI(args.date, args.duration, args.manager, args.location);
		this.expect("END:VEVENT",input);
		this.parsedPOI.push(p);
		this.poi(input);
		return true;
	}else{
		return false;
	}

}

// <vevent> = <DTSTART> <eol> <DURATION> <eol> <ORGANIZER> <eol> <LOCATION> <eol> <CONTACT>
icalendarParser.prototype.vevent = function(input)
{
	var date = this.date(input);
	var duration = this.duration(input);
	var manager = this.manager(input);
	var location = this.location(input);

	this.contact(input);

	return { date: date, duration: duration, manager: manager, location: location };
}


icalendarParser.prototype.date = function(input)
{
	this.expect("DTSTART",input);
	var curS = this.next(input);
	if(matched = curS.match(/\d{8}T\d{6}/)){
		if(matched[0] != curS){
			this.err("Invalid date value.");
		}
		else{
			return matched[0];
		}
	}else{
		this.err("Invalid date value.");
	}
}

icalendarParser.prototype.duration = function(input)
{
	this.expect("DURATION",input);
	var curS = this.next(input);
	if(matched = curS.match(/PT([0-1][0-9]|[2][0-3]|[0-9])H([0-5][0-9]|[0-9])M([0-5][0-9]|[0-9])S/)){
		if(matched[0] != curS){
			this.err("Invalid duration value.");
		}
		else{
			return matched[0];
		}
	}else{
		this.err("Invalid duration value.");
	}
}


icalendarParser.prototype.manager = function(input)
{
	this.expect("ORGANIZER",input);
	var curS = this.next(input);
	if(matched = curS.match(/[a-zA-Z]+([a-zA-Z]|\s(?=[a-zA-Z]))*,[a-zA-Z]+([a-zA-Z]|\s(?=[a-zA-Z]))*,[a-zA-Z0-9]+([a-zA-Z0-9]|\s(?=[a-zA-Z0-9]))*,[0-9]{10}/)){
		if(matched[0] != curS){
			this.err("Invalid organizer value.");
		}
		else{
			return matched[0];
		}
	}else{
		this.err("Invalid organizer value.");
	}
}

icalendarParser.prototype.location = function(input)
{
	this.expect("LOCATION",input);
	var curS = this.next(input);
	if(matched = curS.match(/[a-zA-Z]+([a-zA-Z]|\s(?=[a-zA-Z])|('(?=[a-zA-Z])))*,[a-zA-Z0-9]+([a-zA-Z0-9]|\s(?=[a-zA-Z0-9])|('(?=[a-zA-Z])))*,[0-9]{5}/)){
		if(matched[0] != curS){
			this.err("Invalid location value.");
		}
		else{
			return matched[0];
		}
	}else{
		this.err("Invalid location value.");
	}
}

icalendarParser.prototype.contact = function(input)
{
	this.expect("CONTACT",input);
	var curS = this.next(input);
	if(matched = curS.match(/[a-zA-Z]+([a-zA-Z]|\s(?=[a-zA-Z]))*\\,[0-9]{10}/)){
		if(matched[0] != curS){
			this.err("Invalid contact value.");
		}
	}else{
		this.err("Invalid contact value.");
	}
}



exports.icalendarParser = icalendarParser;