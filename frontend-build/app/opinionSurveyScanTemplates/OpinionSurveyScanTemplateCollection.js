// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./OpinionSurveyScanTemplate"],function(e,n){"use strict";return e.extend({model:n,rqlQuery:"limit(15)&sort(-survey)"})});