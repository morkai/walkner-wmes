// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/pages/DetailsPage","app/opinionSurveys/dictionaries","app/opinionSurveyScanTemplates/templates/details"],function(e,t,a){"use strict";return e.extend({detailsTemplate:a,baseBreadcrumb:!0,destroy:function(){e.prototype.destroy.call(this),t.unload()},load:function(e){return e(this.model.fetch(),t.load())},afterRender:function(){e.prototype.afterRender.call(this),t.load()}})});