// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../settings/SettingCollection","./OpinionSurveySetting"],function(e,n){"use strict";return e.extend({model:n,topicSuffix:"opinionSurveys.**",getValue:function(e){var n=this.get("opinionSurveys."+e);return n?n.getValue():null},prepareValue:function(e,n){return parseInt(n,10)||0},getPositiveAnswersReference:function(){return this.getValue("positiveAnswersReference")||0},getResponseReference:function(){return this.getValue("responseReference")||0}})});