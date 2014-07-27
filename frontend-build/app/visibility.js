// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["visibly","app/broker"],function(i,n){var e={visible:!i.hidden()};return i.onVisible(function(){e.visible=!0,n.publish("visibility.visible",e)}),i.onHidden(function(){e.visible=!1,n.publish("visibility.hidden",e)}),e});