// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'select2',
  'Sortable',
  'app/viewport',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/core/util/resultTips',
  'app/planning/templates/linesOrderGroupPriorityDialog',
  'app/planning/templates/linesOrderGroupPriorityGroup'
], function(
  _,
  $,
  select2,
  Sortable,
  viewport,
  View,
  idAndLabel,
  resultTips,
  template,
  groupTemplate
) {
  'use strict';

  return View.extend({

    template: template,

    modelProperty: 'plan',

    dialogClassName: 'planning-orderGroupPriority-dialog',

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
        this.copyData = this.$(e.target)
          .closest('.planning-orderGroupPriority-line')
          .find('.planning-orderGroupPriority-groups')
          .html();

        resultTips.showCopied({e: e});
      },

      'click a[data-action="paste"]': function(e)
      {
        this.$(e.target)
          .closest('.planning-orderGroupPriority-line')
          .find('.planning-orderGroupPriority-groups')
          .html(this.copyData);
      },

      'click a[data-action="remove"]': function(e)
      {
        const $group = this.$(e.target).closest('.planning-orderGroupPriority-group');

        $group.fadeOut('fast', () =>
        {
          $group.remove();
          this.setUpNewGroupSelect2();
        });
      },

      'click .planning-orderGroupPriority-line': function(e)
      {
        this.selectLine(e.currentTarget.dataset.lineId);
      },

      'mouseenter .planning-orderGroupPriority-group': function(e)
      {
        const groupEl = e.currentTarget;
        const {groupId} = groupEl.dataset;
        const lines = new Set();

        this.$(`.planning-orderGroupPriority-group[data-group-id="${groupId}"]`).each((i, g) =>
        {
          lines.add(g.parentNode.parentNode.dataset.lineId);

          if (g === groupEl)
          {
            return;
          }

          g.classList.add('is-same');

          g.parentNode.scrollTop = (g.offsetTop - g.parentNode.offsetTop)
            - (g.parentNode.offsetHeight / 2);
        });

        this.updateTitleLines(
          groupEl.querySelector('.planning-orderGroupPriority-group-name').innerText,
          Array.from(lines).sort((a, b) => a.localeCompare(b, undefined, {numeric: true, ignorePunctuation: true}))
        );
      },

      'mouseleave .planning-orderGroupPriority-group': function()
      {
        this.$(`.is-same`).removeClass('is-same');

        this.updateTitleLines('', []);
      },

      'change #-newGroup': function(e)
      {
        const $group = this.renderPartial(groupTemplate, {
          group: {
            id: e.added.id,
            label: e.added.text
          }
        });
        const $groups = this.$(`.planning-orderGroupPriority-line[data-line-id="${this.selectedLine}"]`)
          .find('.planning-orderGroupPriority-groups')
          .append($group);

        $groups[0].scrollTop = $groups[0].scrollHeight;

        $group.addClass('highlight');

        this.setUpNewGroupSelect2();
      },

      'change #-matchingMrps': function()
      {
        this.setUpNewGroupSelect2();
      }

    },

    localTopics: {
      'viewport.resized': 'resize'
    },

    initialize: function()
    {
      this.copyData = '';
      this.selectedLine = '';
    },

    destroy: function()
    {
      this.destroySortables();
    },

    destroySortables: function()
    {
      this.$('.planning-orderGroupPriority-groups').each((i, el) =>
      {
        const $el = this.$(el);

        $el.data('sortable').destroy();
        $el.removeData('sortable');
      });
    },

    getTemplateData: function()
    {
      return {
        renderGroup: this.renderPartialHtml.bind(this, groupTemplate),
        lines: this.mrp.getSortedLines().map(line =>
        {
          return {
            _id: line.id,
            orderGroupPriority: (line.settings.get('orderGroupPriority') || []).map(id =>
            {
              const orderGroup = this.orderGroups.get(id);

              return {
                id,
                label: orderGroup ? orderGroup.getLabel() : null
              };
            }).filter(g => !!g.label)
          };
        })
      };
    },

    afterRender: function()
    {
      this.$('.planning-orderGroupPriority-groups').each((i, el) =>
      {
        this.setUpSortable(this.$(el));
      });

      this.$('.planning-orderGroupPriority-line').first().click();
    },

    setUpSortable: function($groups)
    {
      const sortable = new Sortable($groups[0], {
        draggable: '.planning-orderGroupPriority-group',
        handle: 'i',
        filter: 'a',
        onStart: e =>
        {
          this.selectLine(e.item.parentNode.parentNode.dataset.lineId);
          this.$el.addClass('sortable-dragging');
        },
        onEnd: e =>
        {
          this.$el.removeClass('sortable-dragging');

          // Force redraw without moving the cursor
          e.item.offsetHeight; // eslint-disable-line no-unused-expressions
        }
      });

      $groups.data('sortable', sortable);
    },

    setUpNewGroupSelect2: function()
    {
      if (!this.selectedLine)
      {
        return;
      }

      const selectedGroups = new Set();

      this.$(`.planning-orderGroupPriority-line[data-line-id="${this.selectedLine}"]`)
        .find('.planning-orderGroupPriority-group')
        .each((i, g) => selectedGroups.add(g.dataset.groupId));

      const mrpPriority = this.mrp.lines.get(this.selectedLine).settings.get('mrpPriority');
      const matchingMrps = this.$id('matchingMrps').prop('checked');
      const data = this.orderGroups
        .filter(g => !selectedGroups.has(g.id))
        .map(g =>
        {
          const mrps = g.get('mrp') || [];

          return {
            id: g.id,
            text: g.getLabel(),
            mrps,
            search: (g.getLabel() + ' ' + mrps.join(' ')).trim().toUpperCase(),
            hasLineMrps: mrps.length === 0 || _.intersection(mrps, mrpPriority).length > 0,
            model: g
          };
        })
        .filter(g => !matchingMrps || g.hasLineMrps);

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

      this.$id('newGroup').val('').select2({
        width: '600px',
        data,
        placeholder: this.t('lines:menu:orderGroupPriority:newGroup', {line: this.selectedLine}),
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
    },

    submitForm: function()
    {
      const $submit = this.$id('submit').prop('disabled', true);
      const $spinner = $submit.find('.fa-spinner').removeClass('hidden');
      const settings = this.plan.settings;

      this.$('.planning-orderGroupPriority-line').each((i, el) =>
      {
        const lineSettings = settings.lines.get(el.dataset.lineId);

        if (!lineSettings)
        {
          return;
        }

        const newValue = this.$(el)
          .find('.planning-orderGroupPriority-group')
          .map((i, el) => el.dataset.groupId)
          .get();

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

    onDialogShowing: function()
    {
      this.resize();
    },

    resize: function()
    {
      const height = window.innerHeight
        - 20 // Margin
        - 30 // Padding
        - 55 // Header
        - 65 // Footer
        - 2
      ;

      this.$id('lines')[0].style.height = height + 'px';

      viewport.adjustDialogBackdrop();
    },

    updateTitleLines: function(group, lines)
    {
      const $title = $('.modal-title');
      let $lines = $title.find('.planning-orderGroupPriority-title-lines');

      if (!$lines.length)
      {
        $lines = $('<span class="planning-orderGroupPriority-title-lines"></span>').appendTo($title);
      }

      const text = lines.length ? `<b>${_.escape(group)}</b><br>${_.escape(lines.join(' ▪ '))}` : '';

      $lines.html(text);
    },

    selectLine: function(selectedLine)
    {
      if (this.selectedLine === selectedLine)
      {
        return;
      }

      this.selectedLine = selectedLine;

      this.$('.is-selected').removeClass('is-selected');
      this.$(`.planning-orderGroupPriority-line[data-line-id="${selectedLine}"]`).addClass('is-selected');

      this.setUpNewGroupSelect2();
    }

  });
});
