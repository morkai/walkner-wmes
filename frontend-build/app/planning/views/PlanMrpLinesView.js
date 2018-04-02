// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/viewport","app/user","app/core/View","app/core/views/DialogView","app/data/orgUnits","../util/contextMenu","./PlanLineSettingsDialogView","./PlanLinesMrpPriorityDialogView","./PlanLinesWorkerCountDialogView","./PlanLinesOrderPriorityDialogView","./PlanLineFreezeOrdersDialogView","app/planning/templates/lines","app/planning/templates/linePopover","app/planning/templates/lineRemoveDialog"],function(e,i,n,t,r,o,s,a,l,p,d,h,g,c,u,m,f){"use strict";return o.extend({template:u,events:{"contextmenu .is-line":function(e){return this.showLineMenu(e),!1},"click #-edit":function(e){return this.$id("edit").blur(),this.showLinesMenu(e),!1}},localTopics:{"planning.windowResized":"resize","planning.escapePressed":"hideMenu"},initialize:function(){this.listenTo(this.plan.settings,"changed",this.onSettingsChanged),this.listenTo(this.mrp.lines,"change:frozenOrders",this.onFrozenOrdersChanged)},destroy:function(){this.hideMenu(),this.$el.popover("destroy")},serialize:function(){var e=this;return{idPrefix:e.idPrefix,showEditButton:e.plan.canEditSettings(),lines:e.mrp.lines.map(function(i){var n=i.mrpSettings(e.mrp.id);return{_id:i.id,workerCount:n?n.get("workerCount"):"?",customTimes:e.serializeActiveTime(i,!1),frozenOrders:i.getFrozenOrderCount()}})}},afterRender:function(){var e=this;e.$id("list").on("scroll",function(i){e.$id("scrollIndicator").toggleClass("hidden",i.target.scrollLeft<=40)}),e.resize(),e.$el.popover({container:this.el,selector:".planning-mrp-list-item",trigger:"hover",placement:"top",html:!0,hasContent:!0,content:function(){return e.serializePopover(this.dataset.id)},template:'<div class="popover planning-mrp-popover"><div class="arrow"></div><div class="popover-content"></div></div>'})},resize:function(){var e=this.$(".planning-mrp-list-action");if(e.length){var i=this.$id("scrollIndicator"),n=e.position();i.css({top:n.top+1+"px",left:e.outerWidth()+n.left+"px"}),l.hide(this)}},$item:function(e){return e?this.$('.planning-mrp-list-item[data-id="'+e+'"]'):this.$(".planning-mrp-list-item")},serializePopover:function(e){var i=this.mrp.lines.get(e);if(!i)return"?";var t=a.getAllForProdLine(e),r=a.getByTypeAndId("prodFlow",t.prodFlow),o=a.getByTypeAndId("prodLine",t.prodLine),s=i.mrpSettings(this.mrp.id);return r=r?r.get("name"):"",o=o?o.get("description"):"",-1!==r.replace(/[^A-Za-z0-9]+/g,"").indexOf(o.replace(/[^A-Za-z0-9]+/g,""))&&(o=""),m({line:{_id:e,division:t.division?t.division:"?",prodFlow:r,prodLine:o,activeTime:this.serializeActiveTime(i,!0),workerCount:s?s.get("workerCount"):"?",mrpPriority:i.settings?i.settings.get("mrpPriority").join(", "):"?",orderPriority:s?s.get("orderPriority").map(function(e){return n("planning","orderPriority:"+e)}).join(", "):"?"}})},serializeActiveTime:function(e,i){if(!e.settings)return"";var n=e.settings.get("activeTime").map(function(e){return e.from+"-"+e.to}).join(", ");return n&&"06:00-06:00"!==n?n:i?"06:00-06:00":""},hideMenu:function(){l.hide(this)},showLinesMenu:function(){if(this.plan.canEditSettings()){var e=this.$id("edit"),i=e.offset();l.show(this,i.top+e.outerHeight()/2,i.left+e.outerWidth()/2,[{icon:"fa-check",label:n("planning","lines:menu:mrpPriority"),handler:this.handleMrpPriorityAction.bind(this)},{icon:"fa-user",label:n("planning","lines:menu:workerCount"),handler:this.handleWorkerCountAction.bind(this)},{icon:"fa-star-half-o",label:n("planning","lines:menu:orderPriority"),handler:this.handleOrderPriorityAction.bind(this)}])}},showLineMenu:function(e){if(this.plan.canEditSettings()){var i=this.mrp.lines.get(this.$(e.currentTarget).attr("data-id")),t=[{icon:"fa-cogs",label:n("planning","lines:menu:settings"),handler:this.handleSettingsAction.bind(this,i)},{icon:"fa-times",label:n("planning","lines:menu:remove"),handler:this.handleRemoveAction.bind(this,i)}];this.plan.canFreezeOrders()&&t.push({icon:"fa-lock",label:n("planning","lines:menu:freezeOrders"),handler:this.handleFreezeOrdersAction.bind(this,i)}),l.show(this,e.pageY,e.pageX,t)}},handleMrpPriorityAction:function(){var e=new d({plan:this.plan,mrp:this.mrp});t.showDialog(e,n("planning","lines:menu:mrpPriority:title"))},handleWorkerCountAction:function(){var e=new h({plan:this.plan,mrp:this.mrp});t.showDialog(e,n("planning","lines:menu:workerCount:title"))},handleOrderPriorityAction:function(){var e=new g({plan:this.plan,mrp:this.mrp});t.showDialog(e,n("planning","lines:menu:orderPriority:title"))},handleSettingsAction:function(e){var i=new p({plan:this.plan,mrp:this.mrp,line:e});t.showDialog(i,n("planning","lines:menu:settings:title"))},handleRemoveAction:function(i){var r=this,o=new s({autoHide:!1,template:f,model:{plan:r.plan.getLabel(),mrp:r.mrp.getLabel(),line:i.getLabel()}});r.listenTo(o,"answered",function(){var s=r.plan.settings.lines.get(i.id);s.set("mrpPriority",e.without(s.get("mrpPriority"),r.mrp.id));var a=r.promised(r.plan.settings.save());a.done(o.closeDialog),a.fail(function(){t.msg.show({type:"error",time:3e3,text:n("planning","lines:menu:remove:failure")}),r.plan.settings.trigger("errored"),o.enableAnswers()})}),t.showDialog(o,n("planning","lines:menu:remove:title"))},handleFreezeOrdersAction:function(e){var i=new c({plan:this.plan,mrp:this.mrp,line:e});t.showDialog(i,n("planning","lines:menu:freezeOrders:title"))},onSettingsChanged:function(e){e.lines.any&&e.mrps[this.mrp.id]&&this.render()},onFrozenOrdersChanged:function(e){var i=e.getFrozenOrderCount();this.$('.is-line[data-id="'+e.id+'"]').find('span[data-property="frozenOrders"]').toggleClass("hidden",0===i).find("span").text(i)}})});