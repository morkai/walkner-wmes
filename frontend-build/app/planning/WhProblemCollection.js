define(["../core/Collection","./WhOrderStatus"],function(e,r){"use strict";return e.extend({model:r,paginate:!1,url:function(){return"/old/wh/orders?select(order,lines._id)&limit(0)&status=problem"},parse:function(e){const r=[];return(e.collection||[]).forEach(e=>{e.lines.forEach(t=>{r.push({_id:`${e.order}_${t._id}`,order:e.order,line:t._id})})}),r},isProblem:function(e,r){return!!this.get(`${r}_${e}`)},handleChange:function(e){null!=e.state&&null!=e.order?e.state?this.add({_id:`${e.order}_${e.line}`,order:e.order,line:e.line}):this.remove(`${e.order}_${e.line}`):this.fetch()}})});