// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/core/views/FormView',
  '../dictionaries',
  'app/opinionSurveys/templates/employeeCountForm'
], function(
  _,
  FormView,
  dictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    serialize: function()
    {
      var divisions = {};

      (this.model.get('employeeCount') || []).forEach(function(employeeCount, i)
      {
        if (!divisions[employeeCount.division])
        {
          divisions[employeeCount.division] = {
            label: dictionaries.divisions.get(employeeCount.division).get('full'),
            employers: {}
          };
        }

        divisions[employeeCount.division].employers[employeeCount.employer] = {
          index: i,
          label: dictionaries.employers.get(employeeCount.employer).get('short'),
          count: employeeCount.count
        };
      });

      return _.extend(FormView.prototype.serialize.call(this), {
        employeeCounts: divisions
      });
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);


    }

  });
});
