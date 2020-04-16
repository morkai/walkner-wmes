define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/core/templates/userInfo","app/data/clipboard","app/planning/util/contextMenu","app/planning/PlanSapOrder","app/planning/templates/lineOrderComments","app/orders/util/commentPopover","app/wh-lines/WhLine","app/wh/templates/pickup/list","app/wh/templates/pickup/row","app/wh/templates/pickup/popover","app/wh/templates/pickup/linePopover"],function(t,e,i,s,n,r,a,o,d,l,h,p,c,u,g,m,f,w){"use strict";return a.extend({template:g,modelProperty:"whOrders",events:{"contextmenu td[data-column-id]":function(t){return this.showMenu(t),!1},"mousedown .planning-mrp-lineOrders-comment":function(t){if(0===t.button){var e=this.plan.sapOrders.get(t.currentTarget.parentNode.dataset.order);if(e){var i=e.get("comments");i.length&&this.$(t.currentTarget).popover({trigger:"manual",placement:"left",html:!0,className:"planning-mrp-comment-popover",content:p({comments:i.map(function(t){return{user:o({noIp:!0,userInfo:t.user}),time:s.toTagData(t.time).human,text:h.formatCommentWithIcon(t)}})})}).popover("show")}}},"mouseup .planning-mrp-lineOrders-comment":function(t){this.$(t.currentTarget).popover("destroy")},'click .is-clickable[data-column-id="set"]':function(t){this.trigger("setClicked",t.currentTarget.parentNode.dataset.id)}},initialize:function(){var t=this.plan,i=t.sapOrders;this.listenTo(t,"change:loading change:updatedAt",this.scheduleRender),this.listenTo(i,"reset",this.onOrdersReset),this.listenTo(i,"change:comments",this.onCommentChange),this.listenTo(i,"change:psStatus",this.onPsStatusChanged),this.listenTo(this.whOrders,"reset",this.onOrdersReset),this.listenTo(this.whOrders,"change",this.onOrderChanged),this.listenTo(this.whLines,"change",this.onLineChanged),this.listenTo(this.whLines,"change:redirLine",this.onRedirLineChanged),this.listenTo(t.displayOptions,"change:whStatuses",this.onWhStatusesFilterChanged),this.listenTo(t.displayOptions,"change:psStatuses",this.onPsStatusesFilterChanged),this.listenTo(t.displayOptions,"change:from change:to",this.onStartTimeFilterChanged),e(window).on("scroll."+this.idPrefix,this.positionStickyHeaders.bind(this))},destroy:function(){e(window).off("."+this.idPrefix),this.$stickyHeaders&&(this.$stickyHeaders.remove(),this.$stickyHeaders=null),e(".popover").popover("destroy")},getTemplateData:function(){return{renderRow:m,rows:this.serializeRows()}},serializeRows:function(){return this.whOrders.serialize(this.plan)},beforeRender:function(){clearTimeout(this.timers.render),e(".popover").popover("destroy")},afterRender:function(){this.setUpStickyHeaders(),this.setUpPopover(),this.toggleSeparatorRowVisibility()},scheduleRender:function(){clearTimeout(this.timers.render),!this.plan.isAnythingLoading()&&this.isRendered()&&(this.timers.render=setTimeout(this.renderIfNotLoading.bind(this),1))},renderIfNotLoading:function(){this.plan.isAnythingLoading()||this.render()},setUpPopover:function(){var t=this;t.$el.popover({selector:".wh-has-popover",container:"body",placement:"top auto",trigger:"hover",html:!0,className:"wh-list-popover",hasContent:function(){var i=this.dataset.columnId,s=e(this).closest(".wh-list-item")[0].dataset.id,n=t.t.has("list:popover:"+i),r=!!t.whOrders.get(s);return n&&r},title:function(){return t.t("list:popover:"+this.dataset.columnId)},content:function(){var i=t.whOrders.get(e(this).closest(".wh-list-item")[0].dataset.id);if(!i)return"";var s=this.dataset.columnId;if("line"===s){var n=i.get("lines"),r=i.get("redirLines");return t.renderPartial(w,{orderId:i.id,lines:n.map(function(e,i){var s=t.whLines.get(e._id)||new u({_id:e._id}),n=t.whLines.get(r&&r[i]||null),a=s.toJSON();return n&&(a._id=n.id,a.redirLine=s.id),a})})}var a={user:null,status:null,carts:[],problemArea:"",comment:"",qtyPerLine:[]};if("qty"===s)a.qtyPerLine=i.get("lines").map(function(t){return{line:t._id,qty:t.qty,max:i.get("qty")}});else if("fifoStatus"===s||"packStatus"===s)a.status=t.t("status:"+i.get(s));else if("picklist"===s){var o=i.getFunc(i.get("picklistFunc")),d=i.get("picklistDone");"pending"!==d?(a.user=o?o.user.label:null,a.status=t.t("status:picklistDone:"+d)):a.status=t.t("status:pending")}else if("fmx"===s||"kitter"===s||"packer"===s){var l=i.getFunc(this.dataset.columnId);a.status=t.t("status:"+l.status),a.carts=l.carts,a.problemArea=l.problemArea,a.comment=l.comment,l.user&&(a.user=l.user.label)}return t.renderPartial(f,a)}})},setUpStickyHeaders:function(){this.$stickyHeaders=e('<div class="planning-wh-list wh-list-sticky"></div>').html('<table class="planning-mrp-lineOrders-table">'+this.$("thead").first()[0].outerHTML+"</table>"),this.adjustStickyHeaders(),this.positionStickyHeaders();var t=e(document.body);t.find(".wh-list-sticky").remove(),t.append(this.$stickyHeaders)},adjustStickyHeaders:function(){if(this.$stickyHeaders){var t=this.$stickyHeaders.find("th");this.$("th").each(function(e){var i=this.getClientRects();t[e].style.width=(i.length?i[0].width:0)+"px"})}},positionStickyHeaders:function(){this.$stickyHeaders&&this.$stickyHeaders[0].classList.toggle("hidden",window.scrollY<this.el.offsetTop)},hideMenu:function(){l.hide(this)},showMenu:function(t){var e=t.currentTarget.parentNode,s=this.whOrders.get(e.dataset.id);if(s){var r=s.get("order"),a=s.get("set"),o=s.get("status"),d=s.get("distStatus"),h=[l.actions.sapOrder(r)];n.isAllowedTo("PROD_DATA:VIEW")&&(this.plan.shiftOrders.findOrders(r).length||this.plan.getActualOrderData(r).quantityDone)&&h.push({icon:"fa-file-text-o",label:i("wh","menu:shiftOrder"),handler:this.handleShiftOrderAction.bind(this,r)}),this.plan.canCommentOrders()&&h.push(l.actions.commentPopover(r,"wh")),h.push("-"),h.push({icon:"fa-clipboard",label:i("wh","menu:copy:all"),handler:this.handleCopyAction.bind(this,e,t.pageY,t.pageX,!1,!1)}),(n.isAllowedTo("WH:MANAGE")&&"pending"===d||"development"===window.ENV&&n.isAllowedTo("SUPER"))&&(h.push("-"),"cancelled"!==o&&(h.push({icon:"fa-times",label:i("wh","menu:cancelOrder"),handler:this.handleCancelAction.bind(this,{orders:[s.id]})}),a&&h.push({label:i("wh","menu:cancelSet"),handler:this.handleCancelAction.bind(this,{set:a})})),"pending"!==o&&(h.push({icon:"fa-eraser",label:i("wh","menu:resetOrder"),handler:this.handleResetAction.bind(this,{orders:[s.id]})}),a&&h.push({label:i("wh","menu:resetSet"),handler:this.handleResetAction.bind(this,{set:a})}))),l.show(this,t.pageY,t.pageX,h)}},handleShiftOrderAction:function(t){var e=this.plan.shiftOrders.findOrders(t);if(1===e.length)return window.open("/#prodShiftOrders/"+e[0].id);window.open("/#prodShiftOrders?sort(startedAt)&limit(-1337)&orderId=string:"+t)},handleCopyAction:function(e,s,n,r,a){var o=this;d.copy(function(d){if(d){var l=a?[]:[["group","no","set","shift","mrp","order","nc12","name","qtyPlan","qtyTodo","startTime","finishTime","line","picklist","fmx","kitter","packer","comment"].map(function(t){return i("wh","prop:"+t)}).join("\t")],h=o.whOrders.get(e.dataset.id),p=h.get("line"),c=h.get("group");o.serializeRows().forEach(function(t){if(!t.hidden&&(!r||t.line===p&&t.group===c))if(a)l.push(t.order);else{var e=[t.group,t.no,t.set,t.shift,t.mrp,t.order,t.nc12,t.name,t.qty,t.qtyTodo,t.startTime,t.finishTime,t.line,o.t("status:"+t.picklistDone),o.t("status:"+t.funcs[0].status),o.t("status:"+t.funcs[1].status),o.t("status:"+t.funcs[2].status),'"'+t.comments.map(function(t){return t.user.label+": "+t.text.replace(/"/g,"'")}).join("\r\n--\r\n")+'"'];l.push(e.join("\t"))}}),a&&(l=t.uniq(l)),d.setData("text/plain",l.join("\r\n"));var u=o.$(e).tooltip({container:o.el,trigger:"manual",placement:"bottom",title:o.t("planning","lineOrders:menu:copy:success")});u.tooltip("show").data("bs.tooltip").tip().addClass("result success").css({left:n+"px",top:s+"px"}),o.timers.hideTooltip&&clearTimeout(o.timers.hideTooltip),o.timers.hideTooltip=setTimeout(function(){u.tooltip("destroy")},1337)}})},handleResetAction:function(t){r.msg.saving(),this.promised(this.whOrders.act("resetOrders",t)).done(function(){r.msg.saved()}).fail(function(){r.msg.savingFailed()})},handleCancelAction:function(t){r.msg.saving(),this.promised(this.whOrders.act("resetOrders",Object.assign({cancel:!0},t))).done(function(){r.msg.saved()}).fail(function(){r.msg.savingFailed()})},handleRestoreAction:function(t){r.msg.saving(),this.promised(this.whOrders.act("restoreOrders",t)).done(function(){r.msg.saved()}).fail(function(){r.msg.savingFailed()})},onCommentChange:function(t){this.plan.orders.get(t.id)&&this.$('tr[data-order="'+t.id+'"] > .planning-mrp-lineOrders-comment').html(t.getCommentWithIcon())},onOrdersReset:function(t,e){e.reload||this.scheduleRender()},onPsStatusChanged:function(t){var e=this.$('tr[data-order="'+t.id+'"]');if(e.length){var s=this.plan.sapOrders.getPsStatus(t.id);e.find(".planning-mrp-list-property-psStatus").attr("title",i("planning","orders:psStatus:"+s)).attr("data-ps-status",s)}},onOrderChanged:function(t){var e=this.$('tr[data-id="'+t.id+'"]');if(e.length){var i=this.whOrders.indexOf(t);e.replaceWith(m({row:t.serialize(this.plan,i,this.whOrders.getFilters(this.plan))})),this.adjustStickyHeaders(),this.toggleSeparatorRowVisibility()}},onLineChanged:function(t){var i=this,s=t.hasChanged("redirLine"),n=t.id;e(".wh-list-popover-line").each(function(){var t=i.whOrders.get(this.dataset.orderId);if(t){if(!s)if(!t.get("lines").some(function(t){if(t._id===n)return!0;var e=i.whLines.get(t._id);return e&&e.get("redirLine")===n}))return;var e=i.$('tr[data-id="'+t.id+'"]').find('td[data-column-id="line"]').data("bs.popover");e&&e.show({transition:!1})}})},onRedirLineChanged:function(t){for(var e=this.whOrders.getFilters(this.plan),i=!1,s=0;s<this.whOrders.length;++s){var n=this.whOrders.models[s];if(n.get("lines").some(function(e){return e._id===t.id})){var r=this.$('tr[data-id="'+n.id+'"]');r.length&&(r.replaceWith(m({row:n.serialize(this.plan,s,e)})),i=!0)}}i&&(this.adjustStickyHeaders(),this.toggleSeparatorRowVisibility())},onWhStatusesFilterChanged:function(){this.toggleOrderRowVisibility()},onPsStatusesFilterChanged:function(){this.toggleOrderRowVisibility()},onStartTimeFilterChanged:function(){this.toggleOrderRowVisibility()},toggleOrderRowVisibility:function(){var t=this.whOrders.getFilters(this.plan);this.$(".wh-list-item").each(function(){var e=+this.dataset.startTime,i=e<t.startTime.from||e>=t.startTime.to;if(!i&&t.whStatuses.length&&(i=-1===t.whStatuses.indexOf(this.dataset.status)),!i&&t.psStatuses.length){var s=this.querySelector(".planning-mrp-list-property-psStatus"),n=s?s.dataset.psStatus:"unknown";i=-1===t.psStatuses.indexOf(n)}this.classList.toggle("hidden",i)}),this.toggleSeparatorRowVisibility()},toggleSeparatorRowVisibility:function(){var e=this.$(".planning-mrp-lineOrders-table");if(t.isEmpty(this.plan.displayOptions.get("whStatuses"))&&t.isEmpty(this.plan.displayOptions.get("psStatuses"))&&"06:00"===this.plan.displayOptions.get("from")&&"06:00"===this.plan.displayOptions.get("to"))return e.find(".planning-wh-newLine-tr.hidden").removeClass("hidden"),void e.find(".planning-wh-newGroup-tr.hidden").removeClass("hidden");var i=e[0].tBodies[0].firstElementChild;if(i){var s="",n="",r={};do{if(i.dataset.id){s=i.dataset.group,n=i.dataset.line,r[s]||(r[s]={lines:{},separator:null,empty:!0}),r[s].lines[n]||(r[s].lines[n]={separator:null,empty:!0});var a=i.classList.contains("hidden");r[s].lines[n].empty=a&&r[s].lines[n].empty,r[s].empty=a&&r[s].empty}else i.classList.contains("planning-wh-newLine-tr")?r[s].lines[n].separator=i:i.classList.contains("planning-wh-newGroup-tr")&&(r[s].separator=i);i=i.nextElementSibling}while(i);t.forEach(r,function(e){e.separator&&e.separator.classList.toggle("hidden",e.empty);var i=null,s=null;t.forEach(e.lines,function(t){t.separator&&(t.separator.classList.toggle("hidden",t.empty),t.empty||(s=t.separator)),i=t}),s&&i.empty&&s.classList.add("hidden")})}}})});