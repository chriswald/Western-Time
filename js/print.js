$(document).ready(function() {
    $("#print_button").click(function(){
        fillInPrintForm();
        print();
    });
});

function fillInPrintForm() {
    fillInStudentInfo();
    fillInWeeklyTable();
    fillInScheduleList();
    fillInCredits();
}

function fillInStudentInfo() {
    $("#stud_name").html($("#name").val());
    $("#stud_pin").html($("#pin").val());
}

function fillInWeeklyTable() {
    $("#weekly_table").html($("#weekly_view").html());
}

function fillInScheduleList() {
    var output = "";
    for (var i = 0; i < SCHEDULE.length; i ++) {
        var str = "<tr>";
        str += "<td>" + SCHEDULE[i].program + "</td>";
        str += "<td>" + SCHEDULE[i].catalog_no + "</td>";
        str += "<td>" + SCHEDULE[i].section + "</td>";
        str += "<td>" + SCHEDULE[i].class_no + "</td>";
        str += "<td>" + SCHEDULE[i].title + "</td>";
        str += "<td>" + (SCHEDULE[i].creditHoursInDoubt() ? SEE_PASS : (SCHEDULE[i].credits === 0 ? "" : SCHEDULE[i].credits)) + "</td>";
        str += "</tr>";
        output += str;
    }
    
    $("#schedule_list_body").html(output);
}

function fillInCredits() {
    $("#total_credits").html("Total Credits: " + $("#credits").val());
}