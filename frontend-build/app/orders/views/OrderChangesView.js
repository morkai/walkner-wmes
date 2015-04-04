// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/time","app/i18n","app/viewport","app/data/orderStatuses","app/core/View","./OperationListView","../Order","../OperationCollection","app/orders/templates/changes","app/orderStatuses/util/renderOrderStatusLabel"],function(e,t,r,s,n,a,i,o,l,h,p){"use strict";return a.extend({template:h,events:{"click .orders-changes-more":"showMoreChanges","click .orders-changes-operations":"toggleOperations"},initialize:function(){this.$lastToggle=null,this.operationListView=null},destroy:function(){null!==this.$lastToggle&&this.$lastToggle.click()},serialize:function(){return{changes:(this.model.get("changes")||[]).reverse().map(function(e){return e.timeText=t.format(e.time,"YYYY-MM-DD HH:mm:ss"),e.values=Object.keys(e.oldValues||{}).map(function(t){return{property:t,oldValue:e.oldValues[t],newValue:e.newValues[t]}}),e}).filter(function(e){return e.values.length}),renderValueChange:this.renderValueChange}},afterRender:function(){this.listenToOnce(this.model,"change:changes",this.render)},renderValueChange:function(s,a,i){var o=s[i];if(null==o||0===o.length)return"-";switch(s.property){case"operations":return'<a class="orders-changes-operations" data-i="'+a+'" data-property="'+i+'">'+r("orders","CHANGES:operations",{count:o.length})+"</a>";case"statuses":return n.findAndFill(o).map(p).join("");case"startDate":case"finishDate":return t.format(o,"LL");default:return e.escape(String(o))}},showMoreChanges:function(){var e=this.$(".orders-changes-page.hidden");e.first().removeClass("hidden"),1===e.length&&this.$(".orders-changes-more").hide()},toggleOperations:function(e){if(null!==this.$lastToggle){if(this.$lastToggle[0]===e.target)return this.$lastToggle=null,void this.operationListView.remove();this.$lastToggle.click()}var t=this.$(e.target),r=t.attr("data-i"),s=t.attr("data-property")+"s",n=new l(this.model.get("changes")[r][s].operations),a=new i({model:new o({operations:n})}),h=t.closest("tr")[0].offsetTop+41+31;a.render(),a.$el.css("top",h),this.$el.append(a.$el),this.$lastToggle=t,this.operationListView=a}})});