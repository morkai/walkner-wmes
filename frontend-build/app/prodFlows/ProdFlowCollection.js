// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./ProdFlow"],function(e,r){"use strict";return e.extend({model:r,rqlQuery:"select(mrpController,name,deactivatedAt)&sort(name)",comparator:"name"})});