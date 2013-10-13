// FILE:    nav_buttons.js
// AUTHOR:  Christopher J. Wald
// DATE:    Oct 12, 2013
//
// DESC:    Handles changing semester with the navigation buttons.
//
// KNOWN DEPENDENCIES:
//          jQuery, index.php

// Hooks up events.
$(document).ready(function() {
    $("#psem").click(prev_sem);
    $("#pterm").click(prev_term);
    $("#nterm").click(next_term);
    $("#nsem").click(next_sem);
});

// Selects the previous fall or spring semester, changing year as
// required.
function prev_sem()
{
    analytics("prev_sem_button");
    if ($("#Fall").is(":checked") || $("#Summer").is(":checked"))
        $("#Spring").prop("checked", true);
    else
    {
        var e = document.getElementById("year");
        var index = e.selectedIndex;
        if (index < e.options.length - 1)
        {
            e.selectedIndex ++;
            $("#Fall").prop("checked", true);
        }
    }
}

// Selects the previous term, changing year as required.
function prev_term()
{
    analytics("prev_term_button");
    if ($("#Fall").is(":checked"))
        $("#Summer").prop("checked", true);
    else if ($("#Summer").is(":checked"))
        $("#Spring").prop("checked", true);
    else if ($("#Spring").is(":checked"))
        $("#Winter").prop("checked", true);
    else
    {
        var e = document.getElementById("year");
        var index = e.selectedIndex;
        if (index < e.options.length - 1)
        {
            e.selectedIndex ++;
            $("#Fall").prop("checked", true);
        }
    }
}

// Selects the next term, changing year as required.
function next_term()
{
    analytics("next_term_button");
    if ($("#Winter").is(":checked"))
        $("#Spring").prop("checked", true);
    else if ($("#Spring").is(":checked"))
        $("#Summer").prop("checked", true);
    else if ($("#Summer").is(":checked"))
        $("#Fall").prop("checked", true);
    else
    {
        var e = document.getElementById("year");
        var index = e.selectedIndex;
        if (index > 0)
        {
            e.selectedIndex --;
            $("#Winter").prop("checked", true);
        }
    }
}

// Selects the next fall or spring semester, changing year as
// required.
function next_sem()
{
    analytics("next_sem_button");
    if ($("#Spring").is(":checked") || $("#Summer").is(":checked"))
        $("#Fall").prop("checked", true);
    else
    {
        var e = document.getElementById("year");
        var index = e.selectedIndex;
        if (index > 0)
        {
            e.selectedIndex --;
            $("#Spring").prop("checked", true);
        }
    }
}