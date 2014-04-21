// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Collection","./Setting"],function(t,e){return t.extend({model:e,rqlQuery:"select(value)",matchSettingId:null,initialize:function(t){if(t.pubsub){var e=this;t.pubsub.subscribe("settings.updated.**",function(t){var i=e.get(t._id);i?i.set(t):e.matchSettingId&&e.matchSettingId(t._id)&&e.add(t)})}}})});