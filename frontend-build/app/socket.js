define(["underscore","socket.io","app/broker","app/core/Socket"],function(n,o,e,c){"use strict";var t=new c(o({path:"/sio",transports:["websocket"],timeout:1e4,reconnectionDelay:500,autoConnect:!1,query:window.WMES_GET_COMMON_HEADERS?window.WMES_GET_COMMON_HEADERS():{}})),i=!1,s=!1;return t.on("connecting",function(){e.publish("socket.connecting",!1)}),t.on("connect",function(){i||(i=!0,e.publish("socket.connected",!1))}),t.on("connect_error",function(){i||e.publish("socket.connectFailed",!1)}),t.on("message",function(n){e.publish("socket.message",n)}),t.on("disconnect",function(){e.publish("socket.disconnected")}),t.on("reconnecting",function(){s=!0,e.publish("socket.connecting",!0)}),t.on("reconnect",function(){s=!1,e.publish("socket.connected",!0)}),t.on("reconnect_error",function(){s&&(s=!1,e.publish("socket.connectFailed",!0))}),t.on("error",function(){s&&e.publish("socket.connectFailed",!0)}),window.socket=t,t});