function decodeURL() {
    var url = document.URL;
    while (url.indexOf("/") !== -1)
        url = url.substring(url.indexOf("/")+1);
    if (url.indexOf("index.php") !== -1)
        url = url.substring(url.indexOf("index.php") + "index.php".length);
    if (url.indexOf("?") !== -1)
        url = url.substring(0, url.indexOf("?"));
    if (url !== "")
        console.log(url);
    
    if (url === "")
        return;
    
    url = atob(url);
    
    var svalue = url[0];
    url = url.substring(1);
    var yvalue = url.substring(0, 4);
    url = url.substring(4);
    
    console.log("Year: " + yvalue);
    console.log("Season: " + svalue);
    
    SCHEDULE = [];
    
    while (url.length >= 4) {
        var token = url.substring(0,4);
        url = url.substring(4);
        for (var i = 0; i < SECTIONS.length; i ++) {
            if (SECTIONS[i].class_no == token)
                SCHEDULE.push(SECTIONS[i]);
        }
    }
    
    $("#switch_view").click();
}

function getShareLink() {
    if (SCHEDULE.length === 0)
        return "";
    
    var season = $("input[name=season]:checked").val();
    var svalue = "0";
    if (season == "Spring")
        svalue = "1";
    else if (season == "Summer")
        svalue = "2";
    else if (season == "Fall")
        svalue = "3";
    
    var year = $("#year").find(":selected").val();
    var yvalue = "" + year;
    
    var text = svalue + yvalue;
    for (var i = 0; i < SCHEDULE.length; i ++)
        text += SCHEDULE[i].class_no;
    return btoa(text);
}