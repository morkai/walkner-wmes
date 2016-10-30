// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n"],function(e,n){"use strict";return function(i,r){var o="?";if(n.has("opinionSurveyScanTemplates","regionType:"+r))o=n("opinionSurveyScanTemplates","regionType:"+r);else{var s=i?i.questions||i.get("questions"):[],t=e.find(s,{_id:r});t&&(o=t.short)}return o}});