// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/core/views/FormView","app/xiconfHidLamps/templates/form"],function(e,t,r){"use strict";return t.extend({template:r,events:e.assign({"blur #-_id":function(e){e.target.value=e.target.value.replace(/^0+/,"")}},t.prototype.events)})});