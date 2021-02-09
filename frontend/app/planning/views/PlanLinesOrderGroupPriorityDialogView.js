// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'select2',
  'Sortable',
  'app/viewport',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/core/util/resultTips',
  'app/planning/templates/linesOrderGroupPriorityDialog'
], function(
  _,
  select2,
  Sortable,
  viewport,
  View,
  idAndLabel,
  resultTips,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    modelProperty: 'plan',

    events: {

      'submit': function()
      {
        this.submitForm();

        return false;
      },

      'change input': function()
      {
        viewport.adjustDialogBackdrop();
      },

      'click a[data-action="copy"]': function(e)
      {
        this.copyData = this.$(e.target).closest('.form-group').find('input').select2('data');

        resultTips.showCopied({e: e});
      },

      'click a[data-action="paste"]': function(e)
      {
        this.$(e.target).closest('.form-group').find('input').select2('data', this.copyData).trigger('change');
      }

    },

    initialize: function()
    {
      this.copyData = [];
    },

    destroy: function()
    {
      this.destroySortables();
    },

    destroySortables: function()
    {
      this.$('input[data-line-id]').each((i, el) =>
      {
        const $el = this.$(el);

        $el.data('sortable').destroy();
        $el.removeData('sortable');
      });
    },

    getTemplateData: function()
    {
      var view = this;

      return {
        lines: view.mrp.getSortedLines().map(function(line)
        {
          return {
            _id: line.id,
            orderGroupPriority: (line.settings.get('orderGroupPriority') || []).join(',')
          };
        })
      };
    },

    afterRender: function()
    {
      this.$('input[data-line-id]').each((i, el) =>
      {
        this.setUpOrderGroupPriority(this.$(el));
      });
    },

    setUpOrderGroupPriority: function($orderGroupPriority)
    {
      const mrpPriority = this.mrp.lines.get($orderGroupPriority[0].dataset.lineId).settings.get('mrpPriority');
      const data = this.orderGroups.map(g =>
      {
        const mrps = g.get('mrp') || [];

        return {
          id: g.id,
          text: g.getLabel(),
          mrps,
          search: (g.getLabel() + ' ' + mrps.join(' ')).trim().toUpperCase(),
          hasLineMrps: _.intersection(mrps, mrpPriority).length > 0,
          model: g
        };
      });

      data.sort((a, b) =>
      {
        if (a.model.isNoMatchGroup())
        {
          return -1;
        }

        if (b.model.isNoMatchGroup())
        {
          return 1;
        }

        if (a.hasLineMrps === b.hasLineMrps)
        {
          return a.text.localeCompare(b.text, undefined, {numeric: true, ignorePunctuation: true});
        }

        if (a.hasLineMrps)
        {
          return -1;
        }

        return 1;
      });

      $orderGroupPriority.select2({
        allowClear: true,
        multiple: true,
        data,
        matcher: (term, text, item) => item.search.includes(term.toUpperCase()),
        formatResult: (item, $container, query, e) =>
        {
          const html = [];

          select2.util.markMatch(item.text, query.term, html, e);

          if (item.mrps.length)
          {
            item.mrps.forEach(mrp =>
            {
              const label = mrpPriority.includes(mrp) ? 'success' : 'default';

              html.push(` &nbsp;<span class="label label-${label}">`);
              select2.util.markMatch(mrp, query.term, html, e);
              html.push('</span>');
            });
          }

          return html.join('');
        }
      });

      let sortable = $orderGroupPriority.data('sortable');

      if (sortable)
      {
        sortable.destroy();
      }

      sortable = new Sortable($orderGroupPriority.select2('container').find('.select2-choices')[0], {
        draggable: '.select2-search-choice',
        filter: '.select2-search-choice-close',
        onStart: () =>
        {
          $orderGroupPriority.select2('onSortStart');
        },
        onEnd: () =>
        {
          $orderGroupPriority.select2('onSortEnd').select2('focus');
        }
      });

      $orderGroupPriority.data('sortable', sortable);
    },

    submitForm: function()
    {
      const $submit = this.$id('submit').prop('disabled', true);
      const $spinner = $submit.find('.fa-spinner').removeClass('hidden');
      const settings = this.plan.settings;

      this.$('input[data-line-id]').each((i, el) =>
      {
        const lineSettings = settings.lines.get(el.dataset.lineId);

        if (!lineSettings)
        {
          return;
        }

        const newValue = el.value.split(',').filter(v => !!v.length);

        lineSettings.set('orderGroupPriority', newValue);
      });

      viewport.msg.saving();

      const req = settings.save();

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
    }

  });
});
