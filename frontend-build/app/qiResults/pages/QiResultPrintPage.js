// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/i18n","app/core/View","app/qiResults/templates/print"],function(e,t,i,n){"use strict";return i.extend({layoutName:"blank",template:n,initialize:function(){this.$style=null},load:function(e){return e(this.model.fetch())},serialize:function(){return{idPrefix:this.idPrefix,model:this.model.toJSON()}},afterRender:function(){this.$style||(this.$style=e("<style>@page{size:landscape}#app-loading,.message{display:none}</style>").appendTo("head"));for(var i=this.el;null!==(i=i.parentElement);)i.style.height="100%";this.el.style.height="100%",document.title=t("qiResults","print:title",{rid:this.model.get("rid")});var n=0,l=this.$("img");l.length||setTimeout(window.print.bind(window),1),l.on("load",function(){++n===l.length})},destroy:function(){this.$style&&(this.$style.remove(),this.$style=null);for(var e=this.el;null!==(e=e.parentElement);)e.style.height=""}})});