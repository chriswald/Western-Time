// FILE:    meeting.js
// AUTHOR:  Christopher J. Wald
// DATE:    Oct 12, 2013
//
// DESC:    Contains classes for keeping track of when a class meets.
//
// KNOWN DEPENDENCIES:
//          event.js

// Day of week that each day is for these purposes.
var Day = {Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6};
// Short names of days.
var day_names = ["M", "T", "W", "Th", "F", "S", "Su"];

// MeetTime Class
// A time associated with a meeting, either start or end.
function MeetTime(str) {
    var tokens = str.split(" ")[0].split(":");
    var _hr = parseInt(tokens[0], 10);
    var _mn = parseInt(tokens[1], 10);
    if (str === "12:00 AM")
        _hr = 0;
    else if (str.length > 5 && str.indexOf("PM") === 6 && _hr < 12)
        _hr += 12;
    
    return {
        // Meeting hour
        hour: _hr,
        // Meeting minute
        minute: _mn,
        
        // Returns this time formatted for iCal.
        toICal: function() {
            var hr = (this.hour < 10 ? "0" + this.hour : this.hour);
            var mn = (this.minute < 10 ? "0" + this.minute : this.minute);
            return hr + ":" + mn + "00";
        },
        
        // Returns this time as a string.
        toString: function() {
            var s = this.hour + ":";
            if (this.minute < 10)
                s += "0";
            s += this.minute;
            return s;
        },
        
        // Returns <0 is this is earlier than other, ==0 if this is
        // at the same time as other, and >0 otherwise.
        compare: function(other) {
            var a = this.hour * 60 + this.minute;
            var b = other.hour * 60 + other.minute;
            return a-b;
        }
    };
}

// Subtracts two times returning their difference in minutes.
function TimeMinus(timea, timeb) {
    var a_min = timea.hour * 60 + timea.minute;
    var b_min = timeb.hour * 60 + timeb.minute;
    if (a_min <= b_min)
        return 0;
    else
        return a_min - b_min;
}

// Meeting Class
// "Abstract" base class
function Meeting (session_description) {
    return {
        // The session that the meeting runs for.
        session: new SessionLookup(session_description),
        
        // Returns this as a string for printing out.
        toString: function() {
            var str = this.session.toString() + this.toStringSansSession();
            return str;
        },
        
        // Returns whether the time for this meeting is defined.
        timeIsTBA: function() {
            return false;
        },
        
        // Returns the iCal text for this meeting.
        toICal: function() {
            return "";
        }
    };
}

// Takes in the meeting time information and session description for
// a section and returns a meeting of the proper type.
function makeMeeting(mtg_time_info, session_description) {
    var mtg = mtg_time_info.replace(/^\s/g, "").replace(/\s$/g, "");
    if (mtg[0] == "\"")
        mtg = mtg.substr(1);
    if (mtg[mtg.length-1] == "\"")
        mtg = mtg.substr(0, mtg.length-1);
    
    var semi1 = mtg.indexOf(";"), semi2 = mtg.indexOf(";", semi1+1),
        tba1  = mtg.indexOf("TBA"), tba2 = mtg.indexOf("TBA", tba1+1);
    if (semi2 != -1)
        return new DoubleMeeting(mtg, session_description);
    else if (tba2 != -1 || (mtg.indexOf("TBA") === 0 && mtg.indexOf("-;") == mtg.length-2) || mtg == "TBA;")
        return new TBAMeeting(session_description);
    else if (mtg.substr(mtg.length-3) == "TBA" || mtg.substr(mtg.length-4) == "TBA;")
        return new TBAMeetingWithInfo(mtg, session_description);
    else
        return new SingleMeeting(mtg, session_description);
}

// Returns a session fitting the requested session type.
function SessionLookup(target) {
    if (target.length === 0)
        return session_pool[0];
    for (var i = 0; i < session_pool.length; i ++) {
        if (target == session_pool[i].descriptor)
            return session_pool[i];
    }
    
    var s;
    if (target.length == 3 && target[1] == "W" && !isNaN(target[0]) && !isNaN(target[2])) {
        var wks = target[0] - '0';
        s = new Session(target, wks, target[2]='0', wks/15.0);
    }
    else {
        s = new Session(target, 1, 1, 1.0);
    }
    session_pool.push(s);
    return s;
}

