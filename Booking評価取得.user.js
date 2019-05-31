// ==UserScript==
// @name         Booking評価取得
// @namespace    https://www.faminect.jp/
// @version      1.1
// @description  Bookingレビューページから取得し、シートまで送る
// @author       草村安隆 Andrew Lucian Thoreson
// @include      https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/reviews.html*
// @resource     settings file:///C:/Program Files/QMTM/settings.json
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
  const knownReviews = JSON.parse(GM_getValue("reviews", "[]"));
  let newRev = [];
  for (var i in knownReviews) {
    for (var j in r){
      if (knownReviews[i].join("") === r[j].join("")) {
          r.splice(j, 1);
      }
    }
  }
  GM_setValue("reviews", JSON.stringify(knownReviews.concat(r))); //returning to cache
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
      url: JSON.parse(GM_getResourceText('settings')).api.review,
      method: "POST",
      data: JSON.stringify(this_r),
      onload: (res) => {
        console.log(res.responseText);
        let json = JSON.parse(res.responseText);
        setTimeout(openReviews(json.hotel_id), 3000);
      }
    });
  });
}

function openReviews(hotel_id) {
    if (!hotel_id) { return; }
    unsafeWindow.openHotelPage(hotel_id);
}

function createEntries() {
  const hotel_id = document.querySelector('.prop-info__id').innerText;
  const hotel_name = document.querySelector('.prop-info__name').innerText;
  //　ボタンで開かないはずのHOTEL IDをこちらに入れてー
  const json = JSON.parse(GM_getResourceText('settings'));
  if (json.ignoredProperties.indexOf(hotel_id) + 1) {
    return [];
  }

  let reviews = document.getElementsByClassName('review-block review-w-score-breakdown');
  let i;

  let output = [];
  for (i = 0; i < reviews.length; i++) {
    let today_ymd       = new Date().toJSON().slice(0,10).replace(/-/g,'/');
    let this_review     = reviews[i];
    let reservationCode = this_review.innerHTML.match(/<a name="(.*?)"><\/a>/)[1];
    let totalScore      = this_review.getElementsByClassName('bui-review-score__badge')[0].innerText;
    let guestName       = this_review.getElementsByClassName('review-guest-name')[0].innerText;
    let publicReview    = this_review.getElementsByClassName('review-block-content')[0];
    if (!!publicReview)
      publicReview    = this_review.getElementsByClassName('review-block-content')[0].innerText;
    let categories      = this_review.getElementsByClassName('bui-score-bar__header');
    let locationScore, correctness, checkin, cleanliness, communication, costperformance;

    let k;
    for (k = 0; k < categories.length; k++){
	  let this_text  = categories[k].getElementsByClassName("bui-score-bar__title")[0].innerText;
	  let this_score = categories[k].getElementsByClassName("bui-score-bar__score")[0].innerText;
      if (this_text == "ロケーション" || this_text == "Location") { locationScore = this_score; }
      else if (this_text == "施設・設備" || this_text == "Facilities") { correctness = this_score; }
      else if (this_text == "快適さ" || this_text == "Comfort") { checkin = this_score; }
      else if (this_text == "清潔さ" || this_text == "Cleanliness") { cleanliness = this_score; }
      else if (this_text == "スタッフ" || this_text == "Staff") { communication = this_score; }
      else if (this_text == "コストパフォーマンス" || this_text == "Value for money" ) { costperformance = this_score; }
    }

    let this_output = [json.sheets.booking.account[0] + hotel_id + json.sheets.booking.account[1] + hotel_name + json.sheets.booking.account[2],
                       json.sheets.booking.listingNumber, json.sheets.booking.propName,
                       json.sheets.booking.hostName1[0] + hotel_id + json.sheets.booking.hostName1[1], reservationCode,
                       guestName, json.sheets.booking.cleaningCompany, json.sheets.booking.CI, json.sheets.booking.CO,
                       totalScore, publicReview,"","","","", communication, cleanliness, locationScore,
                       checkin, correctness, costperformance, today_ymd];

    output.push( this_output );
  }
  return output;
}

function keepButton() {
    if (document.getElementById("manualButton")) { return; }
    var myDiv       = document.createElement ('div');
    myDiv.innerHTML = '<button id="manualButton" type="button">レビューシートへ送信</button><button id="copyButton">レビューをコピー</button>';
    document.querySelector('.btn-group').appendChild(myDiv);
    document.getElementById("manualButton").addEventListener("click", manualButton, false);
    document.getElementById("copyButton").addEventListener("click", copyButton, false);
}

(function(){
    if (!GM_getResourceText('settings')) { window.alert("settings.jsonをC:/Program Files/QMTM/に入れてください！"); }
    const url = new URL(document.URL);
    let newReviews = createEntries();
    newReviews.length ? sendToBackend(newReviews) : console.log("No new reviews found.")
    if (window.opener && window.opener.tampermonkey === true) { window.close(); }
    setInterval(keepButton, 2000)
})();
