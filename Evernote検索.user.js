// ==UserScript==
// @name         Evernote検索
// @namespace    https://www.faminect.jp/
// @version      0.1
// @description  ANYサイトから、Airbnbまで繋がっていこう
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/Altigraph/QMTM/raw/master/Evernote%E6%A4%9C%E7%B4%A2.user.js
// @updateURL    https://github.com/Altigraph/QMTM/raw/master/Evernote%E6%A4%9C%E7%B4%A2.user.js
// @resource     settings file:///C:/Program Files/QMTM/settings.json
// @resource     mac_settings file:///Users/Shared/settings.json
// @run-at       context-menu
// ==/UserScript==

(function(){
  const selected = window.getSelection().toString();
  window.open('https://www.evernote.com/client/web?usernameImmutable=false&login=&login=Sign+in&login=true&#?query='+selected, "_blank"
})();
