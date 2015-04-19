// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/time","app/core/views/FormView","app/licenses/templates/form"],function(e,t,i,r){"use strict";return i.extend({template:r,serializeToForm:function(){var e=this.model.toJSON();return e.date=t.format(e.date,"YYYY-MM-DD"),e},serializeForm:function(t){return t._id=!t._id||e.isEmpty(t._id.trim())?null:t._id,t.appVersion=e.isEmpty(t.appVersion)?"*":t.appVersion,t.date=e.isEmpty(t.date)?null:t.date,t}})});