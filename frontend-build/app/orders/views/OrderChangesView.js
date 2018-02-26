// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/time","app/i18n","app/viewport","app/user","app/data/orderStatuses","app/core/View","./OrderCommentFormView","./OperationListView","./DocumentListView","./ComponentListView","../Order","../OperationCollection","../DocumentCollection","../ComponentCollection","app/orders/templates/change","app/orders/templates/changes","app/orderStatuses/util/renderOrderStatusLabel","app/core/templates/userInfo"],function(e,t,s,n,r,o,i,a,l,h,c,d,u,g,p,m,f,L,w,V){"use strict";return a.extend({template:L,events:{"click .orders-changes-operations":"toggleOperations","click .orders-changes-documents":"toggleDocuments","click .orders-changes-bom":"toggleComponents","mouseover .orders-changes-noTimeAndUser":function(e){var t=this.$(e.target).closest("tbody").children().first();t.find(".orders-changes-time").addClass("is-hovered"),t.find(".orders-changes-user").addClass("is-hovered")},"mouseout .orders-changes-noTimeAndUser":function(){this.$(".is-hovered").removeClass("is-hovered")}},initialize:function(){this.renderPropertyLabel=this.renderPropertyLabel.bind(this),this.renderValueChange=this.renderValueChange.bind(this),this.$lastToggle=null,this.operationListView=null,this.documentListView=null,this.componentListView=null,this.setView(".orders-commentForm-container",new l({model:this.model,delayReasons:this.delayReasons})),this.listenTo(this.model,"push:change",this.onChangePush)},destroy:function(){null!==this.$lastToggle&&(this.$lastToggle.click(),this.$lastToggle=null)},serialize:function(){return{idPrefix:this.idPrefix,showPanel:this.options.showPanel!==!1,changes:this.serializeChanges(),renderChange:f,renderPropertyLabel:this.renderPropertyLabel,renderValueChange:this.renderValueChange,canComment:o.can.commentOrders()}},serializeChanges:function(){return(this.model.get("changes")||[]).map(this.serializeChange,this)},serializeChange:function(t){return t.timeText=s.format(t.time,"L<br>LTS"),t.userText=V({userInfo:t.user}),t.values=Object.keys(t.oldValues||{}).map(function(e){return{property:e,oldValue:t.oldValues[e],newValue:t.newValues[e]}}),t.comment=e.isEmpty(t.comment)?"":e.escape(t.comment.trim()),"ps"===t.source?t.comment='<i class="fa fa-paint-brush"></i> '+t.comment:"wh"===t.source&&(t.comment='<i class="fa fa-truck"></i> '+t.comment),t.rowSpan=t.values.length+(""===t.comment?0:1),t},beforeRender:function(){this.stopListening(this.model,"change:changes",this.render)},afterRender:function(){this.listenToOnce(this.model,"change:changes",this.render)},renderPropertyLabel:function(e){switch(e.property){case"qtyMax":return n("orders","CHANGES:qtyMax",{operationNo:e.newValue.operationNo});default:return n("orders","PROPERTY:"+e.property)}},renderValueChange:function(t,r,o){var a=t[o];if(null==a||0===a.length)return"-";switch(t.property){case"operations":return'<a class="orders-changes-operations" data-i="'+r+'" data-property="'+o+'">'+n("orders","CHANGES:operations",{count:a.length})+"</a>";case"documents":return'<a class="orders-changes-documents" data-i="'+r+'" data-property="'+o+'">'+n("orders","CHANGES:documents",{count:a.length})+"</a>";case"bom":return'<a class="orders-changes-bom" data-i="'+r+'" data-property="'+o+'">'+n("orders","CHANGES:bom",{count:a.length})+"</a>";case"statuses":return i.findAndFill(a).map(w).join(" ");case"delayReason":var l=this.delayReasons.get(a);return l?e.escape(l.getLabel()):a;case"startDate":case"finishDate":case"scheduledStartDate":case"scheduledFinishDate":return s.format(a,"LL");case"sapCreatedAt":return s.format(a,"LLL");case"whTime":return s.format(a,"HH:mm");case"whStatus":return n("orders","whStatus:"+a);case"qtyMax":return a.value.toLocaleString();default:return e.escape(String(a))}},hideLastToggle:function(e){return null===this.$lastToggle||(this.$lastToggle[0]!==e.target?(this.$lastToggle.click(),!0):(null!==this.operationListView&&(this.operationListView.remove(),this.operationListView=null),null!==this.documentListView&&(this.documentListView.remove(),this.documentListView=null),null!==this.componentListView&&(this.componentListView.remove(),this.componentListView=null),this.$lastToggle=null,!1))},toggleOperations:function(e){this.hideLastToggle(e)&&this.showLastToggle(e,g,h,"operations","operationListView")},toggleDocuments:function(e){this.hideLastToggle(e)&&this.showLastToggle(e,p,c,"documents","documentListView")},toggleComponents:function(e){this.hideLastToggle(e)&&this.showLastToggle(e,m,d,"bom","componentListView")},showLastToggle:function(e,t,s,n,r){var o=this.$(e.target),i=o.attr("data-i"),a=o.attr("data-property")+"s",l=new t(this.model.get("changes")[i][a][n]),h={};h[n]=l;var c=new s({model:new u(h)}),d=o.closest("tr")[0].offsetTop+o.closest("td").outerHeight()+(this.options.showPanel!==!1?this.$(".panel-heading").first().outerHeight():0);c.render(),c.$el.css("top",d),this.$el.append(c.$el),this.$lastToggle=o,this[r]=c},onChangePush:function(e){var s=t(f({renderPropertyLabel:this.renderPropertyLabel,renderValueChange:this.renderValueChange,change:this.serializeChange(e),i:this.model.get("changes").length}));this.$id("empty").remove(),this.$id("table").append(s),s.find("td").addClass("highlight")}})});