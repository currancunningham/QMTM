// ==UserScript==
// @name         Booking評価取得
// @namespace    https://www.faminect.jp/
// @version      1.3.2
// @description  Bookingレビューページから取得し、シートまで送る
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/currancunningham/QMTM/raw/master/Booking%E8%A9%95%E4%BE%A1%E5%8F%96%E5%BE%97.user.js
// @updateURL    https://github.com/currancunningham/QMTM/raw/master/Booking%E8%A9%95%E4%BE%A1%E5%8F%96%E5%BE%97.user.js
// @include      https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/reviews.html*
// @resource     settings file:///C:/Program Files/QMTM/settings.json
// @resource     mac_settings file:///Users/Shared/settings.json
// @connect      google.com
// @connect      googleusercontent.com
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       documentIdle
// ==/UserScript==

function getMatches(string, regex, index) {
  index || (index = 1); // default to the first capturing group
  let matches = [];
  let match;
  while (match = regex.exec(string)) {
    matches.push(match[index]);
  }
  return matches;
}

function checkKnownReviews(r) {
  const kr = JSON.parse(GM_getValue("reviews", "[]"));
  const newRev = r.filter(t_r => { return (kr.indexOf(t_r) === -1); });
  GM_setValue("reviews", JSON.stringify(kr.concat(newRev))); //returning to cache
  return newRev;
}

function manualButton() {
  const newReviews = createEntries();
  newReviews.length ? sendToBackend(newReviews) : console.log("No new reviews found.")
}

function copyButton() {
  const newReviews = createEntries();
  newReviews.length ? GM_setClipboard(newReviews) : console.log("No new reviews found.")
}

function sendToBackend(r) {
  r.forEach((this_r) => {
    console.log("New!\n" + this_r);
    GM_xmlhttpRequest({
      url: JSON.parse(settings).api.review,
      method: "POST",
      data: JSON.stringify(this_r),
      onload: (res) => {
        console.log(res.responseText);
        let json = JSON.parse(res.responseText);
      }
    });
  });
}

function createEntries() {
  const hotel_id = document.querySelector('.prop-info__id').textContent.trim();
  const hotel_name = document.querySelector('.prop-info__name').textContent.trim();
  const json = JSON.parse(settings);
  // if (json.ignoredProperties.indexOf(hotel_id) !== -1) {
  //   return [];
  // } For now, we don't want to ignore Half Glamping Hoshioto,
  // and we probably don't need to worry about users going to HD property review pages
  // but this can be adjusted for No Notification Yes Review properties later

  const reviews = document.querySelectorAll('.review-w-score-breakdown');
  let i;

  let output = [];
  reviews.forEach(this_review => {
    let today_ymd       = new Date().toJSON().slice(0,10).replace(/-/g,'/');
    let reservationCode = this_review.innerHTML.match(/<a name="(.*?)"><\/a>/)[1];
    let totalScore      = this_review.querySelector('.bui-review-score__badge').textContent.trim();
    let guestName       = this_review.querySelector('.review-guest-name').textContent.trim();
    let review_block    = this_review.querySelector('.review-block-content')
    let categories      = this_review.querySelectorAll('.bui-score-bar__header');
    let locationScore, correctness, checkin, cleanliness, communication, costperformance;

    let publicReview = "";
    if (review_block) {
      review_block.childNodes.forEach(el => {
        if (el.textContent) {
          publicReview += el.textContent.trim() + "\n"
        }
      });
    }

    categories.forEach(category => {
      let this_score = category.querySelector(".bui-score-bar__score").textContent.trim();
      switch (category.querySelector(".bui-score-bar__title").textContent.trim()) {
        case "ロケーション":
        case "Location":
          locationScore = this_score;
          break;
        case "施設・設備":
        case "Facilities":
          correctness = this_score;
          break;
        case "快適さ":
        case "Comfort":
          checkin = this_score;
          break;
        case "清潔さ":
        case "Cleanliness":
          cleanliness = this_score;
          break;
        case "スタッフ":
        case "Staff":
          communication = this_score;
          break;
        case "コストパフォーマンス":
        case "Value for money":
          costperformance = this_score;
          break;
      }
    });

    let this_output = [json.sheets.booking.account[0] + hotel_id + json.sheets.booking.account[1] + hotel_name + json.sheets.booking.account[2],
                       json.sheets.booking.listingNumber, json.sheets.booking.propName,
                       json.sheets.booking.hostName1[0] + hotel_id + json.sheets.booking.hostName1[1], reservationCode,
                       guestName, json.sheets.booking.cleaningCompany, json.sheets.booking.CI, json.sheets.booking.CO,
                       totalScore, publicReview.trim(),"","","","", communication, cleanliness, locationScore,
                       checkin, correctness, costperformance, today_ymd];

    output.push( this_output );
  });
  return output;
}

function keepButton() {
    if (document.getElementById("manualButton")) { return; }
    let myDiv       = document.createElement ('div');
    myDiv.innerHTML = '<button id="manualButton" type="button">レビューシートへ送信</button><button id="copyButton">レビューをコピー</button>';
    document.querySelector('.btn-group').appendChild(myDiv);
    document.getElementById("manualButton").addEventListener("click", manualButton, false);
    document.getElementById("copyButton").addEventListener("click", copyButton, false);
}

function checkDom() {
  const flags = document.getElementsByClassName("review-w-score-breakdown");
  if (flags.length === 0) {
    console.log("Loading...")
    setTimeout(checkDom, 750);
    return;
  }
  console.log("Booking評価取得クライエント online");

  const newReviews = createEntries();
  newReviews.length ? sendToBackend(newReviews) : closeTM();
}

function closeTM() {
  console.log("No new reviews found.")
  if (window.opener && window.opener.tampermonkey === true) { setTimeout(window.close, 7500); }

}

// Checking for settings file we need to connect to server
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

(function(){
    const url = new URL(document.URL);
    checkDom();
    setInterval(keepButton, 2000)
})();
