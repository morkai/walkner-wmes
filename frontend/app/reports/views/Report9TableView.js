// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/reports/templates/report9Table'
], function(
  _,
  $,
  t,
  View,
  template
) {
  'use strict';

  function getWidth($el)
  {
    return $el[0].getClientRects()[0].width + 'px';
  }

  return View.extend({

    template: template,

    events: {

      'mouseenter tbody > tr': function(e)
      {
        var trEl = e.currentTarget;
        var index = +trEl.dataset.index;

        if (index === this.highlightedIndex)
        {
          return;
        }

        this.$('.is-highlighted').removeClass('is-highlighted');
        this.$('tr[data-index="' + index + '"]').addClass('is-highlighted');

        this.highlightedIndex = index;
      },
      'mouseleave tbody > tr': function()
      {
        this.$('.is-highlighted').removeClass('is-highlighted');

        this.highlightedIndex = -1;
      }

    },

    initialize: function()
    {
      this.highlightedIndex = -1;

      $(window)
        .on('resize.' + this.idPrefix, this.onResize.bind(this))
        .on('scroll.' + this.idPrefix, this.onScroll.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    serialize: function()
    {
      var model = this.model;

      return {
        idPrefix: this.idPrefix,
        cags: model.get('cags'),
        lines: model.get('lines'),
        months: model.get('months')
      };
    },

    afterRender: function()
    {
      this.setUpStickyHeaders();
      this.onResize();
    },

    setUpStickyHeaders: function()
    {
      this.$('.is-sticky').remove();

      var $originalThead = {
        cags: this.$id('cags').find('thead'),
        lines: this.$id('lines').find('thead'),
        summary: this.$id('summary').find('thead:nth-child(2)'),
        months: this.$id('months').find('thead:nth-child(2)')
      };

      _.forEach($originalThead, this.buildStickyHeader, this);

      this.tableTopPosition = $originalThead.cags.position().top;
    },

    buildStickyHeader: function($originalThead, tableId)
    {
      var $stickyThead = $originalThead.clone();
      var $table = $('<table></table>')
        .attr('class', $originalThead.parent().attr('class'))
        .append($stickyThead);
      var $container = $originalThead.parent().parent();

      var $originalThs = $originalThead.find('th');
      var $stickyThs = $stickyThead.find('th');

      $originalThs.each(function(i)
      {
        var width = getWidth($originalThs.eq(i));
        var stickyStyle = $stickyThs[i].style;

        stickyStyle.maxWidth = width;
        stickyStyle.minWidth = width;
      });

      if (tableId === 'lines')
      {
        this.setUpStickyLinesHeader($container, $table, $originalThead);
      }
      else
      {
        $table
          .addClass('is-sticky')
          .append($stickyThead)
          .appendTo($container);
      }
    },

    setUpStickyLinesHeader: function($container, $table)
    {
      var $lines = this.$('.reports-9-table-lines');
      var $wrapper = $('<div></div>');
      var width = getWidth($container);

      $wrapper.append($table);
      $wrapper.css({
        width: width,
        overflow: 'hidden'
      });
      $wrapper.addClass('is-sticky').appendTo($container);

      $lines.on('scroll', function(e)
      {
        $wrapper.prop('scrollLeft', e.target.scrollLeft);
      });

      this.stickyLinesHeader = {
        $lines: $lines,
        $header: this.$('.reports-9-table-lines-header').css('width', width),
        $wrapper: $wrapper,
        $container: $container
      };
    },

    adjustStickyLinesHeader: function()
    {
      var stickyLinesHeader = this.stickyLinesHeader;

      if (stickyLinesHeader)
      {
        var width = getWidth(stickyLinesHeader.$container);

        stickyLinesHeader.$wrapper
          .css('width', width)
          .prop('scrollLeft', stickyLinesHeader.$lines.prop('scrollLeft'));

        stickyLinesHeader.$header.css('width', width);
      }
    },

    onResize: function()
    {
      this.adjustStickyLinesHeader();

      this.tableTopPosition = this.$id('cags').find('table').position().top;
    },

    onScroll: function()
    {
      var isSticky = window.pageYOffset > this.tableTopPosition;
      var wasSticky = this.$el.hasClass('reports-9-sticky');

      this.$el.toggleClass('reports-9-sticky', isSticky);

      if (!wasSticky && isSticky)
      {
        this.adjustStickyLinesHeader();
      }
    }

  });
});
