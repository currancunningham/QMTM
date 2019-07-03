// ==UserScript==
// @name         ClickUpトラブル記録帳
// @namespace    https://www.faminect.jp/
// @version      1.3.2
// @description  Clickup画面より↔トラブル管理シートの取扱
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/Altigraph/QMTM/raw/master/ClickUp%E3%83%88%E3%83%A9%E3%83%96%E3%83%AB%E8%A8%98%E9%8C%B2%E5%B8%B3.user.js
// @updateURL    https://github.com/Altigraph/QMTM/raw/master/ClickUp%E3%83%88%E3%83%A9%E3%83%96%E3%83%AB%E8%A8%98%E9%8C%B2%E5%B8%B3.user.js
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
function handleRequest(entry, lsno, action) {
  GM_xmlhttpRequest({
      url: JSON.parse(settings).api.trouble,
      method: "POST",
      data: JSON.stringify({
          entry: entry,
          lsno: lsno,
          action: action
      }),
      onload: (res) => {
        console.log(res);
        let json = {};
        res.responseText[0] === "<" ? json.result = "html" : json = JSON.parse(res.responseText)
        console.log("Status: " +json.result);
        let w;
        switch (json.result) {
          case "success":
            displayEntry(json.data);
            break;
          case "notFound":
            displayEntry(createEntry(json.data));``
            break;
          case "html":
            w = window.open("about:blank", "_blank", "");
            w.document.write(res.responseText);
            break;
          default:
           document.querySelector("#displayStatus").textContent = "　Error!　";
           console.log("Error: "+json.error.message);
           checkEntry();
        }
      }
    });
}

/**
 * Attempts to find listing number and request the spreadsheet entry.
 *
 * @param {Object}  entry This entry on the spreadsheet.
 * @return null
 */
function requestEntry(entry) {
  const lsno = document.querySelector("#sheetlsno") ? document.querySelector("#sheetlsno").value : "";
  handleRequest(entry, getLS(lsno), 'get');
}

/**
 * Takes the entry object and displays its contents on the page.
 *
 * Will remove any previously displayed entries, and also attempt to get
 * the oldest known date and update the spreadsheet if that field is blank.
 *
 * @param {Object}  entry This entry on the spreadsheet.
 *
 * @return null
 */
function displayEntry(entry) {
  var autoUpdate = false;
  while (true) {
    let e = document.getElementById("myDiv");
    if (e) { e.remove(); } else { break; }
  }
  Object.keys(entry).forEach((x) => { console.log(x　+ "\n" + entry[x]); })
  if (entry.date === "") {
    entry.date = getCreationDate();
    autoUpdate = true;
  }
  const myDiv = document.createElement('div'),
      cuStyle = window.getComputedStyle(document.querySelector(".task-name-block"), null),
      clickup = {
        backgroundColor: cuStyle.background,
        color: cuStyle.color
      }
  myDiv.innerHTML = getHTML(entry, clickup);
  document.querySelector(".task-column_main").appendChild(myDiv);
  const rlEvernote = document.querySelector("#RL-Evernote");
  if (rlEvernote) { rlEvernote.setAttribute('href',
   `https://www.evernote.com/client/web?usernameImmutable=false&login=&login=Sign+in&login=true&#?query=${entry.lsno}`); }
  if (autoUpdate) { update(); }
  document.querySelector('#addInfo').setAttribute('style', ''); //making visible
  const statusButton = document.querySelector("#displayStatus");
  statusButton.addEventListener("click", hideTroubles, false);
  statusButton.textContent = "　情報を隠す　";
  statusButton.removeAttribute('disabled');
  document.getElementById("update").addEventListener("click", update, false);
}

/**
 * Creates a blank entry for use in case this entry was not found on the spreadsheet.
 *
 * @param {Object}  data Information returned from spreadsheet.
 *
 * @return null
 */
function createEntry(data) {
  return {
    cleaning_number: data.cleaning_number,
    host_info: data.host_info,
    airbnb_mail: data.airbnb_mail,
    date: getCreationDate(),
    error: '',
    category: '',
    lsno: '',
    property: '',
    host: '',
    contents: '',
    contract: '',
    memo: '',
    task_id: location.href.match(/(.*)\/([a-z0-9]{5,})$/)[2]
  }
}

/**
 * Adds UI buttons to the page.
 *
 * @return null
 */

function addButtons() {
  let toolbar = document.querySelector('.task__toolbar');
  if (!toolbar) {
   return setTimeout(addButtons, 1000);
  }
  while (true) {
    let e = document.getElementById("myButtonDiv");
     if (e) {
      e.remove();
    } else {
     break;
    }
  }
  const myDiv = document.createElement('div');
  myDiv.innerHTML = `<div class="cu-task-info cu-task-info_row ng-tns-c3-0 cu-hidden-print ng-star-inserted" id="myButtonDiv">
                       <button id="addInfo" style="display:none">　物件情報追加　</button> <button id="displayStatus" disabled>　(ー) Loading 　</button>
                     </div>`;
  document.querySelector('.task__toolbar').appendChild(myDiv);
  document.getElementById("addInfo").addEventListener('click', addInfoToBody);
  spinner(document.querySelector("#displayStatus"));
  setTimeout(tryAgain, 5000);
}

