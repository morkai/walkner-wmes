// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/FilterView","app/kaizenOrders/templates/filter"],function(e,t){"use strict";return e.extend({template:t,defaultFormData:{},termToForm:{"":function(e,t,r){r[e]=""}},afterRender:function(){e.prototype.afterRender.call(this)},serializeFormToQuery:function(){}})});