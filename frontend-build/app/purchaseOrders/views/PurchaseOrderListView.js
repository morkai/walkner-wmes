// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/user","app/core/views/ListView"],function(e,i,t){"use strict";return t.extend({className:"pos-list is-clickable",remoteTopics:{"purchaseOrders.synced":function(e){(e.created||e.updated||e.closed)&&this.refreshCollection()},"purchaseOrders.printed.*":"setPrintedQty","purchaseOrders.cancelled.*":"setPrintedQty"},initialize:function(){t.prototype.initialize.call(this),this.listenTo(this.collection,"change",this.render)},serializeColumns:function(){var t=[{id:"_id",className:"is-min"},{id:"pGr",className:"is-min"},{id:"plant",className:"is-min"},{id:"qty",className:"is-min is-number"},{id:"printedQty",className:"is-min is-number"},{id:"minScheduleDate",noData:"-"}];return i.data.vendor||t.unshift({id:"vendorText",label:e("purchaseOrders","PROPERTY:vendor")}),t},serializeActions:function(){return null},serializeRows:function(){return this.collection.invoke("serialize")},setPrintedQty:function(e){var i=this.collection.get(e._id);i&&i.set("printedQty",e.printedQty)}})});