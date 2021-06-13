define(["app/core/pages/FilteredListPage","app/core/util/pageActions","app/wmes-osh-common/dictionaries","../views/FilterView","../views/ListView"],function(i,e,s,t,a){"use strict";return i.extend({FilterView:t,ListView:a,className:"is-colored",columns:[{id:"rid",className:"is-min"},{id:"recipient",className:"is-min"},{id:"subject",className:"is-overflow w300"},{id:"amount",className:"is-min",tdClassName:"text-right"},{id:"createdAt",className:"is-min"},{id:"creator",className:"is-min"},{id:"paidAt",className:"is-min"},{id:"payer",className:"is-min"},"-"],actions:function(i){return[e.export(i,this,this.collection,!1)]},initialize:function(){i.prototype.initialize.apply(this,arguments),this.listenToOnce(this.filterView,"afterRender",()=>{this.filterView.$id("submit").click()})},load:function(i){return i(s.load())}})});