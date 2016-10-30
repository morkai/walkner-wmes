// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","underscore"],function(e,t){"use strict";function s(e,t){this.$el=e,this.$helper=null,this.options=t,this.$el.on("mousedown."+i,this.onMouseDown.bind(this)).on("keydown."+i,this.onKeyDown.bind(this)).on("focus."+i,this.onFocus.bind(this)).on("blur."+i,this.onBlur.bind(this))}var i="expandableSelect";return s.prototype={destroy:function(){this.collapse(),this.$el.off("."+i),this.$el=null},isExpanded:function(){return this.$el.hasClass(this.options.isExpandedClassName)},expand:function(){if(!this.isExpanded()){var e=this.$el.css("width"),t=this.$el.position();this.$helper=this.options.createHelperElement(this.$el),this.$helper.css({width:e,opacity:0}),this.$helper.insertAfter(this.$el);var s=this.$el.prop("length")+this.$el.find("optgroup").length,i=this.options.expandedLength||parseInt(this.$el.attr("data-expanded-length"),10)||s;this.$el.prop("size",i>s?s:i),this.$el.css({top:t.top+"px",left:t.left+"px",width:e}),this.$el.addClass(this.options.isExpandedClassName)}},collapse:function(){this.isExpanded()&&(this.$helper.remove(),this.$helper=null,this.$el.prop("size",1),this.$el.removeClass(this.options.isExpandedClassName))},onMouseDown:function(e){this.isExpanded()||(this.expand(),t.defer(this.$el.focus.bind(this.$el)),e.preventDefault())},onKeyDown:function(e){if(27===e.keyCode)return this.$el.blur(),!1},onFocus:function(){this.expand()},onBlur:function(){this.collapse()}},e.fn[i]=function(){var n,l=null,o=null,h=null;return 0!==arguments.length&&t.isString(arguments[0])?(h=Array.prototype.slice.call(arguments),o=h.shift()):l=t.defaults({},arguments[0],e.fn[i].defaults),this.each(function(){var t=e(this),a=t.data(i);if(a){if(null!==o)return n=a[o].apply(a,h),void(void 0===n&&(n=null));a.destroy()}t.data(i,new s(t,l))}),void 0===n?this:n},e.fn[i].defaults={isExpandedClassName:"is-expanded",createHelperElement:function(t){return e("<div></div>").attr("class",t.attr("class"))},expandedLength:0},s});