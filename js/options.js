$(document).ready(function(){
    $("#subject").change(function(){
        getProgramSections();
        populateSectionTable();
    });
    $("#subject").keyup(function(){
        getProgramSections();
        populateSectionTable();
    });
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
    
    $("#conflict").change(function(){
        var val = $("#conflict").is(":checked");
        if (val) {
            $(".conflict_row").removeClass("hidden");
        }
        else {
            $(".conflict_row").addClass("hidden");
        }
    });
    $("#closed").change(function(){
        var val = $("#closed").is(":checked");
        if (val) {
            $("#section_body .closed_row").removeClass("hidden");
        }
        else {
            $("#section_body .closed_row").addClass("hidden");
        }
    });
});