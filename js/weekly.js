var weekly_view_showing = false;
var show_weekly_str = "Show Weekly View";
var show_sched_str  = "Show Schedule List";

$(document).ready(function() {
    populateWeeklyView();
    $("#switch_view").click(function(){
        if (weekly_view_showing) {
            weekly_view_showing = false;
            $("#schedule_list").removeClass("hidden");
            $("#weekly_view").addClass("hidden");
            $("#switch_view").html(show_weekly_str);
        }
        else {
            weekly_view_showing = true;
            $("#schedule_list").addClass("hidden");
            $("#weekly_view").removeClass("hidden");
            $("#switch_view").html(show_sched_str);
        }
    });
});