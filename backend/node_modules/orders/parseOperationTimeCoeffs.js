'use strict';

module.exports = function parseOperationTimeCoeffs(rawValue)
{
  const timeNames = {
    LABOR: 'labor',
    MACHINE: 'machine',
    LABORSETUP: 'laborSetup',
    MACHINESETUP: 'machineSetup'
  };
  const mrpTimes = {};

  rawValue.split('\n').forEach(function(line)
  {
    const times = {};
    const re = /((?:labor|machine)(?:setup)?).*?([0-9]+(?:(?:[.,])[0-9]+)?)/ig;
    let remaining = line;
    let matchCount = 0;
    let match;

    while ((match = re.exec(line)) !== null) // eslint-disable-line no-cond-assign
    {
      times[timeNames[match[1].toUpperCase()]] = parseFloat(match[2].replace(',', '.'));
      remaining = remaining.replace(match[0], '');
      matchCount += 1;
    }

    const mrp = remaining.split(/[^A-Za-z0-9]/)[0].toUpperCase();

    if (matchCount && mrp.length)
    {
      mrpTimes[mrp] = times;
    }
  });

  return mrpTimes;
};
