// FILE:    history.js
// AUTHOR:  Christopher J. Wald
// DATE:    Oct 12, 2013
//
// DESC:    Provides unlimited undo/redo functionality.
//
// KNOWN DEPENDENCIES:
//          jQuery, index.php, populate.js, section.js

// Contains the undo/redo history.
var HISTORY = new History();

// Links up events to their handlers. Does some initial setup.
$(document).ready(function() {
    $("html").keydown(UndoRedo);
    $("#undoredo").change(HISTORY.change);
    HISTORY.populate();
});

// Listens for ctrl-Z or ctrl-Y and executes an undo or redo
// respectivly.
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

// History Class.
// Holds stacks for undo and redo commands.
function History() {
    return {
        // Stack of undo commands.
        undo_stack: [],
        // Stack of redo commands.
        redo_stack: [],
        // The default phrase for the undo/redo dropdown.
        default_phrase: "Undo/Redo",
        
        // Execute a command and push it to the undo stack. Also
        // clears the redo stack.
        exec: function(cmd) {
            cmd.redo();
            this.undo_stack.push(cmd);
            this.redo_stack.length = 0;
            this.populate();
        },
        
        // Undoes the command on the top of the undo stack and pushes
        // it onto the redo stack.
        undo: function() {
            if (this.undo_stack.length === 0)
                return;
            var cmd = this.undo_stack.pop();
            cmd.undo();
            this.redo_stack.push(cmd);
            this.populate();
        },
        
        // Redoes the command on the top of the redo stack and pushes
        // it onto the undo stack.
        redo: function() {
            if (this.redo_stack.length === 0)
                return;
            var cmd = this.redo_stack.pop();
            cmd.redo();
            this.undo_stack.push(cmd);
            this.populate();
        },
        
        // Generates a list of command descriptions to be put into
        // the history dropdown box.
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
        
        // Fills the history dropdown box.
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
        
        // When the user selects a command from the history dropdown
        // box, this undoes or redoes the proper number of commands.
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

// AddCommand Class
// Represents a section being added to the user's schedule.
function AddCommand(sec) {
    var desc = "";
    if (typeof sec.length === "undefined")
        desc = "Adding " + sec.program + " " + sec.catalog_no;
    else
        desc = "Adding multiple sections";
        
    return {
        // The section being delt with.
        section: sec,
        // A description of the command.
        description: desc,
        
        // Adds the section to the user's schedule.
        redo: function() {
            SCHEDULE.push(this.section);
        },
        
        // Remove the section from the user's schedule.
        undo: function() {
            for (var i = SCHEDULE.length-1; i >= 0; i --) {
                if (SCHEDULE[i] == this.section)
                    SCHEDULE.splice(i, 1);
            }
        }
    };
}

// RemCommand Class
// Represents a section being removed from the user's schedule.
function RemCommand(sec) {
    var desc = "";
    if (typeof sec.length === "undefined")
        desc = "Removing " + sec.program + " " + sec.catalog_no;
    else
        desc = "Removing multiple sections";
    
    return {
        // The section being delt with.
        section: sec,
        // A description of the command.
        description: desc,
        
        // Removes the section from the user's schedule.
        redo: function() {
            for (var i = SCHEDULE.length-1; i >= 0; i --) {
                if (SCHEDULE[i] == this.section)
                    SCHEDULE.splice(i, 1);
            }
        },
        
        // Adds the section to the user's schedule.
        undo: function() {
            SCHEDULE.push(this.section);
        }
    };
}