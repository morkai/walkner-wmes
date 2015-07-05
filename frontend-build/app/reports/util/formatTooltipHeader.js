// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/time"],function(e,t){"use strict";return function(r){var o,i=t.getMoment("number"==typeof r?r:r.x),u=(this.model.query?this.model.query.get("interval"):this.model.get("interval"))||"day";return"shift"===u?o={shift:e("core","SHIFT:"+(6===i.hours()?1:14===i.hours()?2:3))}:"quarter"===u&&(o={quarter:e("core","QUARTER:"+i.quarter())}),i.format(e("reports","tooltipHeaderFormat:"+u,o))}});