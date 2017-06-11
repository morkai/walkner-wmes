// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/user","app/core/pages/FilteredListPage","app/core/views/ActionFormView","../views/InvalidOrderFilterView","../views/InvalidOrderListView"],function(e,i,t,o,n,s,r){"use strict";return o.extend({FilterView:s,ListView:r,actions:function(){var t=this;return[{label:i.bound("invalidOrders","PAGE_ACTION:check"),icon:"question",privileges:"ORDERS:MANAGE",callback:t.showCheckDialog.bind(t)},{id:"-notify",icon:"envelope-o",label:i("invalidOrders","PAGE_ACTION:notify"),className:function(){return e.isEmpty(t.collection.selected)?"disabled":""},callback:t.showNotifyDialog.bind(t)},{label:i.bound("invalidOrders","PAGE_ACTION:settings"),icon:"cogs",privileges:"ORDERS:MANAGE",href:"#orders;settings?tab=iptChecker"}]},initialize:function(){this.mrps=[],o.prototype.initialize.apply(this,arguments),this.listenTo(this.collection,"selected",this.onSelected)},load:function(i){var o=this,n=o.ajax({url:"/mor/iptCheck"}).done(function(i){o.mrps.splice(0,o.mrps.length),e.forEach(i.mrpToRecipients,function(i,n){e.includes(i,t.data._id)&&o.mrps.push(n)})});return i(o.collection.fetch({reset:!0}),n)},createFilterView:function(){return new s({model:{rqlQuery:this.collection.rqlQuery,mrps:this.mrps}})},showCheckDialog:function(){n.showDialog({model:this.collection,formAction:"/invalidOrders;checkOrders",actionKey:"check",formMethod:"POST",formActionSeverity:"primary"})},showNotifyDialog:function(){var t=e.keys(this.collection.selected);if(t.length){var o=n.showDialog({model:this.collection,formAction:"/invalidOrders;notifyUsers",actionKey:"notify",formMethod:"POST",formActionSeverity:"primary",messageText:i("invalidOrders","ACTION_FORM:MESSAGE_SPECIFIC:notify",{orders:t.join(", ")}),requestData:{orders:t}});this.listenTo(o,"success",function(){this.collection.toggleSelection(null,!1)})}},onSelected:function(){this.$id("notify").toggleClass("disabled",e.isEmpty(this.collection.selected))}})});