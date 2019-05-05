define(["jquery","../broker","../pubsub","../user","../wmes-fap-categories/CategoryCollection","../wmes-fap-subCategories/SubCategoryCollection"],function(e,n,t,o,r,a){"use strict";var l={category:"categories",subCategory:"subCategories"},u=null,i=null,s=null,d={statuses:["pending","started","finished"],categories:new r,subCategories:new a,loaded:!1,load:function(){return null!==i&&(clearTimeout(i),i=null),d.loaded?null:null!==u?u:((u=e.ajax({url:"/fap/dictionaries"})).done(function(e){d.loaded=!0,c(e)}),u.fail(f),u.always(function(){u=null}),s=t.sandbox(),Object.keys(l).forEach(function(e){s.subscribe("fap."+l[e]+".**",b)}),u)},unload:function(){null!==i&&clearTimeout(i),i=setTimeout(f,3e4)},getLabel:function(e,n){if("string"==typeof e&&(e=this.forProperty(e)||d[e]),!e||Array.isArray(e))return n;var t=e.get(n);return t?t.getLabel():n},forProperty:function(e){return this[l[e]]||null},bind:function(e){var n=this;return e.on("beforeLoad",function(e,t){t.push(n.load())}),e.on("afterRender",n.load.bind(n)),e.once("remove",n.unload.bind(n)),e}};function c(e){Object.keys(l).forEach(function(n){var t=l[n];d[t].reset(e?e[t]:[])})}function f(){i=null,null!==s&&(s.destroy(),s=null),d.loaded=!1,c()}function b(e,t){var o=t.split("."),r=d[o[1]];if(r){switch(o[2]){case"added":r.add(e.model);break;case"edited":var a=r.get(e.model._id);a&&a.set(e.model);break;case"deleted":r.remove(r.get(e.model._id))}n.publish(t,e)}}return d});