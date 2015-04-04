// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/time"],function(t,e){"use strict";return function(r){var n="PROGRAMMING_FAILURE"===r.text;(n||"PROGRAMMING_SUCCESS"===r.text)&&("number"==typeof r.duration&&(r.duration=e.toString(r.duration/1e3,!1,!0)),n&&(r.error=t("xiconf","error:"+r.errorCode)));var o=e.getMoment(r.time);return{datetime:o.toISOString(),time:o.format("HH:mm:ss.SSS"),text:t("xiconf","log:"+r.text,r)}}});