// TBAMeeting Class
// Class for a section whose meeting time is not known.
function TBAMeeting (session) {
    var meeting = new Meeting(session);
    var ret = {
        // Return this meeting time as a string without session info.
        toStringSansSession: function() {
            return "TBA";
        },
        
        // Return the locations that this section meets.
        locations: function() {
            return "TBA";
        },
        
        // Add buildings to this meeting.
        addBuildings: function(buildings) {
            // No Info
        },
        
        // Add rooms to this meeting.
        addRoomsIn: function(building, rooms) {
            // No Info
        },
        
        // Return the times that this meeting meets at.
        times: function() {
            return "TBA";
        },
        
        // Return whether this meeting time conflicts with another.
        conflictsWith: function(other) {
            return false;
        },
        
        // Return whether this meeting time conflicts with a time on
        // a day.
        conflictsWith_ex: function(day, meet_time_a, meet_time_b) {
            return false;
        },
        
        // Return the hour that this meeting starts at.
        mtgHour: function(day) {
            return -1;
        },
        
        // Return the hour that this meeting ends at.
        mtgEndHour: function(day) {
            return -1;
        },
        
        // Return the number of hours that this meeting runs for.
        class_hours: function() {
            return 0;
        },
        
        // Return where this meeting takes place.
        mtgPlace: function(day) {
            return "TBA";
        },
        
        // Return whether the time for this meeting is known.
        timeIsTBA: function() {
            return true;
        },
        
        // Return whether this meeting occurs in a building.
        meetsIn: function(building) {
            return false;
        },
        
        // Return whether this meeting occurs in a building and room.
        meetsIn_ex: function(building, room) {
            return false;
        }
    };
    var a = {};
    $.extend(true, a, meeting, ret);
    return a;
}

// TBAMeeting Class
// Class for a section whose meeting time is not known, but some
// other information is known.
function TBAMeetingWithInfo(information, session_description) {
    var meeting = new TBAMeeting(session_description);
    information = information.replace(/^\s/g, "").replace(/\s$/g, "");
    var ret = {
        // Extra known information.
        info: information,
        
        // Return this meeting time as a string without session info.
        toStringSansSession: function() {
            var str = "TBA: " + this.info;
            return str;
        },
        
        // Return the locations that this section meets.
        locations: function() {
            return this.info;
        },
        
        // Return where this meeting takes place.
        mtgPlace: function(day) {
            return "";
        }
    };
    var a = {};
    $.extend(true, a, meeting, ret);
    return a;
}

