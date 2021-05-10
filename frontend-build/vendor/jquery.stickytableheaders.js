!function(e,i,t){"use strict";var l="stickyTableHeaders",o=0,a={fixedOffset:0,leftOffset:0,resizableArea:i,scrollableArea:i,scrollableAreaX:void 0,scrollableAreaY:void 0};e.fn[l]=function(t){return this.each(function(){var n=e.data(this,"plugin_"+l);n?"string"==typeof t?n[t].apply(n):n.updateOptions(t):"destroy"!==t&&e.data(this,"plugin_"+l,new function(t,n){var s=this;s.$el=e(t),s.el=t,s.id=o++,s.$el.bind("destroyed",e.proxy(s.teardown,s)),s.$clonedHeader=null,s.$originalHeader=null,s.isSticky=!1,s.hasBeenSticky=!1,s.leftOffset=null,s.topOffset=null,s.init=function(){s.options=e.extend({},a,n),s.$el.each(function(){var i=e(this);i.css("padding",0),s.$resizableArea=e(s.options.resizableArea),s.$scrollableAreaX=e(s.options.scrollableAreaX||s.options.scrollableArea),s.$scrollableAreaY=e(s.options.scrollableAreaY||s.options.scrollableArea),s.$originalHeader=e("thead:first",this),s.$clonedHeader=s.$originalHeader.clone(),i.trigger("clonedHeader."+l,[s.$clonedHeader]),s.$clonedHeader.addClass("tableFloatingHeader"),s.$clonedHeader.css("display","none"),s.$originalHeader.addClass("tableFloatingHeaderOriginal"),s.$originalHeader.after(s.$clonedHeader),s.$printStyle=e('<style type="text/css" media="print">.tableFloatingHeader{display:none !important;}.tableFloatingHeaderOriginal{position:static !important;}</style>'),e("head").append(s.$printStyle)}),s.updateWidth(),s.toggleHeaders(),s.bind()},s.destroy=function(){s.$el.unbind("destroyed",s.teardown),s.teardown()},s.teardown=function(){s.isSticky&&s.$originalHeader.css("position","static"),e.removeData(s.el,"plugin_"+l),s.unbind(),s.$clonedHeader.remove(),s.$originalHeader.removeClass("tableFloatingHeaderOriginal"),s.$originalHeader.css("visibility","visible"),s.$printStyle.remove(),s.el=null,s.$el=null},s.bind=function(){s.$scrollableAreaX.on("scroll."+l+s.id,function(){s.setPositionValues()}),s.$scrollableAreaY.on("scroll."+l+s.id,function(){s.setPositionValues(),s.toggleHeaders()}),s.$resizableArea.on("resize."+l+s.id,function(){s.toggleHeaders(),s.updateWidth()})},s.unbind=function(){s.$resizableArea.off("."+l+s.id),s.$scrollableAreaX.off("."+l+s.id),s.$scrollableAreaY.off("."+l+s.id)},s.toggleHeaders=function(){s.$el&&s.$el.each(function(){var i,t=e(this),l=isNaN(s.options.fixedOffset)?s.options.fixedOffset.outerHeight()||0:s.options.fixedOffset;s.isWindowScrollingY()||(l+=s.$scrollableAreaY.offset().top);var o=t.offset(),a=s.$scrollableAreaY.scrollTop()+l,n=s.$scrollableAreaX.scrollLeft(),r=s.isWindowScrollingY()?a>o.top:l>o.top,d=(s.isWindowScrollingY()?a:0)<o.top+t.height()-s.$clonedHeader.height()-(s.isWindowScrollingY()?0:l);r&&d?(i=o.left-n+s.options.leftOffset,s.$originalHeader.css({position:"fixed","margin-top":0,left:i,"z-index":1}).addClass("is-sticky"),s.isSticky=!0,s.leftOffset=i,s.topOffset=l,s.$clonedHeader.css("display",""),s.setPositionValues(),s.updateWidth()):s.isSticky&&(s.$originalHeader.css("position","static").removeClass("is-sticky"),s.$clonedHeader.css("display","none"),s.isSticky=!1,s.resetWidth(e("td,th",s.$clonedHeader),e("td,th",s.$originalHeader)))})},s.isWindowScrollingX=function(){return s.$scrollableAreaX[0]===i},s.isWindowScrollingY=function(){return s.$scrollableAreaY[0]===i},s.setPositionValues=function(){var e=s.$scrollableAreaY.scrollTop(),i=s.$scrollableAreaX.scrollLeft();s.isSticky&&s.$originalHeader.css({top:s.topOffset-(s.isWindowScrollingY()?0:e)+"px",left:s.leftOffset-(s.isWindowScrollingX()?0:i)+"px"})},s.updateWidth=function(){if(s.isSticky){s.$originalHeaderCells||(s.$originalHeaderCells=e("th,td",s.$originalHeader)),s.$clonedHeaderCells||(s.$clonedHeaderCells=e("th,td",s.$clonedHeader));var i=s.getWidth(s.$clonedHeaderCells);s.setWidth(i,s.$clonedHeaderCells,s.$originalHeaderCells),s.$originalHeader.css("width",s.$clonedHeader.width())}},s.getWidth=function(i){var t=[];return i.each(function(i){var l,o=e(this);l="border-box"===o.css("box-sizing")?o.outerWidth():o.width(),t[i]=l}),t},s.setWidth=function(e,i,t){i.each(function(i){var l=e[i];t.eq(i).css({"min-width":l,"max-width":l})})},s.resetWidth=function(i,t){i.each(function(i){var l=e(this);t.eq(i).css({"min-width":l.css("min-width"),"max-width":l.css("max-width")})})},s.updateOptions=function(i){s.options=e.extend({},a,i),s.updateWidth(),s.toggleHeaders()},s.init()}(this,t))})}}(jQuery,window);