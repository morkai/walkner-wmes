define(["app/i18n","app/core/Model"],function(i,e){"use strict";return e.extend({urlRoot:"/kaizen/productFamilies",clientUrlRoot:"#kaizenProductFamilies",topicPrefix:"kaizen.productFamilies",privilegePrefix:"KAIZEN:DICTIONARIES",nlsDomain:"kaizenProductFamilies",labelAttribute:"name",defaults:{active:!0},serialize:function(){var e=this.toJSON();return e.active=i("core","BOOL:"+e.active),e},serializeRow:function(){var i=this.serialize();return i.mrps=i.mrps.join("; "),i}})});