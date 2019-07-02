// ==UserScript==
// @name         Room Links
// @namespace    https://www.faminect.jp/
// @version      0.3
// @description  部屋の各サイト、繋がっていこう
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/Altigraph/QMTM/raw/master/RoomLinks.user.js
// @updateURL    https://github.com/Altigraph/QMTM/raw/master/RoomLinks.user.js
// @include      https://app.clickup.com*
// @resource     settings file:///C:/Program Files/QMTM/settings.json
// @resource     mac_settings file:///Users/Shared/settings.json
// @connect      google.com
// @connect      googleusercontent.com
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @run-at       document-idle
// ==/UserScript==

/**
 * Submits XHR request to server and handles the reply.
 *
 * @param {Object}  entry This entry on the spreadsheet.
 * @param {string} lsno Listing number relevant to this entry, if known.
 * @param {string}  action Action to request from server ('get' or 'update').
 *
 * @return null
 */
function handleRequest(entry) {
  GM_xmlhttpRequest({
      url: JSON.parse(settings).api.dev.roomlinks + "?Airbnb=" + entry.Airbnb,
      headers: {
        entry
      },
      method: "GET",
      onload: (res) => {
        console.log(res);
        let json = {};
        if (res.responseText[0] === "<") {
            const w = window.open("about:blank", "_blank", "");
            w.document.write(res.responseText);
            return;
        }
        json = JSON.parse(res.responseText)
        displayEntry(json);
        }
      });
}

function displayEntry(entry) {
  while (true) {
    let e = document.querySelector("#roomLinksDiv");
    if (e) { e.remove(); } else { break; }
  }
  const myDiv = document.createElement('div');
  let appendPlace;
  switch (window.location.host) {
    case "app.clickup.com":
      appendPlace = ".task-column__body-toolbar";
      break;
  }
  myDiv.innerHTML = getHTML(entry);
  document.querySelector(appendPlace).appendChild(myDiv);
}

function getHTML(entry) {
  return `
  <div id="roomLinksDiv">
  <a id="RL-Evernote" class="RL-link" href="https://www.evernote.com/client/web?usernameImmutable=false&login=&login=Sign+in&login=true&#?query=${entry.Airbnb}">Evernote</a>
  <a id="RL-Airhost"  class="RL-link" href="https://cloud.airhost.co/en/houses/${entry.Airhost.house}/rooms/${entry.Airhost.room}/pricings">Airhost</a>
  <!-- <a id="RL-Airbnb"   class="RL-link" href= "https://www.airbnb.com/rooms/${entry.Airbnb}">Airbnb</a>
  <a id="RL-Booking"  class="RL-link" href="https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/availability_calendar.html?lang=ja&hotel_id=${entry.Booking.hotel_id}">Booking</a>
  <a id="RL-Expedia"  class="RL-link" href= "">Expedia</a>
  <a id="RL-Asiayo"   class="RL-link" href= "">AsiaYo</a> -->
  </div>
`;
}

function sendRequestForPage() {
  let key;
  let element;
  switch (window.location.host) {
    case "app.clickup.com":
      element = document.querySelector("input[name=lsno]");
      key =  {Airbnb: element && element.value || document.querySelector(".task-name").textContent.match( /[^\d](\d{7,8})[^\d]|^(\d{7,8})[^\d]/)[1]};
      break;
  }
  key ? handleRequest(key) : console.log("No room-id found...");
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
}

document.addEventListener("transitionend", sendRequestForPage);