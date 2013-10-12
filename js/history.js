var HISTORY = new History();

$(document).ready(function() {
    $("html").keydown(UndoRedo);
    $("#undoredo").change(HISTORY.change);
    HISTORY.populate();
});

function UndoRedo(e) {
    e.ctrlKey = (e.ctrlKey || e.metaKey);
    if (e.ctrlKey) {
        if (e.keyCode === "Z".charCodeAt(0)) {
            e.preventDefault();
            HISTORY.undo();
            populateScheduleTable();
            populateSectionTable();
            populateShareBox();
            fillInPrintForm();
        }
        if (e.keyCode === "Y".charCodeAt(0)) {
            e.preventDefault();
            HISTORY.redo();
            populateScheduleTable();
            populateSectionTable();
            populateShareBox();
            fillInPrintForm();
        }
    }
}

function History() {
    return {
        undo_stack: [],
        redo_stack: [],
        default_phrase: "Undo/Redo",
        
        exec: function(cmd) {
            cmd.redo();
            this.undo_stack.push(cmd);
            this.redo_stack.length = 0;
            this.populate();
        },
        
        undo: function() {
            if (this.undo_stack.length === 0)
                return;
            var cmd = this.undo_stack.pop();
            cmd.undo();
            this.redo_stack.push(cmd);
            this.populate();
        },
        
        redo: function() {
            if (this.redo_stack.length === 0)
                return;
            var cmd = this.redo_stack.pop();
            cmd.redo();
            this.undo_stack.push(cmd);
            this.populate();
        },
        
        list: function() {
            var list = [], i = 0;
            for (i = 0; i < this.redo_stack.length; i ++) {
                list.push("Redo " + this.redo_stack[i].description);
            }
            list.push(this.default_phrase);
            for (i = this.undo_stack.length-1; i >= 0; i --) {
                list.push("Undo " + this.undo_stack[i].description);
            }
            return list;
        },
        
        populate: function() {
            var list = this.list();
            var str = "";
            for (var i = 0; i < list.length; i ++) {
                str += "<option value=" + list[i];
                if (list[i] == this.default_phrase)
                    str += " selected='selected'";
                str += ">" + list[i] + "</option>";
            }
            $("#undoredo").html(str);
        },
        
        change: function() {
            var e = document.getElementById("undoredo");
            if (e.selectedIndex < 0)
                return;
            var delta = e.selectedIndex - HISTORY.redo_stack.length;
            if (delta < 0) {
                for (var i = 0; i < -delta; i ++)
                    HISTORY.redo();
            }
            if (delta > 0) {
                for (var j = 0; j < delta; j ++)
                    HISTORY.undo();
            }
            populateScheduleTable();
            populateSectionTable();
            populateShareBox();
            fillInPrintForm();
        }
    };
}

function AddCommand(sec) {
    var desc = "";
    if (typeof sec.length === "undefined")
        desc = "Adding " + sec.program + " " + sec.catalog_no;
    else
        desc = "Adding multiple sections";
        
    return {
        section: sec,
        description: desc,
        redo: function() {
            SCHEDULE.push(this.section);
        },
        undo: function() {
            for (var i = SCHEDULE.length-1; i >= 0; i --) {
                if (SCHEDULE[i] == this.section)
                    SCHEDULE.splice(i, 1);
            }
        }
    };
}

function RemCommand(sec) {
    var desc = "";
    if (typeof sec.length === "undefined")
        desc = "Removing " + sec.program + " " + sec.catalog_no;
    else
        desc = "Removing multiple sections";
    
    return {
        section: sec,
        description: desc,
        redo: function() {
            for (var i = SCHEDULE.length-1; i >= 0; i --) {
                if (SCHEDULE[i] == this.section)
                    SCHEDULE.splice(i, 1);
            }
        },
        undo: function() {
            SCHEDULE.push(this.section);
        }
    };
}