if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");!function(t){"use strict";var e=t.fn.jquery.split(" ")[0].split(".");if(e[0]<2&&e[1]<9||1==e[0]&&9==e[1]&&e[2]<1)throw new Error("Bootstrap's JavaScript requires jQuery version 1.9.1 or higher")}(jQuery),function(t){"use strict";var e=function(o,i){this.$element=t(o),this.options=t.extend({},e.DEFAULTS,i),this.isLoading=!1};function o(o){return this.each(function(){var i=t(this),n=i.data("bs.button"),s="object"==typeof o&&o;n||i.data("bs.button",n=new e(this,s)),"toggle"==o?n.toggle():o&&n.setState(o)})}e.VERSION="3.3.2",e.DEFAULTS={loadingText:"loading..."},e.prototype.setState=function(e){var o="disabled",i=this.$element,n=i.is("input")?"val":"html",s=i.data();e+="Text",null==s.resetText&&i.data("resetText",i[n]()),setTimeout(t.proxy(function(){i[n](null==s[e]?this.options[e]:s[e]),"loadingText"==e?(this.isLoading=!0,i.addClass(o).attr(o,o)):this.isLoading&&(this.isLoading=!1,i.removeClass(o).removeAttr(o))},this),0)},e.prototype.toggle=function(){var t=!0,e=this.$element.closest('[data-toggle="buttons"]');if(e.length){var o=this.$element.find("input");"radio"==o.prop("type")&&(o.prop("checked")&&this.$element.hasClass("active")?t=!1:e.find(".active").removeClass("active")),t&&o.prop("checked",!this.$element.hasClass("active")).trigger("change")}else this.$element.attr("aria-pressed",!this.$element.hasClass("active"));t&&this.$element.toggleClass("active")};var i=t.fn.button;t.fn.button=o,t.fn.button.Constructor=e,t.fn.button.noConflict=function(){return t.fn.button=i,this},t(document).on("click.bs.button.data-api",'[data-toggle^="button"]',function(e){var i=t(e.target);i.hasClass("btn")||(i=i.closest(".btn")),o.call(i,"toggle"),e.preventDefault()}).on("focus.bs.button.data-api blur.bs.button.data-api",'[data-toggle^="button"]',function(e){t(e.target).closest(".btn").toggleClass("focus",/^focus(in)?$/.test(e.type))})}(jQuery),function(t){"use strict";var e=".dropdown-backdrop",o='[data-toggle="dropdown"]',i=function(e){t(e).on("click.bs.dropdown",this.toggle)};function n(i){i&&3===i.which||(t(e).remove(),t(o).each(function(){var e=t(this),o=s(e),n={relatedTarget:this};o.hasClass("open")&&(o.trigger(i=t.Event("hide.bs.dropdown",n)),i.isDefaultPrevented()||(e.attr("aria-expanded","false"),o.removeClass("open").trigger("hidden.bs.dropdown",n)))}))}function s(e){var o=e.attr("data-target");o||(o=(o=e.attr("href"))&&/#[A-Za-z]/.test(o)&&o.replace(/.*(?=#[^\s]*$)/,""));var i=o&&t(o);return i&&i.length?i:e.parent()}i.VERSION="3.3.2",i.prototype.toggle=function(e){var o=t(this);if(!o.is(".disabled, :disabled")){var i=s(o),a=i.hasClass("open");if(n(),!a){"ontouchstart"in document.documentElement&&!i.closest(".navbar-nav").length&&t('<div class="dropdown-backdrop"/>').insertAfter(t(this)).on("click",n);var r={relatedTarget:this};if(i.trigger(e=t.Event("show.bs.dropdown",r)),e.isDefaultPrevented())return;o.trigger("focus").attr("aria-expanded","true"),i.toggleClass("open").trigger("shown.bs.dropdown",r)}return!1}},i.prototype.keydown=function(e){if(/(38|40|27|32)/.test(e.which)&&!/input|textarea/i.test(e.target.tagName)){var i=t(this);if(e.preventDefault(),e.stopPropagation(),!i.is(".disabled, :disabled")){var n=s(i),a=n.hasClass("open");if(!a&&27!=e.which||a&&27==e.which)return 27==e.which&&n.find(o).trigger("focus"),i.trigger("click");var r=" li:not(.divider):visible a",l=n.find('[role="menu"]'+r+', [role="listbox"]'+r);if(l.length){var d=l.index(e.target);38==e.which&&d>0&&d--,40==e.which&&d<l.length-1&&d++,~d||(d=0),l.eq(d).trigger("focus")}}}};var a=t.fn.dropdown;t.fn.dropdown=function(e){return this.each(function(){var o=t(this),n=o.data("bs.dropdown");n||o.data("bs.dropdown",n=new i(this)),"string"==typeof e&&n[e].call(o)})},t.fn.dropdown.Constructor=i,t.fn.dropdown.noConflict=function(){return t.fn.dropdown=a,this},t(document).on("click.bs.dropdown.data-api",n).on("click.bs.dropdown.data-api",".dropdown form",function(t){t.stopPropagation()}).on("click.bs.dropdown.data-api",o,i.prototype.toggle).on("keydown.bs.dropdown.data-api",o,i.prototype.keydown).on("keydown.bs.dropdown.data-api",'[role="menu"]',i.prototype.keydown).on("keydown.bs.dropdown.data-api",'[role="listbox"]',i.prototype.keydown)}(jQuery),function(t){"use strict";var e=function(e,o){this.options=o,this.$body=t(document.body),this.$element=t(e),this.$backdrop=this.isShown=null,this.scrollbarWidth=0,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,t.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))};function o(o,i){return this.each(function(){var n=t(this),s=n.data("bs.modal"),a=t.extend({},e.DEFAULTS,n.data(),"object"==typeof o&&o);s||n.data("bs.modal",s=new e(this,a)),"string"==typeof o?s[o](i):a.show&&s.show(i)})}e.VERSION="3.3.2",e.TRANSITION_DURATION=300,e.BACKDROP_TRANSITION_DURATION=150,e.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},e.prototype.toggle=function(t){return this.isShown?this.hide():this.show(t)},e.prototype.show=function(o){var i=this,n=t.Event("show.bs.modal",{relatedTarget:o});this.$element.trigger(n),this.isShown||n.isDefaultPrevented()||(this.isShown=!0,this.checkScrollbar(),this.setScrollbar(),this.$body.addClass("modal-open"),this.escape(),this.resize(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',t.proxy(this.hide,this)),this.backdrop(function(){var n=t.support.transition&&i.$element.hasClass("fade");i.$element.parent().length||i.$element.appendTo(i.$body),i.$element.show().scrollTop(0),i.options.backdrop&&i.adjustBackdrop(),i.adjustDialog(),n&&i.$element[0].offsetWidth,i.$element.addClass("in").attr("aria-hidden",!1),i.enforceFocus();var s=t.Event("shown.bs.modal",{relatedTarget:o});n?i.$element.find(".modal-dialog").one("bsTransitionEnd",function(){i.$element.trigger("focus").trigger(s)}).emulateTransitionEnd(e.TRANSITION_DURATION):i.$element.trigger("focus").trigger(s)}))},e.prototype.hide=function(o){o&&o.preventDefault(),o=t.Event("hide.bs.modal"),this.$element.trigger(o),this.isShown&&!o.isDefaultPrevented()&&(this.isShown=!1,this.escape(),this.resize(),t(document).off("focusin.bs.modal"),this.$element.removeClass("in").attr("aria-hidden",!0).off("click.dismiss.bs.modal"),t.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",t.proxy(this.hideModal,this)).emulateTransitionEnd(e.TRANSITION_DURATION):this.hideModal())},e.prototype.enforceFocus=function(){t(document).off("focusin.bs.modal").on("focusin.bs.modal",t.proxy(function(t){this.$element[0]===t.target||this.$element.has(t.target).length||this.$element.trigger("focus")},this))},e.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keydown.dismiss.bs.modal",t.proxy(function(t){27==t.which&&this.hide()},this)):this.isShown||this.$element.off("keydown.dismiss.bs.modal")},e.prototype.resize=function(){this.isShown?t(window).on("resize.bs.modal",t.proxy(this.handleUpdate,this)):t(window).off("resize.bs.modal")},e.prototype.hideModal=function(){var t=this;this.$element.hide(),this.backdrop(function(){t.$body.removeClass("modal-open"),t.resetAdjustments(),t.resetScrollbar(),t.$element.trigger("hidden.bs.modal")})},e.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},e.prototype.backdrop=function(o){var i=this,n=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var s=t.support.transition&&n;if(this.$backdrop=t('<div class="modal-backdrop '+n+'" />').prependTo(this.$element).on("click.dismiss.bs.modal",t.proxy(function(t){t.target===t.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus.call(this.$element[0]):this.hide.call(this))},this)),s&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!o)return;s?this.$backdrop.one("bsTransitionEnd",o).emulateTransitionEnd(e.BACKDROP_TRANSITION_DURATION):o()}else if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");var a=function(){i.removeBackdrop(),o&&o()};t.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one("bsTransitionEnd",a).emulateTransitionEnd(e.BACKDROP_TRANSITION_DURATION):a()}else o&&o()},e.prototype.handleUpdate=function(){this.options.backdrop&&this.adjustBackdrop(),this.adjustDialog()},e.prototype.adjustBackdrop=function(){this.$backdrop.css("height",0).css("height",this.$element[0].scrollHeight)},e.prototype.adjustDialog=function(){var t=this.$element[0].scrollHeight>document.documentElement.clientHeight;this.$element.css({paddingLeft:!this.bodyIsOverflowing&&t?this.scrollbarWidth:"",paddingRight:this.bodyIsOverflowing&&!t?this.scrollbarWidth:""})},e.prototype.resetAdjustments=function(){this.$element.css({paddingLeft:"",paddingRight:""})},e.prototype.checkScrollbar=function(){this.bodyIsOverflowing=document.body.scrollHeight>document.documentElement.clientHeight,this.scrollbarWidth=this.measureScrollbar()},e.prototype.setScrollbar=function(){var t=parseInt(this.$body.css("padding-right")||0,10);this.bodyIsOverflowing&&this.$body.css("padding-right",t+this.scrollbarWidth)},e.prototype.resetScrollbar=function(){this.$body.css("padding-right","")},e.prototype.measureScrollbar=function(){var t=document.createElement("div");t.className="modal-scrollbar-measure",this.$body.append(t);var e=t.offsetWidth-t.clientWidth;return this.$body[0].removeChild(t),e};var i=t.fn.modal;t.fn.modal=o,t.fn.modal.Constructor=e,t.fn.modal.noConflict=function(){return t.fn.modal=i,this},t(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(e){var i=t(this),n=i.attr("href"),s=t(i.attr("data-target")||n&&n.replace(/.*(?=#[^\s]+$)/,"")),a=s.data("bs.modal")?"toggle":t.extend({remote:!/#/.test(n)&&n},s.data(),i.data());i.is("a")&&e.preventDefault(),s.one("show.bs.modal",function(t){t.isDefaultPrevented()||s.one("hidden.bs.modal",function(){i.is(":visible")&&i.trigger("focus")})}),o.call(s,a,this)})}(jQuery),function(t){"use strict";var e=function(t,e){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null,this.init("tooltip",t,e)};e.VERSION="3.3.2",e.TRANSITION_DURATION=150,e.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0}},e.prototype.init=function(e,o,i){this.enabled=!0,this.type=e,this.$element=t(o),this.options=this.getOptions(i),this.$viewport=this.options.viewport&&t(this.options.viewport.selector||this.options.viewport);for(var n=this.options.trigger.split(" "),s=n.length;s--;){var a=n[s];if("click"==a)this.$element.on("click."+this.type,this.options.selector,t.proxy(this.toggle,this));else if("manual"!=a){var r="hover"==a?"mouseenter":"focusin",l="hover"==a?"mouseleave":"focusout";this.$element.on(r+"."+this.type,this.options.selector,t.proxy(this.enter,this)),this.$element.on(l+"."+this.type,this.options.selector,t.proxy(this.leave,this))}}this.options.selector?this._options=t.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},e.prototype.getDefaults=function(){return e.DEFAULTS},e.prototype.getOptions=function(e){return(e=t.extend({},this.getDefaults(),this.$element.data(),e)).delay&&"number"==typeof e.delay&&(e.delay={show:e.delay,hide:e.delay}),e},e.prototype.getDelegateOptions=function(){var e={},o=this.getDefaults();return this._options&&t.each(this._options,function(t,i){o[t]!=i&&(e[t]=i)}),e},e.prototype.enter=function(e){var o=e instanceof this.constructor?e:t(e.currentTarget).data("bs."+this.type);if(o&&o.$tip&&o.$tip.is(":visible"))o.hoverState="in";else{if(o||(o=new this.constructor(e.currentTarget,this.getDelegateOptions()),t(e.currentTarget).data("bs."+this.type,o)),clearTimeout(o.timeout),o.hoverState="in",!o.options.delay||!o.options.delay.show)return o.show();o.timeout=setTimeout(function(){"in"==o.hoverState&&o.show()},o.options.delay.show)}},e.prototype.leave=function(e){var o=e instanceof this.constructor?e:t(e.currentTarget).data("bs."+this.type);if(o||(o=new this.constructor(e.currentTarget,this.getDelegateOptions()),t(e.currentTarget).data("bs."+this.type,o)),clearTimeout(o.timeout),o.hoverState="out",!o.options.delay||!o.options.delay.hide)return o.hide();o.timeout=setTimeout(function(){"out"==o.hoverState&&o.hide()},o.options.delay.hide)},e.prototype.show=function(){var o=t.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(o);var i=t.contains(this.$element[0].ownerDocument.documentElement,this.$element[0]);if(o.isDefaultPrevented()||!i)return;var n=this,s=this.tip(),a=this.getUID(this.type);this.setContent(),s.attr("id",a),this.$element.attr("aria-describedby",a),this.options.animation&&s.addClass("fade");var r="function"==typeof this.options.placement?this.options.placement.call(this,s[0],this.$element[0]):this.options.placement,l=/\s?auto?\s?/i,d=l.test(r);d&&(r=r.replace(l,"")||"top"),s.detach().css({top:0,left:0,display:"block"}).addClass(r).data("bs."+this.type,this),this.options.container?s.appendTo(this.options.container):s.insertAfter(this.$element);var h=this.getPosition(),p=s[0].offsetWidth,c=s[0].offsetHeight;if(d){var f=r,u=this.options.container?t(this.options.container):this.$element.parent(),g=this.getPosition(u);r="bottom"==r&&h.bottom+c>g.bottom?"top":"top"==r&&h.top-c<g.top?"bottom":"right"==r&&h.right+p>g.width?"left":"left"==r&&h.left-p<g.left?"right":r,s.removeClass(f).addClass(r)}var m=this.getCalculatedOffset(r,h,p,c);this.applyPlacement(m,r);var v=function(){var t=n.hoverState;n.$element.trigger("shown.bs."+n.type),n.hoverState=null,"out"==t&&n.leave(n)};t.support.transition&&this.$tip.hasClass("fade")?s.one("bsTransitionEnd",v).emulateTransitionEnd(e.TRANSITION_DURATION):v()}},e.prototype.applyPlacement=function(e,o){var i=this.tip(),n=i[0].offsetWidth,s=i[0].offsetHeight,a=parseInt(i.css("margin-top"),10),r=parseInt(i.css("margin-left"),10);isNaN(a)&&(a=0),isNaN(r)&&(r=0),e.top=e.top+a,e.left=e.left+r,t.offset.setOffset(i[0],t.extend({using:function(t){i.css({top:Math.round(t.top),left:Math.round(t.left)})}},e),0),i.addClass("in");var l=i[0].offsetWidth,d=i[0].offsetHeight;"top"==o&&d!=s&&(e.top=e.top+s-d);var h=this.getViewportAdjustedDelta(o,e,l,d);h.left?e.left+=h.left:e.top+=h.top;var p=/top|bottom/.test(o),c=p?2*h.left-n+l:2*h.top-s+d,f=p?"offsetWidth":"offsetHeight";i.offset(e),this.replaceArrow(c,i[0][f],p)},e.prototype.replaceArrow=function(t,e,o){this.arrow().css(o?"left":"top",50*(1-t/e)+"%").css(o?"top":"left","")},e.prototype.setContent=function(){var t=this.tip(),e=this.getTitle();t.find(".tooltip-inner")[this.options.html?"html":"text"](e),t.removeClass("fade in top bottom left right")},e.prototype.hide=function(o){var i=this,n=this.tip(),s=t.Event("hide.bs."+this.type);function a(){"in"!=i.hoverState&&n.detach(),i.$element.removeAttr("aria-describedby").trigger("hidden.bs."+i.type),o&&o()}if(this.$element.trigger(s),!s.isDefaultPrevented())return n.removeClass("in"),t.support.transition&&this.$tip.hasClass("fade")?n.one("bsTransitionEnd",a).emulateTransitionEnd(e.TRANSITION_DURATION):a(),this.hoverState=null,this},e.prototype.fixTitle=function(){var t=this.$element;(t.attr("title")||"string"!=typeof t.attr("data-original-title"))&&t.attr("data-original-title",t.attr("title")||"").attr("title","")},e.prototype.hasContent=function(){return this.getTitle()},e.prototype.getPosition=function(e){var o=(e=e||this.$element)[0],i="BODY"==o.tagName,n=o.getBoundingClientRect();null==n.width&&(n=t.extend({},n,{width:n.right-n.left,height:n.bottom-n.top}));var s=i?{top:0,left:0}:e.offset(),a={scroll:i?document.documentElement.scrollTop||document.body.scrollTop:e.scrollTop()},r=i?{width:t(window).width(),height:t(window).height()}:null;return t.extend({},n,a,r,s)},e.prototype.getCalculatedOffset=function(t,e,o,i){return"bottom"==t?{top:e.top+e.height,left:e.left+e.width/2-o/2}:"top"==t?{top:e.top-i,left:e.left+e.width/2-o/2}:"left"==t?{top:e.top+e.height/2-i/2,left:e.left-o}:{top:e.top+e.height/2-i/2,left:e.left+e.width}},e.prototype.getViewportAdjustedDelta=function(t,e,o,i){var n={top:0,left:0};if(!this.$viewport)return n;var s=this.options.viewport&&this.options.viewport.padding||0,a=this.getPosition(this.$viewport);if(/right|left/.test(t)){var r=e.top-s-a.scroll,l=e.top+s-a.scroll+i;r<a.top?n.top=a.top-r:l>a.top+a.height&&(n.top=a.top+a.height-l)}else{var d=e.left-s,h=e.left+s+o;d<a.left?n.left=a.left-d:h>a.width&&(n.left=a.left+a.width-h)}return n},e.prototype.getTitle=function(){var t=this.$element,e=this.options;return t.attr("data-original-title")||("function"==typeof e.title?e.title.call(t[0]):e.title)},e.prototype.getUID=function(t){do{t+=~~(1e6*Math.random())}while(document.getElementById(t));return t},e.prototype.tip=function(){return this.$tip=this.$tip||t(this.options.template)},e.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},e.prototype.enable=function(){this.enabled=!0},e.prototype.disable=function(){this.enabled=!1},e.prototype.toggleEnabled=function(){this.enabled=!this.enabled},e.prototype.toggle=function(e){var o=this;e&&((o=t(e.currentTarget).data("bs."+this.type))||(o=new this.constructor(e.currentTarget,this.getDelegateOptions()),t(e.currentTarget).data("bs."+this.type,o))),o.tip().hasClass("in")?o.leave(o):o.enter(o)},e.prototype.destroy=function(){var t=this;clearTimeout(this.timeout),this.hide(function(){t.$element.off("."+t.type).removeData("bs."+t.type)})};var o=t.fn.tooltip;t.fn.tooltip=function(o){return this.each(function(){var i=t(this),n=i.data("bs.tooltip"),s="object"==typeof o&&o;(n||"destroy"!=o)&&(n||i.data("bs.tooltip",n=new e(this,s)),"string"==typeof o&&n[o]())})},t.fn.tooltip.Constructor=e,t.fn.tooltip.noConflict=function(){return t.fn.tooltip=o,this}}(jQuery),function(t){"use strict";var e=function(t,e){this.init("popover",t,e)};if(!t.fn.tooltip)throw new Error("Popover requires tooltip.js");e.VERSION="3.3.2",e.DEFAULTS=t.extend({},t.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),e.prototype=t.extend({},t.fn.tooltip.Constructor.prototype),e.prototype.constructor=e,e.prototype.getDefaults=function(){return e.DEFAULTS},e.prototype.setContent=function(){var t=this.tip(),e=this.getTitle(),o=this.getContent();t.find(".popover-title")[this.options.html?"html":"text"](e),t.find(".popover-content").children().detach().end()[this.options.html?"string"==typeof o?"html":"append":"text"](o),t.removeClass("fade top bottom left right in"),t.find(".popover-title").html()||t.find(".popover-title").hide()},e.prototype.hasContent=function(){return this.getTitle()||this.getContent()},e.prototype.getContent=function(){var t=this.$element,e=this.options;return t.attr("data-content")||("function"==typeof e.content?e.content.call(t[0]):e.content)},e.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")},e.prototype.tip=function(){return this.$tip||(this.$tip=t(this.options.template)),this.$tip};var o=t.fn.popover;t.fn.popover=function(o){return this.each(function(){var i=t(this),n=i.data("bs.popover"),s="object"==typeof o&&o;(n||"destroy"!=o)&&(n||i.data("bs.popover",n=new e(this,s)),"string"==typeof o&&n[o]())})},t.fn.popover.Constructor=e,t.fn.popover.noConflict=function(){return t.fn.popover=o,this}}(jQuery),function(t){"use strict";var e=function(e){this.element=t(e)};function o(o){return this.each(function(){var i=t(this),n=i.data("bs.tab");n||i.data("bs.tab",n=new e(this)),"string"==typeof o&&n[o]()})}e.VERSION="3.3.2",e.TRANSITION_DURATION=150,e.prototype.show=function(){var e=this.element,o=e.closest("ul:not(.dropdown-menu)"),i=e.data("target");if(i||(i=(i=e.attr("href"))&&i.replace(/.*(?=#[^\s]*$)/,"")),!e.parent("li").hasClass("active")){var n=o.find(".active:last a"),s=t.Event("hide.bs.tab",{relatedTarget:e[0]}),a=t.Event("show.bs.tab",{relatedTarget:n[0]});if(n.trigger(s),e.trigger(a),!a.isDefaultPrevented()&&!s.isDefaultPrevented()){var r=t(i);this.activate(e.closest("li"),o),this.activate(r,r.parent(),function(){n.trigger({type:"hidden.bs.tab",relatedTarget:e[0]}),e.trigger({type:"shown.bs.tab",relatedTarget:n[0]})})}}},e.prototype.activate=function(o,i,n){var s=i.find("> .active"),a=n&&t.support.transition&&(s.length&&s.hasClass("fade")||!!i.find("> .fade").length);function r(){s.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!1),o.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded",!0),a?(o[0].offsetWidth,o.addClass("in")):o.removeClass("fade"),o.parent(".dropdown-menu")&&o.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!0),n&&n()}s.length&&a?s.one("bsTransitionEnd",r).emulateTransitionEnd(e.TRANSITION_DURATION):r(),s.removeClass("in")};var i=t.fn.tab;t.fn.tab=o,t.fn.tab.Constructor=e,t.fn.tab.noConflict=function(){return t.fn.tab=i,this};var n=function(e){e.preventDefault(),o.call(t(this),"show")};t(document).on("click.bs.tab.data-api",'[data-toggle="tab"]',n).on("click.bs.tab.data-api",'[data-toggle="pill"]',n)}(jQuery),function(t){"use strict";var e=function(o,i){this.$element=t(o),this.options=t.extend({},e.DEFAULTS,i),this.$trigger=t(this.options.trigger).filter('[href="#'+o.id+'"], [data-target="#'+o.id+'"]'),this.transitioning=null,this.options.parent?this.$parent=this.getParent():this.addAriaAndCollapsedClass(this.$element,this.$trigger),this.options.toggle&&this.toggle()};function o(e){var o,i=e.attr("data-target")||(o=e.attr("href"))&&o.replace(/.*(?=#[^\s]+$)/,"");return t(i)}function i(o){return this.each(function(){var i=t(this),n=i.data("bs.collapse"),s=t.extend({},e.DEFAULTS,i.data(),"object"==typeof o&&o);!n&&s.toggle&&"show"==o&&(s.toggle=!1),n||i.data("bs.collapse",n=new e(this,s)),"string"==typeof o&&n[o]()})}e.VERSION="3.3.2",e.TRANSITION_DURATION=350,e.DEFAULTS={toggle:!0,trigger:'[data-toggle="collapse"]'},e.prototype.dimension=function(){return this.$element.hasClass("width")?"width":"height"},e.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var o,n=this.$parent&&this.$parent.children(".panel").children(".in, .collapsing");if(!(n&&n.length&&(o=n.data("bs.collapse"))&&o.transitioning)){var s=t.Event("show.bs.collapse");if(this.$element.trigger(s),!s.isDefaultPrevented()){n&&n.length&&(i.call(n,"hide"),o||n.data("bs.collapse",null));var a=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[a](0).attr("aria-expanded",!0),this.$trigger.removeClass("collapsed").attr("aria-expanded",!0),this.transitioning=1;var r=function(){this.$element.removeClass("collapsing").addClass("collapse in")[a](""),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!t.support.transition)return r.call(this);var l=t.camelCase(["scroll",a].join("-"));this.$element.one("bsTransitionEnd",t.proxy(r,this)).emulateTransitionEnd(e.TRANSITION_DURATION)[a](this.$element[0][l])}}}},e.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var o=t.Event("hide.bs.collapse");if(this.$element.trigger(o),!o.isDefaultPrevented()){var i=this.dimension();this.$element[i](this.$element[i]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse in").attr("aria-expanded",!1),this.$trigger.addClass("collapsed").attr("aria-expanded",!1),this.transitioning=1;var n=function(){this.transitioning=0,this.$element.removeClass("collapsing").addClass("collapse").trigger("hidden.bs.collapse")};if(!t.support.transition)return n.call(this);this.$element[i](0).one("bsTransitionEnd",t.proxy(n,this)).emulateTransitionEnd(e.TRANSITION_DURATION)}}},e.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()},e.prototype.getParent=function(){return t(this.options.parent).find('[data-toggle="collapse"][data-parent="'+this.options.parent+'"]').each(t.proxy(function(e,i){var n=t(i);this.addAriaAndCollapsedClass(o(n),n)},this)).end()},e.prototype.addAriaAndCollapsedClass=function(t,e){var o=t.hasClass("in");t.attr("aria-expanded",o),e.toggleClass("collapsed",!o).attr("aria-expanded",o)};var n=t.fn.collapse;t.fn.collapse=i,t.fn.collapse.Constructor=e,t.fn.collapse.noConflict=function(){return t.fn.collapse=n,this},t(document).on("click.bs.collapse.data-api",'[data-toggle="collapse"]',function(e){var n=t(this);n.attr("data-target")||e.preventDefault();var s=o(n),a=s.data("bs.collapse")?"toggle":t.extend({},n.data(),{trigger:this});i.call(s,a)})}(jQuery),function(t){"use strict";t.fn.emulateTransitionEnd=function(e){var o=!1,i=this;t(this).one("bsTransitionEnd",function(){o=!0});return setTimeout(function(){o||t(i).trigger(t.support.transition.end)},e),this},t(function(){t.support.transition=function(){var t=document.createElement("bootstrap"),e={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var o in e)if(void 0!==t.style[o])return{end:e[o]};return!1}(),t.support.transition&&(t.event.special.bsTransitionEnd={bindType:t.support.transition.end,delegateType:t.support.transition.end,handle:function(e){if(t(e.target).is(this))return e.handleObj.handler.apply(this,arguments)}})})}(jQuery);