// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/user","app/core/views/ListView"],function(i,e){"use strict";return e.extend({className:"is-clickable",columns:[{id:"_id",className:"is-min"},{id:"nc12",className:"is-min"},"description"],serializeActions:function(){var s=this.collection;return function(n){var t=s.get(n._id),c=[e.actions.viewDetails(t)];return i.isAllowedTo("XICONF:MANAGE","XICONF:MANAGE:HID_LAMPS")&&c.push(e.actions.edit(t),e.actions.delete(t)),c}}})});