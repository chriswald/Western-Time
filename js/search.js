function Search(opt) {
    var search = $("#search_bar").val().toLowerCase();
    if (search.length === 0) {
        if (typeof opt.empty_func !== "undefined")
            opt.empty_func();
    }
    else {
        if (typeof opt.nempty_func !== "undefined")
            opt.nempty_func();
            
        var tokens = search.splitQuoted(" ", "\"");
        var results = [];
        for (var i = 0; i < SECTIONS.length; i ++) {
            var section = SECTIONS[i];
            var include = false;
            var str = section.program + " " + section.catalog_no + " " +
                      section.section + " " + section.title + " " +
                      section.instructor + " " + section.class_no + " " +
                      section.credits + " " + 
                      section.seats + "/" + section.filled + " " +
                      section._meetsAt().toString() + " ";
            if (typeof section._meetsAt().mtgDays !== "undefined")
                str += expandDays(section._meetsAt().mtgDays()).join(" ") + " ";
            if (typeof section._meetsAt().first !== "undefined")
                str += expandDays(section._meetsAt().first.mtgDays()).join(" ") + " ";
            if (typeof section._meetsAt().second !== "undefined")
                str += expandDays(section._meetsAt().second.mtgDays()).join(" ") + " ";   
            for (var j = 0; j < tokens.length; j ++) {
                if (tokens[j] !== "\"" && str.toLowerCase().indexOf(tokens[j]) != -1)
                    include = true;
                else {
                    include = false;
                    break;
                }
            }
            if (include)
                results.push(section);
        }
        
        results.sort(sectionLessThan);
        WORKING_LIST = results;
    }
    if (typeof opt.done_searching !== "undefined")
        setTimeout(opt.done_searching, 1);
}