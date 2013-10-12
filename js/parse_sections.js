// FILE:    meeting.js
// AUTHOR:  Christopher J. Wald
// DATE:    Oct 12, 2013
//
// DESC:    Parses the content of a class list into section classes.
//
// KNOWN DEPENDENCIES:
//          section.js

// List of sections.
var SECTIONS = [];

// Makes a Section out of each line of the class list.
function ParseSections(response) {
    console.log("Populating...");
    var lines = response.split("\n");
    var class_list_version = 0;
    
    // Parse the response into a list of all Sections.
    for (var i = 0; i < lines.length; i ++) {
        var line = lines[i];
        if (line.length === 0)
            continue;
        if (i === 0) {
            class_list_version = parseInt(line, 10);
            console.log("Class List Version: " + class_list_version);
        }
        else {
            SECTIONS.push(new Section(line));
        }
    }
    
    SECTIONS = SECTIONS.getUnique().sort(sectionLessThan);
}