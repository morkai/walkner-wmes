// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'Sortable',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  '../util/scrollIntoView',
  'app/hourlyPlans/templates/dailyMrpPlans/lines',
  'app/hourlyPlans/templates/dailyMrpPlans/linePopover'
], function(
  _,
  $,
  Sortable,
  View,
  idAndLabel,
  orgUnits,
  scrollIntoView,
  linesTemplate,
  linePopoverTemplate
) {
  'use strict';

  return View.extend({

    template: linesTemplate,

    events: {

      'click #-edit': 'showEditor',

      'keydown .select2-input': function(e)
      {
        if (e.keyCode === 13)
        {
          this.hideEditor();
        }
      },

      'click .dailyMrpPlan-list-item': function(e)
      {
        this.toggleSelection(e.currentTarget.dataset.id);
      },

      'mouseenter .dailyMrpPlan-list-item': function(e)
      {
        var view = this;
        var id = e.currentTarget.dataset.id;

        this.mouseovered = id;

        if (id === view.selected)
        {
          return;
        }

        view.showPopover(view.$(e.currentTarget));
      },

      'mouseleave .dailyMrpPlan-list-item': function(e)
      {
        var id = e.currentTarget.dataset.id;

        this.mouseovered = null;

        if (id === this.selected)
        {
          return;
        }

        this.$(e.currentTarget).popover('destroy');
      }

    },

    initialize: function()
    {
      this.sortable = null;
      this.sorting = false;
      this.selected = null;
      this.mouseovered = null;
      this.ignoreScroll = false;

      this.onResize = _.debounce(this.resize.bind(this), 16);

      this.listenTo(this.model, 'reset', this.render);
      this.listenTo(this.model, 'change', this.onChanged);
      this.listenTo(this.model, 'saveChangesRequested', this.onSaveChangesRequested);
      this.listenTo(this.model.plan.collection, 'itemSelected', this.onItemSelected);

      $(window).on('resize.' + this.idPrefix, this.onResize);
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
      this.$item().popover('destroy');
      this.hideEditor();
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        lines: this.model.invoke('serializeListItem')
      };
    },

    afterRender: function()
    {
      var view = this;

      if (view.selected)
      {
        var $item = this.$item(view.selected);

        view.selected = null;

        if ($item.length)
        {
          view.ignoreScroll = true;

          scrollIntoView($item[0]);

          $item.click();
        }
      }

      this.$id('list').on('scroll', function(e)
      {
        if (view.ignoreScroll)
        {
          view.ignoreScroll = false;
        }
        else
        {
          view.unselect();
        }

        view.$id('scrollIndicator').toggleClass('hidden', e.target.scrollLeft <= 40);
      });

      view.resize();
    },

    resize: function()
    {
      var $edit = this.$id('edit');
      var $scrollIndicator = this.$id('scrollIndicator');
      var pos = $edit.position();

      $scrollIndicator.css({
        top: (pos.top + 1) + 'px',
        left: ($edit.outerWidth() + pos.left) + 'px'
      });
    },

    showEditor: function()
    {
      var view = this;
      var $action = view.$id('edit').addClass('hidden');
      var hideEditor = view.hideEditor.bind(view);
      var hideTimer = null;

      view.unselect();

      view.$item().remove();

      var $editor = $('<input type="text">')
        .attr('id', this.idPrefix + '-editor')
        .val(this.model.pluck('_id').join(','))
        .on('select2-focus', function() { clearTimeout(hideTimer); })
        .on('select2-blur', function() { hideTimer = setTimeout(hideEditor, 200); })
        .insertAfter($action)
        .select2({
          width: 'off',
          allowClear: true,
          multiple: true,
          openOnEnter: false,
          placeholder: ' ',
          data: orgUnits.getAllByType('prodLine')
            .filter(function(prodLine)
            {
              return !prodLine.get('deactivatedAt')
                && prodLine.getSubdivision().get('type') === 'assembly';
            })
            .map(idAndLabel)
        })
        .select2('focus');

      var choicesEl = $editor.select2('container').find('.select2-choices')[0];

      this.sortable = new Sortable(choicesEl, {
        draggable: '.select2-search-choice',
        filter: '.select2-search-choice-close',
        onStart: function()
        {
          view.sorting = true;

          $editor.select2('onSortStart');
        },
        onEnd: function()
        {
          view.sorting = false;

          $editor.select2('onSortEnd').select2('focus');
        }
      });
    },

    hideEditor: function()
    {
      if (this.sorting)
      {
        return false;
      }

      var $editor = this.$id('editor');

      if (!$editor.length)
      {
        return;
      }

      var $action = this.$id('edit');
      var newLines = $editor.val().split(',').filter(function(v) { return v.length > 0; });

      $editor.select2('destroy').remove();
      $action.removeClass('hidden');

      this.destroySortable();

      if (!this.model.update(newLines))
      {
        this.render();
      }
    },

    toggleSelection: function(id)
    {
      if (id === this.selected)
      {
        this.unselect();
      }
      else
      {
        this.select(id);
      }
    },

    select: function(id)
    {
      var item = this.model.get(id);

      if (!item)
      {
        return;
      }

      if (id !== this.selected)
      {
        this.unselect();
      }

      var $item = this.$item(id).addClass('is-selected');
      var popover = this.updatePopover(id, true);

      if (!popover)
      {
        this.showPopover($item, true);
      }

      this.selected = id;

      this.model.plan.collection.trigger('itemSelected', {
        type: 'line',
        plan: this.model.plan,
        item: item
      });
    },

    unselect: function()
    {
      if (!this.selected)
      {
        return;
      }

      var $item = this.$('.is-selected').removeClass('is-selected');

      this.saveChanges($item);

      if (this.selected === this.mouseovered)
      {
        this.updatePopover($item.attr('data-id'), false);
      }
      else
      {
        $item.popover('destroy');
      }

      this.selected = null;
    },

    destroySortable: function()
    {
      if (this.sortable)
      {
        this.sortable.destroy();
        this.sortable = null;
      }
    },

    onSaveChangesRequested: function()
    {
      if (this.selected)
      {
        this.saveChanges(this.$item(this.selected));
      }
    },

    onItemSelected: function(e)
    {
      if (e.plan !== this.model.plan || e.type !== 'line')
      {
        this.unselect();
      }
    },

    onChanged: function(line)
    {
      this.updateWorkerCount(line);
      this.updateCustomTimes(line);
      this.updatePopover(line.id, line.id === this.selected);
    },

    $item: function(id)
    {
      return id ? this.$('.dailyMrpPlan-list-item[data-id="' + id + '"]') : this.$('.dailyMrpPlan-list-item');
    },

    showPopover: function($item, editable)
    {
      $item.popover({
        container: this.el,
        trigger: 'manual',
        placement: 'top',
        html: true,
        content: this.getPopoverContent.bind(this, $item.attr('data-id'), editable),
        template: '<div class="popover dailyMrpPlan-popover">'
          + '<div class="arrow"></div>'
          + '<div class="popover-content"></div>'
          + '</div>'
      }).popover('show');
    },

    updatePopover: function(id, editable)
    {
      var popover = this.$item(id).data('bs.popover');

      if (!popover)
      {
        return null;
      }

      popover.tip().find('.popover-content').html(this.getPopoverContent(id, editable));

      return popover;
    },

    getPopoverContent: function(id, editable)
    {
      var item = this.model.get(id);

      return linePopoverTemplate({
        editable: this.model.plan.isEditable() && !!editable,
        line: item.serializePopover()
      });
    },

    saveChanges: function($item)
    {
      var popover = $item.data('bs.popover');

      if (!popover || !this.model.plan.isEditable())
      {
        return;
      }

      var $tip = popover.tip();

      this.model.get($item[0].dataset.id).update({
        activeFrom: $tip.find('[name="activeFrom"]').val(),
        activeTo: $tip.find('[name="activeTo"]').val(),
        workerCount: Math.max(0, parseInt($tip.find('[name="workerCount"]').val(), 10))
      });
    },

    updateWorkerCount: function(line)
    {
      var workerCount = line.get('workerCount');

      this.$item(line.id)
        .find('.dailyMrpPlan-list-property[data-property="workerCount"]')
        .toggleClass('is-invalid', !workerCount)
        .find('span')
        .text(workerCount);
    },

    updateCustomTimes: function(line)
    {
      var customTimes = line.serializeCustomTimes();

      this.$item(line.id)
        .find('.dailyMrpPlan-list-property[data-property="customTimes"]')
        .toggleClass('hidden', !line.hasCustomTimes())
        .find('span')
        .text(customTimes);
    }

  });
});
