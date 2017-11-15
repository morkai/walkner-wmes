// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../time","../core/Model"],function(t,e,r){"use strict";var s="PLANNING:DISPLAY_OPTIONS";return r.extend({defaults:function(){return{minDate:"2017-01-01",maxDate:e.utc.getMoment().startOf("day").add(1,"days").format("YYYY-MM-DD"),mrps:[],printOrderTimes:!1,useLatestOrderData:!0,wrapLists:!0,lineOrdersList:!1}},initialize:function(){this.on("change",this.saveToLocalStorage)},saveToLocalStorage:function(){localStorage.setItem(s,JSON.stringify(this.attributes))},readFromLocalStorage:function(){this.set(JSON.parse(localStorage.getItem(s)||"{}"))},isOrderTimePrinted:function(){return this.attributes.printOrderTimes},togglePrintOrderTime:function(){this.set("printOrderTimes",!this.attributes.printOrderTimes)},isLatestOrderDataUsed:function(){return this.attributes.useLatestOrderData},toggleLatestOrderDataUse:function(){this.set("useLatestOrderData",!this.attributes.useLatestOrderData)},isListWrappingEnabled:function(){return!0},toggleListWrapping:function(){this.set("wrapLists",!this.attributes.wrapLists)},isLineOrdersListEnabled:function(){return this.attributes.lineOrdersList},toggleLineOrdersList:function(){this.set("lineOrdersList",!this.attributes.lineOrdersList)}},{fromLocalStorage:function(t){var e=new this;return e.readFromLocalStorage(),Array.isArray(t.mrps)&&e.set("mrps",t.mrps),e}})});