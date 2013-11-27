$(document).ready(function() {
    var season = $("#season").find(":selected").text();
    var year = $("#year").find(":selected").text();
    DownloadClassList(season, year, OnDone, {verbose: true});
});

function OnDone(response) {
    ParseSections(response);
    decodeURL();
    
    populateDayView();
}

function getDay() {
    var d = new Date();
    return d.getDay();
}

function dayName(n) {
    switch (n) {
        case 0:
            return "Sunday";
        case 1:
            return "Monday";
        case 2:
            return "Tuesday";
        case 3:
            return "Wednesday";
        case 4:
            return "Thursday";
        case 5:
            return "Friday";
        case 6:
            return "Saturday";
    }
}

function populateDayView() {
    var day = getDay();
    if (day === 0 || day === 6) day = 1;
    
    $("#day_header").html(dayName(day));
    
    for (var i = 0; i < SCHEDULE.length; i ++) {
        var sect = SCHEDULE[i];
        if (!sect._meetsAt().timeIsTBA()) {
            var start = sect._meetsAt().mtgHour(day-1);
            if (start != -1) {
                
                var title, location, start_time;
                title = sect.title;
                            
                if (typeof sect._meetsAt().first !== "undefined") {
                    if (sect._meetsAt().first.mtgHour(day-1) !== -1) {
                        location = sect._meetsAt().first.place;
                        start_time = sect._meetsAt().first.start.toString();
                    }
                    else {
                        location = sect._meetsAt().second.place;
                        start_time = sect._meetsAt().second.start.toString();
                    }
                }
                else {
                    location = sect._meetsAt().place;
                    start_time = sect._meetsAt().start.toString();
                }
                
                var desc = title + "<br/>Location: " + location + "<br/>" + "Starts at: " + start_time;
                
                var end = sect._meetsAt().mtgEndHour(day-1);
                if (start <= end && end != -1) {
                    for (var hour = start; hour <= end; hour ++) {
                        var row = hour <=  7 ? 7
                                : hour <= 16 ? hour
                                : 17;
                        //var jq = "#weekly_view_body tr:eq(" + row + ") td:eq(" + col + ")";
                        var jq = "#" + row;
                        var prev = $(jq).html().replace(/^[\s]*/g, "").replace(/[\s]*$/g, "");
                        if (prev !== "")
                            desc = prev + "; " + desc;
                        $(jq).html(desc);
                        $(jq).parent().addClass("withClass");
                        
                        if (hour >= 17)
                            break;
                        if (hour <= 7)
                            hour = 7;
                    }
                }
            }
        }
    }
}