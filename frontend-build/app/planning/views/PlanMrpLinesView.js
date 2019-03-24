define(["underscore","jquery","app/i18n","app/viewport","app/user","app/core/View","app/core/views/DialogView","app/data/orgUnits","../util/contextMenu","./PlanLineSettingsDialogView","./PlanLinesMrpPriorityDialogView","./PlanLinesWorkerCountDialogView","./PlanLinesOrderPriorityDialogView","./PlanLineFreezeOrdersDialogView","app/planning/templates/lines","app/planning/templates/linePopover","app/planning/templates/lineRemoveDialog"],function(i,e,n,t,r,o,s,a,l,p,d,h,u,g,c,m,f){"use strict";return o.extend({template:c,events:{"contextmenu .is-line":function(i){return this.showLineMenu(i),!1},"click #-edit":function(i){return this.$id("edit").blur(),this.showLinesMenu(i),!1}},localTopics:{"planning.windowResized":"resize","planning.escapePressed":"hideMenu"},initialize:function(){this.listenTo(this.plan.settings,"changed",this.onSettingsChanged),this.listenTo(this.mrp.lines,"change:frozenOrders",this.onFrozenOrdersChanged)},destroy:function(){this.hideMenu(),this.$el.popover("destroy")},serialize:function(){var i=this;return{idPrefix:i.idPrefix,showEditButton:i.isEditable(),lines:i.mrp.lines.map(function(e){return{_id:e.id,workerCount:i.serializeWorkerCount(e),customTimes:i.serializeActiveTime(e,!1),frozenOrders:e.getFrozenOrderCount()}}).sort(function(i,e){return i._id.localeCompare(e._id,void 0,{numeric:!0,ignorePunctuation:!0})})}},afterRender:function(){var i=this;i.$id("list").on("scroll",function(e){i.$id("scrollIndicator").toggleClass("hidden",e.target.scrollLeft<=40)}),i.resize(),i.$el.popover({container:this.el,selector:".planning-mrp-list-item",trigger:"hover",placement:"top",html:!0,hasContent:!0,content:function(){return i.serializePopover(this.dataset.id)},template:'<div class="popover planning-mrp-popover"><div class="arrow"></div><div class="popover-content"></div></div>'})},resize:function(){var i=this.$(".planning-mrp-list-action");if(i.length){var e=this.$id("scrollIndicator"),n=i.position();e.css({top:n.top+1+"px",left:i.outerWidth()+n.left+"px"}),l.hide(this)}},$item:function(i){return i?this.$('.planning-mrp-list-item[data-id="'+i+'"]'):this.$(".planning-mrp-list-item")},serializePopover:function(i){var e=this.mrp.lines.get(i);if(!e)return"?";var t=a.getAllForProdLine(i),r=a.getByTypeAndId("prodFlow",t.prodFlow),o=a.getByTypeAndId("prodLine",t.prodLine),s=e.mrpSettings(this.mrp.id);return r=r?r.get("name"):"",o=o?o.get("description"):"",-1!==r.replace(/[^A-Za-z0-9]+/g,"").indexOf(o.replace(/[^A-Za-z0-9]+/g,""))&&(o=""),m({line:{_id:i,division:t.division?t.division:"?",prodFlow:r,prodLine:o,activeTime:this.serializeActiveTime(e,!0),workerCount:this.serializeWorkerCount(e),mrpPriority:e.settings?e.settings.get("mrpPriority").join(", "):"?",orderPriority:s?s.get("orderPriority").map(function(i){return n("planning","orderPriority:"+i)}).join(", "):"?"}})},serializeActiveTime:function(i,e){if(!i.settings)return"";var n=i.settings.get("activeTime").map(function(i){return i.from+"-"+i.to}).join(", ");return n&&"06:00-06:00"!==n?n:e?"06:00-06:00":""},serializeWorkerCount:function(i){var e=i.mrpSettings(this.mrp.id);if(!e)return"?";var n=e.get("workerCount");return n[0]===n[1]&&n[0]===n[2]?n[0].toString():n.join(", ")},hideMenu:function(){l.hide(this)},showLinesMenu:function(){if(this.plan.canEditSettings()){var i=this.$id("edit"),e=i.offset();l.show(this,e.top+i.outerHeight()/2,e.left+i.outerWidth()/2,[{icon:"fa-check",label:n("planning","lines:menu:mrpPriority"),handler:this.handleMrpPriorityAction.bind(this)},{icon:"fa-user",label:n("planning","lines:menu:workerCount"),handler:this.handleWorkerCountAction.bind(this)},{icon:"fa-star-half-o",label:n("planning","lines:menu:orderPriority"),handler:this.handleOrderPriorityAction.bind(this)}])}},isEditable:function(){return!("development"!==window.ENV||!r.isAllowedTo("SUPER"))||this.plan.canEditSettings()&&!this.plan.settings.isMrpLocked(this.mrp.id)},showLineMenu:function(i){if(this.isEditable()){var e=this.mrp.lines.get(this.$(i.currentTarget).attr("data-id")),t=[{icon:"fa-cogs",label:n("planning","lines:menu:settings"),handler:this.handleSettingsAction.bind(this,e)},{icon:"fa-times",label:n("planning","lines:menu:remove"),handler:this.handleRemoveAction.bind(this,e)}];this.plan.canFreezeOrders()&&t.push({icon:"fa-lock",label:n("planning","lines:menu:freezeOrders"),handler:this.handleFreezeOrdersAction.bind(this,e)}),l.show(this,i.pageY,i.pageX,t)}},handleMrpPriorityAction:function(){var i=new d({plan:this.plan,mrp:this.mrp});t.showDialog(i,n("planning","lines:menu:mrpPriority:title"))},handleWorkerCountAction:function(){var i=new h({plan:this.plan,mrp:this.mrp});t.showDialog(i,n("planning","lines:menu:workerCount:title"))},handleOrderPriorityAction:function(){var i=new u({plan:this.plan,mrp:this.mrp});t.showDialog(i,n("planning","lines:menu:orderPriority:title"))},handleSettingsAction:function(i){var e=new p({plan:this.plan,mrp:this.mrp,line:i});t.showDialog(e,n("planning","lines:menu:settings:title"))},handleRemoveAction:function(e){var r=this,o=new s({autoHide:!1,template:f,model:{plan:r.plan.getLabel(),mrp:r.mrp.getLabel(),line:e.getLabel()}});r.listenTo(o,"answered",function(){var s=r.plan.settings.lines.get(e.id);s.set("mrpPriority",i.without(s.get("mrpPriority"),r.mrp.id));var a=r.promised(r.plan.settings.save());a.done(o.closeDialog),a.fail(function(){t.msg.show({type:"error",time:3e3,text:n("planning","lines:menu:remove:failure")}),r.plan.settings.trigger("errored"),o.enableAnswers()})}),t.showDialog(o,n("planning","lines:menu:remove:title"))},handleFreezeOrdersAction:function(i){var e=new g({plan:this.plan,mrp:this.mrp,line:i});t.showDialog(e,n("planning","lines:menu:freezeOrders:title"))},onSettingsChanged:function(i){(i.lines.any&&i.mrps[this.mrp.id]||i.locked)&&this.render()},onFrozenOrdersChanged:function(i){var e=i.getFrozenOrderCount();this.$('.is-line[data-id="'+i.id+'"]').find('span[data-property="frozenOrders"]').toggleClass("hidden",0===e).find("span").text(e)}})});