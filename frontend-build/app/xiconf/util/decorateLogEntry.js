// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/time"],function(t,r){"use strict";return function(e){"number"==typeof e.duration&&(e.duration=r.toString(e.duration/1e3,!1,!0)),void 0!==e.errorCode&&(e.error=t("xiconf","error:"+e.errorCode));var o=r.getMoment(e.time);return{datetime:o.toISOString(),time:o.format("HH:mm:ss.SSS"),text:t("xiconf","log:"+e.text,e)}}});