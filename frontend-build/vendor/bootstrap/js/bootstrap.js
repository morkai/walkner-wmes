/* ========================================================================
 * Bootstrap: button.js v3.0.2
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

/* ========================================================================
 * Bootstrap: dropdown.js v3.0.2
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

/* ========================================================================
 * Bootstrap: modal.js v3.0.2
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

/* ========================================================================
 * Bootstrap: tooltip.js v3.0.2
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

/* ========================================================================
 * Bootstrap: popover.js v3.0.2
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

/* ========================================================================
 * Bootstrap: tab.js v3.0.2
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

/* ========================================================================
 * Bootstrap: affix.js v3.0.2
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

/* ========================================================================
 * Bootstrap: collapse.js v3.0.2
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

/* ========================================================================
 * Bootstrap: transition.js v3.0.2
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

+function(t){var e=function(o,i){this.$element=t(o),this.options=t.extend({},e.DEFAULTS,i)};e.DEFAULTS={loadingText:"loading..."},e.prototype.setState=function(t){var e="disabled",o=this.$element,i=o.is("input")?"val":"html",n=o.data();t+="Text",n.resetText||o.data("resetText",o[i]()),o[i](n[t]||this.options[t]),setTimeout(function(){"loadingText"==t?o.addClass(e).attr(e,e):o.removeClass(e).removeAttr(e)},0)},e.prototype.toggle=function(){var t=this.$element.closest('[data-toggle="buttons"]');if(t.length){var e=this.$element.find("input").prop("checked",!this.$element.hasClass("active")).trigger("change");"radio"===e.prop("type")&&t.find(".active").removeClass("active")}this.$element.toggleClass("active")};var o=t.fn.button;t.fn.button=function(o){return this.each(function(){var i=t(this),n=i.data("bs.button"),s="object"==typeof o&&o;n||i.data("bs.button",n=new e(this,s)),"toggle"==o?n.toggle():o&&n.setState(o)})},t.fn.button.Constructor=e,t.fn.button.noConflict=function(){return t.fn.button=o,this},t(document).on("click.bs.button.data-api","[data-toggle^=button]",function(e){var o=t(e.target);o.hasClass("btn")||(o=o.closest(".btn")),o.button("toggle"),e.preventDefault()})}(jQuery),+function(t){function e(){t(i).remove(),t(n).each(function(e){var i=o(t(this));i.hasClass("open")&&(i.trigger(e=t.Event("hide.bs.dropdown")),e.isDefaultPrevented()||i.removeClass("open").trigger("hidden.bs.dropdown"))})}function o(e){var o=e.attr("data-target");o||(o=e.attr("href"),o=o&&/#/.test(o)&&o.replace(/.*(?=#[^\s]*$)/,""));var i=o&&t(o);return i&&i.length?i:e.parent()}var i=".dropdown-backdrop",n="[data-toggle=dropdown]",s=function(e){t(e).on("click.bs.dropdown",this.toggle)};s.prototype.toggle=function(i){var n=t(this);if(!n.is(".disabled, :disabled")){var s=o(n),a=s.hasClass("open");if(e(),!a){if("ontouchstart"in document.documentElement&&!s.closest(".navbar-nav").length&&t('<div class="dropdown-backdrop"/>').insertAfter(t(this)).on("click",e),s.trigger(i=t.Event("show.bs.dropdown")),i.isDefaultPrevented())return;s.toggleClass("open").trigger("shown.bs.dropdown"),n.focus()}return!1}},s.prototype.keydown=function(e){if(/(38|40|27)/.test(e.keyCode)){var i=t(this);if(e.preventDefault(),e.stopPropagation(),!i.is(".disabled, :disabled")){var s=o(i),a=s.hasClass("open");if(!a||a&&27==e.keyCode)return 27==e.which&&s.find(n).focus(),i.click();var r=t("[role=menu] li:not(.divider):visible a",s);if(r.length){var l=r.index(r.filter(":focus"));38==e.keyCode&&l>0&&l--,40==e.keyCode&&l<r.length-1&&l++,~l||(l=0),r.eq(l).focus()}}}};var a=t.fn.dropdown;t.fn.dropdown=function(e){return this.each(function(){var o=t(this),i=o.data("dropdown");i||o.data("dropdown",i=new s(this)),"string"==typeof e&&i[e].call(o)})},t.fn.dropdown.Constructor=s,t.fn.dropdown.noConflict=function(){return t.fn.dropdown=a,this},t(document).on("click.bs.dropdown.data-api",e).on("click.bs.dropdown.data-api",".dropdown form",function(t){t.stopPropagation()}).on("click.bs.dropdown.data-api",n,s.prototype.toggle).on("keydown.bs.dropdown.data-api",n+", [role=menu]",s.prototype.keydown)}(jQuery),+function(t){var e=function(e,o){this.options=o,this.$element=t(e),this.$backdrop=this.isShown=null,this.options.remote&&this.$element.load(this.options.remote)};e.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},e.prototype.toggle=function(t){return this[this.isShown?"hide":"show"](t)},e.prototype.show=function(e){var o=this,i=t.Event("show.bs.modal",{relatedTarget:e});this.$element.trigger(i),this.isShown||i.isDefaultPrevented()||(this.isShown=!0,this.escape(),this.$element.on("click.dismiss.modal",'[data-dismiss="modal"]',t.proxy(this.hide,this)),this.backdrop(function(){var i=t.support.transition&&o.$element.hasClass("fade");o.$element.parent().length||o.$element.appendTo(document.body),o.$element.show(),i&&o.$element[0].offsetWidth,o.$element.addClass("in").attr("aria-hidden",!1),o.enforceFocus();var n=t.Event("shown.bs.modal",{relatedTarget:e});i?o.$element.find(".modal-dialog").one(t.support.transition.end,function(){o.$element.focus().trigger(n)}).emulateTransitionEnd(300):o.$element.focus().trigger(n)}))},e.prototype.hide=function(e){e&&e.preventDefault(),e=t.Event("hide.bs.modal"),this.$element.trigger(e),this.isShown&&!e.isDefaultPrevented()&&(this.isShown=!1,this.escape(),t(document).off("focusin.bs.modal"),this.$element.removeClass("in").attr("aria-hidden",!0).off("click.dismiss.modal"),t.support.transition&&this.$element.hasClass("fade")?this.$element.one(t.support.transition.end,t.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal())},e.prototype.enforceFocus=function(){t(document).off("focusin.bs.modal").on("focusin.bs.modal",t.proxy(function(t){this.$element[0]===t.target||this.$element.has(t.target).length||this.$element.focus()},this))},e.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keyup.dismiss.bs.modal",t.proxy(function(t){27==t.which&&this.hide()},this)):this.isShown||this.$element.off("keyup.dismiss.bs.modal")},e.prototype.hideModal=function(){var t=this;this.$element.hide(),this.backdrop(function(){t.removeBackdrop(),t.$element.trigger("hidden.bs.modal")})},e.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},e.prototype.backdrop=function(e){var o=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var i=t.support.transition&&o;if(this.$backdrop=t('<div class="modal-backdrop '+o+'" />').appendTo(document.body),this.$element.on("click.dismiss.modal",t.proxy(function(t){t.target===t.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus.call(this.$element[0]):this.hide.call(this))},this)),i&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!e)return;i?this.$backdrop.one(t.support.transition.end,e).emulateTransitionEnd(150):e()}else!this.isShown&&this.$backdrop?(this.$backdrop.removeClass("in"),t.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(t.support.transition.end,e).emulateTransitionEnd(150):e()):e&&e()};var o=t.fn.modal;t.fn.modal=function(o,i){return this.each(function(){var n=t(this),s=n.data("bs.modal"),a=t.extend({},e.DEFAULTS,n.data(),"object"==typeof o&&o);s||n.data("bs.modal",s=new e(this,a)),"string"==typeof o?s[o](i):a.show&&s.show(i)})},t.fn.modal.Constructor=e,t.fn.modal.noConflict=function(){return t.fn.modal=o,this},t(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(e){var o=t(this),i=o.attr("href"),n=t(o.attr("data-target")||i&&i.replace(/.*(?=#[^\s]+$)/,"")),s=n.data("modal")?"toggle":t.extend({remote:!/#/.test(i)&&i},n.data(),o.data());e.preventDefault(),n.modal(s,this).one("hide",function(){o.is(":visible")&&o.focus()})}),t(document).on("show.bs.modal",".modal",function(){t(document.body).addClass("modal-open")}).on("hidden.bs.modal",".modal",function(){t(document.body).removeClass("modal-open")})}(jQuery),+function(t){var e=function(t,e){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null,this.init("tooltip",t,e)};e.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1},e.prototype.init=function(e,o,i){this.enabled=!0,this.type=e,this.$element=t(o),this.options=this.getOptions(i);for(var n=this.options.trigger.split(" "),s=n.length;s--;){var a=n[s];if("click"==a)this.$element.on("click."+this.type,this.options.selector,t.proxy(this.toggle,this));else if("manual"!=a){var r="hover"==a?"mouseenter":"focus",l="hover"==a?"mouseleave":"blur";this.$element.on(r+"."+this.type,this.options.selector,t.proxy(this.enter,this)),this.$element.on(l+"."+this.type,this.options.selector,t.proxy(this.leave,this))}}this.options.selector?this._options=t.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},e.prototype.getDefaults=function(){return e.DEFAULTS},e.prototype.getOptions=function(e){return e=t.extend({},this.getDefaults(),this.$element.data(),e),e.delay&&"number"==typeof e.delay&&(e.delay={show:e.delay,hide:e.delay}),e},e.prototype.getDelegateOptions=function(){var e={},o=this.getDefaults();return this._options&&t.each(this._options,function(t,i){o[t]!=i&&(e[t]=i)}),e},e.prototype.enter=function(e){var o=e instanceof this.constructor?e:t(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);return clearTimeout(o.timeout),o.hoverState="in",o.options.delay&&o.options.delay.show?void(o.timeout=setTimeout(function(){"in"==o.hoverState&&o.show()},o.options.delay.show)):o.show()},e.prototype.leave=function(e){var o=e instanceof this.constructor?e:t(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);return clearTimeout(o.timeout),o.hoverState="out",o.options.delay&&o.options.delay.hide?void(o.timeout=setTimeout(function(){"out"==o.hoverState&&o.hide()},o.options.delay.hide)):o.hide()},e.prototype.show=function(){var e=t.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){if(this.$element.trigger(e),e.isDefaultPrevented())return;var o=this.tip();this.setContent(),this.options.animation&&o.addClass("fade");var i="function"==typeof this.options.placement?this.options.placement.call(this,o[0],this.$element[0]):this.options.placement,n=/\s?auto?\s?/i,s=n.test(i);s&&(i=i.replace(n,"")||"top"),o.detach().css({top:0,left:0,display:"block"}).addClass(i),this.options.container?o.appendTo(this.options.container):o.insertAfter(this.$element);var a=this.getPosition(),r=o[0].offsetWidth,l=o[0].offsetHeight;if(s){var p=this.$element.parent(),h=i,d=document.documentElement.scrollTop||document.body.scrollTop,f="body"==this.options.container?window.innerWidth:p.outerWidth(),c="body"==this.options.container?window.innerHeight:p.outerHeight(),u="body"==this.options.container?0:p.offset().left;i="bottom"==i&&a.top+a.height+l-d>c?"top":"top"==i&&a.top-d-l<0?"bottom":"right"==i&&a.right+r>f?"left":"left"==i&&a.left-r<u?"right":i,o.removeClass(h).addClass(i)}var m=this.getCalculatedOffset(i,a,r,l);this.applyPlacement(m,i),this.$element.trigger("shown.bs."+this.type)}},e.prototype.applyPlacement=function(t,e){var o,i=this.tip(),n=i[0].offsetWidth,s=i[0].offsetHeight,a=parseInt(i.css("margin-top"),10),r=parseInt(i.css("margin-left"),10);isNaN(a)&&(a=0),isNaN(r)&&(r=0),t.top=t.top+a,t.left=t.left+r,i.offset(t).addClass("in");var l=i[0].offsetWidth,p=i[0].offsetHeight;if("top"==e&&p!=s&&(o=!0,t.top=t.top+s-p),/bottom|top/.test(e)){var h=0;t.left<0&&(h=-2*t.left,t.left=0,i.offset(t),l=i[0].offsetWidth,p=i[0].offsetHeight),this.replaceArrow(h-n+l,l,"left")}else this.replaceArrow(p-s,p,"top");o&&i.offset(t)},e.prototype.replaceArrow=function(t,e,o){this.arrow().css(o,t?50*(1-t/e)+"%":"")},e.prototype.setContent=function(){var t=this.tip(),e=this.getTitle();t.find(".tooltip-inner")[this.options.html?"html":"text"](e),t.removeClass("fade in top bottom left right")},e.prototype.hide=function(){function e(){"in"!=o.hoverState&&i.detach()}var o=this,i=this.tip(),n=t.Event("hide.bs."+this.type);return this.$element.trigger(n),n.isDefaultPrevented()?void 0:(i.removeClass("in"),t.support.transition&&this.$tip.hasClass("fade")?i.one(t.support.transition.end,e).emulateTransitionEnd(150):e(),this.$element.trigger("hidden.bs."+this.type),this)},e.prototype.fixTitle=function(){var t=this.$element;(t.attr("title")||"string"!=typeof t.attr("data-original-title"))&&t.attr("data-original-title",t.attr("title")||"").attr("title","")},e.prototype.hasContent=function(){return this.getTitle()},e.prototype.getPosition=function(){var e=this.$element[0];return t.extend({},"function"==typeof e.getBoundingClientRect?e.getBoundingClientRect():{width:e.offsetWidth,height:e.offsetHeight},this.$element.offset())},e.prototype.getCalculatedOffset=function(t,e,o,i){return"bottom"==t?{top:e.top+e.height,left:e.left+e.width/2-o/2}:"top"==t?{top:e.top-i,left:e.left+e.width/2-o/2}:"left"==t?{top:e.top+e.height/2-i/2,left:e.left-o}:{top:e.top+e.height/2-i/2,left:e.left+e.width}},e.prototype.getTitle=function(){var t,e=this.$element,o=this.options;return t=e.attr("data-original-title")||("function"==typeof o.title?o.title.call(e[0]):o.title)},e.prototype.tip=function(){return this.$tip=this.$tip||t(this.options.template)},e.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},e.prototype.validate=function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},e.prototype.enable=function(){this.enabled=!0},e.prototype.disable=function(){this.enabled=!1},e.prototype.toggleEnabled=function(){this.enabled=!this.enabled},e.prototype.toggle=function(e){var o=e?t(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type):this;o.tip().hasClass("in")?o.leave(o):o.enter(o)},e.prototype.destroy=function(){this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var o=t.fn.tooltip;t.fn.tooltip=function(o){return this.each(function(){var i=t(this),n=i.data("bs.tooltip"),s="object"==typeof o&&o;n||i.data("bs.tooltip",n=new e(this,s)),"string"==typeof o&&n[o]()})},t.fn.tooltip.Constructor=e,t.fn.tooltip.noConflict=function(){return t.fn.tooltip=o,this}}(jQuery),+function(t){var e=function(t,e){this.init("popover",t,e)};if(!t.fn.tooltip)throw new Error("Popover requires tooltip.js");e.DEFAULTS=t.extend({},t.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),e.prototype=t.extend({},t.fn.tooltip.Constructor.prototype),e.prototype.constructor=e,e.prototype.getDefaults=function(){return e.DEFAULTS},e.prototype.setContent=function(){var t=this.tip(),e=this.getTitle(),o=this.getContent();t.find(".popover-title")[this.options.html?"html":"text"](e),t.find(".popover-content")[this.options.html?"html":"text"](o),t.removeClass("fade top bottom left right in"),t.find(".popover-title").html()||t.find(".popover-title").hide()},e.prototype.hasContent=function(){return this.getTitle()||this.getContent()},e.prototype.getContent=function(){var t=this.$element,e=this.options;return t.attr("data-content")||("function"==typeof e.content?e.content.call(t[0]):e.content)},e.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")},e.prototype.tip=function(){return this.$tip||(this.$tip=t(this.options.template)),this.$tip};var o=t.fn.popover;t.fn.popover=function(o){return this.each(function(){var i=t(this),n=i.data("bs.popover"),s="object"==typeof o&&o;n||i.data("bs.popover",n=new e(this,s)),"string"==typeof o&&n[o]()})},t.fn.popover.Constructor=e,t.fn.popover.noConflict=function(){return t.fn.popover=o,this}}(jQuery),+function(t){var e=function(e){this.element=t(e)};e.prototype.show=function(){var e=this.element,o=e.closest("ul:not(.dropdown-menu)"),i=e.data("target");if(i||(i=e.attr("href"),i=i&&i.replace(/.*(?=#[^\s]*$)/,"")),!e.parent("li").hasClass("active")){var n=o.find(".active:last a")[0],s=t.Event("show.bs.tab",{relatedTarget:n});if(e.trigger(s),!s.isDefaultPrevented()){var a=t(i);this.activate(e.parent("li"),o),this.activate(a,a.parent(),function(){e.trigger({type:"shown.bs.tab",relatedTarget:n})})}}},e.prototype.activate=function(e,o,i){function n(){s.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"),e.addClass("active"),a?(e[0].offsetWidth,e.addClass("in")):e.removeClass("fade"),e.parent(".dropdown-menu")&&e.closest("li.dropdown").addClass("active"),i&&i()}var s=o.find("> .active"),a=i&&t.support.transition&&s.hasClass("fade");a?s.one(t.support.transition.end,n).emulateTransitionEnd(150):n(),s.removeClass("in")};var o=t.fn.tab;t.fn.tab=function(o){return this.each(function(){var i=t(this),n=i.data("bs.tab");n||i.data("bs.tab",n=new e(this)),"string"==typeof o&&n[o]()})},t.fn.tab.Constructor=e,t.fn.tab.noConflict=function(){return t.fn.tab=o,this},t(document).on("click.bs.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(e){e.preventDefault(),t(this).tab("show")})}(jQuery),+function(t){var e=function(o,i){this.options=t.extend({},e.DEFAULTS,i),this.$window=t(window).on("scroll.bs.affix.data-api",t.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",t.proxy(this.checkPositionWithEventLoop,this)),this.$element=t(o),this.affixed=this.unpin=null,this.checkPosition()};e.RESET="affix affix-top affix-bottom",e.DEFAULTS={offset:0},e.prototype.checkPositionWithEventLoop=function(){setTimeout(t.proxy(this.checkPosition,this),1)},e.prototype.checkPosition=function(){if(this.$element.is(":visible")){var o=t(document).height(),i=this.$window.scrollTop(),n=this.$element.offset(),s=this.options.offset,a=s.top,r=s.bottom;"object"!=typeof s&&(r=a=s),"function"==typeof a&&(a=s.top()),"function"==typeof r&&(r=s.bottom());var l=null!=this.unpin&&i+this.unpin<=n.top?!1:null!=r&&n.top+this.$element.height()>=o-r?"bottom":null!=a&&a>=i?"top":!1;this.affixed!==l&&(this.unpin&&this.$element.css("top",""),this.affixed=l,this.unpin="bottom"==l?n.top-i:null,this.$element.removeClass(e.RESET).addClass("affix"+(l?"-"+l:"")),"bottom"==l&&this.$element.offset({top:document.body.offsetHeight-r-this.$element.height()}))}};var o=t.fn.affix;t.fn.affix=function(o){return this.each(function(){var i=t(this),n=i.data("bs.affix"),s="object"==typeof o&&o;n||i.data("bs.affix",n=new e(this,s)),"string"==typeof o&&n[o]()})},t.fn.affix.Constructor=e,t.fn.affix.noConflict=function(){return t.fn.affix=o,this},t(window).on("load",function(){t('[data-spy="affix"]').each(function(){var e=t(this),o=e.data();o.offset=o.offset||{},o.offsetBottom&&(o.offset.bottom=o.offsetBottom),o.offsetTop&&(o.offset.top=o.offsetTop),e.affix(o)})})}(jQuery),+function(t){var e=function(o,i){this.$element=t(o),this.options=t.extend({},e.DEFAULTS,i),this.transitioning=null,this.options.parent&&(this.$parent=t(this.options.parent)),this.options.toggle&&this.toggle()};e.DEFAULTS={toggle:!0},e.prototype.dimension=function(){var t=this.$element.hasClass("width");return t?"width":"height"},e.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var e=t.Event("show.bs.collapse");if(this.$element.trigger(e),!e.isDefaultPrevented()){var o=this.$parent&&this.$parent.find("> .panel > .in");if(o&&o.length){var i=o.data("bs.collapse");if(i&&i.transitioning)return;o.collapse("hide"),i||o.data("bs.collapse",null)}var n=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[n](0),this.transitioning=1;var s=function(){this.$element.removeClass("collapsing").addClass("in")[n]("auto"),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!t.support.transition)return s.call(this);var a=t.camelCase(["scroll",n].join("-"));this.$element.one(t.support.transition.end,t.proxy(s,this)).emulateTransitionEnd(350)[n](this.$element[0][a])}}},e.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var e=t.Event("hide.bs.collapse");if(this.$element.trigger(e),!e.isDefaultPrevented()){var o=this.dimension();this.$element[o](this.$element[o]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse").removeClass("in"),this.transitioning=1;var i=function(){this.transitioning=0,this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")};return t.support.transition?void this.$element[o](0).one(t.support.transition.end,t.proxy(i,this)).emulateTransitionEnd(350):i.call(this)}}},e.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()};var o=t.fn.collapse;t.fn.collapse=function(o){return this.each(function(){var i=t(this),n=i.data("bs.collapse"),s=t.extend({},e.DEFAULTS,i.data(),"object"==typeof o&&o);n||i.data("bs.collapse",n=new e(this,s)),"string"==typeof o&&n[o]()})},t.fn.collapse.Constructor=e,t.fn.collapse.noConflict=function(){return t.fn.collapse=o,this},t(document).on("click.bs.collapse.data-api","[data-toggle=collapse]",function(e){var o,i=t(this),n=i.attr("data-target")||e.preventDefault()||(o=i.attr("href"))&&o.replace(/.*(?=#[^\s]+$)/,""),s=t(n),a=s.data("bs.collapse"),r=a?"toggle":i.data(),l=i.attr("data-parent"),p=l&&t(l);a&&a.transitioning||(p&&p.find('[data-toggle=collapse][data-parent="'+l+'"]').not(i).addClass("collapsed"),i[s.hasClass("in")?"addClass":"removeClass"]("collapsed")),s.collapse(r)})}(jQuery),+function(t){function e(){var t=document.createElement("bootstrap"),e={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var o in e)if(void 0!==t.style[o])return{end:e[o]}}t.fn.emulateTransitionEnd=function(e){var o=!1,i=this;t(this).one(t.support.transition.end,function(){o=!0});var n=function(){o||t(i).trigger(t.support.transition.end)};return setTimeout(n,e),this},t(function(){t.support.transition=e()})}(jQuery);