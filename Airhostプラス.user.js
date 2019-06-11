// ==UserScript==
// @name         Airhostプラス
// @namespace    https://www.faminect.jp/
// @version      0.1
// @description  Airbnb画面をプラスα
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/Altigraph/QMTM/raw/master/Airhost%E3%83%97%E3%83%A9%E3%82%B9.user.js
// @updateURL    https://github.com/Altigraph/QMTM/raw/master/Airhost%E3%83%97%E3%83%A9%E3%82%B9.user.js
// @include      https://cloud.airhost.co/*
// @run-at       document-idle
// ==/UserScript==

const path = document.location.pathname;
if (path.match(/houses/)) {
  const prop = document.querySelector(".house-cropped-name").textContent;
  prop ? document.title += " | " + prop : console.log("Property name not found.")
} else if (path.match(/bookings/)) {
  // stuff for individual reservations...
} else if (path.match(/users/)) {
  // stuff for staff...
}
