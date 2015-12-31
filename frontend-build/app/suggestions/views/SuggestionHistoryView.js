// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/core/templates/userInfo","app/kaizenOrders/dictionaries","app/suggestions/templates/historyItem","app/suggestions/templates/history"],function(e,t,s,i,n,a,r,o,u,h,l){"use strict";return r.extend({template:l,events:{"submit form":function(){var e=this.$id("comment"),t=e.val().trim();if(""===t)return!1;var i=this.$id("submit").prop("disabled",!0),n=this.ajax({type:"PUT",url:"/suggestions/"+this.model.id,data:JSON.stringify({comment:t})});return n.done(function(){e.val("")}),n.fail(function(){a.msg.show({type:"error",time:3e3,text:s("suggestions","MSG:comment:failure")})}),n.always(function(){i.prop("disabled",!1)}),!1}},initialize:function(){this.lastChangeCount=0,this.listenTo(this.model,"seen",function(){this.$el.find(".is-unseen").removeClass("is-unseen")})},destroy:function(){this.$el.popover("destroy")},serialize:function(){return{idPrefix:this.idPrefix,canEdit:this.model.canEdit(),editUrl:this.model.genClientUrl("edit"),items:this.serializeItems()}},serializeItems:function(){var e=this.model.get("changes").map(this.serializeItem,this);return e.unshift(this.serializeItem({user:this.model.get("creator"),date:this.model.get("createdAt"),data:{},comment:s("suggestions","history:added")},0)),e},serializeItem:function(t,a){var r,u;t.data.observer?(u=[],r=s("suggestions","history:observer:"+t.data.observer[0])):(u=e.map(t.data,function(e,t){return{label:s("suggestions","PROPERTY:"+t),oldValue:this.serializeItemValue(t,e[0],!0,a),newValue:this.serializeItemValue(t,e[1],!1,a)}},this),r=t.comment.trim());var h=this.model.get("observer").lastSeenAt;return{seen:t.user.id===n.data._id||null===h||h.getTime()>=Date.parse(t.date),time:i.toTagData(t.date),user:o({userInfo:t.user}),changes:u,comment:r}},serializeItemValue:function(t,n,a,r){if(e.isEmpty(n))return"-";switch(t){case"date":case"kaizenStartDate":case"kaizenFinishDate":return i.format(n,"YYYY-MM-DD");case"confirmer":return o({userInfo:n});case"suggestionOwners":case"kaizenOwners":return n.map(function(e){return(e.label||"").replace(/\s*\(.*?\)/,"")}).join(", ");case"status":return s("suggestions","status:"+n);case"section":case"category":case"productFamily":var h=u.forProperty(t).get(n);return h?h.getLabel():n;case"subject":case"howItIs":case"howItShouldBe":case"suggestion":case"kaizenImprovements":case"kaizenEffect":return n.length<=43?n:{more:n,toString:function(){return n.substr(0,40)+"..."}};case"attachments":return n.map(function(t){return'<a href="/suggestions/'+this.model.id+"/attachments/"+t._id+"?download=1&change="+(a?-r:r)+'" title="'+e.escape(t.name)+'">'+s("suggestions","attachments:"+t.description)+"</a>"},this).join("; ");case"subscribers":return n.join("; ");default:return n||""}},beforeRender:function(){this.stopListening(this.model,"change:changes",this.updateHistory),this.stopListening(this.model,"change:observer",this.updateUnseen)},afterRender:function(){this.lastChangeCount=this.model.get("changes").length,this.listenTo(this.model,"change:changes",this.updateHistory),this.listenTo(this.model,"change:observer",this.updateUnseen),this.$el.popover({container:"body",selector:".has-more",placement:"top",trigger:"hover",template:this.$el.popover.Constructor.DEFAULTS.template.replace('class="popover"','class="popover suggestions-history-popover"'),title:function(){return t(this).closest("tr").children().first().text()}}),this.timers.updateTimes||(this.timers.updateTimes=setInterval(this.updateTimes.bind(this),3e4))},updateHistory:function(){for(var e=this.model.get("changes"),s="",i=this.lastChangeCount;i<e.length;++i)s+=h({item:this.serializeItem(e[i],i)});t(s).insertAfter(this.$(".suggestions-history-item").last()).addClass("highlight"),this.lastChangeCount=e.length},updateUnseen:function(){var e=this.$(".is-unseen");if(e.length){var t=Date.parse(e.last().find(".suggestions-history-time").attr("datetime")),s=this.model.get("observer").lastSeenAt;s&&s.getTime()>=t&&e.removeClass("is-unseen")}},updateTimes:function(){this.$(".suggestions-history-time").each(function(){var e=i.toTagData(this.getAttribute("datetime"));this.textContent=e.daysAgo>5?e["long"]:e.human})}})});