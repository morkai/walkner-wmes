/*! Copyright (c) 2011 by Jonas Mosbech - https://github.com/jmosbech/StickyTableHeaders
	MIT license info: https://github.com/jmosbech/StickyTableHeaders/blob/master/license.txt */

!function(e,i,t){"use strict";function o(t,o){var a=this;a.$el=e(t),a.el=t,a.id=n++,a.$el.bind("destroyed",e.proxy(a.teardown,a)),a.$clonedHeader=null,a.$originalHeader=null,a.isSticky=!1,a.hasBeenSticky=!1,a.leftOffset=null,a.topOffset=null,a.init=function(){a.options=e.extend({},s,o),a.$el.each(function(){var i=e(this);i.css("padding",0),a.$scrollableArea=e(a.options.scrollableArea),a.$originalHeader=e("thead:first",this),a.$clonedHeader=a.$originalHeader.clone(),i.trigger("clonedHeader."+l,[a.$clonedHeader]),a.$clonedHeader.addClass("tableFloatingHeader"),a.$clonedHeader.css("display","none"),a.$originalHeader.addClass("tableFloatingHeaderOriginal"),a.$originalHeader.after(a.$clonedHeader),a.$printStyle=e('<style type="text/css" media="print">.tableFloatingHeader{display:none !important;}.tableFloatingHeaderOriginal{position:static !important;}</style>'),e("head").append(a.$printStyle)}),a.updateWidth(),a.toggleHeaders(),a.bind()},a.destroy=function(){a.$el.unbind("destroyed",a.teardown),a.teardown()},a.teardown=function(){a.isSticky&&a.$originalHeader.css("position","static"),e.removeData(a.el,"plugin_"+l),a.unbind(),a.$clonedHeader.remove(),a.$originalHeader.removeClass("tableFloatingHeaderOriginal"),a.$originalHeader.css("visibility","visible"),a.$printStyle.remove(),a.el=null,a.$el=null},a.bind=function(){a.$scrollableArea.on("scroll."+l,a.toggleHeaders),a.isWindowScrolling()||(e(i).on("scroll."+l+a.id,a.setPositionValues),e(i).on("resize."+l+a.id,a.toggleHeaders)),a.$scrollableArea.on("resize."+l,a.toggleHeaders),a.$scrollableArea.on("resize."+l,a.updateWidth)},a.unbind=function(){a.$scrollableArea.off("."+l,a.toggleHeaders),a.isWindowScrolling()||(e(i).off("."+l+a.id,a.setPositionValues),e(i).off("."+l+a.id,a.toggleHeaders)),a.$scrollableArea.off("."+l,a.updateWidth),a.$el.off("."+l),a.$el.find("*").off("."+l)},a.toggleHeaders=function(){a.$el&&a.$el.each(function(){var i,t=e(this),o=a.isWindowScrolling()?isNaN(a.options.fixedOffset)?a.options.fixedOffset.outerHeight():a.options.fixedOffset:a.$scrollableArea.offset().top+(isNaN(a.options.fixedOffset)?0:a.options.fixedOffset),l=t.offset(),n=a.$scrollableArea.scrollTop()+o,s=a.$scrollableArea.scrollLeft(),d=a.isWindowScrolling()?n>l.top:o>l.top,r=(a.isWindowScrolling()?n:0)<l.top+t.height()-a.$clonedHeader.height()-(a.isWindowScrolling()?0:o);d&&r?(i=l.left-s+a.options.leftOffset,a.$originalHeader.css({position:"fixed","margin-top":0,left:i,"z-index":1}),a.isSticky=!0,a.leftOffset=i,a.topOffset=o,a.$clonedHeader.css("display",""),a.setPositionValues(),a.updateWidth()):a.isSticky&&(a.$originalHeader.css("position","static"),a.$clonedHeader.css("display","none"),a.isSticky=!1,a.resetWidth(e("td,th",a.$clonedHeader),e("td,th",a.$originalHeader)))})},a.isWindowScrolling=function(){return a.$scrollableArea[0]===i},a.setPositionValues=function(){var t=e(i).scrollTop(),o=e(i).scrollLeft();!a.isSticky||0>t||t+e(i).height()>e(document).height()||0>o||o+e(i).width()>e(document).width()||a.$originalHeader.css({top:a.topOffset-(a.isWindowScrolling()?0:t),left:a.leftOffset-(a.isWindowScrolling()?0:o)})},a.updateWidth=function(){if(a.isSticky){a.$originalHeaderCells||(a.$originalHeaderCells=e("th,td",a.$originalHeader)),a.$clonedHeaderCells||(a.$clonedHeaderCells=e("th,td",a.$clonedHeader));var i=a.getWidth(a.$clonedHeaderCells);a.setWidth(i,a.$clonedHeaderCells,a.$originalHeaderCells),a.$originalHeader.css("width",a.$clonedHeader.width())}},a.getWidth=function(i){var t=[];return i.each(function(i){var o,l=e(this);o="border-box"===l.css("box-sizing")?l.outerWidth():l.width(),t[i]=o}),t},a.setWidth=function(e,i,t){i.each(function(i){var o=e[i];t.eq(i).css({"min-width":o,"max-width":o})})},a.resetWidth=function(i,t){i.each(function(i){var o=e(this);t.eq(i).css({"min-width":o.css("min-width"),"max-width":o.css("max-width")})})},a.updateOptions=function(i){a.options=e.extend({},s,i),a.updateWidth(),a.toggleHeaders()},a.init()}var l="stickyTableHeaders",n=0,s={fixedOffset:0,leftOffset:0,scrollableArea:i};e.fn[l]=function(i){return this.each(function(){var t=e.data(this,"plugin_"+l);t?"string"==typeof i?t[i].apply(t):t.updateOptions(i):"destroy"!==i&&e.data(this,"plugin_"+l,new o(this,i))})}}(jQuery,window);