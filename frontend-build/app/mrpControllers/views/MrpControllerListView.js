// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/user","app/data/views/renderOrgUnitPath","app/core/views/ListView"],function(i,n,e,t){return t.extend({columns:["subdivision","_id","description"],serializeRows:function(){return this.collection.map(function(i){var n=i.toJSON();return n.subdivision=e(i,!0),n})}})});