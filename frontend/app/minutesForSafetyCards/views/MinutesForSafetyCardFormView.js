// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/util/idAndLabel',
  'app/core/util/buttonGroup',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/data/prodLines',
  'app/kaizenOrders/dictionaries',
  '../MinutesForSafetyCard',
  'app/minutesForSafetyCards/templates/form',
  'app/minutesForSafetyCards/templates/_formObservation',
  'app/minutesForSafetyCards/templates/_formProposition',
  'app/minutesForSafetyCards/templates/_formRidEditor'
], function(
  _,
  $,
  t,
  time,
  user,
  idAndLabel,
  buttonGroup,
  FormView,
  setUpUserSelect2,
  prodLines,
  kaizenDictionaries,
  MinutesForSafetyCard,
  template,
  renderObservation,
  renderProposition,
  renderRidEditor
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.extend({

      'click #-addObservation': function()
      {
        this.$id('observations').append(renderObservation({
          observation: {
            what: '',
            why: ''
          },
          i: ++this.rowIndex
        }));
      },
      'click #-addOrgProposition': function()
      {
        var $proposition = $(this.createProposition('orgPropositions', {
          what: '',
          who: '',
          when: ''
        }));

        this.$id('orgPropositions').append($proposition);

        this.setUpWhoSelect2($proposition);
      },
      'click #-addTechProposition': function()
      {
        var $proposition = $(this.createProposition('techPropositions', {
          what: '',
          who: '',
          when: ''
        }));

        this.$id('techPropositions').append($proposition);

        this.setUpWhoSelect2($proposition);
      },
      'click .btn[data-remove]': function(e)
      {
        this.$(e.target).closest('tr').fadeOut('fast', function()
        {
          $(this).remove();
        });
      },
      'click .minutesForSafetyCards-form-rid-message > a': function()
      {
        localStorage.setItem(
          'MFS_LAST',
          JSON.stringify(
            _.assign(
              this.model.toJSON(),
              this.getFormData()
            )
          )
        );
      },
      'click a[role=rid]': function(e)
      {
        this.showRidEditor(e.currentTarget.dataset.kind, e.currentTarget);

        return false;
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.rowIndex = 0;
    },

    getTemplateData: function()
    {
      return {
        statuses: kaizenDictionaries.statuses
      };
    },

    checkValidity: function(formData)
    {
      return (formData.observations || []).length
        || (formData.risks || []).length
        || (formData.difficulties || []).length;
    },

    handleInvalidity: function()
    {
      this.$id('addObservation').focus();
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.date = time.format(formData.date, 'YYYY-MM-DD');

      return formData;
    },

    serializeForm: function(formData)
    {
      var owner = this.$id('owner').select2('data');
      var dateMoment = time.getMoment(formData.date, 'YYYY-MM-DD');
      var $orgPropositions = this.$id('orgPropositions').find('input[name$="who"]');
      var $techPropositions = this.$id('techPropositions').find('input[name$="who"]');
      var serializeUsers = function($select2)
      {
        return !$select2 || !$select2.length ? [] : ($select2.select2('data') || []).map(function(participant)
        {
          return {
            id: participant.id,
            label: participant.text
          };
        });
      };

      formData.owner = {
        id: owner.id,
        label: owner.text
      };
      formData.date = dateMoment.isValid() ? dateMoment.toISOString() : null;
      formData.observations = (formData.observations || []).filter(this.filterObservation);

      formData.orgPropositions = (formData.orgPropositions || []).map(function(p, i)
      {
        p.who = serializeUsers($($orgPropositions[i]));

        return p;
      }).filter(this.filterProposition);

      formData.techPropositions = (formData.techPropositions || []).map(function(p, i)
      {
        p.who = serializeUsers($($techPropositions[i]));

        return p;
      }).filter(this.filterProposition);

      formData.participants = serializeUsers(this.$id('participants'));

      return formData;
    },

    filterObservation: function(o)
    {
      o.what = (o.what || '').trim();
      o.why = (o.why || '').trim();

      return o.what.length > 0 && o.why.length > 0;
    },

    filterProposition: function(p)
    {
      p.what = (p.what || '').trim();
      p.when = (p.when || '').trim() || null;

      return p.what.length > 0;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('section').select2({
        data: kaizenDictionaries.sections.map(idAndLabel)
      });

      buttonGroup.toggle(this.$id('status'));

      this.setUpOwnerSelect2();
      this.setUpParticipantsSelect2();
      this.renderObservations();
      this.renderPropositions('orgPropositions');
      this.renderPropositions('techPropositions');

      this.$('input[autofocus]').focus();
    },

    setUpOwnerSelect2: function()
    {
      var owner = this.model.get('owner');
      var $owner = setUpUserSelect2(this.$id('owner'), {
        textFormatter: function(user, name)
        {
          return name;
        },
        activeOnly: !this.options.editMode
      });

      if (owner)
      {
        $owner.select2('data', {
          id: owner.id,
          text: owner.label
        });
      }
    },

    setUpParticipantsSelect2: function()
    {
      var participants = this.model.get('participants');
      var $participants = setUpUserSelect2(this.$id('participants'), {
        multiple: true,
        textFormatter: function(user, name)
        {
          return name;
        },
        activeOnly: !this.options.editMode
      });

      if (participants && participants.length)
      {
        $participants.select2('data', participants.map(function(participant)
        {
          return {
            id: participant.id,
            text: participant.label
          };
        }));
      }
    },

    setUpWhoSelect2: function($tr, users)
    {
      var $who = setUpUserSelect2($tr.find('input[name$="who"]'), {
        multiple: true,
        textFormatter: function(user, name)
        {
          return name;
        },
        activeOnly: !this.options.editMode
      });

      if (users && users.length)
      {
        $who.select2('data', users.map(function(user)
        {
          return {
            id: user.id,
            text: user.label
          };
        }));
      }
    },

    renderObservations: function()
    {
      var view = this;

      this.$id('observations').html(
        (this.model.get('observations') || []).map(function(obs)
        {
          return renderObservation({
            observation: obs,
            i: ++view.rowIndex
          });
        })
        .join('')
      );
    },

    renderPropositions: function(type)
    {
      var view = this;
      var propositions = this.model.get(type) || [];

      this.$id(type).html(
        propositions.map(function(proposition)
        {
          return view.createProposition(type, {
            what: proposition.what,
            who: '',
            when: proposition.when ? time.format(proposition.when, 'YYYY-MM-DD') : ''
          });
        })
        .join('')
      );

      this.$id(type).find('tr').each(function(i)
      {
        view.setUpWhoSelect2($(this), propositions[i].who);
      });
    },

    createProposition: function(type, proposition)
    {
      return renderProposition({
        type: type,
        proposition: proposition,
        i: ++this.rowIndex
      });
    },

    handleSuccess: function()
    {
      localStorage.removeItem('MFS_LAST');

      return FormView.prototype.handleSuccess.apply(this, arguments);
    },

    showRidEditor: function(ridProperty, aEl)
    {
      var view = this;
      var $a = view.$(aEl);

      if ($a.next('.popover').length)
      {
        $a.popover('destroy');

        return;
      }

      $a.popover({
        placement: 'auto top',
        html: true,
        trigger: 'manual',
        content: renderRidEditor({
          idPrefix: this.idPrefix,
          helpers: this.getTemplateHelpers(),
          property: ridProperty,
          rid: this.model.get(ridProperty) || ''
        })
      }).popover('show');

      var $popover = $a.next('.popover');
      var $input = $popover.find('.form-control').select();
      var $submit = $popover.find('.btn-default');
      var $cancel = $popover.find('.btn-link');

      $cancel.on('click', function()
      {
        $a.popover('destroy');
      });

      $input.on('keydown', function(e)
      {
        if (e.keyCode === 13)
        {
          return false;
        }
      });

      $input.on('keyup', function(e)
      {
        if (e.keyCode === 13)
        {
          $submit.click();

          return false;
        }
      });

      $submit.on('click', function()
      {
        $input.prop('disabled', true);
        $submit.prop('disabled', true);
        $cancel.prop('disabled', true);

        var rid = parseInt($input.val(), 10) || 0;

        if (rid <= 0)
        {
          return updateRid(null);
        }

        var url = (ridProperty === 'nearMiss' ? '/kaizen/orders' : '/suggestions') + '/' + rid;
        var req = view.ajax({url: url});

        req.fail(function(jqXhr)
        {
          view.showErrorMessage(t(
            'minutesForSafetyCards',
            'FORM:ridEditor:' + (jqXhr.status === 404 ? 'notFound' : 'failure')
          ));

          $input.prop('disabled', false);
          $submit.prop('disabled', false);
          $cancel.prop('disabled', false);

          (jqXhr.status === 404 ? $input : $submit).focus();
        });

        req.done(function()
        {
          updateRid(rid);
        });

        return false;
      });

      function updateRid(newRid)
      {
        $a
          .popover('destroy')
          .closest('.message')
          .find('.minutesForSafetyCards-form-rid-message')
          .html(view.t('FORM:MSG:' + ridProperty + ':' + (newRid ? 'edit' : 'add'), {
            rid: newRid
          }));

        view.model.attributes[ridProperty] = newRid;

        view.$('input[name=' + ridProperty + ']').val(newRid || '');
      }
    }

  });
});