// SingleMeeting Class
// A meeting that takes place at one time and in one location, even
// if on multiple days.
function SingleMeeting(src, session_description) {
    var meeting = new Meeting(session_description);
    var _start = new MeetTime("0:0");
    var _end   = new MeetTime("0:0");
    
    var _days  = [];
    for (var i = 0; i < 7; i ++)
        _days.push(false);
    
    var items = src.split(" ");
    
    if (items.length === 0)
        return new TBAMeeting(session_description);
        
    var daysstr, timestr;
    var tmp = items[0];
    
    var _building = "";
    var _room = "";
    var _place = "";
    
    if (tmp == "TBA") {
        _building = "";
        _room = "";
        _place = "TBA";
        daysstr = items[1];
        timestr = items[2];
        for (i = 3; i < items.length; i ++)
            timestr += " " + items[i];
    }
    else {
        _building = items[0];
        _room = items[1];
        _place = _building + " " + _room;
        daysstr = items[2];
        timestr = items[3];
        for (i = 4; i < items.length; i ++)
            timestr += " " + items[i];
    }
    
    if (daysstr.indexOf("Su") != -1) {
        daysstr = daysstr.replace("Su", "");
        _days[Day.Sunday] = true;
    }
    if (daysstr.indexOf("Th") != -1) {
        daysstr = daysstr.replace("Th", "");
        _days[Day.Thursday] = true;
    }
    if (daysstr.indexOf("M") != -1)
        _days[Day.Monday] = true;
    if (daysstr.indexOf("T") != -1)
        _days[Day.Tuesday] = true;
    if (daysstr.indexOf("W") != -1)
        _days[Day.Wednesday] = true;
    if (daysstr.indexOf("F") != -1)
        _days[Day.Friday] = true;
    if (daysstr.indexOf("S") != -1)
        _days[Day.Saturday] = true;
        
    if (timestr[timestr.length-1] == ";")
        timestr = timestr.substr(0, timestr.length-1);
    var times = timestr.split("-");
    _start = new MeetTime(times[0]);
    _end = new MeetTime(times[1]);
    
    var ret = {
        // List of days that this meeting takes place on.
        days: _days,
        // Start MeetingTime
        start: _start,
        // End MeetingTime
        end: _end,
        // Location that this meeting takes place at.
        place: _place,
        // Building that this meeting meets in.
        building: _building,
        // Room that this meeting meets in.
        room: _room,
        
        // String of days that this meeting meets on.
        mtgDays: function() {
            var res = "";
            for (var i = 0; i < 7; i ++) {
                if (this.days[i]) res += day_names[i];
            }
            return res;
        },
        
        // Return this meeting time as a string without session info.
        toStringSansSession: function() {
            var res = this.place + " " + this.mtgDays();
            res += " ";
            res += this.start.toString() + "-" + this.end.toString();
            return res;
        },
        
        // Return the locations that this section meets.
        locations: function() {
            return this.place;
        },
        
        // Add buildings to this meeting.
        addBuildings: function(buildings) {
            if (building.length > 0)
                buildings.push(building);
            return buildings;
        },
        
        // Add rooms to this meeting.
        addRoomsIn: function(target_building, rooms) {
            if (building.length > 0 && room.length > 0 && building == target_building)
                rooms.push(room);
            return rooms;
        },
        
        // Return the times that this meeting meets at.
        times: function() {
            return this.mtgDays() + " " + this.start.toString() + "-" + this.end.toString();
        },
        
        // Return the hour that this meeting starts at.
        mtgHour: function(day) {
            if (this.days[day])
                return this.start.hour;
            else
                return -1;
        },
        
        // Return the hour that this meeting ends at.
        mtgEndHour: function(day) {
            if (this.days[day])
                return this.end.hour;
            else
                return -1;
        },
        
        // Return where this meeting takes place.
        mtgPlace: function(day) {
            return this.place;
        },
        
        // Return the number of hours that this meeting runs for.
        class_hours: function() {
            var minutes = 0;
            for (var i = 0; i < 7; i ++) {
                if (this.days[i])
                    minutes = new TimeMinus(this.end, this.start);
            }
            var hrs = (0.5 + (minutes/52) * this.session.portion_of_term);
            return hrs;
        },
        
        // Return whether this meeting occurs in a building.
        meetsIn: function(target_building) {
            return this.building == target_building;
        },
        
        // Return whether this meeting occurs in a building and room.
        meetsIn_ex: function(target_building, target_room) {
            return this.building == target_building
                && this.room     == target_room;
        },
        
        // Return whether this meeting time conflicts with another.
        conflictsWith: function(other) {
            for (var i = 0; i < 7; i ++) {
                if (this.days[i] && other.conflictsWith_ex(i, this.start, this.end))
                    return this.session.conflictsWith(other.session);
            }
            return false;
        },
        
        // Return whether this meeting time conflicts with a time on
        // a day.
        conflictsWith_ex: function(day, startTime, endTime) {
            if (!this.days[day])
                return false;
            if (startTime.compare(this.start) <= 0 && this.start.compare(endTime) < 0)
                return true;
            if (startTime.compare(this.end) < 0 && this.end.compare(endTime) <= 0)
                return true;
            return (this.start.compare(startTime) <= 0 && endTime.compare(this.end) <= 0);
        },
        
        // Returns the iCal text for this meeting.
        toICal: function(course_name, note, gen) {
            var result;
            result = gen.eventFor(course_name, this.locations(), note, this.start.toICal(), this.end.toICal(), this.days);
            return result;
        }
    };
    var a = {};
    $.extend(true, a, meeting, ret);
    return a;
}

