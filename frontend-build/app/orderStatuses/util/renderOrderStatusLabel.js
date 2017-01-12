// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/util/colorLabel","app/data/orderStatuses"],function(t,e){"use strict";return function(r){return"string"==typeof r&&(r=e.get(r).attributes),t({className:"orderStatus",label:r._id,title:r.label,color:r.color})}});