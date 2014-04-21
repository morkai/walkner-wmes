// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","visibly","app/broker"],function(i,e,n){var b={visible:!e.hidden()};return e.onVisible(function(){b.visible=!0,n.publish("visibility.visible",b)}),e.onHidden(function(){b.visible=!1,n.publish("visibility.hidden",b)}),b});