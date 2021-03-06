// FILE:    showpanel.js
// AUTHOR:  Christopher J. Wald
// DATE:    Oct 12, 2013
//
// DESC:    Contains methods pertaining to resizing the display and
//          moving the sidebar and sharebar.
//
// KNOWN DEPENDENCIES:
//          jQuery, index.php

// Track whether the sidebar is visible
var sidebar_showing = true;
// Track whether the sharebar is visible
var sharebar_showing = false;
// Track whether the display is small
var small = false;

$(document).ready(function() {
    sidebar_showing = true; // Should be true for release
    // Do the initial sizing on page load, then set up an event
    // listener that adjusts the content when the user resizes the
    // window.
    onResize();
    $(window).resize(onResize);
    $("#print_tab").click(showprint);
    $("#home_tab").click(showhome);
    $("#show_loc").click(populateWeeklyView);
});

// Handle the repositioning of elements as the user resizes the
// display.
function onResize() {
    var width = $(window).width();
    var height = $(window).height();
    // Set a minimum height. This should be about the height of the
    // sidebar.
    if (height < 500) height = 500;
    
    if (width < 1280) {
        small = true;
        
        if (sidebar_showing) {
            $("#sidebar").css("left", "0");
            $("#content").css("margin-left", "20px");
        }
        else {
            $("#sidebar").css("left", -($("#sidebar").width()));
            $("#content").css("margin-left", "20px");
        }
        $("#sidebar_btn").removeClass("hidden");
    }
    else {
        $("#sidebar").css("left", "0");
        $("#sidebar_btn").addClass("hidden");
        $("#content").css("margin-left", $("#sidebar").width() + 20);
    }
    
    // The height of the (minimized) sharebar and padding on either
    // end of #content.
    var stuff_around_content = 40; //px.
    $("#content").height((height-stuff_around_content) + "px");
    
    var schedule_height = height - ($("#information").position().top + $("#information").height()) - 52;
    $("#schedule_list").css("height", schedule_height + "px");
    $("#weekly_view").css("height", schedule_height + "px");
    
    // Minimize the sharebar
    var sharebar_height = $("#sharebar").height();
    $("#sharebar").css("top", -sharebar_height + "px");
    sharebar_showing = false;
}

// Toggles whether the sidebar is showing.
function toggleSidebar()
{
    if (sidebar_showing) {
        $("#sidebar").animate({
            left: -($("#sidebar").width())
        }, 100);
        sidebar_showing = false;
    }
    else {
        $("#sidebar").animate({
            left: 0
        }, 100);
        sidebar_showing = true;
    }
}

// Toggles whether the sharebar is showing.
function toggleSharebar()
{
    if (sharebar_showing) {
        $("#sharebar").animate({
            top: -($("#sharebar").height())
        }, 100);
        sharebar_showing = false;
    }
    else {
        $("#sharebar").animate({
            top: 0
        }, 100);
        sharebar_showing = true;
    }
}

// Shows the print controls.
function showprint() {
    $("#home_pane").addClass("hidden");
    $("#home_tab").removeClass("selected");
    $("#print_pane").removeClass("hidden");
    $("#print_tab").addClass("selected");
}

// Shows the general controls.
function showhome() {
    $("#home_pane").removeClass("hidden");
    $("#home_tab").addClass("selected");
    $("#print_pane").addClass("hidden");
    $("#print_tab").removeClass("selected");
}