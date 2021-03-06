// FILE:    populate.js
// AUTHOR:  Christopher J. Wald
// DATE:    Oct 12, 2013
//
// DESC:    Handles the main graphical area (eg the section table,
//          info bar, and schedule table).
//
// KNOWN DEPENDENCIES:
//          jQuery, index.php, meeting.js, section.js, share.js,
//          history.js, dl_classlist.js, parse_sections.js

// Arrays to hold the names of the programs that belong to each
// college.
var ems_prog = [], lae_prog = [], bilsa_prog = [], other_prog = [];

// Array to hold the Sections that are currently being displayed in
// the section list.
var WORKING_LIST = [];

// The user's schedule.
var SCHEDULE = [];

// Gets the selected season name from the radio buttons.
function get_season_value() {
    return $("input[name=season]:checked").val();
}

// Gets the selected year value from the dropdown.
function get_year_value() {
    return $("#year").find(":selected").text();
}

// Gets the selected program name from the dropdown.
function get_program_value() {
    var e = document.getElementById("program");
    if (e.selectedIndex < 0)
        return;
    
    return e.options[e.selectedIndex].value;
}

$(document).ready(function() {
    // Grab the year and season specified on the page (as opposed to
    // in the url)
    var year = get_year_value();
    var season = get_season_value();
    DownloadClassList(season, year, populate, {
        verbose: true,
        success_cb: OnSuccess,
        progress_cb: OnProgress,
        error_cb: OnError
    });
    
    // Hook up the Add and Remove buttons to their handlers.
    $("#add_section").click(function() {
        analytics("add_section_button");
        addSection();
    });
    $("#rem_section").click(function() {
        analytics("rem_section_button");
        removeSection();
    });
});

// Timeout variables connected to how long the class list download
// has been processing. If the timeout has been triggered show the
// download progress bar.
var loadTimer;
var loadTimer_called = false;
var loadTimeout = 500; //ms

// The class list download was successful. Clear the timeout and hide
// the download progress bar.
function OnSuccess() {
    clearTimeout(loadTimer);
    $("#progress_bar").addClass("hidden");
}

// Track the progress of the class list download. If it has been more
// than loadTimeout and is less than 80% done show the progress bar.
function OnProgress(evt) {
    if (evt.lengthComputable) {
        var percent = parseInt( (evt.loaded / evt.total * 100), 10);
        if (!loadTimer_called) {
            loadTimer = setTimeout(function() {
                if (percent < 80)
                    $("#progress_bar").removeClass("hidden");
            }, loadTimeout);
            loadTimer_called = true;
        }
        $("#progress").width(percent + "%");
    }
    else {
        console.log("Length not computable.");
    }
}

// Called when the download encounters an error. Clears the timeout
// and shows the progress bar with an error message.
function OnError() {
    clearTimeout(loadTimer);
    $("#progress_bar").removeClass("hidden");
    $("#progress").width("100%");
    $("#progress").css("background-color", "#e60000");
    $("#progress").css("cursor", "pointer");
    $("#progress").click(function() {location.reload();});
    $("#progress_error").removeClass("hidden");
}

// Does the initial setup for many different portions of the program.
// Parses the downloaded class list information into sections,
// parses the program names into appropriate colleges, opens files as
// appropriate, and enables elements that are turned off during the
// download for safety.
function populate(response) {
    ParseSections(response);
    
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
        var uploaded_file_contents = $("#uploaded_file_contents").html();
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
    populateShareBox();
    
    // These elements are disabled before the Sections are parsed because using
    // them could cause unpredictable results otherwise. Enable them now.
    $("#open_button").removeAttr("disabled");
    $("#save_button").removeAttr("disabled");
    $("#ddown_button").removeAttr("disabled");
    $("#print_button").removeAttr("disabled"); 
    $("#sharebar_btn").removeAttr("disabled");
    $("#search_bar").removeAttr("disabled");
    
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
        $("#weekly_view").addClass("hidden");
        
        $("#print_tab").addClass("hidden");
        $("#home_tab").css("margin-left", "57px");
        SCHEDULE = [];
        populateSectionTable();
        populateScheduleTable();
        populateWeeklyView();
        fillInPrintForm();
    }
    
    console.log("...Done");
}

// Fills the program dropdown with programs from the college selected
// in the radio buttons.
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

// Adds a row to the section table for every section in the working
// list, WORKING_LIST. Hooks up those rows with their event
// handlers.
function populateSectionTable() {
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
    
    if ($("#closed").is(":checked") && $("#conflict").is(":checked")) {
        $("#section_body .closed_row").removeClass("hidden");
        $("#section_body .conflict_row").removeClass("hidden");
    }
    else {
        if (!$("#closed").is(":checked")) {
            $("#section_body .closed_row").addClass("hidden");
        }
        if (!$("#conflict").is(":checked")) {
            $("#section_body .conflict_row").addClass("hidden");
        }
    }
    
    var last_selected;
    $("#section_body tr").click(function(e){
        last_selected = multiSelect(this, ".section_row", last_selected, e);
    });
    $("#section_body tr").dblclick(function() {
        analytics("add_section_dblclick");
        addSection();
    });
}

