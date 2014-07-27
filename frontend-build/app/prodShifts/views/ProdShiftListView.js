// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/ListView","app/data/prodLines","app/data/views/renderOrgUnitPath"],function(e,t,r){return e.extend({remoteTopics:{"prodShifts.created.*":"refreshIfMatches","prodShifts.updated.*":"refreshIfMatches","prodShifts.deleted.*":"refreshIfMatches"},columns:["mrpControllers","prodFlow","prodLine","date","shift","createdAt","creator"],serializeRow:function(e){return e.serialize({orgUnits:!0})},serializeActions:function(){var t=this.collection;return function(r){return[e.actions.viewDetails(t.get(r._id))]}},afterRender:function(){e.prototype.afterRender.call(this);var i=this;this.$('.list-item > td[data-id="prodLine"]').popover({container:this.el,trigger:"hover",placement:"auto right",html:!0,content:function(){return r(t.get(i.$(this).text().trim()),!1,!1).split(" \\ ").join("<br>\\ ")}})},refreshIfMatches:function(e){this.collection.hasOrMatches(e)&&this.refreshCollection()}})});