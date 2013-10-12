var HISTORY = new History();

$(document).ready(function() {
    $("html").keydown(UndoRedo);
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
        
        exec: function(cmd) {
            cmd.redo();
            this.undo_stack.push(cmd);
            this.redo_stack.length = 0;
        },
        
        undo: function() {
            if (this.undo_stack.length === 0)
                return;
            var cmd = this.undo_stack.pop();
            cmd.undo();
            this.redo_stack.push(cmd);
        },
        
        redo: function() {
            if (this.redo_stack.length === 0)
                return;
            var cmd = this.redo_stack.pop();
            cmd.redo();
            this.undo_stack.push(cmd);
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