define(["underscore","jquery","backbone","backbone.layout","app/broker","app/socket","app/pubsub","app/i18n","./util","./util/html","./util/forms/formGroup"],function(t,e,i,r,s,o,n,a,p,c,l){"use strict";function u(e){var i=this;i.idPrefix=t.uniqueId("v"),i.options=e||{},i.timers={},i.promises=[],t.forEach(i.sections,function(t,e){i.sections[e]="string"!=typeof t||"#"===t?"#"+i.idPrefix+"-"+e:t.replace("#-","#"+i.idPrefix+"-")}),p.defineSandboxedProperty(i,"broker",s),p.defineSandboxedProperty(i,"pubsub",n),p.defineSandboxedProperty(i,"socket",o),Object.defineProperty(i,"t",{enumerable:!0,configurable:!0,get:function(){return delete i.t,i.t=a.forDomain(i.getDefaultNlsDomain()),i.t}}),r.call(i,e),p.subscribeTopics(i,"broker",i.localTopics,!0),i.remoteTopicsAfterSync?(!0===i.remoteTopicsAfterSync&&(i.remoteTopicsAfterSync="model"),"string"==typeof i.remoteTopicsAfterSync&&i[i.remoteTopicsAfterSync]&&i.listenToOnce(i[i.remoteTopicsAfterSync],"sync",p.subscribeTopics.bind(p,i,"pubsub",i.remoteTopics,!0))):p.subscribeTopics(i,"pubsub",i.remoteTopics,!0)}return p.inherits(u,r),u.prototype.delegateEvents=function(e){if(e||(e=t.result(this,"events")),!e)return this;this.undelegateEvents(),Object.keys(e).forEach(function(i){var r=e[i];if(t.isFunction(r)||(r=this[r]),t.isFunction(r)){var s=i.match(/^(\S+)\s*(.*)$/),o=s[1]+".delegateEvents"+this.cid,n=s[2];""===n?this.$el.on(o,r.bind(this)):(t.isString(this.idPrefix)&&(n=n.replace(/#-/g,"#"+this.idPrefix+"-")),this.$el.on(o,n,r.bind(this)))}},this)},u.prototype.listenTo=function(t){if(t)return r.prototype.listenTo.apply(this,arguments)},u.prototype.listenToOnce=function(t){if(t)return r.prototype.listenToOnce.apply(this,arguments)},u.prototype.getViews=function(t){return"string"==typeof t&&/^#-/.test(t)&&(t=t.replace("#-","#"+this.idPrefix+"-")),r.prototype.getViews.call(this,t)},u.prototype.setView=function(t,e,s,o){return"string"==typeof t&&/^#-/.test(t)&&(t=t.replace("#-","#"+this.idPrefix+"-")),t instanceof i.View||e instanceof i.View?r.prototype.setView.call(this,t,e,s,o):null},u.prototype.cleanup=function(){this.destroy(),this.cleanupSelect2(),this.cleanupPopovers(),p.cleanupSandboxedProperties(this),t.isObject(this.timers)&&(t.forEach(this.timers,clearTimeout),this.timers={}),this.cancelRequests()},u.prototype.destroy=function(){},u.prototype.cleanupSelect2=function(){var t=this;t.$(".select2-container").each(function(){t.$("#"+this.id.replace("s2id_","")).select2("destroy")})},u.prototype.cleanupPopovers=function(){var t=this;t.$("[aria-describedby]").each(function(){var e=this.getAttribute("aria-describedby");/^popover/.test(e)?t.$(this).popover("destroy"):/^tooltip/.test(e)&&t.$(this).tooltip("destroy")})},u.prototype.beforeRender=function(){},u.prototype.serialize=function(){return t.assign(this.getCommonTemplateData(),this.getTemplateData())},u.prototype.getCommonTemplateData=function(){var t=this.getTemplateHelpers();return{idPrefix:this.idPrefix,helpers:t,t:t.t,id:t.id}},u.prototype.getTemplateData=function(){return{}},u.prototype.getTemplateHelpers=function(){var t=this.idPrefix;return{t:this.t,id:function(){return t+"-"+Array.prototype.slice.call(arguments).join("-")},props:this.props.bind(this),formGroup:l.bind(null,this)}},u.prototype.renderPartial=function(t,i){return e(this.renderPartialHtml(t,i))},u.prototype.renderPartialHtml=function(e,i){return e(t.assign(this.getCommonTemplateData(),i))},u.prototype.afterRender=function(){},u.prototype.isRendered=function(){return!0===this.hasRendered},u.prototype.isDetached=function(){return!e.contains(document.documentElement,this.el)},u.prototype.ajax=function(t){return this.promised(e.ajax(t))},u.prototype.promised=function(e){if(!e||!t.isFunction(e.abort))return e;this.promises.push(e);var i=this;return e.always(function(){Array.isArray(i.promises)&&i.promises.splice(i.promises.indexOf(e),1)}),e},u.prototype.cancelRequests=function(){this.promises.forEach(function(t){t.abort()}),this.promises=[]},u.prototype.cancelAnimations=function(t,e){this.$el.stop(!1!==t,!1!==e),this.$(":animated").stop(!1!==t,!1!==e)},u.prototype.$id=function(i){var r="#";t.isString(this.idPrefix)&&(r+=this.idPrefix+"-"),r+=i;var s=this.$el.find(r);return s.length?s:e(r)},u.prototype.getDefaultModel=function(){return this[this.modelProperty]||this.model||this.collection},u.prototype.getDefaultNlsDomain=function(){if(this.nlsDomain)return t.result(this,"nlsDomain");var e=this.getDefaultModel();if(e){if(e.getNlsDomain)return e.getNlsDomain();if(e.nlsDomain)return e.nlsDomain}return"core"},u.prototype.props=function(e,i){var r=this;i||(e=(i=e).data);var s='<div class="props '+(i.first?"first":"")+'">',o=r.getDefaultNlsDomain();return[].concat(t.isArray(i)?i:i.props).forEach(function(n){"string"==typeof n&&(n={id:n});var p=!1!==n.escape&&"!"!==n.id.charAt(0),l=p?n.id:n.id.substring(1),u=n.nlsDomain||i.nlsDomain||o,f=n.label||a(u,"PROPERTY:"+l),h=t.isFunction(n.value)?n.value(e[l],n,r):t.isUndefined(n.value)?e[l]:n.value;if((!t.isFunction(n.visible)||n.visible(h,n,r))&&(null==n.visible||n.visible)){var d=Object.assign({"data-prop":l},n.attrs,{className:{prop:!0}});[n.className,n.attrs&&n.attrs.className].forEach(function(t){"string"==typeof t&&t.length&&(t=t.split(" ")),Array.isArray(t)?t.forEach(function(t){d.className[t]=!0}):t&&"object"==typeof t&&Object.assign(d.className,t)});var m=Object.assign({},n.nameAttrs,{className:{"prop-name":!0}});[n.nameClassName,n.nameAttrs&&n.nameAttrs.className].forEach(function(t){"string"==typeof t&&t.length&&(t=t.split(" ")),Array.isArray(t)?t.forEach(function(t){m.className[t]=!0}):t&&"object"==typeof t&&Object.assign(m.className,t)});var y=Object.assign({},n.valueAttrs,{className:{"prop-value":!0}});[n.valueClassName,n.valueAttrs&&n.valueAttrs.className].forEach(function(t){"string"==typeof t&&t.length&&(t=t.split(" ")),Array.isArray(t)?t.forEach(function(t){y.className[t]=!0}):t&&"object"==typeof t&&Object.assign(y.className,t)}),"string"!=typeof h&&(h=null==h?"":String(h)),p&&(h=t.escape(h));var b=c.tag("div",m,f),g=c.tag("div",y,h);s+=c.tag("div",d,b+g)}}),s+"</div>"},u});