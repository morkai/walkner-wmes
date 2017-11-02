// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/core/View","app/core/util/onModelDeleted","app/users/util/setUpUserSelect2","app/fte/templates/masterEntry","app/fte/templates/absentUserRow","../util/fractions","jquery.stickytableheaders"],function(t,e,n,a,s,r,o,i){"use strict";return n.extend({template:r,events:{"change .fte-masterEntry-count":"updateCount","keyup .fte-masterEntry-count":"updateCount","change .fte-masterEntry-noPlan":function(t){this.updatePlan(t.currentTarget)},"click .fte-masterEntry-noPlan-container":function(t){t.target.classList.contains("fte-masterEntry-noPlan-container")&&this.$(t.target).find(".fte-masterEntry-noPlan").click()},"click .fte-masterEntry-absence-remove":"removeAbsentUser","focus .fte-masterEntry-count, .fte-masterEntry-noPlan":function(t){var e=t.target,n=e.parentNode,a=n.parentNode,s=e.dataset,r=this.cachedColumns;if(this.focused=[e.parentNode,a.children[0]],e.classList.contains("fte-masterEntry-noPlan"))this.focused.push(this.el.querySelector(".fte-masterEntry-column-noPlan"));else if(n.classList.contains("fte-masterEntry-demand"))this.focused.push(this.el.querySelector('.fte-masterEntry-total-demand-company[data-companyid="'+s.companyid+'"]'),a.querySelector(".fte-masterEntry-total-demand-task"));else{var o=s.function+":"+s.company;this.focused.push(r.prodFunctions[s.function],r.prodFunctionTotals[s.function],r.companies[o],r.companyTotals[o],a.querySelector('.fte-masterEntry-total-company-task[data-companyindex="'+s.company+'"]'))}this.$(this.focused).addClass("is-focused")},"blur .fte-masterEntry-count, .fte-masterEntry-noPlan":function(t){this.$(this.focused).removeClass("is-focused"),"0"===t.currentTarget.value&&(t.currentTarget.value="")},"click .fte-count-container":function(t){t.target.classList.contains("fte-count-container")&&this.$(t.currentTarget).find("input").select()},'click a[data-action="showHidden"]':function(t){var e=this.$('.fte-masterEntry-noPlan[data-task="'+t.currentTarget.dataset.task+'"]')[0];return e.checked=!1,this.updatePlan(e),this.$(t.currentTarget).parent().remove(),!1}},remoteTopics:function(){var t={};return t["fte.master.updated."+this.model.id]="onRemoteEdit",t["fte.master.deleted"]="onModelDeleted",t},initialize:function(){this.focused=null,this.cachedColumns={prodFunctions:null,prodFunctionTotals:null,companies:null,companyTotals:null}},destroy:function(){this.$(".fte-masterEntry").stickyTableHeaders("destroy"),this.focused=null,this.cachedColumns=null},beforeRender:function(){this.stopListening(this.model,"change",this.render)},afterRender:function(){this.listenToOnce(this.model,"change",this.render),this.setUpUserFinder(),this.setUpStickyHeaders(),this.cacheColumns(),this.updateNoPlanDropdown(),this.focusFirstEnabledInput()},serialize:function(){return t.extend(this.model.serializeWithTotals(),{idPrefix:this.idPrefix,editable:!0,changing:!1,renderAbsentUserRow:o,round:i.round})},setUpUserFinder:function(){var t=this,e=this.$(".fte-masterEntry-absence-entries"),n=this.$(".fte-masterEntry-absence-noEntries"),a=s(this.$(".fte-masterEntry-absence-userFinder"),{userFilter:function(t){var n='.fte-masterEntry-absence-remove[data-userId="'+t._id+'"]';return 0===e.find(n).length}});e.children().length?n.hide():e.hide(),a.on("change",function(e){a.select2("val","");var n={type:"addAbsentUser",socketId:t.socket.getId(),_id:t.model.id,user:e.added};t.socket.emit("fte.master.addAbsentUser",n,function(e){e?t.trigger("remoteError",e):t.handleAddAbsentUserChange(n)})})},setUpStickyHeaders:function(){this.$(".fte-masterEntry").stickyTableHeaders({fixedOffset:e(".navbar-fixed-top")})},cacheColumns:function(){function t(t,a){n.find(".fte-masterEntry-"+t).each(function(){e[a][this.dataset.column]=this})}var e={prodFunctions:{},prodFunctionTotals:{},companies:{},companyTotals:{}},n=this.$(".tableFloatingHeaderOriginal");t("column-prodFunction","prodFunctions"),t("total-prodFunction","prodFunctionTotals"),t("column-company","companies"),t("total-prodFunction-company","companyTotals"),this.cachedColumns=e},focusNextInput:function(t){var e=t.parent().next();if(e.length)return e.hasClass("fte-masterEntry-total-shortage")?this.focusFirstEnabledInput(!0):e.find("input").select();var n=t.closest("tr").next();return n.length?void this.focusNextEnabledInput(n):this.focusFirstEnabledInput()},focusFirstEnabledInput:function(t){var e=this.$(".fte-masterEntry-total-demand-company").first();if(!t&&e.length)return void e.find("input").select();var n=this.el.querySelector(".fte-masterEntry-noPlan:not(:checked)");n&&this.$(n).closest("tr").find(".fte-masterEntry-count").first().select()},focusNextEnabledInput:function(t){return t.length?t.find(".fte-masterEntry-noPlan:checked").length?this.focusNextEnabledInput(t.next()):void t.find(".fte-masterEntry-count").first().select():this.focusFirstEnabledInput()},toggleCountsInRow:function(t,e){var n=this.$(this.el.ownerDocument.activeElement).closest("tr"),a=this.$(".fte-masterEntry > tbody > :last-child"),s=t.closest("tr");return s.find(".fte-masterEntry-count").attr("disabled",t[0].checked),t[0].checked||e||s.find(".fte-masterEntry-count").first().select(),this.recountAll(s),s[t[0].checked?"fadeOut":"fadeIn"](this.updateNoPlanDropdown.bind(this)),e?s[0]===n[0]?s[0]===a[0]?this.focusFirstEnabledInput():this.focusNextEnabledInput(s):void 0:s[0]===a[0]?this.focusFirstEnabledInput():this.focusNextEnabledInput(s)},updateNoPlanDropdown:function(){var t=this.$(".fte-masterEntry-noPlan-dropdown"),e="";this.$("tbody > tr").each(function(){"none"===this.style.display&&(e+='<li><a href="#" data-action="showHidden" data-task="'+this.dataset.taskIndex+'">'+this.children[0].textContent+"</a></li>")}),t.find(".dropdown-menu").html(e),e.length?t.fadeIn():t.fadeOut()},updatePlan:function(t){var e=this,n={type:"plan",socketId:e.socket.getId(),_id:e.model.id,taskId:t.dataset.taskid,taskIndex:+t.dataset.task,newValue:t.checked},a=e.$(t);this.toggleCountsInRow(a),this.socket.emit("fte.master.updatePlan",n,function(n){n&&(t.checked=!t.checked,e.toggleCountsInRow(a),e.trigger("remoteError",n))})},updateCount:function(t){if(13===t.which)return this.focusNextInput(this.$(t.target));var e=i.parse(t.target.getAttribute("data-value")),n=i.parse(t.target.value);if(e!==n){var a=t.target.dataset.task+":"+t.target.dataset.function+":"+t.target.dataset.company;this.timers[a]&&clearTimeout(this.timers[a]),this.timers[a]=setTimeout(this.doUpdateCount.bind(this),250,t.target,a,e,n)}},doUpdateCount:function(t,e,n,a){var s=this;delete s.timers[e];var r=t.dataset.remote,o={type:"count",socketId:s.socket.getId(),_id:s.model.id,kind:t.dataset.kind,newCount:a};"demand"===o.kind?o.companyId=t.dataset.companyid:(o.taskIndex=+t.dataset.task,o.functionIndex=+t.dataset.function,o.companyIndex=+t.dataset.company),t.dataset.value=o.newCount,t.dataset.remote="false",s.socket.emit("fte.master.updateCount",o,function(e){e&&("true"!==t.dataset.remote&&(t.value=n,t.dataset.value=n,t.dataset.remote=r,s.recount(t)),s.trigger("remoteError",e))}),s.recount(t)},recount:function(t){t.parentNode.classList.contains("fte-masterEntry-demand")?this.recountDemand():this.recountSupply(t)},recountDemand:function(){var t,e,n,a=this.$(".tableFloatingHeaderOriginal");n=0,t='.fte-masterEntry-count[data-kind="demand"]',e=".fte-masterEntry-total-demand",a.find(t).each(function(){n+=i.parse(this.value)}),a.find(e).text(i.round(n)),this.recountShortage()},recountSupply:function(t){var e,n,a,s=this.$(t).closest("tr"),r=this.$(".tableFloatingHeaderOriginal"),o=t.dataset.functionid,d=t.dataset.companyid,c=".fte-masterEntry-supply";a=0,e='.fte-masterEntry-count[data-companyId="'+d+'"]',n='.fte-masterEntry-total-company-task[data-companyId="'+d+'"]',s.find(e).each(function(){a+=i.parse(this.value)}),s.find(n).text(i.round(a)),a=0,e=c+" > .fte-masterEntry-count[data-functionId="+o+"][data-companyId="+d+"]",n=c+".fte-masterEntry-total-prodFunction-company[data-functionId="+o+"][data-companyId="+d+"]",this.$(e).each(function(){this.disabled||(a+=i.parse(this.value))}),r.find(n).text(i.round(a)),a=0,e=c+'.fte-masterEntry-total-prodFunction-company[data-companyId="'+d+'"]',n=c+'.fte-masterEntry-total-company[data-companyId="'+d+'"]',r.find(e).each(function(){a+=i.parse(this.innerHTML)}),r.find(n).text(i.round(a)),a=0,e=c+'.fte-masterEntry-total-prodFunction-company[data-functionId="'+o+'"]',n=c+'.fte-masterEntry-total-prodFunction[data-functionId="'+o+'"]',r.find(e).each(function(){a+=i.parse(this.innerHTML)}),r.find(n).text(i.round(a)),a=0,e=c+".fte-masterEntry-total-company",n=c+".fte-masterEntry-total",r.find(e).each(function(){a+=i.parse(this.innerHTML)}),r.find(n).text(i.round(a)),this.recountShortage()},recountShortage:function(){var t=this.$(".tableFloatingHeaderOriginal"),e={total:i.parse(t.find(".fte-masterEntry-total-demand").text())},n={total:i.parse(t.find(".fte-masterEntry-total").text())};t.find(".fte-masterEntry-total-shortage").text(e.total?i.round(e.total-n.total):0),t.find('.fte-masterEntry-count[data-kind="demand"]').each(function(){e[this.dataset.companyid]=i.parse(this.value)}),t.find(".fte-masterEntry-total-company").each(function(){var a=this.dataset.companyid;n[a]=i.parse(this.textContent),t.find('.fte-masterEntry-total-shortage-company[data-companyid="'+a+'"]').text(e.total?i.round(e[a]-n[a]):0)}),this.$(".fte-masterEntry-shortage.fte-masterEntry-total-company-task").each(function(){var t=this.dataset.companyid,e=i.parse(this.textContent);n.total+=e,n[t]+=e}),t.find(".fte-masterEntry-shortage-diff-total").text(e.total?i.round(e.total-n.total):0),t.find(".fte-masterEntry-shortage-diff").each(function(){var t=this.dataset.companyid;this.textContent=e.total?i.round(e[t]-n[t]):0})},recountAll:function(t){var e=this;t.find(".fte-masterEntry-count").each(function(){this.value="",this.setAttribute("data-value","0"),e.recount(this)})},removeAbsentUser:function(t){var e=this.$(t.target).closest("button").attr("disabled",!0),n={type:"removeAbsentUser",socketId:this.socket.getId(),_id:this.model.id,userId:e.attr("data-userId")},a=this;this.socket.emit("fte.master.removeAbsentUser",n,function(t){t?(e.attr("disabled",!1),a.trigger("remoteError",t)):a.handleRemoveAbsentUserChange(n)})},onRemoteEdit:function(t){if(this.model.handleUpdateMessage(t,!0),t.socketId!==this.socket.getId())switch(t.type){case"plan":return this.handlePlanChange(t.action);case"count":return this.handleCountChange(t.action);case"addAbsentUser":return this.handleAddAbsentUserChange(t);case"removeAbsentUser":return this.handleRemoveAbsentUserChange(t);case"edit":return this.render()}},handleAddAbsentUserChange:function(t){var n=t.user;this.$('.fte-masterEntry-absence-remove[data-userId="'+n.id+'"]').length||(e(o({absentUser:n,editable:!0})).hide().appendTo(this.$(".fte-masterEntry-absence-entries").show()).fadeIn("fast"),this.$(".fte-masterEntry-absence-noEntries").hide())},handleRemoveAbsentUserChange:function(t){var n=this.$('.fte-masterEntry-absence-remove[data-userId="'+t.userId+'"]');if(n.length){var a=this;n.closest("tr").fadeOut(function(){e(this).remove();var t=a.$(".fte-masterEntry-absence-entries");t.length||(t.hide(),a.$(".fte-masterEntry-absence-noEntries").show())})}},handlePlanChange:function(t){var e='.fte-masterEntry-noPlan[data-task="'+t.taskIndex+'"]',n=this.$(e);n.length&&(n.prop("checked",t.newValue),this.toggleCountsInRow(n,!0))},handleCountChange:function(t){var e;e="demand"===t.kind?'.fte-masterEntry-demand > .fte-masterEntry-count[data-companyid="'+t.companyId+'"]':'.fte-masterEntry-supply > .fte-masterEntry-count[data-task="'+t.taskIndex+'"][data-function="'+t.functionIndex+'"][data-company="'+t.companyIndex+'"]';var n=this.$(e);n.length&&(n.val(t.newCount||""),n.attr({"data-value":t.newCount,"data-remote":"true"}),this.recount(n[0]))},onModelDeleted:function(t){a(this.broker,this.model,t)}})});