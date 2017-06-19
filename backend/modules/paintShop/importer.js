// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpImporter(app, module)
{
  const fteModule = app[module.config.fteId];

  app.broker.subscribe('directoryWatcher.changed')
    .setFilter(fileInfo => fileInfo.moduleId === module.config.directoryWatcherId)
    .on('message', handleDirectoryChange);

  function handleDirectoryChange(fileInfo)
  {
    const date = getDateFromFileName(fileInfo.fileName);

    if (!date)
    {
      return module.debug(`[importer] Skipping invalid file: ${fileInfo.fileName}`);
    }

    if (date < fteModule.currentShift.date)
    {
      return module.debug(`[importer] Skipping old file: ${fileInfo.fileName}`);
    }

    module.debug(`[importer] Importing: ${fileInfo.fileName}`);
  }

  function getDateFromFileName(fileName)
  {
    const dateMatches = fileName.match(/([0-9]{1,4}).?([0-9]{1,2}).?([0-9]{1,4}).*?xlsm?$/i);

    if (!dateMatches)
    {
      return null;
    }

    const yy = parseInt(dateMatches[dateMatches[1].length === 4 ? 1 : 3], 10);
    const mm = parseInt(dateMatches[2], 10);
    const dd = parseInt(dateMatches[dateMatches[1].length === 4 ? 3 : 1], 10);
    const date = new Date();

    date.setUTCFullYear(yy, mm - 1, dd);
    date.setUTCHours(0, 0, 0, 0);

    if (isNaN(date.getTime()))
    {
      return null;
    }

    return date;
  }
};
