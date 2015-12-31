// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./LossReason"],function(e,o){"use strict";return e.extend({model:o,rqlQuery:"select(label,position)&sort(position)"})});