// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/user","app/viewport","app/core/View","app/core/util/onModelDeleted","app/hourlyPlans/templates/entry"],function(t,e,n,o,a,r,u){"use strict";return a.extend({template:u,events:{"change .hourlyPlan-count":"updateCount","keyup .hourlyPlan-count":"updateCount","change .hourlyPlan-noPlan":"updatePlan","mouseenter .hourlyPlan-flow":function(t){this.hovered=t.currentTarget},"mouseleave .hourlyPlan-flow":function(){this.hovered=null},"click .hourlyPlan-noPlan-container":function(t){t.target.classList.contains("hourlyPlan-noPlan-container")&&this.$(t.target).find(".hourlyPlan-noPlan").click()},"focus .hourlyPlan-count, .hourlyPlan-noPlan":function(t){this.focused=[t.target.parentNode,t.target.parentNode.parentNode.children[0],this.el.querySelector(".hourlyPlan-column-"+t.target.parentNode.dataset.column)],this.$(this.focused).addClass("is-focused")},"blur .hourlyPlan-count, .hourlyPlan-noPlan":function(){this.$(this.focused).removeClass("is-focused")},"paste .hourlyPlan-count":"pasteCounts"},remoteTopics:function(){var t={};return t["hourlyPlans.updated."+this.model.id]="onRemoteEdit",t["hourlyPlans.deleted"]="onModelDeleted",t},initialize:function(){this.hovered=null,this.focused=[],e("body").on("paste."+this.idPrefix,this.onBodyPaste.bind(this))},destroy:function(){e("body").off("."+this.idPrefix),this.focused=null},afterRender:function(){this.listenToOnce(this.model,"change",this.render),this.focusFirstEnabledInput()},serialize:function(){return t.extend(this.model.serialize(),{editable:!0})},focusNextInput:function(t){var e=t.closest("td").next("td");if(e.length)return e.find("input").select();var n=t.closest("tr").next();return n.length?void this.focusNextEnabledInput(n):this.focusFirstEnabledInput()},focusFirstEnabledInput:function(){var t=this.el.querySelector(".hourlyPlan-noPlan:not(:checked)");t&&this.$(t).closest("tr").find(".hourlyPlan-count").first().select()},focusNextEnabledInput:function(t){return t.length?t.find(".hourlyPlan-noPlan:checked").length?this.focusNextEnabledInput(t.next()):void t.find(".hourlyPlan-count").first().select():this.focusFirstEnabledInput()},toggleCountsInRow:function(t,e){var n=this.$(this.el.ownerDocument.activeElement).closest("tr"),o=this.$(".hourlyPlan > tbody > :last-child"),a=t.closest("tr"),r=a.find(".hourlyPlan-count").attr("disabled",t[0].checked);return t[0].checked?(r.val("0").attr("data-value","0"),e?a[0]===n[0]?a[0]===o[0]?this.focusFirstEnabledInput():this.focusNextEnabledInput(a):void 0:a[0]===o[0]?this.focusFirstEnabledInput():this.focusNextEnabledInput(a)):void(e||a.find(".hourlyPlan-count").first().select())},updatePlan:function(t){var e={type:"plan",socketId:this.socket.getId(),_id:this.model.id,flowIndex:parseInt(t.target.getAttribute("data-flow"),10),newValue:t.target.checked},n=this.$(t.target),o=this;this.toggleCountsInRow(n),this.socket.emit("hourlyPlans.updatePlan",e,function(e){e&&(t.target.checked=!t.target.checked,o.toggleCountsInRow(n),o.trigger("remoteError",e))})},pasteCounts:function(t,e){var n=t.originalEvent.clipboardData.getData("text/plain")||"",a=(" "+n+" ").match(/-?([0-9]+)[^0-9]/g)||[],r=a.map(function(t){return Math.max(parseInt(t,10)||0,0)});if(!(r.length<3)){var u=this,s=u.$(e||t.currentTarget),i={type:"counts",socketId:u.socket.getId(),_id:u.model.id,newValues:r,flowIndex:parseInt(s.attr("data-flow"),10)};return"hour"===s[0].name&&(i.hourIndex=parseInt(s.attr("data-hour"),10)),o.msg.saving(),u.socket.emit("hourlyPlans.updateCounts",i,function(t){t&&(o.msg.savingFailed(),u.trigger("remoteError",t))}),!1}},updateCount:function(t){if(13===t.which)return this.focusNextInput(this.$(t.target));var e=parseInt(t.target.getAttribute("data-value"),10)||0,n=parseInt(t.target.value,10)||0;if(e!==n){var o=t.target.getAttribute("data-flow")+":"+t.target.getAttribute("data-hour")+":"+t.target.getAttribute("name");this.timers[o]&&clearTimeout(this.timers[o]),this.timers[o]=setTimeout(this.doUpdateCount.bind(this),250,t.target,o,e,n)}},doUpdateCount:function(t,e,n,o){delete this.timers[e];var a=t.getAttribute("data-remote"),r={type:"count",socketId:this.socket.getId(),_id:this.model.id,newValue:o,flowIndex:parseInt(t.getAttribute("data-flow"),10)};"hour"===t.name&&(r.hourIndex=parseInt(t.getAttribute("data-hour"),10)),t.setAttribute("data-value",r.newValue),t.setAttribute("data-remote","false");var u=this;this.socket.emit("hourlyPlans.updateCount",r,function(e){e&&("true"!==t.getAttribute("data-remote")&&(t.value=n,t.setAttribute("data-value",n),t.setAttribute("data-remote",a)),u.trigger("remoteError",e))})},onRemoteEdit:function(t){switch(t.type){case"plan":return this.handlePlanChange(t);case"count":return this.handleCountChange(t);case"counts":return this.handleCountsChange(t)}},handlePlanChange:function(t){if(t.socketId!==this.socket.getId()){var e='.hourlyPlan-noPlan[data-flow="'+t.flowIndex+'"]',n=this.$(e);n.length&&(n.prop("checked",t.newValue),this.toggleCountsInRow(n,!0))}},handleCountChange:function(t){if(t.socketId!==this.socket.getId()){var e=".hourlyPlan-count[data-flow="+t.flowIndex+"]";e+="number"==typeof t.hourIndex?"[data-hour="+t.hourIndex+"]":"[name=level]";var n=this.$(e);n.length&&(n.val(t.newValue),n.attr({"data-value":t.newValue,"data-remote":"true"}))}},handleCountsChange:function(t){var e=".hourlyPlan-count[data-flow="+t.flowIndex+"]",n=this.$(e);n.length&&(t.newValues.forEach(function(t,e){n[e+1].value=t}),t.socketId===this.socket.getId()&&o.msg.saved())},onBodyPaste:function(t){return this.hovered?this.pasteCounts(t,this.hovered):void 0},onModelDeleted:function(t){r(this.broker,this.model,t)}})});