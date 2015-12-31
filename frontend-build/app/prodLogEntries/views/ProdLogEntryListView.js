// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/user","app/viewport","app/core/views/ListView","app/data/prodLines","app/data/views/renderOrgUnitPath"],function(e,i,t,r,n){"use strict";return t.extend({remoteTopics:{"production.synced.**":"refreshCollection","production.edited.**":function(){this.refreshCollection()}},columns:[{id:"prodLine",className:"is-min"},{id:"type",className:"is-min"},"data",{id:"prodShift",className:"is-min"},{id:"prodShiftOrder",className:"is-min"},{id:"createdAt",className:"is-min"},{id:"creator",className:"is-min"},{id:"instanceId",className:"is-min"}],serializeActions:function(){return null},afterRender:function(){t.prototype.afterRender.call(this);var e=this;this.$('.list-item > td[data-id="prodLine"]').popover({container:this.el,trigger:"hover",placement:"auto right",html:!0,content:function(){var i=n(r.get(e.$(this).text().trim()),!1,!1);return i?i.split(" \\ ").join("<br>\\ "):"?"}})},refreshCollection:function(e){return!e||this.collection.matches(e)?t.prototype.refreshCollection.apply(this,arguments):void 0}})});