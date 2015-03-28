// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/views/ListView"],function(e,i){return i.extend({remoteTopics:{"emptyOrders.synced":"refreshCollection"},columns:[{id:"_id",className:"is-min"},{id:"nc12",className:"is-min"},{id:"mrp",className:"is-min"},{id:"startDateText",label:e.bound("emptyOrders","PROPERTY:startDate"),className:"is-min"},{id:"finishDateText",label:e.bound("emptyOrders","PROPERTY:finishDate")}],serializeActions:function(){return[]}})});