/**
 * Handles try again button
 *
 * @return null
 */
function tryAgain(){
  let button = document.getElementById("displayStatus");
  if (button.textContent !== "　Loading...　") {
    console.log("Button loaded");
    return;
   }
  console.log("Request to server timed out? Try again?");
  button.removeAttribute('disabled');
  button.textContent = "　Try Again?　";
  button.addEventListener('click', checkEntry);
}

/**
 * Handles hide spreadsheet info button
 *
 * @return null
 */
function hideTroubles() {
  let button = document.querySelector('#displayStatus');
  let myDiv = document.querySelector('#myDiv');
  if (button && myDiv) {
      if (!myDiv.style.display) {
          button.textContent = "　情報を示す　";
          myDiv.style.display = "none";
      } else if (myDiv.style.display === "none") {
          button.textContent = "　情報を隠す　";
          myDiv.style.display = "";
      }
  }
}

/**
 * Adds information to ClickUp task based on data from spreadsheet.
 *
 * @return null
 */
function addInfoToBody() {
  console.log("button clicked!")
  const editor = document.querySelector('.ql-editor');
  editor.click();
  editor.innerHTML += `<div>${sheethostInfo.value}<br /></div><div>${sheetcleaningNumber.value + '\n'}<br /></div><div>${sheetairbnbMail.value}<br /></div>`;
}

/**
 * Attempts to find date of creation for entry and returns YYYY-MM-DD string.
 *
 * @return {string} ISO Formatted date string (YYYY-MM-DD).
 */
function getCreationDate() {
  const sheetdate =  document.querySelector("#sheetdate");
  if (sheetdate && sheetdate.value.slice(0,10).replace(/-/g, "/"))  {
    return sheetdate.value.slice(0,10).replace(/-/g, "/");
  }
  const a = document.querySelector(".task-history-item__date");
  const b = a.textContent.trim().match(/(.*?)\s(\d*)\s/);
  let c;
  b ? c = new Date(b) : c = new Date();
  c.setHours(c.getHours() + 9);
  c.setYear(2019);
  return c.toISOString().slice(0,10).replace(/-/g, "/");
}

/**
 * I'll try spinning.
 *
 * That's a cool trick.
 *
 * @param {Object} el DOM element
 *
 * @return {numeric} ID of setInterval
 */

function spinner(el){
  return setInterval(function(){
    el.innerHTML = el.innerHTML.replace(/(丨|＼|ー|／)/,  function(p1){
     switch (p1) {
       case "丨":
         return "／";
       case "＼":
         return "丨";
       case "ー":
         return "＼";
       case "／":
         return "ー";
       }
     });
  }, 110);
}

/**
 * Updates entry using information input on form.
 *
 * @return null
 */
function update() {
  var upButton = document.querySelector("#update");
  upButton.innerHTML = " ／ ";
  spinner(upButton);
  const out = {
    date: getCreationDate(),
    error: document.querySelector("#sheeterror").value,
    category: document.querySelector("#sheetcategory").value,
    lsno: document.querySelector("#sheetlsno").value,
    contents: document.querySelector("#sheetcontents").value,
    memo: document.querySelector("#sheetmemo").value,
    task_id: location.href.match(/(.*)\/([a-z0-9]{5,})$/)[2]
  }
  handleRequest(out, out.lsno, 'update');
}

/**
 * Checks that other functions are collecting valid lsno, or attempts to find a valid one.
 *
 * @param {string} lsno Listing number relevant to this entry, if known.
 *
 * @return {string} Listing number relevant to this entry, if known.
 */
function getLS(entrylsno) {
  let outlsno;
  entrylsno += " "
  const regex = /[^\d](\d{7,8})[^\d]|^(\d{7,8})[^\d]/;
  if (!entrylsno.match(regex)) {
    const lsno = document.querySelector(".task-name").textContent.match(regex);
    lsno ? outlsno = lsno[1] || lsno[2] || lsno[3] || lsno[4] : outlsno = "リスティング番号不明";
  } else {
    outlsno = entrylsno.replace(/\s/, "");
  }
  return outlsno;
}

/**
 * Creates an HTML Input Text element.
 *
 * @param {Object}  clickup Clickup background/text color.
 * @param {string}  name Name of the element.
 * @param {string}  placeholder Placeholder text to be used in this field.
 * @param {string}  value Default value for field (e.g. from spreadsheet).
 * @param {string}  misc Other misc. HTML parameters, as a string.
 * @param {boolean} disabled Should field disallow changes?
 *
 * @return {string} HTML element as a string
 */
function html_inputText_constructor(clickup, name, placeholder, value, misc, disabled) {
  misc = misc || "";
  disabled = disabled ? " disabled" : "";
  return `<input type="text" style="background:${clickup.backgroundColor};color:${clickup.color}" name="${name}" id="sheet${name}" placeholder="${placeholder}" value="${value}" ${misc}${disabled}>`;
}


