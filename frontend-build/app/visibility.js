// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["visibly","app/broker"],function(i,e){"use strict";var n={visible:!i.hidden()};return i.onVisible(function(){n.visible=!0,e.publish("visibility.visible",n)}),i.onHidden(function(){n.visible=!1,e.publish("visibility.hidden",n)}),n});