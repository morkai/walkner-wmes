// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","jquery","app/user","../View","app/core/templates/blankLayout"],function(e,t,r,i,n){"use strict";var a=i.extend({pageContainerSelector:".blank-page-bd",template:n});return a.prototype.initialize=function(){this.model={breadcrumbs:[]}},a.prototype.afterRender=function(){this.changeTitle()},a.prototype.reset=function(){this.removeView(this.pageContainerSelector)},a.prototype.setUpPage=function(e){e.breadcrumbs?this.setBreadcrumbs(e.breadcrumbs,e):this.changeTitle()},a.prototype.setBreadcrumbs=function(e,t){return null==e?this:("function"==typeof e&&(e=e.call(t)),Array.isArray(e)||(e=[e]),this.model.breadcrumbs=e.map(function(e){var t=typeof e;return("string"===t||"function"===t)&&(e={label:e}),e}),this.changeTitle(),this)},a.prototype.changeTitle=function(){this.isRendered()&&this.broker.publish("page.titleChanged",e.pluck(this.model.breadcrumbs,"label"))},a});