// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/data/orgUnits',
  'app/data/prodFunctions',
  'app/core/util/idAndLabel',
  'app/core/views/FormView',
  'app/delayReasons/templates/form'
], function(
  _,
  time,
  orgUnits,
  prodFunctions,
  idAndLabel,
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    events: _.assign({

      'click #-addNotification': function()
      {
        this.addNotification({
          subdivisions: [],
          prodFunctions: []
        });

        this.$id('notifications').children().last().find('input').first().focus();
      },

      'click [data-action="removeNotification"]': function(e)
      {
        var $notification = this.$(e.target).closest('tr');

        $notification.find('input').select2('destroy');
        $notification.remove();
      },

      'input #-notifiedUsers-mrp': 'testNotifications',
      'change #-notifiedUsers-date': 'testNotifications',
      'change input[name^="notifications"]': 'testNotifications'

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.i = 0;

      this.subdivisions = orgUnits.getAllByType('division').map(function(division)
      {
        var divisionText = division.getLabel();

        return {
          text: divisionText,
          children: orgUnits.getChildren(division).map(function(subdivision)
          {
            return {
              id: subdivision.id,
              text: subdivision.getLabel(),
              divisionText: divisionText
            };
          })
        };
      });

      this.prodFunctions = prodFunctions.map(idAndLabel);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.$notification = this.$id('notifications').children().first().detach();
      this.$notifiedUser = this.$id('notifiedUsers').children().first().detach();

      (this.model.get('notifications') || []).forEach(this.addNotification, this);

      this.addNotification({
        subdivisions: [],
        prodFunctions: []
      });
    },

    addNotification: function(notification)
    {
      var $notification = this.$notification.clone();
      var i = ++this.i;

      $notification.find('input[name$="subdivisions"]')
        .prop('name', 'notifications[' + i + '].subdivisions')
        .val(notification.subdivisions.join(','))
        .select2({
          width: '500px',
          placeholder: ' ',
          allowClear: true,
          multiple: true,
          data: this.subdivisions,
          formatSelection: function(item, container, e)
          {
            return e(item.divisionText + ' \\ ' + item.text);
          }
        });

      $notification.find('input[name$="prodFunctions"]')
        .prop('name', 'notifications[' + i + '].prodFunctions')
        .val(notification.prodFunctions.join(','))
        .select2({
          width: '500px',
          placeholder: ' ',
          allowClear: true,
          multiple: true,
          data: this.prodFunctions
        });

      this.$id('notifications').append($notification);
    },

    serializeForm: function(formData)
    {
      formData.notifications = (formData.notifications || [])
        .map(function(n)
        {
          return {
            subdivisions: (n.subdivisions || '').split(',').filter(function(d) { return !!d.length; }),
            prodFunctions: (n.prodFunctions || '').split(',').filter(function(d) { return !!d.length; })
          };
        })
        .filter(function(n)
        {
          return !!n.prodFunctions.length;
        });

      return formData;
    },

    testNotifications: function()
    {
      var view = this;

      if (view.testReq)
      {
        view.testReq.abort();
      }

      var mrp = view.$id('notifiedUsers-mrp').val();
      var date = view.$id('notifiedUsers-date').val();
      var notifications = view.getFormData().notifications;

      if (mrp.length < 3 || !notifications.length)
      {
        return;
      }

      var moment = time.getMoment(date, 'YYYY-MM-DD[T]HH:mm');

      if (moment.isValid())
      {
        date = moment.valueOf();
      }

      view.testReq = view.ajax({
        method: 'POST',
        url: '/fap/entries;resolve-participants',
        data: JSON.stringify({
          mrp: mrp,
          date: date,
          notifications: notifications,
          category: null
        })
      });

      view.testReq.fail(function()
      {
        view.$id('notifiedUsers').empty();
      });

      view.testReq.done(function(res)
      {
        var html = '';

        res.collection.forEach(function(user)
        {
          var prodFunction = prodFunctions.get(user.prodFunction);

          html += '<tr>'
            + '<td class="is-min">' + _.escape(user.lastName) + ' ' + _.escape(user.firstName) + '</td>'
            + '<td class="is-min">' + _.escape(prodFunction ? prodFunction.getLabel() : user.prodFunction) + '</td>'
            + '<td class="is-min">' + _.escape(user.kdPosition) + '</td>'
            + '<td class="is-min">' + view.t('core', 'BOOL:' + user.sms) + '</td>'
            + '<td></td>';
        });

        view.$id('notifiedUsers').html(html);
      });

      view.testReq.always(function()
      {
        view.testReq = null;
      });
    }

  });
});
