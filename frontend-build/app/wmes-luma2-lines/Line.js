define(["../i18n","../core/Model"],function(e,i){"use strict";return i.extend({urlRoot:"/luma2/lines",clientUrlRoot:"#luma2/lines",topicPrefix:"luma2.lines",privilegePrefix:"LUMA2",nlsDomain:"wmes-luma2-lines",serialize:function(){var i=this.toJSON();return i.active=e("core","BOOL:"+i.active),i}})});