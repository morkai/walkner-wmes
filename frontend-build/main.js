!function(){"use strict";var e=null;window.logBrowserError=function(o,n){if(window.fetch&&o.stack!==e){var i=(e=o.stack).split(/\s+at\s+/);i.shift(),o={type:o.name,message:o.message,stack:i,time:n?n.timeStamp:-1};var t=window.navigator,a=window.screen,d=r();d["Content-Type"]="application/json",fetch("/logs/browserErrors",{method:"POST",headers:d,body:JSON.stringify({error:o,browser:{time:new Date,navigator:{language:t.language,languages:t.languages,cookieEnabled:t.cookieEnabled,onLine:t.onLine,platform:t.platform,userAgent:t.userAgent},screen:{availHeight:a.availHeight,availWidth:a.availWidth,width:a.width,height:a.height,innerWidth:window.innerWidth,innerHeight:window.innerHeight},location:window.location.href,history:JSON.parse(localStorage.getItem("WMES_RECENT_LOCATIONS")||[])},versions:window.updater&&window.updater.versions||{}})}).then(function(){},function(){})}},window.addEventListener("error",function(e){window.logBrowserError(e.error,e)});var o=window.navigator,n=window.location;if("http:"===n.protocol&&"/"===n.pathname&&""===n.port&&(n.protocol="https:"),n.origin||(n.origin=n.protocol+"//"+n.hostname+(n.port?":"+n.port:"")),window.COMPUTERNAME=(n.href.match(/COMPUTERNAME=(.*?)(?:(?:#|&).*)?$/i)||[null,null])[1],window.INSTANCE_ID=Math.round(Date.now()+9999999*Math.random()).toString(36).toUpperCase(),window.IS_EMBEDDED=window.parent!==window,window.IS_IE=-1!==o.userAgent.indexOf("Trident/"),window.IS_MOBILE=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(o.userAgent),window.IS_LINUX=-1!==o.userAgent.indexOf("X11; Linux"),document.body.classList.toggle("is-ie",window.IS_IE),document.body.classList.toggle("is-mobile",window.IS_MOBILE),document.body.classList.toggle("is-embedded",window.IS_EMBEDDED),document.body.classList.toggle("is-linux",window.IS_LINUX),"testing"===window.ENV){var i=n.hash.match(/^(?:#proxy=([0-9]+))?(#.*?)?$/);if(!i||void 0===i[1]||i[1]===localStorage.getItem("PROXY"))return void(n.href="/redirect?referrer="+encodeURIComponent(n.origin+"/#proxy="+Date.now()+(i&&i[2]?i[2]:"#")));n.hash=i&&i[2]?i[2]:"#",localStorage.setItem("PROXY",i[1])}window.IS_EMBEDDED&&window.parent.postMessage({type:"init",host:n.hostname},"*"),window.SERVICE_WORKER&&!window.IS_EMBEDDED&&!window.IS_LINUX&&window.navigator.serviceWorker&&window.navigator.serviceWorker.getRegistrations&&"https:"===n.protocol&&"/"===n.pathname&&window.navigator.serviceWorker.register("/sw.js").then(function(){console.log("[sw] Registered!")}).catch(function(e){console.error("[sw] Failed to register:",e)});var t=XMLHttpRequest.prototype.send;function r(){var e={};return window.INSTANCE_ID&&(e["X-WMES-INSTANCE"]=window.INSTANCE_ID),window.COMPUTERNAME&&(e["X-WMES-CNAME"]=window.COMPUTERNAME),window.WMES_APP_ID&&(e["X-WMES-APP"]=window.WMES_APP_ID),window.WMES_LINE_ID&&(e["X-WMES-LINE"]=window.WMES_LINE_ID),e}XMLHttpRequest.prototype.send=function(){var e=r();return Object.keys(e).forEach(function(o){this.setRequestHeader(o,e[o])},this),t.apply(this,arguments)};var a=[],d=null,s=null;require.onError=function(e){console.error(Object.keys(e),e);var o=document.getElementById("app-loading");if(o){o.className="error";var n=o.getElementsByClassName("fa-spin")[0];n&&n.classList.remove("fa-spin")}},require.onResourceLoad=function(e,o){if("i18n"===o.prefix){var n=e.defined[o.id],i=o.id.substr(o.id.lastIndexOf("/")+1);null!==d?d.register(i,n,o.id):a.push([i,n,o.id])}else if("app/i18n"===o.id)(d=e.defined[o.id]).config=e.config.config.i18n,a.forEach(function(e){d.register(e[0],e[1],e[2])}),a=null;else if("select2"===o.id)(s=e.defined[o.id]).lang=function(e){window.jQuery.extend(window.jQuery.fn.select2.defaults,s.lang[e])};else if(/^select2-lang/.test(o.id)){var t=o.id.substr(o.id.lastIndexOf("/")+1);s.lang[t]=e.defined[o.id]}};var l=window.applicationCache;if(!l||!o.onLine||!document.getElementsByTagName("html")[0].hasAttribute("manifest"))return window.requireApp();var w=n.reload.bind(n),c=setTimeout(w,9e4);function p(){clearTimeout(c),c=null,l.onnoupdate=null,l.oncached=null,l.onerror=null,l.onobsolete=null,l.onupdateready=null,window.requireApp()}l.onnoupdate=p,l.oncached=p,l.onerror=p,l.onobsolete=w,l.onupdateready=w}();