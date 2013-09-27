var typingTimer;
var timeout = 200;

$(document).ready(function() {
    var search_exposed = false;
    $("#search_body").height(0);
    $("#search_body").addClass("hidden");
    
    $("#search_button").click(function() {
        if (search_exposed) {
            $("#search_body").animate({
                height: 0
            }, {done: function(){$("#search_body").addClass("hidden");}});
            search_exposed = false;
            $(document).focus();
        }
        else {
            $("#search_body").animate({
                height: 90
            }, {start: function(){$("#search_body").removeClass("hidden");}});
            search_exposed = true;
            $("#search_bar").focus();
        }
    });
    
    var search_opts = {empty_func: emptySearch, done_searching: doneSearching};
    
    $("#search_bar").on("input", function() {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(function() {Search(search_opts);}, timeout);
    });
    
    $("#search_body").css("top", -$("#search_body").height());
});

function emptySearch() {
    getProgramSections();
}

function doneSearching() {
    populateSectionTable();
}