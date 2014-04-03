// FILE:    file.js
// AUTHOR:  Christopher J. Wald
// DATE:    Oct 12, 2013
//
// DESC:    Handles saving the user's schedule as .sch, .ics, and
//          .csv. Allows the user to open schedule files.
//
// KNOWN DEPENDENCIES:
//          jQuery, index.php, save.php

// Hooks up events.
$(document).ready(function() {
    $("#open_button").click(function() {
        analytics("open_file");
        $("#openfile").click();
    });
    // If the browser supports FileReader then we can use that. If
    // not the file needs to be uploaded to the server, which means
    // that it gets read by php and the text gets inserted into the
    // returned html.
    if (window.FileReader)
        $("#openfile").change(function(evt) {
            analytics("file_reader_yes");
            handleFileLoad(evt);
        });
    else
        $("#openfile").change(function() {
            analytics("file_reader_no");
            $("#submitfileupload").click();
        });
    
    $("#save_button").click(saveFile);
    $("#ddown_button").click(toggleDrop);
    $("#export_ical").click(exportICAL);
    $("#export_csv").click(exportCSV);
    $("html").click(function() {$("#export_list").addClass("hidden");});
});

// Adds a function to String to check if a string ends with a suffix.
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// Called when a file is uploaded and FileReader is available. Checks
// for validity and sends to the parser.
function handleFileLoad(evt)
{
    var files = evt.target.files || evt.dataTransfer.files;
    for (var i = 0; i < files.length; i ++) {
        var f = files[i];
        if (!f.name.endsWith(".sch")){
            console.log("Bad file type: " + f.name);
            return;
        }
        
        if (window.FileReader) {
            console.log("Reading file.");
            var reader = new FileReader();
            reader.onload = ReadFileContents;
            reader.readAsText(f);
        }
    }
}

// Gets the contens of the file and sends to the parser.
function ReadFileContents(e) {
    var contents = e.target.result;
    ParseFile(contents);
}

// Parses a schedule file's contents for a name and pin, and tries to
// match the sections found with those available in SECTIONS and add
// them to SCHEDULE.
function ParseFile(e) {
    var lines = e.split("\n");
    $("#name").val(lines[0]);
    $("#pin").val(lines[1]);
    
    var sects = [];
    for (var i = 2; i < lines.length; i ++) {
        var found = false;
        if (lines[i].length === 0)
            continue;
            
        tokens = lines[i].split(" ");
        var prog = tokens[0];
        var cat_no = parseInt(tokens[1], 10);
        var sec = tokens[2];
        
        for (var j = 0; j < SECTIONS.length; j ++) {
            if (cat_no == SECTIONS[j].catalog_no
                 && prog == SECTIONS[j].program
                 && sec == SECTIONS[j].section) {
                sects.push(SECTIONS[j]);
                found = true;
            }
        }
        if (!found) {
            analytics("unfound_class");
            var tokens = lines[i].split(" ");
            sects.push(new Section({program: tokens[0], catalog_no: tokens[1], section: tokens[2], incomplete: true}, 1));
        }
    }
    SCHEDULE = sects;
    HISTORY.undo_stack.length = 0;
    HISTORY.redo_stack.length = 0;
    HISTORY.populate();
    populateShareBox();
    populateScheduleTable();
    fillInPrintForm();
}

// Generates the contents of a schedule file and sends it for saving.
function saveFile() {
    analytics("save_sch");
    var filename = get_season_value() + get_year_value() + ".sch";
    var content = $("#name").val() + "\n";
    content += $("#pin").val() + "\n";
    for (var i = 0; i < SCHEDULE.length; i ++)
        content += SCHEDULE[i].toString() + "\n";
    sendFileForSave(filename, content);
}

// Sends file contents to the server to be made available for user
// download.
function sendFileForSave(filename, fileContents) {
    var fcontent = btoa(filename + "\n" + fileContents);
    $("#contents").val(fcontent);
    $("#submit").click();
}

// Toggles the "extra save options" dropdown.
function toggleDrop(event) {
    analytics("save_dropdown_toggle");
    $("#export_list").toggleClass("hidden");
    event.stopPropagation();
}

// Creates an iCal file out of the user's schedule and sends it to
// the server to be made available for download.
function exportICAL() {
    var filename = get_season_value() + get_year_value() + ".ics";
    var content = "";
    
    $.ajax({
        url: "res/semester_days.txt",
        success: function(response) {
            analytics("save_ics");
            var lines = response.split("\n");
            var startd, endd;
            for (var i = 0; i < lines.length; i ++) {
                var tokens = lines[i].split(",");
                if (tokens[0] == get_season_value()+get_year_value()) {
                    startd = _Date(tokens[1], tokens[2], tokens[3]);
                    endd = _Date(tokens[4], tokens[5], tokens[6]);
                    break;
                }
            }
            
            var evGen = new EventGenerator(startd, endd);
            var text = evGen.preamble();
            for (var j = 0; j < SCHEDULE.length; j ++) {
                text += SCHEDULE[j].toICal(evGen);
            }
            text += evGen.postlude();
            sendFileForSave(filename, text);
        }
    });
}

// Creates a comma seperated values file out of the user's schedule
// and sends it to the server to be made available for download.
function exportCSV() {
    analytics("save_csv");
    var filename = get_season_value() + get_year_value() + ".csv";
    var date = new Date();
    var content = "Report Date: " + (date.getMonth() + 1) + "/" + date.getUTCDate() + "/" + date.getFullYear() + "\n";
    content += "Subject,Catalog Number,Section,Title,Seats,Filled,Closed,Credits,Class #,Instructor,Time,Location" + "\n";
    for (var i = 0; i < SCHEDULE.length; i ++) {
        content += SCHEDULE[i].program + ",";
        content += SCHEDULE[i].catalog_no + ",";
        content += SCHEDULE[i].section + ",";
        content += "\"" + SCHEDULE[i].title + "\",";
        content += SCHEDULE[i].seats + ",";
        content += SCHEDULE[i].filled + ",";
        content += SCHEDULE[i].closed + ",";
        content += SCHEDULE[i].credits + ",";
        content += SCHEDULE[i].class_no + ",";
        content += "\"" + SCHEDULE[i].instructor + "\",";
        content += "\"" + SCHEDULE[i]._meetsAt().times() + "\",";
        content += "\"" + SCHEDULE[i]._meetsAt().locations() + "\"\n";
    }
    console.log(content);
    sendFileForSave(filename, content);
}