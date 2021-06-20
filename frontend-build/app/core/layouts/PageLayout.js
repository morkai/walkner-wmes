define(["underscore","jquery","app/user","app/i18n","../View","app/core/templates/pageLayout"],function(e,t,i,s,r,a){"use strict";var n=r.extend({pageContainerSelector:".bd",template:a});return n.prototype.initialize=function(){this.model={id:null,className:null,actions:[],breadcrumbs:[],title:null},this.$header=null,this.$breadcrumbs=null,this.$actions=null,this.onWindowResize=e.debounce(this.onWindowResize.bind(this),1e3/15),t(window).on("resize",this.onWindowResize)},n.prototype.destroy=function(){t(window).off("resize",this.onWindowResize),this.el.ownerDocument&&this.el.ownerDocument.body.classList.remove("page"),this.$breadcrumbs=null,this.$actions=null},n.prototype.serialize=function(){return e.assign(r.prototype.serialize.call(this),{hdHidden:!!this.options.hdHidden,navbarClassName:this.options.navbarClassName||"navbar-default",version:this.options.version,changelogUrl:this.options.changelogUrl})},n.prototype.afterRender=function(){this.el.ownerDocument&&this.el.ownerDocument.body.classList.add("page"),this.$header=this.$(".page-header").first(),this.$breadcrumbs=this.$(".page-breadcrumbs").first(),this.$actions=this.$(".page-actions").first(),this.changeTitle(),this.renderBreadcrumbs(),this.renderActions(),null!==this.model.id&&this.setId(this.model.id),null!==this.model.className&&this.setClassName(this.model.className)},n.prototype.reset=function(){this.setId(null),this.setClassName(null),this.model.title=null,this.$header&&(this.$header[0].style.display="none"),this.$breadcrumbs&&(this.model.breadcrumbs=[],this.$breadcrumbs.empty()),this.$actions&&(this.model.actions=[],this.$actions.empty()),this.removeView(this.pageContainerSelector)},n.prototype.setUpPage=function(e){e.pageId&&this.setId(e.pageId),e.pageClassName&&this.setClassName(e.pageClassName),e.title&&this.setTitle(e.title,e),e.breadcrumbs&&this.setBreadcrumbs(e.breadcrumbs,e),e.breadcrumbs||e.title||this.changeTitle(),e.actions&&this.setActions(e.actions,e)},n.prototype.setId=function(e){return this.isRendered()&&this.$el.attr("data-id",e),this.model.id=e,this},n.prototype.setClassName=function(e){if(document.body){var i=t(document.body);this.model.className&&i.removeClass(this.model.className),this.isRendered()&&e&&i.addClass(e)}return this.model.className=e,this},n.prototype.setBreadcrumbs=function(e,t){return null==e?this:("function"==typeof e&&(e=e.call(t,this)),Array.isArray(e)||(e=[e]),this.model.breadcrumbs=e.map(function(e){var t=typeof e;return"string"!==t&&"function"!==t||(e={label:e,href:null}),"string"==typeof e.href&&"#"!==e.href[0]&&(e.href="#"+e.href),e}),this.$breadcrumbs&&this.renderBreadcrumbs(),this.model.page||this.changeTitle(),this)},n.prototype.setTitle=function(e,t){return null==e?this:("function"==typeof e&&(e=e.call(t,this)),Array.isArray(e)||(e=[e]),this.model.title=e,this.changeTitle(),this)},n.prototype.setActions=function(t,i){return null==t?this:("function"==typeof t&&(t=t.call(i,this)),t?(Array.isArray(t)||(t=[t]),this.model.actions=t.filter(e.isObject).map(this.prepareAction.bind(this,i)),this.$actions&&this.renderActions(),this):this)},n.prototype.onWindowResize=function(){this.adjustBreadcrumbsPosition()},n.prototype.prepareAction=function(e,t){if(t.prepared)return t;if(t.id||(t.id=""),t.idPrefix=e&&e.idPrefix||"","string"==typeof t.href){var i=t.href.charAt(0);"#"!==i&&"/"!==i&&(t.href="#"+t.href)}else t.href=null;return"string"==typeof t.icon&&(t.icon="fa-"+t.icon.split(" ").join(" fa-")),t.className||(t.className=""),t.prepared=!0,t},n.prototype.renderBreadcrumbs=function(){for(var e=this.model.breadcrumbs,t="",i=0,s=e.length;i<s;++i){var r=e[i];t+="<li>","function"==typeof r.template?t+=r.template(r,this):r.href?t+='<a href="'+r.href+'">'+r.label+"</a>":t+=r.label}this.$breadcrumbs.html(t),this.$header[0].style.display="",this.adjustBreadcrumbsPosition(),this.trigger("afterRender:breadcrumbs")},n.prototype.adjustBreadcrumbsPosition=function(){if(window.innerWidth<768){var e=(this.$(".navbar-header").outerHeight()-this.$breadcrumbs.outerHeight())/2;this.$breadcrumbs.css("top",e+"px")}},n.prototype.renderActions=function(){for(var t=this.model.actions,s={},r={},a="",n=0,o=t.length;n<o;++n){var l=t[n];if(!1!==l.visible){var h=l.privileges;if(h)if(e.isFunction(h)){if(!h(i))continue}else if(Array.isArray(h)){if(!i.isAllowedTo.apply(i,h))continue}else if(!i.isAllowedTo(h))continue;if("function"==typeof l.callback&&(s[n]=l.callback.bind(this)),"function"==typeof l.afterRender&&(r[n]=l.afterRender.bind(this)),a+='<li data-index="'+n+'">',"function"==typeof l.template)a+=l.template(l,this);else{var d="btn btn-"+(l.type||"default")+" "+e.result(l,"className");l.disabled&&(d+=" disabled");var c=e.result(l,"id");c&&"-"===c.charAt(0)&&(c=l.idPrefix+c),null===l.href?a+='<button id="'+c+'" class="'+d+'">':a+='<a id="'+c+'" class="'+d+'" href="'+l.href+'" target="'+(l.target||"_self")+'">',"string"==typeof l.icon&&(a+='<i class="fa '+l.icon+'"></i>'),l.label&&(a+="<span>"+l.label+"</span>"),a+=l.href?"</a>":"</button>"}}}this.$actions.html(a);var u=this.$actions.find("li");Object.keys(s).forEach(function(e){u.filter('li[data-index="'+e+'"]').click(t[e].callback)}),Object.keys(r).forEach(function(e){r[e](u.filter('li[data-index="'+e+'"]'),t[e])}),this.$header[0].style.display="",this.trigger("afterRender:actions")},n.prototype.changeTitle=function(){if(this.isRendered()){var t=Array.isArray(this.model.title)?[].concat(this.model.title):e.pluck(this.model.breadcrumbs,"label");this.broker.publish("page.titleChanged",t)}},n});