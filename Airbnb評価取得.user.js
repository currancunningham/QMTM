// ==UserScript==
// @name         Airbnb評価取得
// @namespace    https://www.faminect.jp/
// @version      1.3.2
// @description  Airbnbレビューページから取得し、シートまで送る
// @downloadURL  https://github.com/Altigraph/QMTM/raw/master/Airbnb%E8%A9%95%E4%BE%A1%E5%8F%96%E5%BE%97.user.js
// @uploadURL    https://github.com/Altigraph/QMTM/raw/master/Airbnb%E8%A9%95%E4%BE%A1%E5%8F%96%E5%BE%97.user.js
// @author       草村安隆 Andrew Lucian Thoreson
// @include      https://www.airbnb.jp/progress/ratings*
// @resource     settings file:///C:/Program Files/QMTM/settings.json
// @resource     mac_settings file:///Users/Shared/settings.json
// @connect      google.com
// @connect      googleusercontent.com
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
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

function sendToBackend(r) {
  r.forEach((this_r) => {
    console.log("New!\n" + this_r);
    GM_xmlhttpRequest({
      url: JSON.parse(settings).api.review,
      method: "POST",
      data: JSON.stringify(this_r),
      onload: (res) => {
        console.log(res.responseText);
      }
    });
  });
}

function checkAndSend() {
  let json = JSON.parse(settings);
  let buttons = document.querySelectorAll('button');
  buttons.forEach(b => {
    if (b.textContent === "+ More") { //Opening up full reviews
        b.click();
    }
  });

  let output = [];
  let q = 0;
  let reviews = document.querySelectorAll('._1okh7pi0');
  reviews.forEach(this_review => {
      let today_ymd = new Date().toJSON().slice(0,10).replace(/-/g,'/');
      let totalScore = this_review.querySelector('._atbpe5').innerHTML.match(/aria-label="評価：([\d])／5/)[1];
      let guestName = this_review.querySelector('._1p3joamp').textContent;
      let CICO = this_review.querySelector('._1jlnvra2').textContent.match(/[\d]月[\d]*?日/g);
      let CI = "2019/" + CICO[0].replace(/日/, '').replace(/月/, '/');
      let CO = "2019/" + CICO[1].replace(/日/, '').replace(/月/, '/');
      let roomTitle = this_review.querySelectorAll('._1jlnvra2')[1].textContent;
      let publicReview = this_review.querySelector('._k94v97k').textContent.match(/公開フィードバック(.*?)公開で返信/)[1];

      let privateReviewClass = this_review.querySelector('._1rlifxji');
      let privateReviews = privateReviewClass.querySelectorAll('._czm8crp');
      let privateReview;
      privateReviews.forEach(rev => {
        if(!!rev.textContent && rev.textContent !== undefined) {
            privateReview += "\n" + rev.textContent;
        }
      });

      let locationScore, correctness, checkin, cleanliness, communication, costperformance;
      privateReviewClass.childNodes.forEach(category => {
       switch (category.firstChild.textContent) {
          case "立地":
            locationScore = category.childNodes[1].firstChild.getAttribute('aria-label').match(/評価：(.*?)／5/)[1];
            break;
          case "正確さ":
            correctness = category.childNodes[1].firstChild.getAttribute('aria-label').match(/評価：(.*?)／5/)[1];
            break;
          case "チェックイン":
            checkin = category.childNodes[1].firstChild.getAttribute('aria-label').match(/評価：(.*?)／5/)[1];
            break;
          case "清潔さ":
            cleanliness = category.childNodes[1].firstChild.getAttribute('aria-label').match(/評価：(.*?)／5/)[1];
            break;
          case "コミュニケーション":
            communication = category.childNodes[1].firstChild.getAttribute('aria-label').match(/評価：(.*?)／5/)[1];
            break;
          case "コスパ":
            costperformance = category.childNodes[1].firstChild.getAttribute('aria-label').match(/評価：(.*?)／5/)[1];
            break;
          default:
            break;
        }
      });

      let painPointsClass = this_review.querySelectorAll('._114g51qn');
      let painPoints;
      painPointsClass.forEach(painPoint => {
        if (!!painPointsClass.textContent) {
            painPoints += painPointsClass[k].textContent + " ";
        }
      });

      let thisListing = json.sheets.airbnb.listingNumber.replace(/Not Found or Invalid Entry/, roomTitle);
      let this_id = decodeURI(document.cookie).match(/rclmd\=\{\"(\d+)\"/);
      let thisHost = this_id ? json.sheets.airbnb.hostName.replace(/Not Found or Invalid Entry/, this_id[1]) : hostName;

      let this_output = [thisListing, json.sheets.airbnb.propName, thisHost, json.sheets.airbnb.reservationCode, guestName,
        json.sheets.airbnb.cleaningCompany, CI, CO, totalScore, publicReview, privateReview || "", "", painPoints || "",
        "", communication, cleanliness, locationScore, checkin, correctness, costperformance, today_ymd];
      output.push(this_output);
  });

  sendToBackend(output);
  if (window.opener && window.opener.tampermonkey === true) { window.close(); }
}

function onLoad() {
    let myButton = document.createElement('div');
    myButton.innerHTML='<button id="manualButton" type="button">シート輸入</button>';
    document.querySelectorAll('._1p75mxn1')[1].appendChild(myButton);
    document.getElementById("manualButton").addEventListener("click", checkAndSend, false);
}

setTimeout(checkAndSend, 1500);
setTimeout(onLoad, 800);

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
