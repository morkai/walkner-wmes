define(["../core/Model"],function(t){"use strict";return t.extend({nlsDomain:"paintShop",defaults:function(){return{counter:1,totalCount:0,collection:[]}},url:function(){return"/paintShop/load/recent?counter="+this.get("counter")+"&limit="+window.screen.availWidth},update:function(t){var e=this.get("totalCount"),n=this.get("collection"),o=t.map(function(t){return Math.round(t.d/1e3)});n.push.apply(n,o);var i=n.length-e;i&&n.splice(0,i),this.trigger("update",{added:o,removed:i})}})});