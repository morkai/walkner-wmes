// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'Sortable',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/production/util/orderPickerHelpers',
  '../util/scrollIntoView',
  '../DailyMrpPlanOrder',
  'app/hourlyPlans/templates/dailyMrpPlans/orders',
  'app/hourlyPlans/templates/dailyMrpPlans/orderPopover'
], function(
  _,
  $,
  Sortable,
  View,
  idAndLabel,
  orderPickerHelpers,
  scrollIntoView,
  DailyMrpPlanOrder,
  ordersTemplate,
  orderPopoverTemplate
) {
  'use strict';

  return View.extend({

    template: ordersTemplate,

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

        this.model.plan.trigger('itemEntered', {
          type: 'order',
          item: this.model.get(id)
        });

        if (id === view.selected)
        {
          return;
        }

        view.showPopover(view.$(e.currentTarget));
      },

      'mouseleave .dailyMrpPlan-list-item': function(e)
      {
        var orderNo = e.currentTarget.dataset.id;

        this.mouseovered = null;

        this.model.plan.trigger('itemLeft', {
          type: 'order',
          item: this.model.get(orderNo)
        });

        if (orderNo === this.selected)
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
      this.selectedOperation = null;
      this.ignoreScroll = false;

      this.listenTo(this.model, 'reset', this.render);
      this.listenTo(this.model, 'change:operation', this.onOperationChanged);
      this.listenTo(this.model, 'saveChangesRequested', this.onSaveChangesRequested);
      this.listenTo(this.model.plan.collection, 'itemSelected', this.onItemSelected);
    },

    destroy: function()
    {
      this.$item().popover('destroy');
      this.hideEditor();
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        orders: this.model.invoke('serializeListItem')
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

      view.$id('list').on('scroll', function(e)
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
    },

    showEditor: function()
    {
      var view = this;
      var $action = view.$id('edit').addClass('hidden');
      var hideEditor = view.hideEditor.bind(view);
      var hideTimer = null;

      view.unselect();

      this.$item().remove();

      var $editor = $('<input type="text">')
        .attr('id', view.idPrefix + '-editor')
        .val(view.model.pluck('_id').join(','))
        .on('select2-focus', function() { clearTimeout(hideTimer); })
        .on('select2-blur', function() { hideTimer = setTimeout(hideEditor, 200); })
        .insertAfter($action)
        .select2({
          width: 'off',
          allowClear: true,
          multiple: true,
          openOnEnter: false,
          placeholder: ' ',
          minimumInputLength: 7,
          formatSelection: function(item)
          {
            return _.escape(item.id);
          },
          formatResult: function(item)
          {
            return _.escape(item.id + ': ' + (item.planOrder.description || item.planOrder.name || '?'));
          },
          ajax: {
            cache: true,
            quietMillis: 300,
            url: function(term)
            {
              term = term.replace(/[^0-9]+/g, '');

              var id = term.length === 9
                ? term
                : ('regex=' + encodeURIComponent('^' + term.replace(/[^0-9]+/g, '')));

              return '/orders'
                + '?select(' + DailyMrpPlanOrder.ORDER_PROPERTIES.join(',') + ')'
                + '&limit(100)'
                + '&_id=' + id;
            },
            results: function(results)
            {
              return {
                results: _.map(results.collection, function(order)
                {
                  return {
                    id: order._id,
                    text: order._id,
                    planOrder: DailyMrpPlanOrder.prepareFromSapOrder(order)
                  };
                })
              };
            },
            transport: function(options)
            {
              return $.ajax.apply($, arguments).fail(function()
              {
                options.success({collection: []});
              });
            }
          }
        })
        .select2('data', view.model.map(function(planOrder)
        {
          return {
            id: planOrder.id,
            text: planOrder.id,
            planOrder: planOrder.toJSON()
          };
        }))
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
      var newOrders = _.map($editor.select2('data'), function(item) { return item.planOrder; });

      $editor.select2('destroy').remove();
      $action.removeClass('hidden');

      this.destroySortable();

      if (!this.model.update(newOrders))
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

    select: function(id, scroll)
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

      if (scroll)
      {
        this.ignoreScroll = true;

        if ($item[0].scrollIntoViewIfNeeded)
        {
          $item[0].scrollIntoViewIfNeeded(true);
        }
        else
        {
          $item[0].scrollIntoView();
        }

        _.defer(this.showPopover.bind(this, $item, true));
      }
      else
      {
        var popover = this.updatePopover(id, true);

        if (!popover)
        {
          this.showPopover($item, true);
        }
      }

      this.selected = id;

      this.model.plan.collection.trigger('itemSelected', {
        type: 'order',
        plan: this.model.plan,
        item: item
      });

      this.loadOperations();
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
      if (e.plan !== this.model.plan || e.type !== 'order')
      {
        this.unselect();
      }
    },

    onOperationChanged: function(line)
    {
      var editable = line.id === this.selected;

      this.updatePopover(line.id, editable);

      if (editable && this.lastOperations)
      {
        this.populateOperations(this.lastOperations, this.selected);
      }
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

      return orderPopoverTemplate({
        editable: !!editable,
        order: item.serializePopover()
      });
    },

    saveChanges: function($item)
    {
      var newOperation = this.selectedOperation;

      if (!newOperation)
      {
        return;
      }

      this.selectedOperation = null;

      this.model.get($item[0].dataset.id).setOperation(newOperation);
    },

    loadOperations: function()
    {
      var view = this;
      var selected = view.selected;
      var url = '/orders/' + selected + '?select(operations)';

      view.selectedOperation = null;

      view.ajax({url: url}).done(function(order)
      {
        if (view.selected !== selected
          || !order
          || !_.isArray(order.operations)
          || !order.operations.length)
        {
          return;
        }

        view.populateOperations(order.operations, selected);
      });
    },

    populateOperations: function(operations, selectedItemId)
    {
      var view = this;
      var popover = view.$item(selectedItemId).data('bs.popover');

      if (!popover)
      {
        return;
      }

      var operation = view.model.get(selectedItemId).get('operation');
      var html = operations
        .map(function(op)
        {
          return '<option value="' + op.no + '" data-labor-time="' + op.laborTime + '"'
            + (operation && op.no === operation.no ? ' selected' : '')
            + '>' + _.escape(op.name || op.no) + '</option>';
        })
        .join('');

      popover
        .tip()
        .find('select[name="operation"]')
        .html(html)
        .on('change', function(e)
        {
          view.selectedOperation = _.find(operations, {no: e.target.value});

          view.$(e.target).closest('table').find('[data-property="laborTime"]').text(
            parseFloat(e.target.selectedOptions[0].dataset.laborTime).toLocaleString()
          );
        });

      view.lastOperations = operations;
    }

  });
});
