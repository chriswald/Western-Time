$(document).ready(function() {
    var menu_exposed = false;
    $("#menu_button").click(function(){
        $("#menu_body").height($(window).height()-$("#menu_bar").height());
        if (menu_exposed) {
            $("#menu_body").animate({
                top: -($("#menu_body").height())
            });
            menu_exposed = false;
        }
        else {
            $("#menu_body").animate({
                top: parseInt($("#menu_bar").height(), 10)
            });
            menu_exposed = true;
        }
    });
    
    $("#program_select").change(function() {
        getProgramSections();
        populateSectionTable();
        $("#menu_button").click();
    });
    
    $("#menu_body").height($(window).height()-$("#menu_bar").height());
    $("#menu_body").css("top", -$("#menu_body").height());
});

$(document).resize(function(evt) {
    $("menu_content").html($(window).width() + " by " + $(window).height());
});