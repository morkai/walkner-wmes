// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../time',
  '../core/Model'
], function(
  t,
  time,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/xiconf/programs',

    clientUrlRoot: '#xiconf/programs',

    privilegePrefix: 'XICONF',

    topicPrefix: 'xiconfPrograms',

    nlsDomain: 'xiconfPrograms',

    labelAttribute: 'name',

    defaults: function()
    {
      return {
        type: 't24vdc',
        name: '',
        prodLines: '',
        steps: []
      };
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.prodLines = obj.prodLines || t('xiconfPrograms', 'PROPERTY:prodLines:all');
      obj.programType = t('xiconfPrograms', 'type:' + obj.type);
      obj.createdAt = time.format(obj.createdAt, 'LLLL');
      obj.updatedAt = time.format(obj.updatedAt, 'LLLL');

      return obj;
    }

  }, {

    TYPES_TO_STEPS: {
      t24vdc: ['wait', 'pe', 'sol', 'fn'],
      glp2: ['wait', 'pe', 'iso', 'program', 'fn', 'vis']
    },

    GLP2_INPUTS: [1, 2, 3, 4, 5, 6, 7, 8, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]

  });
});
