var season, year;
var ems_prog = [], lae_prog = [], bilsa_prog = [], other_prog = [];
var WORKING_LIST = [];
var SCHEDULE = [];

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

$(document).ready(function() {
    // Grab the year and season specified on the page (as opposed to in the url)
    year = get_year_value();
    season = get_season_value();
    DownloadClassList(season, year, populate, {
        verbose: true,
        success_cb: OnSuccess,
        progress_cb: OnProgress,
        error_cb: OnError
    });
    
    $("#add_section").click(addSection);
    $("#rem_section").click(removeSection);
});

var loadTimeout;
var loadTimeout_called = false;

function OnSuccess() {
    clearTimeout(loadTimeout);
    $("#progress_bar").addClass("hidden");
}

function OnProgress(evt) {
    if (evt.lengthComputable) {
        var percent = parseInt( (evt.loaded / evt.total * 100), 10);
        if (!loadTimeout_called) {
            loadTimeout = setTimeout(function() {
                if (percent < 80)
                    $("#progress_bar").removeClass("hidden");
            }, 500);
            loadTimeout_called = true;
        }
        $("#progress").width(percent + "%");
    }
    else {
        console.log("Length not computable.");
    }
}

function OnError() {
    clearTimeout(loadTimeout);
    $("#progress_bar").removeClass("hidden");
    $("#progress").width("100%");
    $("#progress").css("background-color", "#e60000");
    $("#progress").css("cursor", "pointer");
    $("#progress").click(function() {location.reload();});
    $("#progress_error").removeClass("hidden");
}

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
        var uploaded_file_contents = $("#uploaded_file_contents").html().replace(/^\s/g, "").replace(/\s$/g, "");
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
    
    $("#section_body tr").click(function(e){
        if (!e.ctrlKey)
            $(".sel_row").removeClass("sel_row");
        
        $(this).addClass("sel_row");
    });
    $("#section_body tr").dblclick(addSection);
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
    
    $("#schedule_body tr").click(function(e){
        if (!e.ctrlKey)
            $(".sel_row").removeClass("sel_row");
        $(this).addClass("sel_row");
    });
    $("#schedule_body tr").dblclick(removeSection);
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
                    var desc = sect.program + " " + sect.catalog_no;
                    if ($("#show_loc").is(":checked"))
                        desc += ":" + sect._meetsAt().mtgPlace(j);
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
    var url = document.location.host;
    if (getShareLink() !== "")
        $("#share_box").val(url + "/" + getShareLink());
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
        if (can_add)
            SCHEDULE.push(WORKING_LIST[index]);
    }
    populateScheduleTable();
    populateSectionTable();
    populateShareBox();
    fillInPrintForm();
}

function removeSection() {
    var indices = [];
    for (var i = 0; i < $(".schedule_row.sel_row").length; i ++) {
        var index = $(".schedule_row").index($(".sel_row")[i]);
        indices.push(index);
    }
    
    for (i = indices.length-1; i >= 0; i --)
        SCHEDULE.splice(indices[i], 1);
        
    populateScheduleTable();
    populateSectionTable();
    populateShareBox();
    fillInPrintForm();
}
