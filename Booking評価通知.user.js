// ==UserScript==
// @name         Booking評価通知
// @namespace    https://www.faminect.jp/
// @version      1.3.1
// @description  Bookingレビューページから、新レビュー通知発行・各ホテル詳細レビュー記録取得
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/currancunningham/QMTM/raw/master/Booking%E8%A9%95%E4%BE%A1%E9%80%9A%E7%9F%A5.user.js
// @updateURL    https://github.com/currancunningham/QMTM/raw/master/Booking%E8%A9%95%E4%BE%A1%E9%80%9A%E7%9F%A5.user.js
// @include      https://admin.booking.com/hotel/hoteladmin/groups/reviews/index.html*
// @resource     settings file:///C:/Program Files/QMTM/settings.json
// @resource     mac_settings file:///Users/Shared/settings.json
// @connect      google.com
// @connect      googleusercontent.com
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_openInTab
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

function waitForUpdate(n) {
  console.log("Next update at: " + n);
}

function checkDom() {
  const flags = document.getElementsByClassName("bui-flag");
  if (flags.length === 0) {
    console.log("Loading...")
    setTimeout(checkDom, 750);
    return;
  }
  console.log("Booking評価取得クライエント online");
  getAndSendReviews();
}

function tossHotels(a) {
  return a.filter(r => {
    const ip = JSON.parse(settings).ignoredProperties;
    return (ip.indexOf(r.match(/(\d{7})/)[1]) === -1);
  });
}

function checkKnownReviews(r) {
  const kr = JSON.parse(GM_getValue("reviews", "[]"));
  const newRev = r.filter(t_r => { return (kr.indexOf(t_r) === -1); });
  GM_setValue("reviews", JSON.stringify(kr.concat(newRev))); //returning to cache
  return newRev;
}

function sendToBackend(r) {
  r.forEach((this_r) => {
    console.log("Send: " + this_r);
    GM_xmlhttpRequest({
      url: JSON.parse(settings).api.notification,
      method: "POST",
      data: JSON.stringify([this_r]),
      onload: (res) => {
        if (res.responseText[0] === "<") {
          const w = window.open("about:blank", "_blank", "");
          w.document.write(res.responseText);
          return;
        }
        const json = JSON.parse(res.responseText);
        console.log(json);
        GM_setValue("reviews", JSON.stringify(json.knownReviews));
        const d = new Date();
        localStorage.setItem("booking_last_seen_time", d.getTime());
         //we set the time here to avoid new windows opening this page again
         //regular notification updates do NOT mean we need to collect ALL expired props!
        if (json.hotel_id) { openReviews(json.hotel_id); }
      }
      });
  });
}

function openReviews(hotel_id) {
  if (hotel_id === "None") {
    goodbye();
    return;
  } else if (hotel_id != localStorage.getItem("lastHotelId")) {
    attempts = 0;
    localStorage.setItem("lastHotelId", hotel_id);
    unsafeWindow.openHotelPage(hotel_id);
  } else if (attempts > 5) {
    console.log("Same Hotel ID five times... we'll try that page again");
    localStorage.setItem("lastHotelId", 0); //We'll try opening the page again
    attempts=0;
   }
  attempts++;
  setTimeout(getUpdate, 20000)
}

function getUpdate() {
  console.log("Getting update from server...");
  GM_xmlhttpRequest({
    url: JSON.parse(settings).api.notification,
    method: "GET",
    onload: (res) => {
      const d = new Date();
      localStorage.setItem("booking_last_seen_time", d.getTime());
      if (res.responseText[0] === "<") {
        const w = window.open("about:blank", "_blank", "");
        w.document.write(res.responseText);
        return;
      }
      const json = JSON.parse(res.responseText);
      GM_setValue("reviews", JSON.stringify(json.knownReviews)); //updating cache
      console.log(json)
      openReviews(json.hotel_id);
    }
  });
}

function goodbye() {
  sendToBackend(['refresh']);
  console.log("All properties received from GAS");
  document.title = originalTitle;
  if (window.opener && window.opener.tampermonkey === true) { setTimeout(window.close, 7500); }
}

function getAndSendReviews() {
  const reviews = tossHotels(readReviews());
  if (!!reviews.length) {
    const newReviews = checkKnownReviews(reviews);
    newReviews.length ? sendToBackend(newReviews) : getUpdate();
  }
}

function replaceLinks (e) {
  var links = [];
  var builinks = document.getElementsByClassName("bui-link bui-link--secondary");
  for (var i = 0; i < builinks.length; i++) {
  	builinks[i].setAttribute("href", builinks[i].href.replace(/general/, 'extranet_ng/manage'));
  	links.push(builinks[i].href);
  }
  return links;
}

function openLinks (e) {
  var links = replaceLinks();
  var unique = links.filter((v, i, a) => a.indexOf(v) === i);
  tossHotels(unique).forEach((link) => {
    GM_openInTab(link, '_blank');
  });
}

function readReviews() {
  var regex = new RegExp(/(.*?)(\d{7})/);
  var reviews = document.querySelectorAll(".bui-table__row");
  var out = [];
  reviews.forEach((r,i) => {
    if (i < 1) { return; } // ignores 0th 'review'; header row
    const hotel_id = r.children[1].textContent.trim();
    if (JSON.parse(settings).ignoredProperties.indexOf(hotel_id) !== -1) { return; }
    const date = r.children[0].textContent.trim().replace(/(\d*)月/, function(p1) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return monthNames[(parseInt(p1) - 1)];
    });
    const prop_name = r.children[2].textContent.trim();
    const score = r.children[3].textContent.trim();
    const text = r.children[4].textContent.trim();

    out.push(`https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/reviews.html?hotel_id=${hotel_id}
${date}
${prop_name}

${score}

${text}`);
  });
 return out;
}

function readReviewsToClipboard() {
  const reviews = readReviews();
  if (!!reviews.length) {
    GM_setClipboard(reviews.join("\n\n※※※※※\n\n"));
  } else {
    console.log("No reviews found");
  }
}

function exportReviews() {
  readReviewsToClipboard();
  replaceLinks();
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


let myDiv       = document.createElement ('div');
myDiv.innerHTML = '<button id="exportReviews" type="button">予約エクスポート</button><br>\
                  <button id="openLinks" type="button">表示物件、全て開ける</button><p>【ホテル除き】</p>';

document.querySelector('.bui-page-header').appendChild(myDiv);
document.querySelector("#openLinks").addEventListener("click", openLinks, false);
document.querySelector("#exportReviews").addEventListener("click", exportReviews, false);
setInterval(replaceLinks, 2000);
let attempts = 0;
const originalTitle = document.title;
document.title = "お待ち・・・";
setTimeout(checkDom, 1500);
