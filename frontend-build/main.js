// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

!function(){"use strict";function e(){clearTimeout(l),l=null,a.onnoupdate=null,a.oncached=null,a.onerror=null,a.onobsolete=null,a.onupdateready=null,window.requireApp()}document.body.classList.toggle("is-ie",-1!==window.navigator.userAgent.indexOf("Trident/"));var n=window.location;if(n.origin||(n.origin=n.protocol+"//"+n.hostname+(n.port?":"+n.port:"")),"testing"===window.ENV){var i=n.hash.match(/^(?:#proxy=([0-9]+))?(#.*?)?$/);if(!i||void 0===i[1]||i[1]===localStorage.getItem("PROXY"))return void(n.href="/redirect?referrer="+encodeURIComponent(n.origin+"/#proxy="+Date.now()+(i&&i[2]?i[2]:"#")));window.location.hash=i&&i[2]?i[2]:"#",localStorage.setItem("PROXY",i[1])}window.parent&&window.parent.postMessage({type:"init",host:n.hostname},"*"),window.COMPUTERNAME=(n.href.match(/COMPUTERNAME=(.*?)(?:(?:#|&).*)?$/i)||[null,null])[1];var o=[],t=null,r=null;if(require.onError=function(e){var n=document.getElementById("app-loading");if(n){n.className="error";var i=n.getElementsByClassName("fa-spin")[0];i&&i.classList.remove("fa-spin")}},require.onResourceLoad=function(e,n){if("i18n"===n.prefix){var i=e.defined[n.id],a=n.id.substr(n.id.lastIndexOf("/")+1);null!==t?t.register(a,i,n.id):o.push([a,i,n.id])}else if("app/i18n"===n.id)t=e.defined[n.id],t.config=e.config.config.i18n,o.forEach(function(e){t.register(e[0],e[1],e[2])}),o=null;else if("select2"===n.id)r=e.defined[n.id],r.lang=function(e){window.jQuery.extend(window.jQuery.fn.select2.defaults,r.lang[e])};else if(/^select2-lang/.test(n.id)){var d=n.id.substr(n.id.lastIndexOf("/")+1);r.lang[d]=e.defined[n.id]}},!navigator.onLine||!document.getElementsByTagName("html")[0].hasAttribute("manifest"))return window.requireApp();var a=window.applicationCache,d=n.reload.bind(n),l=setTimeout(d,6e4);a.onnoupdate=e,a.oncached=e,a.onerror=e,a.onobsolete=d,a.onupdateready=d}();