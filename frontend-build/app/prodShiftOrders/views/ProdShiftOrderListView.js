// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/user","app/viewport","app/core/views/ListView","app/data/prodLines","app/data/views/renderOrgUnitPath"],function(e,t,r,i,o){return r.extend({remoteTopics:{"prodShiftOrders.created.*":"refreshIfMatches","prodShiftOrders.updated.*":"refreshIfMatches","prodShiftOrders.deleted.*":"refreshIfMatches"},columns:["mrpControllers","prodFlow","prodLine","order","operation","prodShift","startedAt","duration","quantityDone","workerCount"],serializeRow:function(e){return e.serialize({orgUnits:!0})},serializeActions:function(){var e=this.collection;return function(t){return[r.actions.viewDetails(e.get(t._id))]}},afterRender:function(){r.prototype.afterRender.call(this);var e=this;this.$('.list-item > td[data-id="prodLine"]').popover({container:this.el,trigger:"hover",placement:"auto right",html:!0,content:function(){var t=o(i.get(e.$(this).text().trim()),!1,!1);return t?t.split(" \\ ").join("<br>\\ "):"?"}})},refreshIfMatches:function(e){this.collection.hasOrMatches(e)&&this.refreshCollection()}})});