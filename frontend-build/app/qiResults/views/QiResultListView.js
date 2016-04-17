// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/core/views/ListView","../dictionaries"],function(i,e,t,s){"use strict";return t.extend({className:"qiResults-list is-clickable is-colored",serializeColumns:function(){var i=[{id:"rid",tdClassName:"is-min is-number"},{id:"orderNo",tdClassName:"is-min is-number"},{id:"nc12",tdClassName:"is-min is-number"},{id:"productFamily",tdClassName:"is-min"},"productName",{id:"division",tdClassName:"is-min",label:e("qiResults","LIST:COLUMN:division")},"kind",{id:"inspectedAt",tdClassName:"is-min"},"inspector",{id:"qtyInspected",tdClassName:"is-min is-number",label:e("qiResults","LIST:COLUMN:qtyInspected")}];return this.collection.hasAnyNokResult()&&i.push({id:"qtyToFix",tdClassName:"is-min is-number",label:e("qiResults","LIST:COLUMN:qtyToFix")},{id:"qtyNok",tdClassName:"is-min is-number",label:e("qiResults","LIST:COLUMN:qtyNok")},{id:"errorCategory",tdClassName:"is-min"},{id:"faultCode",tdClassName:"is-min"}),i},serializeRow:function(i){return i.serializeRow(s,{})},serializeActions:function(){var i=this.collection;return function(e){var s=i.get(e._id),n=[t.actions.viewDetails(s)];return s.canEdit()&&n.push(t.actions.edit(s)),s.canDelete()&&n.push(t.actions["delete"](s)),n}},afterRender:function(){t.prototype.afterRender.call(this);var i=this;this.$el.popover({selector:".list-item > td",container:this.el,trigger:"hover",placement:"auto left",html:!0,content:function(){var e=i.collection.get(this.parentNode.dataset.id);return"faultCode"===this.dataset.id?e.get("faultDescription"):void 0}})}})});