// DoubleMeeting Class
// A meeting that takes place at two destinct time or in two locations.
function DoubleMeeting(s, session_description) {
    var meeting = new TBAMeeting(session_description);
    var _first = makeMeeting(s.substr(0, s.indexOf(";")), session_description);
    var _second = makeMeeting(s.substr(s.indexOf(";")+1), session_description);
    
    var ret = {
        // The first SingleMeeting.
        first: _first,
        // The second SingleMeeting.
        second: _second,
        
        // Return this meeting time as a string without session info.
        toStringSansSession: function() {
            return this.first.toStringSansSession() + ";" + this.second.toStringSansSession();
        },
        
        // Return the locations that this section meets.
        locations: function() {
            var loc1 = this.first.locations();
            var loc2 = this.second.locations();
            if (loc1 == loc2) {
                if (loc1 === "")
                    return "TBA";
                else
                    return loc1;
            }
            else if (loc1 === "")
                return loc2;
            else if (loc2 === "")
                return loc1;
            else
                return loc1 + ", " + loc2;
        },
        
        // Add buildings to this meeting.
        addBuildings: function(buildings) {
            buildings = this.first.addBuildings(buildings);
            buildings = this.second.addBuildings(buildings);
            return buildings;
        },
        
        // Add rooms to this meeting.
        addRoomsIn: function(target_building, rooms) {
            rooms = this.first.addRoomsIn(target_building, rooms);
            rooms = this.second.addRoomsIn(target_building, rooms);
            return rooms;
        },
        
        // Return the times that this meeting meets at.
        times: function() {
            return this.first.times() + "; " + this.second.times();
        },
        
        // Return whether this meeting time conflicts with another.
        conflictsWith: function(other) {
            return (this.first.conflictsWith(other) || this.second.conflictsWith(other)) && this.session.conflictsWith(other.session);
        },
        
        // Return whether this meeting time conflicts with a time on
        // a day.
        conflictsWith_ex: function(day, start, end) {
            return this.first.conflictsWith_ex(day, start, end) ||
                    this.second.conflictsWith_ex(day, start, end);
        },
        
        // Return the hour that this meeting starts at.
        mtgHour: function(day) {
            if (this.first.mtgHour(day) == -1)
                return this.second.mtgHour(day);
            else
                return this.first.mtgHour(day);
        },
        
        // Return the hour that this meeting ends at.
        mtgEndHour: function(day) {
            if (this.first.mtgEndHour(day) == -1)
                return this.second.mtgEndHour(day);
            else
                return this.first.mtgEndHour(day);
        },
        
        // Return the number of hours that this meeting runs for.
        class_hours: function() {
            var hrs1 = this.first.class_hours();
            var hrs2 = this.second.class_hours();
            if (hrs1 === 0 || hrs2 === 0)
                return 0;
            else
                return hrs1 + hrs2;
        },
        
        // Return where this meeting takes place.
        mtgPlace: function(day) {
            if (this.first.mtgPlace(day) === "")
                return this.second.mtgPlace(day);
            else
                return this.first.mtgPlace(day);
        },
        
        // Return whether this meeting occurs in a building.
        meetsIn: function(target_building) {
            return this.first.meetsIn(target_building)
                || this.second.meetsIn(target_building);
        },
        
        // Return whether this meeting occurs in a building and room.
        meetsIn_ex: function(target_building, target_room) {
            return this.first.meetsIn_ex(target_building, target_room)
                || this.second.meetsIn_ex(target_building, target_room);
        },
        
        // Return whether the time for this meeting is known.
        timeIsTBA: function() {
            return this.first.timeIsTBA() || this.second.timeIsTBA();
        },
        
        // Returns the iCal text for this meeting.
        toICal: function(course_name, note, gen) {
            var evt1 = this.first.toICal(course_name, note, gen);
            var evt2 = this.second.toICal(course_name, note, gen);
            return evt1 + evt2;
        }
    };
    var a = {};
    $.extend(true, a, meeting, ret);
    return a;
}