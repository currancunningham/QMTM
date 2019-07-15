// ==UserScript==
// @name         Airhostリスティング飛ぶ
// @namespace    https://www.faminect.jp/
// @version      0.1
// @description  ANYサイトから、Airbnbまで繋がっていこう
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/sinaraheneba/QMTM/raw/master/Airhost%E3%83%AA%E3%82%B9%E3%83%86%E3%82%A3%E3%83%B3%E3%82%B0%E3%83%AA%E3%83%B3%E3%82%AF.user.js
// @updateURL    https://github.com/sinaraheneba/QMTM/raw/master/Airhost%E3%83%AA%E3%82%B9%E3%83%86%E3%82%A3%E3%83%B3%E3%82%B0%E3%83%AA%E3%83%B3%E3%82%AF.user.js
// @run-at       context-menu
// ==/UserScript==

(function(){
  const selected = window.getSelection().toString();
  if (selected.match(/^\d{7,8}$/)) {
    window.open('https://script.google.com/a/familiar-link.com/macros/s/AKfycbzHSsDI8a1H0XGTLBNx6JAPu0DRUj8xkjp5Y9yj8hz_pUIoEa0/exec?airhost='+selected, "_blank")
  } else {
    window.alert("リスティング番号だけ検索可");
  }
})();
