function expandDays(days_str) {
    days_str = days_str.replace(/Th/, "R");
    days = [];
    if (/Sa/.test(days_str)) days.push("Saturday");
    if (/Su/.test(days_str)) days.push("Sunday");
    if (/M/.test(days_str))  days.push("Monday");
    if (/T/.test(days_str))  days.push("Tuesday");
    if (/W/.test(days_str))  days.push("Wednesday");
    if (/R/.test(days_str))  days.push("Thursday");
    if (/F/.test(days_str))  days.push("Friday");
    return days;
}