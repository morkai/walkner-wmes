// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time"],function(t){return function(e,n){var r=t.getMoment(e);return r.hours(1===n?6:2===n?14:22),r.add("hours",8).subtract("seconds",1),r.toDate()}});