// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/user","app/core/views/ListView"],function(i,e){"use strict";return e.extend({className:"is-clickable",serializeColumns:function(){var e=[{id:"vendor",className:"is-min"},{id:"nc12",className:"is-min"},{id:"value",className:"is-min"},"unit"];return i.data.vendor&&e.shift(),e}})});