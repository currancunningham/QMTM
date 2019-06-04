// ==UserScript==
// @name         Booking評価通知
// @namespace    https://www.faminect.jp/
// @version      1.2.1
// @description  Bookingレビューページから、新レビュー通知発行・各ホテル詳細レビュー記録取得
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/Altigraph/QMTM/raw/master/Booking%E8%A9%95%E4%BE%A1%E9%80%9A%E7%9F%A5.user.js
// @updateURL    https://github.com/Altigraph/QMTM/raw/master/Booking%E8%A9%95%E4%BE%A1%E9%80%9A%E7%9F%A5.user.js
// @include      https://admin.booking.com/hotel/hoteladmin/groups/reviews/index.html*
// @resource     settings file:///C:/Program Files/QMTM/settings.json
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
  var flags = document.getElementsByClassName("bui-flag");
  if (flags.length === 0) {
    console.log("Loading...")
    setTimeout(checkDom, 750);
    return;
  }
  console.log("Booking評価取得クライエント online");
  getAndSendReviews();
}

function tossHotels(a) {
  var a2 = [];
  for (var i = 0; i < a.length; i++) {
    if (JSON.parse(GM_getResourceText('settings')).ignoredProperties.indexOf( a[i].match(/(\d{7})/)[1] ) + 1) {
      continue;
    }
    a2.push(a[i]);
  }
  return a2;
}

function checkKnownReviews(r) {
  var knownReviews = JSON.parse(GM_getValue("reviews", "[]"));
  var newRev = [];
  for (var i in r) {
    if (knownReviews.indexOf(r[i]) + 1) {
      continue;
    } else {
      newRev.push(r[i]);
    }
  }
  return newRev;
}

function sendToBackend(r) {
  r.forEach((this_r) => {
    console.log("Send: " + this_r);
    GM_xmlhttpRequest({
      url: JSON.parse(GM_getResourceText('settings')).api.notification,
      method: "POST",
      data: JSON.stringify([this_r]),
      onload: (res) => {
          var json = JSON.parse(res.responseText);
          console.log(json);
          setTimeout(openReviews(json.hotel_id), 2500);
          GM_setValue("reviews", JSON.stringify(json.knownReviews));
          goodbye()
      }
    });
  });
}

function openReviews(hotel_id) {
    if (!hotel_id) { return; }
    unsafeWindow.openHotelPage(hotel_id);
}

function nothingNewFound() {
  console.log("No new reviews found");
  GM_xmlhttpRequest({
      url: JSON.parse(GM_getResourceText('settings')).api.notification,
      method: "GET",
      onload: (res) => {
        var json = JSON.parse(res.responseText);
        console.log(json)
        setTimeout(openReviews(json.hotel_id), 2500);
        needUpdate(json);
        goodbye();
      }
    });
}

function goodbye() {
    var d = new Date();
    localStorage.setItem("booking_last_seen_time", d.getTime());
    if (window.opener && window.opener.tampermonkey === true) { window.close(); }
    document.title = originalTitle;
}

function needUpdate(json) {
    GM_setValue("reviews", JSON.stringify(json.knownReviews)); //updating cache
    var d = new Date();
    var ud = new Date(parseInt(json.nextUpdate));
    if (d > ud) {
       sendToBackend(['refresh'])
        return true
    } else {
       console.log("Nothing new found.\nNext update at: " + ud.toString())
       return false
    }
}

function getAndSendReviews() {
  var reviews = tossHotels(readReviews());
  if (!!reviews.length) {
    var newReviews = checkKnownReviews(reviews);
    newReviews.length ? sendToBackend(newReviews) : nothingNewFound();
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
  var reviews = document.getElementsByClassName("bui-table__row");
  var out = [];
  for (var i = 1; i < reviews.length; i++) {
    if (JSON.parse(GM_getResourceText('settings')).ignoredProperties.indexOf( reviews[i].innerText.match(regex)[2])+1) {
  	  continue;
  	}
    var fixMonth = reviews[i].innerText.replace(/(\d*)月/, function(p1) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return monthNames[(parseInt(p1) - 1)];
    }).replace(regex,
             "https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/reviews.html?hotel_id=$2\n$1");
    out.push(fixMonth);
 }
 return out;
}

function readReviewsToClipboard() {
  var reviews = readReviews();
  if (!!reviews.length) {
    GM_setClipboard(reviews.join("\n\n※※※※※\n\n"));
  } else {
    GM_setClipboard("No reviews found.");
  }
}

function getOutdated() {
  console.log("Trying outdated hotel ids...")
  GM_xmlhttpRequest({
    url: JSON.parse(GM_getResourceText('settings')).api.notification,
    method: "GET",
    onload: (res) => {
      var json = JSON.parse(res.responseText);
      if (json.hotel_id) {
        setTimeout(getOutdated(), 10000);
        if (json.hotel_id !== localStorage.getItem("lastHotelId"))  {
          localStorage.setItem("lastHotelId", json.hotel_id);
          setTimeout(openReviews(json.hotel_id), 2500);
        }
      }
    }
  });
}

function exportReviews() {
  readReviewsToClipboard();
  replaceLinks();
}

if (!GM_getResourceText('settings')) { window.alert("settings.jsonをC:/Program Files/QMTM/に入れてください！"); }
var myDiv       = document.createElement ('div');
myDiv.innerHTML = '<button id="exportReviews" type="button">予約エクスポート</button><br>\
                  <button id="getOutdated" type="button">自動レビュー取得</button><br>\
                  <button id="openLinks" type="button">表示物件、全て開ける</button><p>【ホテル除き】</p>';

document.querySelector('.bui-page-header').appendChild(myDiv);
document.getElementById("openLinks").addEventListener("click", openLinks, false);
document.getElementById("exportReviews").addEventListener("click", exportReviews, false);
document.getElementById("getOutdated").addEventListener("click", getOutdated, false);
setInterval(replaceLinks, 2000);

var originalTitle = document.title;
document.title = "お待ち・・・";
setTimeout(checkDom, 1500);
