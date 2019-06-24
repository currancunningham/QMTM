// ==UserScript==
// @name         Booking評価更新
// @namespace    https://www.faminect.jp/
// @version      1.3
// @description  Bookingのページを開けたら、背景でレビュー取得
// @author       草村安隆 Andrew Lucian Thoreson
// @downloadURL  https://github.com/Altigraph/QMTM/raw/master/Booking%E8%A9%95%E4%BE%A1%E6%9B%B4%E6%96%B0.user.js
// @updateURL    https://github.com/Altigraph/QMTM/raw/master/Booking%E8%A9%95%E4%BE%A1%E6%9B%B4%E6%96%B0.user.js
// @include      https://admin.booking.com*
// @connect      https://script.google.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

if (window.opener && window.opener.tampermonkey && window.opener.tampermonkey.destination_id) {
    const h_id = window.opener.tampermonkey.destination_id
    console.log("Continuing to destination: " + h_id);
    const thisUrl = new URL(document.URL);
    window.tampermonkey.destination = h_id;
    window.open('https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/reviews.html?hotel_id='+h_id+'&ses='+thisUrl.searchParams.get('ses'), "_self",
                'height=80,width=100,left=10000,top=10000,scrollbars=no,status=no');
    return thisUrl;
}

window.tampermonkey = true;
let script = document.createElement('script');
script.type = "text/javascript";
script.innerHTML=`
function openHotelPage(id) {
    var thisUrl = new URL(document.URL);
    if (id) {
      window.tampermonkey.destination_id = id;
      console.log("Got request to open Hotel ID: " + id);
      window.open('https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/reviews.html?hotel_id='+id+'&ses='+thisUrl.searchParams.get('ses'), "_blank",
                  'height=80,width=100,left=10000,top=10000,scrollbars=no,status=no');
    }
    return thisUrl;
}
`;
document.getElementsByTagName('head')[0].appendChild(script);

if (document.URL.match(/https:\/\/admin.booking.com\/hotel\/hoteladmin\/groups\/reviews\/index\.html/)) {
  console.log("Review page");
} else {
  setTimeout(function(){
    window.tampermonkey = true;
    const stored_time = localStorage.getItem("booking_last_seen_time") || 0;
    const last_time = new Date(parseInt(stored_time));
    const this_time = new Date();
    console.log("TM set: " + window.tampermonkey
                +"\nLast time: "+last_time.toISOString()
                +"\nThis time: "+this_time.toISOString());
    const waitTime = 35 * 60 * 1000;
    if (this_time.getTime() > last_time.getTime() + waitTime) {
      console.log("Update time!");
      window.open(`/hotel/hoteladmin/groups/reviews/index.html`, "_blank",
                  'height=80,width=100,left=10000,top=10000,scrollbars=no,status=no');
    } else {
      const d = new Date(last_time.getTime() + waitTime);
      console.log("Next update: " + d);
    }
  }, 2000);
}
