// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Model"],function(t){"use strict";return t.extend({getActualOrderData:function(){return this.pick(["quantityTodo","quantityDone","statuses"])}})});