// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","underscore"],function(e,t){"use strict";function s(t,s){this.id=++n,this.$el=t,this.$helper=null,this.options=s,e(window).on("resize."+i+this.id,this.onWindowResize.bind(this)),this.$el.on("mousedown."+i,this.onMouseDown.bind(this)).on("keydown."+i,this.onKeyDown.bind(this)).on("focus."+i,this.onFocus.bind(this)).on("blur."+i,this.onBlur.bind(this))}var i="expandableSelect",n=0;return s.prototype={destroy:function(){this.collapse(),e(window).off("."+i+this.id),this.$el.off("."+i),this.$el=null},isExpanded:function(){return null!==this.$el&&this.$el.hasClass(this.options.isExpandedClassName)},expand:function(){if(!this.isExpanded()){var e=this.$el.css("width"),t=this.$el.position();this.$helper=this.options.createHelperElement(this.$el),this.$helper.css({width:e,opacity:0}),this.$helper.insertAfter(this.$el);var s=this.$el.prop("length")+this.$el.find("optgroup").length,i=this.options.expandedLength||parseInt(this.$el.attr("data-expanded-length"),10)||s;this.$el.prop("size",i>s?s:i),this.$el.css({top:t.top+"px",left:t.left+"px",width:e}),this.$el.addClass(this.options.isExpandedClassName)}},collapse:function(){this.isExpanded()&&(this.$helper.remove(),this.$helper=null,this.$el.prop("size",1),this.$el.removeClass(this.options.isExpandedClassName))},onWindowResize:function(){this.collapse()},onMouseDown:function(e){this.isExpanded()||(this.expand(),t.defer(this.$el.focus.bind(this.$el)),e.preventDefault())},onKeyDown:function(e){if(27===e.keyCode)return this.$el.blur(),!1},onFocus:function(){this.expand()},onBlur:function(){this.collapse()}},e.fn[i]=function(){var n,o={},l=null,h=null;return 0!==arguments.length&&t.isString(arguments[0])?(h=Array.prototype.slice.call(arguments),l=h.shift()):t.defaults(o,arguments[0]),this.each(function(){var d=e(this),a=d.data(i);if(a){if(null!==l)return n=a[l].apply(a,h),void(void 0===n&&(n=null));a.destroy()}d.data(i,new s(d,t.defaults(o,e.fn[i].defaults)))}),void 0===n?this:n},e.fn[i].defaults={isExpandedClassName:"is-expanded",createHelperElement:function(t){return e("<div></div>").attr("class",t.attr("class"))},expandedLength:0},s});