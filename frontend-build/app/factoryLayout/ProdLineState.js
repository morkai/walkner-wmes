define(["underscore","../core/Model","../prodShifts/ProdShift","../prodShiftOrders/ProdShiftOrder","../prodShiftOrders/ProdShiftOrderCollection","../prodDowntimes/ProdDowntime","../prodDowntimes/ProdDowntimeCollection"],function(t,r,e,i,o,s,d){"use strict";return r.extend({urlRoot:"/production/state",clientUrlRoot:"#factoryLayout",topicPrefix:"production",privilegePrefix:"FACTORY_LAYOUT",nlsDomain:"factoryLayout",defaults:{v:0,state:null,stateChangedAt:0,online:!1,extended:!1,plannedQuantityDone:0,actualQuantityDone:0,prodShift:null,prodShiftOrders:null,prodDowntimes:null},initialize:function(t,r){this.settings=r&&r.settings?r.settings:null},getLabel:function(){var t=this.getProdLineId().toUpperCase().replace(/(_+|~.*?)$/,"").replace(/[_-]+/g," ");return t.length>10&&(t=t.replace(/ +/g,"")),t},getProdLineId:function(){return null===this.attributes.prodShift?this.id:this.attributes.prodShift.get("prodLine")},getCurrentOrder:function(){if(!this.attributes.prodShiftOrders)return null;var t=this.attributes.prodShiftOrders.last();return t&&!t.get("finishedAt")?t:null},getCurrentDowntime:function(){if(!this.attributes.prodDowntimes)return null;var t=this.attributes.prodDowntimes.last();return t&&!t.get("finishedAt")?t:null},isTaktTimeOk:function(){var t=this.get("prodShiftOrders");if(!t||!t.length)return!0;var r=t.last();if(r.get("finishedAt")||!this.settings||!this.settings.production.isTaktTimeEnabled(this.id))return!0;var e=r.get("avgTaktTime")/1e3,i=r.getSapTaktTime(this.settings.production);return!e||e<=i},update:function(r){r=t.clone(r);var o=this.attributes,d=!1,n=null,p=null,a=null;if("object"==typeof r.prodShift&&(null===r.prodShift?o.prodShift=null:null===o.prodShift?o.prodShift=new e(e.parse(r.prodShift)):o.prodShift.set(e.parse(r.prodShift)),d=!0,delete r.prodShift),Array.isArray(r.prodShiftOrders))o.prodShiftOrders.reset(r.prodShiftOrders.map(i.parse)),n={reset:!0},delete r.prodShiftOrders;else if(r.prodShiftOrders){var h=o.prodShiftOrders.get(r.prodShiftOrders._id);h?h.set(i.parse(r.prodShiftOrders)):o.prodShiftOrders.add(i.parse(r.prodShiftOrders)),n={reset:!1},r.prodShiftOrders.lastTaktTime&&(a=r.prodShiftOrders),delete r.prodShiftOrders}if(Array.isArray(r.prodDowntimes))o.prodDowntimes.reset(r.prodDowntimes.map(s.parse)),p={reset:!0},delete r.prodDowntimes;else if(r.prodDowntimes){var f=o.prodDowntimes.get(r.prodDowntimes._id);f?f.set(s.parse(r.prodDowntimes)):o.prodDowntimes.add(s.parse(r.prodDowntimes)),p={reset:!1},delete r.prodDowntimes}d&&this.trigger("change:prodShift"),n&&this.trigger("change:prodShiftOrders",n),p&&this.trigger("change:prodDowntimes",p),a&&this.trigger("change:taktTime",this,a),Object.keys(r).length?this.set(r):this.trigger("change")}},{parse:function(t){var r=new o;r.comparator="startedAt",r.reset(t.prodShiftOrders.map(i.parse));var n=new d;return n.comparator="startedAt",n.reset(t.prodDowntimes.map(s.parse)),t.prodShift=t.prodShift?new e(e.parse(t.prodShift)):null,t.prodShiftOrders=r,t.prodDowntimes=n,t}})});