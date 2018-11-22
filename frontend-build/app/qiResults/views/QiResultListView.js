define(["underscore","jquery","app/i18n","app/time","app/core/views/ListView","app/core/util/html2pdf","app/printers/views/PrinterPickerView","../dictionaries","app/qiResults/templates/correctiveActionsTable"],function(t,e,i,s,a,r,n,l,o){"use strict";return i=i.forDomain("qiResults"),a.extend({className:"qiResults-list is-clickable is-colored",events:t.assign({"click .action-print":function(t){var e=this,i=e.collection.get(this.$(t.target).closest("tr").attr("data-id"));return t.listAction={view:e,tag:"qi"},n.listAction(t,function(t){e.ajax({url:i.url()+".html",dataType:"html"}).done(function(e){r(e,{orientation:"landscape"},t)})}),!1},"click .is-filter":function(t){this.trigger("showFilter",t.currentTarget.dataset.columnId)}},a.prototype.events),destroy:function(){this.$el.popover("destroy")},serializeColumns:function(){var t=this.collection.hasAnyNokResult(),e=[{id:"rid",tdClassName:"is-min is-number",thClassName:"is-filter"},{id:"orderNo",tdClassName:"is-min is-number",thClassName:"is-filter"},{id:"nc12",tdClassName:"is-min is-number",thClassName:"is-filter"},{id:"productFamily",tdClassName:"is-min",thClassName:"is-filter"},"productName",{id:"division",tdClassName:"is-min",thClassName:"is-filter",label:i("LIST:COLUMN:division")},{id:"line",tdClassName:"is-min",thClassName:"is-filter"},{id:"kind",thClassName:"is-filter"},{id:"inspectedAt",tdClassName:"is-min",thClassName:"is-filter"},{id:"inspector",thClassName:"is-filter"}];return t&&e.push({id:"nokOwner",thClassName:"is-filter",label:i("LIST:COLUMN:nokOwner")}),e.push({id:"qtyOrder",tdClassName:"is-min is-number",label:i("LIST:COLUMN:qtyOrder")},{id:"qtyInspected",tdClassName:"is-min is-number",label:i("LIST:COLUMN:qtyInspected")}),t&&e.push({id:"qtyNokInspected",tdClassName:"is-min is-number",label:i("LIST:COLUMN:qtyNokInspected")},{id:"qtyToFix",tdClassName:"is-min is-number",label:i("LIST:COLUMN:qtyToFix")},{id:"qtyNok",tdClassName:"is-min is-number",label:i("LIST:COLUMN:qtyNok")},{id:"errorCategory",tdClassName:"is-min",thClassName:"is-filter"},{id:"faultCode",tdClassName:"is-min",thClassName:"is-filter"},{id:"correctiveAction",label:i("PROPERTY:correctiveActions"),noData:"",thClassName:"is-filter"}),e},serializeRows:function(){var t={dateFormat:"L",today:s.getMoment().startOf("day").hours(6).valueOf()};return this.collection.map(function(e){return e.serializeRow(l,t)})},serializeActions:function(){var t=this.collection;return function(e){var s=t.get(e._id),r=[a.actions.viewDetails(s)],n=s.url()+".pdf";return r.push({id:"print",icon:"print",label:i(s.getNlsDomain(),"PAGE_ACTION:print"),href:n,className:s.get("ok")?"disabled":""}),s.canEdit()&&r.push(a.actions.edit(s)),s.canDelete()&&r.push(a.actions.delete(s)),r}},afterRender:function(){a.prototype.afterRender.call(this);var t=this;this.$el.popover({selector:".list-item > td",container:this.el,trigger:"hover",placement:"auto left",html:!0,content:function(){var e=t.$el.data("bs.popover").tip().removeClass("is-correctiveAction"),i=t.collection.get(this.parentNode.dataset.id);if("faultCode"===this.dataset.id)return i.get("faultDescription");if("correctiveAction"===this.dataset.id){var s=i.get("correctiveActions");if(s&&s.length)return e.addClass("is-correctiveAction"),o({bordered:!1,correctiveActions:i.serializeCorrectiveActions(l)})}},template:function(){return e(e.fn.popover.Constructor.DEFAULTS.template).addClass("qiResults-list-popover").toggleClass("is-correctiveAction","correctiveAction"===this.dataset.id)}})}})});