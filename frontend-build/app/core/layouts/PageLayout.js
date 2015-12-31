// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/user","../View","app/core/templates/pageLayout"],function(t,e,i,s,r){"use strict";var n=s.extend({pageContainerSelector:".bd",template:r});return n.prototype.initialize=function(){this.model={id:null,actions:[],breadcrumbs:[],title:null},this.$header=null,this.$breadcrumbs=null,this.$actions=null,this.onWindowResize=t.debounce(this.onWindowResize.bind(this),1e3/15),e(window).on("resize",this.onWindowResize)},n.prototype.destroy=function(){e(window).off("resize",this.onWindowResize),this.el.ownerDocument&&this.el.ownerDocument.body.classList.remove("page"),this.$breadcrumbs=null,this.$actions=null},n.prototype.serialize=function(){return t.extend(s.prototype.serialize.call(this),{version:this.options.version})},n.prototype.afterRender=function(){this.el.ownerDocument&&this.el.ownerDocument.body.classList.add("page"),this.$header=this.$(".page-header").first(),this.$breadcrumbs=this.$(".page-breadcrumbs").first(),this.$actions=this.$(".page-actions").first(),this.changeTitle(),this.renderBreadcrumbs(),this.renderActions(),null!==this.model.id&&this.setId(this.model.id)},n.prototype.reset=function(){this.setId(null),this.model.title=null,this.$header&&this.$header.hide(),this.$breadcrumbs&&(this.model.breadcrumbs=[],this.$breadcrumbs.empty()),this.$actions&&(this.model.actions=[],this.$actions.empty()),this.removeView(this.pageContainerSelector)},n.prototype.setUpPage=function(t){t.pageId&&this.setId(t.pageId),t.breadcrumbs?this.setBreadcrumbs(t.breadcrumbs,t):t.title?this.setTitle(t.title,t):this.changeTitle(),t.actions&&this.setActions(t.actions,t)},n.prototype.setId=function(t){return this.isRendered()&&this.$el.attr("data-id",t),this.model.id=t,this},n.prototype.setBreadcrumbs=function(t,e){return null==t?this:("function"==typeof t&&(t=t.call(e,this)),Array.isArray(t)||(t=[t]),this.model.breadcrumbs=t.map(function(t){var e=typeof t;return("string"===e||"function"===e)&&(t={label:t,href:null}),"string"==typeof t.href&&"#"!==t.href[0]&&(t.href="#"+t.href),t}),this.$breadcrumbs&&this.renderBreadcrumbs(),this.changeTitle(),this)},n.prototype.setTitle=function(t,e){return null==t?this:("function"==typeof t&&(t=t.call(e,this)),Array.isArray(t)||(t=[t]),this.model.title=t,this.changeTitle(),this)},n.prototype.setActions=function(t,e){return null==t?this:("function"==typeof t&&(t=t.call(e,this)),t?(Array.isArray(t)||(t=[t]),this.model.actions=t.map(this.prepareAction.bind(this)),this.$actions&&this.renderActions(),this):this)},n.prototype.onWindowResize=function(){this.adjustBreadcrumbsPosition()},n.prototype.prepareAction=function(t){if(t.prepared)return t;if("string"==typeof t.href){var e=t.href.charAt(0);"#"!==e&&"/"!==e&&(t.href="#"+t.href)}else t.href=null;return"string"==typeof t.icon&&(t.icon="fa-"+t.icon.split(" ").join(" fa-")),"string"!=typeof t.className&&(t.className=""),t.className="btn btn-"+(t.type||"default")+" "+t.className,t.prepared=!0,t},n.prototype.renderBreadcrumbs=function(){for(var t=this.model.breadcrumbs,e="",i=0,s=t.length;s>i;++i){var r=t[i];e+="<li>",e+=i!==s-1&&r.href?'<a href="'+r.href+'">'+r.label+"</a>":r.label}this.$breadcrumbs.html(e),this.$header.show(),this.adjustBreadcrumbsPosition()},n.prototype.adjustBreadcrumbsPosition=function(){if(window.innerWidth<768){var t=(this.$(".navbar-header").outerHeight()-this.$breadcrumbs.outerHeight())/2;this.$breadcrumbs.css("top",t+"px")}},n.prototype.renderActions=function(){for(var e=this.model.actions,s={},r={},n="",o=0,a=e.length;a>o;++o){var h=e[o],l=h.privileges;if(l)if(t.isFunction(l)){if(!l())continue}else if(!i.isAllowedTo(l))continue;"function"==typeof h.callback&&(s[o]=h.callback.bind(this)),"function"==typeof h.afterRender&&(r[o]=h.afterRender.bind(this)),n+='<li data-index="'+o+'">',"function"==typeof h.template?n+=h.template(h):(n+=null===h.href?'<button class="'+h.className+'">':'<a class="'+h.className+'" href="'+h.href+'">',"string"==typeof h.icon&&(n+='<i class="fa '+h.icon+'"></i>'),n+="<span>"+h.label+"</span>"+(h.href?"</a>":"</button>"))}this.$actions.html(n);var c=this.$actions.find("li");Object.keys(s).forEach(function(t){c.filter('li[data-index="'+t+'"]').click(e[t].callback)}),Object.keys(r).forEach(function(t){r[t](c.filter('li[data-index="'+t+'"]'),e[t])}),this.$header.show()},n.prototype.changeTitle=function(){if(this.isRendered()){var e=Array.isArray(this.model.title)?[].concat(this.model.title):t.pluck(this.model.breadcrumbs,"label");this.broker.publish("page.titleChanged",e)}},n});