define(["underscore","app/i18n","app/time","app/core/views/ListView","app/core/util/html2pdf","app/printers/views/PrinterPickerView","../dictionaries","app/qiResults/templates/correctiveActionsTable"],function(e,i,t,s,a,r,n,l){"use strict";return i=i.forDomain("qiResults"),s.extend({className:"qiResults-list is-clickable is-colored",events:e.assign({"click .action-print":function(e){var i=this,t=i.collection.get(this.$(e.target).closest("tr").attr("data-id"));return e.listAction={view:i,tag:"qi"},r.listAction(e,function(e){i.ajax({url:t.url()+".html",dataType:"html"}).done(function(i){a(i,{orientation:"landscape"},e)})}),!1},"click .is-filter":function(e){this.trigger("showFilter",e.currentTarget.dataset.columnId)}},s.prototype.events),destroy:function(){this.$el.popover("destroy")},serializeColumns:function(){var e=this.collection.hasAnyNokResult(),t=[{id:"rid",tdClassName:"is-min is-number",thClassName:"is-filter"},{id:"orderNo",tdClassName:"is-min is-number",thClassName:"is-filter"},{id:"nc12",tdClassName:"is-min is-number",thClassName:"is-filter"},{id:"productFamily",tdClassName:"is-min",thClassName:"is-filter"},"productName",{id:"division",tdClassName:"is-min",thClassName:"is-filter",label:i("LIST:COLUMN:division")},{id:"line",tdClassName:"is-min",thClassName:"is-filter"},{id:"kind",thClassName:"is-filter"},{id:"inspectedAt",tdClassName:"is-min",thClassName:"is-filter"},{id:"inspector",thClassName:"is-filter"}];return e&&t.push({id:"nokOwner",thClassName:"is-filter",label:i("LIST:COLUMN:nokOwner")}),t.push({id:"qtyOrder",tdClassName:"is-min is-number",label:i("LIST:COLUMN:qtyOrder")},{id:"qtyInspected",tdClassName:"is-min is-number",label:i("LIST:COLUMN:qtyInspected")}),e&&t.push({id:"qtyNokInspected",tdClassName:"is-min is-number",label:i("LIST:COLUMN:qtyNokInspected")},{id:"qtyToFix",tdClassName:"is-min is-number",label:i("LIST:COLUMN:qtyToFix")},{id:"qtyNok",tdClassName:"is-min is-number",label:i("LIST:COLUMN:qtyNok")},{id:"errorCategory",tdClassName:"is-min",thClassName:"is-filter"},{id:"faultCode",tdClassName:"is-min",thClassName:"is-filter"},{id:"correctiveAction",label:i("PROPERTY:correctiveActions"),noData:"",thClassName:"is-filter"}),t},serializeRows:function(){var e={dateFormat:"L",today:t.getMoment().startOf("day").hours(6).valueOf()};return this.collection.map(function(i){return i.serializeRow(n,e)})},serializeActions:function(){var e=this.collection;return function(t){var a=e.get(t._id),r=[s.actions.viewDetails(a)],n=a.url()+".pdf";return r.push({id:"print",icon:"print",label:i(a.getNlsDomain(),"PAGE_ACTION:print"),href:n,className:a.get("ok")?"disabled":""}),a.canEdit()&&r.push(s.actions.edit(a)),a.canDelete()&&r.push(s.actions.delete(a)),r}},afterRender:function(){s.prototype.afterRender.call(this);var e=this;this.$el.popover({selector:".list-item > td",container:this.el,trigger:"hover",placement:"auto left",html:!0,content:function(){var i=e.$el.data("bs.popover").tip().removeClass("is-correctiveAction"),t=e.collection.get(this.parentNode.dataset.id);if("faultCode"===this.dataset.id)return t.get("faultDescription");if("correctiveAction"===this.dataset.id){var s=t.get("correctiveActions");if(s&&s.length)return i.addClass("is-correctiveAction"),l({bordered:!1,correctiveActions:t.serializeCorrectiveActions(n)})}}}).on("shown.bs.popover",function(i){e.$el.find(".popover").toggleClass("is-correctiveAction","correctiveAction"===i.target.dataset.id)})}})});