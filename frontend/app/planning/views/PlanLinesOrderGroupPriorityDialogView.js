// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'select2',
  'Sortable',
  'app/viewport',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/core/util/resultTips',
  'app/data/clipboard',
  'app/planning/templates/linesOrderGroupPriorityDialog'
], function(
  _,
  select2,
  Sortable,
  viewport,
  View,
  idAndLabel,
  resultTips,
  clipboard,
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
      this.sortables = [];
      this.copyData = [];
    },

    destroy: function()
    {
      this.destroySortables();
    },

    destroySortables: function()
    {
      var view = this;

      view.$('input[data-line-id]').each(function()
      {
        var el = view.$(this);

        el.data('sortable').destroy();
        el.removeData('sortable');
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
      var view = this;

      view.$('input[data-line-id]').each(function()
      {
        view.setUpOrderGroupPriority(view.$(this));
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
              html.push(' &nbsp;<span class="label label-default">');
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
      var view = this;
      var $submit = view.$id('submit').prop('disabled', true);
      var $spinner = $submit.find('.fa-spinner').removeClass('hidden');

      var settings = view.plan.settings;

      view.$('input[data-line-id]').each(function()
      {
        var line = view.mrp.lines.get(this.dataset.lineId);

        if (!line)
        {
          return;
        }

        var orderGroupPriority = this.value;

        if (orderGroupPriority.length)
        {
          line.settings.set('orderGroupPriority', orderGroupPriority.split(','));
        }
      });

      var req = settings.save();

      req.done(viewport.closeDialog);
      req.fail(function()
      {
        $spinner.addClass('hidden');
        $submit.prop('disabled', false);

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: view.t('lines:menu:orderGroupPriority:failure')
        });

        view.plan.settings.trigger('errored');
      });
    },

    onDialogShown: function()
    {
      this.$id('line').select2('focus');
    }

  });
});
