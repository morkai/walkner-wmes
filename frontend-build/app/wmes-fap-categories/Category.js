define(["../i18n","../core/Model","../data/orgUnits","../data/prodFunctions"],function(e,t,i,n){"use strict";return t.extend({urlRoot:"/fap/categories",clientUrlRoot:"#fap/categories",topicPrefix:"fap.categories",privilegePrefix:"FAP",nlsDomain:"wmes-fap-categories",labelAttribute:"name",defaults:{active:!0},serialize:function(){var t=this.toJSON();return t.active=e("core","BOOL:"+t.active),t.notifications=(t.notifications||[]).map(function(e){return{subdivisions:e.subdivisions.map(function(e){var t=i.getByTypeAndId("subdivision",e);if(!t)return e;var n=i.getParent(t);return(n?n.getLabel():"?")+" \\ "+t.getLabel()}),prodFunctions:e.prodFunctions.map(function(e){var t=n.get(e);return t?t.getLabel():e})}}),t}})});