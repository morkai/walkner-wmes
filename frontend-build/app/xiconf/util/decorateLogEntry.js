// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/time"],function(t,r){"use strict";return function(e){"number"==typeof e.duration&&(e.duration=r.toString(e.duration/1e3,!1,!0)),void 0!==e.errorCode&&(e.error=t("xiconf","error:"+e.errorCode));var o=r.getMoment(e.time);return{datetime:o.toISOString(),time:o.format("HH:mm:ss.SSS"),text:t("xiconf","log:"+e.text,e)}}});