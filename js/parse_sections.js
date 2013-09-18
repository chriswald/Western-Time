var season, year;
var ems_prog = [], lae_prog = [], bilsa_prog = [], other_prog = [];
var SECTIONS = [];
var SEE_PASS = "See<br/>PASS";
var WORKING_LIST = [];
var SCHEDULE = [];
var session_pool = [
    new Session("1", 1, 1, 1.0),
    new Session("8W1", 8, 1, 0.5),
    new Session("8W2", 8, 2, 0.5),
    new Session("4W1", 4, 1, 0.25),
    new Session("4W2", 4, 1, 0.25),
    new Session("PRE", 1, 1, 0.20),
    new Session("POST", 1, 2, 0.20)
];

function get_season_value() {
    return $("input[name=season]:checked").val();
}

function get_year_value() {
    return $("#year").find(":selected").text();
}

function get_program_value() {
    var e = document.getElementById("program");
    if (e.selectedIndex < 0)
        return;
    
    return e.options[e.selectedIndex].value;
}

(function addXhrProgressEvent($) {
    var originalXhr = $.ajaxSettings.xhr;
    $.ajaxSetup({
        xhr: function() {
            var req = originalXhr(), that = this;
            if (req) {
                if (typeof req.addEventListener == "function" && that.progress !== undefined) {
                    req.addEventListener("progress", function(evt) {
                        that.progress(evt);
                    }, false);
                }
                if (typeof req.upload == "object" && that.progressUpload !== undefined) {
                    req.upload.addEventListener("progress", function(evt) {
                        that.progressUpload(evt);
                    }, false);
                }
            }
            return req;
        }
    });
})(jQuery);

$(document).ready(function() {
    // Grab the year and season specified on the page (as opposed to in the url)
    year = get_year_value();
    season = get_season_value();
    
    var filename = "res/" + season + year + ".dat";
    console.log("Making request for '" + filename + "'");
    
    // Make a request to the web server for the specified dat file.
    var loadTimeout;
    var called = false;
    $.ajax({
        url: filename,
        success: function(response) {
            clearTimeout(loadTimeout);
            $("#progress_bar").addClass("hidden");
            populate(response);
        },
        progress: function(evt) {
            if (evt.lengthComputable) {
                var percent = parseInt( (evt.loaded / evt.total * 100), 10);
                if (!called) {
                    loadTimeout = setTimeout(function() {
                        if (percent < 80)
                            $("#progress_bar").removeClass("hidden");
                    }, 500);
                    called = true;
                }
                $("#progress").width(percent + "%");
            }
            else {
                console.log("Length not computable.");
            }
        },
        error: function() {
            clearTimeout(loadTimeout);
            $("#progress_bar").removeClass("hidden");
            $("#progress").width("100%");
            $("#progress").css("background-color", "#e60000");
            $("#progress").css("cursor", "pointer");
            $("#progress").click(function() {location.reload();});
            $("#progress_error").removeClass("hidden");
        }
    });
});

String.prototype.splitQuoted = function(delim, quote_mark) {
    var prev, i = 0;
    var result = [];
    
    while(i < this.length) {
        prev = i;
        if (i < this.length && this[i] == quote_mark) {
            ++i;
            while (i < this.length && this[i] != quote_mark) {
                ++i;
                if (i < this.length - 1
                     && this[i] == quote_mark
                     && this[i+1] == quote_mark)
                    i += 2;
            }
            ++i;
            
            if (i < this.length && this[i] != delim) {
                i = prev;
                while(i < this.length && this[i] != delim)
                    i ++;
            }
        }
        else {
            while(i < this.length && this[i] != delim)
                i++;
        }
        
        var next_item;
        if (i >= this.length)
            next_item = this.substr(prev);
        else
            next_item = this.substr(prev, i-prev);
        if (next_item.length > 0 && next_item[0] == quote_mark
             && next_item[next_item.length-1] == quote_mark) {
            var tmp = "";
            for (var j = 1; j < next_item.length-1; j++) {
                tmp += next_item[j];
                if (next_item[j] == quote_mark)
                    ++j;
            }
            next_item = tmp;
        }

        result.push(next_item);
        if (i < this.length)
            i++;
    }
    if (this.length > 0 && this[this.length-1] == delim)
        result.push("");
    return result;
};

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

