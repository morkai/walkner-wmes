// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/viewport"],function(e,t){"use strict";return function(i,n,r,a){var l=r?r.model:null;(a||l&&l._id===n.id)&&(i.subscribe("router.executing").setLimit(1).on("message",function(){t.msg.show({type:"warning",time:5e3,text:e(n.getNlsDomain()||"core","MSG:DELETED",{label:n.getLabel()})})}),i.publish("router.navigate",{url:n.genClientUrl("base"),trigger:!0,replace:!0}))}});