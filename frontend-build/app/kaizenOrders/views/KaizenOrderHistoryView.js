// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/core/templates/userInfo","../dictionaries","app/kaizenOrders/templates/historyItem","app/kaizenOrders/templates/history"],function(e,t,s,i,r,a,n,o,u,c,h){"use strict";return n.extend({template:h,events:{"submit form":function(){var e=this.$id("comment"),t=e.val().trim();if(""===t)return!1;var i=this.$id("submit").prop("disabled",!0),r=this.ajax({type:"PUT",url:"/kaizen/orders/"+this.model.id,data:JSON.stringify({comment:t})});return r.done(function(){e.val("")}),r.fail(function(){a.msg.show({type:"error",time:3e3,text:s("kaizenOrders","MSG:comment:failure")})}),r.always(function(){i.prop("disabled",!1)}),!1}},initialize:function(){this.lastChangeCount=0,this.listenTo(this.model,"seen",function(){this.$el.find(".is-unseen").removeClass("is-unseen")})},destroy:function(){this.$el.popover("destroy")},serialize:function(){return{idPrefix:this.idPrefix,canEdit:this.model.canEdit(),editUrl:this.model.genClientUrl("edit"),items:this.serializeItems()}},serializeItems:function(){var e=this.model.get("changes").map(this.serializeItem,this);return e.unshift(this.serializeItem({user:this.model.get("creator"),date:this.model.get("createdAt"),data:{},comment:s("kaizenOrders","history:added")},0)),e},serializeItem:function(t,a){var n,u;t.data&&t.data.observer?(u=[],n=s("kaizenOrders","history:observer:"+t.data.observer[0])):(u=e.map(t.data,function(e,t){return{label:s("kaizenOrders","PROPERTY:"+t),oldValue:this.serializeItemValue(t,e[0],!0,a),newValue:this.serializeItemValue(t,e[1],!1,a)}},this),n=t.comment.trim());var c=this.model.get("observer").lastSeenAt;return{seen:t.user.id===r.data._id||null===c||c.getTime()>=Date.parse(t.date),time:i.toTagData(t.date),user:o({userInfo:t.user}),changes:u,comment:n}},serializeItemValue:function(t,r,a,n){if(e.isEmpty(r))return"-";switch(t){case"eventDate":return i.format(r,"YYYY-MM-DD, HH:mm");case"kaizenStartDate":case"kaizenFinishDate":return i.format(r,"YYYY-MM-DD");case"confirmer":return o({userInfo:r});case"nearMissOwners":case"suggestionOwners":case"kaizenOwners":return r.map(function(e){return(e.label||"").replace(/\s*\(.*?\)/,"")}).join(", ");case"status":return s("kaizenOrders","status:"+r);case"types":return r.map(function(e){return s("kaizenOrders","type:short:"+e)}).join("+");case"section":case"area":case"risk":case"cause":case"behaviour":var c=u[t+"s"].get(r);return c?c.getLabel():r;case"nearMissCategory":case"suggestionCategory":var h=u.categories.get(r);return h?h.getLabel():r;case"subject":case"causeText":case"description":case"correctiveMeasures":case"suggestion":case"kaizenImprovements":case"kaizenEffect":return r.length<=43?r:{more:r,toString:function(){return r.substr(0,40)+"..."}};case"attachments":return r.map(function(t){return'<a href="/kaizen/orders/'+this.model.id+"/attachments/"+t._id+"?download=1&change="+(a?-n:n)+'" title="'+e.escape(t.name)+'">'+s("kaizenOrders","attachments:"+t.description)+"</a>"},this).join("; ");case"subscribers":return r.join("; ");default:return r||""}},beforeRender:function(){this.stopListening(this.model,"change:changes",this.updateHistory),this.stopListening(this.model,"change:observer",this.updateUnseen)},afterRender:function(){this.lastChangeCount=this.model.get("changes").length,this.listenTo(this.model,"change:changes",this.updateHistory),this.listenTo(this.model,"change:observer",this.updateUnseen),this.$el.popover({container:"body",selector:".has-more",placement:"top",trigger:"hover",template:this.$el.popover.Constructor.DEFAULTS.template.replace('class="popover"','class="popover kaizenOrders-history-popover"'),title:function(){return t(this).closest("tr").children().first().text()}}),this.timers.updateTimes||(this.timers.updateTimes=setInterval(this.updateTimes.bind(this),3e4))},updateHistory:function(){for(var e=this.model.get("changes"),s="",i=this.lastChangeCount;i<e.length;++i)s+=c({item:this.serializeItem(e[i],i)});t(s).insertAfter(this.$(".kaizenOrders-history-item").last()).addClass("highlight"),this.lastChangeCount=e.length},updateUnseen:function(){var e=this.$(".is-unseen");if(e.length){var t=Date.parse(e.last().find(".kaizenOrders-history-time").attr("datetime")),s=this.model.get("observer").lastSeenAt;s&&s.getTime()>=t&&e.removeClass("is-unseen")}},updateTimes:function(){this.$(".kaizenOrders-history-time").each(function(){var e=i.toTagData(this.getAttribute("datetime"));this.textContent=e.daysAgo>5?e["long"]:e.human})}})});