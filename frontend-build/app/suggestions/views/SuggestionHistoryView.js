define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/core/templates/userInfo","app/kaizenOrders/dictionaries","../Suggestion","app/suggestions/templates/historyItem","app/suggestions/templates/history"],function(e,t,s,i,a,n,r,o,u,l,c,h){"use strict";return r.extend({template:h,events:{"submit form":function(){var e=this,t=e.$id("comment"),s=t.val().trim();if(""===s)return!1;var i=e.$id("submit").prop("disabled",!0),a=e.ajax({type:"PUT",url:"/suggestions/"+e.model.id,data:JSON.stringify({comment:s})});return a.done(function(){t.val("")}),a.fail(function(){n.msg.show({type:"error",time:3e3,text:e.t("MSG:comment:failure")})}),a.always(function(){i.prop("disabled",!1)}),!1}},initialize:function(){this.lastChangeCount=0,this.listenTo(this.model,"seen",function(){this.$el.find(".is-unseen").removeClass("is-unseen")}),this.once("afterRender",function(){this.listenTo(this.model,"change:changes",this.updateHistory),this.listenTo(this.model,"change:observer",this.updateUnseen)})},destroy:function(){this.$el.popover("destroy")},getTemplateData:function(){return{canEdit:this.model.canEdit(),editUrl:this.model.genClientUrl("edit"),items:this.serializeItems()}},serializeItems:function(){var e=this.model.get("changes").map(this.serializeItem,this);return e.unshift(this.serializeItem({user:this.model.get("creator"),date:this.model.get("createdAt"),data:{},comment:this.t("history:added")},0)),e},serializeItem:function(t,s){var n,r,u=this;t.data&&t.data.observer?(r=[],n=u.t("history:observer:"+t.data.observer[0])):(r=e.map(t.data,function(e,t){var i=u.t("PROPERTY:"+t);return null===e[0]&&e[1]&&(e[1].added||e[1].edited||e[1].deleted)?{label:i,values:u.serializeItemValues(t,e[1],s)}:{label:i,oldValue:u.serializeItemValue(t,e[0],!0,s),newValue:u.serializeItemValue(t,e[1],!1,s)}}),n=t.comment.trim());var l=this.model.get("observer").lastSeenAt;return{seen:t.user.id===a.data._id||null===l||l.getTime()>=Date.parse(t.date),time:i.toTagData(t.date),user:o({userInfo:t.user}),changes:r,comment:n}},serializeItemValues:function(e,{added:t,edited:s,deleted:i},a){var n=this,r=[];return(i||[]).forEach(function(t){r.push({oldValue:n.serializeItemValue(e,t,!0,a),newValue:"-"})}),(t||[]).forEach(function(t){r.push({oldValue:"-",newValue:n.serializeItemValue(e,t,!1,a)})}),(s||[]).forEach(function(t){r.push({oldValue:n.serializeItemValue(e,Object.assign({},t,t.old),!0,a),newValue:n.serializeItemValue(e,t,!1,a)})}),r},serializeItemValue:function(t,s,a,n){if("boolean"==typeof s)return this.t("core","BOOL:"+s);if(e.isEmpty(s))return"-";switch(t){case"date":case"kaizenStartDate":case"kaizenFinishDate":return i.format(s,"L");case"confirmer":case"superior":return o({userInfo:s});case"suggestionOwners":case"kaizenOwners":return s.map(function(e){return(e.label||"").replace(/\s*\(.*?\)/,"")}).join(", ");case"status":return this.t("status:"+s);case"section":case"productFamily":var r=u.forProperty(t).get(s);return r?r.getLabel():s;case"categories":return s.map(function(e){return u.forProperty(t).getLabel(e)}).join("; ");case"subject":case"howItIs":case"howItShouldBe":case"suggestion":case"kaizenImprovements":case"kaizenEffect":return s.length<=43?s:{more:s,toString:function(){return s.substr(0,40)+"..."}};case"attachments":{const t=`<a href="${this.model.getAttachmentUrl(s)}&change=${n}" target="_blank">`;let i="";return s.kind&&this.t.has(`history:attachmentKind:${s.kind}`)&&(i=" ("+this.t(`history:attachmentKind:${s.kind}`)+")"),s.name.length<=43?`${t}${e.escape(s.name)}</a>${i}`:{more:s.name,toString:()=>`${t}${e.escape(s.name).substr(0,40)}...</a>${i}`}}case"subscribers":return s.join("; ");case"coordSections":return s.map(function(t){return'<i class="fa '+l.OPINION_STATUS_ICONS[t.status]+'"></i><span>'+e.escape(t._id)+"</span>"}).join(" ");case"resolutions":return'<a href="#suggestions/'+s._id+'">'+s.rid+"</a>";default:return s||""}},afterRender:function(){this.lastChangeCount=this.model.get("changes").length,this.$el.popover({container:"body",selector:".has-more",placement:"top",trigger:"hover",className:"suggestions-history-popover",title:function(){return t(this).closest("tr").children().first().text()}}),this.timers.updateTimes||(this.timers.updateTimes=setInterval(this.updateTimes.bind(this),3e4))},updateHistory:function(){for(var e=this.model.get("changes"),s="",i=this.lastChangeCount;i<e.length;++i)s+=c({item:this.serializeItem(e[i],i)});t(s).insertAfter(this.$(".suggestions-history-item").last()).addClass("highlight"),this.lastChangeCount=e.length},updateUnseen:function(){var e=this.$(".is-unseen");if(e.length){var t=Date.parse(e.last().find(".suggestions-history-time").attr("datetime")),s=this.model.get("observer").lastSeenAt;s&&s.getTime()>=t&&e.removeClass("is-unseen")}},updateTimes:function(){this.$(".suggestions-history-time").each(function(){var e=i.toTagData(this.getAttribute("datetime"));this.textContent=e.daysAgo>5?e.long:e.human})}})});