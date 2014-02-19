define(["underscore","h5.pubsub/MessageBroker","app/broker","app/socket"],function(e,u,s,n){function b(u,n,b){if(n)return void s.publish("pubsub.subscribeFailed",{err:n,topics:u});b.length>0&&s.publish("pubsub.subscribeNotAllowed",{topics:b});var i=e.difference(u,b);i.length>0&&s.publish("pubsub.subscribed",{topics:i})}function i(){n.isConnected()&&n.emit("pubsub.subscribe",c,b.bind(null,c)),c=[],l=null}function t(){var e=Object.keys(p);n.isConnected()&&n.emit("pubsub.unsubscribe",e),p={},r=null,s.publish("pubsub.unsubscribed",{topics:e})}var o=new u,p={},c=[],l=null,r=null;return o.on("new topic",function(e){"undefined"!=typeof p[e]&&delete p[e],n.isConnected()&&(c.push(e),null===l&&(l=setTimeout(i,0)))}),o.on("empty topic",function(e){n.isConnected()&&(p[e]=!0,null===r&&(r=setTimeout(t,0)))}),o.on("message",function(e,u,b){b.remote!==!0&&n.emit("pubsub.publish",e,u,b,function(n){n?s.publish("pubsub.publishFailed",{err:n,topic:e,message:u,meta:b}):s.publish("pubsub.published",{topic:e,message:u,meta:b})})}),n.on("connect",function(){var e=Object.keys(o.count());e.length&&n.emit("pubsub.subscribe",e,b.bind(null,e))}),n.on("pubsub.message",function(e,u){o.publish(e,u,{remote:!0})}),window.pubsub=o,o});