// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/core/util/parseNumber',
  'app/reports/templates/9/table',
  'app/reports/templates/9/summaryTr',
  'app/reports/templates/9/monthsTr'
], function(
  _,
  $,
  t,
  View,
  parseNumber,
  tableTemplate,
  summaryTrTemplate,
  monthsTrTemplate
) {
  'use strict';

  function getWidth($el)
  {
    var rects = $el[0].getClientRects();

    return (rects.length ? rects[0].width : 0) + 'px';
  }

  return View.extend({

    template: tableTemplate,

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
      },
      'click .reports-9-editable': function(e)
      {
        this.showEditor(e.currentTarget);
      },
      'blur .reports-9-editor': function()
      {
        this.hideCurrentEditor();
      },
      'keydown .reports-9-editor': function(e)
      {
        if (e.keyCode === 13)
        {
          this.saveCurrentEditor();
        }
        else if (e.keyCode === 27)
        {
          e.target.blur();
        }
      }

    },

    initialize: function()
    {
      this.highlightedIndex = -1;
      this.currentEditorSourceEl = null;

      this.listenTo(this.model, 'sync', this.render);
      this.listenTo(this.model, 'change:customLines', this.onCustomLinesChange);
      this.listenTo(this.model, 'change:daysInMonth change:shiftsInDay change:hoursInShift', this.onOptionsChange);
      this.listenTo(this.model, 'clearOptions', this.onOptionsClear);

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
      var defaults = model.constructor.DEFAULTS;
      var daysInMonth = model.get('daysInMonth');
      var shiftsInDay = model.get('shiftsInDay');
      var hoursInShift = model.get('hoursInShift');

      return {
        idPrefix: this.idPrefix,
        cags: model.get('cags'),
        lines: model.get('lines'),
        months: model.get('months'),
        summary: {
          daysInMonth: daysInMonth.summary == null ? defaults.daysInMonth : daysInMonth.summary,
          customDaysInMonth: daysInMonth.summary != null,
          shiftsInDay: shiftsInDay.summary == null ? defaults.shiftsInDay : shiftsInDay.summary,
          customShiftsInDay: shiftsInDay.summary != null,
          hoursInShift: hoursInShift == null ? defaults.hoursInShift : hoursInShift,
          customHoursInShift: hoursInShift != null
        }
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
      var $cags = this.$id('cags');

      if ($cags.length)
      {
        this.adjustStickyLinesHeader();

        this.tableTopPosition = $cags.find('table').position().top;
      }
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
    },

    showEditor: function(sourceEl)
    {
      if (this.currentEditorSourceEl === sourceEl)
      {
        return;
      }

      if (this.currentEditorSourceEl)
      {
        this.hideCurrentEditor();
      }

      var dataset = sourceEl.dataset;
      var cagIndex = +dataset.cagIndex;
      var monthIndex = +dataset.monthIndex;

      switch (dataset.editor)
      {
        case 'customLines':
          this.showCustomLinesEditor(sourceEl, cagIndex, monthIndex);
          break;

        case 'daysInMonth':
          this.showDaysInMonthEditor(sourceEl, monthIndex);
          break;

        case 'shiftsInDay':
          this.showShiftsInDayEditor(sourceEl, monthIndex);
          break;

        case 'hoursInShift':
          this.showHoursInShiftEditor(sourceEl);
          break;
      }

      sourceEl.classList.add('reports-9-editing');

      this.currentEditorSourceEl = sourceEl;
    },

    hideCurrentEditor: function()
    {
      this.$('.reports-9-editor').remove();
      this.currentEditorSourceEl.classList.remove('reports-9-editing');
      this.currentEditorSourceEl = null;
    },

    saveCurrentEditor: function()
    {
      var dataset = this.currentEditorSourceEl.dataset;
      var cagIndex = +dataset.cagIndex;
      var monthIndex = +dataset.monthIndex;
      var model = this.model;
      var $editor = this.$('.reports-9-editor');
      var rawValue = $editor.val().replace(/[^0-9,.]+/g, '');
      var newValue = rawValue === '' ? null : parseNumber(rawValue, false);

      switch (dataset.editor)
      {
        case 'customLines':
          model.setCustomLines(cagIndex, monthIndex, newValue);
          break;

        case 'daysInMonth':
          model.setDaysInMonth(monthIndex, newValue);
          break;

        case 'shiftsInDay':
          model.setShiftsInDay(monthIndex, newValue);
          break;

        case 'hoursInShift':
          model.setHoursInShift(newValue);
          break;
      }

      $editor.blur();
    },

    showCustomLinesEditor: function(sourceEl, cagIndex, monthIndex)
    {
      var cag = this.model.get('cags')[cagIndex];
      var originalValue = monthIndex >= 0 && cag.customLines !== null ? cag.customLines : cag.lines;
      var customValue = monthIndex >= 0 ? cag.customMonthLines[monthIndex] : cag.customLines;

      this.showEditorInput(sourceEl, originalValue, customValue === null ? '' : customValue);
    },

    showDaysInMonthEditor: function(sourceEl, monthIndex)
    {
      this.showMonthsOptionEditor(sourceEl, monthIndex, 'daysInMonth');
    },

    showShiftsInDayEditor: function(sourceEl, monthIndex)
    {
      this.showMonthsOptionEditor(sourceEl, monthIndex, 'shiftsInDay');
    },

    showMonthsOptionEditor: function(sourceEl, monthIndex, property)
    {
      var model = this.model;
      var defaults = model.constructor.DEFAULTS;
      var month = model.get('months')[monthIndex];
      var customValues = this.model.get(property);
      var originalValue;
      var customValue;

      if (month)
      {
        originalValue = customValues.summary == null ? defaults[property] : customValues.summary;
        customValue = customValues[month.key] == null ? null : customValues[month.key];
      }
      else
      {
        originalValue = defaults[property];
        customValue = customValues.summary == null ? null : customValues.summary;
      }

      this.showEditorInput(sourceEl, originalValue, customValue);
    },

    showHoursInShiftEditor: function(sourceEl)
    {
      var originalValue = this.model.constructor.DEFAULTS.hoursInShift;
      var customValue = this.model.get('hoursInShift');

      this.showEditorInput(sourceEl, originalValue, customValue);
    },

    showEditorInput: function(parentEl, placeholder, value)
    {
      $('<input type="text" autocomplete="new-password" maxlength="3" class="reports-9-editor">')
        .attr('placeholder', typeof placeholder === 'number' ? placeholder.toLocaleString() : placeholder)
        .val(typeof value === 'number' ? value.toLocaleString() : value)
        .appendTo(parentEl)
        .select();
    },

    renderSummaryAndMonths: function()
    {
      var model = this.model;
      var months = model.get('months');
      var summaryRows = '';
      var monthsRows = '';

      _.forEach(model.get('cags'), function(cag, cagIndex)
      {
        summaryRows += summaryTrTemplate({
          cagI: cagIndex,
          cag: cag
        });
        monthsRows += monthsTrTemplate({
          months: months,
          cagI: cagIndex,
          cag: cag
        });
      });

      this.$id('summaryRows').prop('innerHTML', summaryRows);
      this.$id('monthsRows').prop('innerHTML', monthsRows);
    },

    onCustomLinesChange: function(e)
    {
      var cagIndex = e.cagIndex;
      var model = this.model;
      var cag = model.get('cags')[cagIndex];

      this.$id('summaryRows').children().eq(cagIndex).replaceWith(summaryTrTemplate({
        cagI: cagIndex,
        cag: cag
      }));

      this.$id('monthsRows').children().eq(cagIndex).replaceWith(monthsTrTemplate({
        months: model.get('months'),
        cagI: cagIndex,
        cag: cag
      }));

      this.setUpStickyHeaders();
    },

    onOptionsChange: function(e)
    {
      this.renderSummaryAndMonths();

      var $editable = this.$('.reports-9-table-options').find('.reports-9-editable[data-editor="' + e.option + '"]');
      var displayValue = e.displayValue.toLocaleString();

      if (e.monthIndex === -1)
      {
        $editable.each(function()
        {
          var isSummary = this.dataset.monthIndex === undefined;
          var isCustom = this.classList.contains('reports-9-custom');

          if (isSummary)
          {
            this.classList.toggle('reports-9-custom', e.newValue !== null);
            this.children[0].innerText = displayValue;
          }
          else if (!isCustom)
          {
            this.children[0].innerText = displayValue;
          }
        });
      }
      else
      {
        $editable
          .filter('[data-month-index="' + e.monthIndex + '"]')
          .toggleClass('reports-9-custom', e.newValue !== null)
          .find('.reports-9-editable-value')
          .text(displayValue);
      }

      this.setUpStickyHeaders();
    },

    onOptionsClear: function()
    {
      this.renderSummaryAndMonths();

      var defaults = this.model.constructor.DEFAULTS;

      this.$('.reports-9-custom').each(function()
      {
        this.classList.remove('reports-9-custom');
        this.children[0].textContent = defaults[this.dataset.editor].toLocaleString();
      });

      this.setUpStickyHeaders();
    }

  });
});
