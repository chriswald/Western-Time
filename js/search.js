var typingTimer;
var timeout = 200;

$(document).ready(function() {
    $("#search_box").keydown(function() {
        clearTimeout(typingTimer);
    });
    $("#search_box").keyup(function() {
        typingTimer = setTimeout(doneTyping, timeout);
    });
    
    // doneTyping needs to be called after a short period of time so the DOM
    // can be updated before the function tries to read val()
    $("#search_box").bind("paste", function() { setTimeout(doneTyping, timeout); });
    $("#search_box").bind("cut", function() { setTimeout(doneTyping, timeout); });
});

function doneTyping() {
    var search = $("#search_box").val().toLowerCase();
    if (search.length === 0) {
        $("#program").removeAttr("disabled");
        $("#all").removeAttr("disabled");
        $("#ems").removeAttr("disabled");
        $("#lae").removeAttr("disabled");
        $("#bilsa").removeAttr("disabled");
        getProgramSections();
    }
    else {
        $("#program").attr("disabled", "true");
        $("#all").attr("disabled", "true");
        $("#ems").attr("disabled", "true");
        $("#lae").attr("disabled", "true");
        $("#bilsa").attr("disabled", "true");
        var tokens = search.splitQuoted(" ", "\"");
        var results = [];
        for (var i = 0; i < SECTIONS.length; i ++) {
            var section = SECTIONS[i];
            var include = false;
            var str = section.program + " " + section.catalog_no + " " +
                      section.section + " " + section.title + " " +
                      section.instructor + " " + section.class_no + " " +
                      section.credits + " " + 
                      section.seats + "/" + section.filled + " " +
                      section._meetsAt().toString();
            for (var j = 0; j < tokens.length; j ++) {
                if (tokens[j] !== "\"" && str.toLowerCase().indexOf(tokens[j]) != -1)
                    include = true;
                else {
                    include = false;
                    break;
                }
            }
            if (include)
                results.push(section);
        }
        
        results.sort(sectionLessThan);
        WORKING_LIST = results;
    }
    populateSectionTable();
}