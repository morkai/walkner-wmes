define(["app/time","app/broker","app/pubsub"],function(e,t,i){return function(n,o,r){function a(){localStorage.setItem(n,JSON.stringify({time:Date.now(),data:u.models})),t.publish(o+".synced")}var s=window[n]||[],l=JSON.parse(localStorage.getItem(n)||"null");(!l||navigator.onLine)&&(l={time:e.appData,data:s},localStorage.setItem(n,JSON.stringify(l)));var c=l.time>s.time?l:s,u=new r(c);return u.on("add",a),u.on("remove",a),u.on("destroy",a),u.on("change",a),u.on("sync",a),i.subscribe(o+".added",function(e){u.add(e.model)}),i.subscribe(o+".edited",function(e){var t=u.get(e.model._id);t?t.set(e.model):u.add(e.model)}),i.subscribe(o+".deleted",function(e){u.remove(e.model._id)}),u}});