function populate(response) {
    console.log("Populating...");
    var lines = response.split("\n");
    var class_list_version = 0;
    
    // Parse the response into a list of all Sections.
    for (var i = 0; i < lines.length; i ++) {
        var line = lines[i];
        if (line.length === 0)
            continue;
        if (i === 0) {
            class_list_version = parseInt(line, 10);
            console.log("Class List Version: " + class_list_version);
        }
        else {
            SECTIONS.push(new Section(line));
        }
    }
    
    // Push the names of every section's program to their corresponding list.
    for (i = 0; i < SECTIONS.length; i ++) {
        if (typeof SECTIONS[i].program !== "undefined") {
            if (SECTIONS[i].college == "EMS")
                ems_prog.push(SECTIONS[i].program);
            else if (SECTIONS[i].college == "LAE")
                lae_prog.push(SECTIONS[i].program);
            else if (SECTIONS[i].college == "BILSA")
                bilsa_prog.push(SECTIONS[i].program);
            else
                other_prog.push(SECTIONS[i].program);
        }
    }
    
    // Remove duplicate entries and sort the lists lexically.
    ems_prog = ems_prog.getUnique().sort();
    lae_prog = lae_prog.getUnique().sort();
    bilsa_prog = bilsa_prog.getUnique().sort();
    other_prog = other_prog.getUnique().sort();
    
    // If FileReader is not supported the contents of an opened file are passed
    // to the browser in a hidden div element. Only check that div element if
    // FileReader is not supported.
    if (!window.FileReader) {
        var uploaded_file_contents = $("#uploaded_file_contents").html().trim();
        if (uploaded_file_contents !== "")
            ParseFile(uploaded_file_contents);
    }
    
    // Parse the URL for schedule information. This should never conflict with
    // a file opened through the "no FileReader" method above.
    decodeURL();
    
    // Populate all graphical elements.
    populateProgramCombo();
    getProgramSections();
    populateSectionTable();
    populateScheduleTable();
    populateWeeklyView();
    fillInPrintForm();
    
    // These elements are disabled before the Sections are parsed because using
    // them could cause unpredictable results otherwise. Enable them now.
    $("#open_button").removeAttr("disabled");
    $("#save_button").removeAttr("disabled");
    $("#ddown_button").removeAttr("disabled");
    $("#print_button").removeAttr("disabled"); 
    $("#sharebar_btn").removeAttr("disabled");
    $("#search_box").removeAttr("disabled");
    
    // CRIPPLE THE PROGRAM HERE
    var cripple = false;
    if (cripple) {
        console.log("CRIPPLED");
        $("#open_button").attr("disabled", "disabled");
        $("#save_button").attr("disabled", "disabled");
        $("#ddown_button").attr("disabled", "disabled");
        $("#print_button").attr("disabled", "disabled"); 
        $("#sharebar_btn").attr("disabled", "disabled");
        
        $("#section_list").height("100%");
        
        $("#information").addClass("hidden");
        $("#schedule_list").addClass("hidden");
    }
    
    console.log("...Done");
}

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
            return this.program + " " + this.course + " " + this.section + " " + this.title
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
                 || (this.program == "PHYSED" && this.course < 2000))
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
            var result = this._meetsAt().toICal(this.program + " " + this.course + " ",
                                           note,
                                           gen);
            return result;
        }
    };
    
    var a = {};
    $.extend(true, a, res, sect);    
    return a;
}

function populateProgramCombo() {
    $("#program").html("");
    var programs = [];
    if ($("#all").is(":checked")) {
        programs = programs.concat(ems_prog);
        programs = programs.concat(lae_prog);
        programs = programs.concat(bilsa_prog);
        programs = programs.concat(other_prog);
    }
    else if ($("#ems").is(":checked")) {
        programs = programs.concat(ems_prog);
    }
    else if ($("#lae").is(":checked")) {
        programs = programs.concat(lae_prog);
    }
    else if ($("#bilsa").is(":checked")) {
        programs = programs.concat(bilsa_prog);
    }
    programs = programs.getUnique().sort();
    for (var i = 0; i < programs.length; i ++) {
        $("#program").append(
            "<option value='" + programs[i] + "'>" + programs[i] + "</option>"
        );
    }
    $("#program").trigger('change');
}

// Gets and sorts all sections in the specified program.
function getProgramSections() {
    var prog = get_program_value();
    
    var sections = [];
    for (var i = 0; i < SECTIONS.length; i ++) {
        if (SECTIONS[i].program === prog)
            sections.push(SECTIONS[i]);
    }
    
    WORKING_LIST = sections.sort(sectionLessThan);
}

