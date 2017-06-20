// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/time","app/core/views/FormView","app/licenses/templates/form"],function(e,t,i,r){"use strict";return i.extend({template:r,serializeToForm:function(){var i=this.model.toJSON();return i.date=t.format(i.date,"YYYY-MM-DD"),i.expireDate=e.isEmpty(i.expireDate)?"":t.format(i.expireDate,"YYYY-MM-DD"),i},serializeForm:function(i){i._id=!i._id||e.isEmpty(i._id.trim())?null:i._id,i.appVersion=e.isEmpty(i.appVersion)?"*":i.appVersion,i.date=e.isEmpty(i.date)?null:i.date;var r=t.getMoment(i.expireDate,"YYYY-MM-DD");return i.expireDate=r.isValid()?r.toISOString():null,i}})});