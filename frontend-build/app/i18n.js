define(["underscore","moment","select2","app/broker"],function(e,t,n,i){function r(e,t,n){try{return u[e][t](n)}catch(r){if(u[e]&&u[e][t])throw r;return i.publish("i18n.missingKey",{domain:e,key:t}),t}}function o(e,t,n){u[e]=t,"string"==typeof n&&c.push(n),i.publish("i18n.registered",{domain:e,keys:t,moduleId:n})}function s(o,s){var a="en";e.isObject(r.config)&&(a=r.config.locale,r.config.locale=o),c.forEach(require.undef);var l=[].concat(c);"en"!==o&&l.unshift("moment-lang/"+o),l.unshift("select2-lang/"+o),require(l,function(){t.lang(o),n.lang(o),i.publish("i18n.reloaded",{oldLocale:a,newLocale:o}),e.isFunction(s)&&s()})}function a(e,t,n){function i(){return r(e,t,n)}return i.toString=i,i}function l(e,t){return"undefined"!=typeof u[e]&&"function"==typeof u[e][t]}var u={},c=[];return r.config=null,r.translate=r,r.register=o,r.reload=s,r.bound=a,r.has=l,window.i18n=r,r});