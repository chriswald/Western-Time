<?php
if (!$_GET["f"])
{
    header("Location: /mobile/");
}

$TITLE = "Western Time Mobile";

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
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
        <meta charset="UTF-8">
        
        <link rel="stylesheet" href="styles/msched.css" type="text/css">
        
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
        <script type="text/javascript" src="js/event.js"></script>
        <script type="text/javascript" src="js/meeting.js"></script>
        <script type="text/javascript" src="js/section.js"></script>
        <script type="text/javascript" src="js/dl_classlist.js"></script>
        <script type="text/javascript" src="js/parse_sections.js"></script>
        <script type="text/javascript" src="js/share.js"></script>
        <script type="text/javascript" src="js/analytics.js"></script>
        <script type="text/javascript" src="js/mobile/msched.js"></script>
    <head>
    
    <body>
        <form action="./mobile.php" id="semester" class="hidden" method="get">
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
        </form>
        
        <table id="section_table">
            <thead id="section_table_head">
                <tr>
                    <th id="day_header">
                    </th>
                </tr>
            </thead>
            <tbody id="section_table_body">
                <?php 
                    for ($i = 7; $i <= 17; $i ++) {
                        echo "<tr><td>";
                        if ($i == 7)
                            echo "Morning";
                        else if ($i == 17)
                            echo "Evening";
                        else {
                            if ($i <= 12)
                                echo $i.":00";
                            else
                                echo ($i-12).":00";
                        }
                        echo "<br/>";
                        echo "<div class='sect_info' id='".$i."'></div></td></tr>";
                    }
                ?>
            </tbody>
        </table>
    </body>
</html>