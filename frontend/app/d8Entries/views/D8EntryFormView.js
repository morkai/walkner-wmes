// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/d8Entries/dictionaries',
  '../D8Entry',
  'app/d8Entries/templates/form',
  'app/d8Entries/templates/formStripRow'
], function(
  _,
  $,
  t,
  time,
  user,
  buttonGroup,
  idAndLabel,
  FormView,
  setUpUserSelect2,
  dictionaries,
  D8Entry,
  template,
  renderStripRow
) {
  'use strict';

  function formatUserSelect2Text(user, name)
  {
    return name;
  }

  return FormView.extend({

    template: template,

    stripIndex: 0,

    events: _.assign({

      'click #-addStrip': function()
      {
        this.addStrip({});
      },

      'click [data-action="removeStrip"]': function(e)
      {
        this.$(e.target).closest('tr').remove();
      },

      'change [name="status"]': function()
      {
        this.toggleRequiredFlags();
      },

      'change [name="area"]': function()
      {
        var area = dictionaries.areas.get(this.$id('area').val());

        if (!area)
        {
          return;
        }

        var manager = area.get('manager');

        if (manager)
        {
          this.$id('manager').select2('data', {
            id: manager.id,
            text: manager.label
          });
        }
      },

      'input [name="rid"]': function(e)
      {
        e.target.setCustomValidity('');
      },

      'blur [name="rid"]': function(e)
      {
        e.target.setCustomValidity('');
      },

      'change [type="date"]': function(e)
      {
        var moment = time.getMoment(e.target.value, 'YYYY-MM-DD');
        var days = moment.isValid() ? moment.diff(new Date(), 'days') : 0;
        var daysAbs = Math.abs(days);
        var $date = this.$(e.target);
        var $group = $date.parent()[0].tagName === 'TD'
          ? $date.parent()
          : $date.closest('.form-group');
        var $help = $group.find('.help-block');

        if (e.target.name === 'crsRegisterDate')
        {
          this.$id('d5PlannedCloseDate').val(moment.add(28, 'days').format('YYYY-MM-DD'));
        }

        if (daysAbs <= 7)
        {
          e.target.setCustomValidity('');
          $help.remove();

          return;
        }

        if (!$help.length)
        {
          $help = $('<p class="help-block"></p>');
        }

        $help.text(t('d8Entries', 'FORM:help:date:diff', {
          dir: days > 0 ? 'future' : 'past',
          days: daysAbs
        })).appendTo($group);
      },

      'click #-d5CloseDateOk': function()
      {
        this.toggleD5CloseDateOk(!this.$id('d5CloseDateOk').hasClass('btn-success'));
      },

      'change #-d5CloseDate': function(e)
      {
        var roles = this.model.getUserRoles();

        if (roles.admin || roles.manager)
        {
          return;
        }

        var oldValue = time.getMoment(this.model.get('d5CloseDate')).format('YYYY-MM-DD');
        var newValue = e.target.value;
        var d5CloseDateOk = !!this.model.get('d5CloseDateOk');

        this.toggleD5CloseDateOk(newValue === oldValue ? d5CloseDateOk : false);
      }

    }, FormView.prototype.events),

    serialize: function()
    {
      return _.assign(FormView.prototype.serialize.call(this), {
        nextYear: time.getMoment().add(1, 'year').format('YYYY-MM-DD'),
        statuses: dictionaries.statuses,
        userRoles: this.model.getUserRoles()
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
      var file = view.$('input[type="file"]')[0];

      if (!file.files.length)
      {
        return FormView.prototype.submitRequest.call(view, $submitEl, formData);
      }

      uploadFormData.append('attachment', file.files[0]);

      this.$el.addClass('is-uploading');

      var uploadReq = view.ajax({
        type: 'POST',
        url: '/d8/entries;upload',
        data: uploadFormData,
        processData: false,
        contentType: false
      });

      uploadReq.done(function(attachment)
      {
        formData.attachment = attachment;

        FormView.prototype.submitRequest.call(view, $submitEl, formData);
      });

      uploadReq.fail(function()
      {
        view.showErrorMessage(t('d8Entries', 'FORM:ERROR:upload'));

        $submitEl.attr('disabled', false);
      });

      uploadReq.always(function()
      {
        view.$el.removeClass('is-uploading');
      });
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      D8Entry.DATE_PROPERTIES.forEach(function(property)
      {
        if (formData[property])
        {
          formData[property] = time.format(formData[property], 'YYYY-MM-DD');
        }
      });

      formData.strips = _.map(formData.strips, function(strip)
      {
        return {
          no: strip.no,
          family: strip.family
        };
      });

      formData.subscribers = '';

      return formData;
    },

    serializeForm: function(formData)
    {
      var $owner = this.$id('owner');

      if ($owner.length)
      {
        var owner = $owner.select2('data');

        formData.owner = !owner ? null : {
          id: owner.id,
          label: owner.text
        };

        var manager = this.$id('manager').select2('data');

        formData.manager = !manager ? null : {
          id: manager.id,
          label: manager.text
        };

        formData.members = this.$id('members')
          .select2('data')
          .map(function(owner) { return {id: owner.id, label: owner.text}; })
          .filter(function(owner) { return !!owner.id; });
      }

      formData.subscribers = this.$id('subscribers')
        .select2('data')
        .map(function(subscriber) { return {id: subscriber.id, label: subscriber.text}; });

      formData.strips = _.map(formData.strips, function(strip)
      {
        return {
          no: strip.no || '',
          family: strip.family || ''
        };
      });

      formData.d5CloseDateOk = this.$id('d5CloseDateOk').hasClass('btn-success');

      D8Entry.DATE_PROPERTIES.forEach(function(property)
      {
        var dateMoment = time.getMoment(formData[property], 'YYYY-MM-DD');

        formData[property] = dateMoment.isValid() ? dateMoment.toISOString() : null;
      });

      delete formData.attachment;

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('area').select2({
        data: dictionaries.areas.map(idAndLabel)
      });

      this.$id('entrySource').select2({
        data: dictionaries.entrySources.map(idAndLabel)
      });

      this.$id('problemSource').select2({
        data: dictionaries.problemSources.map(idAndLabel)
      });

      buttonGroup.toggle(this.$id('status'));

      setUpUserSelect2(this.$id('subscribers'), {
        multiple: true,
        textFormatter: formatUserSelect2Text
      });

      this.setUpOwnerSelect2();
      this.setUpManagerSelect2();
      this.setUpMembersSelect2();
      this.setUpStrips();
      this.toggleD5CloseDateOk(!!this.model.get('d5CloseDateOk'));

      if (this.options.editMode)
      {
        this.disableFields();
      }
      else
      {
        this.$id('crsRegisterDate').val(time.getMoment().format('YYYY-MM-DD'));
        this.$id('d5PlannedCloseDate').val(time.getMoment().add(28, 'days').format('YYYY-MM-DD'));
      }
    },

    toggleD5CloseDateOk: function(newValue)
    {
      var $btn = this.$id('d5CloseDateOk').removeClass('btn-success btn-danger');
      var $fa = $btn.find('.fa').removeClass('fa-thumbs-up fa-thumbs-down');

      $btn.addClass(newValue ? 'btn-success' : 'btn-danger');
      $fa.addClass(newValue ? 'fa-thumbs-up' : 'fa-thumbs-down');
    },

    disableFields: function()
    {
      var roles = this.model.getUserRoles();

      if (roles.admin)
      {
        return;
      }

      this.$id('rid').prop('readonly', true);
      this.$id('status').find('.btn').addClass('disabled');
      this.$id('subject').prop('readonly', true);
      this.$id('area').select2('disable', true);
      this.$id('manager').select2('disable', true);
      this.$id('entrySource').select2('disable', true);

      if (!roles.manager)
      {
        this.$id('owner').select2('disable', true);
        this.$id('d5CloseDateOk').addClass('disabled');
      }

      if (!roles.manager && !roles.owner)
      {
        this.$id('members').select2('disable', true);
      }

      if (!roles.owner)
      {
        this.$id('d5CloseDate').prop('readonly', true);
        this.$id('d8CloseDate').prop('readonly', true);
      }

      this.$id('strips').find('input').prop('disabled', true);
      this.$id('strips').parent().find('.actions').remove();
      this.$id('addStrip').remove();

      this.$id('problemSource').select2('disable', true);
      this.$id('d5PlannedCloseDate').prop('readonly', true);
      this.$id('crsRegisterDate').prop('readonly', true);
      this.$id('problemDescription').prop('readonly', true);
    },

    setUpOwnerSelect2: function()
    {
      var owner = this.model.get('owner');
      var $owner = setUpUserSelect2(this.$id('owner'), {
        textFormatter: formatUserSelect2Text
      });

      if (owner)
      {
        $owner.select2('data', {
          id: owner.id,
          text: owner.label
        });
      }
    },

    setUpManagerSelect2: function()
    {
      var manager = this.model.get('manager');
      var $manager = setUpUserSelect2(this.$id('manager'), {
        textFormatter: formatUserSelect2Text
      });

      if (manager)
      {
        $manager.select2('data', {
          id: manager.id,
          text: manager.label
        });
      }
    },

    setUpMembersSelect2: function()
    {
      var isEditMode = this.options.editMode;
      var model = this.model;
      var data = [];

      if (isEditMode)
      {
        var members = model.get('members');

        if (Array.isArray(members) && members.length)
        {
          data = members.map(function(owner)
          {
            return {
              id: owner.id,
              text: owner.label
            };
          });
        }
      }

      setUpUserSelect2(this.$id('members'), {multiple: true, textFormatter: formatUserSelect2Text})
        .select2('data', data);
    },

    setUpStrips: function()
    {
      if (this.options.editMode)
      {
        _.forEach(this.model.get('strips'), this.addStrip, this);
      }
      else
      {
        this.addStrip({});
      }
    },

    toggleRequiredFlags: function()
    {
      var closed = buttonGroup.getValue(this.$id('status')) === 'closed';

      this.$id('d8CloseDate')
        .prop('required', closed)
        .closest('.form-group')
        .find('.control-label')
        .toggleClass('is-required', closed);
    },

    addStrip: function(strip)
    {
      this.$id('strips').append(renderStripRow({
        i: this.stripIndex++,
        strip: {
          no: strip.no || '',
          family: strip.family || ''
        }
      }));
    },

    handleFailure: function(jqXhr)
    {
      var error = (jqXhr.responseJSON || {}).error || {code: 0};

      if (error.code === 11000)
      {
        var view = this;

        view.$id('rid')[0].setCustomValidity(t('d8Entries', 'FORM:ERROR:duplicateId'));

        setTimeout(function() { view.$id('submit').click(); }, 1);

        return;
      }

      return FormView.prototype.handleFailure.apply(this, arguments);
    }

  });
});
