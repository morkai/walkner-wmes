define(["underscore","app/i18n","app/user","app/viewport","app/core/views/ListView","app/data/prodLines","app/data/views/renderOrgUnitPath","./decorateProdShiftOrder"],function(e,t,n,r,i,o,a,s){return i.extend({remoteTopics:{"prodShiftOrders.created.**":function(e){this.collection.matches(e)&&this.refreshCollection()},"prodShiftOrders.updated.**":function(e,t){var n=this.collection.get(t.split(".").slice(2).join("."));n&&this.refreshCollection()}},columns:["mrpControllers","prodFlow","prodLine","order","operation","prodShift","startedAt","duration","quantityDone","workerCount"],serializeRows:function(){return this.collection.map(function(e){return s(e,{orgUnits:!0})})},serializeActions:function(){var e=this.collection;return function(t){return[i.actions.viewDetails(e.get(t._id))]}},afterRender:function(){i.prototype.afterRender.call(this);var e=this;this.$('.list-item > td[data-id="prodLine"]').popover({container:this.el,trigger:"hover",placement:"auto right",html:!0,content:function(){var t=a(o.get(e.$(this).text().trim()),!1,!1);return t?t.split(" \\ ").join("<br>\\ "):"?"}})}})});