$(document).ready(function() {
    var season = "Fall";
    var year = "2013";
    DownloadClassList(season, year, OnDone, {verbose: true, success_cb: OnSuccess, progress_cb: OnProgress, error_cb: OnError});
});
    
function OnDone(response) {
    ParseSections(response);
    
    $("#section_table_body").html("");
    for (var i = 0; i < SECTIONS.length; i ++) {
        var text = "";
        if (SECTIONS[i].closed)
            text += "<tr class='closed_row section_row'>";
        else
            text += "<tr class='section_row'>";
        text += "<td class='section_col'>" + SECTIONS[i].section + "</td>";
        text += "<td class='title_col'>" + SECTIONS[i].title + "</td>";
        text += "</tr>";
        $("#section_table_body").append(text);
    }
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