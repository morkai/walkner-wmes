// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../core/Model'
], function(
  t,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/snf/programs',

    clientUrlRoot: '#snf/programs',

    topicPrefix: 'snf.programs',

    privilegePrefix: 'SNF',

    nlsDomain: 'wmes-snf-programs',

    labelAttribute: 'name',

    defaults: function()
    {
      return {
        name: '',
        kind: '30s',
        lightSourceType: '100',
        bulbPower: '100',
        ballast: '400',
        ignitron: 'outside',
        lampCount: 1,
        lightSensors: true,
        plcProgram: 0,
        waitForStartTime: 10,
        illuminationTime: 30,
        hrsInterval: 0,
        hrsTime: 0,
        hrsCount: 0,
        interlock: '1',
        testerK12: false,
        ballast400W1: false,
        ballast400W2: false,
        ballast2000W: false,
        ignitron400W1: false,
        ignitron400W2: false,
        ignitron2000W: false,
        limitSwitch: false,
        k15: false,
        k16: false,
        k17: false,
        k18: false,
        k19: false,
        k20: false,
        k21: false,
        minCurrent: 0,
        maxCurrent: 0,
        bulbHolder: false,
        images: []
      };
    },

    serializeRow: function()
    {
      var row = this.toJSON();

      row.kind = t(this.nlsDomain, 'kind:' + row.kind);

      return row;
    },

    getTotalDuration: function()
    {
      return this.get('illuminationTime') + (this.get('hrsInterval') + this.get('hrsTime')) * this.get('hrsInterval');
    }

  }, {

    OPTIONS: {
      kinds: ['30s', 'hrs', 'tester'],
      lightSourceTypes: ['100', '2x100', '400', '2x400', '2000'],
      bulbPowers: ['100', '2x100', '150', '250', '2x250', '400', '2x400', '600', '2x600', '1000', '2000'],
      ballasts: ['400', '2x400', '2000'],
      ignitrons: ['outside', 'fitting', 'tin'],
      interlocks: ['1', '1+2', 'mnh'],
      contactors: [
        'testerK12',
        'ballast400W1',
        'ballast400W2',
        'ballast2000W',
        'ignitron400W1',
        'ignitron400W2',
        'ignitron2000W',
        'k15',
        'k16',
        'k17',
        'k18',
        'k19',
        'k20',
        'k21'
      ]
    }

  });
});
