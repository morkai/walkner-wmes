// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/data/orgUnits',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/qiResults/dictionaries',
  '../QiResult',
  'app/qiResults/templates/form',
  'app/qiResults/templates/correctiveActionFormRow',
], function(
  _,
  $,
  t,
  time,
  user,
  orgUnits,
  buttonGroup,
  idAndLabel,
  FormView,
  setUpUserSelect2,
  qiDictionaries,
  QiResult,
  formTemplate,
  correctiveActionFormRowTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    events: _.extend({

      'input #-orderNo': function()
      {
        this.clearOrderFields();
        this.scheduleFindOrder();
      },
      'change #-faultCode': function()
      {
        var fault = qiDictionaries.faults.get(this.$id('faultCode').val());

        this.$id('faultDescription').val(fault.get('description') || fault.get('name'));
      },
      'change #-kind': 'updateDivision',
      'click #-addAction': 'addEmptyAction',
      'click [name="removeAction"]': function(e)
      {
        var view = this;
        var $tr = view.$(e.target).closest('tr');

        $tr.fadeOut('fast', function()
        {
          $tr.remove();
          view.recountActions();
        });
      },
      'change [name="removeFile[]"]': function(e)
      {
        this.$('input[name="' + e.target.value + 'File"]').prop('disabled', e.target.checked);
      },
      'change [name="ok"]': function()
      {
        this.model.set(_.extend(this.getFormData(), {
          ok: this.$id('ok').prop('checked')
        }), {silent: true});
        this.render();
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.scheduleFindOrder = _.debounce(this.findOrder.bind(this), 250);
      this.findOrderReq = null;
      this.statuses = null;
      this.actions = 0;
    },

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {
        inspectedAtMin: '2014-01-01',
        inspectedAtMax: time.getMoment().startOf('day').add(1, 'days').format('YYYY-MM-DD'),
        kinds: qiDictionaries.kinds.map(idAndLabel),
        faults: qiDictionaries.faults.map(function(fault)
        {
          return {
            id: fault.id,
            text: fault.id + ': ' + fault.get('name')
          };
        }),
        errorCategories: qiDictionaries.errorCategories.map(idAndLabel),
        inspectors: this.serializeInspectors(),
        divisions: orgUnits.getAllByType('division')
      });
    },

    serializeInspectors: function()
    {
      var map = {};
      var list = [];

      qiDictionaries.inspectors.forEach(function(user)
      {
        var inspector = idAndLabel(user);

        map[inspector.id] = true;

        list.push(inspector);
      });

      var inspector = this.model.get('inspector');

      if (this.options.editMode && !map[inspector.id])
      {
        list.unshift({
          id: inspector.id,
          text: inspector.text
        });
      }

      return list;
    },

    checkValidity: function()
    {
      return true;
    },

    submitRequest: function($submitEl, formData)
    {
      var view = this;
      var uploadFormData = new FormData();
      var files = 0;

      this.$('input[type="file"]').each(function()
      {
        if (!this.disabled && this.files.length)
        {
          uploadFormData.append(this.name, this.files[0]);

          ++files;
        }
      });

      formData.attachments = {};

      _.forEach(formData.removeFile, function(file)
      {
        formData.attachments[file + 'File'] = null;
      });

      if (files === 0)
      {
        return FormView.prototype.submitRequest.call(view, $submitEl, formData);
      }

      var $spinner = this.$el.find('.fa-spinner').removeClass('hidden');

      var uploadReq = this.ajax({
        type: 'POST',
        url: '/qi/results;upload',
        data: uploadFormData,
        processData: false,
        contentType: false
      });

      uploadReq.done(function(attachments)
      {
        _.extend(formData.attachments, attachments);

        FormView.prototype.submitRequest.call(view, $submitEl, formData);
      });

      uploadReq.fail(function()
      {
        view.showErrorMessage(t('qiResults', 'FORM:ERROR:upload'));

        $submitEl.attr('disabled', false);
      });

      uploadReq.always(function()
      {
        $spinner.addClass('hidden');
      });
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.inspector = formData.inspector ? formData.inspector.id : '';
      formData.inspectedAt = time.format(formData.inspectedAt, 'YYYY-MM-DD');

      _.forEach(formData.correctiveActions, function(correctiveAction)
      {
        var when = time.getMoment(correctiveAction.when);

        correctiveAction.when = when.isValid() ? when.format('YYYY-MM-DD') : '';
      });

      if (!this.options.editMode)
      {
        var fault = qiDictionaries.faults.at(0);

        formData.faultDescription = fault ? (fault.get('description') || fault.get('name')) : '';
      }

      formData.okFile = '';
      formData.nokFile = '';

      return formData;
    },

    serializeForm: function(formData)
    {
      var inspectorOptionEl = this.$id('inspector')[0].selectedOptions[0];

      if (this.options.editMode)
      {
        formData.updater = user.getInfo();
      }

      formData.inspector = {
        id: inspectorOptionEl.value,
        label: inspectorOptionEl.label.trim()
      };

      this.$('textarea').each(function()
      {
        if (!formData[this.name])
        {
          formData[this.name] = '';
        }
      });

      var $actions = this.$id('actions').children();

      formData.correctiveActions = _.map(formData.correctiveActions, function(action, i)
      {
        var when = time.getMoment(action.when);

        return {
          what: action.what || '',
          when: when.isValid() ? when.toDate() : null,
          who: _.map($actions.eq(i).find('input[name$="who"]').select2('data'), function(user)
          {
            return {
              id: user.id,
              label: user.text
            };
          }),
          status: action.status
        };
      }).filter(function(action)
      {
        return action.what.length > 0;
      });

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      var correctiveActions = this.model.get('correctiveActions');

      if (_.isEmpty(correctiveActions))
      {
        this.addEmptyAction();
      }
      else
      {
        _.forEach(this.model.get('correctiveActions'), this.addAction, this);
      }

      buttonGroup.toggle(this.$id('result'));
      this.findOrder();
      this.toggleRoleFields();
    },

    toggleRoleFields: function()
    {
      var manager = user.isAllowedTo('QI:RESULTS:MANAGE');
      var inspector = user.isAllowedTo('QI:INSPECTOR');
      var specialist = user.isAllowedTo('QI:SPECIALIST');

      this.$('[data-role]').each(function()
      {
        var enabled;
        var role = this.dataset.role;

        if (manager || !role)
        {
          enabled = true;
        }
        else
        {
          enabled = (inspector && role.indexOf('inspector') !== -1)
            || (specialist && role.indexOf('specialist') !== -1);
        }

        this.disabled = !enabled;
      });
    },

    clearOrderFields: function()
    {
      this.$id('nc12').val('');
      this.$id('productName').val('');
      this.$id('productFamily').val('');
      this.$id('division').val('');
      this.$id('qtyOrder').val('');
    },

    findOrder: function()
    {
      var view = this;

      if (view.findOrderReq)
      {
        view.findOrderReq.abort();
        view.findOrderReq = null;
      }

      var $orderNo = view.$id('orderNo');

      $orderNo[0].setCustomValidity(t('qiResults', 'FORM:ERROR:orderNo'));

      var orderNo = view.$id('orderNo').val().replace(/[^0-9]+/g, '');

      if (orderNo.length !== 9)
      {
        return;
      }

      var req = view.ajax({
        method: 'GET',
        url: '/qi/results;order',
        data: {
          no: orderNo
        }
      });

      req.always(function()
      {
        view.findOrderReq = null;
      });

      req.done(function(data)
      {
        view.$id('nc12').val(data.nc12);
        view.$id('productName').val(data.productName);
        view.$id('productFamily').val(data.productFamily);
        view.$id('division').val(data.division).attr('data-orders-division', data.division);
        view.$id('qtyOrder').val(data.quantity);

        $orderNo[0].setCustomValidity('');

        view.updateDivision();
      });

      view.findOrderReq = req;
    },

    addEmptyAction: function()
    {
      this.addAction({
        status: '',
        when: '',
        who: [],
        what: ''
      });
    },

    addAction: function(action)
    {
      if (!this.statuses)
      {
        this.statuses = qiDictionaries.actionStatuses.map(idAndLabel);
      }

      var $actions = this.$id('actions');

      action.i = this.actions++;
      action.no = $actions.children().length + 1;

      $actions.append(correctiveActionFormRowTemplate({
        statuses: this.statuses,
        action: action
      }));

      var $who = setUpUserSelect2($actions.children().last().find('[name$="who"]'), {
        width: '300px',
        allowClear: true,
        multiple: true,
        textFormatter: function(user, name) { return name; }
      });

      $who.select2('data', action.who.map(function(user)
      {
        return {
          id: user.id,
          text: user.label
        };
      }));
    },

    recountActions: function()
    {
      this.$id('actions').children().each(function(i)
      {
        this.firstElementChild.textContent = i + 1;
      });
    },

    updateDivision: function()
    {
      var kind = qiDictionaries.kinds.get(this.$id('kind').val());

      if (!kind)
      {
        return;
      }

      var $division = this.$id('division');
      var ordersDivision = $division.attr('data-orders-division');
      var kindsDivision = kind.get('division');

      $division.val(kindsDivision || ordersDivision);
    }

  });
});
