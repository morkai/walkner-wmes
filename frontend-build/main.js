!function(){"use strict";var e=window.navigator,o=window.location;if("http:"===o.protocol&&"/"===o.pathname&&""===o.port&&(o.protocol="https:"),o.origin||(o.origin=o.protocol+"//"+o.hostname+(o.port?":"+o.port:"")),window.COMPUTERNAME=(o.href.match(/COMPUTERNAME=(.*?)(?:(?:#|&).*)?$/i)||[null,null])[1],window.INSTANCE_ID=Math.round(Date.now()+9999999*Math.random()).toString(36).toUpperCase(),window.IS_EMBEDDED=window.parent!==window,window.IS_IE=-1!==e.userAgent.indexOf("Trident/"),window.IS_MOBILE=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(e.userAgent),window.IS_LINUX=-1!==e.userAgent.indexOf("X11; Linux"),document.body.classList.toggle("is-ie",window.IS_IE),document.body.classList.toggle("is-mobile",window.IS_MOBILE),document.body.classList.toggle("is-embedded",window.IS_EMBEDDED),document.body.classList.toggle("is-linux",window.IS_LINUX),"testing"===window.ENV){var n=o.hash.match(/^(?:#proxy=([0-9]+))?(#.*?)?$/);if(!n||void 0===n[1]||n[1]===localStorage.getItem("PROXY"))return void(o.href="/redirect?referrer="+encodeURIComponent(o.origin+"/#proxy="+Date.now()+(n&&n[2]?n[2]:"#")));o.hash=n&&n[2]?n[2]:"#",localStorage.setItem("PROXY",n[1])}window.IS_EMBEDDED&&window.parent.postMessage({type:"init",host:o.hostname},"*"),!window.IS_EMBEDDED&&!window.IS_LINUX&&window.navigator.serviceWorker&&window.navigator.serviceWorker.getRegistrations&&"https:"===o.protocol&&"/"===o.pathname&&window.navigator.serviceWorker.register("/sw.js").then(function(){console.log("[sw] Registered!")}).catch(function(e){console.error("[sw] Failed to register:",e)});var i=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){return this.setRequestHeader("X-WMES-INSTANCE",window.INSTANCE_ID),window.COMPUTERNAME&&this.setRequestHeader("X-WMES-CNAME",window.COMPUTERNAME),window.WMES_APP_ID&&this.setRequestHeader("X-WMES-APP",window.WMES_APP_ID),window.WMES_LINE_ID&&this.setRequestHeader("X-WMES-LINE",window.WMES_LINE_ID),i.apply(this,arguments)};var t=[],r=null,d=null;require.onError=function(e){console.error(Object.keys(e),e);var o=document.getElementById("app-loading");if(o){o.className="error";var n=o.getElementsByClassName("fa-spin")[0];n&&n.classList.remove("fa-spin")}},require.onResourceLoad=function(e,o){if("i18n"===o.prefix){var n=e.defined[o.id],i=o.id.substr(o.id.lastIndexOf("/")+1);null!==r?r.register(i,n,o.id):t.push([i,n,o.id])}else if("app/i18n"===o.id)(r=e.defined[o.id]).config=e.config.config.i18n,t.forEach(function(e){r.register(e[0],e[1],e[2])}),t=null;else if("select2"===o.id)(d=e.defined[o.id]).lang=function(e){window.jQuery.extend(window.jQuery.fn.select2.defaults,d.lang[e])};else if(/^select2-lang/.test(o.id)){var s=o.id.substr(o.id.lastIndexOf("/")+1);d.lang[s]=e.defined[o.id]}};var s=window.applicationCache;if(!s||!e.onLine||!document.getElementsByTagName("html")[0].hasAttribute("manifest"))return window.requireApp();var a=o.reload.bind(o),l=setTimeout(a,9e4);function w(){clearTimeout(l),l=null,s.onnoupdate=null,s.oncached=null,s.onerror=null,s.onobsolete=null,s.onupdateready=null,window.requireApp()}s.onnoupdate=w,s.oncached=w,s.onerror=w,s.onobsolete=a,s.onupdateready=a}();