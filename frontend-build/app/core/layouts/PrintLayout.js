// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/time","app/user","../View","app/core/templates/printLayout"],function(t,e,i,n,a,r){"use strict";var o=a.extend({pageContainerSelector:".print-page-bd",template:r});return o.prototype.initialize=function(){this.model={id:null,actions:[],breadcrumbs:[]}},o.prototype.destroy=function(){this.el.ownerDocument&&this.el.ownerDocument.body.classList.remove("print")},o.prototype.afterRender=function(){this.changeTitle(),null!==this.model.id&&this.setId(this.model.id),this.el.ownerDocument&&this.el.ownerDocument.body.classList.add("print")},o.prototype.reset=function(){this.setId(null),this.model.breadcrumbs=[],this.removeView(this.pageContainerSelector)},o.prototype.setUpPage=function(t){t.pageId&&this.setId(t.pageId),t.breadcrumbs?this.setBreadcrumbs(t.breadcrumbs,t):this.changeTitle(),this.listenTo(t,"afterRender",this.fitToPrintablePage)},o.prototype.setId=function(t){return this.isRendered()&&this.$el.attr("data-id",t),this.model.id=t,this},o.prototype.setBreadcrumbs=function(t,e){return null==t?this:("function"==typeof t&&(t=t.call(e)),Array.isArray(t)||(t=[t]),this.model.breadcrumbs=t.map(function(t){var e=typeof t;return"string"!==e&&"function"!==e||(t={label:t}),t}),this.changeTitle(),this)},o.prototype.changeTitle=function(){this.isRendered()&&this.broker.publish("page.titleChanged",t.pluck(this.model.breadcrumbs,"label"))},o.prototype.fitToPrintablePage=function(a){var r=this.$(".print-pages"),o=r.find(".print-page"),s=o.find(".print-page-hd"),p=o.find(".print-page-ft"),d=o.find(".print-page-bd"),l=e('<div class="print-page-bd-container"></div>');o.toggleClass("is-landscape",!!a.landscape),t.isFunction(a.hdLeft)&&s.find(".print-page-hd-left").html(a.hdLeft.call(a)),t.isFunction(a.hdRight)&&s.find(".print-page-hd-right").html(a.hdRight.call(a));var c,h=a.landscape?792:1122,g={top:parseFloat(o.css("padding-top"))||0,left:parseFloat(o.css("padding-left"))||0,right:parseFloat(o.css("padding-right"))||0,bottom:parseFloat(o.css("padding-bottom"))||0},u=s.outerHeight(!0),f=p.outerHeight(!0),b=h-g.top-g.bottom-u-f;c=t.isFunction(a.fitToPrintablePage)?a.fitToPrintablePage.call(a,b):t.isObject(a.view)&&t.isFunction(a.view.fitToPrintablePage)?a.view.fitToPrintablePage.call(a,b):[a.$el.detach()],l.height(b),d.wrap(l),o.detach(),c.forEach(function(t,e){var i=o.clone();i.find(".print-page-bd").append(t),i.find(".print-page-no").text(e+1),i.addClass("print-page-fit"),r.append(i)}),o.remove(),this.$(".print-page-count").text(c.length),this.$(".print-page-date").text(i.format(Date.now(),"LLL")),this.$(".print-page-user").text(n.data.name||n.data.login)},o});