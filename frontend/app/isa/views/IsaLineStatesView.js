// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/views/DialogView',
  './IsaResponderPickerView',
  'app/isa/templates/lineStates',
  'app/isa/templates/lineState',
  'app/isa/templates/cancelDialog'
], function(
  $,
  t,
  viewport,
  View,
  DialogView,
  IsaResponderPickerView,
  lineStatesTemplate,
  lineStateTemplate,
  cancelDialogTemplate
) {
  'use strict';

  return View.extend({

    template: lineStatesTemplate,

    events: {
      'click .isa-lineState-accept': function(e)
      {
        e.currentTarget.blur();

        this.accept(this.findLineStateId(e.target));
      },
      'click .isa-lineState-finish': function(e)
      {
        e.currentTarget.blur();

        this.finish(this.findLineStateId(e.target));
      },
      'click .isa-lineState-cancel': function(e)
      {
        e.currentTarget.blur();

        this.cancel(this.findLineStateId(e.target));
      }
    },

    initialize: function()
    {
      this.requiredStatus = this.options.mode === 'requests' ? 'request' : 'response';
      this.cancelling = null;

      var lineStates = this.model.lineStates;

      this.listenTo(lineStates, 'reset', this.render);
      this.listenTo(lineStates, 'filter', this.render);
      this.listenTo(lineStates, 'add', this.onAdd);
      this.listenTo(lineStates, 'remove', this.onRemove);
      this.listenTo(lineStates, 'change', this.onChange);
    },

    serialize: function()
    {
      var selectedResponder = this.options.mode === 'responses' && this.model.selectedResponder
        ? this.model.selectedResponder
        : null;

      return {
        idPrefix: this.idPrefix,
        mode: this.options.mode,
        lineStates: this.model.lineStates
          .where({status: this.requiredStatus})
          .filter(function(lineState) { return lineState.matchResponder(selectedResponder); })
          .map(function(lineState) { return lineState.serialize(); }),
        renderLineState: lineStateTemplate
      };
    },

    afterRender: function()
    {
      this.recount();
    },

    updateTimes: function()
    {
      var lineStates = this.model.lineStates;

      this.$('.isa-lineState').each(function()
      {
        var lineState = lineStates.get(this.dataset.id);
        var time = lineState.get('time');
        var timeEl = this.querySelector('.isa-lineState-time');

        timeEl.setAttribute('datetime', time.iso);
        timeEl.setAttribute('title', time.long);
        timeEl.textContent = time.human;
      });
    },

    actAt: function(action, no)
    {
      var lineStateEl = this.el.children[no];

      if (lineStateEl)
      {
        this[action](lineStateEl.dataset.id);
      }
    },

    cancel: function(lineStateId)
    {
      var lineState = this.model.lineStates.get(lineStateId);

      if (!lineState)
      {
        return;
      }

      var $lineState = this.findLineStateEl(lineState.id);

      if (!$lineState.length)
      {
        return;
      }

      var $actions = $lineState.find('.btn').prop('disabled', true);
      var view = this;
      var dialogView = new DialogView({
        template: cancelDialogTemplate
      });

      this.listenToOnce(dialogView, 'dialog:hidden', function()
      {
        $actions.prop('disabled', false);
        view.cancelling = null;
      });

      this.listenToOnce(dialogView, 'answered', function(answer)
      {
        if (answer !== 'yes')
        {
          return;
        }

        lineState.cancel(null, function(err)
        {
          if (!err)
          {
            return;
          }

          viewport.msg.show({
            type: 'error',
            time: 5000,
            text: t.has('isa', 'cancel:' + err.message)
              ? t('isa', 'cancel:' + err.message)
              : t('isa', 'cancel:failure')
          });
        });
      });

      viewport.showDialog(dialogView, t('isa', 'cancel:title'));

      this.cancelling = lineStateId;
    },

    accept: function(lineStateId)
    {
      var lineState = this.model.lineStates.get(lineStateId);

      if (!lineState)
      {
        return;
      }

      var $lineState = this.findLineStateEl(lineState.id);

      if (!$lineState.length)
      {
        return;
      }

      var responderPickerView = new IsaResponderPickerView({
        model: this.model.shiftPersonnel
      });

      this.listenToOnce(responderPickerView, 'picked', function(user)
      {
        responderPickerView.hide();

        if (!user)
        {
          return;
        }

        lineState.accept(user, function(err)
        {
          if (!err)
          {
            return;
          }

          viewport.msg.show({
            type: 'error',
            time: 5000,
            text: t.has('isa', 'accept:' + err.message)
              ? t('isa', 'accept:' + err.message)
              : t('isa', 'accept:failure')
          });
        });
      });

      responderPickerView.show($lineState.find('.isa-lineState-actions'));
    },

    finish: function(lineStateId)
    {
      var lineState = this.model.lineStates.get(lineStateId);

      if (!lineState)
      {
        return;
      }

      var $lineState = this.findLineStateEl(lineState.id);

      if (!$lineState.length)
      {
        return;
      }

      lineState.finish(function(err)
      {
        if (!err)
        {
          return;
        }

        viewport.msg.show({
          type: 'error',
          time: 5000,
          text: t.has('isa', 'finish:' + err.message)
            ? t('isa', 'finish:' + err.message)
            : t('isa', 'finish:failure')
        });
      });
    },

    recount: function()
    {
      this.$('.btn').each(function(i)
      {
        var no = i + 1;

        if (no % 2 === 1)
        {
          no += 1;
        }

        var hotkey = no / 2;

        this.children[1].textContent = hotkey > 9 ? '' : hotkey;
      });

      this.trigger('recount', this.el.childElementCount - 1);
    },

    move: function(lineState, done)
    {
      var $lineState = this.findLineStateEl(lineState.id);

      if (!$lineState.length)
      {
        return done();
      }

      var position = $lineState.position();

      $lineState.css({
        top: position.top + 'px',
        left: position.left + 'px',
        width: $lineState.outerWidth() + 'px',
        height: $lineState.outerHeight() + 'px'
      });
      $lineState.addClass('is-moving');

      var view = this;

      setTimeout(function()
      {
        $lineState.remove();
        done();
        view.recount();
      }, 750);
    },

    insert: function(lineState, done)
    {
      if (lineState.get('status') === this.requiredStatus
        && (this.options.mode !== 'responses' || lineState.matchResponder(this.model.selectedResponder)))
      {
        var $lineState = $(this.renderLineState(lineState));

        if (this.options.mode === 'requests' && lineState.get('requestType') === 'delivery')
        {
          var $lastDelivery = this.$('.isa-lineState[data-request-type="delivery"]').last();

          if ($lastDelivery.length)
          {
            $lineState.insertAfter($lastDelivery);
          }
          else
          {
            var $first = this.$('.isa-lineState').first();

            if ($first.length)
            {
              $lineState.insertBefore($first);
            }
            else
            {
              this.$el.append($lineState);
            }
          }
        }
        else
        {
          this.$el.append($lineState);
        }

        $lineState
          .stop(true, false)
          .fadeIn(done);
        this.recount();
      }
      else if (done)
      {
        done();
      }
    },

    renderLineState: function(lineState)
    {
      return lineStateTemplate({
        hidden: true,
        mode: this.options.mode,
        lineState: lineState.serialize(),
        hotkey: ''
      });
    },

    findLineStateId: function(el)
    {
      return this.$(el).closest('.isa-lineState').attr('data-id');
    },

    findLineStateEl: function(lineStateId)
    {
      return this.$('.isa-lineState[data-id="' + lineStateId + '"]');
    },

    onAdd: function(lineState)
    {
      this.onChange(lineState);
    },

    onRemove: function(lineState)
    {
      var view = this;

      if (view.cancelling === lineState.id)
      {
        viewport.closeDialog();
      }

      var $lineState = view.findLineStateEl(lineState.id);

      if ($lineState.length)
      {
        $lineState
          .stop(true, false)
          .fadeOut(function()
          {
            $lineState.remove();
            view.recount();
          });
      }
    },

    onChange: function(lineState)
    {
      if (lineState === this.model.lineStates)
      {
        return;
      }

      var $lineState = this.findLineStateEl(lineState.id);

      if ($lineState.length)
      {
        if (lineState.get('status') === this.requiredStatus)
        {
          $lineState.stop(true, true);

          $lineState = this.findLineStateEl(lineState.id);

          if ($lineState.length)
          {
            $lineState.fadeIn();
          }
          else
          {
            this.insert(lineState);
          }
        }
        else if (!this.model.moving[lineState.id])
        {
          this.onRemove(lineState);
        }

        return;
      }

      if (lineState.get('status') === this.requiredStatus && !this.model.moving[lineState.id])
      {
        this.insert(lineState);
      }
    }

  });
});
