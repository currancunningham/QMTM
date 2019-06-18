// ==UserScript==
// @name         ClickUpトラブル記録帳
// @namespace    https://www.faminect.jp/
// @version      1.2.9
// @description  Clickup画面より↔トラブル管理シートの取扱
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/Altigraph/QMTM/raw/master/ClickUp%E3%83%88%E3%83%A9%E3%83%96%E3%83%AB%E8%A8%98%E9%8C%B2%E5%B8%B3.user.js
// @updateURL    https://github.com/Altigraph/QMTM/raw/master/ClickUp%E3%83%88%E3%83%A9%E3%83%96%E3%83%AB%E8%A8%98%E9%8C%B2%E5%B8%B3.user.js
// @include      https://app.clickup.com*
// @resource     settings file:///C:/Program Files/QMTM/settings.json
// @connect      google.com
// @connect      googleusercontent.com
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @run-at       document-idle
// ==/UserScript==

function handleRequest(entry, lsno, action) {
  GM_xmlhttpRequest({
      url: JSON.parse(GM_getResourceText('settings')).api.trouble,
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
            displayEntry(createEntry(json.data));
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

function requestEntry(entry) {
  const lsno = document.querySelector("#sheetlsno") ? document.querySelector("#sheetlsno").value : "";
  handleRequest(entry, getLS(lsno), 'get');
}

function displayEntry(entry) {
  while (true) {
    let e = document.getElementById("myDiv");
    if (e) { e.remove(); } else { break; }
  }
  Object.keys(entry).forEach((x) => { console.log(x　+ "\n" + entry[x]); })
  const myDiv = document.createElement('div'),
      cuStyle = window.getComputedStyle(document.querySelector(".task-name-block"), null),
      clickup = {
        backgroundColor: cuStyle.background,
        color: cuStyle.color
      }
  myDiv.innerHTML = getHTML(entry, clickup);
  document.querySelector(".task-column_main").appendChild(myDiv);
  document.querySelector('#addInfo').setAttribute('style', ''); //making visible
  const statusButton = document.querySelector("#displayStatus");
  statusButton.addEventListener("click", hideTroubles, false);
  statusButton.textContent = "　シート情報を隠す　";
  statusButton.removeAttribute('disabled');
  document.getElementById("update").addEventListener("click", update, false);
}

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
    task_id: location.href.match(/(.*)\/([a-z0-9]{5})$/)[2]
  }
}

function addButtons() {
  while (true) {
    let e = document.getElementById("myButtonDiv");
    if (e) { e.remove(); } else { break; }
  }
  const myDiv = document.createElement('div');
  myDiv.innerHTML = `<div class="cu-task-info cu-task-info_row ng-tns-c3-0 cu-hidden-print ng-star-inserted" id="myButtonDiv">
                       <button id="addInfo" style="display:none">　物件情報追加　</button> <button id="displayStatus" disabled>　Loading...　</button>
                     </div>`;
  document.querySelector('.task__toolbar').appendChild(myDiv);
  document.getElementById("addInfo").addEventListener('click', addInfoToBody);
  setTimeout(tryAgain, 5000);
}

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

function hideTroubles() {
  let button = document.querySelector('#displayStatus');
  let myDiv = document.querySelector('#myDiv');
  if (button && myDiv) {
      if (!myDiv.style.display) {
          button.textContent = "　シート情報を示す　";
          myDiv.style.display = "none";
      } else if (myDiv.style.display === "none") {
          button.textContent = "　シート情報を隠す　";
          myDiv.style.display = "";
      }
  }
}

function addInfoToBody() {
  console.log("button clicked!")
  const editor = document.querySelector('.ql-editor');
  editor.click();
  editor.innerHTML += `<div>${sheethostInfo.value}<br /></div><div>${sheetcleaningNumber.value + '\n'}<br /></div><div>${sheetairbnbMail.value}<br /></div>`;
}

function getCreationDate() {
  const a = document.querySelector(".task-history-item__date");
  const b = a.textContent.trim().match(/(.*?)\s(\d*)\s/);
  let c;
  b ? c = new Date(b) : c = new Date();
  c.setHours(c.getHours() + 9);
  c.setYear(2019);
  return c.toISOString().slice(0,10).replace(/-/g, "/");
}

function update() {
  const out = {
    date: document.querySelector("#sheetdate").value.slice(0,10).replace(/-/g, "/"),
    error: document.querySelector("#sheeterror").value,
    category: document.querySelector("#sheetcategory").value,
    lsno: document.querySelector("#sheetlsno").value,
    contents: document.querySelector("#sheetcontents").value,
    memo: document.querySelector("#sheetmemo").value,
    task_id: location.href.match(/(.*)\/([a-z0-9]{5})$/)[2]
  }
  handleRequest(out, out.lsno, 'update');
}

function getLS(entrylsno) {
  let outlsno;
  entrylsno += " "
  const regex = /[^\d](\d{8})[^\d]|[^\d](\d{7})[^\d]|^(\d{8})[^\d]|^(\d{7})[^\d]/;
  if (!entrylsno.match(regex)) {
    const lsno = document.querySelector(".task-name").textContent.match(regex);
    lsno ? outlsno = lsno[1] || lsno[2] || lsno[3] || lsno[4] : outlsno = "";
  } else {
    outlsno = entrylsno.replace(/\s/, "");
  }
  return outlsno;
}

function html_inputText_constructor(clickup, name, placeholder, value, misc, disabled) {
  var misc = misc || "";
  var disabled = disabled ? " disabled" : "";
  return `<input type="text" style="background:${clickup.backgroundColor};color:${clickup.color}" name="${name}" id="sheet${name}" placeholder="${placeholder}" value="${value}" ${misc}${disabled}>`;
}

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
    <input style="background:${clickup.backgroundColor};color:${clickup.color}" placeholder="選択してください" id="sheeterror" list="error" value="${entry.error}">
      <datalist id="error">
        <option value="運用前トラブル">
        <option value="システム＆設定ミス（自社ミス）">
        <option value="システムエラー（サイトミス）">
        <option value="メッセージミス">
        <option value="その他不可避">
      </datalist>

    <input style="background:${clickup.backgroundColor};color:${clickup.color}" placeholder="選択してください" id="sheetcategory" list="category" value="${entry.category}">
      <datalist id="category">
        <option value="破損・汚損">
        <option value="盗難・紛失">
        <option value="故障">
        <option value="ダブルブッキング">
        <option value="レイトチェックアウト">
        <option value="清掃不備（リネン汚れ含む）">
        <option value="清掃遅延">
        <option value="清掃漏れ">
        <option value="鍵トラブル">
        <option value="wifiトラブル">
        <option value="テンプレート・リスティング">
        <option value="点検">
        <option value="ゲスト要望（酌量すべき事情含む）">
        <option value="ホスト要望">
        <option value="部屋環境・周辺に対する苦情（虫・異臭含む）">
        <option value="備品購入">
        <option value="その他">
        <option value="騒音">
        <option value="設備問題">
        <option value="物品問題">
      </datalist>

    ${html_inputText_constructor(clickup, "lsno", "リスティング番号を記載", entry.lsno)}
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

function checkEntry() {
    const a = location.href.match(/(.*)\/([a-z0-9]{5})$/);
    if (a) {
      addButtons();
      requestEntry(a[2]);
    }
}

function checkDom() {
  if (location.href !== oldhref) {
      checkEntry();
      oldhref = location.href
  }
}

if (!GM_getResourceText('settings')) { window.alert("settings.jsonをC:/Program Files/QMTM/に入れてください！"); }
let oldhref = location.href;
const checker = setInterval(checkDom, 1500);
setTimeout(checkEntry, 2000);
