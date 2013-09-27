<?php
include_once("detectmobilebrowser.php");
$detect = new Mobile_Detect;
if ($detect->isMobile())
    header("Location: mobile.php");

$TITLE='Western Time';

$season = $_GET["season"];
$year = $_GET["year"];

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

<!DOCTYPE html>

<html>
    <head>
        <title><?php echo $TITLE; ?></title>
        <meta name="author" content="Christopher Wald, with significant contributions from Dr. Robert W. Hasker">
        <meta name="description" content=<?php echo '"' . $TITLE . '"'; ?>>
        <meta name="copyright" content="Copyright (c) 2013 Christopher J. Wald. All rights reserved.">
        <meta charset="UTF-8">
        <link rel="stylesheet" href="styles/style.css" type="text/css">
        <link rel="stylesheet" href="styles/print.css" type="text/css" media="print">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
        <script type="text/javascript" src="js/event.js"></script>
        <script type="text/javascript" src="js/meeting.js"></script>
        <script type="text/javascript" src="js/section.js"></script>
        <script type="text/javascript" src="js/dl_classlist.js"></script>
        <script type="text/javascript" src="js/parse_sections.js"></script>
        <script type="text/javascript" src="js/showpanel.js"></script>
        <script type="text/javascript" src="js/populate.js"></script>
        <script type="text/javascript" src="js/nav_buttons.js"></script>
        <script type="text/javascript" src="js/file.js"></script>
        <script type="text/javascript" src="js/options.js"></script>
        <script type="text/javascript" src="js/weekly.js"></script>
        <script type="text/javascript" src="js/print.js"></script>
        <script type="text/javascript" src="js/search.js"></script>
        <script type="text/javascript" src="js/searchopts.js"></script>
        <script type="text/javascript" src="js/share.js"></script>
        <script type="text/javascript" src="js/util.js"></script>
        
        <!--Google Analytics-->
        <!--To be added later-->
    </head>
    
    <body>
        <div id="index">
            <div class="hidden">
                <form action="save.php" method="post">
                    <input id="contents" type="text" name="contents">
                    <input id="submit"  type="submit" name="submit">
                </form>
                <div id="uploaded_file_contents"><?php
                    $extension = end(explode('.', $_FILES["file"]["name"]));
                    if ($_FILES["file"]["error"] == UPLOAD_ERR_OK &&
                         is_uploaded_file($_FILES["file"]["tmp_name"]) &&
                         $extension == "sch") {
                        echo file_get_contents($_FILES["file"]["tmp_name"]);
                    }
                    ?></div>
            </div>
            <div id="sidebar">
                <button type="button" id="sidebar_btn" onclick="toggleSidebar()">&middot;&middot;&middot;</button>
                <div class="navbar">
                    <h1><?php echo $TITLE; ?></h1>
                </div>
                <form action="./" id="semester" method="get">
                    <div id="season">
                        <?php
                            function radio_button($sson)
                            {
                                global $season;
                                echo "<input type='radio' name='season' id='" . $sson . "' value='" . $sson . "'";
                                if ($sson == $season)
                                    echo " checked";
                                echo "><label for='" . $sson . "'>" . $sson . "</label><br>";
                            }
                            radio_button("Winter");
                            radio_button("Spring");
                            radio_button("Summer");
                            radio_button("Fall");
                        ?>
                    </div>
                    <div id="year_container">
                        <select id="year" name="year" style="width: 100%;">
                        <?php
                            for ($i=$maxyear; $i>=1999; $i--)
                            {
                                echo '<option value="' . $i . '"';
                                if ($i == $year)
                                    echo ' selected';
                                echo '>' . $i . '</option>';
                            }
                        ?>
                        </select>
                    </div>
                    <div id="term_sel_btns">
                        <button type="button" class="ts_btn" id="psem">&lt;&lt;</button>
                        <button type="button" class="ts_btn" id="pterm">&lt;</button>
                        <button type="button" class="ts_btn" id="nterm">&gt;</button>
                        <button type="button" class="ts_btn" id="nsem">&gt;&gt;</button>
                    </div>
                    <div id="reload_btn">
                        <button type="submit" value="Reload" style="width: 100%; height: 20px;">Reload</button>
                    </div>
                </form>
                <hr></hr>
                <div id="program_container">
                    <select id="program" name="subject" style="width: 100%;">
                    </select>
                    <form style="margin-top: 10px;">
                        <input id="all" type="radio" name="college" value="all" checked="checked"><label for="all">All</label></input>
                        <input id="ems" type="radio" name="college" value="EMS" style="margin-left: 10px"><label for="ems">EMS</label></input>
                        <input id="lae" type="radio" name="college" value="LAE" style="margin-left: 10px"><label for="lae">LAE</label></input>
                        <input id="bilsa" type="radio" name="college" value="BILSA" style="margin-left: 10px"><label for="bilsa">BILSA</label></input>
                    </form>
                </div>
                <hr></hr>
                <div id="option_container">
                    <form>
                        <input id="closed" type="checkbox" name="option" value="closed" checked="checked">
                            <label for="closed">Include Closed Classes</label>
                        </input>
                        <input id="conflict" type="checkbox" name="option" value="conflict" checked="checked">
                            <label for="conflict">Include Conflicts</label>
                        </input>
                    </form>
                </div>
                <hr></hr>
                <div id="search_container">
                    <form>
                        <input id="search_bar" type="text" placeholder="Search..." disabled></input>
                    </form>
                </div>
                <hr></hr>
                <div id="file_container">
                    <form action=<?php echo "'./?season=$season&year=$year'"; ?> method="post" enctype="multipart/form-data">  
                        <input id="openfile" class="missing" type="file" name="file"></input>
                        <input id="submitfileupload" class="missing" type="submit" name="submit"></input>
                        <button id="open_button" type="button" disabled>Open Schedule...</button>
                        <span id="schedule_file_name" style="margin-left: 10px; font: inherit;">No file selected.</span>
                        <button id="save_button" type="button" value="save" disabled>SAVE</button>
                        <button id="ddown_button" type="button" value="drop" disabled>&#9660;</button>
                        <div id="export_list" class="hidden">
                            <div id="export_ical">Export to ICal</div>
                            <div id="export_csv">Export to CSV</div>
                        </div>
                    </form>
                </div>
                <div id="about_container">
                    \\<a href="mailto:waldc@uwplatt.edu" target="_blank">Contact</a>
                    <span>&nbsp;&nbsp;</span>
                    \\<a href="privacy.php" target="_blank">Privacy</a>
                </div>
            </div>
            <div id="sharebar">
                <button type="button" id="sharebar_btn" onclick="toggleSharebar()" disabled>&middot;&middot;&middot;</button>
                <div class="navbar"><h1>Share</h1></div>
                <form>
                    <input id="share_box" type="text" placeholder="Add classes to make a shareable link..." readonly></input>
                </form>
            </div>
            <div id="content">
                <div id="section_list">
                    <table>
                        <thead>
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
                        <tbody id="section_body">
                        </tbody>
                    </table>
                </div>
                <div id="information">
                    <form>
                        <button type="button" id="switch_view">Show Weekly View</button>
                        <span class="label">Student:</span>
                        <input id="name" class="text" type="text" name="name"></input>
                        <span class="label">PIN:</span>
                        <input id="pin" class="text" type="text" name="pin"></input>
                        <span class="label">Approximate Credits:</span>
                        <input id="credits" class="text" type="text" name="credits" readonly></input>
                        <button type="button" id="print_button" disabled>Print</button>
                    </form>
                </div>
                <div id="schedule_list">
                    <table>
                        <thead id="schedule_head">
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
                        <tbody id="schedule_body">
                        </tbody>
                    </table>
                </div>
                <div id="weekly_view" class="hidden">
                    <table style="width: 100%">
                        <thead>
                            <tr>
                                <th></th>
                                <th class="day_col">Sunday</th>
                                <th class="day_col">Monday</th>
                                <th class="day_col">Tuesday</th>
                                <th class="day_col">Wednesday</th>
                                <th class="day_col">Thursday</th>
                                <th class="day_col">Friday</th>
                                <th class="day_col">Saturday</th>
                            </tr>
                        </thead>
                        <tbody id="weekly_view_body">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div id="progress_bar" class="hidden">
            <div id="progress">
            <div id="progress_error" class="hidden">Whoops... Click to Retry</div>
            </div>
        </div>
        <?php include_once("printfile.php"); ?>
    <body>
</html>