// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/core/View',
  'app/core/util/uuid',
  'app/core/util/ExpandableSelect',
  '../KanbanPrintQueueBuilder',
  'app/kanban/templates/printQueueBuilder/builder'
], function(
  _,
  $,
  viewport,
  View,
  uuid,
  ExpandableSelect,
  KanbanPrintQueueBuilder,
  template
) {
  'use strict';

  var CSS_STORAGE_KEY = 'WMES_KANBAN_BUILDER_CSS';

  return View.extend({

    template: template,

    events: {

      'submit': function()
      {
        this.submit();

        return false;
      },

      'click #-hide': function()
      {
        this.hide();

        return false;
      },

      'click #-clear': function()
      {
        this.model.builder.reset([]);
      },

      'click .btn[data-action="remove"]': function(e)
      {
        var model = this.model.builder.at(this.$(e.currentTarget).closest('tr').prop('rowIndex'));

        if (model)
        {
          this.model.builder.remove(model);
        }

        this.lastRemoveClickAt = e.timeStamp;
      },

      'click .btn[data-action="layout"]': function(e)
      {
        this.model.builder.toggleLayout(e.currentTarget.value);
      },

      'click .kanban-builder-ccn': function(e)
      {
        var entry = this.model.entries.get(e.currentTarget.textContent.trim());

        if (entry)
        {
          this.trigger('find', 'entry', entry);
        }
      },

      'keydown select': function(e)
      {
        if (e.key === 'Enter' || e.key === ' ')
        {
          e.currentTarget.blur();

          return false;
        }
      },

      'change select': function(e)
      {
        var lines = _.pluck(e.currentTarget.selectedOptions, 'value');
        var model = this.model.builder.at(this.$(e.currentTarget).closest('tr').prop('rowIndex'));

        if (model)
        {
          model.set('lines', lines);
        }
      },

      'mousedown #-dragHandle': function(e)
      {
        e = e.originalEvent;

        var rect = e.currentTarget.getBoundingClientRect();
        var offset = {
          top: rect.y - e.pageY,
          left: rect.x - e.pageX
        };

        $(window)
          .on('mouseup.' + this.idPrefix, this.handleDragEnd.bind(this, offset))
          .on('mousemove.' + this.idPrefix, this.handleDrag.bind(this, offset));
      },

      'resize #-tbody': function()
      {
        this.saveCss();
      }

    },

    initialize: function()
    {
      var view = this;
      var entries = view.model.entries;
      var builder = view.model.builder;

      view.shown = false;

      view.listenTo(entries, 'change', view.onEntryChange);
      view.listenTo(builder, 'focus', view.onFocus);
      view.listenTo(builder, 'reset', view.onReset);
      view.listenTo(builder, 'add', view.onAdd);
      view.listenTo(builder, 'remove', view.onRemove);
      view.listenTo(builder, 'change:layouts', view.onLayoutsChange);
      view.listenTo(builder, 'change:lines', view.onLinesChange);
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      this.$('.is-expandable').expandableSelect('destroy');
    },

    getTemplateData: function()
    {
      var layouts = this.model.builder.layouts;

      return {
        layouts: KanbanPrintQueueBuilder.LAYOUTS.map(function(layout)
        {
          return {
            id: layout,
            active: layouts.indexOf(layout) !== -1
          };
        })
      };
    },

    afterRender: function()
    {
      this.$tbody = this.$id('tbody');
      this.$rows = this.$id('rows');
      this.$row = this.$rows.find('tr').detach();

      this.model.builder.forEach(this.addRow, this);
      this.recountTotals();
    },

    handleDragEnd: function(offset, e)
    {
      $(window).off('.' + this.idPrefix);

      this.position(e.originalEvent.pageX, e.originalEvent.pageY, offset);
      this.saveCss();
    },

    handleDrag: function(offset, e)
    {
      this.position(e.originalEvent.pageX, e.originalEvent.pageY, offset);
    },

    position: function(x, y, offset)
    {
      this.$el.css({
        top: Math.max(0, Math.min(Math.max(0, y + offset.top), window.innerHeight - 100)) + 'px',
        left: Math.max(0, Math.min(Math.max(0, x + offset.left), window.innerWidth - 200)) + 'px'
      });
    },

    saveCss: function()
    {
      localStorage.setItem(CSS_STORAGE_KEY, JSON.stringify({
        top: this.el.offsetTop,
        left: this.el.offsetLeft,
        height: this.$id('tbody')[0].clientHeight
      }));
    },

    show: function()
    {
      this.shown = true;

      var css = JSON.parse(localStorage.getItem(CSS_STORAGE_KEY) || 'null') || {
        top: 100,
        left: window.innerWidth / 2 - 618 / 2,
        height: 165
      };

      this.$tbody.css({
        height: css.height + 'px'
      });

      this.position(css.left, css.top, {left: 0, top: 0});

      this.$el.removeClass('hidden');

      this.$tbody[0].scrollTop = this.$tbody[0].scrollHeight;

      this.trigger('shown');
    },

    hide: function()
    {
      this.shown = false;

      this.$el.addClass('hidden');

      this.trigger('hidden');
    },

    recountNos: function()
    {
      this.$rows.children().each(function(i)
      {
        this.children[0].textContent = (i + 1) + '.';
      });
    },

    recountTotals: function()
    {
      var view = this;
      var totalNo = view.model.builder.length;
      var totalLines = {};

      view.model.builder.forEach(function(model)
      {
        model.get('lines').forEach(function(lineId)
        {
          totalLines[lineId] = 1;
        });
      });

      view.$id('totals-no').text(totalNo);
      view.$id('totals-lines').text(Object.keys(totalLines).length);

      KanbanPrintQueueBuilder.LAYOUTS.forEach(function(layoutId)
      {
        var total = 0;

        view.$('.kanban-builder-layout[data-layout="' + layoutId + '"]').each(function()
        {
          total += parseInt(this.textContent, 10);
        });

        view.$id('totals-' + layoutId).text(total);
      });
    },

    recountRow: function(rowIndex)
    {
      var model = this.model.builder.at(rowIndex);
      var entry = this.model.entries.get(model.get('ccn')).serialize();
      var kanbanQtyUser = entry.kanbanQtyUser;
      var lineCount = model.get('lines').length;
      var row = this.$id('rows')[0].rows[rowIndex];
      var layouts = this.model.builder.layouts;

      KanbanPrintQueueBuilder.LAYOUTS.forEach(function(layoutId, i)
      {
        var count = 0;

        if (layouts.indexOf(layoutId) !== -1)
        {
          if (entry.kind === 'kk')
          {
            count = layoutId === 'kk' ? (kanbanQtyUser * lineCount) : 0;
          }
          else if (entry.kind === 'pk')
          {
            count = layoutId === 'kk' ? 0 : (kanbanQtyUser * lineCount);
          }
        }

        row.cells[3 + i].textContent = count.toString();
      });
    },

    addRow: function(model)
    {
      var entry = this.model.entries.get(model.get('ccn'));

      if (!entry)
      {
        return;
      }

      var supplyArea = this.model.supplyAreas.get(entry.get('supplyArea'));
      var $tr = this.$row.clone();
      var tds = $tr[0].children;
      var select = tds[2].firstElementChild;
      var options = [];
      var lines = model.get('lines');

      tds[0].textContent = (this.$rows[0].childElementCount + 1) + '.';
      tds[1].textContent = entry.id;

      (supplyArea ? supplyArea.get('lines') : []).forEach(function(lineId)
      {
        var selected = lines.indexOf(lineId) === -1 ? '' : 'selected';

        lineId = _.escape(lineId);

        options.push('<option value="' + lineId + '" ' + selected + '>' + lineId + '</option>');
      });

      select.innerHTML = options.join('');

      this.$rows.append($tr);

      this.recountRow($tr.prop('rowIndex'));

      this.$(select).expandableSelect();

      this.$rows[0].lastElementChild.querySelector('select').focus();
    },

    validate: function()
    {
      var view = this;
      var builder = view.model.builder;
      var layoutError = '';
      var lineErrors = [];

      if (!builder.layouts.length)
      {
        layoutError = view.t('builder:error:noLayout');
      }

      view.$id('layoutError')[0].setCustomValidity(layoutError);

      view.$rows.children().each(function(modelIndex)
      {
        var model = builder.at(modelIndex);
        var entry = view.model.entries.get(model.get('ccn')).serialize();

        if (!entry.kind)
        {
          lineErrors.push(view.t('builder:error:noKind'));

          return;
        }

        var selectedLines = model.get('lines');

        for (var i = 0; i < selectedLines.length; ++i)
        {
          var selectedLine = selectedLines[i];
          var lineIndex = entry.lines.indexOf(selectedLine);

          if (lineIndex === -1)
          {
            continue;
          }

          var fromIndex = lineIndex * entry.kanbanQtyUser;
          var toIndex = lineIndex * entry.kanbanQtyUser + entry.kanbanQtyUser;

          for (var ii = fromIndex; ii < toIndex; ++ii)
          {
            if (!(entry.kanbanId[ii] > 0))
            {
              lineErrors.push(view.t('builder:error:noKanbanId', {
                line: selectedLine,
                i: ii + 1
              }));

              return;
            }
          }
        }

        var total = 0;

        $(this).find('.kanban-builder-layout').each(function()
        {
          total += parseInt(this.textContent, 10);
        });

        lineErrors.push(total === 0 ? view.t('builder:error:noKanbans') : '');
      });

      var lines = view.$('select');

      lineErrors.forEach(function(error, i)
      {
        lines[i].setCustomValidity(error);
      });

      return layoutError === '' && _.all(lineErrors, function(error) { return error === ''; });
    },

    submit: function()
    {
      var view = this;

      if (!view.validate())
      {
        setTimeout(function() { view.$id('submit').click(); }, 1);

        return;
      }

      viewport.msg.saving();

      var $inputs = view.$('button, select').prop('disabled', true);
      var jobs = [];

      view.model.builder.forEach(function(model)
      {
        var entry = view.model.entries.get(model.get('ccn')).serialize();
        var layouts = view.model.builder.layouts.filter(function(layout)
        {
          return (entry.kind === 'kk' && layout === 'kk')
            || (entry.kind !== 'kk' && layout !== 'kk');
        });

        model.get('lines').forEach(function(line)
        {
          var lineIndex = entry.lines.indexOf(line);
          var fromIndex = lineIndex * entry.kanbanQtyUser;
          var toIndex = lineIndex * entry.kanbanQtyUser + entry.kanbanQtyUser;

          jobs.push({
            line: line,
            kanbans: entry.kanbanId.slice(fromIndex, toIndex),
            layouts: layouts,
            data: {
              ccn: entry._id,
              nc12: entry.nc12,
              description: entry.description,
              supplyArea: entry.supplyArea,
              family: entry.family,
              componentQty: entry.componentQty,
              storageBin: entry.storageBin,
              minBinQty: entry.minBinQty,
              maxBinQty: entry.maxBinQty,
              replenQty: entry.replenQty,
              workstations: entry.workstations,
              locations: entry.locations
            }
          });
        });
      });

      var req = this.ajax({
        method: 'POST',
        url: '/kanban/printQueues',
        data: JSON.stringify({
          jobs: jobs
        })
      });

      req.fail(function()
      {
        viewport.msg.savingFailed();
      });

      req.done(function()
      {
        viewport.msg.saved();

        view.model.builder.reset([]);
      });

      req.always(function()
      {
        $inputs.prop('disabled', false);
      });
    },

    onEntryChange: function(entry)
    {
      var model = this.model.builder.findWhere({ccn: entry.id});

      if (!model)
      {
        return;
      }

      this.recountRow(this.model.builder.indexOf(model));
      this.recountTotals();
      this.validate();
    },

    onFocus: function(model)
    {
      var rowIndex = this.model.builder.models.indexOf(model);

      if (rowIndex !== -1)
      {
        this.$rows[0].rows[rowIndex].querySelector('select').focus();
      }
    },

    onReset: function()
    {
      this.render();

      if (this.model.builder.length === 0)
      {
        this.hide();
      }
    },

    onAdd: function(model)
    {
      this.addRow(model);
      this.recountTotals();
      this.validate();
    },

    onRemove: function(model, builder, options)
    {
      this.$(this.$rows[0].rows[options.index]).remove();

      this.recountNos();
      this.recountTotals();

      if (this.model.builder.length === 0)
      {
        this.hide();
      }
    },

    onLayoutsChange: function(layout, newState)
    {
      this.$('.btn[value="' + layout + '"]').toggleClass('active', newState);
      this.model.builder.forEach(function(model, i) { this.recountRow(i); }, this);
      this.recountTotals();
      this.validate();
    },

    onLinesChange: function(model)
    {
      this.recountRow(this.model.builder.models.indexOf(model));
      this.recountTotals();
      this.validate();
    }

  });
});
