// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","h5.pubsub/MessageBroker","app/broker","app/socket"],function(e,u,s,n){"use strict";function i(u,n,i){if(n)return void s.publish("pubsub.subscribeFailed",{err:n,topics:u});i.length>0&&s.publish("pubsub.subscribeNotAllowed",{topics:i});var b=e.difference(u,i);b.length>0&&s.publish("pubsub.subscribed",{topics:b})}function b(){n.isConnected()&&n.emit("pubsub.subscribe",c,i.bind(null,c)),c=[],l=null}function t(){var e=Object.keys(p);n.isConnected()&&n.emit("pubsub.unsubscribe",e),p={},r=null,s.publish("pubsub.unsubscribed",{topics:e})}var o=new u,p={},c=[],l=null,r=null;return o.on("new topic",function(e){"undefined"!=typeof p[e]&&delete p[e],n.isConnected()&&(c.push(e),null===l&&(l=setTimeout(b,0)))}),o.on("empty topic",function(e){n.isConnected()&&(p[e]=!0,null===r&&(r=setTimeout(t,0)))}),o.on("message",function(e,u,i){i.remote!==!0&&n.emit("pubsub.publish",e,u,i,function(n){n?s.publish("pubsub.publishFailed",{err:n,topic:e,message:u,meta:i}):s.publish("pubsub.published",{topic:e,message:u,meta:i})})}),n.on("connect",function(){var e=Object.keys(o.count());e.length&&n.emit("pubsub.subscribe",e,i.bind(null,e))}),n.on("pubsub.message",function(e,u,s){s.remote=!0,s.json&&"string"==typeof u&&(u=JSON.parse(u)),o.publish(e,u,s)}),window.pubsub=o,o});