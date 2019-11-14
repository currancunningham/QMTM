// ==UserScript==
// @name         Airbnbゲストインフォ
// @namespace    https://www.faminect.jp/
// @version      1.3.1
// @description  Airbnbからゲストインフォ快速取得
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/currancunningham/QMTM/raw/master/Airbnb%E3%82%B2%E3%82%B9%E3%83%88%E3%82%A4%E3%83%B3%E3%83%95%E3%82%A9.user.js
// @updateURL    https://github.com/currancunningham/QMTM/raw/master/Airbnb%E3%82%B2%E3%82%B9%E3%83%88%E3%82%A4%E3%83%B3%E3%83%95%E3%82%A9.user.js
// @include      https://www.airbnb.jp/progress/ratings
// @grant        GM_setClipboard
// @run-at       context-menu
// ==/UserScript==

(function() {
    const els = document.querySelectorAll("a[href*='calendar']");
    const listingIop = els[els.length-1].href.match(/\d{7,8}/);
    const phone = document.querySelector("a[href*='tel']").href;
    const guestName = document.querySelector("._26piifo").textContent;

    const rescodeSelectorFromChropath = "body.with-new-header.has-epcot-header:nth-child(2) div.page-container.page-container-responsive.space-top-4 div.row div.col-md-4.col-md-pull-7.bg-white.space-4 div.js-messaging-sidebar-react-container div._1okh7pi0:nth-child(12) div._hgs47m div._1thk0tsb div:nth-child(1) div._j1kt73 > div._czm8crp";
    const rescode = document.querySelector(rescodeSelectorFromChropath).textContent;

    const dateSelectorFromChropath = "body.with-new-header.has-epcot-header:nth-child(2) div.page-container.page-container-responsive.space-top-4 div.row div.col-md-4.col-md-pull-7.bg-white.space-4 div.js-messaging-sidebar-react-container > div:nth-child(3)";
    const ciSelectorFromChropath = "body.with-new-header.has-epcot-header:nth-child(2) div.page-container.page-container-responsive.space-top-4 div.row div.col-md-4.col-md-pull-7.bg-white.space-4 div.js-messaging-sidebar-react-container div._1okh7pi0:nth-child(9) div._hgs47m div._1thk0tsb div:nth-child(1) div._j1kt73 > div._czm8crp"
    const coSelectorFromChropath = "body.with-new-header.has-epcot-header:nth-child(2) div.page-container.page-container-responsive.space-top-4 div.row div.col-md-4.col-md-pull-7.bg-white.space-4 div.js-messaging-sidebar-react-container div._1okh7pi0:nth-child(10) div._hgs47m div._1thk0tsb div:nth-child(1) div._j1kt73 > div._czm8crp"
    let cico = document.querySelector(dateSelectorFromChropath);
    if (cico) {
      cico = cico.textContent.replace(/^(.*?)の予約[\s\S]+$/, "$1");
    } else {
      const ci = document.querySelector(ciSelectorFromChropath).textContent.match(/\s(\d*)月\s(\d*),\s(\d{4})/);
      const co = document.querySelector(coSelectorFromChropath).textContent.match(/\s(\d*)月\s(\d*),\s(\d{4})/);
      cico = ci[3] + "/" + ci[1] + "/" + ci[2] + " ~ " + co[3] + "/" + co[1] + "/" + co[2] ;
    }

    let output = listingIop + " / " + rescode + " / " + guestName + "\n" + cico + "\n" + phone;

    GM_setClipboard(output);
})();
