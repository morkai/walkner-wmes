// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

!function(){"use strict";function e(){clearTimeout(l),l=null,a.onnoupdate=null,a.oncached=null,a.onerror=null,a.onobsolete=null,a.onupdateready=null,window.requireApp()}window.INSTANCE_ID=Math.round(Date.now()+9999999*Math.random()).toString(36).toUpperCase(),document.body.classList.toggle("is-ie",window.navigator.userAgent.indexOf("Trident/")!==-1);var n=window.location;if(n.origin||(n.origin=n.protocol+"//"+n.hostname+(n.port?":"+n.port:"")),"testing"===window.ENV){var o=n.hash.match(/^(?:#proxy=([0-9]+))?(#.*?)?$/);if(!o||void 0===o[1]||o[1]===localStorage.getItem("PROXY"))return void(n.href="/redirect?referrer="+encodeURIComponent(n.origin+"/#proxy="+Date.now()+(o&&o[2]?o[2]:"#")));window.location.hash=o&&o[2]?o[2]:"#",localStorage.setItem("PROXY",o[1])}window.parent!==window&&window.parent.postMessage({type:"init",host:n.hostname},"*"),window.COMPUTERNAME=(n.href.match(/COMPUTERNAME=(.*?)(?:(?:#|&).*)?$/i)||[null,null])[1];var i=[],t=null,r=null;if(require.onError=function(e){var n=document.getElementById("app-loading");if(n){n.className="error";var o=n.getElementsByClassName("fa-spin")[0];o&&o.classList.remove("fa-spin")}},require.onResourceLoad=function(e,n){if("i18n"===n.prefix){var o=e.defined[n.id],a=n.id.substr(n.id.lastIndexOf("/")+1);null!==t?t.register(a,o,n.id):i.push([a,o,n.id])}else if("app/i18n"===n.id)t=e.defined[n.id],t.config=e.config.config.i18n,i.forEach(function(e){t.register(e[0],e[1],e[2])}),i=null;else if("select2"===n.id)r=e.defined[n.id],r.lang=function(e){window.jQuery.extend(window.jQuery.fn.select2.defaults,r.lang[e])};else if(/^select2-lang/.test(n.id)){var d=n.id.substr(n.id.lastIndexOf("/")+1);r.lang[d]=e.defined[n.id]}},!navigator.onLine||!document.getElementsByTagName("html")[0].hasAttribute("manifest"))return window.requireApp();var a=window.applicationCache,d=n.reload.bind(n),l=setTimeout(d,6e4);a.onnoupdate=e,a.oncached=e,a.onerror=e,a.onobsolete=d,a.onupdateready=d}();