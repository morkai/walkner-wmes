// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
        steps: []
      };
    },

    serialize: function()
    {
      var obj = this.toJSON();

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
