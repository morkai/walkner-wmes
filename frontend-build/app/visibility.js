define(["jquery","visibly","app/broker"],function(i,e,n){var b={visible:!e.hidden()};return e.onVisible(function(){b.visible=!0,n.publish("visibility.visible",b)}),e.onHidden(function(){b.visible=!1,n.publish("visibility.hidden",b)}),b});