function populateSectionTable(wlist) {
    $("#section_body").html("");
    for (var i = 0; i < WORKING_LIST.length; i ++) {
        var text = "";
        if (WORKING_LIST[i].closed)
            text += "<tr class='closed_row section_row'>";
        else
            text += "<tr class='section_row'>";
        text += "<td class='program_col'>" + WORKING_LIST[i].program + "</td>";
        text += "<td class='cat_no_col'>" + WORKING_LIST[i].catalog_no + "</td>";
        text += "<td class='section_col'>" + WORKING_LIST[i].section + "</td>";
        text += "<td class='title_col'>" + WORKING_LIST[i].title + "</td>";
        text += "<td class='instructor_col'>" + WORKING_LIST[i].instructor + "</td>";
        text += "<td class='seats_col'>" + WORKING_LIST[i].filled + "/" + WORKING_LIST[i].seats + (WORKING_LIST[i].closed ? " (C)" : "") + "</td>";
        text += "<td class='class_no_col'>" + WORKING_LIST[i].class_no + "</td>";
        text += "<td class='credits_col'>" + 
                (WORKING_LIST[i].creditHoursInDoubt() ? SEE_PASS : 
                (WORKING_LIST[i].credits === 0 ? "" : WORKING_LIST[i].credits)) + "</td>";
        text += "<td class='meets_at_col'>" + WORKING_LIST[i]._meetsAt().toString() + "</td>";
        text += "</tr>";
        $("#section_body").append(text);
    }
    
    checkSectionsForConflicts();
    
    if ($("#closed").is(":checked")) {
        $("#section_body .closed_row").removeClass("hidden");
    }
    else {
        $("#section_body .closed_row").addClass("hidden");
    }
    
    if ($("#conflict").is(":checked")) {
        $(".conflict_row").removeClass("hidden");
    }
    else {
        $(".conflict_row").addClass("hidden");
    }
    
    $("#section_body tr").click(function(){
        $("#section_body tr").removeClass("sel_row");
        $("#section_body tr").removeClass("conflict_sel_row");
        
        if ($(this).hasClass("conflict_row"))
            $(this).addClass("conflict_sel_row");
        else
            $(this).addClass("sel_row");
    });
    $("#section_body tr").dblclick(function(){
        var u = WORKING_LIST[this.rowIndex-1];
        for (var j = 0; j < SCHEDULE.length; j ++) {
            if (u.class_no == SCHEDULE[j].class_no)
                return;
        }
        SCHEDULE.push(WORKING_LIST[this.rowIndex-1]);
        populateScheduleTable();
        populateSectionTable();
        populateShareBox();
        fillInPrintForm();
    });
}

function populateScheduleTable() {
    $("#schedule_body").html("");
    
    SCHEDULE = SCHEDULE.sort(sectionLessThan);
    
    var credits = 0;
    var credit_hours_in_doubt = false;
    
    for (var i = 0; i < SCHEDULE.length; i ++) {
        var doubt = SCHEDULE[i].creditHoursInDoubt();
        if (doubt)
            credit_hours_in_doubt = true;
        var text = "";
        if (SCHEDULE[i].closed)
            text += "<tr class='closed_row schedule_row'>";
        else
            text += "<tr class='schedule_row'>";
        text += "<td class='program_col'>" + SCHEDULE[i].program + "</td>";
        text += "<td class='cat_no_col'>" + SCHEDULE[i].catalog_no + "</td>";
        text += "<td class='section_col'>" + SCHEDULE[i].section + "</td>";
        text += "<td class='title_col'>" + SCHEDULE[i].title + "</td>";
        text += "<td class='instructor_col'>" + SCHEDULE[i].instructor + "</td>";
        text += "<td class='seats_col'>" + SCHEDULE[i].filled + "/" + SCHEDULE[i].seats + (SCHEDULE[i].closed ? " (C)" : "") + "</td>";
        text += "<td class='class_no_col'>" + SCHEDULE[i].class_no + "</td>";
        text += "<td class='credits_col'>" + (doubt ? SEE_PASS : (SCHEDULE[i].credits === 0 ? "" : SCHEDULE[i].credits)) + "</td>";
        text += "<td class='meets_at_col'>" + SCHEDULE[i]._meetsAt().toString() + "</td>";
        text += "</tr>";
        $("#schedule_body").append(text);
        credits += (SCHEDULE[i].credits > 0 ? SCHEDULE[i].credits : 0);
    }
    
    populateWeeklyView();
    checkForConflicts();
    
    $("#credits").val(credits);
    if (credit_hours_in_doubt)
        $("#credits").val(credits + " +");
    
    $("#schedule_body tr").click(function(){
        $("#schedule_body tr").removeClass("sel_row");
        $("#schedule_body tr").removeClass("conflict_sel_row");
        
        if ($(this).hasClass("conflict_row"))
            $(this).addClass("conflict_sel_row");
        else
            $(this).addClass("sel_row");
    });
    $("#schedule_body tr").dblclick(function(){
        SCHEDULE.splice(this.rowIndex-1, 1);
        populateScheduleTable();
        populateSectionTable();
        populateShareBox();
        fillInPrintForm();
    });
}

