var typingTimer;
var timeout = 200;

$(document).ready(function() {
    var search_exposed = false;
    $("#search_button").click(function() {
        if (search_exposed) {
            $("#search_body").animate({
                top: -($("#search_body").height())
            });
            search_exposed = false;
            $(document).focus();
        }
        else {
            $("#search_body").animate({
                top: parseInt($("#menu_bar").height(), 10)
            });
            search_exposed = true;
            $("#search_bar").focus();
        }
    });
    
    /*$("#search_bar").keydown(function() {
        clearTimeout(typingTimer);
    });
    $("#search_bar").keyup(function() {
        typingTimer = setTimeout(doneTyping, timeout);
    });*/
    $("#search_bar").on("input", function(evt) {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(doneTyping, timeout);
        //doneTyping($(this).val());
    });
    
    // doneTyping needs to be called after a short period of time so the DOM
    // can be updated before the function tries to read val()
    $("#search_bar").bind("paste", function() { setTimeout(doneTyping, timeout); });
    $("#search_bar").bind("cut", function() { setTimeout(doneTyping, timeout); });
    
    $("#search_body").css("top", -$("#search_body").height());
});

function doneTyping(val) {
    var search = val || $("#search_bar").val().toLowerCase();
    if (search.length === 0) {
        /*$("#program").removeAttr("disabled");
        $("#all").removeAttr("disabled");
        $("#ems").removeAttr("disabled");
        $("#lae").removeAttr("disabled");
        $("#bilsa").removeAttr("disabled");*/
        getProgramSections();
    }
    else {
        /*$("#program").attr("disabled", "true");
        $("#all").attr("disabled", "true");
        $("#ems").attr("disabled", "true");
        $("#lae").attr("disabled", "true");
        $("#bilsa").attr("disabled", "true");*/
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