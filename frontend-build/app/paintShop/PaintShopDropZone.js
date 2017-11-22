// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Model"],function(t){"use strict";function e(t){return t._id.date+"~"+t._id.mrp}return t.extend({nlsDomain:"paintShop"},{id:e,parse:function(t){return{_id:e(t),date:t._id.date,mrp:t._id.mrp,state:t.state}}})});