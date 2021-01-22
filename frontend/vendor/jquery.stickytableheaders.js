/*! Copyright (c) 2011 by Jonas Mosbech - https://github.com/jmosbech/StickyTableHeaders
	MIT license info: https://github.com/jmosbech/StickyTableHeaders/blob/master/license.txt */

;(function ($, window, undefined) {
	'use strict';

	var name = 'stickyTableHeaders',
		id = 0,
		defaults = {
			fixedOffset: 0,
			leftOffset: 0,
			resizableArea: window,
			scrollableArea: window,
			scrollableAreaX: undefined,
			scrollableAreaY: undefined
		};

	function Plugin (el, options) {
		// To avoid scope issues, use 'base' instead of 'this'
		// to reference this class from internal events and functions.
		var base = this;

		// Access to jQuery and DOM versions of element
		base.$el = $(el);
		base.el = el;
		base.id = id++;

		// Listen for destroyed, call teardown
		base.$el.bind('destroyed',
			$.proxy(base.teardown, base));

		// Cache DOM refs for performance reasons
		base.$clonedHeader = null;
		base.$originalHeader = null;

		// Keep track of state
		base.isSticky = false;
		base.hasBeenSticky = false;
		base.leftOffset = null;
		base.topOffset = null;

		base.init = function () {
			base.options = $.extend({}, defaults, options);

			base.$el.each(function () {
				var $this = $(this);

				// remove padding on <table> to fix issue #7
				$this.css('padding', 0);

				base.$resizableArea = $(base.options.resizableArea);
				base.$scrollableAreaX = $(base.options.scrollableAreaX || base.options.scrollableArea);
				base.$scrollableAreaY = $(base.options.scrollableAreaY || base.options.scrollableArea);

				base.$originalHeader = $('thead:first', this);
				base.$clonedHeader = base.$originalHeader.clone();
				$this.trigger('clonedHeader.' + name, [base.$clonedHeader]);

				base.$clonedHeader.addClass('tableFloatingHeader');
				base.$clonedHeader.css('display', 'none');

				base.$originalHeader.addClass('tableFloatingHeaderOriginal');

				base.$originalHeader.after(base.$clonedHeader);

				base.$printStyle = $('<style type="text/css" media="print">' +
					'.tableFloatingHeader{display:none !important;}' +
					'.tableFloatingHeaderOriginal{position:static !important;}' +
					'</style>');
				$('head').append(base.$printStyle);
			});

			base.updateWidth();
			base.toggleHeaders();

			base.bind();
		};

		base.destroy = function (){
			base.$el.unbind('destroyed', base.teardown);
			base.teardown();
		};

		base.teardown = function(){
			if (base.isSticky) {
				base.$originalHeader.css('position', 'static');
			}
			$.removeData(base.el, 'plugin_' + name);
			base.unbind();

			base.$clonedHeader.remove();
			base.$originalHeader.removeClass('tableFloatingHeaderOriginal');
			base.$originalHeader.css('visibility', 'visible');
			base.$printStyle.remove();

			base.el = null;
			base.$el = null;
		};

		base.bind = function(){
			base.$scrollableAreaX.on('scroll.' + name + base.id, function()
			{
				base.setPositionValues();
			});

			base.$scrollableAreaY.on('scroll.' + name + base.id, function()
			{
				base.setPositionValues();
				base.toggleHeaders();
			});

			base.$resizableArea.on('resize.' + name + base.id, function()
			{
				base.toggleHeaders();
				base.updateWidth();
			});
		};

		base.unbind = function(){
			base.$resizableArea.off('.' + name + base.id);
			base.$scrollableAreaX.off('.' + name + base.id);
			base.$scrollableAreaY.off('.' + name + base.id);
		};

		base.toggleHeaders = function () {
			if (!base.$el) {
				return;
			}
			base.$el.each(function () {
				var $this = $(this);
				var newLeft;
				var newTopOffset = isNaN(base.options.fixedOffset)
					? (base.options.fixedOffset.outerHeight() || 0)
					: base.options.fixedOffset;

				if (!base.isWindowScrollingY())
				{
					newTopOffset += base.$scrollableAreaY.offset().top;
				}

				var offset = $this.offset();

				var scrollTop = base.$scrollableAreaY.scrollTop() + newTopOffset;
				var scrollLeft = base.$scrollableAreaX.scrollLeft();

				var scrolledPastTop = base.isWindowScrollingY() ?
							scrollTop > offset.top :
							newTopOffset > offset.top;

				var notScrolledPastBottom = (base.isWindowScrollingY() ? scrollTop : 0) <
							(offset.top + $this.height() - base.$clonedHeader.height() - (base.isWindowScrollingY() ? 0 : newTopOffset));

				if (scrolledPastTop && notScrolledPastBottom) {
					newLeft = offset.left - scrollLeft + base.options.leftOffset;
					base.$originalHeader.css({
						'position': 'fixed',
						'margin-top': 0,
						'left': newLeft,
						'z-index': 1 // #18: opacity bug
					});
					base.isSticky = true;
					base.leftOffset = newLeft;
					base.topOffset = newTopOffset;
					base.$clonedHeader.css('display', '');
					base.setPositionValues();
					// make sure the width is correct: the user might have resized the browser while in static mode
					base.updateWidth();
				} else if (base.isSticky) {
					base.$originalHeader.css('position', 'static');
					base.$clonedHeader.css('display', 'none');
					base.isSticky = false;
					base.resetWidth($("td,th", base.$clonedHeader), $("td,th", base.$originalHeader));
				}
			});
		};

		base.isWindowScrollingX = function() {
			return base.$scrollableAreaX[0] === window;
		};

		base.isWindowScrollingY = function() {
			return base.$scrollableAreaY[0] === window;
		};

		base.setPositionValues = function () {
			var winScrollTop = base.$scrollableAreaY.scrollTop(),
				winScrollLeft = base.$scrollableAreaX.scrollLeft();
			if (!base.isSticky) {
				return;
			}
			base.$originalHeader.css({
				'top': (base.topOffset - (base.isWindowScrollingY() ? 0 : winScrollTop)) + 'px',
				'left': (base.leftOffset - (base.isWindowScrollingX() ? 0 : winScrollLeft)) + 'px'
			});
		};

		base.updateWidth = function () {
			if (!base.isSticky) {
				return;
			}
			// Copy cell widths from clone
			if (!base.$originalHeaderCells) {
				base.$originalHeaderCells = $('th,td', base.$originalHeader);
			}
			if (!base.$clonedHeaderCells) {
				base.$clonedHeaderCells = $('th,td', base.$clonedHeader);
			}
			var cellWidths = base.getWidth(base.$clonedHeaderCells);
			base.setWidth(cellWidths, base.$clonedHeaderCells, base.$originalHeaderCells);

			// Copy row width from whole table
			base.$originalHeader.css('width', base.$clonedHeader.width());
		};

		base.getWidth = function ($clonedHeaders) {
			var widths = [];
			$clonedHeaders.each(function (index) {
				var width, $this = $(this);

				if ($this.css('box-sizing') === 'border-box') {
					width = $this.outerWidth(); // #39: border-box bug
				} else {
					width = $this.width();
				}

				widths[index] = width;
			});
			return widths;
		};

		base.setWidth = function (widths, $clonedHeaders, $origHeaders) {
			$clonedHeaders.each(function (index) {
				var width = widths[index];
				$origHeaders.eq(index).css({
					'min-width': width,
					'max-width': width
				});
			});
		};

		base.resetWidth = function ($clonedHeaders, $origHeaders) {
			$clonedHeaders.each(function (index) {
				var $this = $(this);
				$origHeaders.eq(index).css({
					'min-width': $this.css("min-width"),
					'max-width': $this.css("max-width")
				});
			});
		};

		base.updateOptions = function(options) {
			base.options = $.extend({}, defaults, options);
			base.updateWidth();
			base.toggleHeaders();
		};

		// Run initializer
		base.init();
	}

	// A plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[name] = function ( options ) {
		return this.each(function () {
			var instance = $.data(this, 'plugin_' + name);
			if (instance) {
				if (typeof options === "string") {
					instance[options].apply(instance);
				} else {
					instance.updateOptions(options);
				}
			} else if(options !== 'destroy') {
				$.data(this, 'plugin_' + name, new Plugin( this, options ));
			}
		});
	};

})(jQuery, window);
