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
  requestTemplate,
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
      this.requiredStatus = this.options.mode === 'requests' ? 'new' : 'accepted';
      this.cancelling = null;

      var requests = this.model.requests;

      this.listenTo(requests, 'reset', this.render);
      this.listenTo(requests, 'filter', this.render);
      this.listenTo(requests, 'add', this.onAdd);
      this.listenTo(requests, 'remove', this.onRemove);
      this.listenTo(requests, 'change', this.onChange);
    },

    serialize: function()
    {
      var selectedResponder = this.options.mode === 'responses' && this.model.selectedResponder
        ? this.model.selectedResponder
        : null;

      return {
        idPrefix: this.idPrefix,
        mode: this.options.mode,
        requests: this.model.requests
          .where({status: this.requiredStatus})
          .filter(function(request) { return request.matchResponder(selectedResponder); })
          .map(function(request) { return request.serialize(); }),
        renderRequest: requestTemplate
      };
    },

    afterRender: function()
    {
      this.recount();
    },

    updateTimes: function()
    {
      var requests = this.model.requests;

      this.$('.isa-lineState').each(function()
      {
        var request = requests.get(this.dataset.id);
        var time = request.get('time');
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

    cancel: function(requestId)
    {
      var view = this;
      var request = view.model.requests.get(requestId);

      if (!request)
      {
        return;
      }

      var $request = view.findRequestEl(request.id);

      if (!$request.length)
      {
        return;
      }

      var $actions = $request.find('.btn').prop('disabled', true);
      var dialogView = new DialogView({
        template: cancelDialogTemplate
      });

      view.listenToOnce(dialogView, 'dialog:hidden', function()
      {
        $actions.prop('disabled', false);
        view.cancelling = null;
      });

      view.listenToOnce(dialogView, 'answered', function(answer)
      {
        if (answer !== 'yes')
        {
          return;
        }

        view.model.requests.cancel(request.id, null, function(err)
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

      this.cancelling = requestId;
    },

    accept: function(requestId)
    {
      var view = this;
      var request = view.model.requests.get(requestId);

      if (!request)
      {
        return;
      }

      var $request = view.findRequestEl(request.id);

      if (!$request.length)
      {
        return;
      }

      var responderPickerView = new IsaResponderPickerView({
        model: view.model.shiftPersonnel
      });

      view.listenToOnce(responderPickerView, 'picked', function(user)
      {
        responderPickerView.hide();

        if (!user)
        {
          return;
        }

        view.model.requests.accept(request.id, user, function(err)
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

      responderPickerView.show($request.find('.isa-lineState-actions'));
    },

    finish: function(requestId)
    {
      var view = this;
      var request = view.model.requests.get(requestId);

      if (!request)
      {
        return;
      }

      var $request = view.findRequestEl(request.id);

      if (!$request.length)
      {
        return;
      }

      view.model.requests.finish(request.id, function(err)
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

    move: function(request, done)
    {
      var $request = this.findRequestEl(request.id);

      if (!$request.length)
      {
        return done();
      }

      var position = $request.position();

      $request.css({
        top: position.top + 'px',
        left: position.left + 'px',
        width: $request.outerWidth() + 'px',
        height: $request.outerHeight() + 'px'
      });
      $request.addClass('is-moving');

      var view = this;

      setTimeout(function()
      {
        $request.remove();
        done();
        view.recount();
      }, 750);
    },

    insert: function(request, done)
    {
      if (request.get('status') === this.requiredStatus
        && (this.options.mode !== 'responses' || request.matchResponder(this.model.selectedResponder)))
      {
        var $request = $(this.renderLineState(request));

        if (this.options.mode === 'requests' && request.get('type') === 'delivery')
        {
          var $lastDelivery = this.$('.isa-lineState[data-request-type="delivery"]').last();

          if ($lastDelivery.length)
          {
            $request.insertAfter($lastDelivery);
          }
          else
          {
            var $first = this.$('.isa-lineState').first();

            if ($first.length)
            {
              $request.insertBefore($first);
            }
            else
            {
              this.$el.append($request);
            }
          }
        }
        else
        {
          this.$el.append($request);
        }

        $request
          .stop(true, false)
          .fadeIn(done);
        this.recount();
      }
      else if (done)
      {
        done();
      }
    },

    renderLineState: function(request)
    {
      return requestTemplate({
        hidden: true,
        mode: this.options.mode,
        request: request.serialize(),
        hotkey: ''
      });
    },

    findLineStateId: function(el)
    {
      return this.$(el).closest('.isa-lineState').attr('data-id');
    },

    findRequestEl: function(lineStateId)
    {
      return this.$('.isa-lineState[data-id="' + lineStateId + '"]');
    },

    onAdd: function(request)
    {
      this.onChange(request);
    },

    onRemove: function(request)
    {
      var view = this;

      if (view.cancelling === request.id)
      {
        viewport.closeDialog();
      }

      var $request = view.findRequestEl(request.id);

      if ($request.length)
      {
        $request
          .stop(true, false)
          .fadeOut(function()
          {
            $request.remove();
            view.recount();
          });
      }
    },

    onChange: function(request)
    {
      if (request === this.model.requests)
      {
        return;
      }

      var $request = this.findRequestEl(request.id);

      if ($request.length)
      {
        if (request.get('status') === this.requiredStatus)
        {
          $request.stop(true, true);

          $request = this.findRequestEl(request.id);

          if ($request.length)
          {
            $request.fadeIn();
          }
          else
          {
            this.insert(request);
          }
        }
        else if (!this.model.moving[request.id])
        {
          this.onRemove(request);
        }

        return;
      }

      if (request.get('status') === this.requiredStatus && !this.model.moving[request.id])
      {
        this.insert(request);
      }
    }

  });
});
