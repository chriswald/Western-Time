// FILE:    decode.js
// AUTHOR:  Christopher J. Wald
// DATE:    Oct 12, 2013
//
// DESC:    Methods for generating a link to a schedule and
//          decrypting a URL for parsing as a schedule.
//
// KNOWN DEPENDENCIES:
//          jQuery, index.php, populate.js, section.js

// Decodes a portion of a URL for year and season info and builds a
// schedule out of the the information it gets. The URL fragment
// should follow these rules:
//  1) The fragment should be base64 encoded.
//  2) The fragment should follow the first / after the domain name.
//  3) Before base64 encoding the fragment should follow this form:
//     <season><year><class_no[0]><class_no[1]>...<class_no[n]>
//     were season matches /(Spring|Summer|Fall|Winter)/, year is a
//     4 digit number >= 1999, and class_no[k] is a 4 digit class_no
//     for a section.
function decodeURL() {
    var url = document.URL;
    
    // The url must be in the form page.php?var=value
    if (url.lastIndexOf("?") !== -1) {
        url = url.substring(url.lastIndexOf("?") + 1);
        url = url.substring(url.indexOf("=") + 1);
    }
    // The url must be in the form /page/value
    else {
        url = url.substring(url.lastIndexOf("/") + 1);
    }
    
    // If there is no url left or the remaining url
    // is a document just return.
    if (url !== "" || url.indexOf(".") !== -1)
        console.log(url);
    else
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
    
    analytics("share_link_schedule");
    $("#switch_view").click();
}

// Builds a base64 encoded fragment out of the user's schedule if
// the schedule's length >0. See comments above for rules on building
// the fragment.
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