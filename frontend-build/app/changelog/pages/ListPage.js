// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/View","app/changelog/templates/list"],function(e,i,t){"use strict";return i.extend({layoutName:"page",template:t,events:{"click #-showMore":function(){this.showNext(10),this.$id("showMore").remove(),this.$id("showAll").removeClass("hidden")},"click #-showAll":function(){this.$hidden.removeClass("hidden"),this.$id("showAll").remove()}},breadcrumbs:function(){return[e.bound("changelog","breadcrumbs:browse")]},initialize:function(){},destroy:function(){this.$hidden=null},afterRender:function(){this.$hidden=this.$(".hidden"),this.showNext(4)},showNext:function(e){for(var i=0,t=Math.min(e,this.$hidden.length);i<t;++i)this.$hidden[i].classList.remove("hidden");this.$hidden=this.$(".hidden")}})});