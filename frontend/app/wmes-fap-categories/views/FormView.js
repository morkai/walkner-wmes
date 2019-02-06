// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/data/orgUnits',
  'app/data/prodFunctions',
  'app/core/util/idAndLabel',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/wmes-fap-categories/templates/form'
], function(
  _,
  time,
  orgUnits,
  prodFunctions,
  idAndLabel,
  FormView,
  setUpUserSelect2,
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

      'input #-tester-mrp, #-tester-orderNo, #-tester-nc12': 'testNotifications',
      'change #-tester-date': 'testNotifications',
      'change input[name^="notifications"]': 'testNotifications',
      'change #-etoCategoryToggle': 'toggleEtoCategory'

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
      var view = this;

      FormView.prototype.afterRender.apply(view, arguments);

      setUpUserSelect2(view.$id('users'), {
        view: view,
        multiple: true
      });

      view.$notification = view.$id('notifications').children().first().detach();
      view.$notifiedUser = view.$id('tester').children().first().detach();

      (view.model.get('notifications') || []).forEach(view.addNotification, view);

      view.addNotification({
        subdivisions: [],
        prodFunctions: []
      });

      view.$id('etoCategory').select2({
        allowClear: true,
        placeholder: ' ',
        data: this.categories
          .filter(function(c) { return c.id !== view.model.id; })
          .map(idAndLabel)
      });

      this.toggleEtoCategory();
    },

    toggleEtoCategory: function()
    {
      this.$id('etoCategory').select2('enable', this.$id('etoCategoryToggle').prop('checked'));
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

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.users = (formData.users || []).map(function(user) { return user.id; }).join(',');

      formData.etoCategoryToggle = formData.etoCategory != null;

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.users = (this.$id('users').select2('data') || []).map(function(user)
      {
        return {
          id: user.id,
          label: user.text
        };
      });

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

      if (formData.etoCategoryToggle)
      {
        if (!formData.etoCategory)
        {
          formData.etoCategory = '';
        }
      }
      else
      {
        formData.etoCategory = null;
      }

      delete formData.etoCategoryToggle;

      return formData;
    },

    testNotifications: function()
    {
      var view = this;

      if (view.testReq)
      {
        view.testReq.abort();
      }

      var mrp = view.$id('tester-mrp').val();
      var orderNo = view.$id('tester-orderNo').val();
      var nc12 = view.$id('tester-nc12').val();
      var date = view.$id('tester-date').val();
      var formData = view.getFormData();

      if (mrp.length < 3 && orderNo.length < 9)
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
          orderNo: orderNo,
          nc12: nc12,
          date: date,
          users: formData.users,
          notifications: formData.notifications,
          category: null
        })
      });

      view.testReq.fail(function()
      {
        view.$id('tester').empty();
      });

      view.testReq.done(function(res)
      {
        var html = '';

        res.users.forEach(function(user)
        {
          var prodFunction = prodFunctions.get(user.prodFunction);

          html += '<tr>'
            + '<td class="is-min">' + _.escape(user.lastName) + ' ' + _.escape(user.firstName) + '</td>'
            + '<td class="is-min">' + _.escape(prodFunction ? prodFunction.getLabel() : user.prodFunction) + '</td>'
            + '<td class="is-min">' + _.escape(user.kdPosition) + '</td>'
            + '<td class="is-min">' + view.t('core', 'BOOL:' + user.sms) + '</td>'
            + '<td></td>';
        });

        view.$id('tester').html(html);
      });

      view.testReq.always(function()
      {
        view.testReq = null;
      });
    }

  });
});
