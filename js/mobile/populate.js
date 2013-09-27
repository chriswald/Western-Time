var ems_prog = [], lae_prog = [], bilsa_prog = [], other_prog = [];
var WORKING_LIST = [];

$(document).ready(function() {
    var season = $("#season").find(":selected").text();
    var year = $("#year").find(":selected").text();
    DownloadClassList(season, year, OnDone, {verbose: true, success_cb: OnSuccess, progress_cb: OnProgress, error_cb: OnError});
});
    
function OnDone(response) {
    ParseSections(response);
    
    // Push the names of every section's program to their corresponding list.
    for (var i = 0; i < SECTIONS.length; i ++) {
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
    
    var all_prog = [];
    all_prog = all_prog.concat(ems_prog);
    all_prog = all_prog.concat(lae_prog);
    all_prog = all_prog.concat(bilsa_prog);
    all_prog = all_prog.concat(other_prog);
    all_prog = all_prog.getUnique().sort();
    
    var options = "<option value='" + all_prog[0] + "' selected='selected'>" + all_prog[0] + "</option>";
    for (i = 1; i < all_prog.length; i ++) {
        options += "<option value='" + all_prog[i] + "'>" + all_prog[i] + "</option>";
    }
    $("#program_select").html(options);
    
    getProgramSections();
    populateSectionTable();
}

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

function populateSectionTable(list) {
    var to_use = list || WORKING_LIST;
    $("#section_table_body").html("");
    for (var i = 0; i < to_use.length; i ++) {
        var text = "";
        if (to_use[i].closed)
            text += "<tr class='closed_row section_row'>";
        else
            text += "<tr class='section_row'>";
        text += "<td class='section_col'>" + to_use[i].section + "</td>";
        text += "<td class='title_col'>" + to_use[i].title + "</td>";
        text += "</tr>";
        text += "<tr class='" + (to_use[i].closed?"closed_row ":"") + "extra_content hidden' id='" + to_use[i].class_no + "'>";
        text += "<td>More Info</td><td>";
        text += "<span class='extra_class'>" + to_use[i].program + " " + to_use[i].catalog_no + "</span>";
        text += "<span>&nbsp;-&nbsp;</span>";
        text += "<span class='extra_class_no'>" + to_use[i].class_no + "</span>";
        text += "<span>&nbsp;&nbsp;&nbsp;</span>";
        text += "<span class='extra_instructor'>" + to_use[i].instructor + "</span>";
        text += "<br/>";
        text += "<span class='extra_seats'>" + to_use[i].filled + "/" + to_use[i].seats + (to_use[i].closed ? " (C)" : "") + "</span>";
        text += "<span>&nbsp;&nbsp;&nbsp;</span>";
        text += "<span class='extra_credits'>";
        text += generateCredits(to_use[i]);
        text += "</span>";
        text += "<br/>";
        text += generateMeetingTimeTable(to_use[i]);
        text += "</td></tr>";
        $("#section_table_body").append(text);
    }
    
    $("#section_table_body tr").click(function(){
        onSelectRow($(this));
    });
    
    $(".extra_content").click(function(){
        $(this).addClass("hidden");
    });
}

function generateCredits(sec) {
    if (sec.creditHoursInDoubt())
        return "See PASS for credit information";
    if (sec.credits === 0)
        return "";
    if (sec.credits === 1)
        return "1 Credit";
    return sec.credits + " Credits";
}

function generateMeetingTimeTable(sec) {
    var text = "<table class='extra_meeting'><tbody>";
    
    //
    if (typeof sec._meetsAt().mtgDays !== "undefined")
        text += generateMeetingRow(sec._meetsAt());
    else {
        if (typeof sec._meetsAt().first !== "undefined" &&
            typeof sec._meetsAt().first.mtgDays !== "undefined")
            text += generateMeetingRow(sec._meetsAt().first);
        if (typeof sec._meetsAt().second !== "undefined" &&
            typeof sec._meetsAt().second.mtgDays !== "undefined")
            text += generateMeetingRow(sec._meetsAt().second);
    }
    
    if (typeof sec._meetsAt().mtgDays === "undefined" &&
        typeof sec._meetsAt().first === "undefined") {
        text += "<tr><td>" + sec._meetsAt().toStringSansSession() + "</td></tr>";
    }
    //
    
    text += "</tbody></table>";
    return text;
}

function generateMeetingRow(meeting) {
    var text = "<tr><td>";
    text += expandDays(meeting.mtgDays()).join("<br/>");
    text += "</td><td>";
    text += meeting.start.toString() + " - " + meeting.end.toString();
    text += "<br/>";
    text += meeting.place;
    text += "</td></tr>";
    return text;
}

function onSelectRow(that) {
    $(".sel_row").removeClass("sel_row");
    $(".extra_content").addClass("hidden");
    that.addClass("sel_row");
    var top = that.position().top - $("#menu_bar").height();
    $("html body").animate({
        scrollTop: top
    });
    var id = that.next().attr("id");
    $("#" + id).removeClass("hidden");
}

function populateProgramSelect() {
    $("#program_select").html("");
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
        $("#program_select").append(
            "<option value='" + programs[i] + "'>" + programs[i] + "</option>"
        );
    }
    $("#program_select").trigger('change');
}

function get_program_value() {
    var e = document.getElementById("program_select");
    if (e.selectedIndex < 0)
        return;
    
    return e.options[e.selectedIndex].value;
}

function getProgramSections() {
    var program = get_program_value();
    WORKING_LIST = [];
    for (var i = 0; i < SECTIONS.length; i ++) {
        if (SECTIONS[i].program == program)
            WORKING_LIST.push(SECTIONS[i]);
    }
}