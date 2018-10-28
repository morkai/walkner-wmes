define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/core/templates/userInfo","app/qiResults/QiResult","app/qiResults/dictionaries","app/qiResults/templates/correctiveActionsTable","app/qiResults/templates/historyItem","app/qiResults/templates/history"],function(t,e,i,s,r,a,o,n,l,c,u,h,p){"use strict";return o.extend({template:p,events:{"submit form":function(){var t=this.$id("comment"),e=t.val().trim();if(""===e)return!1;var s=this.$id("submit").prop("disabled",!0),r=this.ajax({type:"PUT",url:"/qi/results/"+this.model.id,data:JSON.stringify({comment:e})});return r.done(function(){t.val("")}),r.fail(function(){a.msg.show({type:"error",time:3e3,text:i("qiResults","MSG:comment:failure")})}),r.always(function(){s.prop("disabled",!1)}),!1},"click .qiResults-history-correctiveActions":"toggleCorrectiveActions"},initialize:function(){this.lastChangeCount=0,this.$lastToggle=null,this.$lastTable=null},destroy:function(){this.$lastToggle&&(this.$lastTable.remove(),this.$lastTable=null,this.$lastToggle=null),this.$el.popover("destroy")},serialize:function(){return{idPrefix:this.idPrefix,canEdit:this.model.canEdit(),editUrl:this.model.genClientUrl("edit"),items:this.serializeItems()}},serializeItems:function(){var t=this.model.get("changes").map(this.serializeItem,this);return t.unshift(this.serializeItem({user:this.model.get("creator"),date:this.model.get("createdAt"),data:{},comment:i("qiResults","history:added")},0)),t},serializeItem:function(e,r){return{seen:!0,time:s.toTagData(e.date),user:n({userInfo:e.user}),changes:t.map(e.data,function(t,e){return{label:i("qiResults","PROPERTY:"+e),oldValue:this.serializeItemValue(e,t[0],!0,r),newValue:this.serializeItemValue(e,t[1],!1,r)}},this),comment:e.comment.trim()}},serializeItemValue:function(e,r,a,o){if("ok"===e)return i("qiResults","ok:"+r);if("number"==typeof r)return r.toLocaleString();if(t.isEmpty(r))return"-";switch(e){case"inspectedAt":return s.format(r,"LL");case"inspector":case"nokOwner":case"leader":return n({userInfo:r});case"kind":case"errorCategory":case"faultCode":var l=c.forProperty(e).get(r);return l?l.getLabel():r;case"faultDescription":case"problem":case"immediateActions":case"immediateResults":case"rootCause":return r.length<=43?r:{more:r,toString:function(){return r.substr(0,40)+"..."}};case"okFile":case"nokFile":return'<a href="/qi/results/'+this.model.id+"/attachments/"+e+"?change="+(a?-o:o)+'">'+t.escape(r.name)+"</a>";case"correctiveActions":return'<a class="qiResults-history-correctiveActions" data-property="'+e+'"data-index="'+o+'" data-which="'+(a?"0":"1")+'">'+i("qiResults","history:correctiveActions",{count:r.length})+"</a>";case"serialNumbers":return r.join(", ");default:return r||""}},beforeRender:function(){this.stopListening(this.model,"change:changes",this.updateHistory)},afterRender:function(){this.lastChangeCount=this.model.get("changes").length,this.listenTo(this.model,"change:changes",this.updateHistory),this.$el.popover({container:"body",selector:".has-more",placement:"top",trigger:"hover",template:this.$el.popover.Constructor.DEFAULTS.template.replace('class="popover"','class="popover qiResults-history-popover"'),title:function(){return e(this).closest("tr").children().first().text()}}),this.timers.updateTimes||(this.timers.updateTimes=setInterval(this.updateTimes.bind(this),3e4))},updateHistory:function(){for(var t=this.model.get("changes"),i="",s=this.lastChangeCount;s<t.length;++s)i+=h({item:this.serializeItem(t[s],s)});e(i).insertAfter(this.$(".qiResults-history-item").last()).addClass("highlight"),this.lastChangeCount=t.length},updateTimes:function(){this.$(".qiResults-history-time").each(function(){var t=s.toTagData(this.getAttribute("datetime"));this.textContent=t.daysAgo>5?t.long:t.human})},toggleCorrectiveActions:function(t){var i=!1;if(this.$lastToggle&&(i=this.$lastToggle[0]===t.target,this.$lastTable.remove(),this.$lastTable=null,this.$lastToggle=null),!i){var s=t.target.dataset,r=this.$(t.target),a=r.closest("tr"),o=r.position(),n=o.top+r.outerHeight()+2,h=o.left,p=e(u({bordered:!0,correctiveActions:l.serializeCorrectiveActions(c,this.model.get("changes")[s.index].data[s.property][s.which])}));p.css({position:"absolute",top:n+"px",left:h+"px",width:Math.min(a.outerWidth()-h,900)+"px",background:"#FFF"}).appendTo("body"),this.$lastToggle=r,this.$lastTable=p}}})});