// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time","app/core/views/ListView"],function(i,s){"use strict";return s.extend({className:"is-clickable licenses-list",columns:[{id:"_id",className:"is-min licenses-id"},{id:"appName",className:"is-min"},{id:"appVersion",className:"is-min"},{id:"date",className:"is-min"},{id:"expireDate",thAttrs:'class="is-min"',tdAttrs:function(s){var e=i.getMoment(s.expireDate,"YYYY-MM-DD"),a=e.isValid()&&e.diff()<=0?"licenses-invalid":"";return'class="is-min '+a+'"'}},{id:"features",className:"is-min"},"licensee"]})});