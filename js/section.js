var SEE_PASS = "See<br/>PASS";
var session_pool = [
    new Session("1", 1, 1, 1.0),
    new Session("8W1", 8, 1, 0.5),
    new Session("8W2", 8, 2, 0.5),
    new Session("4W1", 4, 1, 0.25),
    new Session("4W2", 4, 1, 0.25),
    new Session("PRE", 1, 1, 0.20),
    new Session("POST", 1, 2, 0.20)
];

function Session (session_descriptor, weeks, id, portion) {
    return {
        descriptor: session_descriptor,
        weeks_in_session: weeks,
        session_id: id,
        portion_of_term: portion,
        
        conflictsWith: function(other) {
            if (this == other)
                return true;
            
            if (     (this.weeks_in_session == 1 &&  this.session_id != 1)
                 || (other.weeks_in_session == 1 && other.session_id != 1) ) {
                return (this.weeks_in_session == other.weeks_in_session && this.session_id == other.session_id);
            }
            
            if (this.weeks_in_session == other.weeks_in_session)
                return this.session_id == other.session_id;
            else
                return true;
        },
        
        toString: function() {
            if (this.weeks_in_session == 1) {
                if (this.session_id === 0)
                    return "pre-session: ";
                else if (this.session_id > 1)
                    return "post-session: ";
                else if (this.descriptor == "1")
                    return "";
                else
                    return "Session " + this.descriptor + ": ";
            }
            else {
                var _id;
                if (this.session_id == 1)
                    _id = "1st";
                else if (this.session_id == 2)
                    _id = "2nd";
                else if (this.session_id == 3)
                    _id = "3rd";
                else
                    _id = this.session_id + "th";
                var res = _id + " " + this.weeks_in_session + "-wk session: ";
                return res;
            }
        }
    };
}

//
// VERSION 0
// 0510,BILSA,COMPUTER,103344,1130,L1,1,UGRD,INTRO TO PROGRAMMING,2740,25,26,Scanlan,Thomas ,C,BOE 0221 Th 09:00-10:52;
//     0     1        2      3    4  5 6    7                    8    9 10 11      12      1314                      15
// J   ,coll ,prog    ,crsid ,cat#,se,J,J   ,title               ,cls#,se,fi,last   ,first  ,C/O,location (where J = "junk field")
//
// VERSION 1
// 0510,BILSA,COMPUTER,103344,1130,L1,1      ,UGRD,INTRO TO PROGRAMMING,2740,25,26,"Scanlan,Thomas",C,3,BOE 0221 Th 09:00-10:52;
//     0     1        2      3    4  5       6    7                    8    9 10 11               121314                      15
// J   ,coll ,prog    ,crseid,cat#,se,session,J   ,title               ,cls#,se,fi,name       ,closed,credits,location,session (1=whole semester)
//  (where J = "junk/ignored field")
function Section(src, class_list_version) {
    var sect;
    var tokens;
    if (src.incomplete) { // A schedule was opened with the wrong semester
        sect = {          // active. Only 3 fields are known.
            college: "Other",
            program: src.program,
            course_id: 0,
            catalog_no: src.catalog_no,
            section: src.section,
            session: "",
            ugrad: true,
            title: "(no such course)",
            class_no: 0,
            seats: -1,
            filled: -1,
            instructor: "(unknown)",
            closed: false,
            credits: -1,
            meetsAt: new TBAMeeting("")
        };
    }
    else if (class_list_version === 0) { // Old class list files.
        tokens = src.split(",");
        sect = {
            college: tokens[1],
            program: tokens[2],
            course_id: parseInt(tokens[3], 10),
            catalog_no: tokens[4],
            section: tokens[5],
            session: tokens[6],
            ugrad: (tokens[7] == "UGRAD"),
            title: tokens[8],
            class_no: parseInt(tokens[9], 10),
            seats: parseInt(tokens[10], 10),
            filled: parseInt(tokens[11], 10),
            instructor: (function(){
                var a = (tokens.length == 14 ? tokens[12] : tokens[12] + "," + tokens[13]);
                return (a === "" ? "TBA" : a);
            })(),
            closed: (tokens[tokens.length-3] == "C"),
            credits: parseInt(tokens[tokens.length-2], 10),
            meetsAt: makeMeeting(tokens[tokens.length-1], tokens[6])
        };
    }
    else { // New class list files.
        tokens = src.splitQuoted(",", "\"");
        sect = {
            college: tokens[1],
            program: tokens[2],
            course_id: parseInt(tokens[3], 10),
            catalog_no: tokens[4],
            section: tokens[5],
            session: tokens[6],
            ugrad: (tokens[7] == "UGRAD"),
            title: tokens[8],
            class_no: parseInt(tokens[9], 10),
            seats: parseInt(tokens[10], 10),
            filled: parseInt(tokens[11], 10),
            instructor: (tokens[12] === "" ? "TBA" : tokens[12]),
            closed: (tokens[13] == "C"),
            credits: parseInt(tokens[14], 10),
            meetsAt: makeMeeting(tokens[15], tokens[6])
        };
    }
    
    var res = {
        suppressCredits: function () {
            this.credits = 0;
        },
        
        toString: function() {
            return this.program + " " + this.catalog_no + " " + this.section + " " + this.title
                + " " + this.instructor + " " + this.filled + "/" + this.seats
                + (this.closed ? " (C) " : " ")
                + this._meetsAt().toString();
        },
        
        _meetsAt: function () {
            if (typeof this.meetsAt === "undefined") {
                this.meetsAt = new TBAMeeting("");
            }
            return this.meetsAt;
        },
        
        creditHoursInDoubt: function() {
            if (this.credits != 1
                 || this.title.indexOf(" LAB") != -1
                 || this.title == "INTRO TO ENGR PROJECTS"
                 || (this.program == "PHYSED" && this.catalog_no < 2000))
                return false;
            var hrs = this._meetsAt().class_hours();
            var is_lab = this.section.length > 0
                         && (this.section[0] == "L" || this.section[0] == "l");
            if (hrs == this.credits || (hrs/2 == this.credits && is_lab))
                return false;
            else
                return true;
        },
        
        conflictsWith: function(other) {
            return this._meetsAt().conflictsWith(other._meetsAt());
        },
        
        conflictsWithSansSelf: function(other) {
            return this != other && this._meetsAt().conflictsWith(other._meetsAt());
        },
        
        toICal: function(gen) {
            var note = this.title;
            if (this.instructor != "TBA")
                note += "\\nInstructor: " + this.instructor;
            var result = this._meetsAt().toICal(this.program + " " + this.catalog_no + " ",
                                           note,
                                           gen);
            return result;
        }
    };
    
    var a = {};
    $.extend(true, a, res, sect);    
    return a;
}

