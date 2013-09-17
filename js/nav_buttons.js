$(document).ready(function() {
    $("#psem").click(prev_sem);
    $("#pterm").click(prev_term);
    $("#nterm").click(next_term);
    $("#nsem").click(next_sem);
});

function prev_sem()
{
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

function prev_term()
{
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

function next_term()
{
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

function next_sem()
{
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