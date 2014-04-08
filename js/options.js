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
        analytics("program_change");
        $("#section_list").scrollTop(0);
        getProgramSections();
        populateSectionTable();
    });
    $("#program").keyup(function(){
        analytics("program_change");
        $("#section_list").scrollTop(0);
        getProgramSections();
        populateSectionTable();
    });
    
    // Show only the programs that belong to the selected college.
    $("#all").change(function(){
        analytics("all_radio");
        $("#section_list").scrollTop(0);
        populateProgramCombo();
    });
    $("#ems").change(function(){
        analytics("ems_radio");
        $("#section_list").scrollTop(0);
        populateProgramCombo();
    });
    $("#lae").change(function(){
        analytics("lae_radio");
        $("#section_list").scrollTop(0);
        populateProgramCombo();
    });
    $("#bilsa").change(function(){
        analytics("bilsa_radio");
        $("#section_list").scrollTop(0);
        populateProgramCombo();
    });
    
    // If the conflict checkbox is checked hide all sections that
    // conflict a section in the user's schedule.
    $("#conflict").change(function(){
        if ($("#conflict").is(":checked")) {
            analytics("conflicts_show");
            $("#section_body .conflict_row").removeClass("hidden");
        }
        else {
            analytics("conflicts_hide");
            $("#section_body .conflict_row").addClass("hidden");
        }
    });
    
    // If the closed checkbox is checked hide all the sections that
    // are closed.
    $("#closed").change(function(){
        if ($("#closed").is(":checked")) {
            analytics("closed_show");
            $("#section_body .closed_row").removeClass("hidden");
        }
        else {
            analytics("closed_hide");
            $("#section_body .closed_row").addClass("hidden");
        }
    });
});