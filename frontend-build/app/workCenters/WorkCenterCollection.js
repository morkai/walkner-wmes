// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./WorkCenter"],function(e,r){"use strict";return e.extend({model:r,rqlQuery:"select(mrpController,prodFlow,description,deactivatedAt)&sort(_id)",comparator:"_id"})});