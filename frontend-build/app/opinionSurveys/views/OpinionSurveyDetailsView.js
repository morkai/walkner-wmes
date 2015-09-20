// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/core/views/DetailsView","../dictionaries","app/opinionSurveys/templates/details"],function(e,t,n,i){"use strict";return t.extend({template:i,events:e.extend({},t.prototype.events),afterRender:function(){t.prototype.afterRender.call(this)}})});