define(["jquery","underscore"],function(e,t){"use strict";var s="expandableSelect",i=0;function n(t,n){this.id=++i,this.$el=t,this.$helper=null,this.options=n,e(window).on("resize."+s+this.id,this.onWindowResize.bind(this)),this.$el.on("mousedown."+s,this.onMouseDown.bind(this)).on("keydown."+s,this.onKeyDown.bind(this)).on("focus."+s,this.onFocus.bind(this)).on("blur."+s,this.onBlur.bind(this))}return n.prototype={destroy:function(){this.collapse(),e(window).off("."+s+this.id),this.$el.off("."+s),this.$el=null},isExpanded:function(){return null!==this.$el&&this.$el.hasClass(this.options.isExpandedClassName)},expand:function(){if(!this.isExpanded()){var e=this.$el.css("width"),t=this.$el.position();this.$helper=this.options.createHelperElement(this.$el),this.$helper.css({width:e,opacity:0}),this.$helper.insertAfter(this.$el);var s=this.$el.prop("length")+this.$el.find("optgroup").length,i=this.options.expandedLength||parseInt(this.$el.attr("data-expanded-length"),10)||s;this.$el.prop("size",i>s?s:i),this.$el.css({top:t.top+"px",left:t.left+"px",width:e}),this.$el.addClass(this.options.isExpandedClassName)}},collapse:function(){this.isExpanded()&&(this.$helper.remove(),this.$helper=null,this.$el.prop("size",1),this.$el.removeClass(this.options.isExpandedClassName))},toggleSelection:function(){for(var e=this.$el[0].options,t=!1,s=0;s<e.length;++s)!t&&e[s].selected||(e[s].selected=!0,t=!0);if(!t)for(var i=0;i<e.length;++i)e[i].selected=!1},onWindowResize:function(){this.collapse()},onMouseDown:function(e){this.isExpanded()||(this.expand(),t.defer(this.$el.focus.bind(this.$el)),e.preventDefault())},onKeyDown:function(e){return"Escape"===e.key?(this.$el.blur(),!1):"a"===e.key.toLowerCase()?(this.toggleSelection(),!1):void 0},onFocus:function(){this.expand()},onBlur:function(){this.collapse()}},e.fn[s]=function(){var i,o={},l=null,h=null;return 0!==arguments.length&&t.isString(arguments[0])?(h=Array.prototype.slice.call(arguments),l=h.shift()):t.defaults(o,arguments[0]),this.each(function(){var d=e(this),a=d.data(s);if(a){if(null!==l)return void(void 0===(i=a[l].apply(a,h))&&(i=null));a.destroy()}d.data(s,new n(d,t.defaults(o,e.fn[s].defaults)))}),void 0===i?this:i},e.fn[s].defaults={isExpandedClassName:"is-expanded",createHelperElement:function(t){return e("<div></div>").attr("class",t.attr("class"))},expandedLength:0},n});