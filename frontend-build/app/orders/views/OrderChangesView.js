define(["underscore","jquery","app/time","app/i18n","app/viewport","app/user","app/data/orderStatuses","app/data/localStorage","app/core/View","./OrderCommentFormView","./OperationListView","./DocumentListView","./ComponentListView","../Order","../OperationCollection","../DocumentCollection","../ComponentCollection","app/orders/templates/change","app/orders/templates/changes","app/orderStatuses/util/renderOrderStatusLabel","app/core/templates/userInfo"],function(e,t,s,n,o,a,r,i,l,h,c,d,u,g,m,p,f,L,w,C,y){"use strict";return l.extend({template:w,events:{"click .orders-changes-operations":"toggleOperations","click .orders-changes-documents":"toggleDocuments","click .orders-changes-bom":"toggleComponents","mouseover .orders-changes-noTimeAndUser":function(e){var t=this.$(e.target).closest("tbody").children().first();t.find(".orders-changes-time").addClass("is-hovered"),t.find(".orders-changes-user").addClass("is-hovered")},"mouseout .orders-changes-noTimeAndUser":function(){this.$(".is-hovered").removeClass("is-hovered")},"click #-toggleSystemChanges":function(){var e=this.$id("toggleSystemChanges").toggleClass("active").hasClass("active");i.setItem("WMES_NO_SYSTEM_CHANGES",e?"1":"0"),this.$el.toggleClass("orders-no-system-changes",e)}},initialize:function(){this.renderPropertyLabel=this.renderPropertyLabel.bind(this),this.renderValueChange=this.renderValueChange.bind(this),this.$lastToggle=null,this.operationListView=null,this.documentListView=null,this.componentListView=null,this.setView(".orders-commentForm-container",new h({model:this.model,delayReasons:this.delayReasons})),this.listenTo(this.model,"push:change",this.onChangePush)},destroy:function(){null!==this.$lastToggle&&(this.$lastToggle.click(),this.$lastToggle=null)},getTemplateData:function(){return{showPanel:!1!==this.options.showPanel,changes:this.serializeChanges(),renderChange:L,renderPropertyLabel:this.renderPropertyLabel,renderValueChange:this.renderValueChange,canComment:a.can.commentOrders(),noSystemChanges:"1"===i.getItem("WMES_NO_SYSTEM_CHANGES")}},serializeChanges:function(){return(this.model.get("changes")||[]).map(this.serializeChange,this)},serializeChange:function(t){return(t=e.clone(t)).user||(t.user={id:null,label:"System"}),t.timeText=s.format(t.time,"L<br>LTS"),t.userText=y({userInfo:t.user}),t.values=Object.keys(t.oldValues||{}).map(function(e){return{property:e,oldValue:t.oldValues[e],newValue:t.newValues[e]}}),t.comment=e.isEmpty(t.comment)?"":e.escape(t.comment.trim()),"ps"===t.source?t.comment='<i class="fa fa-paint-brush"></i> '+t.comment:"wh"===t.source&&(t.comment='<i class="fa fa-truck"></i> '+t.comment),t.rowSpan=t.values.length+(""===t.comment?0:1),t},beforeRender:function(){this.stopListening(this.model,"change:changes",this.render)},afterRender:function(){this.listenToOnce(this.model,"change:changes",this.render)},renderPropertyLabel:function(e){switch(e.property){case"qtyMax":return n("orders","CHANGES:qtyMax",{operationNo:e.newValue.operationNo});default:return n("orders","PROPERTY:"+e.property)}},renderValueChange:function(t,o,a){var i=t[a];if(null==i||0===i.length)return"-";switch(t.property){case"operations":return'<a class="orders-changes-operations" data-i="'+o+'" data-property="'+a+'">'+n("orders","CHANGES:operations",{count:i.length})+"</a>";case"documents":return'<a class="orders-changes-documents" data-i="'+o+'" data-property="'+a+'">'+n("orders","CHANGES:documents",{count:i.length})+"</a>";case"bom":return'<a class="orders-changes-bom" data-i="'+o+'" data-property="'+a+'">'+n("orders","CHANGES:bom",{count:i.length})+"</a>";case"statuses":return r.findAndFill(i).map(C).join(" ");case"delayReason":var l=this.delayReasons.get(i);return l?e.escape(l.getLabel()):i;case"startDate":case"finishDate":case"scheduledStartDate":case"scheduledFinishDate":return s.format(i,"LL");case"sapCreatedAt":return s.format(i,"LLL");case"whTime":return s.format(i,"HH:mm");case"whStatus":case"m4":case"psStatus":return n("orders",t.property+":"+i);case"qtyMax":return i.value.toLocaleString();default:return e.escape(String(i))}},hideLastToggle:function(e){return null===this.$lastToggle||(this.$lastToggle[0]!==e.target?(this.$lastToggle.click(),!0):(null!==this.operationListView&&(this.operationListView.remove(),this.operationListView=null),null!==this.documentListView&&(this.documentListView.remove(),this.documentListView=null),null!==this.componentListView&&(this.componentListView.remove(),this.componentListView=null),this.$lastToggle=null,!1))},toggleOperations:function(e){this.hideLastToggle(e)&&this.showLastToggle(e,m,c,"operations","operationListView")},toggleDocuments:function(e){this.hideLastToggle(e)&&this.showLastToggle(e,p,d,"documents","documentListView")},toggleComponents:function(e){this.hideLastToggle(e)&&this.showLastToggle(e,f,u,"bom","componentListView")},showLastToggle:function(e,t,s,n,o){var a=this.$(e.target),r=a.attr("data-i"),i=a.attr("data-property")+"s",l=new t(this.model.get("changes")[r][i][n]),h={};h[n]=l;var c=new s({model:new g(h)}),d=a.closest("tr")[0].offsetTop+a.closest("td").outerHeight()+(!1!==this.options.showPanel?this.$(".panel-heading").first().outerHeight():0);c.render(),c.$el.css("top",d),this.$el.append(c.$el),this.$lastToggle=a,this[o]=c},onChangePush:function(e){var s=t(L({renderPropertyLabel:this.renderPropertyLabel,renderValueChange:this.renderValueChange,change:this.serializeChange(e),i:this.model.get("changes").length}));this.$id("empty").remove(),this.$id("table").append(s),s.find("td").addClass("highlight")}})});