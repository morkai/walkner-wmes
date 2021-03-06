// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/Model',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/core/util/uuid',
  'app/orgUnits/views/OrgUnitDropdownsView',
  'app/data/loadedModules',
  'app/data/aors',
  'app/data/companies',
  'app/data/prodFunctions',
  'app/data/privileges',
  'app/data/clipboard',
  'app/vendors/util/setUpVendorSelect2',
  'app/mrpControllers/util/setUpMrpSelect2',
  '../User',
  'app/users/templates/formMobileList',
  'app/users/templates/form'
], function(
  require,
  _,
  $,
  t,
  user,
  viewport,
  Model,
  FormView,
  idAndLabel,
  uuid,
  OrgUnitDropdownsView,
  loadedModules,
  aors,
  companies,
  prodFunctions,
  privileges,
  clipboard,
  setUpVendorSelect2,
  setUpMrpSelect2,
  User,
  formMobileListTemplate,
  formTemplate
) {
  'use strict';

  var ORG_UNIT = OrgUnitDropdownsView.ORG_UNIT;

  return FormView.extend({

    template: formTemplate,

    events: {
      'submit': 'submitForm',
      'input input[type="password"]': function(e)
      {
        if (this.timers.validatePasswords !== null)
        {
          clearTimeout(this.timers.validatePasswords);
        }

        this.timers.validatePasswords = setTimeout(this.validatePasswords.bind(this, e), 30);
      },
      'change #-aors': 'resizeColumns',
      'keydown #-mobile': function(e)
      {
        if (e.keyCode === 13)
        {
          this.$id('mobile-add').click();

          return false;
        }
      },
      'click #-mobile-add': function()
      {
        var $number = this.$id('mobile-number');
        var $from = this.$id('mobile-from');
        var $to = this.$id('mobile-to');

        this.addMobile($number.val(), $from.val(), $to.val());
        this.renderMobileList();

        $number.val('').focus();
        $from.val('');
        $to.val('');
      },
      'click .users-form-mobile-remove': function(e)
      {
        this.removeMobile(this.$(e.target).closest('li').attr('data-number'));
        this.$id('mobile-number').select();

        return false;
      },
      'keydown #-cardUid': function(e)
      {
        if (e.key === 'Enter')
        {
          return false;
        }
      },
      'click #-copyPrivileges': 'copyPrivileges',
      'click #-genApiKey': 'genApiKey',
      'change #-oshWorkplace': function()
      {
        this.setUpOshSelect2(this.$id('oshWorkplace').val() || null, null);
      }
    },

    initialize: function()
    {
      FormView.prototype.initialize.call(this);

      this.mobileList = null;

      this.accountMode = this.options.editMode
        && user.data._id === this.model.id
        && !user.isAllowedTo('USERS:MANAGE');

      if (loadedModules.isLoaded('orgUnits'))
      {
        this.orgUnitDropdownsView = new OrgUnitDropdownsView({
          orgUnit: ORG_UNIT.SUBDIVISION,
          allowClear: true
        });

        this.setView('.orgUnitDropdowns-container', this.orgUnitDropdownsView);

        this.listenTo(this.orgUnitDropdownsView, 'afterRender', this.resizeColumns);
      }

      $(window).on('resize.' + this.idPrefix, _.debounce(this.resizeColumns.bind(this), 16));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
      $(document).off('.' + this.idPrefix);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (!this.accountMode)
      {
        this.$id('aors').select2({
          width: '100%',
          allowClear: true,
          multiple: true,
          placeholder: ' ',
          data: aors.map(idAndLabel)
        });

        this.setUpOshSelect2();
        this.setUpProdFunctionSelect2();
        this.setUpCompanySelect2();
        this.setUpVendorSelect2();
        this.setUpPrivilegesControls();

        if (this.orgUnitDropdownsView)
        {
          this.listenToOnce(this.orgUnitDropdownsView, 'afterRender', this.setUpOrgUnitDropdowns);
        }
      }

      setUpMrpSelect2(this.$id('mrps'), {
        width: '100%'
      });

      if (!this.mobileList)
      {
        this.mobileList = this.model.get('mobile') || [];
      }

      this.renderMobileList();
      this.resizeColumns();
    },

    setUpOrgUnitDropdowns: function()
    {
      var model = null;
      var orgUnit = null;

      switch (this.model.get('orgUnitType'))
      {
        case 'division':
          orgUnit = ORG_UNIT.DIVISION;
          model = new Model({division: this.model.get('orgUnitId')});
          break;

        case 'subdivision':
          orgUnit = ORG_UNIT.SUBDIVISION;
          model = new Model({subdivision: this.model.get('orgUnitId')});
          break;
      }

      this.orgUnitDropdownsView.selectValue(model, orgUnit);
    },

    setUpOshSelect2: function(workplace, division)
    {
      var $workplace = this.$id('oshWorkplace');
      var $division = this.$id('oshDepartment');

      if (!$workplace.length)
      {
        return;
      }

      if (workplace === undefined)
      {
        workplace = this.model.get('oshWorkplace');
        division = this.model.get('oshDepartment');
      }

      $workplace.val(workplace || '');
      $division.val(division || '');

      var oshDictionaries = require('app/wmes-osh-common/dictionaries');

      $workplace.select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data: oshDictionaries.workplaces.map(function(w)
        {
          return {
            id: w.id,
            text: w.getLabel({long: true}),
            model: w
          };
        })
      });

      $division.select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data: oshDictionaries.departments.where({workplace: +workplace}).map(function(d)
        {
          return {
            id: d.id,
            text: d.getLabel({long: true}),
            model: d
          };
        })
      });
    },

    setUpPrivilegesControls: function()
    {
      var view = this;
      var privilegeMap = {};
      var privilegeList = [];

      privileges.forEach(function(privilege)
      {
        var tag = view.t('PRIVILEGE:' + privilege);

        privilegeMap[tag] = privilege;
        privilegeList.push({
          id: privilege,
          text: tag
        });
      });

      view.$id('privileges').select2({
        width: '100%',
        allowClear: false,
        tags: privilegeList,
        tokenSeparators: [';'],
        createSearchChoice: function(term)
        {
          var tag = term.trim();
          var privilege = privilegeMap[tag];

          return !privilege ? null : {
            id: privilege,
            text: tag
          };
        }
      });
    },

    serializePrivileges: function()
    {
      var selectedOptions = this.$id('privileges').select2('data');

      if (selectedOptions.length === 0)
      {
        return '';
      }

      return selectedOptions.map(function(data) { return data.text; }).join(';') + ';';
    },

    copyPrivileges: function(e)
    {
      var view = this;

      clipboard.copy(function(clipboardData)
      {
        clipboardData.setData('text/plain', view.serializePrivileges());
        clipboard.showTooltip({e: e, text: view.t('FORM:copyPrivileges:success')});
      });
    },

    genApiKey: function()
    {
      this.$id('apiKey').val((uuid() + uuid()).replace(/-/g, '').toLowerCase());
    },

    setUpProdFunctionSelect2: function()
    {
      this.$id('prodFunction').select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data: prodFunctions.map(idAndLabel)
      });
    },

    setUpCompanySelect2: function()
    {
      this.$id('company').select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data: companies.map(idAndLabel)
      });
    },

    setUpVendorSelect2: function()
    {
      var $vendor = setUpVendorSelect2(this.$id('vendor'));
      var vendor = this.model.get('vendor');

      if (vendor && vendor._id)
      {
        $vendor.select2('data', $vendor.prepareData(vendor));
      }
    },

    validatePasswords: function()
    {
      var $password1 = this.$id('password');
      var $password2 = this.$id('password2');

      if ($password1.val() === $password2.val())
      {
        $password2[0].setCustomValidity('');
      }
      else
      {
        $password2[0].setCustomValidity(this.t('FORM:ERROR:passwordMismatch'));
      }

      this.timers.validatePassword = null;
    },

    getTemplateData: function()
    {
      return {
        loadedModules: loadedModules,
        notifications: User.NOTIFICATIONS,
        accountMode: this.accountMode
      };
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.active = (!!formData.active).toString();
      formData.privileges = (formData.privileges || []).join(',');
      formData.vendor = null;
      formData.aors = (formData.aors || []).join(',');
      formData.mrps = (formData.mrps || []).join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData = _.defaults(formData, {
        privileges: [],
        aors: [],
        mrps: [],
        preferences: {}
      });

      ['firstName', 'lastName', 'personnelId', 'email'].forEach(function(prop)
      {
        if (!formData[prop] || !formData[prop].length)
        {
          formData[prop] = '';
        }
      });

      ['company', 'prodFunction', 'vendor'].forEach(function(prop)
      {
        if (!formData[prop] || !formData[prop].length)
        {
          formData[prop] = null;
        }
      });

      var $oshWorkplace = this.$id('oshWorkplace');

      if ($oshWorkplace.length)
      {
        var oshWorkplace = $oshWorkplace.select2('data');
        var oshDepartment = this.$id('oshDepartment').select2('data');

        formData.oshDivision = oshWorkplace && oshWorkplace.model.get('division') || 0;
        formData.oshWorkplace = oshWorkplace && oshWorkplace.model.id || 0;
        formData.oshDepartment = oshDepartment && oshDepartment.model.id || 0;
      }

      ['card', 'cardUid'].forEach(function(prop)
      {
        formData[prop] = formData[prop] ? formData[prop].replace(/[^0-9]+/g, '').replace(/^0+/, '') : null;
      });

      ['aors', 'mrps', 'privileges'].forEach(function(prop)
      {
        if (typeof formData[prop] === 'string')
        {
          formData[prop] = formData[prop].split(',');
        }
      });

      if (formData.subdivision)
      {
        formData.orgUnitType = 'subdivision';
        formData.orgUnitId = formData.subdivision;
      }
      else if (formData.division)
      {
        formData.orgUnitType = 'division';
        formData.orgUnitId = formData.division;
      }
      else
      {
        formData.orgUnitType = 'unspecified';
        formData.orgUnitId = null;
      }

      formData.mobile = this.serializeMobile();

      return formData;
    },

    serializeMobile: function()
    {
      var mobileMap = {};

      _.forEach(this.mobileList, function(mobile)
      {
        mobileMap[mobile.number] = mobile;
      });

      return _.values(mobileMap);
    },

    resizeColumns: function()
    {
      var $columns = this.$('.col-lg-3');
      var $maxColumn = null;
      var maxHeight = 0;

      $columns.each(function()
      {
        var $column = $(this).css('height', '');
        var columnHeight = $column.outerHeight();

        if (columnHeight > maxHeight)
        {
          $maxColumn = $column;
          maxHeight = columnHeight;
        }
      });

      if (window.innerWidth >= 1200)
      {
        $columns.each(function()
        {
          this.style.height = this === $maxColumn[0] ? '' : (maxHeight + 'px');
        });
      }
    },

    renderMobileList: function()
    {
      this.$id('mobile-list').html(this.renderPartialHtml(formMobileListTemplate, {
        mobileList: this.mobileList
      }));
    },

    removeMobile: function(number)
    {
      this.mobileList = this.mobileList.filter(function(mobile) { return mobile.number !== number; });

      this.renderMobileList();
    },

    addMobile: function(number, fromTime, toTime)
    {
      number = this.parseMobileNumber(number);
      fromTime = this.parseMobileTime(fromTime);
      toTime = this.parseMobileTime(toTime);

      if (number && fromTime && toTime)
      {
        this.mobileList.push({
          number: number,
          fromTime: fromTime,
          toTime: toTime
        });
      }
    },

    parseMobileNumber: function(number)
    {
      number = number.replace(/[^0-9]/g, '');

      if (number.length < 9)
      {
        return '';
      }

      if (number.length === 9)
      {
        number = '48' + number;
      }

      if (number.length > 11)
      {
        return '';
      }

      return '+' + number;
    },

    parseMobileTime: function(time)
    {
      if (!time.trim().length)
      {
        time = '00:00';
      }

      if (time > -1 && time < 25)
      {
        if (time < 10)
        {
          time = '0' + time + ':00';
        }
        else if (time === '24')
        {
          time = '00:00';
        }
        else
        {
          time += ':00';
        }
      }

      var matches = time.match(/([0-9]{1,2})[^0-9]*([0-9]{2})/);

      if (matches === null)
      {
        return '00:00';
      }

      if (matches[1].length === 1)
      {
        matches[1] = '0' + matches[1];
      }

      return matches[1] + ':' + matches[2];
    },

    handleFailure: function(jqXhr)
    {
      var json = jqXhr.responseJSON;
      var error = json && json.error && json.error.message;

      if (this.t.has('FORM:ERROR:' + error))
      {
        return this.showErrorMessage(this.t('FORM:ERROR:' + error));
      }

      return FormView.prototype.handleFailure.apply(this, arguments);
    }

  });
});
