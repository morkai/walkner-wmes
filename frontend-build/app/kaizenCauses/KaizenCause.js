// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model"],function(e){"use strict";return e.extend({urlRoot:"/kaizen/causes",clientUrlRoot:"#kaizenCauses",topicPrefix:"kaizen.causes",privilegePrefix:"KAIZEN:DICTIONARIES",nlsDomain:"kaizenCauses",labelAttribute:"name",defaults:{},serialize:function(){var e=this.toJSON();return e.description||(e.description="-"),e}})});