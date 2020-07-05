define(["underscore","app/user","app/time","app/i18n","app/core/Model"],function(e,r,a,t,s){"use strict";return s.extend({urlRoot:"/old/wh/deliveredOrders",clientUrlRoot:"#wh/deliveredOrders",topicPrefix:"old.wh.deliveredOrders",privilegePrefix:"WH",nlsDomain:"wh-deliveredOrders",serialize:function(){var e=this.toJSON();return e.qty=e.qtyDone+"/"+e.qtyTodo,e.pceTime=a.toString(e.pceTime/1e3,!1,!1),e.date=a.utc.format(e.date,"L"),e.statusText=t(this.nlsDomain,"status:"+e.status),e},serializeRow:function(){var t=this.serialize();"blocked"===t.status?t.className="danger":"done"===t.status?t.className="success":t.qtyDone?t.className="info":t.className="",t.redirLine&&(t.redirLine=e.escape(t.redirLine)+" ➜ "+e.escape(t.line),t.line='<i class="fa fa-arrow-right"></i><span>'+e.escape(t.line)+"</span>"),r.isAllowedTo("LOCAL","ORDERS:VIEW")&&(t.sapOrder='<a href="#orders/'+t.sapOrder+'" target="_blank">'+t.sapOrder+"</a>");var s=a.utc.format(this.get("date"),"YYYY-MM-DD");return r.isAllowedTo("WH:VIEW")&&(t.date='<a href="#wh/pickup/'+s+"?order="+(t.whOrder||"")+'" target="_blank">'+t.date+"</a>",t.set='<a href="#wh/pickup/'+s+"?set="+(t.whOrder||"")+'" target="_blank" style="display: block">'+t.set+"</a>"),t}})});