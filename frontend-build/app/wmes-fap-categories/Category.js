define(["../i18n","../core/Model","../data/orgUnits","../data/prodFunctions","app/core/templates/userInfo"],function(e,t,o,r,i){"use strict";return t.extend({urlRoot:"/fap/categories",clientUrlRoot:"#fap/categories",topicPrefix:"fap.categories",privilegePrefix:"FAP",nlsDomain:"wmes-fap-categories",labelAttribute:"name",defaults:{active:!0},serialize:function(t){t||(t=this.collection);var n=this.toJSON(),a=t&&t.get(n.etoCategory);return n.active=e("core","BOOL:"+n.active),n.etoCategory=a?a.getLabel():""===n.etoCategory?e("core","BOOL:true"):null===n.etoCategory?e("core","BOOL:false"):n.etoCategory,n.users=(n.users||[]).map(function(e){return i({userInfo:e})}),n.notifications=(n.notifications||[]).map(function(e){return{subdivisions:e.subdivisions.map(function(e){var t=o.getByTypeAndId("subdivision",e);if(!t)return e;var r=o.getParent(t);return(r?r.getLabel():"?")+" \\ "+t.getLabel()}),prodFunctions:e.prodFunctions.map(function(e){var t=r.get(e);return t?t.getLabel():e})}}),n}})});