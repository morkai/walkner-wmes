// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model","app/core/util/colorLabel"],function(o,r){"use strict";return o.extend({urlRoot:"/cagGroups",clientUrlRoot:"#cagGroups",topicPrefix:"cagGroups",privilegePrefix:"REPORTS",nlsDomain:"cagGroups",labelAttribute:"name",defaults:{color:"#FFFFFF"},serialize:function(){var o=this.toJSON();return o.color=r(o.color),o.cags=o.cags.join(", "),o}})});