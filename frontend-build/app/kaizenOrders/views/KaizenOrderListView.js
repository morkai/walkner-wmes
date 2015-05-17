// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/ListView"],function(i){"use strict";return i.extend({className:"kaizenOrders-list is-clickable",serializeColumns:function(){var i=[{id:"rid",className:"is-min is-number"},{id:"types",className:"is-min"},{id:"status",className:"is-min"},{id:"eventDate",className:"is-min"},{id:"area"},{id:"cause"},{id:"risk"},{id:"nearMissCategory"},{id:"suggestionCategory"},"creator","updatedAt"];return i}})});