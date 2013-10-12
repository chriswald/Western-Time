var HISTORY = new History();

$(document).ready(function() {
    $("html").keydown(UndoRedo);
});

function UndoRedo(e) {
    e.preventDefault();
    e.ctrlKey = (e.ctrlKey || e.metaKey);
    if (e.ctrlKey) {
        if (e.keyCode === "Z".charCodeAt(0))
            HISTORY.undo();
        if (e.keyCode === "Y".charCodeAt(0))
            HISTORY.redo();
    }
}

function History() {
    return {
        undo_stack: [],
        redo_stack: [],
        
        exec: function(cmd) {
            cmd.redo();
            this.undo_stack.push(cmd);
            populateScheduleTable();
            populateSectionTable();
            populateShareBox();
            fillInPrintForm();
        },
        
        undo: function() {
            if (this.undo_stack.length === 0)
                return;
            var cmd = this.undo_stack.pop();
            cmd.undo();
            this.redo_stack.push(cmd);
            populateScheduleTable();
            populateSectionTable();
            populateShareBox();
            fillInPrintForm();
        },
        
        redo: function() {
            if (this.redo_stack.length === 0)
                return;
            var cmd = this.redo_stack.pop();
            cmd.redo();
            this.undo_stack.push(cmd);
            populateScheduleTable();
            populateSectionTable();
            populateShareBox();
            fillInPrintForm();
        }
    };
}

function AddCommand(sec) {
    return {
        section: sec,
        redo: function() {
            SCHEDULE.push(sec);
        },
        undo: function() {
            for (var i = 0; i < SCHEDULE.length; i ++) {
                if (SCHEDULE[i] == sec)
                    SCHEDULE.splice(i, 1);
            }
        }
    };
}

function RemCommand(sec) {
    return {
        section: sec,
        redo: function() {
            for (var i = 0; i < SCHEDULE.length; i ++) {
                if (SCHEDULE[i] == sec)
                    SCHEDULE.splice(i, 1);
            }
        },
        undo: function() {
            SCHEDULE.push(sec);
        }
    };
}