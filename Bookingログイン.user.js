// ==UserScript==
// @name         Bookingログイン
// @namespace    https://www.faminect.jp/
// @version      1.0.2
// @description  Booking Loginをタッチレスに
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/Altigraph/QMTM/raw/master/Booking%E3%83%AD%E3%82%B0%E3%82%A4%E3%83%B3.user.js
// @updateURL    https://github.com/Altigraph/QMTM/raw/master/Booking%E3%83%AD%E3%82%B0%E3%82%A4%E3%83%B3.user.js
// @include      https://account.booking.com/sign-in*
// @run-at       document-idle
// ==/UserScript==
setInterval(() => {
  const msg = document.querySelector(".bui-form__error");
  if (msg &&
      msg.textContent !== "Enter your username" &&
      msg.textContent !== "ユーザー名を入力してください") {
      return;
  }
  document.getElementsByClassName("bui-button bui-button--primary bui-button--large bui-button--wide")[0].click();
}, 200);
