// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/i18n"],function(e,n){"use strict";return function(i,r){var o="?";if(n.has("opinionSurveyScanTemplates","regionType:"+r))o=n("opinionSurveyScanTemplates","regionType:"+r);else{var s=i?i.questions||i.get("questions"):[],t=e.find(s,{_id:r});t&&(o=t["short"])}return o}});