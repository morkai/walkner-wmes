// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","moment","select2","app/broker"],function(n,e,t,r){"use strict";function o(n,e,t){try{return l[n][e](t)}catch(o){if(l[n]&&l[n][e])throw o;return r.publish("i18n.missingKey",{domain:n,key:e}),e}}function i(n,e,t){l[n]=e,"string"==typeof t&&s.push(t),r.publish("i18n.registered",{domain:n,keys:e,moduleId:t})}function u(i,u){var c="en";n.isObject(o.config)&&(c=o.config.locale,o.config.locale=i),s.forEach(require.undef);var f=[].concat(s);"en"!==i&&f.unshift("moment-lang/"+i),f.unshift("select2-lang/"+i),require(f,function(){e.locale(i),t.lang(i),r.publish("i18n.reloaded",{oldLocale:c,newLocale:i}),n.isFunction(u)&&u()})}function c(n,e,t){function r(){return o(n,e,t)}return r.toString=r,r}function f(n,e){return"undefined"!=typeof l[n]&&"function"==typeof l[n][e]}function a(e){var t={};if(null==e)return t;for(var r=Object.keys(e),o=0,i=r.length;i>o;++o){var u=r[o],c=e[u];if(null!==c&&"object"==typeof c)for(var f=a(c),l=Object.keys(f),s=0,g=l.length;g>s;++s)t[u+"->"+l[s]]=String(f[l[s]]);else t[u]="_"===u.charAt(0)?String(c):n.escape(String(c))}return t}var l={},s=[];return o.config=null,o.translate=o,o.register=i,o.reload=u,o.bound=c,o.has=f,o.flatten=a,o.forDomain=function(n){var e=function(e,t,r){return"object"==typeof t?o(n,e,t):"string"==typeof t||r?o(e,t,r):o(n,e)};return e.translate=e,e.bound=function(n,t,r){function o(){return e(n,t,r)}return o.toString=o,o},e.has=function(e,t){return t?f(e,t):f(n,e)},e.flatten=a,e},window.i18n=o,o});