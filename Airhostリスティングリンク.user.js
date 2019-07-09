// ==UserScript==
// @name         Airhostリスティング飛ぶ
// @namespace    https://www.faminect.jp/
// @version      0.1
// @description  ANYサイトから、Airbnbまで繋がっていこう
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL
// @updateURL
// @run-at       context-menu
// ==/UserScript==

(function(){
  const selected = window.getSelection().toString();
  if (selected.match(/^\d{7,8}$/)) {
    window.open('https://script.google.com/a/familiar-link.com/macros/s/AKfycbzHSsDI8a1H0XGTLBNx6JAPu0DRUj8xkjp5Y9yj8hz_pUIoEa0/exec?airhost='+selected, "_blank"
  } else {
    window.alert("リスティング番号だけ検索可");
  }
})();
