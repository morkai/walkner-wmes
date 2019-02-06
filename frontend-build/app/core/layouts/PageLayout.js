define(["underscore","jquery","app/user","app/i18n","../View","app/core/templates/pageLayout"],function(e,t,i,s,r,n){"use strict";var a=r.extend({pageContainerSelector:".bd",template:n});return a.prototype.initialize=function(){this.model={id:null,className:null,actions:[],breadcrumbs:[],title:null},this.$header=null,this.$breadcrumbs=null,this.$actions=null,this.onWindowResize=e.debounce(this.onWindowResize.bind(this),1e3/15),t(window).on("resize",this.onWindowResize)},a.prototype.destroy=function(){t(window).off("resize",this.onWindowResize),this.el.ownerDocument&&this.el.ownerDocument.body.classList.remove("page"),this.$breadcrumbs=null,this.$actions=null},a.prototype.serialize=function(){return e.assign(r.prototype.serialize.call(this),{hdHidden:!!this.options.hdHidden,version:this.options.version,changelogUrl:this.options.changelogUrl})},a.prototype.afterRender=function(){this.el.ownerDocument&&this.el.ownerDocument.body.classList.add("page"),this.$header=this.$(".page-header").first(),this.$breadcrumbs=this.$(".page-breadcrumbs").first(),this.$actions=this.$(".page-actions").first(),this.changeTitle(),this.renderBreadcrumbs(),this.renderActions(),null!==this.model.id&&this.setId(this.model.id),null!==this.model.className&&this.setClassName(this.model.className)},a.prototype.reset=function(){this.setId(null),this.setClassName(null),this.model.title=null,this.$header&&(this.$header[0].style.display="none"),this.$breadcrumbs&&(this.model.breadcrumbs=[],this.$breadcrumbs.empty()),this.$actions&&(this.model.actions=[],this.$actions.empty()),this.removeView(this.pageContainerSelector)},a.prototype.setUpPage=function(e){e.pageId&&this.setId(e.pageId),e.pageClassName&&this.setClassName(e.pageClassName),e.breadcrumbs?this.setBreadcrumbs(e.breadcrumbs,e):e.title?this.setTitle(e.title,e):this.changeTitle(),e.actions&&this.setActions(e.actions,e)},a.prototype.setId=function(e){return this.isRendered()&&this.$el.attr("data-id",e),this.model.id=e,this},a.prototype.setClassName=function(e){return this.model.className&&document.body.classList.remove(this.model.className),this.isRendered()&&e&&document.body.classList.add(e),this.model.className=e,this},a.prototype.setBreadcrumbs=function(e,t){return null==e?this:("function"==typeof e&&(e=e.call(t,this)),Array.isArray(e)||(e=[e]),this.model.breadcrumbs=e.map(function(e){var t=typeof e;return"string"!==t&&"function"!==t||(e={label:e,href:null}),"string"==typeof e.href&&"#"!==e.href[0]&&(e.href="#"+e.href),e}),this.$breadcrumbs&&this.renderBreadcrumbs(),this.changeTitle(),this)},a.prototype.setTitle=function(e,t){return null==e?this:("function"==typeof e&&(e=e.call(t,this)),Array.isArray(e)||(e=[e]),this.model.title=e,this.changeTitle(),this)},a.prototype.setActions=function(e,t){return null==e?this:("function"==typeof e&&(e=e.call(t,this)),e?(Array.isArray(e)||(e=[e]),this.model.actions=e.map(this.prepareAction.bind(this,t)),this.$actions&&this.renderActions(),this):this)},a.prototype.onWindowResize=function(){this.adjustBreadcrumbsPosition()},a.prototype.prepareAction=function(e,t){if(t.prepared)return t;if(t.id||(t.id=""),t.idPrefix=e&&e.idPrefix||"","string"==typeof t.href){var i=t.href.charAt(0);"#"!==i&&"/"!==i&&(t.href="#"+t.href)}else t.href=null;return"string"==typeof t.icon&&(t.icon="fa-"+t.icon.split(" ").join(" fa-")),t.className||(t.className=""),t.prepared=!0,t},a.prototype.renderBreadcrumbs=function(){for(var e=this.model.breadcrumbs,t="",i=0,s=e.length;i<s;++i){var r=e[i];t+="<li>","function"==typeof r.template?t+=r.template(r,this):r.href?t+='<a href="'+r.href+'">'+r.label+"</a>":t+=r.label}this.$breadcrumbs.html(t),this.$header[0].style.display="",this.adjustBreadcrumbsPosition(),this.trigger("afterRender:breadcrumbs")},a.prototype.adjustBreadcrumbsPosition=function(){if(window.innerWidth<768){var e=(this.$(".navbar-header").outerHeight()-this.$breadcrumbs.outerHeight())/2;this.$breadcrumbs.css("top",e+"px")}},a.prototype.renderActions=function(){for(var t=this.model.actions,s={},r={},n="",a=0,o=t.length;a<o;++a){var l=t[a],h=l.privileges;if(h)if(e.isFunction(h)){if(!h(i))continue}else if(Array.isArray(h)){if(!i.isAllowedTo.apply(i,h))continue}else if(!i.isAllowedTo(h))continue;if("function"==typeof l.callback&&(s[a]=l.callback.bind(this)),"function"==typeof l.afterRender&&(r[a]=l.afterRender.bind(this)),n+='<li data-index="'+a+'">',"function"==typeof l.template)n+=l.template(l,this);else{var d="btn btn-"+(l.type||"default")+" "+e.result(l,"className");l.disabled&&(d+=" disabled");var c=e.result(l,"id");c&&"-"===c.charAt(0)&&(c=l.idPrefix+c),null===l.href?n+='<button id="'+c+'" class="'+d+'">':n+='<a id="'+c+'" class="'+d+'" href="'+l.href+'">',"string"==typeof l.icon&&(n+='<i class="fa '+l.icon+'"></i>'),l.label&&(n+="<span>"+l.label+"</span>"),n+=l.href?"</a>":"</button>"}}this.$actions.html(n);var u=this.$actions.find("li");Object.keys(s).forEach(function(e){u.filter('li[data-index="'+e+'"]').click(t[e].callback)}),Object.keys(r).forEach(function(e){r[e](u.filter('li[data-index="'+e+'"]'),t[e])}),this.$header[0].style.display="",this.trigger("afterRender:actions")},a.prototype.changeTitle=function(){if(this.isRendered()){var t=Array.isArray(this.model.title)?[].concat(this.model.title):e.pluck(this.model.breadcrumbs,"label");this.broker.publish("page.titleChanged",t)}},a});