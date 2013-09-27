var typingTimer;
var timeout = 200;

$(document).ready(function() {
    var search_opts = {empty_func: emptySearch, nempty_func: fullSearch, done_searching: doneSearching};
    
    $("#search_bar").on("input", function() {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(function() {Search(search_opts);}, timeout);
    });
    
    $("#search_body").css("top", -$("#search_body").height());
});

function emptySearch() {
    $("#program").removeAttr("disabled");
    $("#all").removeAttr("disabled");
    $("#ems").removeAttr("disabled");
    $("#lae").removeAttr("disabled");
    $("#bilsa").removeAttr("disabled");
    getProgramSections();
}

function fullSearch() {
    $("#program").attr("disabled", "disabled");
    $("#all").attr("disabled", "disabled");
    $("#ems").attr("disabled", "disabled");
    $("#lae").attr("disabled", "disabled");
    $("#bilsa").attr("disabled", "disabled");
}

function doneSearching() {
    populateSectionTable();
}