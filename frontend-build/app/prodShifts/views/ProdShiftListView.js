// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/views/ListView","app/data/prodLines","app/data/views/renderOrgUnitPath"],function(e,t,i){"use strict";return e.extend({className:"prodShifts-list is-clickable",remoteTopics:{"prodShifts.created.*":"refreshIfMatches","prodShifts.updated.*":"refreshIfMatches","prodShifts.deleted.*":"refreshIfMatches"},columns:[{id:"mrpControllers",className:"is-min"},{id:"prodFlow",className:"is-min"},{id:"prodLine",className:"is-min"},{id:"date",className:"is-min"},{id:"shift",className:"is-min"},{id:"createdAt",className:"is-min"},"creator"],serializeRow:function(e){return e.serialize({orgUnits:!0})},serializeActions:function(){var t=this.collection;return function(i){return[e.actions.viewDetails(t.get(i._id))]}},afterRender:function(){e.prototype.afterRender.call(this);var s=this;this.$('.list-item > td[data-id="prodLine"]').popover({container:this.el,trigger:"hover",placement:"auto right",html:!0,content:function(){return i(t.get(s.$(this).text().trim()),!1,!1).split(" \\ ").join("<br>\\ ")}})},refreshIfMatches:function(e){this.collection.hasOrMatches(e)&&this.refreshCollection()}})});