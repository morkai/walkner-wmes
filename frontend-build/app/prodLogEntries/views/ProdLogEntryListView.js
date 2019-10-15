define(["underscore","app/user","app/viewport","app/core/views/ListView","app/data/prodLines","app/data/clipboard","app/orgUnits/util/renderOrgUnitPath"],function(t,e,i,s,n,r,a){"use strict";return s.extend({className:"",remoteTopics:{"production.synced.**":"refreshCollection","production.edited.**":function(){this.refreshCollection()}},events:t.assign({'click td[data-id="creator"]':function(t){var e=this,i=e.collection.get(e.$(t.target).closest(".list-item")[0].dataset.id).get("creator");i&&i.ip&&r.copy(function(s){s.setData("text/plain",i.ip),r.showTooltip(e,t.currentTarget,t.pageX,t.pageY,{title:e.t("ipCopied",{ip:i.ip})})})}},s.prototype.events),columns:function(){return[{id:"prodLine",className:"is-min"},{id:"station",className:"is-min is-number",label:this.t("list:station"),thAttrs:{title:this.t("PROPERTY:station")}},{id:"type",className:"is-min"},"data",{id:"prodShift",className:"is-min"},{id:"prodShiftOrder",className:"is-min"},{id:"createdAt",className:"is-min"},{id:"creator",className:"is-min"},{id:"instanceId",className:"is-min"}]},serializeActions:function(){return null},afterRender:function(){var t=this;s.prototype.afterRender.apply(t,arguments),t.$('.list-item > td[data-id="prodLine"]').popover({container:this.el,trigger:"hover",placement:"auto right",html:!0,content:function(){var e=a(n.get(t.$(this).text().trim()),!1,!1);return e?e.split(" \\ ").join("<br>\\ "):"?"}})},refreshCollection:function(t){if(!t||this.collection.matches(t))return s.prototype.refreshCollection.apply(this,arguments)}})});