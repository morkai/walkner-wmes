// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/time"],function(r,e){return function(t){var o,n=e.getMoment("number"==typeof t?t:t.x),u=this.model.query.get("interval");return"shift"===u?o={shift:r("core","SHIFT:"+(6===n.hours()?1:14===n.hours()?2:3))}:"quarter"===u&&(o={quarter:r("core","QUARTER:"+n.quarter())}),n.format(r("reports","tooltipHeaderFormat:"+u,o))}});