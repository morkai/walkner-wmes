// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/core/util/padString',
  'app/orderDocumentTree/util/pasteDateEvents',
  'app/orderDocumentTree/templates/editFileDialog'
], function(
  _,
  $,
  t,
  time,
  viewport,
  FormView,
  padString,
  pasteDateEvents,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'change input[name="folders[]"]': function()
      {
        var $checkboxes = this.$('input[name="folders[]"]');

        $checkboxes.first().prop('required', $checkboxes.filter(':checked').length === 0);
      },

      'click #-components-addByName-toggle': function()
      {
        this.toggleAddByName(true);

        return false;
      },

      'click #-components-addByName button': function()
      {
        this.submitAddByName();

        return false;
      },

      'keydown #-components-addByName': function(e)
      {
        if (e.key === 'Escape')
        {
          this.toggleAddByName(false);

          return false;
        }

        if (e.key === 'Enter')
        {
          this.submitAddByName();

          return false;
        }
      }

    }, pasteDateEvents, FormView.prototype.events),

    initialize: function(options)
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.tree = options.tree;

      if (!this.tree)
      {
        throw new Error('The `tree` option is required!');
      }
    },

    getTemplateData: function()
    {
      var tree = this.tree;

      return {
        folders: _.map(this.model.get('folders'), function(folderId)
        {
          return {
            id: folderId,
            path: tree.getPath(tree.folders.get(folderId)).map(function(f) { return f.getLabel(); }).join(' > ')
          };
        }).filter(function(d) { return d.path.length > 0; })
      };
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.components = '';

      formData.files = formData.files.map(function(file)
      {
        return {
          hash: file.hash,
          type: file.type,
          date: time.utc.format(file.date, 'YYYY-MM-DD')
        };
      });

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.components = this.$id('components').select2('data').map(function(item)
      {
        return {
          nc12: /^0{10,}/.test(item.id) ? '000000000000' : item.id,
          name: item.text,
          searchName: item.text.toUpperCase().replace(/[^A-Z0-9]+/g, '')
        };
      });

      return formData;
    },

    request: function(formData)
    {
      return this.promised(this.tree.editFile(this.model, formData));
    },

    getFailureText: function()
    {
      return this.t('editFile:msg:failure');
    },

    handleSuccess: function()
    {
      if (_.isFunction(this.closeDialog))
      {
        this.closeDialog();
      }

      viewport.msg.show({
        type: 'success',
        time: 2500,
        text: this.t('editFile:msg:success')
      });
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      var noCodeCount = 0;

      this.$id('components').select2({
        width: '100%',
        placeholder: '12NC...',
        allowClear: true,
        multiple: true,
        minimumInputLength: 8,
        ajax: {
          cache: true,
          quietMillis: 300,
          url: function(term)
          {
            return '/orders/components?limit(100)&_id=regex=' + encodeURIComponent('^' + term);
          },
          results: function(data)
          {
            return {
              results: (data.collection || []).map(function(component)
              {
                return {
                  id: component._id,
                  text: component.name.trim()
                };
              })
            };
          }
        },
        formatSelection: function(item)
        {
          return _.escape(/^0{10,}/.test(item.id) ? item.text : item.id);
        },
        formatResult: function(item)
        {
          var html = ['<span class="text-mono">', _.escape(padString.start(item.id, 12, '0')), '</span>'];

          if (item.text)
          {
            html.push('<span class="text-small">:', _.escape(item.text) + '</span>');
          }

          return html.join('');
        }
      }).select2('data', (this.model.get('components') || []).map(function(component)
      {
        var id = component.nc12;

        if (id === '000000000000')
        {
          noCodeCount += 1;

          id = padString.start(noCodeCount.toString(), 12, '0');
        }

        return {
          id: id,
          text: component.name
        };
      }));
    },

    toggleAddByName: function(state)
    {
      var $form = this.$id('components-addByName').toggleClass('hidden', !state);

      if (state)
      {
        $form.find('input').val('').focus();
      }
    },

    submitAddByName: function()
    {
      this.toggleAddByName(false);

      var name = this.$id('components-addByName').find('input').val().trim();

      if (name.toUpperCase().replace(/[^A-Z0-9]+/g, '') === '')
      {
        return;
      }

      var $components = this.$id('components');
      var data = $components.select2('data');
      var lastNoCode = 0;

      data.forEach(function(item)
      {
        if (!/^0{10,}/.test(item.id))
        {
          return;
        }

        lastNoCode = Math.max(+item.id, lastNoCode);
      });

      data.push({
        id: padString.start((lastNoCode + 1).toString(), 12, '0'),
        text: name
      });

      $components.select2('data', data);
    }

  });
});
