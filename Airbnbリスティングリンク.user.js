// ==UserScript==
// @name         Airbnbリスティング飛ぶ
// @namespace    https://www.faminect.jp/
// @version      0.1.1
// @description  ANYサイトから、Airbnbまで繋がっていこう
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/currancunningham/QMTM/raw/master/Airbnb%E3%83%AA%E3%82%B9%E3%83%86%E3%82%A3%E3%83%B3%E3%82%B0%E3%83%AA%E3%83%B3%E3%82%AF.user.js
// @updateURL    https://github.com/currancunningham/QMTM/raw/master/Airbnb%E3%83%AA%E3%82%B9%E3%83%86%E3%82%A3%E3%83%B3%E3%82%B0%E3%83%AA%E3%83%B3%E3%82%AF.user.js
// @run-at       context-menu
// ==/UserScript==

(function(){
  const selected = window.getSelection().toString();
  if (selected.match(/^\d{7,8}$/)) {
    window.open('https://www.airbnb.com/rooms/'+selected, "_blank")
  } else {
    window.alert("リスティング番号だけ検索可");
  }
})();
