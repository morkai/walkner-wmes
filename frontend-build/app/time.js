// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["moment-timezone","app/socket"],function(t,e){"use strict";function o(t,e){for(t=String(t);t.length<e;)t="0"+t;return t}var n="TIME:OFFSET",r="TIME:ZONE",a={synced:!1,offset:parseFloat(localStorage.getItem(n))||0,zone:localStorage.getItem(r)||"Europe/Warsaw",appData:window.TIME||0};return delete window.TIME,a.sync=function(){var t=Date.now();e.emit("time",function(e,o){a.offset=(e-t+(e-Date.now()))/2,a.zone=o,a.synced=!0,localStorage.setItem(n,a.offset.toString()),localStorage.setItem(r,a.zone)})},a.getServerMoment=function(){return t(Date.now()+a.offset).tz(a.zone)},a.getMoment=function(e,o){return t(e,o).tz(a.zone)},a.format=function(t,e){var o=a.getMoment(t);return o.isValid()?o.format(e):null},a.toTagData=function(t){var e=a.getMoment(t);return{iso:e.toISOString(),"long":e.format("LLLL"),human:e.fromNow(),daysAgo:-e.diff(Date.now(),"days")}},a.toSeconds=function(t){if("number"==typeof t)return t;if("string"!=typeof t)return 0;var e={g:3600,h:3600,m:60,s:1,ms:.001},o=t.trim(),n=parseInt(o,10);if(/^[0-9]+\.?[0-9]*$/.test(o)===!1){var r,a=/([0-9\.]+)\s*(h|ms|m|s)[a-z]*/gi;for(n=0;r=a.exec(o);)n+=parseFloat(r[1])*e[r[2].toLowerCase()]}return n},a.toString=function(t,e,n){if("number"!=typeof t||0>=t||isNaN(t))return e?"00:00:00":"0s";var r="",a=Math.floor(t/3600);a>0?(r+=e?o(a,2)+":":" "+a+"h",t%=3600):e&&(r+="00:");var f=Math.floor(t/60);f>0?(r+=e?o(f,2)+":":" "+f+"min",t%=60):e&&(r+="00:");var s=t;return s>=1?(r+=e?o(Math[n?"floor":"round"](s),2):" "+Math[n?"floor":"round"](s)+"s",n&&s%1!==0&&(r+=e?"."+o(Math.round(s%1*1e3),3):" "+(Math.round(s%1*1e3)+"ms"))):s>0&&""===r?r+=" "+1e3*s+"ms":e&&(r+="00"),e?r:r.substr(1)},e.on("connect",function(){a.sync()}),e.isConnected()&&a.sync(),window.time=a,a});