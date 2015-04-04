// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","jquery","backbone.layout","app/broker","app/socket","app/pubsub","./util"],function(t,e,i,s,r,n,o){"use strict";function c(e){this.idPrefix=t.uniqueId("v"),this.options=e||{},this.timers={},this.promises=[],o.defineSandboxedProperty(this,"broker",s),o.defineSandboxedProperty(this,"pubsub",n),o.defineSandboxedProperty(this,"socket",r),i.call(this,e),o.subscribeTopics(this,"broker",this.localTopics,!0),o.subscribeTopics(this,"pubsub",this.remoteTopics,!0)}return o.inherits(c,i),c.prototype.delegateEvents=function(e){return e||(e=t.result(this,"events")),e?(this.undelegateEvents(),void Object.keys(e).forEach(function(i){var s=e[i];if(t.isFunction(s)||(s=this[s]),t.isFunction(s)){var r=i.match(/^(\S+)\s*(.*)$/),n=r[1]+".delegateEvents"+this.cid,o=r[2];""===o?this.$el.on(n,s.bind(this)):(t.isString(this.idPrefix)&&(o=o.replace(/#-/g,"#"+this.idPrefix+"-")),this.$el.on(n,o,s.bind(this)))}},this)):this},c.prototype.cleanup=function(){this.destroy(),this.cleanupSelect2(),o.cleanupSandboxedProperties(this),t.isObject(this.timers)&&(t.each(this.timers,clearTimeout),this.timers=null),this.cancelRequests()},c.prototype.destroy=function(){},c.prototype.cleanupSelect2=function(){var t=this;this.$(".select2-container").each(function(){t.$("#"+this.id.replace("s2id_","")).select2("destroy")})},c.prototype.serialize=function(){return{idPrefix:this.idPrefix}},c.prototype.isRendered=function(){return this.hasRendered===!0},c.prototype.isDetached=function(){return!e.contains(document.documentElement,this.el)},c.prototype.ajax=function(t){return this.promised(e.ajax(t))},c.prototype.promised=function(e){if(!e||!t.isFunction(e.abort))return e;this.promises.push(e);var i=this;return e.always(function(){Array.isArray(i.promises)&&i.promises.splice(i.promises.indexOf(e),1)}),e},c.prototype.cancelRequests=function(){this.promises.forEach(function(t){t.abort()}),this.promises=[]},c.prototype.cancelAnimations=function(t,e){this.$(":animated").stop(t!==!1,e!==!1)},c.prototype.$id=function(e){var i="#";return t.isString(this.idPrefix)&&(i+=this.idPrefix+"-"),this.$(i+e)},c});