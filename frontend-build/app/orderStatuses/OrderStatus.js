// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model"],function(e){return e.extend({urlRoot:"/orderStatuses",clientUrlRoot:"#orderStatuses",topicPrefix:"orderStatuses",privilegePrefix:"DICTIONARIES",nlsDomain:"orderStatuses",labelAttribute:"_id",defaults:{label:null,color:"#999999"},toJSON:function(){var t=e.prototype.toJSON.call(this);return t.label||(t.label=t._id),t}})});