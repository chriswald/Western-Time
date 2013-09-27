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