// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Model"],function(t){"use strict";var e={status:0,updatedAt:new Date,updater:null};return t.extend({urlRoot:"/planning/whOrderStatuses",topicPrefix:"planning.whOrderStatuses",privilegePrefix:"PLANNING",nlsDomain:"planning",defaults:function(){return{orders:{}}},setOrderStatus:function(t,e){this.attributes.orders[t]=e,this.trigger("change:orders",t,e)},getOrderStatus:function(t){return this.attributes.orders[t]||e}})});