// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model","app/core/util/colorLabel"],function(e,o){"use strict";return e.extend({urlRoot:"/companies",clientUrlRoot:"#companies",topicPrefix:"companies",privilegePrefix:"DICTIONARIES",nlsDomain:"companies",labelAttribute:"name",defaults:{name:null,color:"#000000"},serialize:function(){var e=this.toJSON();return e.name||(e.name=e._id),e.color=o(e.color),e}})});