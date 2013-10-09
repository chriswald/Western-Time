$(document).ready(function() {
    $("#open_button").click(function() {$("#openfile").click();});
    if (window.FileReader)
        $("#openfile").change(handleFileLoad);
    else
        $("#openfile").change(function() { $("#submitfileupload").click(); });
    $("#save_button").click(saveFile);
    $("#ddown_button").click(toggleDrop);
    $("#export_ical").click(exportICAL);
    $("#export_csv").click(exportCSV);
    $("html").click(function() {$("#export_list").addClass("hidden");});
});

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function handleFileLoad(evt)
{
    var files = evt.target.files;
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

function ReadFileContents(e) {
    var contents = e.target.result;
    ParseFile(contents);
}

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
            var tokens = lines[i].split(" ");
            sects.push(new Section({program: tokens[0], catalog_no: tokens[1], section: tokens[2], incomplete: true}, 1));
        }
    }
    SCHEDULE = sects;
    populateShareBox();
    populateScheduleTable();
    fillInPrintForm();
}

function saveFile() {
    var filename = get_season_value() + get_year_value() + ".sch";
    var content = $("#name").val() + "\n";
    content += $("#pin").val() + "\n";
    for (var i = 0; i < SCHEDULE.length; i ++)
        content += SCHEDULE[i].toString() + "\n";
    sendFileForSave(filename, content);
}

function sendFileForSave(filename, fileContents) {
    var fcontent = btoa(filename + "\n" + fileContents);
    $("#contents").val(fcontent);
    $("#submit").click();
}

function toggleDrop(event) {
    $("#export_list").toggleClass("hidden");
    event.stopPropagation();
}

function exportICAL() {
    var filename = get_season_value() + get_year_value() + ".ics";
    var content = "";
    
    $.ajax({
        url: "res/semester_days.txt",
        success: function(response) {
            var lines = response.split("\n");
            var startd, endd;
            for (var i = 0; i < lines.length; i ++) {
                var tokens = lines[i].split(",");
                if (tokens[0] == season+year) {
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

function exportCSV() {
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