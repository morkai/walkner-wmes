// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'underscore'
], function(
  $,
  _
) {
  'use strict';

  var PLUGIN_NAME = 'expandableSelect';
  var INSTANCE_ID = 0;

  function ExpandableSelect($el, options)
  {
    this.id = ++INSTANCE_ID;

    this.$el = $el;

    this.$helper = null;

    this.options = options;

    $(window).on('resize.' + PLUGIN_NAME + this.id, this.onWindowResize.bind(this));

    this.$el
      .on('mousedown.' + PLUGIN_NAME, this.onMouseDown.bind(this))
      .on('keydown.' + PLUGIN_NAME, this.onKeyDown.bind(this))
      .on('focus.' + PLUGIN_NAME, this.onFocus.bind(this))
      .on('blur.' + PLUGIN_NAME, this.onBlur.bind(this));
  }

  ExpandableSelect.prototype = {

    destroy: function()
    {
      this.collapse();

      $(window).off('.' + PLUGIN_NAME + this.id);

      this.$el.off('.' + PLUGIN_NAME);
      this.$el = null;
    },

    isExpanded: function()
    {
      return this.$el !== null && this.$el.hasClass(this.options.isExpandedClassName);
    },

    expand: function()
    {
      if (this.isExpanded())
      {
        return;
      }

      var width = this.$el.css('width');
      var pos = this.$el.position();

      this.$helper = this.options.createHelperElement(this.$el);
      this.$helper.css({
        width: width,
        opacity: 0
      });
      this.$helper.insertAfter(this.$el);

      var length = this.$el.prop('length') + this.$el.find('optgroup').length;
      var size = this.options.expandedLength || parseInt(this.$el.attr('data-expanded-length'), 10) || length;

      this.$el.prop('size', size > length ? length : size);
      this.$el.css({
        top: pos.top + 'px',
        left: pos.left + 'px',
        width: width
      });
      this.$el.addClass(this.options.isExpandedClassName);
    },

    collapse: function()
    {
      if (!this.isExpanded())
      {
        return;
      }

      this.$helper.remove();
      this.$helper = null;

      this.$el.prop('size', 1);
      this.$el.removeClass(this.options.isExpandedClassName);

      if (this.$el[0].selectedOptions.length)
      {
        this.$el[0].selectedOptions[0].scrollIntoView();
      }
    },

    toggleSelection: function()
    {
      var options = this.$el[0].options;
      var anyUnselected = false;

      for (var i = 0; i < options.length; ++i)
      {
        if (anyUnselected || !options[i].selected)
        {
          options[i].selected = true;
          anyUnselected = true;
        }
      }

      if (!anyUnselected)
      {
        for (var j = 0; j < options.length; ++j)
        {
          options[j].selected = false;
        }
      }
    },

    onWindowResize: function()
    {
      this.collapse();
    },

    onMouseDown: function(e)
    {
      if (this.isExpanded())
      {
        return;
      }

      this.expand();

      _.defer(this.$el.focus.bind(this.$el));

      e.preventDefault();
    },

    onKeyDown: function(e)
    {
      if (e.key === 'Escape')
      {
        this.$el.blur();

        return false;
      }

      if (e.key.toLowerCase() === 'a')
      {
        this.toggleSelection();

        return false;
      }
    },

    onFocus: function()
    {
      this.expand();
    },

    onBlur: function()
    {
      this.collapse();
    }

  };

  $.fn[PLUGIN_NAME] = function()
  {
    var result;
    var options = {};
    var methodName = null;
    var methodArgs = null;

    if (arguments.length !== 0 && _.isString(arguments[0]))
    {
      methodArgs = Array.prototype.slice.call(arguments);
      methodName = methodArgs.shift();
    }
    else
    {
      _.defaults(options, arguments[0]);
    }

    this.each(function()
    {
      var $el = $(this);
      var expandableSelect = $el.data(PLUGIN_NAME);

      if (expandableSelect)
      {
        if (methodName !== null)
        {
          result = expandableSelect[methodName].apply(expandableSelect, methodArgs);

          if (result === undefined)
          {
            result = null;
          }

          return;
        }

        expandableSelect.destroy();
      }

      $el.data(PLUGIN_NAME, new ExpandableSelect($el, _.defaults(options, $.fn[PLUGIN_NAME].defaults)));
    });

    return result === undefined ? this : result;
  };

  $.fn[PLUGIN_NAME].defaults = {
    isExpandedClassName: 'is-expanded',
    createHelperElement: function($el)
    {
      return $('<div></div>').attr('class', $el.attr('class'));
    },
    expandedLength: 0
  };

  return ExpandableSelect;
});
