// ==UserScript==
// @name         ClickUpトラブル記録帳
// @namespace    https://www.faminect.jp/
// @version      1.1
// @description  Clickup画面より↔トラブル管理シートの取扱
// @author       草村安隆 Andrew Lucian Thoreson
// @include      https://app.clickup.com*
// @resource     settings file:///C:/Program Files/QMTM/settings.json
// @connect      google.com
// @connect      googleusercontent.com
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @run-at       document-idle
// ==/UserScript==

function requestEntry(entry) {
  GM_xmlhttpRequest({
      url: JSON.parse(GM_getResourceText('settings')).api.trouble,
      method: "POST",
      data: JSON.stringify({
          entry: entry,
          action: 'get'
      }),
      onload: (res) => {
        console.log(res);
        var json = {};
        res.responseText[0] === "<" ? json.result = "html" : json = JSON.parse(res.responseText)
        console.log("Status: " +json.result);
        switch (json.result) {
          case "success":
            displayEntry(json.data);
            document.getElementById("addInfo").removeAttribute('disabled');
            document.getElementById("addInfo").addEventListener('click', addInfoToBody);
            break;
          case "notFound":
            displayEntry(createEntry());
            break;
          case "html":
            var w = window.open("about:blank", "_blank", "");
            w.document.write(res.responseText);
            break;
          default:
           console.log("Error: "+json.error);
        }
      }
    });
}

function displayEntry(entry) {
  while (true) {
    var e = document.getElementById("myDiv");
    if (e) { e.remove(); } else { break; }
  }
  Object.keys(entry).forEach((x) => { console.log(x　+ "\n" + entry[x]); })
  var myDiv = document.createElement('div'),
      cuStyle = window.getComputedStyle(document.querySelector(".task-name-block"), null),
      clickup = {
        backgroundColor: cuStyle.background,
        color: cuStyle.color
      }
  myDiv.innerHTML = getHTML(entry, clickup);
  document.querySelector(".task-column_main").appendChild(myDiv);
  document.getElementById("update").addEventListener("click", update, false);
}

