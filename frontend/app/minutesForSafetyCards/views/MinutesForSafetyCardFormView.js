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
  'app/minutesForSafetyCards/templates/_formCause',
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
  renderCause,
  renderObservation,
  renderProposition,
  renderRidEditor
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

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
      'click .mfs-form-rid-message > a': function()
      {
        sessionStorage.setItem(
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

      $('body').on('click.' + this.idPrefix, this.onDocumentClick.bind(this));
    },

    destroy: function()
    {
      FormView.prototype.destroy.apply(this, arguments);

      this.$id('causes').popover('destroy');

      $('body').off('click.' + this.idPrefix);
    },

    checkValidity: function(formData)
    {
      return (formData.causes || []).length
        || (formData.observations || []).length
        || (formData.risks || []).length
        || (formData.difficulties || []).length;
    },

    handleInvalidity: function()
    {
      if (this.model.getVersion() > 1)
      {
        this.$('textarea[name*="why"]').first().focus();
      }
      else
      {
        this.$id('addObservation').focus();
      }
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
      var confirmer = this.$id('confirmer').select2('data');
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
      formData.confirmer = !confirmer ? null : {
        id: confirmer.id,
        label: confirmer.text
      };
      formData.date = dateMoment.isValid() ? dateMoment.toISOString() : null;

      formData.risks = formData.risks || '';

      formData.causes = formData.causes || [];

      formData.causes.forEach(function(cause)
      {
        if (!cause.why)
        {
          cause.why = [];
        }

        while (cause.why.length < 5)
        {
          cause.why.push('');
        }
      });

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

    getTemplateData: function()
    {
      return {
        version: this.model.getVersion()
      };
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('section').select2({
        data: kaizenDictionaries.sections.map(idAndLabel)
      });

      this.setUpSectionSelect2();
      this.setUpUserSelect2('owner');
      this.setUpParticipantsSelect2();

      if (this.model.getVersion() > 1)
      {
        this.setUpUserSelect2('confirmer');
        this.renderCauses();
      }
      else
      {
        this.renderObservations();
        this.renderPropositions('orgPropositions');
        this.renderPropositions('techPropositions');
      }

      this.$id('owner').focus();
    },

    setUpSectionSelect2: function()
    {
      var id = this.model.get('section');
      var model = kaizenDictionaries.sections.get(id);
      var map = {};

      kaizenDictionaries.sections.forEntryType('minutes').forEach(function(s)
      {
        if (s.get('active'))
        {
          map[s.id] = idAndLabel(s);
        }
      });

      if (id)
      {
        if (!model)
        {
          map[id] = {id: id, text: id};
        }
        else
        {
          map[id] = idAndLabel(model);
        }
      }

      this.$id('section').select2({
        data: _.values(map)
      });
    },

    setUpUserSelect2: function(prop)
    {
      var user = this.model.get(prop);
      var $user = setUpUserSelect2(this.$id(prop), {
        textFormatter: function(user, name)
        {
          return name;
        },
        activeOnly: !this.options.editMode
      });

      if (user)
      {
        $user.select2('data', {
          id: user.id,
          text: user.label
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

    renderCauses: function()
    {
      var view = this;
      var causes = view.model.get('causes') || [
        {category: 'tech', why: ['', '', '', '', '']},
        {category: 'org', why: ['', '', '', '', '']},
        {category: 'human', why: ['', '', '', '', '']}
      ];
      var $causes = view.$id('causes');

      $causes.html(
        causes.map(function(cause)
        {
          return view.renderPartialHtml(renderCause, {
            cause: cause,
            i: ++view.rowIndex
          });
        }).join('')
      );

      $causes.popover({
        container: view.el,
        selector: '.control-label[data-cause]',
        placement: 'bottom',
        trigger: 'click',
        html: true,
        content: function()
        {
          if (!this.querySelector('.fa'))
          {
            return;
          }

          return view.$('div[data-cause-help="' + this.dataset.cause + '"]').html();
        },
        className: 'mfs-form-cause-popover'
      });

      $causes.on('show.bs.popover', function()
      {
        $causes.find('.control-label[aria-describedby^="popover"]').popover('hide');
      });
    },

    renderObservations: function()
    {
      var view = this;

      view.$id('observations').html(
        (view.model.get('observations') || []).map(function(obs)
        {
          return view.renderPartialHtml(renderObservation, {
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
      var propositions = view.model.get(type) || [];

      view.$id(type).html(
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

      view.$id(type).find('tr').each(function(i)
      {
        view.setUpWhoSelect2($(this), propositions[i].who);
      });
    },

    createProposition: function(type, proposition)
    {
      return this.renderPartialHtml(renderProposition, {
        type: type,
        proposition: proposition,
        i: ++this.rowIndex
      });
    },

    handleSuccess: function()
    {
      sessionStorage.removeItem('MFS_LAST');

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
          .find('.mfs-form-rid-message')
          .html(view.t('FORM:MSG:' + ridProperty + ':' + (newRid ? 'edit' : 'add'), {
            rid: newRid
          }));

        view.model.attributes[ridProperty] = newRid;

        view.$('input[name=' + ridProperty + ']').val(newRid || '');
      }
    },

    onDocumentClick: function(e)
    {
      var view = this;
      var $target = view.$(e.target);

      if (!$target.closest('.mfs-form-cause-popover').length
        && !$target.closest('.control-label[data-cause]').length)
      {
        view.$id('causes').popover('hide');
      }
    }

  });
});
