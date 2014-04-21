// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","jquery","backbone.layout","app/broker","app/socket","app/pubsub","./util"],function(t,e,i,s,o,r,n){function p(t){this.options=t||{},this.timers={},this.promises=[],n.defineSandboxedProperty(this,"broker",s),n.defineSandboxedProperty(this,"pubsub",r),n.defineSandboxedProperty(this,"socket",o),i.call(this,t),n.subscribeTopics(this,"broker",this.localTopics,!0),n.subscribeTopics(this,"pubsub",this.remoteTopics,!0)}return n.inherits(p,i),p.prototype.cleanup=function(){t.isFunction(this.destroy)&&this.destroy(),n.cleanupSandboxedProperties(this),t.isObject(this.timers)&&(t.each(this.timers,clearTimeout),this.timers=null),this.cancelRequests()},p.prototype.isRendered=function(){return this.hasRendered===!0},p.prototype.isDetached=function(){return!e.contains(document.documentElement,this.el)},p.prototype.ajax=function(t){return this.promised(e.ajax(t))},p.prototype.promised=function(e){if(e&&t.isFunction(e.abort)){this.promises.push(e);var i=this;e.always(function(){Array.isArray(i.promises)&&i.promises.splice(i.promises.indexOf(e),1)})}return e},p.prototype.cancelRequests=function(){this.promises.forEach(function(t){t.abort()}),this.promises=[]},p.prototype.cancelAnimations=function(t,e){this.$(":animated").stop(t!==!1,e!==!1)},p.prototype.$id=function(t){var e="#";return"string"==typeof this.idPrefix&&(e+=this.idPrefix+"-"),this.$(e+t)},p});