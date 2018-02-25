// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/View","app/sapLaborTimeFixer/templates/page","app/sapLaborTimeFixer/data"],function(e,i,r,t){"use strict";return i.extend({layoutName:"page",template:r,breadcrumbs:function(){return[e.bound("sapLaborTimeFixer","BREADCRUMBS:base")]},initialize:function(){var e=this;e.properties={},t.forEach(function(i){i.laborTimes.forEach(function(i){Object.keys(i.conditions).forEach(function(r){var t=i.conditions[r];Array.isArray(t)?t.forEach(function(i){e.addProperty(r,i)}):e.addProperty(r,t)})})})},addProperty:function(e,i){var r=e.substring(e.indexOf("_")+1),t=this.properties[r];t||(t=this.properties[r]={name:e,condition:"",values:[]});var a=i.match(/^(=|>|<>?)?'?(.*?)'?$/);a&&(t.condition=a[1]||"=",t.values.indexOf(a[2])===-1&&t.values.push(a[2]))},afterRender:function(){this.$id("json").html(JSON.stringify(this.properties,null,2))}})});