// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = ProdLineState;

var EXTENDED_DELAY = 0.33;

function ProdLineState(broker, prodLine)
{
  this.broker = broker;
  this.prodLine = prodLine;
  this.v = 0;
  this.state = null;
  this.stateChangedAt = Date.now();
  this.online = false;
  this.extended = false;
  this.extendedTimer = null;
  this.metric1 = 0;
  this.metric2 = 0;
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
    metric1: this.metric1,
    metric2: this.metric2,
    prodShiftId: this.prodShiftId,
    prodShiftOrderId: this.prodShiftOrderId,
    prodDowntimeId: this.prodDowntimeId
  };
};

ProdLineState.prototype.update = function(newStateData)
{
  var prodLineState = this;
  var changes = {};

  checkPropertyChange('prodShiftId', 'string', true);
  checkPropertyChange('prodShiftOrderId', 'string', true);
  checkPropertyChange('prodDowntimeId', 'string', true);
  checkPropertyChange('online', 'boolean', false);
  checkPropertyChange('extended', 'boolean', false);

  if (Object.keys(changes).length === 0)
  {
    return;
  }

  this.checkState(changes);

  changes._id = this.prodLine._id;
  changes.v = ++this.v;

  this.broker.publish('production.stateChanged.' + this.prodLine._id, changes);

  if (changes.state)
  {
    this.checkExtendedDowntime();
  }

  function checkPropertyChange(propertyName, type, allowNull)
  {
    var newValue = newStateData[propertyName];

    if ((typeof newValue === type || (allowNull && newValue === null))
      && newValue !== prodLineState[propertyName])
    {
      changes[propertyName] = newValue;
      prodLineState[propertyName] = newValue;
    }
  }
};

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
