define(["underscore","../i18n","../time","../user","../core/Model"],function(e,r,t,i,o){"use strict";return o.extend({urlRoot:"/ct/pces",clientUrlRoot:"#ct/pces",topicPrefix:"ct.pces",privilegePrefix:"PROD_DATA",nlsDomain:"wmes-ct-pces",serialize:function(){var e=this.toJSON();return e.startedAt=t.format(e.startedAt,"L, HH:mm:ss.SSS"),e.finishedAt=t.format(e.finishedAt,"L, HH:mm:ss.SSS"),e},serializeRow:function(){var e=this.serialize();return e.order=e.order._id,i.isAllowedTo("ORDERS:VIEW")&&(e.order='<a href="#orders/'+e.order+'">'+e.order+"</a>"),e.duration=t.toString(e.durations.total/1e3,!1,!1),e}})});