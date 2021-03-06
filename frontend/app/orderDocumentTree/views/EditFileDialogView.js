// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/core/util/padString',
  'app/core/util/fileIcons',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/orderDocumentTree/allowedTypes',
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
  fileIcons,
  setUpMrpSelect2,
  allowedTypes,
  pasteDateEvents,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    dialogClassName: 'orderDocuments-editFile-dialog',

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
      },

      'focusin #-components-addByName': function()
      {
        clearTimeout(this.timers.hideAddByName);
      },

      'focusout #-components-addByName': function()
      {
        this.timers.hideAddByName = setTimeout(this.toggleAddByName.bind(this, false), 1);
      },

      'change #-stations': function(e)
      {
        e.target.value = e.target.value.split(/[^0-9]+/)
          .filter(function(v) { return v >= 1 && v <= 7; })
          .sort(function(a, b) { return a - b; })
          .join(', ');
      },

      'click .btn[data-action="forceConvert"]': function(e)
      {
        var view = this;
        var btnEl = e.currentTarget;

        btnEl.classList.add('active');
        btnEl.disabled = true;

        var req = view.ajax({
          method: 'POST',
          url: '/orderDocuments/uploads;forceConvert',
          data: JSON.stringify({
            nc15: this.model.id,
            hash: btnEl.dataset.hash
          })
        });

        req.fail(function()
        {
          btnEl.disabled = false;

          viewport.msg.show({
            type: 'error',
            time: 2500,
            text: view.t('editFile:forceConvert:failure')
          });
        });

        req.always(function()
        {
          btnEl.classList.remove('active');
        });
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
        }).filter(function(d) { return d.path.length > 0; }),
        files: _.map(this.model.get('files'), function(file)
        {
          var ext = allowedTypes[file.type];

          return Object.assign({
            ext: ext,
            icon: fileIcons.getByExt(ext)
          }, file);
        })
      };
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.mrps = formData.mrps.join(',');
      formData.components = '';

      formData.stations = formData.stations.join(', ');

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
      formData.mrps = this.$id('mrps').select2('data').map(function(item)
      {
        return item.id;
      });

      formData.components = this.$id('components').select2('data').map(function(item)
      {
        return {
          nc12: /^0{10,}/.test(item.id) ? '000000000000' : item.id,
          name: item.text,
          searchName: item.text.toUpperCase().replace(/[^A-Z0-9]+/g, '')
        };
      });

      formData.stations = (formData.stations || '').split(/[^0-9]+/)
        .filter(function(v) { return v >= 1 && v <= 7; })
        .sort(function(a, b) { return a - b; });

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

      this.setUpMrpsSelect2();
      this.setUpComponentsSelect2();
    },

    setUpMrpsSelect2: function()
    {
      var view = this;

      setUpMrpSelect2(view.$id('mrps'), {
        view: this,
        width: '100%',
        extra: function(data)
        {
          return [{
            id: 'ANY',
            text: view.t('files:mrps:any')
          }].concat(data);
        }
      });
    },

    setUpComponentsSelect2: function()
    {
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
            var url = '/orders/components?limit(100)&_id=';

            if (/^[0-9]{12}$/.test(term))
            {
              url += 'string:' + term;
            }
            else
            {
              url += 'regex=' + encodeURIComponent('^' + term);
            }

            return url;
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

          if (item.text && item.text !== item.id)
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
      var id = name;

      if (!/^[0-9]{12}$/.test(id))
      {
        var lastNoCode = 0;

        data.forEach(function(item)
        {
          if (!/^0{10,}/.test(item.id))
          {
            return;
          }

          lastNoCode = Math.max(+item.id, lastNoCode);
        });

        id = padString.start((lastNoCode + 1).toString(), 12, '0');
      }

      data.push({
        id: id,
        text: name
      });

      $components.select2('data', data);
    }

  });
});
