if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement , fromIndex) {
        var i,
            pivot = (fromIndex) ? fromIndex : 0,
            length;
        
        if (!this) {
            throw new TypeError();
        }
        
        length = this.length;
        
        if (length === 0 || pivot >= length) {
            return -1;
        }
        
        if (pivot < 0) {
            pivot = length - Math.abs(pivot);
        }
        
        for (i = pivot; i < length; i++) {
            if (this[i] === searchElement) {
                return i;
            }
        }
        return -1;
    };
}

if (!Array.prototype.filter) {
    Array.prototype.filter=function(g,f,j,i,h){
        j=this;i=[];
        for(h in j){~~h+""==h&&h>=0&&g.call(f,j[h],+h,j)&&i.push(j[h])}
        return i;
    };
}

(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

function getUniqueSections(sec_ary) {
    var a = [];
    for (var i = 0; i < sec_ary.length; i ++) {
        var can_add = true;
        for (var j = 0; j < sec_ary.length; j ++) {
            if (sec_ary[i].class_no === a[j].class_no) {
                can_add = false;
                break;
            }
        }
        if (can_add)
            a.push(sec_ary[i]);
    }
    return a;
}