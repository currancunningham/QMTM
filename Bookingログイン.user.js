// ==UserScript==
// @name         Bookingログイン
// @namespace    https://www.faminect.jp/
// @version      1.3
// @description  Booking Loginをタッチレスに
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/Altigraph/QMTM/raw/master/Booking%E3%83%AD%E3%82%B0%E3%82%A4%E3%83%B3.user.js
// @updateURL    https://github.com/Altigraph/QMTM/raw/master/Booking%E3%83%AD%E3%82%B0%E3%82%A4%E3%83%B3.user.js
// @include      https://account.booking.com/sign-in*
// @run-at       document-idle

// ==/UserScript==

(function clickButton (){
  setInterval(() => {
      const msg = document.querySelector(".bui-form__error");
      const button = document.querySelector(".bui-button--primary");
      if (msg && msg.id !== "loginname-error" ) {
          console.log(msg.textContent);
      } else if (button) {
          button.click();
      } else {
          console.log("Not yet...");
          return;
      }
  }, 200);
  setTimeout(window.close, 7500);
})();
