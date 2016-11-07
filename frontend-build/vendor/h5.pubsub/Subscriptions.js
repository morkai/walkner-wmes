define(["require","exports","module"],function(i,s,t){"use strict";function e(i){this.messageBroker=i,this.children={},this.subscriptions=[],this.subscriptionsPendingRemoval=[],this.sendingMessagesCount=0,this.removeSubscription=this.removeSubscription.bind(this)}t.exports=e;var n=[];e.TOKEN={SEPARATOR:".",ANY:"*",ALL:"**"},e.prototype.destroy=function(){for(var i=this.children,s=Object.keys(i),t=0,e=s.length;e>t;++t)i[s[t]].destroy();this.children=null,this.removeSubscriptions(),this.subscriptionsPendingRemoval=null,this.messageBroker=null},e.prototype.count=function(i,s){this.subscriptions.length&&(s[i]=this.subscriptions.length);var t=Object.keys(this.children),n=t.length;if(n){0!==i.length&&(i+=e.TOKEN.SEPARATOR);for(var o=0;n>o;++o){var r=t[o];this.children[r].count(i+r,s)}}},e.prototype.add=function(i){var s=this.splitTopic(i.getTopic());this.addSubscription(s,i)},e.prototype.remove=function(i){this.removeSubscriptions(this.splitTopic(i))},e.prototype.send=function(i,s,t){var e=this.splitTopic(i);this.sendMessage(e,i,s,t)},e.prototype.addSubscription=function(i,s){if(0===i.length)return this.subscriptions.push(s),s.on("cancel",this.removeSubscription),void(1===this.subscriptions.length&&this.messageBroker.emit("new topic",s.getTopic()));var t=this.children,n=i.shift();"undefined"==typeof t[n]&&(t[n]=new e(this.messageBroker)),t[n].addSubscription(i,s)},e.prototype.removeSubscriptions=function(i){var s,t;if("undefined"==typeof i||0===i.length){var e=this.subscriptions;if(!e.length)return;this.subscriptions=[];var n=e[0].getTopic();for(s=0,t=e.length;t>s;++s)e[s].cancel();return void this.messageBroker.emit("empty topic",n)}var o=i.shift();"undefined"!=typeof this.children[o]&&this.children[o].removeSubscriptions(i)},e.prototype.sendMessage=function(i,s,t,o){if(++this.sendingMessagesCount,"undefined"!=typeof this.children[e.TOKEN.ALL]&&this.children[e.TOKEN.ALL].sendMessage(n,s,t,o),0===i.length)for(var r=0,h=this.subscriptions.length;h>r;++r)this.subscriptions[r].send(s,t,o);else{var c=i.shift();"undefined"!=typeof this.children[e.TOKEN.ANY]&&this.children[e.TOKEN.ANY].sendMessage([].concat(i),s,t,o),"undefined"!=typeof this.children[c]&&this.children[c].sendMessage(i,s,t,o)}--this.sendingMessagesCount,this.removePendingSubscriptions()},e.prototype.splitTopic=function(i){var s=i.split(e.TOKEN.SEPARATOR).filter(function(i){return 0!==i.length});if(0===s.length)throw new Error("Invalid subscription topic: "+i);return s},e.prototype.removeSubscription=function(i){return this.messageBroker.emit("cancel",i),0!==this.subscriptions.length?1===this.subscriptions.length&&this.subscriptions[0]===i?(this.subscriptions.length=0,void this.messageBroker.emit("empty topic",i.getTopic())):void this.removeOrQueueRemoval(i):void 0},e.prototype.removeOrQueueRemoval=function(i){0===this.sendingMessagesCount?this.subscriptions.splice(this.subscriptions.indexOf(i),1):this.subscriptionsPendingRemoval.push(i)},e.prototype.removePendingSubscriptions=function(){var i=this.subscriptionsPendingRemoval,s=i.length;if(s&&!this.sendingMessagesCount){var t=this.subscriptions;if(s===t.length)return i.length=0,void(t.length=0);var e,n,o=[];for(e=0;s>e;++e)o.push(t.indexOf(i[e]));for(o.sort(function(i,s){return s-i}),e=0,n=o.length;n>e;++e)t.splice(o[e],1);i.length=0}}});