// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/data/views/renderOrgUnitPath","app/core/views/ListView"],function(t,i){return i.extend({columns:["orgUnitPath","_id","description"],serializeRows:function(){return this.collection.map(function(i){var n=i.toJSON();return n.orgUnitPath=t(i,!0),n})}})});