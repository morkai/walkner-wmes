// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/core/templates/userInfo","app/pfepEntries/PfepEntry","app/pfepEntries/templates/historyItem","app/pfepEntries/templates/history"],function(e,t,i,s,r,n,a,o,p,h,l){"use strict";return a.extend({template:l,events:{"submit form":function(){var e=this.$id("comment"),t=e.val().trim();if(""===t)return!1;var s=this.$id("submit").prop("disabled",!0),r=this.ajax({type:"PUT",url:"/pfep/entries/"+this.model.id,data:JSON.stringify({comment:t})});return r.done(function(){e.val("")}),r.fail(function(){n.msg.show({type:"error",time:3e3,text:i("pfepEntries","MSG:comment:failure")})}),r.always(function(){s.prop("disabled",!1)}),!1}},initialize:function(){this.lastChangeCount=0},destroy:function(){this.$el.popover("destroy")},serialize:function(){return{idPrefix:this.idPrefix,canEdit:r.isAllowedTo("PFEP:MANAGE"),editUrl:this.model.genClientUrl("edit"),items:this.serializeItems()}},serializeItems:function(){var e=this.model.get("changes").map(this.serializeItem,this);return e.unshift(this.serializeItem({user:this.model.get("creator"),date:this.model.get("createdAt"),data:{},comment:i("pfepEntries","history:added")},0)),e},serializeItem:function(t,r){return{seen:!0,time:s.toTagData(t.date),user:o({userInfo:t.user}),changes:e.map(t.data,function(e,t){return{label:i("pfepEntries","PROPERTY:"+t),oldValue:this.serializeItemValue(t,e[0],!0,r),newValue:this.serializeItemValue(t,e[1],!1,r)}},this),comment:t.comment.trim()}},serializeItemValue:function(t,i,s){if("number"==typeof i)return i.toLocaleString();if(e.isEmpty(i))return"-";switch(t){case"notes":return i.length<=43?i:{more:i,toString:function(){return i.substr(0,40)+"..."}};default:return i||""}},beforeRender:function(){this.stopListening(this.model,"change:changes",this.updateHistory)},afterRender:function(){this.lastChangeCount=this.model.get("changes").length,this.listenTo(this.model,"change:changes",this.updateHistory),this.$el.popover({container:"body",selector:".has-more",placement:"top",trigger:"hover",template:this.$el.popover.Constructor.DEFAULTS.template.replace('class="popover"','class="popover pfepEntries-history-popover"'),title:function(){return t(this).closest("tr").children().first().text()}}),this.timers.updateTimes||(this.timers.updateTimes=setInterval(this.updateTimes.bind(this),3e4))},updateHistory:function(){for(var e=this.model.get("changes"),i="",s=this.lastChangeCount;s<e.length;++s)i+=h({item:this.serializeItem(e[s],s)});t(i).insertAfter(this.$(".pfepEntries-history-item").last()).addClass("highlight"),this.lastChangeCount=e.length},updateTimes:function(){this.$(".pfepEntries-history-time").each(function(){var e=s.toTagData(this.getAttribute("datetime"));this.textContent=e.daysAgo>5?e.long:e.human})}})});