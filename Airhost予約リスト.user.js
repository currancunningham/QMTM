// ==UserScript==
// @name         Airhost予約リスト
// @namespace    https://www.faminect.jp/
// @version      1.0.2
// @description  Airhost予約画面から→すぐにSHARE!
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/Altigraph/QMTM/raw/master/Airhost%E4%BA%88%E7%B4%84%E3%83%AA%E3%82%B9%E3%83%88.user.js
// @updateURL    https://github.com/Altigraph/QMTM/raw/master/Airhost%E4%BA%88%E7%B4%84%E3%83%AA%E3%82%B9%E3%83%88.user.js
// @include      https://cloud.airhost.co/en/bookings*
// @grant        GM_setClipboard
// @run-at       context-menu
// ==/UserScript==

(function () {
    const months = ["Jan" , "Feb" , "Mar" , "Apr" , "May" , "Jun" , "Jul" , "Aug" , "Sep" , "Oct" , "Nov" , "Dec"];
    const rows = document.querySelectorAll(".parent");
    let output;
    rows.forEach(row => {
        let link = "https://cloud.airhost.co/en/bookings/" + row.childNodes[0].innerHTML.match(/\d{7}/);
        let guestName = row.childNodes[0].textContent;
        let CI = row.childNodes[1].textContent.replace(/(.*?)\s(\d*)\s(\d{4})/, "$3." +
          (months.indexOf(row.childNodes[1].textContent.replace(/(.*?)\s(\d*)\s(\d{4})/, "$1")) + 1) + ".$2");
        let CO = row.childNodes[2].textContent.replace(/(.*?)\s(\d*)\s(\d{4})/, "$3." +
          (months.indexOf(row.childNodes[2].textContent.replace(/(.*?)\s(\d*)\s(\d{4})/, "$1")) + 1) + ".$2");
        let property = row.childNodes[3].textContent;

        output += property + "\n" + guestName + "\n" + CI + "-" + CO + "\n" + link + "\n\n";
    });

    output ? GM_setClipboard(output) : window.alert("予約なし")
})();
