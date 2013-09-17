var Day = Object.freeze({Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6});
var day_names = ["M", "T", "W", "Th", "F", "S", "Su"];

function MeetTime(str) {
    var tokens = str.split(" ")[0].split(":");
    var _hr = parseInt(tokens[0], 10);
    var _mn = parseInt(tokens[1], 10);
    if (str === "12:00 AM")
        _hr = 0;
    else if (str.length > 5 && str.indexOf("PM") === 6 && _hr < 12)
        _hr += 12;
    
    return {
        hour: _hr,
        minute: _mn,
        
        toICal: function() {
            var hr = (this.hour < 10 ? "0" + this.hour : this.hour);
            var mn = (this.minute < 10 ? "0" + this.minute : this.minute);
            return hr + ":" + mn + "00";
        },
        
        toString: function() {
            var s = this.hour + ":";
            if (this.minute < 10)
                s += "0";
            s += this.minute;
            return s;
        },
        
        compare: function(other) {
            var a = this.hour * 60 + this.minute;
            var b = other.hour * 60 + other.minute;
            return a-b;
        }
    };
}

function TimeMinus(timea, timeb) {
    var a_min = timea.hour * 60 + timea.minute;
    var b_min = timeb.hour * 60 + timeb.minute;
    if (a_min <= b_min)
        return 0;
    else
        return a_min - b_min;
}

function Meeting (session_description) {
    return {
        session: new SessionLookup(session_description),
        
        toString: function() {
            var str = this.session.toString() + this.toStringSansSession();
            return str;
        },
        
        timeIsTBA: function() {
            return false;
        },
        
        toICal: function() {
            return "";
        }
    };
}

