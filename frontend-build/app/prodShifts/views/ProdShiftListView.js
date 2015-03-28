// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/ListView","app/data/prodLines","app/data/views/renderOrgUnitPath"],function(e,i,t){return e.extend({className:"is-clickable",remoteTopics:{"prodShifts.created.*":"refreshIfMatches","prodShifts.updated.*":"refreshIfMatches","prodShifts.deleted.*":"refreshIfMatches"},columns:[{id:"mrpControllers",className:"is-min"},{id:"prodFlow",className:"is-min"},{id:"prodLine",className:"is-min"},{id:"date",className:"is-min"},{id:"shift",className:"is-min"},{id:"createdAt",className:"is-min"},"creator"],serializeRow:function(e){return e.serialize({orgUnits:!0})},serializeActions:function(){var i=this.collection;return function(t){return[e.actions.viewDetails(i.get(t._id))]}},afterRender:function(){e.prototype.afterRender.call(this);var s=this;this.$('.list-item > td[data-id="prodLine"]').popover({container:this.el,trigger:"hover",placement:"auto right",html:!0,content:function(){return t(i.get(s.$(this).text().trim()),!1,!1).split(" \\ ").join("<br>\\ ")}})},refreshIfMatches:function(e){this.collection.hasOrMatches(e)&&this.refreshCollection()}})});