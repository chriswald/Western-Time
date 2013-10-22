function analytics(metrics) {
    $.post("analytics.php", {m: metrics});
}

var last_post = "";
function postSchedule() {
    if (SCHEDULE.length === 0)
        return;
        
    var str = get_season_value() + "," + get_year_value() + ",";
    for (var i = 0; i < SCHEDULE.length; i ++) {
        str += SCHEDULE[i].class_no + ",";
    }
    str = str.substring(0, str.length-1);
    
    if (str === last_post)
        return;
    last_post = str;
    $.post("analytics.php", {t:"c", m:str});
}