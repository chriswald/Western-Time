// FILE:    print.js
// AUTHOR:  Christopher J. Wald
// DATE:    Oct 12, 2013
//
// DESC:    Handles all printing (on dead trees) routines.
//
// KNOWN DEPENDENCIES:
//          jQuery, index.php, section.js

// Hooks up event handlers.
$(document).ready(function() {
    $("#print_button").click(function(){
        analytics("print_button");
        postSchedule();
        fillInPrintForm();
        print();
    });
});

// Fill in the print form with all the required information.
function fillInPrintForm() {
    fillInStudentInfo();
    fillInNewStudentRegistration();
    fillInWeeklyTable();
    fillInScheduleList();
    fillInCredits();
}

// Get the student name and pin from the input boxes and copy them.
function fillInStudentInfo() {
    if ($("#name").val() !== "")
        analytics("provided_user_name");
    if ($("#pin").val() !== "")
        analytics("provided_user_pin");
    
    $("#stud_name").html($("#name").val());
    $("#stud_pin").html($("#pin").val());
}

// If this is to be used for new student registration print a message
// near the top of the form.
function fillInNewStudentRegistration() {
    if ($("#new_student").is(":checked")) {
        analytics("new_student_registration");
        $("#new_student_message").html(
            "Use this worksheet to create a schedule and then copy the class" + 
            " information to your registration card.<br/>" + 
            "BE SURE to get an advisor's signature on this form. Bring both" + 
            " this form AND your card to the registration terminal!"
            );
    }
}

// Copy the weekly view table to the document.
function fillInWeeklyTable() {
    $("#weekly_table").html($("#weekly_view").html());
}

// Fill out a table with the desired info from the user's schedule.
function fillInScheduleList() {
    var output = "";
    for (var i = 0; i < SCHEDULE.length; i ++) {
        var str = "<tr>";
        str += "<td>" + SCHEDULE[i].program + "</td>";
        str += "<td>" + SCHEDULE[i].catalog_no + "</td>";
        str += "<td>" + SCHEDULE[i].section + "</td>";
        str += "<td>" + SCHEDULE[i].class_no + "</td>";
        str += "<td>" + SCHEDULE[i].title + "</td>";
        str += "<td>" + 
                (SCHEDULE[i].creditHoursInDoubt() ? 
                    SEE_PASS : 
                    (SCHEDULE[i].credits === 0 ? "" : SCHEDULE[i].credits))
                + "</td>";
        str += "</tr>";
        output += str;
    }
    
    $("#schedule_list_body").html(output);
}

// Copy the number of credits to the document.
function fillInCredits() {
    $("#total_credits").html("Total Credits: " + $("#credits").val());
}