// FILE:    meeting.js
// AUTHOR:  Christopher J. Wald
// DATE:    Oct 12, 2013
//
// DESC:    Handles showing and hiding the weekly view.
//
// KNOWN DEPENDENCIES:
//          jQuery, index.php

// Tracks whether the weekly view is showing.
var weekly_view_showing = false;
// Text for the button when the weekly view is in different states.
var show_weekly_str = "Show Weekly View";
var show_sched_str  = "Show Schedule List";

// Hook up events to show and hide the weekly view.
$(document).ready(function() {
    populateWeeklyView();
    $("#switch_view").click(function(){
        if (weekly_view_showing) {
            analytics("weekly_view_hide");
            weekly_view_showing = false;
            $("#schedule_list").removeClass("hidden");
            $("#weekly_view").addClass("hidden");
            $("#switch_view").html(show_weekly_str);
        }
        else {
            analytics("weekly_view_show");
            weekly_view_showing = true;
            $("#schedule_list").addClass("hidden");
            $("#weekly_view").removeClass("hidden");
            $("#switch_view").html(show_sched_str);
        }
    });
});