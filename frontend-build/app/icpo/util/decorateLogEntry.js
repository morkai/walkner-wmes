// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/time"],function(t,e){"use strict";return function(r){var o="PROGRAMMING_FAILURE"===r.text;(o||"PROGRAMMING_SUCCESS"===r.text)&&("number"==typeof r.duration&&(r.duration=e.toString(r.duration/1e3,!1,!0)),o&&(r.error=t("icpo","error:"+r.errorCode)));var i=e.getMoment(r.time);return{datetime:i.toISOString(),time:i.format("HH:mm:ss.SSS"),text:t("icpo","log:"+r.text,r)}}});