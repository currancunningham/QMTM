// ==UserScript==
// @name         Airbnbゲストインフォ
// @namespace    https://www.faminect.jp/
// @version      1.0.2
// @description  Airbnbからゲストインフォ快速取得
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/Altigraph/QMTM/raw/master/Airbnb%E3%82%B2%E3%82%B9%E3%83%88%E3%82%A4%E3%83%B3%E3%83%95%E3%82%A9.user.js
// @updateURL    https://github.com/Altigraph/QMTM/raw/master/Airbnb%E3%82%B2%E3%82%B9%E3%83%88%E3%82%A4%E3%83%B3%E3%83%95%E3%82%A9.user.js
// @include      https://www.airbnb.jp/progress/ratings
// @grant        GM_setClipboard
// @run-at       context-menu
// ==/UserScript==

(function() {
    let listingIop;
    let els = document.querySelectorAll("a[href*='calendar']");
    els.forEach(function(x) { listingIop = x.href.match(/\d{8}|\d{7}/); });

    let phone;
    let phoneels = document.querySelectorAll("a[href*='tel']");
    phoneels.forEach(function(x) { phone = x.href; });

    let guestName = document.querySelector("._26piifo").innerText;
    let czm = document.getElementsByClassName("_czm8crp");

    let rescodeSelectorFromChropath = "body.with-new-header.has-epcot-header:nth-child(2) div.page-container.page-container-responsive.space-top-4 div.row div.col-md-4.col-md-pull-7.bg-white.space-4 div.js-messaging-sidebar-react-container div._1okh7pi0:nth-child(12) div._hgs47m div._1thk0tsb div:nth-child(1) div._j1kt73 > div._czm8crp";
    let dateSelectorFromChropath = "body.with-new-header.has-epcot-header:nth-child(2) div.page-container.page-container-responsive.space-top-4 div.row div.col-md-4.col-md-pull-7.bg-white.space-4 div.js-messaging-sidebar-react-container > div:nth-child(3)";
    let rescode = document.querySelector(rescodeSelectorFromChropath).textContent;
    let cico = document.querySelector(dateSelectorFromChropath).textContent.replace(/^(.*?)の予約[\s\S]+$/, "$1");

    let output = listingIop + " / " + rescode + " / " + guestName + "\n" + cico + "\n" + phone;

    GM_setClipboard(output);
})();
