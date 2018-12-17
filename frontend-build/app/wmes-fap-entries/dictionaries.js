define(["jquery","../broker","../pubsub","../user","../wmes-fap-categories/CategoryCollection"],function(e,t,n,r,l){"use strict";var o={category:"categories"},a=null,u=null,i=null,s={statuses:["pending","started","finished"],categories:new l,loaded:!1,load:function(){return null!==u&&(clearTimeout(u),u=null),s.loaded?null:null!==a?a:((a=e.ajax({url:"/fap/dictionaries"})).done(function(e){s.loaded=!0,d(e)}),a.fail(c),a.always(function(){a=null}),i=n.sandbox(),Object.keys(o).forEach(function(e){i.subscribe("fap."+o[e]+".**",f)}),a)},unload:function(){null!==u&&clearTimeout(u),u=setTimeout(c,3e4)},getLabel:function(e,t){if("string"==typeof e&&(e=this.forProperty(e)||s[e]),!e||Array.isArray(e))return t;var n=e.get(t);return n?n.getLabel():t},forProperty:function(e){return this[o[e]]||null}};function d(e){Object.keys(o).forEach(function(t){var n=o[t];s[n].reset(e?e[n]:[])})}function c(){u=null,null!==i&&(i.destroy(),i=null),s.loaded=!1,d()}function f(e,n){var r=n.split("."),l=s[r[1]];if(l){switch(r[2]){case"added":l.add(e.model);break;case"edited":var o=l.get(e.model._id);o&&o.set(e.model);break;case"deleted":l.remove(l.get(e.model._id))}t.publish(n,e)}}return s});