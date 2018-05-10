// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","backbone.layout","app/broker","app/socket","app/pubsub","app/i18n","./util"],function(t,e,i,s,r,o,n,p){"use strict";function a(e){var n=this;n.idPrefix=t.uniqueId("v"),n.options=e||{},n.timers={},n.promises=[],t.forEach(n.sections,function(t,e){n.sections[e]="string"!=typeof t||"#"===t?"#"+n.idPrefix+"-"+e:t.replace("#-","#"+n.idPrefix+"-")}),p.defineSandboxedProperty(n,"broker",s),p.defineSandboxedProperty(n,"pubsub",o),p.defineSandboxedProperty(n,"socket",r),i.call(n,e),p.subscribeTopics(n,"broker",n.localTopics,!0),p.subscribeTopics(n,"pubsub",n.remoteTopics,!0)}return p.inherits(a,i),a.prototype.delegateEvents=function(e){if(e||(e=t.result(this,"events")),!e)return this;this.undelegateEvents(),Object.keys(e).forEach(function(i){var s=e[i];if(t.isFunction(s)||(s=this[s]),t.isFunction(s)){var r=i.match(/^(\S+)\s*(.*)$/),o=r[1]+".delegateEvents"+this.cid,n=r[2];""===n?this.$el.on(o,s.bind(this)):(t.isString(this.idPrefix)&&(n=n.replace(/#-/g,"#"+this.idPrefix+"-")),this.$el.on(o,n,s.bind(this)))}},this)},a.prototype.getViews=function(t){return"string"==typeof t&&/^#-/.test(t)&&(t=t.replace("#-","#"+this.idPrefix+"-")),i.prototype.getViews.call(this,t)},a.prototype.setView=function(t,e,s,r){return"string"==typeof t&&/^#-/.test(t)&&(t=t.replace("#-","#"+this.idPrefix+"-")),i.prototype.setView.call(this,t,e,s,r)},a.prototype.cleanup=function(){this.trigger("cleanup",this),this.destroy(),this.cleanupSelect2(),p.cleanupSandboxedProperties(this),t.isObject(this.timers)&&(t.each(this.timers,clearTimeout),this.timers=null),this.cancelRequests()},a.prototype.destroy=function(){},a.prototype.cleanupSelect2=function(){var t=this;this.$(".select2-container").each(function(){t.$("#"+this.id.replace("s2id_","")).select2("destroy")})},a.prototype.beforeRender=function(){},a.prototype.serialize=function(){return t.assign({idPrefix:this.idPrefix,helpers:this.getTemplateHelpers()},this.getTemplateData())},a.prototype.getTemplateData=function(){return{}},a.prototype.getTemplateHelpers=function(){return{t:this.t.bind(this),props:this.props.bind(this)}},a.prototype.afterRender=function(){},a.prototype.isRendered=function(){return!0===this.hasRendered},a.prototype.isDetached=function(){return!e.contains(document.documentElement,this.el)},a.prototype.ajax=function(t){return this.promised(e.ajax(t))},a.prototype.promised=function(e){if(!e||!t.isFunction(e.abort))return e;this.promises.push(e);var i=this;return e.always(function(){Array.isArray(i.promises)&&i.promises.splice(i.promises.indexOf(e),1)}),e},a.prototype.cancelRequests=function(){this.promises.forEach(function(t){t.abort()}),this.promises=[]},a.prototype.cancelAnimations=function(t,e){this.$el.stop(!1!==t,!1!==e),this.$(":animated").stop(!1!==t,!1!==e)},a.prototype.$id=function(i){var s="#";return t.isString(this.idPrefix)&&(s+=this.idPrefix+"-"),e(s+i)},a.prototype.getDefaultModel=function(){return this[this.modelProperty]||this.model||this.collection},a.prototype.getDefaultNlsDomain=function(){var t=this.getDefaultModel();return t.getNlsDomain?t.getNlsDomain():t.nlsDomain||"core"},a.prototype.t=function(t,e,i){if(i||"string"==typeof e)return n(t,e,i);var s=this.getDefaultNlsDomain();return"object"==typeof e?n(s,t,e):n(s,t)},a.prototype.props=function(e,i){var s=this;i||(i=e,e=i.data);var r='<div class="props '+(i.first?"first":"")+'">',o=s.getDefaultNlsDomain();return[].concat(t.isArray(i)?i:i.props).forEach(function(s){"string"==typeof s&&(s={id:s});var p="!"!==s.id.charAt(0),a=p?s.id:s.id.substring(1),c=s.className||"",u=s.nlsDomain||i.nlsDomain||o,l=s.label||n(u,"PROPERTY:"+a),d=p?t.escape(e[a]):e[a];r+='<div class="prop '+c+'" data-prop="'+a+'"><div class="prop-name">'+l+'</div><div class="prop-value">'+d+"</div></div>"}),r+"</div>"},a});