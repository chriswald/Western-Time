var typingTimer;
var timeout = 200;

$(document).ready(function() {
    var search_exposed = false;
    $("#search_body").addClass("hidden");
    
    $("#search_button").click(function() {
        if (search_exposed) {
            $("#search_body").slideUp();
            search_exposed = false;
            $(document).focus();
        }
        else {
            $("#search_body").slideDown();
            search_exposed = true;
            $("#search_bar").focus();
        }
    });
    
    $("#search_bar").on("input", function() {
        clearTimeout(typingTimer);
        var search_opts = {empty_func: emptySearch, done_searching: doneSearching};
        typingTimer = setTimeout(function() {Search(search_opts);}, timeout);
    });
    
});

function emptySearch() {
    getProgramSections();
}

function doneSearching() {
    populateSectionTable();
}