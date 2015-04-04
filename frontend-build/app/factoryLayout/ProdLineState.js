// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model","../prodShifts/ProdShift","../prodShiftOrders/ProdShiftOrder","../prodShiftOrders/ProdShiftOrderCollection","../prodDowntimes/ProdDowntime","../prodDowntimes/ProdDowntimeCollection"],function(r,e,t,o,i,d){"use strict";return r.extend({urlRoot:"/production/state",clientUrlRoot:"#factoryLayout",topicPrefix:"production",privilegePrefix:"FACTORY_LAYOUT",nlsDomain:"factoryLayout",defaults:{v:0,state:null,stateChangedAt:0,online:!1,extended:!1,plannedQuantityDone:0,actualQuantityDone:0,prodShift:null,prodShiftOrders:null,prodDowntimes:null},getLabel:function(){return this.getProdLineId().substr(0,10).toUpperCase().replace(/(_+|~.*?)$/,"").replace(/_/g," ")},getProdLineId:function(){return null===this.attributes.prodShift?this.id:this.attributes.prodShift.get("prodLine")},update:function(r){var o=this.attributes,d=!1,s=null,p=null;if("object"==typeof r.prodShift&&(null===r.prodShift?o.prodShift=null:null===o.prodShift?o.prodShift=new e(e.parse(r.prodShift)):o.prodShift.set(e.parse(r.prodShift)),d=!0,delete r.prodShift),Array.isArray(r.prodShiftOrders))o.prodShiftOrders.reset(r.prodShiftOrders.map(t.parse)),s={reset:!0},delete r.prodShiftOrders;else if(r.prodShiftOrders){var n=o.prodShiftOrders.get(r.prodShiftOrders._id);n?n.set(t.parse(r.prodShiftOrders)):o.prodShiftOrders.add(t.parse(r.prodShiftOrders)),s={reset:!1},delete r.prodShiftOrders}if(Array.isArray(r.prodDowntimes))o.prodDowntimes.reset(r.prodDowntimes.map(i.parse)),p={reset:!0},delete r.prodDowntimes;else if(r.prodDowntimes){var a=o.prodDowntimes.get(r.prodDowntimes._id);a?a.set(i.parse(r.prodDowntimes)):o.prodDowntimes.add(i.parse(r.prodDowntimes)),p={reset:!1},delete r.prodDowntimes}d&&this.trigger("change:prodShift"),s&&this.trigger("change:prodShiftOrders",s),p&&this.trigger("change:prodDowntimes",p),Object.keys(r).length?this.set(r):this.trigger("change")}},{parse:function(r){var s=new o;s.comparator="startedAt",s.reset(r.prodShiftOrders.map(t.parse));var p=new d;return p.comparator="startedAt",p.reset(r.prodDowntimes.map(i.parse)),r.prodShift=r.prodShift?new e(e.parse(r.prodShift)):null,r.prodShiftOrders=s,r.prodDowntimes=p,r}})});