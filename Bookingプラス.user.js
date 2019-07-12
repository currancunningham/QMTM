// ==UserScript==
// @name         Bookingプラス
// @namespace    https://www.faminect.jp/
// @version      0.1
// @description  Booking画面をプラスα
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/Altigraph/QMTM/raw/master/Booking%E3%83%97%E3%83%A9%E3%82%B9.user.js
// @updateURL    https://github.com/Altigraph/QMTM/raw/master/Booking%E3%83%97%E3%83%A9%E3%82%B9.user.js
// @include      https://admin.booking.com/*
// @resource     settings file:///C:/Program Files/QMTM/settings.json
// @resource     mac_settings file:///Users/Shared/settings.json
// @connect      google.com
// @connect      googleusercontent.com
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @run-at       document-idle
// ==/UserScript==

function getInfoFromSheet() {
  return new Promise(resolve => {
    GM_xmlhttpRequest({
        url: `${JSON.parse(settings).api.roomlinks}?Booking_Room_ID=${document.querySelector('.js-room-row').getAttribute('data-room-id')}`,
        method: "GET",
        onload: (res) => {
          let json = {};
          if (res.responseText[0] === "<") {
              const w = window.open("about:blank", "_blank", "");
              w.document.write(res.responseText);
              return;
          }
          json = JSON.parse(res.responseText)
          json.Airbnb ? resolve(json) : resolve({Airbnb: ""});
        }
    });
  });
}

let settings = GM_getResourceText('settings') || GM_getResourceText('mac_settings');
if (!settings) {
    window.alert("settings.jsonをC:/Program Files/QMTM/ (Windows)\n" +
    "または/Users/Shared/ (OS X)に入れたまま、\n" +
    "chrome://extensionsにてファイルURLの許可を確認してください");
    throw 'tampermonkey cannot access settings file!';
} else if(!JSON.parse(settings).ver || JSON.parse(settings).ver < 1) {
   window.alert("settings.jsonはすでに更新しています！Slackより最新バージョンを装備してください。");
   throw 'settings file out of date!'
} else {
  console.log("settings.json load success")
}

async function onStart() {
  console.log('tm start')
  const path = document.location.pathname;
  if (path.match(/booking/)) {
    const sheet = await getInfoFromSheet()
    console.log('tm get sheet' + sheet);
    //document.querySelector(".js-show-phone__link").click()
    //removed due to booking security issues
    const guest = document.querySelector('.bhpb_guest_name_float').textContent.trim() || "";
    const rescode = document.querySelector('.bks-reference').textContent.match(/\d+/)[0] || "";
    const lsno = sheet.Airbnb;
    const ci = document.querySelector('.room_row__info__item > .glyphicon-log-in').parentNode.textContent.trim() || "";
    const co = document.querySelector('.room_row__info__item > .glyphicon-log-out').parentNode.textContent.trim() || "";
    const gno = document.querySelector(".res-detail > .row").textContent.match(/(guests:|宿泊者数：)[\s]*(\d+)/m)[2] || "";
    //const phone = document.querySelector(".info-booking-phone").textContent.replace(/ /g, "-") || "";
    const price = document.querySelector(".res-detail > .row > .col-xs-12").textContent.match(/([¥￥][\d,]+)/)[0] || "";
    const language = document.querySelector(".col-6__print > .bui_font_body").textContent || "";

    document.title += " / 予約ID: " + rescode + " / 物件 " + lsno + " / " + guest;
    document.querySelector("h1").textContent = [guest, rescode, lsno, ci, co, gno + "名", price, language].join(" / ");
  }
}

setTimeout(onStart, 10);
