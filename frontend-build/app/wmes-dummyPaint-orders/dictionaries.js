define(["jquery","../broker","../pubsub","../user","../wmes-dummyPaint-codes/DpCodeCollection","../wmes-dummyPaint-paints/DpPaintCollection","../wmes-dummyPaint-families/DpFamilyCollection","./SettingCollection"],function(e,n,t,i,a,l,o,r){"use strict";var s={code:"codes",paint:"paints",family:"families",paintCode:"paintCodes",paintFamily:"paintFamilies"},u=null,d=null,c=null,m={paintCodes:[],paintFamilies:[],codes:new a,paints:new l,families:new o,settings:new r,loaded:!1,load:function(){return null!==d&&(clearTimeout(d),d=null),m.loaded?null:null!==u?u:((u=e.ajax({url:"/dummyPaint/dictionaries"})).done(function(e){m.loaded=!0,f(e)}),u.fail(p),u.always(function(){u=null}),c=t.sandbox(),Object.keys(s).forEach(function(e){c.subscribe("dummyPaint."+s[e]+".**",y)}),m.settings.setUpPubsub(c),u)},unload:function(){null!==d&&clearTimeout(d),d=setTimeout(p,3e4)},getLabel:function(e,n){if("string"==typeof e&&(e=this.forProperty(e)||m[e]),!e||Array.isArray(e))return n;var t=e.get(n);return t?t.getLabel():n},forProperty:function(e){return this[s[e]]||null},bind:function(e){var n=this;return e.on("beforeLoad",function(e,t){t.push(n.load())}),e.on("afterRender",n.load.bind(n)),e.once("remove",n.unload.bind(n)),e}};function f(e){Object.keys(s).forEach(function(n){var t=s[n];Array.isArray(m[t])?m[t]=e?e[t]:[]:m[t]&&m[t].reset&&m[t].reset(e?e[t]:[])}),m.settings.reset(e?e.settings:[])}function p(){d=null,null!==c&&(c.destroy(),c=null),m.loaded=!1,f()}function y(e,t){var i=t.split("."),a=m[i[1]];if(a){switch(i[2]){case"added":a.add(e.model);break;case"edited":var l=a.get(e.model._id);l&&l.set(e.model);break;case"deleted":a.remove(a.get(e.model._id))}n.publish(t,e)}}return m});