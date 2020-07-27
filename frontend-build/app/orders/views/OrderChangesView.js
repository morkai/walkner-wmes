define(["underscore","jquery","app/time","app/i18n","app/viewport","app/user","app/data/orderStatuses","app/data/localStorage","app/core/View","./OrderCommentFormView","./OperationListView","./DocumentListView","./ComponentListView","./NoteListView","../Order","../OrderCollection","../OperationCollection","../DocumentCollection","../ComponentCollection","app/orders/templates/change","app/orders/templates/changes","app/orderStatuses/util/renderOrderStatusLabel","app/core/templates/userInfo"],function(e,t,n,s,a,i,o,r,l,d,h,c,g,u,m,p,f,v,C,T,w,y,b){"use strict";return l.extend({template:w,events:{"click .orders-changes-operations":"toggleOperations","click .orders-changes-documents":"toggleDocuments","click .orders-changes-bom":"toggleComponents","click .orders-changes-notes":"toggleNotes","mouseover .orders-changes-noTimeAndUser":function(e){var t=this.$(e.target).closest("tbody").children().first();t.find(".orders-changes-time").addClass("is-hovered"),t.find(".orders-changes-user").addClass("is-hovered")},"mouseout .orders-changes-noTimeAndUser":function(){this.$(".is-hovered").removeClass("is-hovered")},"click #-toggleSystemChanges":function(){var e=this.$id("toggleSystemChanges").toggleClass("active").hasClass("active");r.setItem("WMES_NO_SYSTEM_CHANGES",e?"1":"0"),this.$el.toggleClass("orders-no-system-changes",e)},"click .orders-changes-time-editable":function(e){this.$(e.target).closest("form").length||(this.hideTimeEditor(),this.showTimeEditor(e.currentTarget))}},initialize:function(){this.renderChange=this.renderChange.bind(this),this.renderPropertyLabel=this.renderPropertyLabel.bind(this),this.renderValueChange=this.renderValueChange.bind(this),this.$lastToggle=null,this.toggleViews={operations:null,documents:null,bom:null,notes:null},this.setView("#-commentForm",new d({model:this.model,delayReasons:this.delayReasons})),this.listenTo(this.model,"push:change",this.onChangePush),t(window).on("keydown."+this.idPrefix,this.onKeyDown.bind(this))},destroy:function(){null!==this.$lastToggle&&(this.$lastToggle.click(),this.$lastToggle=null)},getTemplateData:function(){return{showPanel:!1!==this.options.showPanel,changes:this.serializeChanges(),canComment:p.can.comment(),noSystemChanges:"1"===r.getItem("WMES_NO_SYSTEM_CHANGES"),renderChange:this.renderChange}},serializeChanges:function(){return(this.model.get("changes")||[]).map(this.serializeChange,this)},serializeChange:function(t){return(t=e.clone(t)).user||(t.user={id:null,label:"System"}),t.timeEditable=!1,t.timeText=n.format(t.time,"L<br>LTS"),t.userText=b({userInfo:t.user}),t.values=Object.keys(t.oldValues||{}).map(function(e){return t.timeEditable=t.timeEditable||"statuses"===e,{property:e,oldValue:t.oldValues[e],newValue:t.newValues[e]}}),t.comment=e.isEmpty(t.comment)?"":e.escape(t.comment.trim()),"ps"===t.source?t.comment='<i class="fa fa-paint-brush"></i> '+t.comment:"wh"===t.source&&(t.comment='<i class="fa fa-truck"></i> '+t.comment),t.rowSpan=t.values.length+(""===t.comment?0:1),t},beforeRender:function(){this.stopListening(this.model,"change:changes",this.render)},afterRender:function(){this.listenToOnce(this.model,"change:changes",this.render)},renderChange:function(e,t){return this.renderPartialHtml(T,{canEditTime:p.can.editStatusChange(),renderPropertyLabel:this.renderPropertyLabel,renderValueChange:this.renderValueChange,change:e,i:t})},renderPropertyLabel:function(e){switch(e.property){case"qtyMax":return this.t("changes:qtyMax",{operationNo:e.newValue.operationNo});case"change":var t=e.newValue.oldIndex+1;return t!==e.newValue.newIndex+1&&(t+="->"+(e.newValue.newIndex+1)),this.t("changes:change",{no:t});default:return this.t("PROPERTY:"+e.property)}},renderValueChange:function(t,a,i){var r=t[i];if(null==r||0===r.length)return"-";switch(t.property){case"operations":return'<a class="orders-changes-operations" data-i="'+a+'" data-property="'+i+'">'+this.t("changes:operations",{count:r.length})+"</a>";case"documents":return'<a class="orders-changes-documents" data-i="'+a+'" data-property="'+i+'">'+this.t("changes:documents",{count:r.length})+"</a>";case"bom":return'<a class="orders-changes-bom" data-i="'+a+'" data-property="'+i+'">'+this.t("changes:bom",{count:r.length})+"</a>";case"notes":return'<a class="orders-changes-notes" data-i="'+a+'" data-property="'+i+'">'+this.t("changes:notes",{count:r.length})+"</a>";case"tags":return r.map(function(e){return e._id}).join(", ");case"statuses":return o.findAndFill(r).map(y).join(" ");case"delayReason":var l=this.delayReasons.get(r);return l?e.escape(l.getLabel()):r;case"startDate":case"finishDate":case"scheduledStartDate":case"scheduledFinishDate":return n.format(r,"LL");case"sapCreatedAt":return n.format(r,"LLL");case"whTime":return n.format(r,"HH:mm");case"whStatus":case"m4":case"psStatus":return this.t(t.property+":"+r);case"qtyMax":return r.value.toLocaleString();case"change":return n.format(r.time,"L LTS");case"etoCont":return s("core","BOOL:"+r);default:return e.escape(String(r))}},hideLastToggle:function(t){if(null===this.$lastToggle)return!0;if(!t||this.$lastToggle[0]!==t.target)return this.$lastToggle.click(),!0;this.$lastToggle=null;var n=this.toggleViews;return e.forEach(n,function(e,t){null!==e&&(e.remove(),n[t]=null)}),!1},toggleOperations:function(e){this.hideLastToggle(e)&&this.showLastToggle(e,f,h,"operations")},toggleDocuments:function(e){this.hideLastToggle(e)&&this.showLastToggle(e,v,c,"documents")},toggleComponents:function(e){this.hideLastToggle(e)&&this.showLastToggle(e,C,g,"bom")},toggleNotes:function(e){this.hideLastToggle(e)&&this.showLastToggle(e,null,u,"notes")},showLastToggle:function(e,t,n,s){var a=this.$(e.target),i=a.attr("data-i"),o=this.model.get("changes")[i];if(o){var r=o[a.attr("data-property")+"s"][s],l=t?new t(r):r,d={};d[s]=l;var h=new n({model:new m(d)}),c=a.closest("tr")[0].offsetTop+a.closest("td").outerHeight()+(!1!==this.options.showPanel?this.$(".panel-heading").first().outerHeight():0);h.render(),h.$el.css("top",c+"px"),this.$el.append(h.$el);var g=a.closest("td")[0].getBoundingClientRect(),u=h.$el.outerWidth(),p=Math.round(g.left-u/2);p<0&&(p=0),h.$el.css("left",p+"px"),this.$lastToggle=a,this.toggleViews[s]=h}},onChangePush:function(e){var s=this,a=s.$id("table"),i=s.model.get("changes"),o=e.newValues.change;p.can.editStatusChange();if(s.$id("empty").remove(),o){i[o.oldIndex].time=new Date(o.time).toISOString();var r=s.$('tbody[data-index="'+o.oldIndex+'"]').find(".orders-changes-time");if(r.find("a").length&&(r=r.find("a")),r.html(n.format(o.time,"L<br>LTS")),o.oldIndex!==o.newIndex){i.sort(function(e,t){return Date.parse(e.time)-Date.parse(t.time)}),a.find("tbody").remove();var l="",d=-1;return i.forEach(function(t,n){t===e&&(d=n),l+=s.renderChange(s.serializeChange(t),n)}),void a.append(l).find("tbody").eq(d).find("td").addClass("highlight")}}t(s.renderChange(s.serializeChange(e),i.length-1)).appendTo(a).find("td").addClass("highlight")},onKeyDown:function(e){"Escape"===e.key&&(this.hideTimeEditor(),this.hideLastToggle())},hideTimeEditor:function(){this.$(".orders-changes-time-editor").remove()},showTimeEditor:function(e){for(var s=this,i="YYYY-MM-DD HH:mm:ss",o=s.$(e),r=+o.closest("tbody")[0].dataset.index,l=s.model.get("changes"),d=l[r],h=null,c=null,g=r-1;g>=0;--g)if(l[g].oldValues.statuses){h=l[g];break}for(var u=r+1;u<l.length;++u)if(l[u].oldValues.statuses){c=l[u];break}var m=n.getMoment(d.time),p=n.getMoment(h?h.time:s.model.get("importTs")),f=n.getMoment(c?c.time:s.model.get("updatedAt")),v=t('<form class="orders-changes-time-editor"></form>'),C=t('<input type="text" class="form-control" required>').val(m.format(i)),T=t('<button class="btn btn-primary"><i class="fa fa-save"></i></button>');function w(e,t){C[0].setCustomValidity(s.t("changes:timeEditor:error:"+e,t)),setTimeout(function(){T.click()})}C.on("input",function(){C[0].setCustomValidity("")}),v.on("submit",function(e){e.preventDefault();var t=n.getMoment(C.val(),i);if(t.valueOf()===m.valueOf())return s.hideTimeEditor();if(!t.isValid())return w("format");if(t.valueOf()<=p.valueOf())return w("min",{time:p.format(i)});if(t.valueOf()>=f.valueOf())return w("max",{time:f.format(i)});a.msg.saving();var o=s.ajax({method:"POST",url:"/orders/"+s.model.id,data:JSON.stringify({change:{index:r,time:t.valueOf()}})});o.fail(function(){a.msg.savingFailed()}),o.done(function(){a.msg.saved(),s.hideTimeEditor()})}),v.append(C).append(T).appendTo(o),C.focus()}})});