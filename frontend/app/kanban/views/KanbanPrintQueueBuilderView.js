// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/core/View',
  'app/core/util/uuid',
  'app/core/util/ExpandableSelect',
  'app/data/localStorage',
  '../KanbanPrintQueueBuilder',
  '../layouts',
  'app/kanban/templates/builder/builder'
], function(
  _,
  $,
  viewport,
  View,
  uuid,
  ExpandableSelect,
  localStorage,
  KanbanPrintQueueBuilder,
  kanbanLayouts,
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
      },

      'click #-lines': function()
      {
        var view = this;

        if (view.$id('lines').find('select').length)
        {
          return false;
        }

        var lines = {};

        view.model.builder.forEach(function(model)
        {
          var allLines = view.model.entries.get(model.get('ccn')).serialize(view.model).lines;
          var selectedLines = model.get('lines');

          allLines.forEach(function(line)
          {
            lines[line] = selectedLines.indexOf(line) !== -1;
          });
        });

        var sortedLines = Object.keys(lines).sort(function(a, b)
        {
          return a.localeCompare(b, undefined, {ignorePunctuation: true, numeric: true});
        });

        var $select = $('<select class="form-control is-expandable" multiple></select>');

        sortedLines.forEach(function(line)
        {
          var selected = lines[line];

          line = _.escape(line);

          $select.append('<option value="' + line + '" ' + (selected ? 'selected' : '') + '>' + line + '</option>');
        });

        view.$id('lines').append($select);

        $select.expandableSelect({expandedLength: Math.min(sortedLines.length, 10)}).focus();

        $select.on('blur', function()
        {
          $select.remove();
        });

        $select.on('change', function()
        {
          var selectedLines = {};

          ($select.val() || []).forEach(function(line) { selectedLines[line] = true; });

          view.$rows.find('select').each(function()
          {
            var $tr = $(this).closest('tr');
            var model = view.model.builder.at($tr[0].rowIndex);
            var lines = [];

            _.forEach(this.options, function(option)
            {
              option.selected = selectedLines[option.value];

              if (option.selected)
              {
                lines.push(option.value);
              }
            });

            model.attributes.lines = lines;

            view.recountRow(model, $tr);
          });

          view.model.builder.store();

          view.recountTotals();
          view.validate();
        });
      },

      'change #-newStorageBin': function()
      {
        this.model.builder.toggleNewStorageBin(this.$id('newStorageBin').prop('checked'));
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
      view.listenTo(builder, 'multiAdd', view.onMultiAdd);
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
        newStorageBin: this.model.builder.newStorageBin,
        layouts: kanbanLayouts.map(function(layout)
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

      this.addRows(this.model.builder.models);
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

      kanbanLayouts.forEach(function(layoutId)
      {
        var total = 0;

        view.$('.kanban-builder-layout[data-layout="' + layoutId + '"]').each(function()
        {
          total += parseInt(this.textContent, 10);
        });

        view.$id('totals-' + layoutId).text(total);
      });
    },

    recountRow: function(model, $tr)
    {
      var row = $tr && $tr.length ? $tr[0] : this.$rows[0].rows[this.model.builder.models.indexOf(model)];
      var entry = this.model.entries.get(model.get('ccn')).serialize(this.model);
      var kanbanQtyUser = entry.kanbanQtyUser;
      var lineCount = model.get('lines').length;
      var layouts = this.model.builder.layouts;

      kanbanLayouts.forEach(function(layoutId, i)
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

    addRows: function(models)
    {
      var view = this;
      var $fragment = $(document.createDocumentFragment());
      var no = view.$rows[0].childElementCount;

      models.forEach(function(model)
      {
        var entry = view.model.entries.get(model.get('ccn'));

        if (!entry)
        {
          return;
        }

        ++no;

        var $tr = view.$row.clone();
        var tds = $tr[0].children;
        var select = tds[2].firstElementChild;
        var options = [];
        var lines = model.get('lines');

        tds[0].textContent = no + '.';
        tds[1].textContent = entry.id;

        entry.serialize(view.model).lines.forEach(function(lineId)
        {
          var selected = lines.indexOf(lineId) === -1 ? '' : 'selected';

          lineId = _.escape(lineId);

          options.push('<option value="' + lineId + '" ' + selected + '>' + lineId + '</option>');
        });

        select.innerHTML = options.join('');

        view.recountRow(model, $tr);

        $fragment.append($tr);
      });

      $fragment.find('select').expandableSelect();

      view.$rows.append($fragment);

      if (models.length !== 1)
      {
        return;
      }

      clearTimeout(view.timers.focusLast);

      view.timers.focusLast = setTimeout(function()
      {
        var lastRowEl = view.$rows[0].lastElementChild;

        if (lastRowEl)
        {
          lastRowEl.querySelector('select').focus();
        }
      }, 1);
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
        var entry = view.model.entries.get(model.get('ccn')).serialize(view.model);

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

        lineErrors.push('');
      });

      var lines = view.$rows.find('select');

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

      var $inputs = view.$('button, select, input').prop('disabled', true);
      var newStorageBin = view.$id('newStorageBin').prop('checked');
      var jobs = [];

      view.model.builder.forEach(function(model)
      {
        var entry = view.model.entries.get(model.get('ccn')).serialize(view.model);

        if (!entry.workstationsTotal)
        {
          return;
        }

        var jobLayouts = view.model.builder.layouts.filter(function(layout)
        {
          return (entry.kind === 'kk' && layout === 'kk')
            || (entry.kind !== 'kk' && layout !== 'kk');
        });

        if (!jobLayouts.length)
        {
          return;
        }

        model.get('lines').forEach(function(line)
        {
          var lineIndex = entry.lines.indexOf(line);
          var fromIndex = lineIndex * entry.kanbanQtyUser;
          var toIndex = lineIndex * entry.kanbanQtyUser + entry.kanbanQtyUser;
          var storageBin = entry.storageBin;

          if (newStorageBin && entry.newStorageBin)
          {
            storageBin = entry.newStorageBin;
          }

          jobs.push({
            _id: uuid(),
            line: line,
            kanbans: entry.kanbanId.slice(fromIndex, toIndex),
            layouts: jobLayouts,
            data: {
              ccn: entry._id,
              nc12: entry.nc12,
              description: entry.description,
              supplyArea: entry.supplyArea,
              family: entry.family,
              componentQty: entry.componentQty,
              unit: entry.unit,
              storageBin: storageBin,
              minBinQty: entry.minBinQty,
              maxBinQty: entry.maxBinQty,
              replenQty: entry.replenQty,
              workstations: entry.workstations,
              locations: entry.locations
            }
          });
        });
      });

      if (jobs.length === 0)
      {
        viewport.msg.saved();
        view.model.builder.reset([]);
        $inputs.prop('disabled', false);

        return;
      }

      jobs.sort(function(a, b)
      {
        return a.line.localeCompare(b.line, undefined, {
          numeric: true,
          ignorePunctuation: true
        });
      });

      var req = view.ajax({
        method: 'POST',
        url: '/kanban/printQueues',
        data: JSON.stringify({
          _id: uuid(),
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

      this.recountRow(model);
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

    onAdd: function(model, collection, options)
    {
      if (options && options.multi)
      {
        return;
      }

      this.onMultiAdd([model.id]);
    },

    onMultiAdd: function(ids)
    {
      this.addRows(ids.map(function(id) { return this.model.builder.get(id); }, this));
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
      this.model.builder.forEach(function(model) { this.recountRow(model); }, this);
      this.recountTotals();
      this.validate();
    },

    onLinesChange: function(model)
    {
      this.recountRow(model);
      this.recountTotals();
      this.validate();
    }

  });
});
