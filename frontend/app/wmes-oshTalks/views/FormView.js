// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/user',
  'app/core/util/idAndLabel',
  'app/core/util/buttonGroup',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  '../OshTalk',
  'app/wmes-oshTalks/templates/form'
], function(
  _,
  time,
  currentUser,
  idAndLabel,
  buttonGroup,
  FormView,
  setUpUserSelect2,
  dictionaries,
  OshTalk,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: Object.assign({

      'change #-auditor': function()
      {
        this.setUpSectionSelect2();
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.date = time.format(formData.date || new Date(), 'YYYY-MM-DD');
      formData.topics = formData.topics.join(',');

      delete formData.participants;

      return formData;
    },

    serializeForm: function(formData)
    {
      var auditor = this.$id('auditor').select2('data');
      var dateMoment = time.getMoment(formData.date, 'YYYY-MM-DD');

      formData.auditor = {id: auditor.id, label: auditor.text};
      formData.date = dateMoment.isValid() ? dateMoment.toISOString() : null;
      formData.topics = formData.topics.split(',');
      formData.participants = setUpUserSelect2.getUserInfo(this.$id('participants'));

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.setUpAuditorSelect2();
      this.setUpSectionSelect2();
      this.setUpTopicsSelect2();
      this.setUpParticipantsSelect2();
    },

    setUpAuditorSelect2: function()
    {
      var auditor = this.model.get('auditor') || currentUser.getInfo();
      var data = {};

      data[auditor.id] = {
        id: auditor.id,
        text: auditor.label
      };

      dictionaries.sections.forEntryType('talks').forEach(function(section)
      {
        if (!section.get('active'))
        {
          return;
        }

        section.get('auditors').forEach(function(auditor)
        {
          data[auditor.id] = {
            id: auditor.id,
            text: auditor.label
          };
        });
      });

      this.$id('auditor').val(auditor.id).select2({
        data: Object.values(data)
      });
    },

    setUpSectionSelect2: function()
    {
      var canManage = OshTalk.can.manage();
      var section = dictionaries.sections.get(this.model.get('section'));
      var auditor = this.$id('auditor').val();
      var data = {};

      if (section)
      {
        data[section.id] = idAndLabel(section);
      }

      dictionaries.sections.forEntryType('audits').forEach(function(section)
      {
        if (!section.get('active'))
        {
          return;
        }

        if (canManage || section.get('auditors').some(function(a) { return a.id === auditor; }))
        {
          data[section.id] = idAndLabel(section);
        }
      });

      data = Object.values(data);

      var $section = this.$id('section');

      if (!section)
      {
        if (data.length === 1)
        {
          $section.val(data[0].id);
        }
        else
        {
          $section.val('');
        }
      }
      else
      {
        $section.val(section.id);
      }

      $section.select2({
        data: data
      });
    },

    setUpTopicsSelect2: function()
    {
      var data = {};
      var used = this.model.get('topics') || [];

      dictionaries.topics.forEach(function(topic)
      {
        if (used.includes(topic.id) || topic.get('active'))
        {
          data[topic.id] = {
            id: topic.id,
            text: topic.get('fullName')
          };
        }
      });

      this.$id('topics').select2({
        allowClear: true,
        multiple: true,
        data: Object.values(data)
      });
    },

    setUpParticipantsSelect2: function()
    {
      setUpUserSelect2(this.$id('participants'), {
        view: this,
        multiple: true,
        currentUserInfo: this.model.get('participants')
      });
    }

  });
});
