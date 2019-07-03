// ==UserScript==
// @name         Room Links
// @namespace    https://www.faminect.jp/
// @version      0.4
// @description  部屋の各サイト、繋がっていこう
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/Altigraph/QMTM/raw/master/RoomLinks.user.js
// @updateURL    https://github.com/Altigraph/QMTM/raw/master/RoomLinks.user.js
// @include      https://app.clickup.com*
// @include      https://cloud.airhost.co*
// @include      https://mail.google.com*
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
function handleRequest(query) {
  GM_xmlhttpRequest({
      url: JSON.parse(settings).api.dev.roomlinks + "?" + query,
      method: "GET",
      onload: (res) => {
        oldel = el;
        console.log(res);
        console.log(res.responseText)
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
    case "cloud.airhost.co":
      appendPlace = ".navigation-header";
      break;
    case "mail.google.com":
      appendPlace = ".hP";
      break;
  }
  myDiv.innerHTML = getHTML(entry);
  document.querySelector(appendPlace).appendChild(myDiv);
}

function getHTML(entry) {
  return `
  <div id="roomLinksDiv">
  <style>
  .RL-link {
    font-size: 14px;
    border-style: solid;
    border-width: 1px;
    border-radius: 3px;
    margin: 6px;
    padding: 6px
  }
  </style>
  <!--<p>${entry.Airbnb}:</p>-->
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
  let query,
      el1,
      tmp;
  const path = document.location.pathname;
  switch (window.location.host) {
    case "app.clickup.com": {
      el1 = document.querySelector("input[name=lsno]");
      if (el1) {
        query = "Airbnb=" + el1.value;
      } else {
        query = extractLsnoTextContent(".task-name");
      }
      break;
    }
    case "cloud.airhost.co": {
      if (path.match(/houses/)) {
        query = extractLsnoTextContent("[selected=selected]");
      }
      break;
    }
    case "mail.google.com": {
      query = extractLsnoTextContent("table[class^='m_']");
      break;
    }
  }
  console.log("Query is: "+query)
  query ?　handleRequest(query) : console.log("No room-id found...");
}

function extractLsnoTextContent(css_query) {
  const lsnoRegex = /[^\d](\d{7,8})[^\d]|^(\d{7,8})[^\d]|[^\d](\d{7,8})$/;
  const text_el = document.querySelector(css_query);
  const tmp = text_el ? text_el.textContent.match(lsnoRegex) : console.log("CSS Query not found...");
  if (text_el) {
    const lsno = tmp[1]|tmp[2]|tmp[3];
    return "Airbnb=" + lsno;
  }
  return null
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

let oldel,
    el;

function checkDom(){
  let check_element;
  switch (window.location.host) {
    case "app.clickup.com":
      check_element = ".task-name";
      break;
    case "cloud.airhost.co":
      check_element = ".navigation-header";
      break;
    case "mail.google.com":
      check_element = "table[class^='m_']";
      break;
  }
  el = document.querySelector(check_element)
  if (el === oldel) { return; }
  console.log("check_element updated")
  while (true) {
    let e = document.querySelector("#roomLinksDiv");
    if (e) { e.remove(); } else { break; }
  }
  el ?  sendRequestForPage() : setTimeout(checkDom, 2000);
}

document.addEventListener("transitionstart", checkDom);
setTimeout(checkDom, 3000);
