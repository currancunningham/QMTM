// ==UserScript==
// @name         Airhostプラス
// @namespace    https://www.faminect.jp/
// @version      0.3.1
// @description  Airbnb画面をプラスα
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/currancunningham/QMTM/raw/master/Airhost%E3%83%97%E3%83%A9%E3%82%B9.user.js
// @updateURL    https://github.com/currancunningham/QMTM/raw/master/Airhost%E3%83%97%E3%83%A9%E3%82%B9.user.js
// @include      https://cloud.airhost.co/*
// @run-at       document-idle
// ==/UserScript==

function changeTitle() {
  const path = document.location.pathname;
  if (path.match(/houses/)) {
    const prop = document.querySelector(".house-cropped-name").textContent;
    prop ? document.title += " | " + prop : setTimeout(changeTitle, 500)
    if (path.match(/pricings/)) {
      document.addEventListener("mousewheel", (e) => {
        if (e.deltaX > 0 ) {
          document.querySelector(".fc-next-button").click();
        } else if (e.deltaX < 0) {
          document.querySelector(".fc-prev-button").click()
        }
      });
    }
  } else if (path.match(/bookings/)) {
    // stuff for individual reservations...
  } else if (path.match(/users/)) {
    // stuff for staff...
  }
}

setTimeout(changeTitle, 200)
