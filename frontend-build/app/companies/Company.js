// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model"],function(e){return e.extend({urlRoot:"/companies",clientUrlRoot:"#companies",topicPrefix:"companies",privilegePrefix:"DICTIONARIES",nlsDomain:"companies",labelAttribute:"name",defaults:{name:null,fteMasterPosition:-1,fteLeaderPosition:-1},toJSON:function(){var t=e.prototype.toJSON.call(this);return t.name||(t.name=t._id),t}})});