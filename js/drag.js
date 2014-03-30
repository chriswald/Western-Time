$(document).ready(function(){
    var filedrag = document.getElementById("filedrag");
    
    filedrag.addEventListener("dragover", FileDragHover, false);
	filedrag.addEventListener("dragleave", FileDragHover, false);
	filedrag.addEventListener("drop", FileSelectHandler, false);
});

function FileDragHover(e) {
	e.stopPropagation();
	e.preventDefault();
}

function FileSelectHandler(e) {
    FileDragHover(e);
    handleFileLoad(e);
}