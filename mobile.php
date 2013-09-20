<!DOCTYPE html>

<?php
$TITLE="Western Time Mobile";

$fn = base64_decode($_GET["f"]);
if ((!$season || !$year) && $fn)
{
    $svalue = substr($fn, 0, 1);
    $yvalue = substr($fn, 1, 4);
    
    if ($svalue == 0)
        $season = "Winter";
    else if ($svalue == 1)
        $season = "Spring";
    else if ($svalue == 2)
        $season = "Summer";
    else
        $season = "Fall";
    
    $year = $yvalue;
}

if (!$season || !$year)
{
    $year = intval(date("Y"));
    $mo = intval(date("n"));
    $da = intval(date("j"));
    
    if (2 <= $mo && $mo <= 9)
        $season = "Fall";
    else if (10 == $mo && $da <= 10)
        $season = "Fall";
    else {
        $season = "Spring";
        if ($mo > 9)
            $year ++;
    }
}

$maxyear = intval(date("Y")) + 1;
if (intval($year) > $maxyear)
    $maxyear = intval($year);

// Downloads a file if it has been modified since the last time
// it was downloaded.
function getFile($url, $filename) {
    if (file_exists($filename)) {
        $local = strtotime(date("F d Y H:i:s.", filemtime($filename)));
        $headers = get_headers($url, 1);
        $remote = strtotime($headers["Last-Modified"]);
        
        if ($local < $remote) {
            file_put_contents($filename, file_get_contents($url));
        }
    }
    else {
        $file_contents = file_get_contents($url);
        if ($file_contents)
            file_put_contents($filename, file_get_contents($url));
    }    
}

$filename = $season . $year . ".dat";
$url = "http://www.uwplatt.edu/csse/uwpclasses/" . $year . "/" . $filename;
getFile($url, "res/".$filename);

$filename = "semester_days.txt";
$url = "http://www.uwplatt.edu/csse/uwpclasses/" . $filename;
getFile($url, "res/".$filename);
?>

<html>
    <head>
        <title><?php echo $TITLE; ?></title>
        <meta name="author" content="Christopher Wald, with significant contributions from Dr. Robert W. Hasker">
        <meta name="description" content=<?php echo '"' . $TITLE . '"'; ?>>
        <meta name="copyright" content="Copyright (c) 2013 Christopher J. Wald. All rights reserved.">
        <meta charset="UTF-8">
        <link rel="stylesheet" href="styles/mobile.css" type="text/css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
        <script type="text/javascript" src="js/event.js"></script>
        <script type="text/javascript" src="js/meeting.js"></script>
        <script type="text/javascript" src="js/section.js"></script>
        <script type="text/javascript" src="js/dl_classlist.js"></script>
        <script type="text/javascript" src="js/parse_sections.js"></script>
        <script type="text/javascript">
        $(document).ready(function() {
            var season = "Fall";
            var year = "2013";
            DownloadClassList(season, year, OnDone, {verbose: true, success_cb: OnSuccess, progress_cb: OnProgress, error_cb: OnError});
            
            function OnDone(response) {
                ParseSections(response);
                
                $("#section_table_body").html("");
                for (var i = 0; i < SECTIONS.length; i ++) {
                    var text = "";
                    if (SECTIONS[i].closed)
                        text += "<tr class='closed_row section_row'>";
                    else
                        text += "<tr class='section_row'>";
                    text += "<td class='program_col'>" + SECTIONS[i].program + "</td>";
                    text += "<td class='cat_no_col'>" + SECTIONS[i].catalog_no + "</td>";
                    text += "<td class='section_col'>" + SECTIONS[i].section + "</td>";
                    text += "<td class='title_col'>" + SECTIONS[i].title + "</td>";
                    text += "<td class='instructor_col'>" + SECTIONS[i].instructor + "</td>";
                    text += "<td class='seats_col'>" + SECTIONS[i].filled + "/" + SECTIONS[i].seats + (SECTIONS[i].closed ? " (C)" : "") + "</td>";
                    text += "<td class='class_no_col'>" + SECTIONS[i].class_no + "</td>";
                    text += "<td class='credits_col'>" + 
                            (SECTIONS[i].creditHoursInDoubt() ? SEE_PASS : 
                            (SECTIONS[i].credits === 0 ? "" : SECTIONS[i].credits)) + "</td>";
                    text += "<td class='meets_at_col'>" + SECTIONS[i]._meetsAt().toString() + "</td>";
                    text += "</tr>";
                    $("#section_table_body").append(text);
                }
            }
            
            var loadTimeout;
            var loadTimeout_called = false;
            
            function OnSuccess() {
                clearTimeout(loadTimeout);
                $("#progress_bar").addClass("hidden");
            }
            
            function OnProgress(evt) {
                if (evt.lengthComputable) {
                    var percent = parseInt( (evt.loaded / evt.total * 100), 10);
                    if (!loadTimeout_called) {
                        loadTimeout = setTimeout(function() {
                            if (percent < 80)
                                $("#progress_bar").removeClass("hidden");
                        }, 500);
                        loadTimeout_called = true;
                    }
                    $("#progress").width(percent + "%");
                }
                else {
                    console.log("Length not computable.");
                }
            }
            
            function OnError() {
                clearTimeout(loadTimeout);
                $("#progress_bar").removeClass("hidden");
                $("#progress").width("100%");
                $("#progress").css("background-color", "#e60000");
                $("#progress").css("cursor", "pointer");
                $("#progress").click(function() {location.reload();});
                $("#progress_error").removeClass("hidden");
            }
        });
        </script>
    </head>
    
    <body>
        <table id="section_table">
            <thead id="section_table_head">
                <tr>
                    <th class="program_col">Subject</th>
                    <th class="cat_no_col">Cat. No</th>
                    <th class="section_col">Section</th>
                    <th class="title_col">Title</th>
                    <th class="instructor_col">Instructor</th>
                    <th class="seats_col">Filled/Seats</th>
                    <th class="class_no_col">Class #</th>
                    <th class="credits_col">Credits</th>
                    <th class="meets_at_col">Meets</th>
                </tr>
            </thead>
            <tbody id="section_table_body">
            </tbody>
        </table>
        <div id="progress_bar" class="hidden">
            <div id="progress">
            <div id="progress_error" class="hidden">Whoops... Click to Retry</div>
            </div>
        </div>
    </body>
</html>