function sectionLessThan(a, b) {
    if (a.college != b.college)
        if (a.college > b.college) return 1;
        else return -1;
    if (a.program != b.program)
        if (a.program > b.program) return 1;
        else return -1;
    if (a.catalog_no != b.catalog_no)
        if (a.catalog_no > b.catalog_no) return 1;
        else return -1;
    if (a.section != b.section)
        if (a.section > b.section) return 1;
        else return -1;
    return 1;
}

// Returns a new array with only the unique values from the initial array.
Array.prototype.getUnique = function(){
    var u = {}, a = [];
    for(var i = 0, l = this.length; i < l; ++i){
        if(u.hasOwnProperty(this[i])) {
            continue;
        }
        a.push(this[i]);
        u[this[i]] = 1;
    }
    return a;
};

String.prototype.splitQuoted = function(delim, quote_mark) {
    var prev, i = 0;
    var result = [];
    
    while(i < this.length) {
        prev = i;
        if (i < this.length && this.charAt(i) == quote_mark) {
            ++i;
            while (i < this.length && this.charAt(i) != quote_mark) {
                ++i;
                if (i < this.length - 1
                     && this.charAt(i) == quote_mark
                     && this.charAt(i+1) == quote_mark)
                    i += 2;
            }
            ++i;
            
            if (i < this.length && this.charAt(i) != delim) {
                i = prev;
                while(i < this.length && this.charAt(i) != delim)
                    i ++;
            }
        }
        else {
            while(i < this.length && this.charAt(i) != delim)
                i++;
        }
        
        var next_item;
        if (i >= this.length)
            next_item = this.substr(prev);
        else
            next_item = this.substr(prev, i-prev);
        if (next_item.length > 0 && next_item.charAt(0) == quote_mark
             && next_item.charAt(next_item.length-1) == quote_mark) {
            var tmp = "";
            for (var j = 1; j < next_item.length-1; j++) {
                tmp += next_item.charAt(j);
                if (next_item.charAt(j) == quote_mark)
                    ++j;
            }
            next_item = tmp;
        }

        result.push(next_item);
        if (i < this.length)
            i++;
    }
    if (this.length > 0 && this.charAt(this.length-1) == delim)
        result.push("");
    return result;
};