// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/time","app/core/View","app/paintShop/templates/load/stats"],function(t,i,e,s,a){"use strict";return s.extend({template:a,initialize:function(){this.listenTo(this.stats,"change",this.render),this.listenTo(this.settings,"change",this.render)},destroy:function(){},afterRender:function(){clearInterval(this.timers.update),this.timers.update=setInterval(this.update.bind(this),1e3)},update:function(){var t=this.serializeCurrent();this.$id("current").css("color",t.color),this.$id("current-duration").html(t.duration),this.$id("current-icon").find(".fa").removeClass().addClass("fa fa-"+t.icon)},serialize:function(){return{idPrefix:this.idPrefix,current:this.serializeCurrent(),stats:this.serializeStats()}},serializeStats:function(){var i=this;return["1h","shift","8h","1d","7d","30d"].map(function(e){var s=i.stats.get(e),a=Math.ceil(s.avg/1e3);return t.assign({id:e,count:s.sum,duration:a},i.settings.getLoadStatus(a))})},serializeCurrent:function(){var i=this.stats.get("last"),e=i?Math.max(0,Math.min(999,Math.floor((Date.now()-Date.parse(i._id))/1e3))).toString():"";return t.assign({duration:e},this.settings.getLoadStatus(e))},serializeLast:function(){var i=this.stats.get("last"),e=i?i.d:0;return t.assign({count:1,duration:e||"?"},this.settings.getLoadStatus(e))}})});