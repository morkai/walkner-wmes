// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/data/orgUnits',
  'app/orgUnits/util/renderOrgUnitPath',
  'app/orderDocumentTree/templates/editFolderDialog'
], function(
  _,
  $,
  t,
  time,
  viewport,
  FormView,
  orgUnits,
  renderOrgUnitPath,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    serializeToForm: function()
    {
      return {
        name: this.folder.get('name'),
        subdivisions: (this.folder.get('subdivisions') || []).join(',')
      };
    },

    serializeForm: function(formData)
    {
      formData.subdivisions = (formData.subdivisions || '').split(',').filter(id => id.length === 24);

      return formData;
    },

    request: function(formData)
    {
      return this.promised(this.model.editFolder(this.folder, formData));
    },

    getFailureText: function()
    {
      return this.t('editFolder:msg:failure');
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
        text: this.t('editFolder:msg:success')
      });
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);

      this.$id('name').focus();
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpSubdivisionsSelect2();
    },

    setUpSubdivisionsSelect2: function()
    {
      this.$id('subdivisions').select2({
        placeholder: ' ',
        allowClear: true,
        multiple: true,
        data: orgUnits.getActiveByType('division').map(function(division)
        {
          var divisionText = division.getLabel();

          return {
            text: divisionText,
            children: orgUnits.getChildren(division)
              .filter(function(subdivision) { return !subdivision.get('deactivatedAt'); })
              .map(function(subdivision)
              {
                return {
                  id: subdivision.id,
                  text: subdivision.getLabel(),
                  divisionText: divisionText
                };
              })
          };
        }),
        formatSelection: function(item, container, e)
        {
          return e(item.divisionText + ' \\ ' + item.text);
        }
      });
    }

  });
});
