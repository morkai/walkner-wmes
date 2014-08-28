// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');
var deepEqual = require('deep-equal');

module.exports = ProdLineState;

var EXTENDED_DELAY = 0.33;
var HOUR_TO_INDEX = [
  2, 3, 4, 5, 6, 7, 0, 1,
  2, 3, 4, 5, 6, 7, 0, 1,
  2, 3, 4, 5, 6, 7, 0, 1
];

function ProdLineState(broker, prodLine)
{
  this.broker = broker;
  this.prodLine = prodLine;
  this.v = Date.now();
  this.state = null;
  this.stateChangedAt = this.v;
  this.online = false;
  this.extended = false;
  this.extendedTimer = null;
  this.quantitiesDone = [
    {planned: 0, actual: 0},
    {planned: 0, actual: 0},
    {planned: 0, actual: 0},
    {planned: 0, actual: 0},
    {planned: 0, actual: 0},
    {planned: 0, actual: 0},
    {planned: 0, actual: 0},
    {planned: 0, actual: 0}
  ];
  this.plannedQuantityDone = 0;
  this.actualQuantityDone = 0;
  this.prodShiftId = null;
  this.prodShiftOrderId = null;
  this.prodDowntimeId = null;
}

ProdLineState.prototype.toJSON = function()
{
  return {
    _id: this.prodLine._id,
    v: this.v,
    state: this.state,
    stateChangedAt: this.stateChangedAt,
    online: this.online,
    extended: this.extended,
    quantitiesDone: this.quantitiesDone,
    plannedQuantityDone: this.plannedQuantityDone,
    actualQuantityDone: this.actualQuantityDone,
    prodShiftId: this.prodShiftId,
    prodShiftOrderId: this.prodShiftOrderId,
    prodDowntimeId: this.prodDowntimeId
  };
};

ProdLineState.prototype.update = function(newStateData)
{
  var prodLineState = this;
  var changes = {};

  checkPropertyChange('prodShiftId', 'String', true);
  checkPropertyChange('prodShiftOrderId', 'String', true);
  checkPropertyChange('prodDowntimeId', 'String', true);
  checkPropertyChange('online', 'Boolean', false);
  checkPropertyChange('extended', 'Boolean', false);
  checkPropertyChange('quantitiesDone', 'Array', false);

  this.applyChanges(changes);

  function checkPropertyChange(propertyName, type, allowNull)
  {
    var newValue = newStateData[propertyName];

    if ((lodash['is' + type](newValue) || (allowNull && newValue === null))
      && !deepEqual(newValue, prodLineState[propertyName]))
    {
      changes[propertyName] = newValue;
      prodLineState[propertyName] = newValue;
    }
  }
};

ProdLineState.prototype.updateMetrics = function()
{
  var changes = {};

  this.checkQuantitiesDone(changes);

  if (Object.keys(changes).length)
  {
    this.publishChanges(changes);
  }
};

/**
 * @private
 * @param {object} changes
 */
ProdLineState.prototype.applyChanges = function(changes)
{
  if (Object.keys(changes).length === 0)
  {
    return;
  }

  this.checkState(changes);

  if (changes.quantitiesDone)
  {
    this.checkQuantitiesDone(changes);
  }

  this.publishChanges(changes);

  if (changes.state)
  {
    this.checkExtendedDowntime();
  }
};

/**
 * @private
 * @param {object} changes
 */
ProdLineState.prototype.publishChanges = function(changes)
{
  changes._id = this.prodLine._id;
  changes.v = ++this.v;

  this.broker.publish('production.stateChanged.' + changes._id, changes);
};

/**
 * @private
 * @param {object} changes
 */
ProdLineState.prototype.checkState = function(changes)
{
  var newState;

  if (this.prodDowntimeId !== null)
  {
    newState = 'downtime';
  }
  else if (this.prodShiftOrderId !== null)
  {
    newState = 'working';
  }
  else
  {
    newState = 'idle';
  }

  if (newState === this.state)
  {
    return;
  }

  this.state = newState;
  this.stateChangedAt = Date.now();

  if (changes)
  {
    changes.state = this.state;
    changes.stateChangedAt = this.stateChangedAt;
  }
};

/**
 * @private
 * @param {object} changes
 */
ProdLineState.prototype.checkQuantitiesDone = function(changes)
{
  var hourIndex = HOUR_TO_INDEX[new Date().getHours()];
  var plannedQuantityDone = 0;
  var actualQuantityDone = 0;

  for (var i = 0; i < hourIndex; ++i)
  {
    plannedQuantityDone += this.quantitiesDone[i].planned;
    actualQuantityDone += this.quantitiesDone[i].actual;
  }

  if (plannedQuantityDone !== this.plannedQuantityDone)
  {
    changes.plannedQuantityDone = plannedQuantityDone;
    this.plannedQuantityDone = plannedQuantityDone;
  }

  if (actualQuantityDone !== this.actualQuantityDone)
  {
    changes.actualQuantityDone = actualQuantityDone;
    this.actualQuantityDone = actualQuantityDone;
  }
};

/**
 * @private
 */
ProdLineState.prototype.checkExtendedDowntime = function()
{
  if (this.extendedTimer !== null)
  {
    clearTimeout(this.extendedTimer);
    this.extendedTimer = null;
  }

  if (this.state !== 'downtime')
  {
    return this.update({extended: false});
  }

  var delay = (this.stateChangedAt + EXTENDED_DELAY * 60 * 1000) - Date.now();

  if (delay < 0)
  {
    return this.update({extended: true});
  }

  this.extendedTimer = setTimeout(this.checkExtendedDowntime.bind(this), delay);
};
