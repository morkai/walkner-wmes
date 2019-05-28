define(["underscore","../time","../core/Model"],function(t,e,r){"use strict";return r.extend({defaults:function(){return{minDate:"2017-01-01",maxDate:e.utc.getMoment().startOf("day").add(1,"days").format("YYYY-MM-DD"),mrps:[],lines:[],whStatuses:[],printOrderTimes:!1,useLatestOrderData:!0,useDarkerTheme:!1,wrapLists:!0,lineOrdersList:!1,from:"06:00",to:"06:00"}},initialize:function(t,e){this.storageKey=e&&e.storageKey||"PLANNING:DISPLAY_OPTIONS",this.on("change",this.saveToLocalStorage)},saveToLocalStorage:function(){localStorage.setItem(this.storageKey,JSON.stringify(this.attributes))},readFromLocalStorage:function(){this.set(JSON.parse(localStorage.getItem(this.storageKey)||"{}"))},isOrderTimePrinted:function(){return this.attributes.printOrderTimes},togglePrintOrderTime:function(){this.set("printOrderTimes",!this.attributes.printOrderTimes)},isLatestOrderDataUsed:function(){return!0},toggleLatestOrderDataUse:function(){this.set("useLatestOrderData",!this.attributes.useLatestOrderData)},isDarkerThemeUsed:function(){return this.attributes.useDarkerTheme},toggleDarkerThemeUse:function(){this.set("useDarkerTheme",!this.attributes.useDarkerTheme)},isListWrappingEnabled:function(){return!0},toggleListWrapping:function(){this.set("wrapLists",!this.attributes.wrapLists)},isLineOrdersListEnabled:function(){return this.attributes.lineOrdersList},toggleLineOrdersList:function(){this.set("lineOrdersList",!this.attributes.lineOrdersList)},getStartTimeRange:function(t){var r=e.utc.getMoment(t+" "+this.get("from"),"YYYY-MM-DD HH:mm"),s=e.utc.getMoment(t+" "+this.get("to"),"YYYY-MM-DD HH:mm");return r.hours()<6&&r.add(1,"days"),(s.hours()<6||6===s.hours()&&0===s.minutes())&&s.add(1,"days"),{from:r.valueOf(),to:s.valueOf()}}},{fromLocalStorage:function(t,e){var r=new this(null,e);return r.readFromLocalStorage(),["mrps","lines","whStatuses"].forEach(function(e){Array.isArray(t[e])&&r.set(e,t[e])}),r}})});