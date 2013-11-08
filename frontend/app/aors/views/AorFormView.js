define([
  'app/core/views/FormView',
  'app/aors/templates/form',
  'i18n!app/nls/aors'
], function(
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'aor',

    successUrlPrefix: '/aors/'

  });
});
