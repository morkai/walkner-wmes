// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/user","app/core/views/ListView"],function(i,e){"use strict";return e.extend({className:"is-clickable",serializeColumns:function(){var e=[{id:"vendor",className:"is-min"},{id:"nc12",className:"is-min"},{id:"value",className:"is-min"},"unit"];return i.data.vendor&&e.shift(),e}})});