function makeMeeting(mtg_time_info, session_description) {
    var mtg = mtg_time_info.trim();
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

function TBAMeeting (session) {
    var meeting = new Meeting(session);
    var ret = {
        toStringSansSession: function() {
            return "TBA";
        },
        
        locations: function() {
            return "TBA";
        },
        
        addBuildings: function(buildings) {
            // No Info
        },
        
        addRoomsIn: function(building, rooms) {
            // No Info
        },
        
        times: function() {
            return "TBA";
        },
        
        conflictsWith: function(other) {
            return false;
        },
        
        conflictsWith_ex: function(day, meet_time_a, meet_time_b) {
            return false;
        },
        
        mtgHour: function(day) {
            return -1;
        },
        
        mtgEndHour: function(day) {
            return -1;
        },
        
        class_hours: function() {
            return 0;
        },
        
        mtgPlace: function(day) {
            return "TBA";
        },
        
        timeIsTBA: function() {
            return true;
        },
        
        meetsIn: function(building) {
            return false;
        },
        
        meetsIn_ex: function(building, room) {
            return false;
        }
    };
    var a = {};
    $.extend(true, a, meeting, ret);
    return a;
}

function TBAMeetingWithInfo(information, session_description) {
    var meeting = new TBAMeeting(session_description);
    information = information.trim();
    var ret = {
        info: information,
        
        toStringSansSession: function() {
            var str = "TBA: " + this.info;
            return str;
        },
        
        locations: function() {
            return this.info;
        },
        
        mtgPlace: function(day) {
            return "";
        }
    };
    var a = {};
    $.extend(true, a, meeting, ret);
    return a;
}

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
        days: _days,
        start: _start,
        end: _end,
        place: _place,
        building: _building,
        room: _room,
        
        mtgDays: function() {
            var res = "";
            for (var i = 0; i < 7; i ++) {
                if (this.days[i]) res += day_names[i];
            }
            return res;
        },
        
        toStringSansSession: function() {
            var res = this.place + " " + this.mtgDays();
            res += " ";
            res += this.start.toString() + "-" + this.end.toString();
            return res;
        },
        
        locations: function() {
            return this.place;
        },
        
        addBuildings: function(buildings) {
            if (building.length > 0)
                buildings.push(building);
            return buildings;
        },
        
        addRoomsIn: function(target_building, rooms) {
            if (building.length > 0 && room.length > 0 && building == target_building)
                rooms.push(room);
            return rooms;
        },
        
        times: function() {
            return this.mtgDays() + " " + this.start.toString() + "-" + this.end.toString();
        },
        
        mtgHour: function(day) {
            if (this.days[day])
                return this.start.hour;
            else
                return -1;
        },
        
        mtgEndHour: function(day) {
            if (this.days[day])
                return this.end.hour;
            else
                return -1;
        },
        
        mtgPlace: function(day) {
            return this.place;
        },
        
        class_hours: function() {
            var minutes = 0;
            for (var i = 0; i < 7; i ++) {
                if (this.days[i])
                    minutes = new TimeMinus(this.end, this.start);
            }
            var hrs = (0.5 + (minutes/52) * this.session.portion_of_term);
            return hrs;
        },
        
        meetsIn: function(target_building) {
            return this.building == target_building;
        },
        
        meetsIn_ex: function(target_building, target_room) {
            return this.building == target_building
                && this.room     == target_room;
        },
        
        conflictsWith: function(other) {
            for (var i = 0; i < 7; i ++) {
                if (this.days[i] && other.conflictsWith_ex(i, this.start, this.end))
                    return this.session.conflictsWith(other.session);
            }
            return false;
        },
        
        conflictsWith_ex: function(day, startTime, endTime) {
            if (!this.days[day])
                return false;
            if (startTime.compare(this.start) <= 0 && this.start.compare(endTime) < 0)
                return true;
            if (startTime.compare(this.end) < 0 && this.end.compare(endTime) <= 0)
                return true;
            return (this.start.compare(startTime) <= 0 && endTime.compare(this.end) <= 0);
        },
        
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

function DoubleMeeting(s, session_description) {
    var meeting = new TBAMeeting(session_description);
    var _first = makeMeeting(s.substr(0, s.indexOf(";")), session_description);
    var _second = makeMeeting(s.substr(s.indexOf(";")+1), session_description);
    
    var ret = {
        first: _first,
        second: _second,
        
        toStringSansSession: function() {
            return this.first.toStringSansSession() + ";" + this.second.toStringSansSession();
        },
        
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
        
        addBuildings: function(buildings) {
            buildings = this.first.addBuildings(buildings);
            buildings = this.second.addBuildings(buildings);
            return buildings;
        },
        
        addRoomsIn: function(target_building, rooms) {
            rooms = this.first.addRoomsIn(target_building, rooms);
            rooms = this.second.addRoomsIn(target_building, rooms);
            return rooms;
        },
        
        times: function() {
            return this.first.times() + "; " + this.second.times();
        },
        
        conflictsWith: function(other) {
            return (this.first.conflictsWith(other) || this.second.conflictsWith(other)) && this.session.conflictsWith(other.session);
        },
        
        conflictsWith_ex: function(day, start, end) {
            return this.first.conflictsWith_ex(day, start, end) ||
                    this.second.conflictsWith_ex(day, start, end);
        },
        
        mtgHour: function(day) {
            if (this.first.mtgHour(day) == -1)
                return this.second.mtgHour(day);
            else
                return this.first.mtgHour(day);
        },
        
        mtgEndHour: function(day) {
            if (this.first.mtgEndHour(day) == -1)
                return this.second.mtgEndHour(day);
            else
                return this.first.mtgEndHour(day);
        },
        
        class_hours: function() {
            var hrs1 = this.first.class_hours();
            var hrs2 = this.second.class_hours();
            if (hrs1 === 0 || hrs2 === 0)
                return 0;
            else
                return hrs1 + hrs2;
        },
        
        mtgPlace: function(day) {
            if (this.first.mtgPlace(day) === "")
                return this.second.mtgPlace(day);
            else
                return this.first.mtgPlace(day);
        },
        
        meetsIn: function(target_building) {
            return this.first.meetsIn(target_building)
                || this.second.meetsIn(target_building);
        },
        
        meetsIn_ex: function(target_building, target_room) {
            return this.first.meetsIn_ex(target_building, target_room)
                || this.second.meetsIn_ex(target_building, target_room);
        },
        
        timeIsTBA: function() {
            return this.first.timeIsTBA() || this.second.timeIsTBA();
        },
        
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