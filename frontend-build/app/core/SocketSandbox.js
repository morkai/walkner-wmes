// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore"],function(t){"use strict";function e(t){if(this.socket=t,this.listeners={destroy:[]},t instanceof e){var s=this;this.socket.on("destroy",function(){s.destroy()})}}return e.prototype.destroy=function(){var e=this.listeners;if(null!=e){var s=e.destroy;if(t.isArray(s))for(var i=0,n=s.length;i<n;++i)s[i].call(this);delete this.listeners.destroy;for(var r=Object.keys(e),o=0,l=r.length;o<l;++o)for(var c=r[o],h=e[c],f=0,u=h.length;f<u;++f)this.socket.off(c,h[f]);this.listeners=null,this.socket=null}},e.prototype.sandbox=function(){return new e(this)},e.prototype.getId=function(){return this.socket.getId()},e.prototype.isConnected=function(){return this.socket.isConnected()},e.prototype.on=function(e,s){var i=this.listeners[e];return t.isUndefined(i)&&(i=this.listeners[e]=[]),i.push(s),"destroy"!==e&&this.socket.on(e,s),this},e.prototype.off=function(e,s){var i=this.listeners[e];if(t.isUndefined(i))return this;if(t.isUndefined(s))delete this.listeners[e];else{var n=t.indexOf(i,s);if(n===-1)return this;i.splice(n,1),0===i.length&&delete this.listeners[e]}return"destroy"!==e&&this.socket.off(e,s),this},e.prototype.emit=function(){var t=Array.prototype.slice.call(arguments),e=t.length-1;return t[e]=this.wrapCallback(t[e]),this.socket.emit.apply(this.socket,t),this},e.prototype.send=function(t,e){return this.socket.send(t,this.wrapCallback(e)),this},e.prototype.wrapCallback=function(e){if(!t.isFunction(e))return e;var s=this;return function(){null!==s.socket&&e.apply(this,arguments)}},e});