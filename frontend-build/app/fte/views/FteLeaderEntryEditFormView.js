// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","jquery","app/user","app/core/View","app/core/util/onModelDeleted","app/fte/templates/leaderEntry","app/fte/templates/focusInfoBar","../util/fractions","jquery.stickytableheaders"],function(t,e,n,a,i,o,s,r){"use strict";return a.extend({template:o,events:{"change .fte-leaderEntry-count":"updateCount","keyup .fte-leaderEntry-count":"updateCount","keydown .fte-leaderEntry-count":function(t){return 13===t.which?(this.focusNextInput(this.$(t.target)),!1):void 0},"focus .fte-leaderEntry-count":function(t){var e=t.target,n=e.parentNode.parentNode,a=this.theadEl,i=e.dataset,o=i["function"]+":"+i.company;this.focused=[e.parentNode,n.children[0]],this.withFunctions?this.focused.push(a.querySelector('.fte-leaderEntry-column-prodFunction[data-column="'+i["function"]+'"]'),a.querySelector('.fte-leaderEntry-total-prodFunction[data-column="'+i["function"]+'"]'),a.querySelector('.fte-leaderEntry-column-company[data-column="'+o+'"]'),a.querySelector('.fte-leaderEntry-total-prodFunction-company[data-column="'+o+'"]')):this.focused.push(a.querySelector('.fte-leaderEntry-column-company[data-column="'+i.company+'"]'),a.querySelector('.fte-leaderEntry-total-company[data-column="'+i.company+'"]')),void 0===e.dataset.division?this.withFunctions?(this.focused.push(n.querySelector('.fte-leaderEntry-total-company-task[data-company="'+i.company+'"]')),this.focused.push.apply(this.focused,a.querySelectorAll('.fte-leaderEntry-column-division[data-column^="'+o+'"]')),this.focused.push.apply(this.focused,a.querySelectorAll('.fte-leaderEntry-total-prodFunction-division[data-column^="'+o+'"]'))):this.focused.push.apply(this.focused,a.querySelectorAll('.fte-leaderEntry-column-division[data-column^="'+i.company+'"]')):this.withFunctions?this.focused.push(n.querySelector('.fte-leaderEntry-total-company-task[data-company="'+i.company+'"][data-division="'+i.division+'"]'),a.querySelector('.fte-leaderEntry-column-division[data-column="'+o+":"+i.division+'"]'),a.querySelector('.fte-leaderEntry-total-prodFunction-division[data-column="'+o+":"+i.division+'"]')):this.focused.push(a.querySelector('.fte-leaderEntry-column-division[data-column="'+i.company+":"+i.division+'"]')),this.$(this.focused).addClass("is-focused"),this.showFocusInfoBar(e)},"focus textarea.fte-leaderEntry-comment":function(t){var e=t.target,n=e.parentNode,a=n.parentNode.previousElementSibling.firstElementChild;this.focused=[n,a],this.$(this.focused).addClass("is-focused"),this.showFocusInfoBar(e)},"blur .fte-leaderEntry-count, textarea.fte-leaderEntry-comment":function(){this.$(this.focused).removeClass("is-focused"),this.hideFocusInfoBar()},"click .fte-leaderEntry-toggleComment":function(t){var e=this.$(t.currentTarget),n=e.closest("tr"),a=n.next();a.toggleClass("hidden"),n.toggleClass("has-visible-comment").toggleClass("has-invisible-comment"),a.hasClass("hidden")?e.find(".fa").removeClass("fa-comment-o").addClass("fa-comment"):(e.find(".fa").removeClass("fa-comment").addClass("fa-comment-o"),a.find("textarea").focus())},"keyup textarea.fte-leaderEntry-comment":function(t){this.updateComment(t.target)},"change textarea.fte-leaderEntry-comment":function(t){this.doUpdateComment(t.target)},"click .fte-leaderEntry-count-container":function(t){"TD"===t.target.tagName&&t.target.querySelector("input").select()}},remoteTopics:function(){var t={};return t["fte.leader.updated."+this.model.id]="onRemoteEdit",t["fte.leader.deleted"]="onModelDeleted",t},initialize:function(){this.focused=null,this.theadEl=null,this.withFunctions=!1},destroy:function(){this.$(".fte-leaderEntry").stickyTableHeaders("destroy"),e("body").removeClass("is-with-fte-focusInfoBar"),this.focused=null,this.theadEl=null},beforeRender:function(){this.stopListening(this.model,"change",this.render)},afterRender:function(){this.listenToOnce(this.model,"change",this.render),this.theadEl=this.el.getElementsByTagName("thead")[0],this.withFunctions=this.model.isWithFunctions(),this.withDivisions=this.model.isWithDivisions(),this.$focusInfoBar=e('<div class="fte-focusInfoBar"></div>').hide().appendTo(this.$el),this.$(".fte-leaderEntry-count").first().select()},serialize:function(){return t.extend(this.model.serializeWithTotals(),{editable:!0,round:r.round})},focusNextInput:function(t){var e=t.closest("td").next("td");if(e.length&&!e.hasClass("fte-leaderEntry-actions"))return this.scrollIntoView(e.find("input").select()[0]);for(var n=t.closest("tr").next();n.length;){if(!n.hasClass("is-parent")&&!n.hasClass("fte-leaderEntry-comment"))return this.scrollIntoView(n.find(".fte-leaderEntry-count").first().select()[0]);n=n.next()}var a=this.el.querySelector(".fte-leaderEntry-count");a.select(),this.scrollIntoView(a)},scrollIntoView:function(t){t.scrollIntoViewIfNeeded?t.scrollIntoViewIfNeeded():t.scrollIntoView(!0)},updateCount:function(t){var e=t.target.dataset,n=r.parse(e.value)||0,a=r.parse(t.target.value)||0;if(n!==a){var i=e.task+":"+e["function"]+":"+e.company+":"+e.division;this.timers[i]&&clearTimeout(this.timers[i]),this.timers[i]=setTimeout(this.doUpdateCount.bind(this),250,t.target,i,n,a)}},doUpdateCount:function(t,e,n,a){delete this.timers[e];var i=t.dataset,o=i.remote,s={socketId:this.socket.getId(),_id:this.model.id,newCount:a,taskIndex:parseInt(i.task,10),functionIndex:parseInt(i["function"],10)||0,companyIndex:parseInt(i.company,10),companyIndexServer:parseInt(i.companyServer,10)},r=parseInt(i.division,10);isNaN(r)||(s.divisionIndex=r),i.value=s.newCount,i.remote="false";var d=this;this.socket.emit("fte.leader.updateCount",s,function(e){e&&("true"!==i.remote&&(t.value=n,i.value=n,i.remote=o,d.recount(t,s.taskIndex,s.functionIndex,s.companyIndex),s.newCount=n,d.model.handleUpdateMessage(s,!0)),d.trigger("remoteError",e))}),this.recount(t,s.taskIndex,s.functionIndex,s.companyIndex),this.model.handleUpdateMessage(s,!0)},recount:function(t,e,n,a){if(this.withFunctions)return this.recountWithFunctions(t,e,n,a);var i=0,o=0,s=0,d=this.$(t).closest("tr");d.find(".fte-leaderEntry-count").each(function(){i+=r.parse(this.value)}),d.find(".fte-leaderEntry-total-task").text(r.round(i)),this.$(".fte-leaderEntry-count[data-company="+a+"]").each(function(){o+=r.parse(this.value)}),this.$(".fte-leaderEntry-total-company[data-column="+a+"]").text(r.round(o)),this.$(".fte-leaderEntry-total-company").each(function(){s+=r.parse(this.innerHTML)}),this.$(".fte-leaderEntry-total-overall").text(r.round(s))},recountWithFunctions:function(t,e,n,a){var i=this.$(t).closest("tr"),o=i.hasClass("is-child"),s=null,r=[],d=parseInt(t.dataset.division,10);if(isNaN(d)&&(d=-1),o){var c=i.attr("data-parent");s=this.$('.is-parent[data-id="'+c+'"]'),r=this.$('.is-child[data-parent="'+c+'"]')}var l=this.recalcTaskCompanyTotals(a,d,i);o&&this.recalcParentTotals(l,n,s,r),this.withDivisions&&this.recalcDivisionTotals(n,a),this.recalcCompanyTotals(n,a),this.recalcFunctionTotals(n)},recalcTaskCompanyTotals:function(t,e,n){var a=0,i='[data-company="'+t+'"]';return-1!==e&&(i+='[data-division="'+e+'"]'),n.find(".fte-leaderEntry-count"+i).each(function(){a+=r.parse(this.value)}),n.find(".fte-leaderEntry-total-company-task"+i).text(r.round(a)),i},recalcParentTotals:function(t,e,n,a){t=t.replace(/\[data-division="[0-9]+"\]/,"");var i=t+'[data-function="'+e+'"]',o=".fte-leaderEntry-count"+i+", .fte-leaderEntry-parent-count"+i,s=n.find(".fte-leaderEntry-parent-count"+i),d=s.length,c=[];if(s.each(function(){c.push(0)}),a.find(o).each(function(){var t=r.parse("TD"===this.tagName?this.innerText:this.value);if(void 0===this.dataset.division){t/=d;for(var e=0;d>e;++e)c[e]+=t}else c[this.dataset.division]+=t}),c.forEach(function(t,e){s[e].innerText=r.round(t),c[e]=0}),n.find(".fte-leaderEntry-parent-count"+t).each(function(){var t=r.parse(this.innerText);if(void 0===this.dataset.division){t/=d;for(var e=0;d>e;++e)c[e]+=t}else c[this.dataset.division]+=t}),s=n.find(".fte-leaderEntry-total-company-task"+t),c.forEach(function(t,e){s[e].innerText=r.round(t)}),"0"!==n.attr("data-level")){var l=n.attr("data-parent");n=this.$('.is-parent[data-id="'+l+'"]'),a=this.$('.is-child[data-parent="'+l+'"]'),this.recalcParentTotals(t,e,n,a)}},recalcDivisionTotals:function(t,n){var a=this,i=this.model.get("fteDiv"),o='[data-function="'+t+'"][data-company="'+n+'"]',s={};i.forEach(function(t){s[t]=0}),this.$('.fte-leaderEntry-parent-count[data-level="0"]'+o).each(function(){var t=r.parse(this.innerText);void 0===this.dataset.division?(t/=i.length,i.forEach(function(e){s[e]+=t})):s[i[this.dataset.division]]+=t}),this.$(".is-single .fte-leaderEntry-count"+o).each(function(){var t=r.parse(this.value);void 0===this.dataset.division?(t/=i.length,i.forEach(function(e){s[e]+=t})):s[i[this.dataset.division]]+=t}),i.forEach(function(e,i){var o=t+":"+n+":"+i,d='.fte-leaderEntry-total-prodFunction-division[data-column="'+o+'"]';a.$(d).text(r.round(s[e]))});var d={};e(this.theadEl).find(".fte-leaderEntry-total-prodFunction-division").each(function(){var t=this.dataset.company+":"+this.dataset.division;void 0===d[t]&&(d[t]=0),d[t]+=r.parse(this.innerText)}),Object.keys(d).forEach(function(t){a.$('.fte-leaderEntry-total-division[data-column="'+t+'"]').text(r.round(d[t]))})},recalcCompanyTotals:function(t,e){var n,a=0,i=t+":"+e,o=this.$(this.theadEl);this.withDivisions?(n='[data-column^="'+i+'"]',o.find(".fte-leaderEntry-total-prodFunction-division"+n).each(function(){a+=r.parse(this.innerText)})):(n='[data-function="'+t+'"][data-company="'+e+'"]',this.$(".fte-leaderEntry-count"+n).each(function(){a+=r.parse(this.value)})),this.$('.fte-leaderEntry-total-prodFunction-company[data-column="'+i+'"]').text(r.round(a));var s=0;o.find('.fte-leaderEntry-total-prodFunction-company[data-company="'+e+'"]').each(function(){s+=r.parse(this.innerText)}),this.$('.fte-leaderEntry-total-company[data-company="'+e+'"]').text(r.round(s))},recalcFunctionTotals:function(t){var e=0,n=this.$(this.theadEl);n.find('.fte-leaderEntry-total-prodFunction-company[data-function="'+t+'"]').each(function(){e+=r.parse(this.innerText)}),this.$('.fte-leaderEntry-total-prodFunction[data-column="'+t+'"]').text(r.round(e));var a=0;n.find(".fte-leaderEntry-total-prodFunction").each(function(){a+=r.parse(this.innerText)}),this.$(".fte-leaderEntry-total").text(r.round(a))},onRemoteEdit:function(t){if(t.socketId!==this.socket.getId()){if(void 0!==t.comment)return this.onRemoteCommentEdit(t);var e=".fte-leaderEntry-count[data-company="+t.companyIndex+"][data-task="+t.taskIndex+"]";this.withFunctions&&(e+='[data-function="'+t.functionIndex+'"]'),"number"==typeof t.divisionIndex&&(e+='[data-division="'+t.divisionIndex+'"]');var n=this.$(e);0!==n.length&&(n.val(t.newCount),n.attr({"data-value":t.newCount,"data-remote":"true"}),this.recount(n[0],t.taskIndex,t.functionIndex,t.companyIndex),this.model.handleUpdateMessage(t,!0))}},onRemoteCommentEdit:function(t){var e=this.$('textarea.fte-leaderEntry-comment[data-task="'+t.taskIndex+'"]');if(e.length){e.val(t.comment);var n=e.closest("tr"),a=n.prev(),i=a.find(".fte-leaderEntry-toggleComment > .fa");e.comment?(n.addClass("hidden"),a.removeClass("has-visible-comment").addClass("has-invisible-comment"),i.removeClass("fa-comment-o").addClass("fa-comment")):(n.removeClass("hidden"),a.removeClass("has-invisible-comment").addClass("has-visible-comment"),i.removeClass("fa-comment").addClass("fa-comment-o")),this.model.handleUpdateMessage(t,!0)}},onModelDeleted:function(t){i(this.broker,this.model,t)},showFocusInfoBar:function(t){null!==this.timers.hideFocusInfoBar&&(clearTimeout(this.timers.hideFocusInfoBar),this.timers.hideFocusInfoBar=null);var n=t.parentNode.parentNode;t.classList.contains("fte-leaderEntry-comment")&&(n=n.previousElementSibling);var a=n.children[0].innerText;if(n.classList.contains("is-child"))for(var i=n,o=+i.dataset.level;i&&o;){i=i.previousElementSibling.previousElementSibling;var r=+i.dataset.level;o>r&&(o=r,a=i.children[0].innerText+" \\ "+a)}var d=t.dataset["function"],c=t.dataset.company,l=t.dataset.division,u=d+":"+c,h=void 0===d?null:'.fte-leaderEntry-column-prodFunction[data-column="'+d+'"]',f=void 0===c?null:'.fte-leaderEntry-column-company[data-column="'+u+'"]',m=void 0===l?null:'.fte-leaderEntry-column-division[data-column="'+u+":"+l+'"]';this.$focusInfoBar.html(s({prodTask:a,prodFunction:h?this.theadEl.querySelector(h).innerText:null,company:f?this.theadEl.querySelector(f).innerText:null,division:m?this.theadEl.querySelector(m).innerText:null})),e("body").addClass("is-with-fte-focusInfoBar"),this.$focusInfoBar.fadeIn("fast")},hideFocusInfoBar:function(){var t=this;this.timers.hideFocusInfoBar=setTimeout(function(){t.timers&&(t.timers.hideFocusInfoBar=null,t.$focusInfoBar.fadeOut("fast",function(){e("body").removeClass("is-with-fte-focusInfoBar")}))},1)},updateComment:function(t){var e=parseInt(t.dataset.task,10),n="updateComment"+e;this.timers[n]&&clearTimeout(this.timers[n]),this.timers[n]=setTimeout(this.doUpdateComment.bind(this),5e3,t)},doUpdateComment:function(t){var e=parseInt(t.dataset.task,10),n="updateComment"+e;this.timers[n]&&(clearTimeout(this.timers[n]),delete this.timers[n]),this.socket.emit("fte.leader.updateComment",{socketId:this.socket.getId(),_id:this.model.id,taskIndex:e,comment:t.value})}})});