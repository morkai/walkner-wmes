// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'Sortable',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/data/orgUnits',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/planning/templates/linesMrpPriorityDialog'
], function(
  _,
  $,
  Sortable,
  t,
  user,
  viewport,
  View,
  orgUnits,
  setUpMrpSelect2,
  template
) {
  'use strict';

  return View.extend({

    modelProperty: 'plan',

    template,

    events: {

      'submit': function()
      {
        this.submitForm();

        return false;
      },

      'change #-line': function(e)
      {
        this.addLine(e.added.id);

        this.$id('line').select2('val', '');

        viewport.adjustDialogBackdrop();
      },

      'click .btn[data-action="remove"]': function(e)
      {
        var $tr = this.$(e.target).closest('tr');

        this.removedLines[$tr[0].dataset.id] = true;

        $tr.fadeOut('fast', () =>
        {
          $tr.remove();
          this.recountLines();
          viewport.adjustDialogBackdrop();
        });
      },

      'click .btn[data-action="down"]': function(e)
      {
        var $tr = this.$(e.target).closest('tr');
        var $next = $tr.next();

        if ($next.length)
        {
          $tr.insertAfter($next);
        }
        else
        {
          $tr.insertBefore($tr.parent()[0].firstElementChild);
        }

        this.recountLines();

        e.currentTarget.focus();
      },

      'click .btn[data-action="up"]': function(e)
      {
        var $tr = this.$(e.target).closest('tr');
        var $prev = $tr.prev();

        if ($prev.length)
        {
          $tr.insertBefore($prev);
        }
        else
        {
          $tr.insertAfter($tr.parent()[0].lastElementChild);
        }

        this.recountLines();

        e.currentTarget.focus();
      }

    },

    initialize: function()
    {
      this.removedLines = {};

      this.listenTo(this.plan.settings, 'changed', this.onSettingsChanged);
    },

    destroy: function()
    {
      if (this.sortable)
      {
        this.sortable.destroy();
      }
    },

    getTemplateData: function()
    {
      return {
        mrp: this.mrp.id
      };
    },

    afterRender: function()
    {
      this.mrp.getSortedLines().forEach(mrpLine => this.addLine(mrpLine.id));

      this.setUpLineSelect2();
      this.setUpSortable();

      viewport.adjustDialogBackdrop();
    },

    setUpLineSelect2: function()
    {
      var view = this;
      var maxLineLength = 0;
      var lines = orgUnits.getAllByType('prodLine')
        .filter(prodLine => !prodLine.get('deactivatedAt'))
        .map(prodLine =>
        {
          if (prodLine.id.length > maxLineLength)
          {
            maxLineLength = prodLine.id.length;
          }

          var disabled = view.plan.settings.isLineLocked(prodLine.id);

          return {
            id: prodLine.id,
            text: prodLine.get('description'),
            disabled: disabled,
            locked: disabled
          };
        })
        .sort((a, b) => a.id.localeCompare(b.id, undefined, {numeric: true, ignorePunctuation: true}));

      view.$id('line').select2({
        allowClear: true,
        data: lines,
        matcher: (term, text, item) =>
        {
          term = term.toUpperCase();

          return item.id.toUpperCase().indexOf(term) >= 0
            || item.text.toUpperCase().indexOf(term) >= 0;
        },
        formatSelection: (item) =>
        {
          return _.escape(item.id) + ': ' + _.escape(item.text);
        },
        formatResult: (item) =>
        {
          var id = item.id;

          while (id.length < maxLineLength)
          {
            id += ' ';
          }

          var icon = '';

          if (item.disabled)
          {
            icon = '<i class="fa fa-lock" style="color: #e00"></i> ';
          }

          return '<span class="text-mono">' + _.escape(id).replace(/ /g, '&nbsp;') + '</span>: '
            + '<span class="text-small">' + icon + _.escape(item.text) + '</span>';
        }
      });
    },

    setUpSortable: function()
    {
      if (this.sortable)
      {
        this.sortable.destroy();
      }

      this.sortable = new Sortable(this.$id('lines')[0], {
        draggable: 'tr',
        filter: '.actions',
        ghostClass: 'planning-sortable-ghost',
        onEnd: () =>
        {
          this.recountLines();
        }
      });
    },

    addLine: function(lineId)
    {
      delete this.removedLines[lineId];

      var $lines = this.$id('lines');

      if ($lines.find('tr[data-id="' + lineId + '"]').length)
      {
        return;
      }

      if (!this.$rowTemplate)
      {
        this.$rowTemplate = $lines.children().first().detach();
      }

      var $row = this.$rowTemplate.clone().attr('data-id', lineId);

      $row[0].children[0].textContent = ($lines[0].childElementCount + 1) + '.';
      $row[0].children[1].textContent = lineId;

      $lines.append($row);
    },

    recountLines: function()
    {
      this.$id('lines').children().each((i, tr) =>
      {
        tr.children[0].textContent = (i + 1) + '.';
      });
    },

    submitForm: function()
    {
      viewport.msg.saving();

      var $submit = this.$id('submit').prop('disabled', true);
      var $spinner = $submit.find('.fa-spinner').removeClass('hidden');
      var settings = this.plan.settings;
      var linePriority = [];

      this.$('tr[data-id]').each((i, tr) =>
      {
        var lineId = tr.dataset.id;
        var lineSettings = settings.lines.get(lineId);

        linePriority.push(lineId);

        if (lineSettings)
        {
          var mrpPriority = lineSettings.get('mrpPriority');

          if (!mrpPriority.includes(this.mrp.id))
          {
            lineSettings.set('mrpPriority', mrpPriority.concat([this.mrp.id]));
          }
        }
        else
        {
          settings.lines.add({
            _id: lineId,
            mrpPriority: [this.mrp.id]
          });
        }
      });

      Object.keys(this.removedLines).forEach(lineId =>
      {
        var lineSettings = settings.lines.get(lineId);

        if (!lineSettings)
        {
          return;
        }

        var mrpPriority = lineSettings.get('mrpPriority');

        if (!mrpPriority.includes(this.mrp.id))
        {
          return;
        }

        lineSettings.set('mrpPriority', mrpPriority.filter(mrp => mrp !== this.mrp.id));
      });

      settings.mrps.get(this.mrp.id).set('linePriority', linePriority);

      var req = settings.save();

      req.done(() =>
      {
        viewport.msg.saved();
        viewport.closeDialog();
      });

      req.fail(() =>
      {
        $spinner.addClass('hidden');
        $submit.prop('disabled', false);

        viewport.msg.savingFailed();

        this.plan.settings.trigger('errored');
      });
    },

    onDialogShown: function()
    {
      this.$id('line').select2('focus');
    },

    onSettingsChanged: function(changes)
    {
      if (!changes.locked)
      {
        return;
      }

      var view = this;

      view.setUpLineSelect2();

      view.$('input[data-line-id]').each(function()
      {
        var $mrpPriority = view.$(this);
        var lineSettings = view.plan.settings.lines.get(this.dataset.lineId);
        var oldMrpPriority = lineSettings.get('mrpPriority');
        var newMrpPriority = $mrpPriority
          .val()
          .split(',')
          .filter(function(mrp)
          {
            return mrp.length > 0 && (_.includes(oldMrpPriority, mrp) || !view.plan.settings.isMrpLocked(mrp));
          });

        $mrpPriority.select('destroy').val(newMrpPriority.join(','));

        view.setUpMrpPriority($mrpPriority, false);
      });
    }

  });
});
