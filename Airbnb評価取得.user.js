// ==UserScript==
// @name         Airbnb評価取得
// @namespace    https://www.faminect.jp/
// @version      1.0
// @description  Airbnbレビューページから取得し、シートまで送る
// @downloadURL  https://github.com/Altigraph/QMTM/raw/master/Airbnb%E8%A9%95%E4%BE%A1%E5%8F%96%E5%BE%97.user.js
// @uploadURL    https://github.com/Altigraph/QMTM/raw/master/Airbnb%E8%A9%95%E4%BE%A1%E5%8F%96%E5%BE%97.user.js
// @author       草村安隆 Andrew Lucian Thoreson
// @include      https://www.airbnb.jp/progress/ratings*
// @resource     settings file:///C:/Program Files/QMTM/settings.json
// @connect      google.com
// @connect      googleusercontent.com
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// ==/UserScript==


function getMatches(string, regex, index) {
  index || (index = 1); // default to the first capturing group
  var matches = [];
  var match;
  while (match = regex.exec(string)) {
    matches.push(match[index]);
  }
  return matches;
}

function sendToBackend(r) {
  r.forEach((this_r) => {
    console.log("New!\n" + this_r);
    GM_xmlhttpRequest({
      url: JSON.parse(GM_getResourceText('settings')).api.review,
      method: "POST",
      data: JSON.stringify(this_r),
      onload: (res) => {
        //console.log(res.responseText);
      }
    });
  });
}

function checkAndSend() {
  let json = JSON.parse(GM_getResourceText('settings'));
  let buttons = document.querySelectorAll('button');
  for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].innerText != "+ More") { //Opening up full reviews
          continue;
      } else {
          buttons[i].click();
      }
  }

  var output = [];
  var q = 0;
  let reviews = document.querySelectorAll('._1okh7pi0');
  for (i = 0; i < reviews.length; i++) {
      let today_ymd = new Date().toJSON().slice(0,10).replace(/-/g,'/');
      let this_review = reviews[i];
      let totalScore = this_review.getElementsByClassName('_atbpe5')[0].innerHTML.match(/aria-label="評価：([\d])／5/)[1];
      let guestName = this_review.getElementsByClassName('_1p3joamp')[0].innerText;
      let CICO = this_review.getElementsByClassName('_1jlnvra2')[0].innerText.match(/[\d]月[\d]*?日/g);
      CICO[0] = "2019/" + CICO[0].replace(/日/, '').replace(/月/, '/');
      CICO[1] = "2019/" + CICO[1].replace(/日/, '').replace(/月/, '/');
      let roomTitle = this_review.getElementsByClassName('_1jlnvra2')[1].innerText;
      let publicReview = this_review.getElementsByClassName('_k94v97k')[0].innerText.match(/公開フィードバック\s(.*?)\s公開で返信/)[1];

      let privateReviewClass = this_review.getElementsByClassName('_1rlifxji');
      let privateReviews = privateReviewClass[0].getElementsByClassName('_czm8crp');
      let privateReview = "";
      let k;
      for (k = 0; k < privateReviews.length; k++){
          if(!!privateReviews[k].innerText) {
              privateReview += "\n" + privateReviews[k].innerText;
          }
      }
      let categories = getMatches(privateReviewClass[0].innerHTML, /<div class="_1p3joamp">(.*?)<\/div>/g, 1);
      let categoryScore = getMatches(privateReviewClass[0].innerHTML, /aria-label="評価：([\d])／5/g, 1);

      for (k = 0; k < categories.length; k++) {
          switch (categories[k]) {
          case "立地":
              var locationScore = categoryScore[k];
              break;
          case "正確さ":
              var correctness = categoryScore[k];
              break;
          case "チェックイン":
              var checkin = categoryScore[k];
              break;
          case "清潔さ":
              var cleanliness = categoryScore[k];
              break;
          case "コミュニケーション":
              var communication = categoryScore[k];
              break;
          case "コスパ":
              var costperformance = categoryScore[k];
              break;
          }
      }

      let painPointsClass = this_review.getElementsByClassName('_114g51qn');
      let painPoints = "";

      for (k = 0; k < painPointsClass.length; k++) {
          if (!!painPointsClass[k].innerText) {
              painPoints += painPointsClass[k].innerText + " ";
          }
      }
      let thisListing = json.sheets.airbnb.listingNumber.replace(/Not Found or Invalid Entry/, roomTitle);
      let this_id = decodeURI(document.cookie).match(/rclmd\=\{\"(\d+)\"/);
      let thisHost = this_id ? json.sheets.airbnb.hostName.replace(/Not Found or Invalid Entry/, this_id[1]) : hostName;

      let this_output = [thisListing, json.sheets.airbnb.propName, thisHost, json.sheets.airbnb.reservationCode, guestName,
        json.sheets.airbnb.cleaningCompany, CICO[0], CICO[1], totalScore, publicReview, privateReview, "", painPoints, "",
        communication, cleanliness, locationScore, checkin, correctness, costperformance, today_ymd];
      output.push(this_output);
  }

  sendToBackend(output);
  if (window.opener && window.opener.tampermonkey === true) { window.close(); }
}

function onLoad() {
    var myButton = document.createElement('div');
    myButton.innerHTML='<button id="manualButton" type="button">シート輸入</button>';
    document.querySelectorAll('._1p75mxn1')[1].appendChild(myButton);
    document.getElementById("manualButton").addEventListener("click", checkAndSend, false);
}

setTimeout(checkAndSend, 1500);
setTimeout(onLoad, 800);
if (!GM_getResourceText('settings')) { window.alert("settings.jsonをC:/Program Files/QMTM/に入れてください！"); }
