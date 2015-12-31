// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/viewport","app/core/View","app/mechOrders/templates/import"],function(e,t,i,o){"use strict";return i.extend({template:o,events:{submit:"upload"},onDialogShown:function(e){this.closeDialog=e.closeDialog.bind(e)},closeDialog:function(){},upload:function(i){i.preventDefault();var o=this.$("[type=submit]").attr("disabled",!0),s=new FormData(this.el),a=this.ajax({type:"POST",url:"/mechOrders;import",data:s,processData:!1,contentType:!1}),n=this.closeDialog;a.then(function(){t.msg.show({type:"info",time:2500,text:e("mechOrders","import:msg:success")}),n()}),a.fail(function(){t.msg.show({type:"error",time:5e3,text:e("mechOrders","import:msg:failure")})}),a.always(function(){o.attr("disabled",!1)})}})});