// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/user","app/core/views/ListView"],function(e,r,n){return n.extend({remoteTopics:{"purchaseOrders.synced":"refreshCollection"},serializeColumns:function(){var n=["_id","pGr","plant","minScheduleDate"].map(function(r){return{id:r,label:e("purchaseOrders","PROPERTY:"+r)}});return n[3].noData="-",r.data.vendor||n.unshift({id:"vendorText",label:e("purchaseOrders","PROPERTY:vendor")}),n},serializeActions:function(){return function(){return[]}},serializeRows:function(){return this.collection.invoke("serialize")}})});