function createEntry() {
  document.getElementById("addInfo").setAttribute('disabled', true);
  return {
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
  var myDiv = document.createElement('div');
  myDiv.innerHTML = `<div class="cu-task-info cu-task-info_row ng-tns-c3-0 cu-hidden-print ng-star-inserted" style="">
                       <button id="addInfo">　物件情報追加　</button> <button id="hideTroubles">　シート情報を隠す　</button>
                     </div>`;
  document.querySelector('.task__toolbar').appendChild(myDiv);
  document.getElementById("hideTroubles").addEventListener("click", hideTroubles, false);
}

function hideTroubles() {
  var button = document.querySelector('#hideTroubles');
  var myDiv = document.querySelector('#myDiv');
  if (button && myDiv) {
      if (!myDiv.style.display) {
          button.innerText = "　シート情報を示す　";
          myDiv.style.display = "none";
      } else if (myDiv.style.display === "none") {
          button.innerText = "　シート情報を隠す　";
          myDiv.style.display = "";
      }
  }
}

function addInfoToBody() {
  console.log("button clicked!")
  var editor = document.querySelector('.ql-editor');
  editor.click();
  editor.innerHTML += `<div>${sheethostInfo.value}<br /></div><div>${sheetcleaningNumber.value + '\n'}<br /></div><div>${sheetairbnbMail.value}<br /></div>`;
}

function getCreationDate() {
  var a = document.querySelector(".task-history-item__date");
  var b = a.innerText.match(/(.*?)\s(\d*)\s/);
  var c;
  b ? c = new Date(b[1] + "/" + b[2]) : c = new Date();
  c.setHours(c.getHours() + 9);
  c.setYear(2019);
  return c.toISOString().slice(0,10).replace(/-/g, "/");
}

function update() {
  var out = {
    date: document.getElementById("sheetdate").value.slice(0,10).replace(/-/g, "/"),
    error: document.getElementById("sheeterror").value,
    category: document.getElementById("sheetcategory").value,
    lsno: document.getElementById("sheetlsno").value,
    contents: document.getElementById("sheetcontents").value,
    memo: document.getElementById("sheetmemo").value,
    task_id: location.href.match(/(.*)\/([a-z0-9]{5})$/)[2]
  }
  GM_xmlhttpRequest({
    url: JSON.parse(GM_getResourceText('settings')).api.trouble,
    method: "POST",
    data: JSON.stringify({
      entry: out,
      action: 'update'
    }),
    onload: (res) => {
      console.log(res);
      var json = {};
      res.responseText[0] === "<" ? json.result = "html" : json = JSON.parse(res.responseText)
      console.log("Status: " +json.result);
      switch (json.result) {
        case "success":
          document.getElementById("addInfo").removeAttribute('disabled');
          document.getElementById("addInfo").addEventListener('click', addInfoToBody);
          displayEntry(json.data);
          break;
        case "html":
          var w = window.open("about:blank", "_blank", "");
          w.document.write(res.responseText);
          break;
        default:
          console.log("Error: "+json.error);
        }
      }
  });
}

function getHTML(entry, clickup) {
 if (entry.lsno === "") {
   var lsno = document.querySelector(".task-name").innerText.match(/[^\d](\d{8})[^\d]|[^\d](\d{7})[^\d]|^(\d{8})[^\d]|^(\d{7})[^\d]/);
   lsno ? entry.lsno = lsno[1] || lsno[2] || lsno[3] || lsno[4] : entry.lsno = "";
 }

  return `
<div class="task-todo" id="myDiv">
  <div id="breakGlass" style="display:none">
  <div class="task-todo__header cu-hidden-print">
   <div class="task-todo__title" id="fakeTitle2" >物件情報
    </div>
  </div>
  <div class="task-todo__section" id="sheetContents" >
    <input type="text" style="background:${clickup.backgroundColor};color:${clickup.color}" name="hostInfo" id="sheethostInfo" placeholder="ホストインフォ" value="${entry.host_info}" size="110" disabled><br />
    <input type="text" style="background:${clickup.backgroundColor};color:${clickup.color}" name="cleaningNumber" id="sheetcleaningNumber" placeholder="清掃番号" value="${entry.cleaning_number}" size="70" disabled>
    <input type="text" style="background:${clickup.backgroundColor};color:${clickup.color}" name="airbnbMail" id="sheetairbnbMail" placeholder="Airbnbアカウント" value="${entry.airbnb_mail}" disabled>
  </div>
  </div>
  <div class="task-todo__header cu-hidden-print">
    <div class="task-todo__title" id="fakeTitle">トラブル管理シート
    </div>
  </div>
  <div class="task-todo__section" id="sheetContents">
    <input type="text" style="background:${clickup.backgroundColor};color:${clickup.color}" name="date" id="sheetdate" id="sheetdate" value="${entry.date.slice(0,10)}付け記入" disabled>
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

    <input type="text" style="background:${clickup.backgroundColor};color:${clickup.color}" name="lsno" id="sheetlsno" placeholder="リスティング番号を記載" value="${entry.lsno}">
    <input type="text" style="background:${clickup.backgroundColor};color:${clickup.color}" name="property" id="sheetproperty" placeholder="自動項目" value="${entry.property}" disabled>
    <input type="text" style="background:${clickup.backgroundColor};color:${clickup.color}" name="host" id="sheethost" placeholder="自動項目" value="${entry.host}" disabled><br>
    <textarea style="background:${clickup.backgroundColor};color:${clickup.color}" cols="60" rows="5" placeholder="トラブル内容を記載" name="contents" id="sheetcontents">${entry.contents}</textarea><br>
    <input type="text" style="background:${clickup.backgroundColor};color:${clickup.color}" name="contract" id="sheetcontract" placeholder="自動項目" value="${entry.contract}" disabled>
    <input type="text" style="background:${clickup.backgroundColor};color:${clickup.color}" name="memo" id="sheetmemo" placeholder="その他メモを記載" value="${entry.memo}">
    <button id="update">更新</button>
  </div>
</div>
`;
}

function checkEntry() {
    var a = location.href.match(/(.*)\/([a-z0-9]{5})$/);
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
var oldhref = location.href;
var checker = setInterval(checkDom, 1500);
setTimeout(checkEntry, 2000);
