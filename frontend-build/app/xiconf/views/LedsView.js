// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/i18n","app/core/View","app/xiconf/templates/leds","app/xiconf/templates/led"],function(e,s,t,i,a){"use strict";return t.extend({template:i,serialize:function(){return{idPrefix:this.idPrefix,renderLed:a,leds:(this.model.get("leds")||[]).map(this.serializeLed)}},serializeLed:function(e){var t,i,a="";return"checking"===e.status?(t="warning",i="fa-spinner fa-spin"):"checked"===e.status?(t="success",i="fa-thumbs-up"):"waiting"===e.status?(t="default",i="fa-question-circle"):(t="danger",i="fa-thumbs-down",a=s.has("xiconf","leds:error:"+e.status.message)?s("xiconf","leds:error:"+e.status.message,e.status):e.status.message),{className:t,statusIcon:i,serialNumber:e.serialNumber||"????????",name:e.name,nc12:e.nc12,error:a}},renderLed:function(s,t){this.$id("list").children().eq(s).replaceWith(e(a(this.serializeLed(t))))}})});