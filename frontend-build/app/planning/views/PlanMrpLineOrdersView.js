define(["underscore","jquery","app/i18n","app/user","app/core/View","app/data/downtimeReasons","../util/shift","../util/contextMenu","app/planning/templates/lineOrders","app/planning/templates/lineOrderPopover","app/planning/templates/lineOrderDowntimePopover","app/planning/templates/lineOrderShiftPopover","app/planning/templates/lineOrderLinePopover"],function(t,e,i,r,n,s,o,a,d,h,l,p,g){"use strict";return n.extend({template:d,events:{"mouseenter .is-lineOrder":function(t){this.mrp.orders.trigger("highlight",{source:"lineOrders",state:!0,orderNo:this.line.orders.get(t.currentTarget.dataset.id).get("orderNo")})},"mouseleave .is-lineOrder":function(t){this.mrp.orders.trigger("highlight",{source:"lineOrders",state:!1,orderNo:this.line.orders.get(t.currentTarget.dataset.id).get("orderNo")})},"click .is-lineOrder":function(t){if(0===t.button){var e=this.line.orders.get(t.currentTarget.dataset.id).get("orderNo");if(t.ctrlKey)window.open("#orders/"+e);else if(this.mrp.orders.get(e))this.mrp.orders.trigger("preview",{orderNo:e,source:"lineOrders"});else{var i=this.plan.mrps.get(this.plan.orders.get(e).get("mrp"));i&&i.orders.trigger("preview",{orderNo:e,scrollIntoView:!0,source:"lineOrders"})}}},"contextmenu .is-lineOrder":function(t){return this.showLineOrderMenu(t),!1},"contextmenu .is-downtime":function(t){t.preventDefault()}},initialize:function(){this.listenTo(this.plan,"change:active",this.renderIfNotLoading),this.listenTo(this.plan.displayOptions,"change:useLatestOrderData",this.render),this.listenTo(this.plan.shiftOrders,"add",this.updateShiftOrder),this.listenTo(this.plan.shiftOrders,"change:quantityDone",this.updateShiftOrder),this.listenTo(this.plan.sapOrders,"reset",this.onSapOrdersReset),this.listenTo(this.line.orders,"reset",this.renderIfNotLoading),this.listenTo(this.mrp.orders,"highlight",this.onOrderHighlight),this.listenTo(this.mrp.orders,"change:incomplete",this.onIncompleteChange),this.prodLineState&&(this.listenTo(this.prodLineState,"change:online",this.onOnlineChange),this.listenTo(this.prodLineState,"change:state",this.updateShiftState),this.listenTo(this.prodLineState,"change:prodShift",this.updateShiftState),this.listenTo(this.prodLineState,"change:prodShiftOrders",this.updateShiftState))},destroy:function(){this.$el.popover("destroy")},serialize:function(){var t=this.serializeProdState();return{idPrefix:this.idPrefix,line:this.line.id,prodState:t,shifts:this.serializeShifts(t)}},afterRender:function(){var t=this;t.$el.popover({container:t.el,selector:"div[data-popover-content]",trigger:"hover",html:!0,placement:function(){return this.$element.attr("data-popover-placement")||"top"},hasContent:!0,content:function(){switch(this.dataset.popoverContent){case"lineOrder":return t.serializeOrderPopover(this.dataset.id);case"downtime":return t.serializeDowntimePopover(this.dataset.id);case"shift":return t.serializeShiftPopover(this.dataset.shift-1);case"line":return t.serializeLinePopover()}},template:'<div class="popover planning-mrp-popover"><div class="arrow"></div><div class="popover-content"></div></div>'})},renderIfNotLoading:function(){this.plan.isAnythingLoading()||this.render()},$item:function(t){return t?this.$('.planning-mrp-list-item[data-id="'+t+'"]'):this.$(".planning-mrp-list-item")},serializeProdState:function(){var t=this.prodLineState;if(!t||!this.plan.isProdStateUsed())return{online:"",shift:0,state:"",orderNo:""};var e=t.get("prodShift"),i=t.getCurrentOrder();return{online:t.get("online")?"is-online":"is-offline",state:t.get("state")||"",shift:e?e.get("shift"):0,orderNo:i?i.get("orderId"):""}},serializeShifts:function(t){var e=this.plan,i=this.mrp,r=this.line,n=[];if(0===r.orders.length)return n;[0,1,2,3].forEach(function(e){n.push({no:e,state:t.shift===e?t.state:"",startTime:0,orders:[],downtimes:[]})});var s=!1;return r.orders.forEach(function(a){if(!s){var d=e.orders.get(a.get("orderNo"));if(d){var h=e.getActualOrderData(d.id),l=d.get("mrp"),p=Date.parse(a.get("startAt")),g=Date.parse(a.get("finishAt")),f=g-p,u=n[o.getShiftNo(p)];0===u.startTime&&(u.startTime=o.getShiftStartTime(p));var c=u.orders[u.orders.length-1],m=c?c.finishAt:u.startTime,O=a.get("quantity"),v=e.shiftOrders.getTotalQuantityDone(r.id,u.no,d.id);u.orders.push({_id:a.id,orderNo:d.id,quantity:a.get("quantity"),incomplete:d.get("incomplete")>0?"is-incomplete":"",completed:v>=O?"is-completed":"",started:v>0&&v<O?"is-started":"",confirmed:-1!==h.statuses.indexOf("CNF")?"is-cnf":"",delivered:-1!==h.statuses.indexOf("DLV")?"is-dlv":"",selected:u.state&&d.id===t.orderNo?"is-selected":"",external:l!==i.id?"is-external":"",finishAt:g,margin:100*(p-m)/o.SHIFT_DURATION,width:100*f/o.SHIFT_DURATION,mrp:l})}else s=!0}}),r.get("downtimes").forEach(function(t,e){var i=Date.parse(t.startAt),r=n[o.getShiftNo(i)];r.downtimes.push({_id:e,reason:t.reason,left:100*(i-r.startTime)/o.SHIFT_DURATION,width:100*t.duration/o.SHIFT_DURATION})}),n.filter(function(t){return!s&&t&&t.orders.length>0})},serializeLinePopover:function(){var t=this.line.get("hourlyPlan"),e=0,i=0,r=0;return(this.line.get("shiftData")||[]).forEach(function(t){e+=t.orderCount,i+=t.quantity,r+=t.manHours}),g({stats:{orderCount:e,quantity:i,manHours:r,hourlyPlan:t}})},serializeShiftPopover:function(t){var e=this.line.get("hourlyPlan").slice(8*t,8*t+8),i=(this.line.get("shiftData")||[])[t]||{};return p({stats:{orderCount:i.orderCount||0,quantity:i.quantity||0,manHours:i.manHours||0,hourlyPlan:e}})},serializeOrderPopover:function(t){var e=this.line.orders.get(t),i=this.plan.orders.get(e.get("orderNo")),r=this.plan.sapOrders.get(i.id),n=this.plan.getActualOrderData(i.id),s=Date.parse(e.get("startAt")),a=Date.parse(e.get("finishAt")),d=this.plan.isProdStateUsed()?this.plan.shiftOrders.getTotalQuantityDone(this.line.id,o.getShiftNo(s),i.id):-1;return h({lineOrder:{_id:e.id,orderNo:i.id,quantityPlanned:e.get("quantity"),quantityRemaining:n.quantityTodo-n.quantityDone,quantityTotal:n.quantityTodo,quantityDone:d,pceTime:e.get("pceTime")/1e3,manHours:e.get("manHours")||0,startAt:s,finishAt:a,duration:(a-s)/1e3,comment:r?r.getCommentWithIcon():""}})},serializeDowntimePopover:function(t){var e=this.line.get("downtimes")[t],i=Date.parse(e.startAt),r=i+e.duration,n=s.get(e.reason);return l({lineDowntime:{reason:n?n.getLabel():e.reason,startAt:i,finishAt:r,duration:e.duration/1e3}})},hideMenu:function(){a.hide(this)},showLineOrderMenu:function(t){var e=this.line.orders.get(this.$(t.currentTarget).attr("data-id")),n=e.get("orderNo"),s=[a.actions.sapOrder(n)];r.isAllowedTo("PROD_DATA:VIEW")&&(this.plan.shiftOrders.findOrders(n).length||this.plan.getActualOrderData(n).quantityDone)&&s.push({icon:"fa-file-text-o",label:i("planning","orders:menu:shiftOrder"),handler:this.handleShiftOrderAction.bind(this,e)}),this.plan.canCommentOrders()&&s.push(a.actions.comment(n)),a.show(this,t.pageY,t.pageX,s)},handleShiftOrderAction:function(t){var e=t.get("orderNo"),i=this.line.id,r=o.getShiftNo(t.get("startAt")),n=this.plan.shiftOrders.findOrders(e,i,r);return 1===n.length?window.open("/#prodShiftOrders/"+n[0].id):n.length?window.open("/#prodShiftOrders?sort(startedAt)&limit(-1337)&orderId="+e+"&prodLine="+encodeURIComponent(i)+"&shift="+r):1===(n=this.plan.shiftOrders.findOrders(e,i)).length?window.open("/#prodShiftOrders/"+n[0].id):n.length?window.open("/#prodShiftOrders?sort(startedAt)&limit(-1337)&orderId="+e+"&prodLine="+encodeURIComponent(i)):1===(n=this.plan.shiftOrders.findOrders(e)).length?window.open("/#prodShiftOrders/"+n[0].id):void window.open("/#prodShiftOrders?sort(startedAt)&limit(-1337)&orderId="+e)},updateShiftState:function(){var t=this.serializeProdState(),e=this.$(".planning-mrp-lineOrders-shift").attr("data-state","").filter('[data-shift="'+t.shift+'"]');e.length&&t.state&&e.attr("data-state",t.state),this.$(".is-selected").removeClass("is-selected"),t.shift&&t.orderNo&&this.$id("list-"+t.shift).find('.is-lineOrder[data-order-no="'+t.orderNo+'"]').addClass("is-selected")},onOrderHighlight:function(t){this.$('.is-lineOrder[data-order-no="'+t.orderNo+'"]').toggleClass("is-highlighted",t.state)},onIncompleteChange:function(t){this.$('.is-lineOrder[data-order-no="'+t.id+'"]').toggleClass("is-incomplete",t.get("incomplete")>0)},onSapOrdersReset:function(t,e){!e.reload&&this.plan.displayOptions.isLatestOrderDataUsed()&&this.render()},onOnlineChange:function(){var t=this.$(".planning-mrp-list-hd").removeClass("is-online is-offline");this.prodLineState&&this.plan.isProdStateUsed()&&t.addClass("is-"+(this.prodLineState.get("online")?"online":"offline"))},updateShiftOrder:function(t){if(this.prodLineState&&this.plan.isProdStateUsed()&&t.get("prodLine")===this.line.id){var e=this.prodLineState.get("prodShift");if(e){var i=e.get("shift"),r=t.get("orderId"),n=this.$id("list-"+i).find('.is-lineOrder[data-order-no="'+r+'"]');if(n.length){var s=this.line.orders.get(n.attr("data-id"));if(s){var o=s.get("quantity"),a=this.plan.shiftOrders.getTotalQuantityDone(this.line.id,i,r);n.toggleClass("is-started",a>0).toggleClass("is-completed",a>=o)}}}}}})});