// FILE:    event.js
// AUTHOR:  Christopher J. Wald
// DATE:    Oct 12, 2013
//
// DESC:    Contains methods for the creation of iCal files from a
//          user's schedule.
//
// KNOWN DEPENDENCIES:
//

// Short names for each month.
var month_names = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

// _Date Class
// (The underscore is required to aviod conflicts with jQuery)
// Represents a date and provides functions for integrating with the
// iCal specification (RFC 2445).
function _Date(_month, _day, _year) {
    return {
        // Integer month (0...11)
        month: parseInt(_month, 10),
        // Integer day (0...30)
        day:   parseInt(_day, 10),
        // Integer year (/\d{4}/)
        year:  parseInt(_year, 10),
        
        // Returns the day of the year that a date is.
        doy: function() {
            var yd = 0;
            for(var m = 1; m < this.month; ++m)
                yd += this.daysInMonth(m, this.year);
            yd += this.day - 1;
            return yd;
        },
        
        // Returns the day of the week that a specified date is. Year
        // must be 2000 or later. Do not confuse with the destinction
        // between weekend and weekday.
        weekday: function() {
            // Works for year >= 2000
            // from http://www.gregmiller.net/astro/dow.html
            var yrnum = ((this.year % 100) / 4 + (this.year % 100)) >> 0;
            var month_conversions = [6, 2, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
            var daynum = this.day + yrnum + month_conversions[this.month - 1];
            if ( this.month <= 2 && this.daysInMonth(2, this.year) == 29 )
                --daynum;
            // normalize daynum to 1..7:
            daynum %= 7;
            daynum = daynum >> 0;
            // 0 = sunday, 1 = monday, 2 = tuesday, ... 6 = saturday
            if ( daynum === 0 )
                return Day.Sunday;
            else
                return daynum - 1;
        },
        
        // Walks forward to a new date a certain number of days.
        addDays: function(days) {
            for(var d = 0; d < days; ++d) {
                this.day++;
                if (this.day > this.daysInMonth(this.month, this.year)) {
                    this.day = 1;
                    this.month++;
                    if (this.month > 12) {
                        this.month = 1;
                        this.year++;
                    }
                }
            }
        },
        
        // Returns this date in iCal format.
        toICal: function() {
            return "" + this.year
                    + (this.month<10?"0"+this.month:""+this.month)
                    + (this.day<10?"0"+this.day:""+this.day);
        },
        
        // Returns a string representation of this date.
        toString: function() {
            return month_names[this.month+1] + " "
                    + this.day + ", " + this.year;
        },
        
        // Returns true if this date occurred before some other date.
        lessThan: function(other) {
            if ( this.year < other.year )
                return true;
            else if ( this.year > other.year )
                return false;
            // years equal
            if ( this.month < other.month )
                return true;
            else if ( this.month > other.month )
                return false;
            // months equal
            if ( this.day < other.day )
                return true;
            else if ( this.day > other.day )
                return false;
            // all equal
            return false;
        },
        
        // Returns the number of days in a month.
        daysInMonth: function(m, y) {
            switch (m) {
                case 1:
                case 3:
                case 5:
                case 7:
                case 8:
                case 10:
                case 12:
                    return 31;
                case 2:
                    if ( y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) )
                        return 29;
                    else
                        return 28;
                    break;
                case 4:
                case 6:
                case 9:
                case 11:
                  return 30;
            }
        },
        
        // Returns the number of a month given its short name.
        // See month_names.
        month_num: function(m) {
            var lower_month = m.toLowerCase();
            for(var i = 0; i < 12; i++)
                if ( lower_month == month_names[i] )
                    return i + 1;
        }
    };
}

// EventGenerator Class
// Generates an iCal event over (startDate ... endDate).
function EventGenerator(startDate, endDate) {
    endDate.addDays(1);
    return {
        // Start date of the semester.
        semester_start: startDate,
        // End date of the semester.
        semester_end:   endDate,
        
        // Returns a string listing the days that are included in the
        // event.
        icalDays: function(day_included) {
            var result = "";
            if (day_included[Day.Sunday])
                result += ",SU";
            if (day_included[Day.Monday])
                result += ",MO";
            if (day_included[Day.Tuesday])
                result += ",TU";
            if (day_included[Day.Wednesday])
                result += ",WE";
            if (day_included[Day.Thursday])
                result += ",TH";
            if (day_included[Day.Friday])
                result += ",FR";
            if (day_included[Day.Saturday])
                result += ",SA";
            if (result.length > 0)
                result = result.substr(1);
            return result;
        },
        
        // Generate the content of the event.
        eventFor: function(description, location, note, start_time, end_time, day_included) {
            var first_meeting = $.extend(true, {}, this.semester_start);
            for (var i = 0; i < 7 && !day_included[first_meeting.weekday()]; i++) {
                first_meeting.addDays(1);
            }
            var preamble = "BEGIN:VEVENT\n";
            var rule     = "RRULE:FREQ=WEEKLY;UNTIL="
                + this.semester_end.toICal()
                + ";INTERVAL=1;BYDAY="
                + this.icalDays(day_included)
                + "\n";
            var summary = "SUMMARY:" + description + "\n";
            var loc     = "LOCATION:" + location + "\n";
            var descr   = "";
            if (note !== "")
                descr = "DESCRIPTION:" + note + "\n";
            var start    = "DTSTART;TZID=\"(GMT-06.00) Central Time (US & Canada)\":"
                + first_meeting.toICal() + "T" + start_time + "\n"; // 20090904T070000
            var end      = "DTEND;TZID=\"(GMT-06.00) Central Time (US & Canada)\":"
                + first_meeting.toICal() + "T" + end_time + "\n";
            var post     =
                "STATUS:CONFIRMED\n" +
                "CLASS:PUBLIC\n" +
                "X-MICROSOFT-CDO-INTENDEDSTATUS:BUSY\n" +
                "TRANSP:OPAQUE\n" +
                "X-MICROSOFT-DISALLOW-COUNTER:TRUE\n" +
                "DTSTAMP:20090815T190729Z\n" +
                "END:VEVENT\n";
            return preamble + rule + summary + loc + descr + start + end + post;
        },
        
        // Returns the boilerplate text to start a calendar.
        preamble: function() {
            var pre =
                "BEGIN:VCALENDAR\n" +
                "METHOD:PUBLISH\n" +
                "BEGIN:VTIMEZONE\n" +
                "TZID:(GMT-06.00) Central Time (US & Canada)\n" +
                "BEGIN:STANDARD\n" +
                "DTSTART:19710101T020000\n" +
                "TZOFFSETTO:-0600\n" +
                "TZOFFSETFROM:-0500\n" +
                "RRULE:FREQ=YEARLY;WKST=MO;INTERVAL=1;BYMONTH=11;BYDAY=1SU\n" +
                "END:STANDARD\n" +
                "BEGIN:DAYLIGHT\n" +
                "DTSTART:19710101T020000\n" +
                "TZOFFSETTO:-0500\n" +
                "TZOFFSETFROM:-0600\n" +
                "RRULE:FREQ=YEARLY;WKST=MO;INTERVAL=1;BYMONTH=3;BYDAY=2SU\n" +
                "END:DAYLIGHT\n" +
                "END:VTIMEZONE\n";
            return pre;
        },
        
        // Returns the boilerplate text to end a calendar.
        postlude: function() {
            return "END:VCALENDAR\n";
        }
    };
}