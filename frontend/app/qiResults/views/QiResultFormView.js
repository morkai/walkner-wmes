// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/data/orgUnits',
  'app/data/localStorage',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/util/getInputLabel',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  'app/suggestions/Suggestion',
  'app/suggestions/views/SuggestionFormView',
  'app/qiResults/dictionaries',
  '../QiResult',
  'app/qiResults/templates/form',
  'app/qiResults/templates/correctiveActionFormRow'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  orgUnits,
  localStorage,
  buttonGroup,
  idAndLabel,
  getInputLabel,
  FormView,
  setUpUserSelect2,
  kzDictionaries,
  Suggestion,
  SuggestionFormView,
  qiDictionaries,
  QiResult,
  formTemplate,
  correctiveActionFormRowTemplate
) {
  'use strict';

  var IS_ANDROID = /Android/i.test(window.navigator.userAgent);

  return FormView.extend({

    template: formTemplate,

    events: _.assign({

      'change #-source': function()
      {
        localStorage.setItem('WMES_QI_SOURCE', this.getSource());

        this.setUpLeaderSelect2();
        this.toggleSourceFields();
        this.toggleRequireOrder();
        this.toggleRequireInspector();
        this.clearOrderFields();
        this.clearComponentFields();
      },
      'input #-orderNo': function()
      {
        this.clearOrderFields();
        this.scheduleFindOrder();
      },
      'input #-nc12': function()
      {
        this.clearComponentFields();
        this.scheduleFindComponent();
      },
      'change #-faultCode': function()
      {
        var code = this.$id('faultCode').val();
        var fault = qiDictionaries.faults.get(code);
        var name = fault ? fault.get('name').trim() : code;
        var description = fault ? fault.get('description').trim() : '';

        this.$id('faultDescription').val(name + (description ? (':\n' + description) : ''));
      },
      'change #-kind': function()
      {
        this.updateDivision();
        this.toggleRequireOrder();
      },
      'change #-inspector': function()
      {
        this.toggleRequireInspector();
      },
      'change #-leader': function()
      {
        this.toggleRequireInspector();
      },
      'click #-addStdAction': 'addStdAction',
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
        this.model.set(_.assign(this.getFormData(), {
          ok: this.$id('ok').prop('checked')
        }), {silent: true});
        this.render();
      },
      'change #-serialNumbers': function(e)
      {
        e.target.value = this.parseSerialNumbers(e.target.value).join(', ');
      },
      'input .qiResults-form-rootCause': function(e)
      {
        var $group = this.$(e.currentTarget).closest('.form-group');
        var groupI = $group[0].dataset.i;
        var $inputs = $group.find('.qiResults-form-rootCause');

        if ($inputs.length > 2)
        {
          var remaining = $inputs.length;

          $inputs.each(function()
          {
            if (this === e.target || remaining === 2)
            {
              return;
            }

            if (this.value.trim() === '')
            {
              remaining -= 1;

              $(this).remove();
            }
          });
        }

        var $last = $group.find('.qiResults-form-rootCause').last();

        if ($last.val().trim() !== '')
        {
          $last
            .clone()
            .attr('name', 'rootCause[' + groupI + '][' + Date.now() + ']')
            .val('')
            .insertAfter($last);
        }

        if (groupI === '0')
        {
          $group.find('.qiResults-form-rootCause').each(function(i)
          {
            this.required = i < 2;
          });
        }
      },
      'click #-rootCauses label': function(e)
      {
        this.$(e.currentTarget)
          .closest('.form-group')
          .find('.qiResults-form-rootCause')
          .first()
          .focus();
      },
      'click #-addRootCause': function()
      {
        var view = this;
        var $rootCauses = view.$id('rootCauses');
        var $rootCause = $rootCauses.find('.form-group').last().clone();
        var groupI = Date.now().toString();

        $rootCause.attr('data-i', groupI).find('input').each(function(i)
        {
          if (i > 1)
          {
            $(this).remove();
          }
          else
          {
            this.value = '';
            this.name = 'rootCause[' + groupI + '][' + i + ']';
          }
        });

        $rootCauses.append($rootCause);

        var $groups = $rootCauses.find('.form-group');

        $rootCauses.find('.form-group').each(function(i)
        {
          $(this).find('label')
            .toggleClass('is-required', i === 0)
            .find('span')
            .text(view.t('FORM:rootCause:label', {n: i + 1, total: $groups.length}));

          if (i > 0)
          {
            $(this).find('input').prop('required', false);
          }
        });
      },

      'click .qiResults-form-removeRootCause': function(e)
      {
        var view = this;

        view.$(e.currentTarget).closest('.form-group').fadeOut('fast', function()
        {
          $(this).remove();

          var $labels = view.$id('rootCauses').find('label');

          $labels.each(function(i)
          {
            $(this)
              .find('span')
              .text(view.t('FORM:rootCause:label', {n: i + 1, total: $labels.length}));
          });
        });
      },

      'input textarea[name$=".what"]': function(e)
      {
        this.resizeTextArea(e.target);
      },

      'keydown #-kzActionRid': function(e)
      {
        if (e.key === 'Enter')
        {
          this.$id('linkKzAction').click();

          return false;
        }
      },
      'input #-kzActionRid': function()
      {
        this.$id('kzActionRid')[0].setCustomValidity('');
      },
      'click #-linkKzAction': 'linkKzAction',
      'click #-addKzAction': 'addKzAction'

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.scheduleFindOrder = _.debounce(this.findOrder.bind(this), 250);
      this.scheduleFindComponent = _.debounce(this.findComponent.bind(this), 250);
      this.findOrderCount = 0;
      this.findOrderReq = null;
      this.statuses = null;
      this.actions = 0;

      this.listenToOnce(this, 'beforeRender', function()
      {
        if (this.model.get('errorCategory'))
        {
          return;
        }

        var defaultErrorCategory = qiDictionaries.settings.getValue('defaultErrorCategory');
        var errorCategory = qiDictionaries.errorCategories.get(defaultErrorCategory);

        if (errorCategory)
        {
          this.model.set({errorCategory: errorCategory.id}, {silent: true});
        }
      });
    },

    destroy: function()
    {
      FormView.prototype.destroy.apply(this, arguments);

      if (kzDictionaries.loaded)
      {
        kzDictionaries.unload();
      }
    },

    serializeModel: function()
    {
      var model = this.model.toJSON();

      if (!Array.isArray(model.rootCause))
      {
        model.rootCause = [];
      }

      if (!model.rootCause.length)
      {
        model.rootCause.push([]);
      }

      return model;
    },

    getTemplateData: function()
    {
      var faultCode = this.model.get('faultCode');

      return {
        inspectedAtMin: time.getMoment(this.model.get('inspectedAt')).clone().subtract(14, 'days').format('YYYY-MM-DD'),
        inspectedAtMax: time.getMoment().startOf('day').add(1, 'days').format('YYYY-MM-DD'),
        kinds: qiDictionaries.kinds.map(idAndLabel),
        faults: qiDictionaries.faults
          .filter(function(fault)
          {
            return fault.id === faultCode || (fault.get('active') !== false);
          })
          .map(function(fault)
          {
            return {
              id: fault.id,
              text: fault.id + ': ' + fault.get('name')
            };
          }),
        errorCategories: qiDictionaries.errorCategories.map(idAndLabel),
        inspectors: this.serializeInspectors(),
        masters: this.serializeLeaders('masters', 'nokOwner'),
        divisions: orgUnits.getAllByType('division'),
        isAndroid: IS_ANDROID,
        canEditAttachments: this.model.canEditAttachments(this.options.editMode),
        canEditActions: this.model.canEditActions(this.options.editMode),
        canAddActions: this.model.canAddActions(this.options.editMode)
      };
    },

    serializeInspectors: function()
    {
      var map = {};
      var list = [];

      qiDictionaries.inspectors.forEach(function(user)
      {
        if (!user.get('active'))
        {
          return;
        }

        var inspector = idAndLabel(user);

        map[inspector.id] = true;

        list.push(inspector);
      });

      var inspector = this.model.get('inspector');

      if (inspector && !map[inspector.id])
      {
        list.unshift({
          id: inspector.id,
          text: inspector.label
        });
      }

      return list.sort(function(a, b)
      {
        return a.text.localeCompare(b.text);
      });
    },

    serializeLeaders: function(dictionaryProperty, userProperty)
    {
      var map = {};
      var list = [];

      qiDictionaries[dictionaryProperty].forEach(function(user)
      {
        if (!user.get('active'))
        {
          return;
        }

        var item = idAndLabel(user);

        map[item.id] = true;

        list.push(item);
      });

      var user = this.model.get(userProperty);

      if (user && !map[user.id])
      {
        list.unshift({
          id: user.id,
          text: user.label
        });
      }

      return list.sort(function(a, b)
      {
        return a.text.localeCompare(b.text);
      });
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
        _.assign(formData.attachments, attachments);

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
      formData.nokOwner = formData.nokOwner ? formData.nokOwner.id : '';
      formData.leader = formData.leader ? formData.leader.id : '';
      formData.coach = formData.coach ? formData.coach.id : '';
      formData.operator = formData.operator ? formData.operator.id : '';
      formData.inspectedAt = time.format(formData.inspectedAt, 'YYYY-MM-DD');
      formData.serialNumbers = formData.serialNumbers ? formData.serialNumbers.join(', ') : '';

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

      if (formData.source === 'wh')
      {
        formData.orderNo = '';
        formData.productFamily = '';
        formData.location = formData.line;
        formData.line = null;
      }
      else if (formData.orderNo === '000000000')
      {
        formData.orderNo = '';
        formData.nc12 = '';
        formData.productFamily = '';
        formData.productName = '';
      }

      return formData;
    },

    serializeForm: function(formData)
    {
      var view = this;

      formData = _.assign(this.model.toJSON(), formData);

      if (!formData.standard)
      {
        formData.standard = null;
      }

      formData.coach = setUpUserSelect2.getUserInfo(view.$id('coach'));
      formData.operator = setUpUserSelect2.getUserInfo(view.$id('operator'));

      ['inspector', 'nokOwner', 'leader'].forEach(function(prop)
      {
        var optionEl = (view.$id(prop)[0] || {selectedOptions: []}).selectedOptions[0];

        if (optionEl && optionEl.value)
        {
          formData[prop] = {
            id: optionEl.value,
            label: optionEl.label.trim()
          };
        }
        else if (optionEl)
        {
          formData[prop] = null;
        }
      });

      if (!formData.line)
      {
        formData.line = null;
      }

      if (view.options.editMode)
      {
        formData.updater = user.getInfo();
      }

      view.$('textarea').each(function()
      {
        if (!formData[this.name])
        {
          formData[this.name] = '';
        }
      });

      formData.serialNumbers = this.parseSerialNumbers(formData.serialNumbers);
      formData.correctiveActions = [];

      view.$id('actions').children().each(function()
      {
        var when = time.getMoment(this.querySelector('[name$="when"]').value);
        var what = this.querySelector('[name$="what"]').value.trim();

        if (what === '')
        {
          return;
        }

        var kind = this.querySelector('[name$="kind"]').value;
        var rid = +this.querySelector('[name$="rid"]').value;

        if (kind !== 'std' && rid === 0)
        {
          return;
        }

        formData.correctiveActions.push({
          kind: kind,
          rid: rid,
          what: what,
          when: when.isValid() ? when.toDate() : null,
          who: setUpUserSelect2.getUserInfo($(this.querySelector('[name$="who"]'))),
          status: this.querySelector('[name$="status"]').value
        });
      });

      if (formData.source === 'wh')
      {
        formData.orderNo = '000000000';
        formData.productFamily = '000000';
        formData.line = formData.location || null;
      }
      else if (!formData.orderNo && !qiDictionaries.kinds.get(formData.kind).get('order'))
      {
        formData.orderNo = '000000000';
        formData.nc12 = '000000000000';
        formData.productFamily = '000000';
        formData.productName = '0';
      }

      formData.mrp = view.$id('division').attr('data-orders-mrp') || '';

      formData.rootCause = (formData.rootCause || [])
        .map(function(rootCause)
        {
          return (rootCause || [])
            .map(function(why) { return why.trim(); })
            .filter(function(why) { return /[a-zA-Z]+/.test(why); });
        })
        .filter(function(rootCause) { return rootCause.length > 0; });

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      _.forEach(this.model.get('correctiveActions'), this.addAction, this);

      this.setUpInspectorSelect2();
      this.setUpMasterSelect2();
      this.setUpLeaderSelect2();
      this.setUpCoachSelect2();
      this.setUpOperatorSelect2();
      buttonGroup.toggle(this.$id('source'));
      buttonGroup.toggle(this.$id('result'));
      this.toggleRoleFields();
      this.toggleSourceFields();
      this.toggleRequireOrder();
      this.toggleRequireInspector();

      if (this.getSource() === 'wh')
      {
        this.findComponent();
      }
      else
      {
        this.findOrder();
      }
    },

    getSource: function()
    {
      return this.options.editMode ? this.model.get('source') : buttonGroup.getValue(this.$id('source'));
    },

    setUpInspectorSelect2: function()
    {
      if (IS_ANDROID)
      {
        return;
      }

      this.$id('inspector')
        .removeClass('form-control')
        .select2({
          placeholder: ' ',
          allowClear: true
        })
        .closest('.form-group')
        .addClass('has-required-select2');
    },

    setUpMasterSelect2: function()
    {
      if (IS_ANDROID)
      {
        return;
      }

      this.$id('nokOwner').removeClass('form-control').select2({
        placeholder: ' ',
        allowClear: true
      });
    },

    setUpLeaderSelect2: function()
    {
      var users = this.serializeLeaders(this.getSource() === 'prod' ? 'leaders' : 'whman', 'leader');
      var $leader = this.$id('leader');
      var selected = $leader.val();
      var options = '<option></option>';

      if (selected === null)
      {
        selected = this.model.get('leader');

        if (selected)
        {
          selected = selected.id;
        }
      }

      users.forEach(function(user)
      {
        options += '<option value="' + user.id + '" ' + (selected === user.id ? 'selected' : '') + '>'
          + _.escape(user.text);
      });

      $leader.html(options);

      if (IS_ANDROID)
      {
        return;
      }

      $leader.removeClass('form-control').select2({
        placeholder: ' ',
        allowClear: true
      });
    },

    setUpCoachSelect2: function()
    {
      var $coach = this.$id('coach');
      var coach = this.model.get('coach');

      setUpUserSelect2($coach, {noPersonnelId: true});

      if (coach)
      {
        $coach.select2('data', {
          id: coach.id,
          text: coach.label
        });
      }
    },

    setUpOperatorSelect2: function()
    {
      var $operator = this.$id('operator');
      var operator = this.model.get('operator');

      setUpUserSelect2($operator, {noPersonnelId: true});

      if (operator)
      {
        $operator.select2('data', {
          id: operator.id,
          text: operator.label
        });
      }
    },

    parseSerialNumbers: function(sns)
    {
      if (Array.isArray(sns))
      {
        return sns;
      }

      var orderNo = this.$id('orderNo').val();

      if (!/^[0-9]{9}$/.test(orderNo))
      {
        orderNo = '';
      }

      return (sns || '')
        .split(/(\s+|,|;)/)
        .filter(function(sn) { return /^[a-zA-Z0-9.]+$/.test(sn); })
        .map(function(sn)
        {
          if (/^[0-9]{1,4}$/.test(sn) && orderNo)
          {
            while (sn.length < 4)
            {
              sn = '0' + sn;
            }

            return 'PL04.' + orderNo + '.' + sn;
          }

          return sn.toUpperCase();
        });
    },

    toggleRoleFields: function()
    {
      var manager = user.isAllowedTo('QI:RESULTS:MANAGE');
      var specialist = user.isAllowedTo('QI:SPECIALIST');
      var nokOwner = this.model.isNokOwner();
      var leader = this.model.isLeader();
      var inspector = this.model.isInspector() || leader;

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
            || (specialist && role.indexOf('specialist') !== -1)
            || (nokOwner && role.indexOf('nokOwner') !== -1)
            || (leader && role.indexOf('leader') !== -1);
        }

        this.disabled = !enabled;

        if (!IS_ANDROID && (this.name === 'inspector' || this.name === 'nokOwner'))
        {
          $(this).select2('enable', !this.disabled);
        }
      });

      this.$id('source').find('.btn').toggleClass('disabled', this.options.editMode || (!manager && !inspector));
      this.$id('result').find('.btn').toggleClass('disabled', !manager && !inspector);
    },

    toggleSourceFields: function()
    {
      var source = this.getSource();

      this.$('[data-source]').each(function()
      {
        this.classList.toggle('hidden', this.dataset.source !== source);
      });

      if (source === 'wh')
      {
        var kind = qiDictionaries.kinds.find(function(kind) { return kind.get('division') === 'LD'; });

        if (kind)
        {
          this.$id('kind').val(kind.id).trigger('change');
        }
      }
    },

    clearOrderFields: function()
    {
      this.$id('nc12').val('')[0].setCustomValidity('');
      this.$id('productName').val('');
      this.$id('productFamily').val('');
      this.$id('division').val('');
      this.$id('qtyOrder').val('');

      this.model.set({
        nc12: '',
        productFamily: '',
        division: '',
        qtyOrder: ''
      }, {silent: true});

      this.updateLeaders([]);
      this.updateLines([]);
    },

    findOrder: function()
    {
      var view = this;
      var $orderNo = view.$id('orderNo');

      if (!$orderNo.length || $orderNo.prop('disabled'))
      {
        this.updateLines([]);
        this.updateLeaders([]);

        return;
      }

      view.findOrderCount += 1;

      if (view.findOrderReq)
      {
        view.findOrderReq.abort();
        view.findOrderReq = null;
      }

      $orderNo[0].setCustomValidity($orderNo[0].required ? view.t('FORM:ERROR:orderNo') : '');

      var orderNo = view.$id('orderNo').val().replace(/[^0-9]+/g, '').replace(/^0+/, '');

      if (orderNo.length !== 9)
      {
        return;
      }

      view.$id('submit').prop('disabled', true);

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

        $orderNo[0].setCustomValidity(view.t('FORM:ERROR:orderNo'));
      });

      req.done(function(data)
      {
        view.$id('nc12').val(data.nc12);
        view.$id('productName').val(data.productName);
        view.$id('productFamily').val(data.productFamily);
        view.$id('division').val(data.division)
          .attr('data-orders-division', data.division)
          .attr('data-orders-mrp', data.mrp);
        view.$id('qtyOrder').val(data.quantity);

        view.updateLines(data.lines);
        view.updateLeaders(data.leaders);
        view.updateDivision();

        $orderNo[0].setCustomValidity('');

        view.$id('submit').prop('disabled', false);
      });

      view.findOrderReq = req;
    },

    clearComponentFields: function()
    {
      this.$id('orderNo').val('')[0].setCustomValidity('');
      this.$id('productName').val('');
      this.$id('productFamily').val('');
      this.$id('division').val('');
      this.$id('qtyOrder').val('');

      this.model.set({
        orderNo: '',
        productFamily: '',
        division: '',
        qtyOrder: ''
      }, {silent: true});

      this.updateLeaders([]);
      this.updateLines([]);
    },

    findComponent: function()
    {
      var view = this;
      var $nc12 = view.$id('nc12');

      if ($nc12.prop('disabled'))
      {
        this.updateLines([]);
        this.updateLeaders([]);

        return;
      }

      view.findOrderCount += 1;

      if (view.findOrderReq)
      {
        view.findOrderReq.abort();
        view.findOrderReq = null;
      }

      $nc12[0].setCustomValidity($nc12[0].required ? view.t('FORM:ERROR:nc12') : '');

      var nc12 = view.$id('nc12').val().replace(/[^0-9]+/g, '').toUpperCase();

      if (nc12.length !== 12)
      {
        return;
      }

      var req = view.ajax({
        method: 'GET',
        url: '/qi/results;component',
        data: {
          nc12: nc12.replace(/^0+/, '')
        }
      });

      req.always(function()
      {
        view.findOrderReq = null;

        $nc12[0].setCustomValidity(view.t('FORM:ERROR:nc12'));
      });

      req.done(function(data)
      {
        view.$id('nc12').val(data.nc12);
        view.$id('productName').val(data.productName);
        view.$id('productFamily').val('');
        view.$id('division').val('LD')
          .attr('data-orders-division', '')
          .attr('data-orders-mrp', '');
        view.$id('qtyOrder').val('');

        $nc12[0].setCustomValidity('');
      });

      view.findOrderReq = req;
    },

    addStdAction: function()
    {
      this.addAction({
        kind: 'std',
        rid: 0,
        status: 'inProgress',
        when: '',
        who: [],
        what: ''
      });
    },

    addAction: function(action)
    {
      var view = this;

      if (!view.statuses)
      {
        view.statuses = qiDictionaries.actionStatuses.map(function(s)
        {
          return {
            id: s,
            text: view.t('actionStatus:' + s)
          };
        });
      }

      var $actions = view.$id('actions');

      action.i = view.actions++;
      action.no = $actions.children().length + 1;

      var std = action.kind === 'std';
      var canManage = user.isAllowedTo('QI:RESULTS:MANAGE', 'QI:SPECIALIST');
      var isNokOwner = view.model.isNokOwner();
      var isResultLeader = view.model.isLeader();
      var isShiftLeader = user.isAllowedTo('FN:master', 'FN:leader');
      var isCorrector = _.some(action.who, function(who) { return who.id === user.data._id; });

      var $action = view.renderPartial(correctiveActionFormRowTemplate, {
        statuses: view.statuses,
        action: action,
        canChangeStatus: std && canManage,
        canChangeWhen: canManage || isNokOwner || isResultLeader || isCorrector || isShiftLeader,
        canChangeWho: std && (canManage || isNokOwner || isShiftLeader),
        canChangeWhat: canManage || isNokOwner || isResultLeader || isCorrector || isShiftLeader,
        canRemove: canManage
      });

      $actions.append($action);

      var $who = setUpUserSelect2($action.find('[name$="who"]'), {
        width: '350px',
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

      view.resizeTextArea($action.find('[name$="what"]')[0]);
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
    },

    toggleRequireInspector: function()
    {
      var $inspector = this.$id('inspector');
      var $leader = this.$id('leader');
      var error = '';

      if (!$inspector.val().length && !$leader.val().length)
      {
        error = this.t('FORM:ERROR:inspector');
      }

      $inspector[0].setCustomValidity(error);
    },

    toggleRequireOrder: function()
    {
      if (this.getSource() === 'wh')
      {
        this.toggleRequireComponent();
      }
      else
      {
        this.toggleRequireOrderNo();
      }
    },

    toggleRequireOrderNo: function()
    {
      var kind = qiDictionaries.kinds.get(this.$id('kind').val());
      var $orderGroup = this.$id('orderGroup');
      var $orderNo = this.$id('orderNo');
      var required = !$orderNo.prop('disabled')
        && (!!kind && !!kind.get('order'));

      getInputLabel($orderNo).toggleClass('is-required', required);

      if (!required && $orderNo.val().trim() === '')
      {
        $orderNo[0].setCustomValidity('');
      }

      $orderGroup.find('input').prop('required', required);
    },

    toggleRequireComponent: function()
    {
      var $orderNo = this.$id('orderNo');
      var $nc12 = this.$id('nc12');
      var required = !$orderNo.prop('disabled');

      getInputLabel($nc12).toggleClass('is-required', required);

      $nc12.prop('readonly', !required);

      if ($nc12.val().trim() === '')
      {
        $nc12[0].setCustomValidity('');
      }

      this.$id('orderGroup').find('input').prop('required', required);
      $orderNo.prop('required', false);
      this.$id('productFamily').prop('required', false);
    },

    updateLines: function(orderLines)
    {
      var $line = this.$id('line');
      var options = [];
      var map = {};
      var currentLine = this.model.get('line');

      if (!IS_ANDROID)
      {
        options.push({id: '', text: ''});
      }

      orderLines.forEach(function(line)
      {
        options.push({
          id: line,
          text: line
        });

        map[line] = 1;
      });

      if (orderLines.length)
      {
        options.push({id: '', text: '', disabled: true});
      }

      options = options.concat(orgUnits.getAllByType('prodLine')
        .filter(function(prodLine)
        {
          return !map[prodLine.id] && (!prodLine.get('deactivatedAt') || prodLine.id === currentLine);
        })
        .map(function(prodLine)
        {
          return {
            id: prodLine.id,
            text: prodLine.id
          };
        })
        .sort(function(a, b)
        {
          return a.id.localeCompare(b.id, undefined, {numeric: true});
        }));

      $line.html(options.map(function(option)
      {
        return '<option value="' + option.id + '" ' + (option.disabled ? 'disabled' : '') + '>'
          + _.escape(option.text) + '</option>';
      }).join(''));

      if (this.options.editMode && this.findOrderCount === 1)
      {
        $line.val(currentLine ? currentLine : '');
      }
      else
      {
        $line.val(currentLine ? currentLine : orderLines.length ? orderLines[0] : '');
      }

      if (!IS_ANDROID)
      {
        $line.removeClass('form-control').select2({
          placeholder: ' ',
          allowClear: true
        });
      }
    },

    updateLeaders: function(orderLeaders)
    {
      var source = this.getSource();
      var leaders = qiDictionaries[source === 'wh' ? 'whman' : 'leaders'];
      var $leader = this.$id('leader');
      var options = [];
      var map = {};
      var currentLeader = this.model.get('leader');

      if (!IS_ANDROID)
      {
        options.push({id: '', text: ''});
      }

      orderLeaders.forEach(function(leader)
      {
        var user = leaders.get(leader.id);
        var text;

        if (user)
        {
          text = user.getLabel();
        }
        else
        {
          var parts = leader.label.replace(/ \(.*?$/, '').split(' ');
          var firstName = parts.shift();

          text = parts.join(' ') + ' ' + firstName;
        }

        options.push({
          id: leader.id,
          text: text
        });

        map[leader.id] = 1;
      });

      if (orderLeaders.length)
      {
        options.push({id: '', text: '', disabled: true});
      }

      if (currentLeader && !map[currentLeader.id] && !leaders.get(currentLeader.id))
      {
        options.push({
          id: currentLeader.id,
          text: currentLeader.label
        });
      }

      leaders.forEach(function(leader)
      {
        if (!map[leader.id])
        {
          options.push({
            id: leader.id,
            text: leader.getLabel()
          });
        }
      });

      $leader.html(options.map(function(option)
      {
        return '<option value="' + option.id + '" ' + (option.disabled ? 'disabled' : '') + '>'
          + _.escape(option.text) + '</option>';
      }).join(''));

      if (this.options.editMode && this.findOrderCount === 1)
      {
        $leader.val(currentLeader ? currentLeader.id : '');
      }
      else
      {
        $leader.val(currentLeader ? currentLeader.id : orderLeaders.length ? orderLeaders[0].id : '');
      }

      if (!IS_ANDROID)
      {
        $leader.removeClass('form-control').select2({
          placeholder: ' ',
          allowClear: true
        });
      }
    },

    resizeTextArea: function(el)
    {
      if (!el)
      {
        return;
      }

      var $ghost = this.$id('textAreaGhost');

      if (!$ghost.length)
      {
        $ghost = $('<div class="form-control"></div>')
          .attr('id', this.idPrefix + '-textAreaGhost')
          .css({
            position: 'absolute',
            top: '0',
            left: '-9999px',
            whiteSpace: 'pre-wrap',
            height: 'auto'
          })
          .appendTo(this.el);
      }

      $ghost[0].style.width = el.offsetWidth + 'px';
      $ghost[0].innerHTML = el.value.endsWith('\n') ? (el.value + 'x') : el.value;

      el.style.height = Math.min(114, Math.max(34, $ghost[0].offsetHeight)) + 'px';
    },

    linkKzAction: function()
    {
      var view = this;
      var $rid = view.$id('kzActionRid');

      if ($rid.prop('disabled'))
      {
        return;
      }

      if (!$rid[0].validity.valid)
      {
        return $rid[0].reportValidity();
      }

      var rid = parseInt($rid.val(), 10);

      if (!(rid > 0))
      {
        return $rid.select();
      }

      if (view.$('input[name$=".rid"][value="' + rid + '"]').length)
      {
        $rid.val('').focus();

        return;
      }

      viewport.msg.loading();

      $rid.prop('disabled', true);

      var req = view.ajax({
        url: '/suggestions/' + $rid.val()
      });

      req.fail(function()
      {
        if (req.status !== 404)
        {
          return viewport.msg.loadingFailed();
        }

        viewport.msg.loaded();

        $rid[0].setCustomValidity(view.t('correctiveActions:notFound'));

        setTimeout(function() { $rid[0].reportValidity(); }, 1);
      });

      req.done(function(suggestion)
      {
        $rid.val('');

        viewport.msg.loaded();

        view.addAction({
          kind: 'kz',
          rid: suggestion.rid,
          status: suggestion.status,
          when: '',
          who: suggestion.kaizenOwners,
          what: suggestion.subject
        });
      });

      req.always(function()
      {
        $rid.prop('disabled', false);
      });
    },

    addKzAction: function()
    {
      var view = this;
      var $btn = view.$id('addKzAction').prop('disabled', true);

      if (kzDictionaries.loaded)
      {
        showDialog();
      }
      else
      {
        viewport.msg.loading();

        kzDictionaries.load()
          .done(function()
          {
            viewport.msg.loaded();
            showDialog();
          })
          .fail(function()
          {
            viewport.msg.loadingFailed();
            $btn.prop('disabled', false);
          });
      }

      function showDialog()
      {
        var suggestion = new Suggestion();
        var dialogView = new SuggestionFormView({
          dialogClassName: 'qiResults-form-suggestion-dialog',
          editMode: false,
          model: suggestion,
          formMethod: 'POST',
          formAction: suggestion.url(),
          formActionText: view.t('correctiveActions:add:kz:submit'),
          failureText: t('core', 'FORM:ERROR:addFailure'),
          panelTitleText: view.t('correctiveActions:add:kz:title'),
          handleSuccess: function()
          {
            viewport.closeDialog();

            view.addAction({
              kind: 'kz',
              rid: suggestion.get('rid'),
              status: suggestion.get('status'),
              when: '',
              who: suggestion.get('kaizenOwners'),
              what: suggestion.get('subject')
            });
          }
        });

        view.listenTo(dialogView, 'dialog:hidden', function()
        {
          $btn.prop('disabled', false);
        });

        viewport.showDialog(dialogView);
      }
    }

  });
});
