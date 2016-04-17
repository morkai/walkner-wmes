// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","../broker","../pubsub","../user","../users/UserCollection","../data/createSettings","./QiSettingCollection","../qiKinds/QiKindCollection","../qiErrorCategories/QiErrorCategoryCollection","../qiFaults/QiFaultCollection","../qiActionStatuses/QiActionStatusCollection"],function(e,t,i,r,n,o,s,l,a,u,c){"use strict";function d(e){b.forEach(function(t){h[t].reset(e?e[t]:[])}),h.settings.reset(e?e.settings:[]),h.inspectors.reset(e?e.inspectors:[]),h.productFamilies=e?e.productFamilies:[]}function f(){y=null,null!==q&&(q.destroy(),q=null),h.loaded=!1,d(),S.release()}function g(e,i){var r=i.split("."),n=h[r[1]];if(n){switch(r[2]){case"added":n.add(e.model);break;case"edited":var o=n.get(e.model._id);o&&o.set(e.model);break;case"deleted":n.remove(n.get(e.model._id))}t.publish(i,e)}}function p(){h.inspectors.fetch()}var b=["kinds","errorCategories","faults","actionStatuses"],m={kind:"kinds",errorCategory:"errorCategories",fault:"faults",actionStatus:"actionStatuses"},C=null,y=null,q=null,S=o(s),h={inspectors:new n(null,{rqlQuery:"select(firstName,lastName,login)&privileges=QI%3AINSPECTOR"}),productFamilies:[],settings:S.acquire(),kinds:new l,errorCategories:new a,faults:new u,actionStatuses:new c,loaded:!1,load:function(){return null!==y&&(clearTimeout(y),y=null),h.loaded?null:null!==C?C:(C=e.ajax({url:"/qi/dictionaries"}),C.done(function(e){h.loaded=!0,d(e)}),C.fail(f),C.always(function(){C=null}),q=i.sandbox(),b.forEach(function(e){q.subscribe("qi."+e+".**",g)}),q.subscribe("users.*",p),C)},unload:function(){null!==y&&clearTimeout(y),y=setTimeout(f,3e4)},getLabel:function(e,t){if("string"==typeof e&&(e=this.forProperty(e)||h[e]),!e||Array.isArray(e))return t;var i=e.get(t);return i?i.getLabel():t},forProperty:function(e){return this[m[e]]||null}};return h});