// ==UserScript==
// @name         Airhost予約リスト
// @namespace    https://www.faminect.jp/
// @version      1.0
// @description  Airhost予約画面から→すぐにSHARE!
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/Altigraph/QMTM/raw/master/Airhost%E4%BA%88%E7%B4%84%E3%83%AA%E3%82%B9%E3%83%88.user.js
// @updateURL    https://github.com/Altigraph/QMTM/raw/master/Airhost%E4%BA%88%E7%B4%84%E3%83%AA%E3%82%B9%E3%83%88.user.js
// @include      https://cloud.airhost.co/en/bookings*
// @grant        GM_setClipboard
// @run-at       context-menu
// ==/UserScript==

(function () {
    var months = ["Jan" , "Feb" , "Mar" , "Apr" , "May" , "Jun" , "Jul" , "Aug" , "Sep" , "Oct" , "Nov" , "Dec"];
    var rows = document.getElementsByClassName("parent");
    var output= "";
    for (var i = 0; i < rows.length; i++) {
        var link = "https://cloud.airhost.co/en/bookings/" + rows[i].childNodes[0].innerHTML.match(/\d{7}/);
        var guestName = rows[i].childNodes[0].innerText;
        var CI = rows[i].childNodes[1].innerText.replace(/(.*?)\s(\d*)\s(\d{4})/, "$3." +
          (months.indexOf(rows[i].childNodes[1].innerText.replace(/(.*?)\s(\d*)\s(\d{4})/, "$1")) + 1) + ".$2");
        var CO = rows[i].childNodes[2].innerText.replace(/(.*?)\s(\d*)\s(\d{4})/, "$3." +
          (months.indexOf(rows[i].childNodes[2].innerText.replace(/(.*?)\s(\d*)\s(\d{4})/, "$1")) + 1) + ".$2");
        var property = rows[i].childNodes[3].innerText;

        output += property + "\n" + guestName + "\n" + CI + "-" + CO + "\n" + link + "\n\n";
    }

    GM_setClipboard(output);
})();
