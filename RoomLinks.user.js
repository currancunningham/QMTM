// ==UserScript==
// @name         Room Links
// @namespace    https://www.faminect.jp/
// @version      0.4.2
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
        oldel = el.textContent;
        let json = {};
        if (res.responseText[0] === "<") {
            const w = window.open("about:blank", "_blank", "");
            w.document.write(res.responseText);
            return;
        }
        json = JSON.parse(res.responseText)
        json.Airbnb ? displayEntry(json) : console.log('Bad response from server: ' + json.response);
        }
      });
}

function displayEntry(entry) {
  if (entry.Airbnb === olden) { return; }
  while (true) {
    let e = document.querySelector("#roomLinksDiv");
    if (e) { e.remove(); } else { break; }
  }
  olden = entry.Airbnb;
  const myDiv = document.createElement('div');
  const els = document.querySelectorAll(sites[window.location.host].appendParent);
  const appendPlace = els[els.length-1];
  myDiv.innerHTML = getHTML(entry);
  appendPlace ? appendPlace.appendChild(myDiv) : console.log("Didn't find parent to append to");
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


function extractLsnoTextContent(css_query) {
  const lsnoRegex = /[^\d](\d{7,8})[^\d]|^(\d{7,8})[^\d]|[^\d](\d{7,8})$/;
  const els = document.querySelectorAll(css_query);
  const text_el = els[els.length - 1];
  const tmp = text_el ? text_el.textContent.match(lsnoRegex) : console.log("CSS Query not found...");
  if (text_el && tmp) {
    const lsno = tmp[1]|tmp[2]|tmp[3];
    return lsno;
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

function extractLsnoFallback(site){
  switch (site) {
    case 'cloud.airhost.co': {
      const path = window.location.pathname.match(/\d{5}/g);
      return `Airhost_Room_ID=${path[1]}`
      break;
    }
  }
}

function sendRequestForPage() {
  const site = window.location.host
  const pageTextContent = extractLsnoTextContent(sites[site].lsnoContainer);
  const query = pageTextContent ? "Airbnb_Room_ID=" + pageTextContent : extractLsnoFallback(site);
  console.log("Query is: " + query)
  query ?　handleRequest(query) : console.log("No room-id found...");
}

function checkDom(){
  var els = document.querySelectorAll(sites[window.location.host].domElement)
  el = els[els.length-1]
  if (el&&el.textContent === oldel) { return; }
  console.log("check_element updated")
  el ? sendRequestForPage() : setTimeout(checkDom, 2000);
}

const sites = {
  'app.clickup.com': {
    'domElement': 'div.task-name',
    'lsnoContainer': 'div.task-name',
    'appendParent': '.task-column__body-toolbar',
    'event': () => {
      document.addEventListener('transitionend', checkDom);
      return true;
    }
  },
  'cloud.airhost.co': {
    'domElement': '.navigation-header',
    'lsnoContainer': '[selected=selected]',
    'appendParent': '.navigation-header',
    'event':  () => {
      setTimeout(checkDom, 1000);
      return true;
    }
  },
  'mail.google.com': {
    'domElement': 'table[class^=\'m_\']',
    'lsnoContainer': 'table[class^=\'m_\']',
    'appendParent': '.hP',
    'event': () => {
      setInterval(checkDom, 1500)
      return true;
    }
  }
}

let el,
    oldel,
    olden;

sites[window.location.host].event();
