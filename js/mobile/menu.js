$(document).ready(function() {
    var menu_exposed = false;
    
    if (screen.width <= 320) {
        $(".icon").width("32px");
        $(".icon").height("32px");
    }
    
    $("#menu_body").height(0);
    $("#menu_body").addClass("hidden");
    
    $("#menu_button").click(function(){
        
        if (menu_exposed) {
            $("#menu_body").animate({
                height: 0
            }, {done: function(){$("#menu_body").addClass("hidden");}});
            menu_exposed = false;
        }
        else {
            $("#menu_body").animate({
                height: 500,
                scrollTo: 0
            }, {start: function(){$("#menu_body").removeClass("hidden");}});
            menu_exposed = true;
        }
    });
    
    $("#program_select").change(function() {
        getProgramSections();
        populateSectionTable();
    });
    
    $("input[name='college']").change(function() {
        populateProgramSelect();
    });
    
    $("#menu_body").height($(window).height()-$("#menu_bar").height());
    $("#menu_body").css("top", -$("#menu_body").height());
});