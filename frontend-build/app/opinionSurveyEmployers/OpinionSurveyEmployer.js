// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model","app/core/templates/colorLabel"],function(o,e){"use strict";return o.extend({urlRoot:"/opinionSurveys/employers",clientUrlRoot:"#opinionSurveyEmployers",topicPrefix:"opinionSurveys.employers",privilegePrefix:"OPINION_SURVEYS",nlsDomain:"opinionSurveyEmployers",labelAttribute:"short",serialize:function(){var o=this.toJSON();return o.color=e({color:o.color}),o}})});