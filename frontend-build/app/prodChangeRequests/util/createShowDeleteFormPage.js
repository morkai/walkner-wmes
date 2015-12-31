// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/broker","app/i18n","app/viewport","app/core/util/showDeleteFormPage","./isChangeRequest"],function(e,s,t,n,o,i){"use strict";return function(e){var r=e.prototype.nlsDomain;return function(u,c){var a=s.sandbox();return a.subscribe("viewport.page.loadingFailed",function(){a.destroy()}),a.subscribe("viewport.page.shown").on("message",function(e){a.destroy(),e.listenToOnce(e.view,"success",function(){s.subscribe("router.executing").setLimit(1).on("message",n.msg.show.bind(n.msg,{type:"success",time:3e3,text:t(r,"changeRequest:msg:success:delete")}))})}),o(e,u,c,i()?{formActionText:t.bound(r,"changeRequest:delete:formActionText"),messageText:t.bound(r,"changeRequest:delete:messageText"),failureText:t.bound(r,"changeRequest:msg:failure:delete")}:{})}}});