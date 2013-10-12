// FILE:    options.js
// AUTHOR:  Christopher J. Wald
// DATE:    Oct 12, 2013
//
// ABOUT:   This file handles everthing relating to the Program
//          dropdown, the program filtering radio buttons, and the
//          section filtering checkboxes.
//
// KNOWN DEPENDENCIES:
//          jQuery, index.php, populate.js

$(document).ready(function(){
    // When the user selects a new program show the sections from
    // that program.
    $("#program").change(function(){
        getProgramSections();
        populateSectionTable();
    });
    $("#program").keyup(function(){
        getProgramSections();
        populateSectionTable();
    });
    
    // Show only the programs that belong to the selected college.
    $("#all").change(function(){
        populateProgramCombo();
    });
    $("#ems").change(function(){
        populateProgramCombo();
    });
    $("#lae").change(function(){
        populateProgramCombo();
    });
    $("#bilsa").change(function(){
        populateProgramCombo();
    });
    
    // If the conflict checkbox is checked hide all sections that
    // conflict a section in the user's schedule.
    $("#conflict").change(function(){
        if ($("#conflict").is(":checked")) {
            $(".conflict_row").removeClass("hidden");
        }
        else {
            $(".conflict_row").addClass("hidden");
        }
    });
    
    // If the closed checkbox is checked hide all the sections that
    // are closed.
    $("#closed").change(function(){
        if ($("#closed").is(":checked")) {
            $("#section_body .closed_row").removeClass("hidden");
        }
        else {
            $("#section_body .closed_row").addClass("hidden");
        }
    });
});