$(document).ready(function() {
    var menu_exposed = false;
    $("#menu_button").click(function(){
        $("#menu_body").height($(window).height()-$("#menu_bar").height());
        if (menu_exposed) {
            $("#menu_body").animate({
                top: -($("#menu_body").height())
            });
            menu_exposed = false;
            
            $("#section_table_body tr").click(function(){
                onSelectRow($(this));
            });
            
            $(".extra_content").click(function(){
                $(this).addClass("hidden");
            });
        }
        else {
            $("#menu_body").animate({
                top: parseInt($("#menu_bar").height(), 10)
            });
            menu_exposed = true;
            $("#section_table_body tr").unbind("click");
            $(".extra_content").unbind("click");
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