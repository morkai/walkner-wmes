define(["require","jquery","app/i18n","app/viewport","app/core/View","app/core/views/DialogView","app/core/templates/embedded/appsDialog","app/core/templates/embedded/confirmDialog","app/core/templates/embedded/actions"],function(e,t,o,n,a,i,p,s,d){"use strict";var r=window.IS_EMBEDDED||window.parent!==window||-1!==window.location.href.indexOf("_embedded=1"),w=null;return window.addEventListener("message",function(t){var o=t.data;switch(o.type){case"apps":n=o.data,clearTimeout(w),0!==n.apps.length&&(1===n.apps.length?window.parent.postMessage({type:"switch",app:window.WMES_APP_ID},"*"):(i=n.apps,(s=e("app/viewport")).showDialog(new a({events:{"click [data-app]":function(e){s.closeAllDialogs(),window.parent.postMessage({type:"switch",app:window.WMES_APP_ID,newApp:e.currentTarget.dataset.app},"*")}},dialogClassName:"embedded-appsDialog",template:p,getTemplateData:function(){return{apps:i}}}))))}var n,i,s}),{actions:{switch:function(){window.parent.postMessage({type:"apps"},"*"),w&&clearTimeout(w),w=setTimeout(function(){window.parent.postMessage({type:"switch",app:window.WMES_APP_ID},"*")},250)},config:function(){window.parent.postMessage({type:"config"},"*")},refresh:function(){window.parent.postMessage({type:"refresh"},"*")},resetBrowser:function(){window.parent.postMessage({type:"resetBrowser"},"*")},restartBrowser:function(){window.parent.postMessage({type:"restartBrowser"},"*")},noKiosk:function(){window.parent.postMessage({type:"noKiosk"},"*")},reboot:function(){var t=new i({dialogClassName:"embedded-confirmDialog",template:s,model:{action:"reboot"}});t.once("answered",function(e){"yes"===e&&window.parent.postMessage({type:"reboot"},"*")}),e("app/viewport").showDialog(t,o("core","embedded:reboot:title"))},shutdown:function(){var t=new i({dialogClassName:"embedded-confirmDialog",template:s,model:{action:"shutdown"}});t.once("answered",function(e){"yes"===e&&window.parent.postMessage({type:"shutdown"},"*")}),e("app/viewport").showDialog(t,o("core","embedded:shutdown:title"))}},isEnabled:function(){return r},ready:function(e){r&&window.parent.postMessage({type:"ready",app:e||window.WMES_APP_ID},"*")},render:function(e,o){if(r){var n=0,a=null,i=this.actions,p=t(d({app:window.WMES_APP_ID,left:o&&!0===o.left}));p.on("click","[data-action]",function(e){var t=i[e.currentTarget.dataset.action];t&&t(),e.preventDefault()}),p.on("show.bs.dropdown",function(){n+=1,clearTimeout(a),a=setTimeout(function(){n=0},2e3),s(n<3)}),p.on("hidden.bs.dropdown",function(){s(!0)}),t(".embedded-actions").remove(),(o&&o.container||e.$el).append(p)}function s(e){p.find(".dev").toggleClass("hidden",e)}}}});