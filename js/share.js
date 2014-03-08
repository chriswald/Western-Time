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
    var url = document.location.pathname;
    
    if (url.lastIndexOf("/") === url.length-1) {
        url = url.substring(0,url.lastIndexOf("/"));
    }
    url = url.substring(url.lastIndexOf("/") + 1);
    
    if (url !== "")
        console.log(url);
    else
        return;
    
    url = atob(url);
    
    // The beginning of the url is formatted <season><year>...
    // <season> is one character. <year> is 4.
    var svalue = url[0];
    url = url.substring(1);
    var yvalue = url.substring(0, 4);
    url = url.substring(4);
    
    console.log("Year: " + yvalue);
    console.log("Season: " + svalue);
    
    // Make sure the year is between 1999 (the first year with data) and next year (inclusive).
    if (parseInt(yvalue, 10) < 1999 || parseInt(yvalue, 10) > new Date().getFullYear()+1) {
        console.log("*** Year out of bounds.");
        return;
    }
    
    // Make sure the season value is between 0 (Winter) and 3 (Fall) (inclusive).
    if (parseInt(svalue, 10) < 0 || parseInt(svalue, 10) > 3) {
        console.log("*** Season out of bounds.");
        return;
    }
    
    // A class number is 4 characters long so check that the remaining url
    // length is a multiple of 4.
    if (url.length % 4 !== 0) {
        console.log("*** Bad URL length.");
        return;
    }
    
    // Clear the schedule. There shouldn't be anything in it, but just in case
    SCHEDULE.length = 0;
    
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