function populateWeeklyView() {
    $("#weekly_view_body").html("");
    var html = "";
    for (var i = 7; i < 18; i ++) {
        var str = "<tr>";
        str += "<td class='hour'>" + (i < 8 ? "Before 8" : (i > 16 ? "Evening" : (i > 12 ? (i-12) : i) + ":00")) + "</td>";
        str += "<td id=" + i + "su></td>";
        str += "<td id=" + i + "mo></td>";
        str += "<td id=" + i + "tu></td>";
        str += "<td id=" + i + "we></td>";
        str += "<td id=" + i + "th></td>";
        str += "<td id=" + i + "fr></td>";
        str += "<td id=" + i + "sa></td>";
        str += "</tr>";
        html += str;
    }
    $("#weekly_view_body").html(html);
    
    for (i = 0; i < SCHEDULE.length; i ++) {
        var sect = SCHEDULE[i];
        if (!sect._meetsAt().timeIsTBA()) {
            for (var j = 0; j < 7; j ++) {
                var start = sect._meetsAt().mtgHour(j);
                if (start != -1) {
                    var desc = sect.program + " " + sect.catalog_no + ":" + sect._meetsAt().mtgPlace(j);
                    var end = sect._meetsAt().mtgEndHour(j);
                    if (start <= end && end != -1) {
                        for (var hour = start; hour <= end; hour ++) {
                            var row = hour <=  7 ? 0
                                    : hour <= 16 ? hour - 7
                                    : 10;
                            var col = ((j+1) % 7) + 1;
                            var jq = "#weekly_view_body tr:eq(" + row + ") td:eq(" + col + ")";
                            var prev = $(jq).html();
                            if (prev !== "")
                                desc = prev + "; " + desc;
                            $(jq).html(desc);
                            
                            if (hour >= 17)
                                break;
                            if (hour <= 7)
                                hour = 7;
                        }
                    }
                }
            }
        }
    }
}

function populateShareBox() {
    var url = document.URL;
    var slash = url.indexOf("/", 7);
    url = url.substring(7,slash);
    $("#share_box").val(url + "/" + getShareLink());
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

function checkForConflicts() {
    checkSectionsForConflicts();
    checkScheduleForConflicts();
}

function checkSectionsForConflicts() {
    $("#section_list tr").removeClass("conflict_row");
    for (var i = 0; i < SCHEDULE.length; i ++) {
        for (var j = 0; j < WORKING_LIST.length; j ++) {
            if (SCHEDULE[i].conflictsWith(WORKING_LIST[j])) {
                var str = "#section_list tr:eq(" + (j+1) + ")";
                $(str).addClass("conflict_row");
                if ($(str).hasClass("sel_row")) {
                    $(str).removeClass("sel_row");
                    $(str).addClass("conflict_sel_row");
                }
            }
        }
    }
}

function checkScheduleForConflicts() {
    $("#schedule_list tr").removeClass("conflict_row");
    $("#conflict_label").removeClass("conflict_show");
    for (var i = 0; i < SCHEDULE.length; i ++) {
        for (var j = 0; j < SCHEDULE.length; j ++) {
            if (SCHEDULE[i].conflictsWithSansSelf(SCHEDULE[j])) {
                var str = "#schedule_list tr:eq(" + (i+1) + ")";
                $(str).addClass("conflict_row");
                $("#conflict_label").addClass("conflict_show");
                if ($(str).hasClass("sel_row")) {
                    $(str).removeClass("sel_row");
                    $(str).addClass("conflict_sel_row");
                }
            }
        }
    }
}
