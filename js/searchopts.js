// FILE:    searchopts.js
// AUTHOR:  Christopher J. Wald
// DATE:    Oct 12, 2013
//
// DESC:    This file links with the search function, providing the
//          needed exit point functions and search options.
//
// KNOWN DEPENDENCIES:
//          jQuery, index.php, search.js

// Stores the typing timeout variable from setTimeout so that the
// timeout can be canceled or restarted.
var typingTimer;

// Length of time to wait between input changes. After this long
// execute a search.
var timeout = 200; //ms

$(document).ready(function() {
    // Functions to pass to Search for each branch.
    var search_opts  = {empty_func: emptySearch,
                        nempty_func: fullSearch, 
                        done_searching: doneSearching};
    
    // Using the "input" event covers keyboard input, copy, cut,
    // paste, word input from auto-complete keyboard (mobile
    // devices), and "Swype" input. Clear the typing timer and
    // restart it.
    $("#search_bar").on("input", function() {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(function() {Search(search_opts);}, timeout);
    });
    
    $("#program").change(function() {
        $("#search_bar").val("");
    })
    
    $("input:radio[name=college]").change(function() {
        $("#search_bar").val("");
    })
});

// Called if the search box is empty. Re-enables the program dropdown
// and college radio buttons, and repopulates the section table.
function emptySearch() {
    getProgramSections();
}

// Called if the search box is not empty. Diables the program
// dropdown and college radio buttons.
function fullSearch() {
    
}

// Always called at the end of the search. Populates the section
// table.
function doneSearching() {
    populateSectionTable();
}