define(["underscore","socket.io","app/broker","app/core/Socket"],function(n,e,o,c){function t(n){""!==n||s||(i.off("error",t),i.reconnect())}var i=new c(e.connect("",{resource:"socket.io",transports:["websocket"],"auto connect":!1,"connect timeout":5e3,reconnect:!0,"reconnection delay":n.random(100,500),"reconnection limit":n.random(4e3,8e3),"max reconnection attempts":1/0})),s=!1,r=!1;return i.on("connecting",function(){o.publish("socket.connecting",!1)}),i.on("connect",function(){s||(s=!0,o.publish("socket.connected"))}),i.on("connect_failed",function(){o.publish("socket.connectFailed",!1)}),i.on("message",function(n){o.publish("socket.message",n)}),i.on("disconnect",function(){o.publish("socket.disconnected")}),i.on("reconnecting",function(){r=!0,o.publish("socket.connecting",!0)}),i.on("reconnect",function(){r=!1,o.publish("socket.connected",!0)}),i.on("reconnect_failed",function(){r=!1,o.publish("socket.connectFailed",!0)}),i.on("error",t),i.on("error",function(){r&&o.publish("socket.connectFailed",!0)}),window.socket=i,i});