/**
 * Creates an HTML Input selector element.
 *
 * @param {Object}  clickup Clickup background/text color.
 * @param {string}  name Name of the element.
 * @param {string}  placeholder Placeholder text to be used in this field.
 * @param {string}  value Default value for field (e.g. from spreadsheet).
 * @param {Array}   options Array of strings to be used as options.
 *
 * @return {string} HTML element as a string
 */
function html_inputSelector_constructor(clickup, name, placeholder, value, options) {
  return `
  <input style="background:${clickup.backgroundColor};color:${clickup.color}" placeholder="${placeholder}" id="sheet${name}" list="${name}" value="${value}">
    <datalist id="${name}">
      ${html_options(options)}
    </datalist>`;
}


/**
 * Creates a list of options for an HTML Datalist.
 *
 * @param {Array}   options Array of strings to be used as options.
 *
 * @return {string} HTML <option>s as a string.
 */
function html_options(options) {
  let out = "";
  options.forEach(opt => {
    out += "<option value=\"" + opt + "\">\n";
  });
  return out;
}

/**
 * Creates the HTML template to be added to the page
 *
 * @param {Object}  entry   Entry object containing relevant field data.
 * @param {Object}  clickup Clickup background/text color.
 *
 * @return {string} HTML form as a string
 */
function getHTML(entry, clickup) {
  entry.lsno = getLS(entry.lsno);

  return `
<div class="task-todo" id="myDiv">
  <div id="breakGlass" style="display:none">
    <div class="task-todo__header cu-hidden-print">
      <div class="task-todo__title" id="fakeTitle2" >物件情報
      </div>
    </div>
    <div class="task-todo__section" id="sheetContents" >
      ${html_inputText_constructor(clickup, "hostInfo", "ホストインフォ", entry.host_info, "size=\"110\"", true)}<br />
      ${html_inputText_constructor(clickup, "cleaningNumber", "清掃番号", entry.cleaning_number, "size=\"70\"", true)}<br />
      ${html_inputText_constructor(clickup, "airbnbMail", "Airbnbアカウント", entry.airbnb_mail, "", true)}
    </div>
  </div>

  <div class="task-todo__header cu-hidden-print">
    <div class="task-todo__title" id="fakeTitle">トラブル管理シート
    </div>
  </div>

  <div class="task-todo__section" id="sheetContents">
    ${html_inputText_constructor(clickup, "date", `${entry.date.slice(0,10)}付け記入`, "", true)}
    ${html_inputSelector_constructor(clickup, "error", "選択してください", entry.error,
    ["運用前トラブル","システム＆設定ミス（自社ミス）","システムエラー（サイトミス）",
    "メッセージミス","その他不可避"])}
    ${html_inputSelector_constructor(clickup, "category", "選択してください", entry.category,
    ["破損・汚損", "盗難・紛失","故障","ダブルブッキング","レイトチェックアウト",
    "清掃不備（リネン汚れ含む）","清掃遅延", "清掃漏れ", "鍵トラブル", "wifiトラブル", "テンプレート・リスティング", "点検",
    "ゲスト要望（酌量すべき事情含む）", "ホスト要望", "部屋環境・周辺に対する苦情（虫・異臭含む）", "備品購入",
    "その他", "騒音", "設備問題", "物品問題"])}
    ${html_inputText_constructor(clickup, "lsno", "リスティング番号を記載", entry.lsno)}
    <div id="hidden-lsno" style="display:none">${entry.lsno}</div>
    ${html_inputText_constructor(clickup, "property", "自動項目", entry.property, 'size="55"', true)}
    ${html_inputText_constructor(clickup, "host", "自動項目", entry.host, "", true)}<br />
    <textarea style="background:${clickup.backgroundColor};color:${clickup.color}" cols="60" rows="5" placeholder="トラブル内容を記載" name="contents" id="sheetcontents">${entry.contents}</textarea><br>
    ${html_inputText_constructor(clickup, "contract", "自動項目", entry.contract, "", true)}
    ${html_inputText_constructor(clickup, "memo", "その他メモを記載", entry.memo)}
    <button id="update">更新</button>
  </div>
</div>
`;
}

/**
 * Checks if page is a valid entry; adds UI buttons and sends server request if so.
 *
 * @return null
 */
function checkEntry() {
    const a = location.href.match(/(.*)\/([a-z0-9]{5,})$/);
    if (a) {
      addButtons();
      requestEntry(a[2]);
    }
}

/**
 * Checks if the page has updated since last update, and calls checkEntry if so.
 *
 * @return null
 */
function checkDom() {
  if (location.href !== oldhref) {
    oldhref = location.href
    checkEntry();
  }
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

let oldhref; // Used by checkDom to check for page updates
document.addEventListener("transitionstart", checkDom);

// Adds mousewheel side-to-side page flipping
document.addEventListener("mousewheel", (e) => {
  function tryClick(el) {
    const button = document.querySelector(el);
    button ? button.click() : console.log(el + " not found")
  }
  if (e.deltaX > 0 ) {
    tryClick(".preview-forward");
  } else if (e.deltaX < 0) {
    tryClick(".preview-back");
  }
});
