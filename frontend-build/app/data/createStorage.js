// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/time","app/broker","app/pubsub"],function(e,t,d){"use strict";return function(n,o,a){function i(){localStorage.setItem(n,JSON.stringify({time:Date.now(),data:c.models})),t.publish(o+".synced")}var r={time:e.appData,data:window[n]||[]},s=JSON.parse(localStorage.getItem(n)||"null"),u=s&&s.time>r.time?s:r,c=new a(u.data);return u===r&&i(),c.on("add",i),c.on("remove",i),c.on("destroy",i),c.on("change",i),c.on("sync",i),d.subscribe(o+".added",function(e){c.add(e.model)}),d.subscribe(o+".edited",function(e){var t=c.get(e.model._id);t?t.set(e.model):c.add(e.model)}),d.subscribe(o+".deleted",function(e){c.remove(e.model._id)}),c}});