define(["underscore","jquery","moment","app/i18n","app/user","app/core/View","app/fte/templates/masterEntry","app/fte/templates/absentUserRow","./fractionsUtil","i18n!app/nls/fte"],function(e,t,n,i,r,s,o,a,l){return s.extend({template:o,idPrefix:"masterEntryForm",events:{"change .fte-masterEntry-count":"updateCount","keyup .fte-masterEntry-count":"updateCount","change .fte-masterEntry-noPlan":"updatePlan","click .fte-masterEntry-noPlan-container":function(e){e.target.classList.contains("fte-masterEntry-noPlan-container")&&this.$(e.target).find(".fte-masterEntry-noPlan").click()},"click .fte-masterEntry-absence-remove":"removeAbsentUser"},initialize:function(){var e=this;this.listenToOnce(this.model,"sync",function(){var t=e.redirectToDetails.bind(e);e.pubsub.subscribe("fte.master.updated."+e.model.id,e.onRemoteEdit.bind(e)),e.pubsub.subscribe("fte.master.locked."+e.model.id,t),e.pubsub.subscribe("shiftChanged",t)})},afterRender:function(){return this.model.get("locked")?this.broker.publish("router.navigate",{url:this.model.genClientUrl(),replace:!0,trigger:!0}):(this.listenToOnce(this.model,"change",this.render),this.setUpUserFinder(),this.focusFirstEnabledInput(),void 0)},serialize:function(){return e.extend(this.model.serializeWithTotals(),{editable:!0,renderAbsentUserRow:a,round:l.round})},setUpUserFinder:function(){var e=this.$(".fte-masterEntry-absence-userFinder"),t=this.$(".fte-masterEntry-absence-entries"),n=this.$(".fte-masterEntry-absence-noEntries");t.children().length?n.hide():t.hide(),e.select2({allowClear:!0,minimumInputLength:3,ajax:{cache:!0,quietMillis:500,url:function(e){e=e.trim();var t=/^[0-9]+$/.test(e)?"personellId":"lastName";return e=encodeURIComponent("^"+e),"/users?select(personellId,lastName,firstName)&sort(lastName)&limit(20)&regex("+t+","+e+",i)"},results:function(e){return{results:(e.collection||[]).filter(function(e){var n='.fte-masterEntry-absence-remove[data-userId="'+e._id+'"]';return 0===t.find(n).length}).map(function(e){var t=e.lastName&&e.firstName?e.firstName+" "+e.lastName:"-",n=e.personellId?e.personellId:"-";return{id:e._id,text:t+" ("+n+")",name:t,personellId:n}})}}}});var i=this;e.on("change",function(t){e.select2("val","");var n={type:"addAbsentUser",socketId:i.socket.getId(),_id:i.model.id,user:t.added};i.socket.emit("fte.master.addAbsentUser",n,function(e){e?console.error(e):i.handleAddAbsentUserChange(n)})})},focusNextInput:function(e){var t=e.closest("td").next("td");if(t.length)return t.find("input").select();var n=e.closest("tr").next();return n.length?(this.focusNextEnabledInput(n),void 0):this.focusFirstEnabledInput()},focusFirstEnabledInput:function(){var e=this.el.querySelector(".fte-masterEntry-noPlan:not(:checked)");e&&this.$(e).closest("tr").find(".fte-masterEntry-count").first().select()},focusNextEnabledInput:function(e){return e.length?e.find(".fte-masterEntry-noPlan:checked").length?this.focusNextEnabledInput(e.next()):(e.find(".fte-masterEntry-count").first().select(),void 0):this.focusFirstEnabledInput()},toggleCountsInRow:function(e,t){var n=this.$(this.el.ownerDocument.activeElement).closest("tr"),i=this.$(".fte-masterEntry > tbody > :last-child"),r=e.closest("tr");return r.find(".fte-masterEntry-count").attr("disabled",e[0].checked),e[0].checked||t||r.find(".fte-masterEntry-count").first().select(),this.recountAll(r),t?r[0]===n[0]?r[0]===i[0]?this.focusFirstEnabledInput():this.focusNextEnabledInput(r):void 0:r[0]===i[0]?this.focusFirstEnabledInput():this.focusNextEnabledInput(r)},updatePlan:function(e){var t={type:"plan",socketId:this.socket.getId(),_id:this.model.id,taskId:e.target.getAttribute("data-taskId"),taskIndex:parseInt(e.target.getAttribute("data-task"),10),newValue:e.target.checked},n=this.$(e.target),i=this;this.toggleCountsInRow(n),this.socket.emit("fte.master.updatePlan",t,function(t){t&&(console.error(t),e.target.checked=!e.target.checked,i.toggleCountsInRow(n))})},updateCount:function(e){if(13===e.which)return this.focusNextInput(this.$(e.target));var t=l.parse(e.target.getAttribute("data-value"));console.log("newCount",e.target.value);var n=l.parse(e.target.value);if(t!==n){var i=e.target.getAttribute("data-task")+":"+e.target.getAttribute("data-function")+":"+e.target.getAttribute("data-company");this.timers[i]&&clearTimeout(this.timers[i]),this.timers[i]=setTimeout(this.doUpdateCount.bind(this),250,e.target,i,t,n)}},doUpdateCount:function(e,t,n,i){delete this.timers[t];var r=e.getAttribute("data-remote"),s={type:"count",socketId:this.socket.getId(),_id:this.model.id,newCount:i,taskIndex:parseInt(e.getAttribute("data-task"),10),functionIndex:parseInt(e.getAttribute("data-function"),10),companyIndex:parseInt(e.getAttribute("data-company"),10)};e.setAttribute("data-value",s.newCount),e.setAttribute("data-remote","false");var o=this;this.socket.emit("fte.master.updateCount",s,function(t){t&&(console.error(t),"true"!==e.getAttribute("data-remote")&&(e.value=n,e.setAttribute("data-value",n),e.setAttribute("data-remote",r),o.recount(e)))}),this.recount(e)},recount:function(e){var t,n,i,r=this.$(e).closest("tr"),s=e.getAttribute("data-functionId"),o=e.getAttribute("data-companyId");i=0,t='.fte-masterEntry-count[data-companyId="'+o+'"]',n='.fte-masterEntry-total-company-task[data-companyId="'+o+'"]',r.find(t).each(function(){i+=l.parse(this.value)}),r.find(n).text(l.round(i)),i=0,t=".fte-masterEntry-count[data-functionId="+s+"]"+"[data-companyId="+o+"]",n=".fte-masterEntry-total-prodFunction-company[data-functionId="+s+"]"+"[data-companyId="+o+"]",this.$(t).each(function(){this.disabled||(i+=l.parse(this.value))}),this.$(n).text(l.round(i)),i=0,t='.fte-masterEntry-total-prodFunction-company[data-companyId="'+o+'"]',n='.fte-masterEntry-total-company[data-companyId="'+o+'"]',this.$(t).each(function(){i+=l.parse(this.innerHTML)}),this.$(n).text(l.round(i)),i=0,t='.fte-masterEntry-total-prodFunction-company[data-functionId="'+s+'"]',n='.fte-masterEntry-total-prodFunction[data-functionId="'+s+'"]',this.$(t).each(function(){i+=l.parse(this.innerHTML)}),this.$(n).text(l.round(i)),i=0,t=".fte-masterEntry-total-company",n=".fte-masterEntry-total",this.$(t).each(function(){i+=l.parse(this.innerHTML)}),this.$(n).text(l.round(i))},recountAll:function(e){var t=this;e.find(".fte-masterEntry-count").each(function(){this.value="0",this.setAttribute("data-value","0"),t.recount(this)})},removeAbsentUser:function(e){var t=this.$(e.target).closest("button").attr("disabled",!0),n={type:"removeAbsentUser",socketId:this.socket.getId(),_id:this.model.id,userId:t.attr("data-userId")},i=this;this.socket.emit("fte.master.removeAbsentUser",n,function(e){e?(console.error(e),t.attr("disabled",!1)):i.handleRemoveAbsentUserChange(n)})},onRemoteEdit:function(e){if(e.socketId!==this.socket.getId())switch(e.type){case"plan":return this.handlePlanChange(e);case"count":return this.handleCountChange(e);case"addAbsentUser":return this.handleAddAbsentUserChange(e);case"removeAbsentUser":return this.handleRemoveAbsentUserChange(e)}},handleAddAbsentUserChange:function(e){var n=e.user;this.$('.fte-masterEntry-absence-remove[data-userId="'+n.id+'"]').length||(t(a({absentUser:n,editable:!0})).hide().appendTo(this.$(".fte-masterEntry-absence-entries").show()).fadeIn("fast"),this.$(".fte-masterEntry-absence-noEntries").hide())},handleRemoveAbsentUserChange:function(e){var n=this.$('.fte-masterEntry-absence-remove[data-userId="'+e.userId+'"]');if(n.length){var i=this;n.closest("tr").fadeOut(function(){t(this).remove();var e=i.$(".fte-masterEntry-absence-entries");e.length||(e.hide(),i.$(".fte-masterEntry-absence-noEntries").show())})}},handlePlanChange:function(e){var t='.fte-masterEntry-noPlan[data-task="'+e.taskIndex+'"]',n=this.$(t);n.length&&(n.prop("checked",e.newValue),this.toggleCountsInRow(n,!0))},handleCountChange:function(e){var t=".fte-masterEntry-count[data-task="+e.taskIndex+"]"+"[data-function="+e.functionIndex+"]"+"[data-company="+e.companyIndex+"]",n=this.$(t);n.length&&(n.val(e.newCount),n.attr({"data-value":e.newCount,"data-remote":"true"}),this.recount(n[0],e.taskIndex,e.companyIndex))},redirectToDetails:function(){this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!0})}})});