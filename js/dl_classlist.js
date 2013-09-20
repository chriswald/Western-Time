(function addXhrProgressEvent($) {
    var originalXhr = $.ajaxSettings.xhr;
    $.ajaxSetup({
        xhr: function() {
            var req = originalXhr(), that = this;
            if (req) {
                if (typeof req.addEventListener == "function" && that.progress !== undefined) {
                    req.addEventListener("progress", function(evt) {
                        that.progress(evt);
                    }, false);
                }
                if (typeof req.upload == "object" && that.progressUpload !== undefined) {
                    req.upload.addEventListener("progress", function(evt) {
                        that.progressUpload(evt);
                    }, false);
                }
            }
            return req;
        }
    });
})(jQuery);

// Download a class list dat file.
// season is ("Fall"|"Winter"|"Spring"|"Summer")
// year is a 4 digit year
// callback is the function to be called after a successful request. It will
// receive the response content.
// options is a structure with optional items as defined below:
//  verbose - boolean - True displays log info. Default False.
//  dir - string - directory to look for files in. Default "res/".
//  success_cb - function - Function to be called after successful request, but
//      before callback. also does not receive the response content.
//  progress_cb - function - Function to be called as the request progresses.
//      Good for tracking download percent for large requests. Receives a
//      XMLHTTPRequest object.
//  error_cb - function - Function to be called if the request encounters an
//      error. Also gets called on malformatted season or year, or an unsave
//      directory string.
function DownloadClassList(season, year, callback, options) {
    // Malformed Season
    if (!/^(Fall|Winter|Spring|Summer)$/.test(season)) {
        if (options.verbose)
            console.log("Malformed season: " + season);
        if (typeof options.error_cb !== "undefined")
                options.error_cb();
        return;
    }
    // Malformed Year
    if (!/^[12]\d{3}$/.test(year)) {
        if (options.verbose)
            console.log("Malformed year: " + year);
        if (typeof options.error_cb !== "undefined")
                options.error_cb();
        return;
    }
    // Unsafe directory
    if (/^(\/|~|.*\.\.[\\\/]).*[^\/]$/.test(options.dir)) {
        if (options.verbose)
            console.log("Unsafe directory: " + options.dir);
        if (typeof options.error_cb !== "undefined")
                options.error_cb();
        return;
    }
    var filename = (options.dir || "res/") + season + year + ".dat";
    
    if (options.verbose)
        console.log("Making request for '" + filename + "'");
    
    // Make a request to the web server for the specified dat file.
    $.ajax({
        url: filename,
        success: function(response) {
            if (typeof options.success_cb !== "undefined")
                options.success_cb();
            callback(response);
        },
        progress: options.progress_cb,
        error: options.error_cb
    });
}