define(["underscore","jquery","app/i18n","app/viewport","app/user","app/core/View","app/core/views/DialogView","app/data/orgUnits","app/wh-lines/WhLineCollection","app/wh-lines/views/RedirLineDialogView","app/wh-deliveredOrders/WhDeliveredOrderCollection","../util/contextMenu","./PlanLineSettingsDialogView","./PlanLinesMrpPriorityDialogView","./PlanLinesWorkerCountDialogView","./PlanLinesOrderPriorityDialogView","./PlanLinesOrderGroupPriorityDialogView","./PlanLineFreezeOrdersDialogView","app/planning/templates/lines","app/planning/templates/linePopover","app/planning/templates/lineRemoveDialog"],function(e,i,t,n,r,s,o,a,l,d,h,p,u,g,c,m,f,w,v,L,y){"use strict";return s.extend({template:v,modelProperty:"plan",events:{"contextmenu .is-line":function(e){return this.showLineMenu(e),!1},"click #-edit":function(e){return this.$id("edit").blur(),this.showLinesMenu(e),!1}},localTopics:{"planning.windowResized":"resize","planning.escapePressed":"hideMenu"},initialize:function(){this.listenTo(this.plan.settings,"changed",this.onSettingsChanged),this.listenTo(this.plan.whLines,"add remove change:redirLine",this.onWhLineChanged),this.listenTo(this.mrp.lines,"change:frozenOrders",this.onFrozenOrdersChanged)},destroy:function(){this.hideMenu(),this.$el.popover("destroy")},getTemplateData:function(){var e=this;return{showEditButton:e.isEditable(),lines:e.mrp.getSortedLines().map(function(i){return{_id:i.id,redirLine:e.serializeRedirLine(i),workerCount:e.serializeWorkerCount(i),customTimes:e.serializeActiveTime(i,!1),frozenOrders:i.getFrozenOrderCount()}})}},beforeRender:function(){this.$el.popover("destroy")},afterRender:function(){var e=this;e.$id("list").on("scroll",function(i){e.$id("scrollIndicator").toggleClass("hidden",i.target.scrollLeft<=40)}),e.resize(),e.$el.popover({container:this.el,selector:".planning-mrp-list-item",trigger:"hover",placement:"top",html:!0,hasContent:!0,content:function(){return e.serializePopover(this.dataset.id)},className:"planning-mrp-popover"})},resize:function(){var e=this.$(".planning-mrp-list-action");if(e.length){var i=this.$id("scrollIndicator"),t=e.position();i.css({top:t.top+1+"px",left:e.outerWidth()+t.left+"px"}),p.hide(this)}},$item:function(e){return e?this.$('.planning-mrp-list-item[data-id="'+e+'"]'):this.$(".planning-mrp-list-item")},serializePopover:function(e){var i=this.mrp.lines.get(e);if(!i)return"?";var t=a.getAllForProdLine(e),n=a.getByTypeAndId("prodFlow",t.prodFlow),r=a.getByTypeAndId("prodLine",t.prodLine);return n=n?n.get("name"):"",r=r?r.get("description"):"",-1!==n.replace(/[^A-Za-z0-9]+/g,"").indexOf(r.replace(/[^A-Za-z0-9]+/g,""))&&(r=""),this.renderPartialHtml(L,{line:{_id:e,division:t.division?t.division:"?",prodFlow:n,prodLine:r,activeTime:this.serializeActiveTime(i,!0),extraCapacity:i.settings?i.settings.get("extraCapacity"):"0",workerCount:this.serializeWorkerCount(i),mrpPriority:i.settings?i.settings.get("mrpPriority").join("; "):"?",orderPriority:this.serializeOrderPriority(i),redirLine:this.serializeRedirLine(i),whLine:this.serializeWhLine(i)}})},serializeOrderPriority:function(e){const i=1===this.plan.settings.getVersion()?e.mrpSettings(this.mrp.id):e.settings;return(i?i.get("orderPriority"):[]).map(e=>this.t(`orderPriority:${e}`)).join("; ")},serializeActiveTime:function(e,i){if(!e.settings)return"";var t=(e.settings.get("activeTime")||[]).map(function(e){return e.from+"-"+e.to}).join(", ");return t&&"06:00-06:00"!==t?t:i?"06:00-06:00":""},serializeRedirLine:function(e){var i=this.plan.whLines.get(e.id);return i&&i.get("redirLine")||null},serializeWhLine:function(e){var i=this.plan.whLines.get(e.id);if(!i)return null;var t=this.plan.whLines.get(i.get("redirLine"));return t?t.attributes:i?i.attributes:null},serializeWorkerCount:function(e){var i=[0,0,0];if(1===this.plan.settings.getVersion()){var t=e.mrpSettings&&e.mrpSettings(this.mrp.id);t&&(i=t.get("workerCount"))}else i=e.settings&&e.settings.get("workerCount")||null;return Array.isArray(i)?i[0]===i[1]&&i[0]===i[2]?i[0].toLocaleString():i.map(e=>e.toLocaleString()).join("; "):"?"},hideMenu:function(){p.hide(this)},showLinesMenu:function(){if(this.plan.canEditSettings()){var e=this.$id("edit"),i=e.offset();p.show(this,i.top+e.outerHeight()/2,i.left+e.outerWidth()/2,[{icon:"fa-check",label:this.t("lines:menu:mrpPriority"),handler:this.handleMrpPriorityAction.bind(this)},{icon:"fa-user",label:this.t("lines:menu:workerCount"),handler:this.handleWorkerCountAction.bind(this)},{icon:"fa-star-half-o",label:this.t("lines:menu:orderPriority"),handler:this.handleOrderPriorityAction.bind(this)},{icon:"fa-columns",label:this.t("lines:menu:orderGroupPriority"),handler:this.handleOrderGroupPriorityAction.bind(this),visible:this.plan.settings.getVersion()>1}])}},isEditable:function(){return!("production"===window.ENV||!r.isAllowedTo("SUPER"))||this.plan.canEditSettings()&&!this.plan.settings.isMrpLocked(this.mrp.id)},showLineMenu:function(e){var i=this.mrp.lines.get(this.$(e.currentTarget).attr("data-id")),t=[];this.isEditable()&&(t.push({icon:"fa-cogs",label:this.t("lines:menu:settings"),handler:this.handleSettingsAction.bind(this,i)},{icon:"fa-times",label:this.t("lines:menu:remove"),handler:this.handleRemoveAction.bind(this,i)}),this.plan.canFreezeOrders()&&t.push({icon:"fa-lock",label:this.t("lines:menu:freezeOrders"),handler:this.handleFreezeOrdersAction.bind(this,i)}));var n=this.plan.whLines.get(i.id);n&&(h.can.view()&&t.push({icon:"fa-cubes",label:this.t("lines:menu:deliveredOrders"),handler:this.handleDeliveredOrders.bind(this,i)}),l.can.redir()&&t.push({icon:"fa-arrow-right",label:this.t("lines:menu:redirLine:"+(n.get("redirLine")?"stop":"start")),handler:this.handleRedirLine.bind(this,i)})),t.length&&p.show(this,e.pageY,e.pageX,t)},handleMrpPriorityAction:function(){var e=new g({plan:this.plan,mrp:this.mrp});n.showDialog(e,this.t("lines:menu:mrpPriority:title",{mrp:this.mrp.id}))},handleWorkerCountAction:function(){var e=new c({plan:this.plan,mrp:this.mrp});n.showDialog(e,this.t("lines:menu:workerCount:title"))},handleOrderPriorityAction:function(){var e=new m({plan:this.plan,mrp:this.mrp});n.showDialog(e,this.t("lines:menu:orderPriority:title"))},handleOrderGroupPriorityAction:function(){var e=new f({orderGroups:this.orderGroups,plan:this.plan,mrp:this.mrp});n.showDialog(e,this.t("lines:menu:orderGroupPriority:title"))},handleSettingsAction:function(e){var i=new u({orderGroups:this.orderGroups,plan:this.plan,mrp:this.mrp,line:e});n.showDialog(i,this.t("lines:menu:settings:title"))},handleRemoveAction:function(i){var t=this,r=new o({autoHide:!1,template:y,model:{plan:t.plan.getLabel(),mrp:t.mrp.getLabel(),line:i.getLabel()}});t.listenTo(r,"answered",function(){var s=t.plan.settings.lines.get(i.id);s.set("mrpPriority",e.without(s.get("mrpPriority"),t.mrp.id));var o=t.promised(t.plan.settings.save());o.done(r.closeDialog),o.fail(function(){n.msg.show({type:"error",time:3e3,text:t.t("lines:menu:remove:failure")}),t.plan.settings.trigger("errored"),r.enableAnswers()})}),n.showDialog(r,t.t("lines:menu:remove:title"))},handleFreezeOrdersAction:function(e){var i=new w({plan:this.plan,mrp:this.mrp,line:e});n.showDialog(i,this.t("lines:menu:freezeOrders:title"))},handleDeliveredOrders:function(e){var i=this.plan.whLines.get(e.id);if(i){var t=this.plan.whLines.get(i.get("redirLine")),n=encodeURIComponent(t?t.id:i.id);window.open("/#wh/deliveredOrders?sort(date,set,startTime)&limit(-1337)&status=in=(todo,blocked)&line="+n)}},handleRedirLine:function(e){var i=this.plan.whLines.get(e.id);if(i){var t=new d({model:i});n.showDialog(t,t.t("redirLine:title:"+(i.get("redirLine")?"stop":"start")))}},onSettingsChanged:function(e){(e.lines.any&&e.mrps[this.mrp.id]||e.locked)&&this.render()},onFrozenOrdersChanged:function(e){var i=e.getFrozenOrderCount();this.$('.is-line[data-id="'+e.id+'"]').find('span[data-property="frozenOrders"]').toggleClass("hidden",0===i).find("span").text(i)},onWhLineChanged:function(e){if(this.mrp.lines.get(e.id)){var i=e.get("redirLine")||null;this.$('.is-line[data-id="'+e.id+'"]').find('span[data-property="redirLine"]').toggleClass("hidden",!i).find("span").text(i||"")}}})});