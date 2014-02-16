define(["jquery","app/i18n","app/user","app/viewport","app/data/mrpControllers","app/core/views/ListView"],function(e,t,n,i,r,s){return s.extend({localTopics:{"mrpControllers.synced":"render"},remoteTopics:{"mechOrders.synced":"refreshCollection","mechOrders.edited":function(e){var t=e.model,n=this.collection.get(t._id);n&&t.mrp!==n.get("mrp")&&(n.set("mrp",t.mrp),this.$(".list-item[data-id="+n.id+"] > td[data-id=mrp]").html(this.prepareMrpCell(t.mrp)))}},events:{"click .mechOrders-editMrp":"showMrpEditor"},columns:["_id","name","mrp","materialNorm"],serializeActions:function(){var e=this.collection;return function(t){return[s.actions.viewDetails(e.get(t._id))]}},serializeRows:function(){var e=this,t=n.isAllowedTo("ORDERS:MANAGE");return this.collection.map(function(n){var i=n.toJSON();return t&&(i.mrp=e.prepareMrpCell(i.mrp)),i})},prepareMrpCell:function(e){var n="";return e&&(n+="<span>"+e+"</span>"),n+=' <button class="btn btn-link mechOrders-editMrp">'+t("mechOrders","list:mrp:"+(e?"edit":"set"))+"</button>"},showMrpEditor:function(n){var i=this.$(n.target).closest("td"),s=this.collection.get(i.parent().attr("data-id")),o=this,a=e('<input type="text">');i.empty().append(a),a.select2({allowClear:!0,placeholder:t("mechOrders","list:mrp:placeholder"),data:r.map(function(e){return{id:e.id,text:e.getLabel()}})}),a.on("change",function(e){var t=e.val.length?e.val:null;return t===s.get("mrp")?i.html(o.prepareMrpCell(t)):(i.html('<i class="fa fa-spinner fa-spin"></i><span>'+t+"</span>"),o.updateMrp(s,t,i),i.parent().next("tr").find(".mechOrders-editMrp").focus(),void 0)}),a.select2("open")},updateMrp:function(e,n,r){var s=e.get("mrp"),o=Date.now(),a=this.promised(e.save("mrp",n,{patch:!0})),l=this;a.then(function(){l.delay(500,o,function(){r.html(l.prepareMrpCell(n))})}),a.fail(function(){e.set("mrp",s),r.html(l.prepareMrpCell(s)),i.msg.show({type:"error",time:3e3,text:t("mechOrders","list:mrp:failure",{nc12:e.id})})})},delay:function(e,t,n){var i=Date.now()-t;i>e?n():this.timers[Math.random()]=setTimeout(n,e-i)}})});