// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../time","../core/Model","./OperationCollection","./DocumentCollection","./ComponentCollection"],function(t,o,e,n,r){"use strict";var i=["startDate","finishDate","scheduledStartDate","scheduledFinishDate"],a=["sapCreatedAt","createdAt","updatedAt"];return o.extend({urlRoot:"/orders",clientUrlRoot:"#orders",topicPrefix:"orders",privilegePrefix:"ORDERS",nlsDomain:"orders",labelAttribute:"_id",parse:function(t,i){return t=o.prototype.parse.call(this,t,i),t.operations=new e(t.operations),t.documents=new n(t.documents),t.bom=new r(t.bom),t},toJSON:function(){var e=o.prototype.toJSON.call(this);return i.forEach(function(o){e[o]&&(e[o+"Text"]=t.format(e[o],"LL"))}),a.forEach(function(o){e[o]&&(e[o+"Text"]=t.format(e[o],"LLL"))}),e.qty&&e.unit&&(e.qtyUnit=e.qty+" "+e.unit),e.qtyDone&&e.qtyDone.total>=0&&e.unit&&(e.qtyDoneUnit=(e.qtyDone.total||0)+" "+e.unit),e.qtys="",e.qtyDone&&e.qtyDone.total>=0&&(e.qtys+=e.qtyDone.total),e.qty&&(e.qtys.length&&(e.qtys+="/"),e.qtys+=e.qty),e.operations=e.operations?e.operations.toJSON():[],Array.isArray(e.documents)||(e.documents=e.documents&&e.documents.toJSON?e.documents.toJSON():[]),Array.isArray(e.bom)||(e.bom=e.bom&&e.bom.toJSON?e.bom.toJSON():[]),e}})});