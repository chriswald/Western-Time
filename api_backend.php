<?php

class API {
    private $rawClassListContents = "";
    private $queries = [];
    
    public function __construct($post)
    {
        $this->queries = $post;
        if (!isset($this->queries["s"]))
            $this->queries["s"] = $this->getDefaultSeason();
        if (!isset($this->queries["y"]))
            $this->queries["y"] = $this->getDefaultYear();
        
        $this->downloadClassList($this->queries["s"], $this->queries["y"]);
    }
    
    public function getCurrentSeason()
    {
        $year = intval(date("Y"));
        $mo = intval(date("n"));
        $da = intval(date("j"));
        
        if ($mo > 8)
            $season = "Fall";
        else if ($mo == 1)
            $season = "Winter";
        else if ($mo < 6)
            $season = "Spring";
        else
            $season = "Summer";
            
        return $season;
    }
    
    public function getCurrentYear()
    {
        return intval(date("Y"));
    }
    
    public function getDefaultSeason()
    {
        $mo = intval(date("n"));
        $da = intval(date("j"));
        
        if (2 <= $mo && $mo <= 9)
            $season = "Fall";
        else if (10 == $mo && $da <= 10)
            $season = "Fall";
        else {
            $season = "Spring";
        }
        
        return $season;
    }
    
    public function getDefaultYear()
    {
        $year = intval(date("Y"));
        $mo = intval(date("n"));
        $da = intval(date("j"));
        
        if (($mo > 10 && $da > 10) || $mo < 2)
            $year ++;
        return $year;
    }
    
    public function downloadClassList($season, $year)
    {
        $filename = $season . $year . ".dat";
        $url = "http://www.uwplatt.edu/csse/uwpclasses/" . $year . "/" . $filename;
        $this->getFile($url, "res/".$filename);
        $this->rawClassListContents = file_get_contents("res/".$filename);
    }
    
    private function getFile($url, $out_filename)
    {
        if (file_exists($out_filename)) {
            $local = strtotime(date("F d Y H:i:s.", filemtime($out_filename)));
            $headers = get_headers($url, 1);
            $remote = strtotime($headers["Last-Modified"]);
            
            if ($local < $remote) {
                file_put_contents($out_filename, file_get_contents($url));
            }
        }
        else {
            $file_contents = file_get_contents($url);
            if ($file_contents)
                file_put_contents($out_filename, $file_contents);
        }
    }
}

?>