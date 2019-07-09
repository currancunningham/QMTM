// ==UserScript==
// @name         Evernote検索
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
  window.open('https://www.evernote.com/client/web?usernameImmutable=false&login=&login=Sign+in&login=true&#?query='+selected, "_blank"
})();
