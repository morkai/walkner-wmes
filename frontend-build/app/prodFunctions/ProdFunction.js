// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model"],function(t){return t.extend({urlRoot:"/prodFunctions",clientUrlRoot:"#prodFunctions",topicPrefix:"prodFunctions",privilegePrefix:"DICTIONARIES",nlsDomain:"prodFunctions",labelAttribute:"label",defaults:function(){return{label:"",fteMasterPosition:-1,direct:!1,companies:[]}},toJSON:function(){var e=t.prototype.toJSON.call(this);return e.label||(e.label=e._id),e}})});