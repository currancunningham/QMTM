// ==UserScript==
// @name         Airbnbリスティング飛ぶ
// @namespace    https://www.faminect.jp/
// @version      0.1
// @description  ANYサイトから、Airbnbまで繋がっていこう
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL
// @updateURL
// @resource     settings file:///C:/Program Files/QMTM/settings.json
// @resource     mac_settings file:///Users/Shared/settings.json
// @run-at       context-menu
// ==/UserScript==

(function(){
  const selected = window.getSelection().toString();
  if (selected.match(/^\d{7,8}$/)) {
    window.open('https://www.airbnb.com/rooms/'+selected, "_blank"
  } else {
    window.alert("リスティング番号だけ検索可");
  }
})();
