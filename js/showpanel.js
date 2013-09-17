var sidebar_showing = true;
var sharebar_showing = false;
var small = false;
var sidebar_int;
var sharebar_int;

$(document).ready(function() {
    sidebar_showing = true; // Should be true for release
    // Do the initial sizing on page load, then set up an event listener that
    // adjusts the content when the user resizes the window.
    onResize();
    // The layout needs to be done again after the DOM is updated once for
    // accurate results in some fringe cases. This should go unnoticed.
    window.setTimeout(onResize, 10);
    $(window).resize(onResize);
});

function onResize() {
    var width = $(window).width();
    var height = $(window).height();
    // Set a minimum height. This should be about the height of the sidebar.
    if (height < 500) height = 500;
    // The height of the (minimized) sharebar and padding on either end.
    var stuff_around_content = 40; //px.
    $("#content").css("height", (height-stuff_around_content) + "px");
    
    var schedule_height = height - ($("#information").position().top + $("#information").height()) - 52;
    $("#schedule_list").css("height", schedule_height + "px");
    $("#weekly_view").css("height", schedule_height + "px");
    
    if (width < 1280) {
        small = true;
        
        if (sidebar_showing) {
            $("#sidebar").css("left", "0");
            $("#content").css("margin-left", "20px");
        }
        else {
            $("#sidebar").css("left", "-275px");
            $("#content").css("margin-left", "20px");
        }
        $("#sidebar_btn").removeClass("hidden");
    }
    else {
        $("#sidebar_btn").addClass("hidden");
        $("#content").css("margin-left", "295px");
    }
    
    var sharebar_height = $("#sharebar").height();
    $("#sharebar").css("top", -sharebar_height + "px");
}

function toggleSidebar()
{
    if (sidebar_showing)
        minimize();
    else
        maximize();
}

function toggleSharebar()
{
    if (sharebar_showing)
        minimize_share();
    else
        maximize_share();
}

function minimize()
{
    sidebar_int = setInterval(moveMin, 10);
}

function maximize()
{
    sidebar_int = setInterval(moveMax, 10);
}

function minimize_share()
{
    sharebar_int = setInterval(moveMinShare, 10);
}

function maximize_share()
{
    sharebar_int = setInterval(moveMaxShare, 10);
}

function moveMin() {
    var delta = -20;
    var loc_side = parseInt($("#sidebar").css("left"), 10);
    
    loc_side += delta;
    $("#sidebar").css("left", loc_side + "px");
    
    if (loc_side < -275) {
        clearInterval(sidebar_int);
        $("#sidebar").css("left", "-275px");
        sidebar_showing = false;
    }
}

function moveMax() {
    var delta = 20;
    var loc_side = parseInt($("#sidebar").css("left"), 10);
    
    loc_side += delta;
    $("#sidebar").css("left", loc_side + "px");
    
    if (loc_side > 0) {
        clearInterval(sidebar_int);
        $("#sidebar").css("left", "0");
        sidebar_showing = true;
    }
}

function moveMinShare() {
    var delta = -20;
    var loc_share = parseInt($("#sharebar").css("top"), 10);
    
    loc_share += delta;

    $("#sharebar").css("top", loc_share + "px");
    
    if (loc_share < -($("#sharebar").height())) {
        clearInterval(sharebar_int);
        $("#sharebar").css("top", -($("#sharebar").height()));
        sharebar_showing = false;
    }
}

function moveMaxShare() {
    var delta = 20;
    var loc_share = parseInt($("#sharebar").css("top"), 10);
    
    loc_share += delta;

    $("#sharebar").css("top", loc_share + "px");
    
    if (loc_share > 0) {
        clearInterval(sharebar_int);
        $("#sharebar").css("top", "0px");
        sharebar_showing = true;
    }
}