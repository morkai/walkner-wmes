// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/user","app/core/View","app/core/util/onModelDeleted","app/fte/templates/leaderEntry","app/fte/templates/focusInfoBar","../util/fractions"],function(t,e,n,a,o,i,s,r){"use strict";return a.extend({template:i,events:{"change .fte-leaderEntry-count":"updateCount","keyup .fte-leaderEntry-count":"updateCount","keydown .fte-leaderEntry-count":function(t){if(13===t.which)return this.focusNextInput(this.$(t.target)),!1},"focus .fte-leaderEntry-count":function(t){var e=t.target,n=e.parentNode.parentNode,a=this.theadEl,o=e.dataset,i=o.function+":"+o.company;this.focused=[e.parentNode,n.children[0]],this.withFunctions?this.focused.push(a.querySelector('.fte-leaderEntry-column-prodFunction[data-column="'+o.function+'"]'),a.querySelector('.fte-leaderEntry-total-prodFunction[data-column="'+o.function+'"]'),a.querySelector('.fte-leaderEntry-column-company[data-column="'+i+'"]'),a.querySelector('.fte-leaderEntry-total-prodFunction-company[data-column="'+i+'"]')):this.focused.push(a.querySelector('.fte-leaderEntry-column-company[data-column="'+o.company+'"]'),a.querySelector('.fte-leaderEntry-total-company[data-column="'+o.company+'"]')),void 0===e.dataset.division?this.withFunctions?(this.focused.push(n.querySelector('.fte-leaderEntry-total-company-task[data-company="'+o.company+'"]')),this.focused.push.apply(this.focused,a.querySelectorAll('.fte-leaderEntry-column-division[data-column^="'+i+'"]')),this.focused.push.apply(this.focused,a.querySelectorAll('.fte-leaderEntry-total-prodFunction-division[data-column^="'+i+'"]'))):this.focused.push.apply(this.focused,a.querySelectorAll('.fte-leaderEntry-column-division[data-column^="'+o.company+'"]')):this.withFunctions?this.focused.push(n.querySelector('.fte-leaderEntry-total-company-task[data-company="'+o.company+'"][data-division="'+o.division+'"]'),a.querySelector('.fte-leaderEntry-column-division[data-column="'+i+":"+o.division+'"]'),a.querySelector('.fte-leaderEntry-total-prodFunction-division[data-column="'+i+":"+o.division+'"]')):this.focused.push(a.querySelector('.fte-leaderEntry-column-division[data-column="'+o.company+":"+o.division+'"]')),this.$(this.focused).addClass("is-focused"),this.showFocusInfoBar(e)},"focus textarea.fte-leaderEntry-comment":function(t){var e=t.target,n=e.parentNode,a=n.parentNode.previousElementSibling.firstElementChild;this.focused=[n,a],this.$(this.focused).addClass("is-focused"),this.showFocusInfoBar(e)},"blur .fte-leaderEntry-count, textarea.fte-leaderEntry-comment":function(t){this.$(this.focused).removeClass("is-focused"),"0"===t.currentTarget.value&&(t.currentTarget.value=""),this.hideFocusInfoBar()},"click .fte-leaderEntry-toggleComment":function(t){var e=this.$(t.currentTarget),n=e.closest("tr"),a=n.next();a.toggleClass("hidden"),n.toggleClass("has-visible-comment").toggleClass("has-invisible-comment"),a.hasClass("hidden")?e.find(".fa").removeClass("fa-comment-o").addClass("fa-comment"):(e.find(".fa").removeClass("fa-comment").addClass("fa-comment-o"),a.find("textarea").focus())},"keyup textarea.fte-leaderEntry-comment":function(t){this.updateComment(t.target)},"change textarea.fte-leaderEntry-comment":function(t){this.doUpdateComment(t.target)},"click .fte-leaderEntry-count-container":function(t){"TD"===t.target.tagName&&t.target.querySelector("input").select()}},remoteTopics:function(){var t={};return t["fte.leader.updated."+this.model.id]="onRemoteEdit",t["fte.leader.deleted"]="onModelDeleted",t},initialize:function(){this.focused=null,this.theadEl=null,this.withFunctions=!1},destroy:function(){e("body").removeClass("is-with-fte-focusInfoBar"),this.focused=null,this.theadEl=null},beforeRender:function(){this.stopListening(this.model,"change",this.render)},afterRender:function(){this.listenToOnce(this.model,"change",this.render),this.theadEl=this.el.getElementsByTagName("thead")[0],this.withFunctions=this.model.isWithFunctions(),this.withDivisions=this.model.isWithDivisions(),this.$focusInfoBar=e('<div class="fte-focusInfoBar"></div>').hide().appendTo(this.$el),this.$(".fte-leaderEntry-count").first().select()},serialize:function(){return t.extend(this.model.serializeWithTotals(),{idPrefix:this.idPrefix,editable:!0,withFunctions:this.model.isWithFunctions(),round:r.round})},focusNextInput:function(t){var e=t.parent().next();if(e.hasClass("fte-leaderEntry-total-shortage"))return this.scrollIntoView(this.$("tbody .fte-leaderEntry-count").first().select()[0]);if(e.length&&!e.hasClass("fte-leaderEntry-actions"))return this.scrollIntoView(e.find(".fte-leaderEntry-count").select()[0]);for(var n=t.closest("tr").next();n.length;){if(!n.hasClass("is-parent")&&!n.hasClass("fte-leaderEntry-comment"))return this.scrollIntoView(n.find(".fte-leaderEntry-count").first().select()[0]);n=n.next()}this.scrollIntoView(this.$(".fte-leaderEntry-count").first().select()[0])},scrollIntoView:function(t){t.scrollIntoViewIfNeeded?t.scrollIntoViewIfNeeded():t.scrollIntoView(!0)},updateCount:function(t){var e=t.target.dataset,n=r.parse(e.value),a=r.parse(t.target.value);if(n!==a){var o=e.task+":"+e.function+":"+e.company+":"+e.division;this.timers[o]&&clearTimeout(this.timers[o]),this.timers[o]=setTimeout(this.doUpdateCount.bind(this),250,t.target,o,n,a)}},doUpdateCount:function(t,e,n,a){var o=this;delete o.timers[e];var i=t.dataset,s=i.remote,r={type:"count",socketId:o.socket.getId(),_id:o.model.id,kind:i.kind||"supply",newCount:a};if("demand"===r.kind)r.companyId=i.companyid;else{var d=+i.division;isNaN(d)||(r.divisionIndex=d),r.taskIndex=+i.task,r.functionIndex=+i.function,r.companyIndex=+i.company,r.companyIndexServer=+i.companyServer}i.value=r.newCount,i.remote="false",o.socket.emit("fte.leader.updateCount",r,function(e){e&&("true"!==i.remote&&(t.value=n,i.value=n,i.remote=s,o.recount(t,r.taskIndex,r.functionIndex,r.companyIndex)),o.trigger("remoteError",e))}),o.recount(t,r.taskIndex,r.functionIndex,r.companyIndex)},recount:function(t,e,n,a){if(this.withFunctions)return this.recountWithFunctions(t,e,n,a);var o=0,i=0,s=0,d=this.$(t).closest("tr");d.find(".fte-leaderEntry-count").each(function(){o+=r.parse(this.value)}),d.find(".fte-leaderEntry-total-task").text(r.round(o)),this.$(".fte-leaderEntry-count[data-company="+a+"]").each(function(){i+=r.parse(this.value)}),this.$(".fte-leaderEntry-total-company[data-column="+a+"]").text(r.round(i)),this.$(".fte-leaderEntry-total-company").each(function(){s+=r.parse(this.innerHTML)}),this.$(".fte-leaderEntry-total-overall").text(r.round(s))},recountWithFunctions:function(t){"demand"===t.dataset.kind?this.recountDemand():this.recountSupply(t)},recountDemand:function(){var t,e,n,a=this.$("thead");n=0,t='.fte-leaderEntry-count[data-kind="demand"]',e=".fte-leaderEntry-total-demand",a.find(t).each(function(){n+=r.parse(this.value)}),a.find(e).text(r.round(n)),this.recountShortage()},recountShortage:function(){var t=this.$("thead"),e={total:r.parse(t.find(".fte-leaderEntry-total-demand").text())},n={total:r.parse(t.find(".fte-leaderEntry-total").text())};t.find(".fte-leaderEntry-total-shortage").text(e.total?r.round(e.total-n.total):0),t.find('.fte-leaderEntry-count[data-kind="demand"]').each(function(){e[this.dataset.companyid]=r.parse(this.value)}),t.find(".fte-leaderEntry-total-company").each(function(){var a=this.dataset.companyid;n[a]=r.parse(this.textContent),t.find('.fte-leaderEntry-total-shortage-company[data-companyid="'+a+'"]').text(e.total?r.round(e[a]-n[a]):0)}),this.$(".fte-leaderEntry-total-company-task[data-absence]").each(function(){var t=this.dataset.companyid,e=r.parse(this.textContent);n.total+=e,n[t]+=e}),t.find(".fte-leaderEntry-shortage-diff-total").text(e.total?r.round(e.total-n.total):0),t.find(".fte-leaderEntry-shortage-diff").each(function(){var t=this.dataset.companyid;this.textContent=e.total?r.round(e[t]-n[t]):0})},recountSupply:function(t){var e=this.$(t).closest("tr"),n=e.hasClass("is-child"),a=null,o=[],i=+t.dataset.function,s=+t.dataset.company,r=+t.dataset.division;if(isNaN(r)&&(r=-1),n){var d=e.attr("data-parent");a=this.$('.is-parent[data-id="'+d+'"]'),o=this.$('.is-child[data-parent="'+d+'"]')}var c=this.recalcTaskCompanyTotals(s,r,e);n&&this.recalcParentTotals(c,i,a,o),this.withDivisions&&this.recalcDivisionTotals(i,s),this.recalcCompanyTotals(i,s),this.recalcFunctionTotals(i),this.recountShortage()},recalcTaskCompanyTotals:function(t,e,n){var a=0,o='[data-company="'+t+'"]';return-1!==e&&(o+='[data-division="'+e+'"]'),n.find(".fte-leaderEntry-count"+o).each(function(){a+=r.parse(this.value)}),n.find(".fte-leaderEntry-total-company-task"+o).text(r.round(a)),o},recalcParentTotals:function(t,e,n,a){t=t.replace(/\[data-division="[0-9]+"\]/,"");var o=t+'[data-function="'+e+'"]',i=".fte-leaderEntry-count"+o+", .fte-leaderEntry-parent-count"+o,s=n.find(".fte-leaderEntry-parent-count"+o),d=s.length,c=[];if(s.each(function(){c.push(0)}),a.find(i).each(function(){if(void 0===this.dataset.absence){var t=r.parse("TD"===this.tagName?this.textContent:this.value);if(void 0===this.dataset.division){t/=d;for(var e=0;e<d;++e)c[e]+=t}else c[this.dataset.division]+=t}}),c.forEach(function(t,e){s[e].textContent=r.round(t),c[e]=0}),n.find(".fte-leaderEntry-parent-count"+t).each(function(){var t=r.parse(this.textContent);if(void 0===this.dataset.division){t/=d;for(var e=0;e<d;++e)c[e]+=t}else c[this.dataset.division]+=t}),s=n.find(".fte-leaderEntry-total-company-task"+t),c.forEach(function(t,e){s[e].textContent=r.round(t)}),"0"!==n.attr("data-level")){var l=n.attr("data-parent");n=this.$('.is-parent[data-id="'+l+'"]'),a=this.$('.is-child[data-parent="'+l+'"]'),this.recalcParentTotals(t,e,n,a)}},recalcDivisionTotals:function(t,n){var a=this,o=this.model.get("fteDiv"),i='[data-function="'+t+'"][data-company="'+n+'"]',s={};o.forEach(function(t){s[t]=0}),this.$('.fte-leaderEntry-parent-count[data-level="0"]'+i).each(function(){var t=r.parse(this.textContent);void 0===this.dataset.division?(t/=o.length,o.forEach(function(e){s[e]+=t})):s[o[this.dataset.division]]+=t}),this.$(".is-single .fte-leaderEntry-count"+i).each(function(){var t=r.parse(this.value);void 0===this.dataset.division?(t/=o.length,o.forEach(function(e){s[e]+=t})):s[o[this.dataset.division]]+=t}),o.forEach(function(e,o){var i=t+":"+n+":"+o,d='.fte-leaderEntry-total-prodFunction-division[data-column="'+i+'"]';a.$(d).text(r.round(s[e]))});var d={};e(this.theadEl).find(".fte-leaderEntry-total-prodFunction-division").each(function(){var t=this.dataset.company+":"+this.dataset.division;void 0===d[t]&&(d[t]=0),d[t]+=r.parse(this.textContent)}),Object.keys(d).forEach(function(t){a.$('.fte-leaderEntry-total-division[data-column="'+t+'"]').text(r.round(d[t]))})},recalcCompanyTotals:function(t,e){var n,a=0,o=t+":"+e,i=this.$(this.theadEl);this.withDivisions?(n='[data-column^="'+o+'"]',i.find(".fte-leaderEntry-total-prodFunction-division"+n).each(function(){a+=r.parse(this.textContent)})):(n='[data-function="'+t+'"][data-company="'+e+'"]',this.$(".fte-leaderEntry-count"+n).each(function(){a+=r.parse(this.value)})),this.$('.fte-leaderEntry-total-prodFunction-company[data-column="'+o+'"]').text(r.round(a));var s=0;i.find('.fte-leaderEntry-total-prodFunction-company[data-company="'+e+'"]').each(function(){s+=r.parse(this.textContent)}),this.$('.fte-leaderEntry-total-company[data-company="'+e+'"]').text(r.round(s))},recalcFunctionTotals:function(t){var e=0,n=this.$(this.theadEl);n.find('.fte-leaderEntry-total-prodFunction-company[data-function="'+t+'"]').each(function(){e+=r.parse(this.textContent)}),this.$('.fte-leaderEntry-total-prodFunction[data-column="'+t+'"]').text(r.round(e));var a=0;n.find(".fte-leaderEntry-total-prodFunction").each(function(){a+=r.parse(this.textContent)}),this.$(".fte-leaderEntry-total").text(r.round(a))},onRemoteEdit:function(t){if(this.model.handleUpdateMessage(t,!0),t.socketId!==this.socket.getId())switch(t.type){case"count":return this.handleCountChange(t.action);case"comment":return this.handleCommentChange(t.action);case"edit":return this.render()}},handleCountChange:function(t){var e=".fte-leaderEntry-count[data-company="+t.companyIndex+"][data-task="+t.taskIndex+"]";this.withFunctions&&(e+='[data-function="'+t.functionIndex+'"]'),"number"==typeof t.divisionIndex&&(e+='[data-division="'+t.divisionIndex+'"]');var n=this.$(e);0!==n.length&&(n.val(t.newCount),n.attr({"data-value":t.newCount,"data-remote":"true"}),this.recount(n[0],t.taskIndex,t.functionIndex,t.companyIndex))},handleCommentChange:function(t){var e=this.$('textarea.fte-leaderEntry-comment[data-task="'+t.taskIndex+'"]');if(e.length){e.val(t.comment);var n=e.closest("tr"),a=n.prev(),o=a.find(".fte-leaderEntry-toggleComment > .fa");e.comment?(n.addClass("hidden"),a.removeClass("has-visible-comment").addClass("has-invisible-comment"),o.removeClass("fa-comment-o").addClass("fa-comment")):(n.removeClass("hidden"),a.removeClass("has-invisible-comment").addClass("has-visible-comment"),o.removeClass("fa-comment").addClass("fa-comment-o"))}},onModelDeleted:function(t){o(this.broker,this.model,t)},showFocusInfoBar:function(t){if(null!==this.timers.hideFocusInfoBar&&(clearTimeout(this.timers.hideFocusInfoBar),this.timers.hideFocusInfoBar=null),"demand"===t.dataset.kind)return this.hideFocusInfoBar();var n=t.parentNode.parentNode;t.classList.contains("fte-leaderEntry-comment")&&(n=n.previousElementSibling);var a=n.children[0].textContent;if(n.classList.contains("is-child"))for(var o=n,i=+o.dataset.level;o&&i;){o=o.previousElementSibling.previousElementSibling;var r=+o.dataset.level;r<i&&(i=r,a=o.children[0].textContent+" \\ "+a)}var d=t.dataset.function,c=t.dataset.company,l=t.dataset.division,u=d+":"+c,f=void 0===d?null:'.fte-leaderEntry-column-prodFunction[data-column="'+d+'"]',h=void 0===c?null:'.fte-leaderEntry-column-company[data-column="'+u+'"]',m=void 0===l?null:'.fte-leaderEntry-column-division[data-column="'+u+":"+l+'"]';this.$focusInfoBar.html(s({prodTask:a,prodFunction:f?this.theadEl.querySelector(f).textContent:null,company:h?this.theadEl.querySelector(h).textContent:null,division:m?this.theadEl.querySelector(m).textContent:null})),e("body").addClass("is-with-fte-focusInfoBar"),this.$focusInfoBar.fadeIn("fast")},hideFocusInfoBar:function(){var t=this;this.timers.hideFocusInfoBar=setTimeout(function(){t.timers&&(t.timers.hideFocusInfoBar=null,t.$focusInfoBar.fadeOut("fast",function(){e("body").removeClass("is-with-fte-focusInfoBar")}))},1)},updateComment:function(t){var e=parseInt(t.dataset.task,10),n="updateComment"+e;this.timers[n]&&clearTimeout(this.timers[n]),this.timers[n]=setTimeout(this.doUpdateComment.bind(this),5e3,t)},doUpdateComment:function(t){var e=parseInt(t.dataset.task,10),n="updateComment"+e;this.timers[n]&&(clearTimeout(this.timers[n]),delete this.timers[n]),this.socket.emit("fte.leader.updateComment",{type:"comment",socketId:this.socket.getId(),_id:this.model.id,taskIndex:e,comment:t.value})}})});