define(["underscore","jquery","app/i18n","app/time","app/core/views/ListView","app/core/util/html2pdf","app/printers/views/PrinterPickerView","../dictionaries","app/qiResults/templates/correctiveActionsTable"],function(t,e,i,s,r,a,n,o,l){"use strict";return r.extend({className:"qiResults-list is-clickable is-colored",events:t.assign({"click .action-print":function(t){var e=this,i=e.collection.get(this.$(t.target).closest("tr").attr("data-id"));return t.listAction={view:e,tag:"qi"},n.listAction(t,function(t){e.ajax({url:i.url()+".html",dataType:"html"}).done(function(e){a(e,{orientation:"landscape"},t)})}),!1},"click .is-filter":function(t){this.trigger("showFilter",t.currentTarget.dataset.columnId)}},r.prototype.events),destroy:function(){this.$el.popover("destroy")},serializeColumns:function(){var t=this.collection.hasAnyNokResult(),e=[{id:"rid",tdClassName:"is-min is-number",thClassName:"is-filter"},{id:"orderNo",tdClassName:"is-min is-number",thClassName:"is-filter"},{id:"nc12",tdClassName:"is-min is-number",thClassName:"is-filter"},{id:"productFamily",tdClassName:"is-overflow w75",thClassName:"is-filter"},{id:"productName"},{id:"division",tdClassName:"is-min",thClassName:"is-filter"},{id:"line",tdClassName:"is-min",thClassName:"is-filter"},{id:"kind",thClassName:"is-filter"},{id:"inspectedAt",tdClassName:"is-min",thClassName:"is-filter"},{id:"inspector",thClassName:"is-filter"}];return t&&e.push({id:"nokOwner",thClassName:"is-filter"}),e.push({id:"qtyOrder",tdClassName:"is-min is-number"},{id:"qtyInspected",tdClassName:"is-min is-number"}),t&&e.push({id:"qtyNokInspected",tdClassName:"is-min is-number"},{id:"qtyToFix",tdClassName:"is-min is-number"},{id:"qtyNok",tdClassName:"is-min is-number"},{id:"errorCategory",tdClassName:"is-min",thClassName:"is-filter"},{id:"faultCode",tdClassName:"is-min has-popover",thClassName:"is-filter"},{id:"correctiveAction",label:this.t("PROPERTY:correctiveActions"),noData:"",thClassName:"is-filter",tdClassName:"has-popover"}),e},serializeRows:function(){var t={dateFormat:"L",today:s.getMoment().startOf("day").hours(6).valueOf()};return this.collection.map(function(e){return e.serializeRow(o,t)})},serializeActions:function(){var t=this;return function(e){var i=t.collection.get(e._id),s=[r.actions.viewDetails(i)],a=i.url()+".pdf";return s.push({id:"print",icon:"print",label:t.t("PAGE_ACTION:print"),href:a,className:i.get("ok")?"disabled":""}),i.canEdit()&&s.push(r.actions.edit(i)),i.canDelete()&&s.push(r.actions.delete(i)),s}},afterRender:function(){var t=this;r.prototype.afterRender.apply(t,arguments),t.$el.popover({selector:".has-popover",container:this.el,trigger:"hover",placement:"auto left",html:!0,content:function(){var e=t.$el.data("bs.popover").tip().removeClass("is-correctiveAction"),i=t.collection.get(this.parentNode.dataset.id);if("faultCode"===this.dataset.id)return i.get("faultDescription");if("correctiveAction"===this.dataset.id){var s=i.get("correctiveActions");if(s&&s.length)return e.addClass("is-correctiveAction"),t.renderPartialHtml(l,{bordered:!1,correctiveActions:i.serializeCorrectiveActions(o)})}},template:function(){return e(e.fn.popover.Constructor.DEFAULTS.template).addClass("qiResults-list-popover").toggleClass("is-correctiveAction","correctiveAction"===this.dataset.id)}})}})});