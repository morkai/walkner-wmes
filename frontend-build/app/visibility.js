// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["visibly","app/broker"],function(i,e){"use strict";var n={visible:!i.hidden()};return i.onVisible(function(){n.visible=!0,e.publish("visibility.visible",n)}),i.onHidden(function(){n.visible=!1,e.publish("visibility.hidden",n)}),n});