// Adds a row to the section table for every section in the user's
// schedule, SCHEDULE. Hooks up those rows with their event handlers.
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
    if (credit_hours_in_doubt) {
        $("#credits").val(credits + " +");
    }
    
    if ($("#closed").is(":checked") && $("#conflict").is(":checked")) {
        $("#section_body .closed_row").removeClass("hidden");
        $("#section_body .conflict_row").removeClass("hidden");
    }
    else {
        if (!$("#closed").is(":checked")) {
            $("#section_body .closed_row").addClass("hidden");
        }
        if (!$("#conflict").is(":checked")) {
            $("#section_body .conflict_row").addClass("hidden");
        }
    }
    
    var last_selected;
    $("#schedule_body tr").click(function(e){
        last_selected = multiSelect(this, ".schedule_row", last_selected, e);
    });
    $("#schedule_body tr").dblclick(function() {
        analytics("rem_section_dblclick");
        removeSection();
    });
}

// Fills a table with the classes from the user's schedule so the
// user can see when each class meets.
function populateWeeklyView() {
    $("#weekly_view_body").html("");
    var html = "";
    for (var i = 7; i < 18; i ++) {
        var str = "<tr>";
        str += "<td class='hour'>" + (i < 8 ? "Before 8" : (i > 16 ? "Evening" : (i > 12 ? (i-12) : i) + ":00")) + "</td>";
        //str += "<td id=" + i + "su></td>";
        str += "<td id=" + i + "mo></td>";
        str += "<td id=" + i + "tu></td>";
        str += "<td id=" + i + "we></td>";
        str += "<td id=" + i + "th></td>";
        str += "<td id=" + i + "fr></td>";
        //str += "<td id=" + i + "sa></td>";
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
                    var desc = sect.program + " " + sect.catalog_no;
                    if ($("#show_loc").is(":checked"))
                        desc += ":" + sect._meetsAt().mtgPlace(j);
                    var end = sect._meetsAt().mtgEndHour(j);
                    if (start <= end && end != -1) {
                        for (var hour = start; hour <= end; hour ++) {
                            var row = hour <=  7 ? 0
                                    : hour <= 16 ? hour - 7
                                    : 10;
                            //var col = ((j+1) % 7) + 1;
                            var col = ((j) % 7) + 1;
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

// Put the generated link in the share box if the user has any
// classes in SCHEDULE.
function populateShareBox() {
    var url = document.location.host;
    if (getShareLink() !== "")
        $("#share_box").val(url + "/" + getShareLink());
    else
        $("#share_box").val("");
    var goto = $("#share_box").val() === "" ? url : $("#share_box").val();
    $("#share_link").attr("href", document.location.protocol + "//" + goto);
}

// Allows selecting multiple sections at once with click, ctrl-click,
// shift-click, and ctrl-shift-click.
function multiSelect(that, rowClass, last_selected, e) {
    e.ctrlKey = (e.ctrlKey || e.metaKey);
    if (!e.ctrlKey)
        $(".sel_row").removeClass("sel_row");
    
    if (typeof last_selected !== "undefined") {
        var index, min, max, i;
        if (e.shiftKey && !e.ctrlKey) {
            index = $(rowClass).index(that);
            min = index < last_selected ? index : last_selected;
            max = index < last_selected ? last_selected : index;
            
            for (i = min; i <= max; i ++) {
                $(rowClass + ":eq(" + i + ")").addClass("sel_row");
            }
        }
        
        if (e.shiftKey && e.ctrlKey) {
            index = $(rowClass).index(that);
            min = index < last_selected ? index : last_selected+1;
            max = index < last_selected ? last_selected-1 : index;
            
            for (i = min; i <= max; i ++) {
                $(rowClass + ":eq(" + i + ")").toggleClass("sel_row");
            }
        }
    }
    
    if (!e.shiftKey) {
        if (e.ctrlKey)
            $(that).toggleClass("sel_row");
        else
            $(that).addClass("sel_row");
    }

    last_selected = $(rowClass).index(that);
    return last_selected;
}

// Checks all sections for conflicts with the user's schedule, and
// checks the user's schedule for any sections that conflict with
// each other.
function checkForConflicts() {
    checkSectionsForConflicts();
    checkScheduleForConflicts();
}

// Checks WORKING_LIST for conflicts with the user's schedule.
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

// Checks the user's schedule for sections that conflict with any
// other sections in the schedule.
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

// Adds one or more sections to the user's schedule based on rows
// in the section table that are selected.
function addSection() {
    for (var i = 0; i < $(".section_row.sel_row").length; i ++) {
        var index = $(".section_row").index($(".sel_row")[i]);
        if (index === -1) return;
        var u = WORKING_LIST[index];
        var can_add = true;
        for (var j = 0; j < SCHEDULE.length; j ++) {
            if (u.class_no == SCHEDULE[j].class_no)
                can_add = false;
        }
        if (can_add) {
            var cmd = new AddCommand(WORKING_LIST[index]);
            HISTORY.exec(cmd);
            analytics("add_section");
        }
    }
    
    populateScheduleTable();
    populateSectionTable();
    populateShareBox();
    fillInPrintForm();
}

// Removes one or more sections from the user's schedule based on
// rows in the schedule table that are selected.
function removeSection() {
    var indices = [];
    for (var i = 0; i < $(".schedule_row.sel_row").length; i ++) {
        var index = $(".schedule_row").index($(".sel_row")[i]);
        indices.push(index);
    }
    
    for (i = indices.length-1; i >= 0; i --) {
        var cmd = new RemCommand(SCHEDULE[indices[i]]);
        HISTORY.exec(cmd);
        analytics("rem_section");
    }
    
    populateScheduleTable();
    populateSectionTable();
    populateShareBox();
    fillInPrintForm();
}
