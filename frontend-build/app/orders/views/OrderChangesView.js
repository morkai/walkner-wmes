// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/time","app/i18n","app/viewport","app/data/orderStatuses","app/core/View","./OrderCommentFormView","./OperationListView","./DocumentListView","./ComponentListView","../Order","../OperationCollection","../DocumentCollection","../ComponentCollection","app/orders/templates/change","app/orders/templates/changes","app/orderStatuses/util/renderOrderStatusLabel","app/core/templates/userInfo"],function(e,t,s,n,i,o,a,r,l,h,d,c,g,u,m,p,f,w,L){"use strict";return a.extend({template:f,events:{"click .orders-changes-operations":"toggleOperations","click .orders-changes-documents":"toggleDocuments","click .orders-changes-bom":"toggleComponents","mouseover .orders-changes-noTimeAndUser":function(e){var t=this.$(e.target).closest("tbody").children().first();t.find(".orders-changes-time").addClass("is-hovered"),t.find(".orders-changes-user").addClass("is-hovered")},"mouseout .orders-changes-noTimeAndUser":function(){this.$(".is-hovered").removeClass("is-hovered")}},initialize:function(){this.$lastToggle=null,this.operationListView=null,this.documentListView=null,this.componentListView=null,this.renderValueChange=this.renderValueChange.bind(this),this.setView(".orders-commentForm-container",new r({model:this.model,delayReasons:this.delayReasons})),this.listenTo(this.model,"push:change",this.onChangePush)},destroy:function(){null!==this.$lastToggle&&(this.$lastToggle.click(),this.$lastToggle=null)},serialize:function(){return{idPrefix:this.idPrefix,showPanel:this.options.showPanel!==!1,changes:this.serializeChanges(),renderChange:p,renderValueChange:this.renderValueChange}},serializeChanges:function(){return(this.model.get("changes")||[]).map(this.serializeChange,this)},serializeChange:function(t){return t.timeText=s.format(t.time,"YYYY-MM-DD<br>HH:mm:ss"),t.userText=L({userInfo:t.user}),t.values=Object.keys(t.oldValues||{}).map(function(e){return{property:e,oldValue:t.oldValues[e],newValue:t.newValues[e]}}),t.comment=e.isEmpty(t.comment)?"":t.comment.trim(),t.rowSpan=t.values.length+(""===t.comment?0:1),t},beforeRender:function(){this.stopListening(this.model,"change:changes",this.render)},afterRender:function(){this.listenToOnce(this.model,"change:changes",this.render)},renderValueChange:function(t,i,a){var r=t[a];if(null==r||0===r.length)return"-";switch(t.property){case"operations":return'<a class="orders-changes-operations" data-i="'+i+'" data-property="'+a+'">'+n("orders","CHANGES:operations",{count:r.length})+"</a>";case"documents":return'<a class="orders-changes-documents" data-i="'+i+'" data-property="'+a+'">'+n("orders","CHANGES:documents",{count:r.length})+"</a>";case"bom":return'<a class="orders-changes-bom" data-i="'+i+'" data-property="'+a+'">'+n("orders","CHANGES:bom",{count:r.length})+"</a>";case"statuses":return o.findAndFill(r).map(w).join(" ");case"delayReason":var l=this.delayReasons.get(r);return l?e.escape(l.getLabel()):r;case"startDate":case"finishDate":case"scheduledStartDate":case"scheduledFinishDate":return s.format(r,"LL");case"sapCreatedAt":return s.format(r,"LLL");default:return e.escape(String(r))}},hideLastToggle:function(e){return null===this.$lastToggle?!0:this.$lastToggle[0]!==e.target?(this.$lastToggle.click(),!0):(null!==this.operationListView&&(this.operationListView.remove(),this.operationListView=null),null!==this.documentListView&&(this.documentListView.remove(),this.documentListView=null),null!==this.componentListView&&(this.componentListView.remove(),this.componentListView=null),this.$lastToggle=null,!1)},toggleOperations:function(e){this.hideLastToggle(e)&&this.showLastToggle(e,g,l,"operations","operationListView")},toggleDocuments:function(e){this.hideLastToggle(e)&&this.showLastToggle(e,u,h,"documents","documentListView")},toggleComponents:function(e){this.hideLastToggle(e)&&this.showLastToggle(e,m,d,"bom","componentListView")},showLastToggle:function(e,t,s,n,i){var o=this.$(e.target),a=o.attr("data-i"),r=o.attr("data-property")+"s",l=new t(this.model.get("changes")[a][r][n]),h={};h[n]=l;var d=new s({model:new c(h)}),g=o.closest("tr")[0].offsetTop+o.closest("td").outerHeight()+(this.options.showPanel!==!1?this.$(".panel-heading").first().outerHeight():0);d.render(),d.$el.css("top",g),this.$el.append(d.$el),this.$lastToggle=o,this[i]=d},onChangePush:function(e){var s=t(p({renderValueChange:this.renderValueChange,change:this.serializeChange(e),i:this.model.get("changes").length}));this.$id("empty").remove(),this.$id("table").append(s),s.find("td").addClass("highlight")}})});