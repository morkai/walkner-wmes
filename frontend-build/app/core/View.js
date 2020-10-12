define(["underscore","jquery","backbone","backbone.layout","app/broker","app/socket","app/pubsub","app/i18n","./util","./util/html","./util/forms/formGroup"],function(e,t,i,s,r,o,n,a,c,p,l){"use strict";function u(t){var i=this;i.idPrefix=e.uniqueId("v"),i.options=t||{},i.timers={},i.promises=[],e.forEach(i.sections,function(e,t){i.sections[t]="string"!=typeof e||"#"===e?"#"+i.idPrefix+"-"+t:e.replace("#-","#"+i.idPrefix+"-")}),c.defineSandboxedProperty(i,"broker",r),c.defineSandboxedProperty(i,"pubsub",n),c.defineSandboxedProperty(i,"socket",o),Object.defineProperty(i,"t",{enumerable:!0,configurable:!0,get:function(){return delete i.t,i.t=a.forDomain(i.getDefaultNlsDomain()),i.t}}),s.call(i,t),c.subscribeTopics(i,"broker",i.localTopics,!0),i.remoteTopicsAfterSync?(!0===i.remoteTopicsAfterSync&&(i.remoteTopicsAfterSync="model"),"string"==typeof i.remoteTopicsAfterSync&&i[i.remoteTopicsAfterSync]&&i.listenToOnce(i[i.remoteTopicsAfterSync],"sync",c.subscribeTopics.bind(c,i,"pubsub",i.remoteTopics,!0))):c.subscribeTopics(i,"pubsub",i.remoteTopics,!0)}return c.inherits(u,s),u.prototype.delegateEvents=function(t){if(t||(t=e.result(this,"events")),!t)return this;this.undelegateEvents(),Object.keys(t).forEach(function(i){var s=t[i];if(e.isFunction(s)||(s=this[s]),e.isFunction(s)){var r=i.match(/^(\S+)\s*(.*)$/),o=r[1]+".delegateEvents"+this.cid,n=r[2];""===n?this.$el.on(o,s.bind(this)):(e.isString(this.idPrefix)&&(n=n.replace(/#-/g,"#"+this.idPrefix+"-")),this.$el.on(o,n,s.bind(this)))}},this)},u.prototype.listenTo=function(e){if(e)return s.prototype.listenTo.apply(this,arguments)},u.prototype.listenToOnce=function(e){if(e)return s.prototype.listenToOnce.apply(this,arguments)},u.prototype.getViews=function(e){return"string"==typeof e&&/^#-/.test(e)&&(e=e.replace("#-","#"+this.idPrefix+"-")),s.prototype.getViews.call(this,e)},u.prototype.setView=function(e,t,r,o){return"string"==typeof e&&/^#-/.test(e)&&(e=e.replace("#-","#"+this.idPrefix+"-")),e instanceof i.View||t instanceof i.View?s.prototype.setView.call(this,e,t,r,o):null},u.prototype.cleanup=function(){this.destroy(),this.cleanupSelect2(),this.cleanupPopovers(),c.cleanupSandboxedProperties(this),e.isObject(this.timers)&&(e.forEach(this.timers,clearTimeout),this.timers={}),this.cancelRequests()},u.prototype.destroy=function(){},u.prototype.cleanupSelect2=function(){var e=this;e.$(".select2-container").each(function(){e.$("#"+this.id.replace("s2id_","")).select2("destroy")})},u.prototype.cleanupPopovers=function(){var e=this;e.$(".popover").each(function(){e.$('[aria-describedby="'+this.id+'"]').popover("destroy")})},u.prototype.beforeRender=function(){},u.prototype.serialize=function(){return e.assign(this.getCommonTemplateData(),this.getTemplateData())},u.prototype.getCommonTemplateData=function(){var e=this.getTemplateHelpers();return{idPrefix:this.idPrefix,helpers:e,t:e.t,id:e.id}},u.prototype.getTemplateData=function(){return{}},u.prototype.getTemplateHelpers=function(){var e=this.idPrefix;return{t:this.t,id:function(){return e+"-"+Array.prototype.slice.call(arguments).join("-")},props:this.props.bind(this),formGroup:l.bind(null,this)}},u.prototype.renderPartial=function(e,i){return t(this.renderPartialHtml(e,i))},u.prototype.renderPartialHtml=function(t,i){return t(e.assign(this.getCommonTemplateData(),i))},u.prototype.afterRender=function(){},u.prototype.isRendered=function(){return!0===this.hasRendered},u.prototype.isDetached=function(){return!t.contains(document.documentElement,this.el)},u.prototype.ajax=function(e){return this.promised(t.ajax(e))},u.prototype.promised=function(t){if(!t||!e.isFunction(t.abort))return t;this.promises.push(t);var i=this;return t.always(function(){Array.isArray(i.promises)&&i.promises.splice(i.promises.indexOf(t),1)}),t},u.prototype.cancelRequests=function(){this.promises.forEach(function(e){e.abort()}),this.promises=[]},u.prototype.cancelAnimations=function(e,t){this.$el.stop(!1!==e,!1!==t),this.$(":animated").stop(!1!==e,!1!==t)},u.prototype.$id=function(i){var s="#";e.isString(this.idPrefix)&&(s+=this.idPrefix+"-"),s+=i;var r=this.$el.find(s);return r.length?r:t(s)},u.prototype.getDefaultModel=function(){return this[this.modelProperty]||this.model||this.collection},u.prototype.getDefaultNlsDomain=function(){if(this.nlsDomain)return this.nlsDomain;var e=this.getDefaultModel();if(e){if(e.getNlsDomain)return e.getNlsDomain();if(e.nlsDomain)return e.nlsDomain}return"core"},u.prototype.props=function(t,i){var s=this;i||(t=(i=t).data);var r='<div class="props '+(i.first?"first":"")+'">',o=s.getDefaultNlsDomain();return[].concat(e.isArray(i)?i:i.props).forEach(function(n){"string"==typeof n&&(n={id:n});var c=!1!==n.escape&&"!"!==n.id.charAt(0),l=c?n.id:n.id.substring(1),u=n.nlsDomain||i.nlsDomain||o,f=n.label||a(u,"PROPERTY:"+l),m=e.isFunction(n.value)?n.value(t[l],n,s):e.isUndefined(n.value)?t[l]:n.value;if((!e.isFunction(n.visible)||n.visible(m,n,s))&&(null==n.visible||n.visible)){var d=Object.assign({className:{},"data-prop":l},n.attrs);if("string"==typeof d.className&&(d.className=d.className.split(" ")),Array.isArray(d.className)){var h={};d.className.forEach(function(e){h[e]=!0}),d.className=h}n.className&&(d.className[n.className]=!0),d.className.prop=!0;var y=Object.assign({className:{}},n.nameAttrs);if("string"==typeof y.className&&(y.className=y.className.split(" ")),Array.isArray(y.className)){var b={};y.className.forEach(function(e){b[e]=!0}),y.className=b}n.nameClassName&&(y.className[n.nameClassName]=!0),y.className["prop-name"]=!0;var v=Object.assign({className:{}},n.valueAttrs);if("string"==typeof v.className&&(v.className=v.className.split(" ")),Array.isArray(v.className)){var g={};v.className.forEach(function(e){g[e]=!0}),v.className=g}n.valueClassName&&(v.className[n.valueClassName]=!0),v.className["prop-value"]=!0,c&&(m=e.escape(m));var N=p.tag("div",y,f),T=p.tag("div",v,m);r+=p.tag("div",d,N+T)}}),r+"</div>"},u});