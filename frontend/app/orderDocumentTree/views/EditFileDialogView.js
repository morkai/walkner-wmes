// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/orderDocumentTree/util/pasteDateEvents',
  'app/orderDocumentTree/templates/editFileDialog'
], function(
  _,
  $,
  t,
  time,
  viewport,
  FormView,
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

    serialize: function()
    {
      var tree = this.tree;

      return _.assign(FormView.prototype.serialize.apply(this, arguments), {
        folders: _.map(this.model.get('folders'), function(folderId)
        {
          return {
            id: folderId,
            path: tree.getPath(tree.folders.get(folderId)).map(function(f) { return f.getLabel(); }).join(' > ')
          };
        }).filter(function(d) { return d.path.length > 0; })
      });
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

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

    request: function(formData)
    {
      return this.promised(this.tree.editFile(this.model, formData));
    },

    getFailureText: function()
    {
      return t('orderDocumentTree', 'editFile:msg:failure');
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
        text: t('orderDocumentTree', 'editFile:msg:success')
      });
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    }

  });
});
