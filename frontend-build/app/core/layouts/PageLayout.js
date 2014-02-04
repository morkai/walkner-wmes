define(["underscore","jquery","app/user","../View","app/core/templates/pageLayout"],function(t,e,i,r,s){var n=r.extend({pageContainerSelector:".bd",template:s});return n.prototype.initialize=function(){this.model={id:null,actions:[],breadcrumbs:[],title:null},this.$header=null,this.$breadcrumbs=null,this.$actions=null},n.prototype.destroy=function(){this.el.ownerDocument&&this.el.ownerDocument.body.classList.remove("page"),this.$breadcrumbs=null,this.$actions=null},n.prototype.afterRender=function(){this.el.ownerDocument&&this.el.ownerDocument.body.classList.add("page"),this.$header=this.$(".page-header").first(),this.$breadcrumbs=this.$(".page-breadcrumbs").first(),this.$actions=this.$(".page-actions").first(),this.changeTitle(),this.renderBreadcrumbs(),this.renderActions(),null!==this.model.id&&this.setId(this.model.id)},n.prototype.reset=function(){this.setId(null),this.model.title=null,this.$header&&this.$header.hide(),this.$breadcrumbs&&(this.model.breadcrumbs=[],this.$breadcrumbs.empty()),this.$actions&&(this.model.actions=[],this.$actions.empty()),this.removeView(this.pageContainerSelector)},n.prototype.setUpPage=function(t){t.pageId&&this.setId(t.pageId),t.breadcrumbs?this.setBreadcrumbs(t.breadcrumbs,t):t.title?this.setTitle(t.title,t):this.changeTitle(),t.actions&&this.setActions(t.actions,t)},n.prototype.setId=function(t){return this.isRendered()&&this.$el.attr("data-id",t),this.model.id=t,this},n.prototype.setBreadcrumbs=function(t,e){return null==t?this:("function"==typeof t&&(t=t.call(e)),Array.isArray(t)||(t=[t]),this.model.breadcrumbs=t.map(function(t){var e=typeof t;return("string"===e||"function"===e)&&(t={label:t,href:null}),"string"==typeof t.href&&"#"!==t.href[0]&&(t.href="#"+t.href),t}),this.$breadcrumbs&&this.renderBreadcrumbs(),this.changeTitle(),this)},n.prototype.setTitle=function(t,e){return null==t?this:("function"==typeof t&&(t=t.call(e)),Array.isArray(t)||(t=[t]),this.model.title=t,this.changeTitle(),this)},n.prototype.setActions=function(t,e){return null==t?this:("function"==typeof t&&(t=t.call(e)),t?(Array.isArray(t)||(t=[t]),this.model.actions=t.map(this.prepareAction.bind(this)),this.$actions&&this.renderActions(),this):this)},n.prototype.prepareAction=function(t){return t.prepared?t:("string"==typeof t.href?"#"!==t.href[0]&&(t.href="#"+t.href):t.href="#","string"==typeof t.icon&&(t.icon="fa-"+t.icon.split(" ").join(" fa-")),"string"!=typeof t.className&&(t.className=""),t.className="btn btn-"+(t.type||"default")+" "+t.className,t.prepared=!0,t)},n.prototype.renderBreadcrumbs=function(){for(var t=this.model.breadcrumbs,e="",i=0,r=t.length;r>i;++i){var s=t[i];e+="<li>",e+=i!==r-1&&s.href?'<a href="'+s.href+'">'+s.label+"</a>":s.label}this.$breadcrumbs.html(e),this.$header.show()},n.prototype.renderActions=function(){for(var e=this.model.actions,r={},s={},n="",a=0,o=e.length;o>a;++a){var l=e[a];(!l.privileges||(!t.isFunction(l.privileges)||l.privileges())&&i.isAllowedTo(l.privileges))&&("function"==typeof l.callback&&(r[a]=l.callback.bind(this)),"function"==typeof l.afterRender&&(s[a]=l.afterRender.bind(this)),n+='<li data-index="'+a+'">',"function"==typeof l.template?n+=l.template(l):(n+='<a class="'+l.className+'" href="'+l.href+'">',"string"==typeof l.icon&&(n+='<i class="fa '+l.icon+'"></i>'),n+="<span>"+l.label+"</span></a>"))}this.$actions.html(n);var h=this.$actions.find("li");Object.keys(r).forEach(function(t){h.filter('li[data-index="'+t+'"]').click(e[t].callback)}),Object.keys(s).forEach(function(t){s[t](h.filter('li[data-index="'+t+'"]'),e[t])}),this.$header.show()},n.prototype.changeTitle=function(){if(this.isRendered()){var e=Array.isArray(this.model.title)?[].concat(this.model.title):t.pluck(this.model.breadcrumbs,"label");this.broker.publish("page.titleChanged",e)}},n});