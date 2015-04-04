// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/time"],function(r,t){"use strict";return function(e){var o,u=t.getMoment("number"==typeof e?e:e.x),i=this.model.query.get("interval");return"shift"===i?o={shift:r("core","SHIFT:"+(6===u.hours()?1:14===u.hours()?2:3))}:"quarter"===i&&(o={quarter:r("core","QUARTER:"+u.quarter())}),u.format(r("reports","tooltipHeaderFormat:"+i,o))}});