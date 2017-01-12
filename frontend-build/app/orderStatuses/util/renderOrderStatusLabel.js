// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/util/colorLabel","app/data/orderStatuses"],function(t,e){"use strict";return function(r){if("string"==typeof r){var a=e.get(r);r=a?a.attributes:{_id:r,label:r,color:"#999999"}}return t({className:"orderStatus",label:r._id,title:r.label,color:r.color})}});