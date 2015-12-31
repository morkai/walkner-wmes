// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../time","../core/Model","./OperationCollection","./DocumentCollection","./ComponentCollection"],function(t,e,o,r,n){"use strict";var i=["startDate","finishDate","scheduledStartDate","scheduledFinishDate"];return e.extend({urlRoot:"/orders",clientUrlRoot:"#orders",topicPrefix:"orders",privilegePrefix:"ORDERS",nlsDomain:"orders",labelAttribute:"_id",parse:function(t,i){return t=e.prototype.parse.call(this,t,i),t.operations=new o(t.operations),t.documents=new r(t.documents),t.bom=new n(t.bom),t},toJSON:function(){var o=e.prototype.toJSON.call(this);return i.forEach(function(e){o[e]&&(o[e+"Text"]=t.format(o[e],"LL"))}),o.scheduledFinishDate&&(o.scheduledFinishDateText=t.format(o.scheduledFinishDate,"LL")),o.qty&&o.unit&&(o.qtyUnit=o.qty+" "+o.unit),o.createdAt&&(o.createdAtText=t.format(o.createdAt,"LLLL")),o.updatedAt&&(o.updatedAtText=t.format(o.updatedAt,"LLLL")),o.operations=o.operations?o.operations.toJSON():[],Array.isArray(o.documents)||(o.documents=o.documents&&o.documents.toJSON?o.documents.toJSON():[]),Array.isArray(o.bom)||(o.bom=o.bom&&o.bom.toJSON?o.bom.toJSON():[]),o}})});