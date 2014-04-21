// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n"],function(e){return function(i){var n=i.toJSON();return n.scheduled=e("core","BOOL:"+n.scheduled),n.auto=e("core","BOOL:"+n.auto),n.type=e("downtimeReasons","type:"+n.type),n.subdivisionTypes=n.subdivisionTypes&&n.subdivisionTypes.length?n.subdivisionTypes.map(function(i){return e("downtimeReasons","subdivisionType:"+i)}).join("; "):e("downtimeReasons","subdivisionType:none"),n}});