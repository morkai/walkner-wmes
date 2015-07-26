// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/broker","app/i18n","app/viewport","app/core/util/pageActions","./isChangeRequest"],function(e,t,s,n,o,i){"use strict";return function(e,t){var u=t.getNlsDomain(),c=i();return c&&e.broker.subscribe("viewport.dialog.shown").setLimit(1).setFilter(function(e){return"delete"===e.options.actionKey&&e.model===t}).on("message",function(t){e.listenToOnce(t,"success",function(){n.msg.show({type:"success",time:3e3,text:s(u,"changeRequest:msg:success:delete")})})}),o["delete"](t,!1,c?{formActionText:s.bound(u,"changeRequest:delete:formActionText"),messageText:s.bound(u,"changeRequest:delete:messageText"),failureText:s.bound(u,"changeRequest:msg:failure:delete")}:{})}});