// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../time","../core/Model","./OperationCollection","./DocumentCollection"],function(t,e,n,o){"use strict";return e.extend({urlRoot:"/orders",clientUrlRoot:"#orders",topicPrefix:"orders",privilegePrefix:"ORDERS",nlsDomain:"orders",labelAttribute:"_id",defaults:{nc12:null,name:null,mrp:null,qty:null,unit:null,startDate:null,finishDate:null,statuses:null,operations:null,createdAt:null,updatedAt:null},parse:function(t,r){return t=e.prototype.parse.call(this,t,r),t.operations=new n(t.operations),t.documents=new o(t.documents),t},toJSON:function(){var n=e.prototype.toJSON.call(this);return n.startDate&&(n.startDateText=t.format(n.startDate,"LL")),n.finishDate&&(n.finishDateText=t.format(n.finishDate,"LL")),n.qty&&n.unit&&(n.qtyUnit=n.qty+" "+n.unit),n.createdAt&&(n.createdAtText=t.format(n.createdAt,"LLLL")),n.updatedAt&&(n.updatedAtText=t.format(n.updatedAt,"LLLL")),n.operations=n.operations?n.operations.toJSON():[],n.documents=n.documents?n.documents.toJSON():[],n}})});