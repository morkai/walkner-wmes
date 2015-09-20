// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Collection","./OpinionSurveyResponse"],function(e,t){"use strict";return e.extend({model:t,rqlQuery:"limit(15)&sort(-createdAt)",initialize:function(){e.prototype.initialize.apply(this,arguments),this.usedSurveyIds=[]},parse:function(t){for(var i=e.prototype.parse.call(this,t),r={},n=0;n<i.length;++n)r[i[n].survey]=1;return this.usedSurveyIds=Object.keys(r),i}})});