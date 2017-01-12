// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/core/View","app/hourlyPlans/templates/dailyMrpPlans/lineOrders","app/hourlyPlans/templates/dailyMrpPlans/lineOrderPopover"],function(e,t,r,i,n){"use strict";return r.extend({template:i,events:{"click .is-lineOrder":function(e){this.model.trigger("lineOrderClicked",{lineOrder:this.model.orders.get(e.currentTarget.dataset.id)})},"mouseenter .is-lineOrder":function(e){this.model.collection.plan.trigger("itemEntered",{type:"lineOrder",item:this.model.orders.get(e.currentTarget.dataset.id)})},"mouseleave .is-lineOrder":function(e){this.model.collection.plan.trigger("itemLeft",{type:"lineOrder",item:this.model.orders.get(e.currentTarget.dataset.id)})}},initialize:function(){this.listenTo(this.model.orders,"reset",this.render)},destroy:function(){this.$item().popover("destroy")},serialize:function(){return{idPrefix:this.idPrefix,line:this.model.id,shifts:this.model.orders.serializeShifts()}},afterRender:function(){var e=this;e.$el.popover({container:e.el,selector:".is-lineOrder",trigger:"hover",placement:"top",html:!0,content:function(){return e.getPopoverContent(e.$(this))},template:'<div class="popover dailyMrpPlan-popover"><div class="arrow"></div><div class="popover-content"></div></div>'})},$item:function(e){return e?this.$('.dailyMrpPlan-list-item[data-id="'+e+'"]'):this.$(".dailyMrpPlan-list-item")},getPopoverContent:function(e){var t=this.model.orders.get(e.attr("data-id"));return n({lineOrder:t.serializePopover()})}})});