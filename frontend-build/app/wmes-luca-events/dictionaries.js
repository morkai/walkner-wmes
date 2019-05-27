define(["jquery","../broker","../pubsub"],function(e,n,r){"use strict";var l={line:"lines",type:"types"},t=null,o=null,u=null,a={types:[],lines:[],loaded:!1,load:function(){return null!==o&&(clearTimeout(o),o=null),a.loaded?null:null!==t?t:((t=e.ajax({url:"/luca/dictionaries"})).done(function(e){a.loaded=!0,i(e)}),t.fail(d),t.always(function(){t=null}),u=r.sandbox(),Object.keys(l).forEach(function(e){Array.isArray(a.forProperty(e))||u.subscribe("luca."+l[e]+".**",s)}),t)},unload:function(){null!==o&&clearTimeout(o),o=setTimeout(d,3e4)},getLabel:function(e,n){if("string"==typeof e&&(e=this.forProperty(e)||a[e]),!e||Array.isArray(e))return n;var r=e.get(n);return r?r.getLabel():n},forProperty:function(e){return this[l[e]]||null},bind:function(e){var n=this;return e.on("beforeLoad",function(e,r){r.push(n.load())}),e.on("afterRender",n.load.bind(n)),e.once("remove",n.unload.bind(n)),e}};function i(e){Object.keys(l).forEach(function(n){var r=l[n];Array.isArray(a[r])?a[r]=e?e[r]:[]:a[r].reset&&a[r].reset(e?e[r]:[])})}function d(){o=null,null!==u&&(u.destroy(),u=null),a.loaded=!1,i()}function s(e,r){var l=r.split("."),t=a[l[1]];if(t&&t.model){switch(l[2]){case"added":t.add(e.model);break;case"edited":var o=t.get(e.model._id);o&&o.set(e.model);break;case"deleted":t.remove(t.get(e.model._id))}n.publish(r,e)}}return a});