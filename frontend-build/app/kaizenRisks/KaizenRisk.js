// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model"],function(i){"use strict";return i.extend({urlRoot:"/kaizen/risks",clientUrlRoot:"#kaizen/risks",topicPrefix:"kaizen.risks",privilegePrefix:"KAIZEN:DICTIONARIES",nlsDomain:"kaizenRisks",labelAttribute:"name",defaults:{},serialize:function(){var i=this.toJSON();return i.description||(i.description="-"),i}})});