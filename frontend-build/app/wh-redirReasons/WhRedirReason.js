define(["../i18n","../core/Model"],function(e,i){"use strict";return i.extend({urlRoot:"/old/wh/redirReasons",clientUrlRoot:"#wh/redirReasons",topicPrefix:"old.wh.redirReasons",privilegePrefix:"WH",nlsDomain:"wh-redirReasons",labelAttribute:"label",defaults:{active:!0},serialize:function(){var i=this.toJSON();return i.active=e("core","BOOL:"+i.active),i}})});