<!DOCTYPE html>

<?php
$TITLE="Western Time Mobile";

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

<html>
    <head>
        <title><?php echo $TITLE; ?></title>
        <meta name="author" content="Christopher Wald, with significant contributions from Dr. Robert W. Hasker">
        <meta name="description" content=<?php echo '"' . $TITLE . '"'; ?>>
        <meta name="copyright" content="Copyright (c) 2013 Christopher J. Wald. All rights reserved.">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta charset="UTF-8">
        <link rel="stylesheet" href="styles/mobile.css" type="text/css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
        <script type="text/javascript" src="js/event.js"></script>
        <script type="text/javascript" src="js/meeting.js"></script>
        <script type="text/javascript" src="js/section.js"></script>
        <script type="text/javascript" src="js/dl_classlist.js"></script>
        <script type="text/javascript" src="js/parse_sections.js"></script>
        <script type="text/javascript" src="js/mobile/populate.js"></script>
        <script type="text/javascript" src="js/mobile/menu.js"></script>
        <script type="text/javascript" src="js/mobile/search.js"></script>
    </head>
    
    <body>
        <div id="menu_bar">
            <h2 id="title"><?php echo $TITLE; ?></h2>
            <div id="icons">
                <image id="search_button" class="icon" src="img/search.png" alt="Search sections"></image>
                <image id="menu_button" class="icon" src="img/menu.png" alt="Drop Down Menu"></image>
            </div>
        </div>
        <div id="menu_body">
            <div id="menu_content">
                <form action="./mobile.php" id="semester" method="get">
                    <div id="season_container">
                        <select id="season" name="season">
                        <?php
                            function radio_button($sson)
                            {
                                global $season;
                                echo "<option value='" . $sson . "'";
                                if ($sson == $season)
                                    echo " selected='selected'";
                                echo ">" . $sson . "</option>";
                            }
                            radio_button("Winter");
                            radio_button("Spring");
                            radio_button("Summer");
                            radio_button("Fall");
                        ?>
                        </select>
                    </div>
                    <div id="year_container">
                        <select id="year" name="year">
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
                    <div id="reload_btn">
                        <button type="submit" value="Reload" style="width: 100%">Reload</button>
                    </div>
                </form>
                <hr></hr>
                <select id="program_select"></select>
                <form style="margin-top: 10px; width: 100%">
                    <input id="all" type="radio" name="college" value="all" checked="checked"><label for="all">All</label></input>
                    <input id="ems" type="radio" name="college" value="EMS" style="margin-left: 10px"><label for="ems">EMS</label></input>
                    <input id="lae" type="radio" name="college" value="LAE" style="margin-left: 10px"><label for="lae">LAE</label></input>
                    <input id="bilsa" type="radio" name="college" value="BILSA" style="margin-left: 10px"><label for="bilsa">BILSA</label></input>
                </form>
            </div>
        </div>
        <div id="search_body">
            <div id="search_content">
                <form action="#">
                    <input type="text" id="search_bar"></input>
                </form>
            </div>
        </div>
        <table id="section_table">
            <thead id="section_table_head">
                <tr>
                    <th class="section_col">Section</th>
                    <th class="title_col">Title</th>
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