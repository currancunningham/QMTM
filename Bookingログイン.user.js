// ==UserScript==
// @name         Bookingログイン
// @namespace    https://www.faminect.jp/
// @version      1.0
// @description  Booking Loginをタッチレスに
// @author       草村安隆 Andrew Lucian Thoreson
// @include      https://account.booking.com/sign-in*
// @run-at       document-idle
// ==/UserScript==
setInterval(() => {
    if (document.getElementsByClassName("bui-form__error").length !== 0 &&
        document.getElementsByClassName("bui-form__error")[0].innerText !== "Enter your username" &&
        document.getElementsByClassName("bui-form__error")[0].innerText !== "ユーザー名を入力してください") {
        return;
    }
    document.getElementsByClassName("bui-button bui-button--primary bui-button--large bui-button--wide")[0].click();
}, 200);
