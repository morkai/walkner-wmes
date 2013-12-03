define([
  'moment',
  'app/broker',
  'app/pubsub',
  'app/socket'
], function(
  moment,
  broker,
  pubsub,
  socket
) {
  'use strict';

  var currentShift = getCurrentShift();

  socket.on('shiftChanged', function(newShift)
  {
    currentShift = newShift;

    broker.publish('shiftChanged', currentShift);
  });

  setUpShiftChangeBroadcast();

  function setUpShiftChangeBroadcast()
  {
    var h6 = 6 * 3600 * 1000;
    var h8 = 8 * 3600 * 1000;
    var currentShift = getCurrentShift();
    var currentShiftTime = currentShift.date.getTime() + h6 + (currentShift.shift - 1) * h8;
    var nextShiftTime = currentShiftTime + h8;

    setTimeout(broadcastShiftChange, nextShiftTime - Date.now());
  }

  function broadcastShiftChange()
  {
    if (socket.isConnected())
    {
      var newShift = getCurrentShift();

      app.broker.publish('shiftChanged', newShift);
    }

    setUpShiftChangeBroadcast();
  }

  function getCurrentShift()
  {
    var date = moment();
    var hours = moment.hours();
    var no = 3;

    if (hours >= 6 && hours < 14)
    {
      no = 1;
    }
    else if (hours >= 14 && hours < 22)
    {
      no = 2;
    }
    else if (hours < 6)
    {
      date.subtract('days', 1);
    }

    date.hours(0).minutes(0).seconds(0).milliseconds(0);

    return {
      date: date.format('YYYY-MM-DD'),
      time: date.valueOf(),
      no: no
    };
  }

  return {
    current: currentShift
  };
});
