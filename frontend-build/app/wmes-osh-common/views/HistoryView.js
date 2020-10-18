define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/core/templates/userInfo","app/wmes-osh-common/dictionaries","app/wmes-osh-common/templates/history/panel","app/wmes-osh-common/templates/history/item"],function(e,t,s,i,n,o,a,r,l,c,m){"use strict";const h={statusComment:!0,statusUpdater:!0,startedAt:!0,implementedAt:!0,finishedAt:!0};return a.extend({nlsDomain:"wmes-osh-common",template:c,events:{"click #-commentsOnly":function(){this.commentsOnly=!this.commentsOnly,this.commentsOnly?localStorage.setItem("OSH_HISTORY_COMMENTS_ONLY","1"):localStorage.removeItem("OSH_HISTORY_COMMENTS_ONLY"),this.render(),this.commentsOnly&&(this.scrollToBottom(),this.scrollIntoView())},"click #-maximize":function(){this.commentsOnly&&this.scrollToBottom(),this.scrollIntoView()},"keyup #-comment":function(e){if(e.ctrlKey&&"Enter"===e.key)return this.$id("submit").click(),!1},"submit form":function(){const e=this.$id("submit"),t=this.$id("comment"),s=t.val().trim();if(this.scrollIntoView(),!s.replace(/[^a-zA-Z0-9]+/g,"").length)return t.val("").focus(),!1;e.prop("disabled",!0),t.prop("disabled",!0);const i=this.ajax({method:"PUT",url:this.model.url(),data:JSON.stringify({comment:s})});return i.fail(()=>o.msg.savingFailed()),i.done(()=>{o.msg.saved(),t.val("")}),i.always(()=>{e.prop("disabled",!1),t.prop("disabled",!1).focus()}),!1}},initialize:function(){this.commentsOnly="1"===localStorage.getItem("OSH_HISTORY_COMMENTS_ONLY"),this.once("afterRender",()=>{this.listenTo(this.model,"change:changes",e.debounce(this.updateHistory,1)),this.listenTo(this.model,"seen",this.onSeen)}),t(window).on(`resize.${this.idPrefix}`,e.debounce(this.resize.bind(this),33))},getTemplateData:function(){return{renderItem:this.renderPartialHtml.bind(this,m),items:this.serializeItems(),canComment:this.model.constructor.can.comment(this.model),commentsOnly:this.commentsOnly,maxHeight:this.calcHeight()}},serializeItems:function(){return this.model.get("changes").map(this.serializeItem,this).filter(this.filterItem,this)},filterItem:function(e){return!(this.commentsOnly&&!e.comment)&&(!!e.comment||!!e.changes.length)},serializeItem:function(t,s){const n=this.model.getObserver(),o=Date.parse(t.date),a=n.notify&&n.lastSeenAt<o,l=this.commentsOnly?[]:e.map(t.data,(e,t)=>{if(h[t])return null;const i=this.translate(`PROPERTY:${t}`);return null===e[0]&&e[1]&&(e[1].added||e[1].edited||e[1].deleted)?{label:i,values:this.serializeItemValues(t,e[1],s)}:{label:i,oldValue:this.serializeItemValue(t,e[0],!0,s),newValue:this.serializeItemValue(t,e[1],!1,s)}}).filter(e=>!!e);return{i:s,time:i.toTagData(o),user:r(t.user,{noIp:!0}),changes:l,comment:t.comment.trim(),unseen:a}},translate:function(e,t){const s=this.model.getNlsDomain();return this.t.has(s,e)?this.t(s,e,t):this.t(e,t)},serializeItemValue:function(t,s){if(null==s||""===s||Array.isArray(s)&&0===s.length)return"-";if(0===s)return 0;if("boolean"==typeof s)return this.t("core","BOOL:"+s);switch("string"==typeof s&&(s=e.escape(s)),t){case"implementer":case"implementers":case"coordinators":return r(s);case"plannedAt":return i.utc.format(s,"LL");case"eventDate":return i.utc.format(s,this.translate("details:eventDate:format"));case"problem":case"reason":case"suggestion":case"solution":return s.length<=43?s:{more:s,toString:()=>`${s.substr(0,40)}...`};case"priority":case"status":case"kind":case"workplace":case"division":case"building":case"location":case"eventCategory":case"reasonCategory":{const i=e.escape(l.getLabel(t,s,{long:!0})),n=e.escape(l.getLabel(t,s,{long:!1}));return i>43?n>43?{more:i,toString:()=>`${i.substr(0,40)}...`}:{more:i,toString:()=>n}:i}case"attachments":{const t=`<a href="${this.model.getAttachmentUrl(s)}" target="_blank">`;return s.name.length<=43?`${t}${e.escape(s.name)}</a>`:{more:s.name,toString:()=>`${t}${e.escape(s.name).substr(0,40)}...</a>`}}case"relations":return this.translate(`relation:${s.type}`,s);case"resolution":return s._id?this.translate(`resolution:link:${s.type}`,{id:s._id}):this.translate(`resolution:desc:${s.type}`);default:return s||""}},serializeItemValues:function(e,{added:t,edited:s,deleted:i}){const n=[];return(i||[]).forEach(t=>n.push({oldValue:this.serializeItemValue(e,t),newValue:"-"})),(t||[]).forEach(t=>n.push({oldValue:"-",newValue:this.serializeItemValue(e,t)})),(s||[]).forEach(t=>n.push({oldValue:this.serializeItemValue(e,Object.assign({},t,t.old)),newValue:this.serializeItemValue(e,t)})),n},afterRender:function(){this.lastChangeCount=this.model.get("changes").length,this.$el.popover({container:"body",selector:".has-more",placement:"top",trigger:"hover",className:"osh-history-popover",title:function(){return t(this).closest("tr").children().first().text()}}),this.timers.updateTimes||(this.timers.updateTimes=setInterval(this.updateTimes.bind(this),3e4)),this.resize(),this.scrollToBottom()},updateHistory:function(){const e=this.model.get("changes");let s="";for(let t=this.lastChangeCount;t<e.length;++t){const i=this.serializeItem(e[t],t);this.filterItem(i)&&(s+=this.renderPartialHtml(m,{item:i}))}if(s.length){const e=this.$id("items"),i=t(s),n=e[0].scrollTop+e.outerHeight()>=e[0].scrollHeight;e.append(i),n&&this.scrollToBottom(),i.addClass("highlight")}this.lastChangeCount=e.length},updateTimes:function(){this.$(".osh-history-time").each(function(){var e=i.toTagData(this.getAttribute("datetime"));this.textContent=e.daysAgo>3?e.long:e.human})},calcHeight:function(){const e=this.$(".panel-heading"),t=this.$id(".panel-footer");return window.innerHeight-(e.outerHeight()||41)-(t.outerHeight()||139)-30},resize:function(){this.$id("items").css("max-height",this.calcHeight()+"px")},scrollToBottom:function(){const e=this.$id("items");e[0].scrollTop=e[0].scrollHeight},scrollIntoView:function(){document.scrollingElement.scrollTop=this.el.offsetTop-15},onSeen:function(){this.$(".osh-unseen").removeClass("osh-unseen")}})});