define(["jquery","../broker","../pubsub","../wmes-trw-testers/TesterCollection","../wmes-trw-programs/ProgramCollection"],function(e,r,t,n,o){"use strict";var l={tester:"testers",program:"programs"},u=null,a=null,i=null,s={testers:new n,programs:new o,loaded:!1,load:function(){return null!==a&&(clearTimeout(a),a=null),s.loaded?null:null!==u?u:((u=e.ajax({url:"/trw/dictionaries"})).done(function(e){s.loaded=!0,d(e)}),u.fail(c),u.always(function(){u=null}),i=t.sandbox(),Object.keys(l).forEach(function(e){i.subscribe("trw."+l[e]+".**",f)}),u)},unload:function(){null!==a&&clearTimeout(a),a=setTimeout(c,3e4)},getLabel:function(e,r){if("string"==typeof e&&(e=this.forProperty(e)||s[e]),!e||Array.isArray(e))return r;var t=e.get(r);return t?t.getLabel():r},forProperty:function(e){return this[l[e]]||null},bind:function(e){var r=this;return e.on("beforeLoad",function(e,t){t.push(r.load())}),e.on("afterRender",r.load.bind(r)),e.once("remove",r.unload.bind(r)),e}};function d(e){e&&e.types&&(s.types=e.types),Object.keys(l).forEach(function(r){var t=l[r];s[t].reset(e?e[t]:[])})}function c(){a=null,null!==i&&(i.destroy(),i=null),s.loaded=!1,d()}function f(e,t){var n=t.split("."),o=s[n[1]];if(o){switch(n[2]){case"added":o.add(e.model);break;case"edited":var l=o.get(e.model._id);l&&l.set(e.model);break;case"deleted":o.remove(o.get(e.model._id))}r.publish(t,e)}}return s});