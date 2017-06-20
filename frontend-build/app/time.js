// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["moment-timezone","app/socket"],function(t,n){"use strict";function e(t,n){for(t=String(t);t.length<n;)t="0"+t;return t}var o="TIME:OFFSET",r="TIME:ZONE",a={synced:!1,offset:parseFloat(localStorage.getItem(o))||0,zone:localStorage.getItem(r)||"Europe/Warsaw",appData:window.TIME||0};return delete window.TIME,a.sync=function(){var t=Date.now();n.emit("time",function(n,e){a.offset=(n-t+(n-Date.now()))/2,a.zone=e,a.synced=!0,localStorage.setItem(o,a.offset.toString()),localStorage.setItem(r,a.zone)})},a.getServerMoment=function(){return t(Date.now()+a.offset).tz(a.zone)},a.getMoment=function(n,e){return t(n,e).tz(a.zone)},a.getMomentUtc=function(n,e){return t.utc(n,e)},a.format=function(t,n){var e=a.getMoment(t);return e.isValid()?e.format(n):null},a.utc={getMoment:function(n,e){return t.utc(n,e)},format:function(t,n){var e=a.getMomentUtc(t);return e.isValid()?e.format(n):null}},a.toTagData=function(t,n){if(!t)return{iso:"?",long:"?",human:"?",daysAgo:0};var e=a.getMoment(t),o=e.valueOf(),r=Date.now();return{iso:e.toISOString(),long:e.format("LLLL"),human:n===!0?e.from(o>r?o:r):e.fromNow(),daysAgo:-e.diff(r,"days")}},a.toSeconds=function(t){if("number"==typeof t)return t;if("string"!=typeof t)return 0;var n={g:3600,h:3600,m:60,s:1,ms:.001},e=t.trim(),o=parseInt(e,10);if(/^[0-9]+\.?[0-9]*$/.test(e)===!1){var r,a=/([0-9\.]+)\s*(h|ms|m|s)[a-z]*/gi;for(o=0;r=a.exec(e);)o+=parseFloat(r[1])*n[r[2].toLowerCase()]}return o},a.toString=function(t,n,o){if("number"!=typeof t||t<=0||isNaN(t))return n?"00:00:00":"0s";var r="",a=Math.floor(t/3600);a>0?(r+=n?e(a,2)+":":" "+a+"h",t%=3600):n&&(r+="00:");var f=Math.floor(t/60);f>0?(r+=n?e(f,2)+":":" "+f+"min",t%=60):n&&(r+="00:");var u=t;return u>=1?(r+=n?e(Math[o?"floor":"round"](u),2):" "+Math[o?"floor":"round"](u)+"s",o&&u%1!==0&&(r+=n?"."+e(Math.round(u%1*1e3),3):" "+(Math.round(u%1*1e3)+"ms"))):u>0&&""===r?r+=" "+1e3*u+"ms":n&&(r+="00"),n?r:r.substr(1)},n.on("connect",function(){a.sync()}),n.isConnected()&&a.sync(),window.time=a,a});