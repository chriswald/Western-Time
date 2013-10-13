function analytics(metrics) {
    $.post("analytics.php", {m: metrics});
}