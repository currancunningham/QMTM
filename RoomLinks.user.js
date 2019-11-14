// ==UserScript==
// @name         Room Links
// @namespace    https://www.faminect.jp/
// @version      0.6.2
// @description  部屋の各サイト、繋がっていこう
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/currancunningham/QMTM/raw/master/RoomLinks.user.js
// @updateURL    https://github.com/currancunningham/QMTM/raw/master/RoomLinks.user.js
// @include      https://app.clickup.com*
// @include      https://cloud.airhost.co*
// @include      https://mail.google.com*
// @include      https://admin.booking.com*
// @include      https://www.evernote.com*
// @resource     settings file:///C:/Program Files/QMTM/settings.json
// @resource     mac_settings file:///Users/Shared/settings.json
// @connect      google.com
// @connect      googleusercontent.com
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_addStyle
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
        oldel = el.textContent !== null ? el.textContent : "Not found";
        let json = {};
        if (res.responseText[0] === "<") {
            const w = window.open("about:blank", "_blank", "");
            w.document.write(res.responseText);
            return;
        }
        json = JSON.parse(res.responseText)
        oldquery = json.query
        json.Airbnb ? displayEntry(json) : badEntry(json.response);
      }
  });
}

function badEntry(msg) {
  console.log('Bad response from server: ' + JSON.stringify(msg));
  olden = "";
  removeOldEntry();
}

function removeOldEntry() {
  while (true) {
    let e = document.querySelector("#roomLinksDiv");
    if (e) { e.remove(); } else { break; }
  }
}

function displayEntry(entry) {
  if (entry.Airbnb === olden) { return; }
  removeOldEntry();
  olden = entry.Airbnb;
  entry.Airbnb.match(/\d{7,8}/) ? GM_addStyle(' #RL-Airbnb { display:;  }') : GM_addStyle(' #RL-Airbnb { display: none;  }') ;
  entry.Booking.hotel_id.match(/\d{7}/) ? GM_addStyle(' #RL-Booking { display:;  }') : GM_addStyle(' #RL-Booking { display: none;  }');
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
  <a id="RL-Airbnb"   class="RL-link" href= "https://www.airbnb.com/rooms/${entry.Airbnb}">Airbnb</a>
  <a id="RL-Booking"  class="RL-link" href="https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/availability_calendar.html?lang=ja&hotel_id=${entry.Booking.hotel_id}">Booking</a>
  <!--<a id="RL-Expedia"  class="RL-link" href= "">Expedia</a>
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


function sendRequestForPage() {
  const query = sites[window.location.host].getQuery();
  if (query === oldquery) {
    console.log("Query: "+ query +" matches old query "+oldquery);
    return;
  } else if (query == undefined) {
    console.log("Query is: " + query + "(closing)")
    return;
  }
  console.log("Query is: " + query)
  query ?　handleRequest(query) : console.log("No room-id found...");
}

function checkDom(){
  var els = document.querySelectorAll(sites[window.location.host].domElement)
  el = els[els.length-1]
  if (el && el.textContent === oldel || el === undefined) { return; }
  console.log("check_element updated")
  el ? sendRequestForPage() : setTimeout(checkDom, 2000);
}

const sites = {
  'app.clickup.com': {
    'domElement': 'div.task-name',
    'getQuery': () => {
      //add thingy back to get from sheet
      const cusheet = document.querySelector('#sheetlsno')
      if (cusheet) {
        if (cusheet.value === "リスティング番号不明") { return undefined; }
        return "Airbnb_Room_ID=" + cusheet.value;
      } else {
        const title = extractLsnoTextContent('div.task-name')
        if (title) { return "Airbnb_Room_ID=" + title; }
      }
      return undefined
    },
    'appendParent': '.task-column__body-toolbar',
    'start': () => {
      document.addEventListener('transitionstart', checkDom);
      return true;
    }
  },
  'cloud.airhost.co': {
    'domElement': '.navigation-header',
    'getQuery': () => {
      const path = window.location.pathname.match(/\d{5}/g);
      return path ? `Airhost_Room_ID=${path[1]}` : "Airbnb_Room_ID=" + extractLsnoTextContent('[selected=selected]')
    },
    'appendParent': '.navigation-header',
    'start':  () => {
      GM_addStyle(' #RL-Airhost { display: none;  }')
      setTimeout(checkDom, 1000);
    }
  },
  'mail.google.com': {
    'domElement': 'table[class^=\'m_\']',
    'getQuery': () => {
      //add steps to try fetching from name;
      // add <a class="m_3988773367824515790body-text" href="https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/home.html?lang=ja&amp;hotel_id=4116088" style="color:#0896ff;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:17px;text-decoration:none" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/home.html?lang%3Dja%26hotel_id%3D4116088&amp;source=gmail&amp;ust=1562301587450000&amp;usg=AFQjCNE71wCuNTuFznjeqQWYoaELxWjKYw">Union Shin-osaka</a>
      return "Airbnb_Room_ID=" + extractLsnoTextContent('table[class^=\'m_\']')
    },
    'appendParent': '.hP',
    'start': () => {
      setInterval(checkDom, 1500)
    }
  },
  'admin.booking.com': {
    'domElement': '.js-room-row',
    'getQuery': () => {
      return `Booking_Room_ID=${document.querySelector('.js-room-row').getAttribute('data-room-id')}`
    },
    'appendParent': '.js-reservation-note',
    'start': () => {
      GM_addStyle(' #RL-Booking { display: none;  }')
      setTimeout(checkDom, 1500)
    }
  },
  'www.evernote.com': {
    'domElement': '#qa-NOTE_DETAIL',
    'getQuery': () => {
      checkForNote = () => {
        const tags = document.querySelectorAll("div[id^=\'qa-TAG_NAME_\'");
        const hit = Object.keys(tags).find((x) => {
                  return (tags[x].getAttribute('id').match(/\d{7,8}/))
                });
        if (tags && hit) {
          return `Airbnb_Room_ID=${tags[hit].getAttribute('id').match(/\d{7,8}/)}`;
        } else if (!document.querySelector('#qa-NOTE_DETAIL').textContent) {
          console.log('Note detail contents null... waiting...')
          setTimeout(checkForNote, 2000);
          return;
        }
        const lsno = extractLsnoTextContent('#qa-NOTE_DETAIL')
        return `Airbnb_Room_ID=${lsno}`;
      }
      return checkForNote();
    },
    'appendParent': '#qa-NOTE_EDITOR',
    'start': () => {
      GM_addStyle(' #RL-Evernote { display: none;  }')
      document.addEventListener('transitionend', checkDom);
    }
  }
}


let el,
    oldel,
    olden;
let oldquery = "";

sites[window.location.host].start();
