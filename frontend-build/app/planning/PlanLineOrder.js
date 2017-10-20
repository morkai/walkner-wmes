// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Model","./util/shift"],function(t,e){"use strict";return t.extend({getShiftNo:function(){return e.getShiftNo(this.get("startAt"))}})});