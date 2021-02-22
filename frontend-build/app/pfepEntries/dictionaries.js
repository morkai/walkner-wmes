define(["jquery","../broker","../pubsub"],function(e,n,t){"use strict";var r={},i=null,o=null,u=null,s={packTypes:[],units:[],vendors:[],loaded:!1,load:function(){return null!==o&&(clearTimeout(o),o=null),s.loaded?null:null!==i?i:((i=e.ajax({url:"/pfep/dictionaries"})).done(function(e){s.loaded=!0,d(e)}),i.fail(a),i.always(function(){i=null}),u=t.sandbox(),Object.keys(r).forEach(function(e){u.subscribe("pfep."+r[e]+".**",c)}),u.subscribe("pfep.entries.added",l),u.subscribe("pfep.entries.edited",l),i)},unload:function(){null!==o&&clearTimeout(o),o=setTimeout(a,3e4)},getLabel:function(e,n){if("string"==typeof e&&(e=this.forProperty(e)||s[e]),!e||Array.isArray(e))return n;var t=e.get(n);return t?t.getLabel():n},forProperty:function(e){return this[r[e]]||null},bind:function(e){var n=this;return e.on("beforeLoad",function(e,t){t.push(n.load())}),e.on("afterRender",n.load.bind(n)),e.once("remove",n.unload.bind(n)),e}};function d(e){Object.keys(r).forEach(function(n){var t=r[n];s[t].reset(e?e[t]:[])}),s.packTypes=e?e.packTypes:[],s.units=e?e.units:[],s.vendors=e?e.vendors:[]}function a(){o=null,null!==u&&(u.destroy(),u=null),s.loaded=!1,d()}function c(e,t){var r=t.split("."),i=s[r[1]];if(i){switch(r[2]){case"added":i.add(e.model);break;case"edited":var o=i.get(e.model._id);o&&o.set(e.model);break;case"deleted":i.remove(i.get(e.model._id))}n.publish(t,e)}}function l(e){var t=e.model,r={packTypes:{},units:{},vendors:{}};function i(e){return e.replace(/[^A-Za-z0-9]+/g,"")}Object.keys(r).forEach(function(e){s[e].forEach(function(n){r[e][i(n)]=!0})}),r.packTypes[i(t.packType)]||(s.packTypes.push(t.packType),s.packTypes.sort(),n.publish("pfep.dictionaries.updated",{dictionary:"packTypes"})),r.units[i(t.unit)]||(s.units.push(t.unit),s.units.sort(),n.publish("pfep.dictionaries.updated",{dictionary:"units"})),r.vendors[i(t.vendor)]||(s.vendors.push(t.vendor),s.vendors.sort(),n.publish("pfep.dictionaries.updated",{dictionary:"vendors"}))}return s});