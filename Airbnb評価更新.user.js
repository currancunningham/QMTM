// ==UserScript==
// @name         Airbnb評価更新
// @namespace    https://www.faminect.jp/
// @version      1.0
// @description  Airbnbのページを開けたら、背景でレビュー取得
// @author       草村安隆 Andrew Lucian Thoreson
// @include      https://www.airbnb.jp/*
// @exclude      https://www.airbnb.jp/progress/ratings*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
setTimeout(function(){
  window.tampermonkey = true;
  var last_id = localStorage.getItem("airbnb_last_seen_id") || "";
  var this_id = decodeURI(document.cookie).match(/rclmd\=\{\"(\d+)\"/);
  console.log("TM set: " + window.tampermonkey
              +"\nLast id: "+last_id
              +"\nThis id: "+this_id[1]);
  if (this_id && last_id !== this_id[1]) {
      console.log("New ID!");
      localStorage.setItem("airbnb_last_seen_id", this_id[1]);
      window.open(`/progress/ratings`, "_blank", 'height=80,width=100,left=10000,top=10000,scrollbars=no,status=no');
  } else if (this_id){
      console.log("Cache ID");
  } else {
      localStorage.setItem("airbnb_last_seen_id", "");
      console.log("Cookie MIA!");
  }
}, 2000);
