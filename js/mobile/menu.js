$(document).ready(function() {
    var menu_exposed = false;
    
    if (screen.width <= 320) {
        $(".icon").width("32px");
        $(".icon").height("32px");
    }
    
    $("#menu_body").height(0);
    $("#menu_body").addClass("hidden");
    
    $("#menu_button").click(function(){
        //$("#menu_body").height($(window).height()-$("#menu_bar").height());
        if (menu_exposed) {
            $("#menu_body").animate({
                height: 0,
                display: "none"
            }, {done: function(){$("#menu_body").addClass("hidden");}});
            menu_exposed = false;
        }
        else {
            $("#menu_body").animate({
                height: screen.height,
            }, {start: function(){$("#menu_body").removeClass("hidden");}});
            menu_exposed = true;
        }
    });
    
    $("#program_select").change(function() {
        getProgramSections();
        populateSectionTable();
        //$("#menu_button").click();
    });
    
    $("input[name='college']").change(function() {
        populateProgramSelect();
    });
    
    $("#menu_body").height($(window).height()-$("#menu_bar").height());
    $("#menu_body").css("top", -$("#menu_body").height());
});