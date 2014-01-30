/*!
 * visibly - v0.6 Aug 2011 - Page Visibility API Polyfill
 * http://github.com/addyosmani
 * Copyright (c) 2011 Addy Osmani
 * Dual licensed under the MIT and GPL licenses.
 *
 * Methods supported:
 * visibly.onVisible(callback)
 * visibly.onHidden(callback)
 * visibly.hidden()
 * visibly.visibilityState()
 * visibly.visibilitychange(callback(state));
 */

!function(){window.visibly={q:document,p:void 0,prefixes:["webkit","ms","o","moz","khtml"],props:["VisibilityState","visibilitychange","Hidden"],m:["focus","blur"],visibleCallbacks:[],hiddenCallbacks:[],genericCallbacks:[],_callbacks:[],cachedPrefix:"",onVisible:function(e){"function"==typeof e&&this.visibleCallbacks.push(e)},onHidden:function(e){"function"==typeof e&&this.hiddenCallbacks.push(e)},getPrefix:function(){if(!this.cachedPrefix)for(var e=0;b=this.prefixes[e++];)if(b+this.props[2]in this.q)return this.cachedPrefix=b,this.cachedPrefix},visibilityState:function(){return this._getProp(0)},hidden:function(){return this._getProp(2)},visibilitychange:function(e){"function"==typeof e&&this.genericCallbacks.push(e);var t=this.genericCallbacks.length;if(t)if(this.cachedPrefix)for(;t--;)this.genericCallbacks[t].call(this,this.visibilityState());else for(;t--;)this.genericCallbacks[t].call(this,arguments[0])},isSupported:function(){return this.cachedPrefix+this.props[2]in this.q},_getProp:function(e){return this.q[this.cachedPrefix+this.props[e]]},_execute:function(e){if(e){this._callbacks=1==e?this.visibleCallbacks:this.hiddenCallbacks;for(var t=this._callbacks.length;t--;)this._callbacks[t]()}},_visible:function(){window.visibly._execute(1),window.visibly.visibilitychange.call(window.visibly,"visible")},_hidden:function(){window.visibly._execute(2),window.visibly.visibilitychange.call(window.visibly,"hidden")},_nativeSwitch:function(){this[this._getProp(2)?"_hidden":"_visible"]()},_listen:function(){try{this.isSupported()?this.q.addEventListener(this.cachedPrefix+this.props[1],function(){window.visibly._nativeSwitch.apply(window.visibly,arguments)},1):this.q.addEventListener?(window.addEventListener(this.m[0],this._visible,1),window.addEventListener(this.m[1],this._hidden,1)):this.q.attachEvent&&(this.q.attachEvent("onfocusin",this._visible),this.q.attachEvent("onfocusout",this._hidden))}catch(e){}},init:function(){this.getPrefix(),this._listen()}},this.visibly.init()}();