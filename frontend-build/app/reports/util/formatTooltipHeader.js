// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/time"],function(t,e){return function(r){var o,n=e.getMoment("number"==typeof r?r:r.x),i=this.model.query.get("interval");return"shift"===i&&(o={shift:t("core","SHIFT:"+(6===n.hours()?1:14===n.hours()?2:3))}),n.format(t("reports","tooltipHeaderFormat:"+i,o))}});