// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time"],function(e){return function(t){var n=e.getMoment().hours(6).minutes(0).seconds(0).milliseconds(0);switch(t){case"year":case"quarter":case"month":case"week":n.startOf(t)}return n.valueOf()}});