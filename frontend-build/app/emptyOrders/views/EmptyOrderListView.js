// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/views/ListView"],function(e,r){return r.extend({remoteTopics:{"emptyOrders.synced":"refreshCollection"},serializeColumns:function(){return[{id:"_id",label:e("emptyOrders","PROPERTY:_id")},{id:"nc12",label:e("emptyOrders","PROPERTY:nc12")},{id:"mrp",label:e("emptyOrders","PROPERTY:mrp")},{id:"startDateText",label:e("emptyOrders","PROPERTY:startDate")},{id:"finishDateText",label:e("emptyOrders","PROPERTY:finishDate")}]},serializeActions:function(){return[]}})});