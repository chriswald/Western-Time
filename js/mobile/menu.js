$(document).ready(function() {
    if (screen.width <= 320) {
        $(".icon").width("32px");
        $(".icon").height("32px");
    }
    
    $("#menu_body").addClass("hidden");
    
    $("#menu_button").click(function(){
        $("#menu_body").slideToggle();
    });
    
    $("#program_select").change(function() {
        getProgramSections();
        populateSectionTable();
    });
    
    $("input[name='college']").change(function() {
        populateProgramSelect();
    });
});
