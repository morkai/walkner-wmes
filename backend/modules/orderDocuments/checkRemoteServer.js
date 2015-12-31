// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var path = require('path');
var fs = require('fs');
var url = require('url');
var exec = require('child_process').exec;
var _ = require('lodash');
var step = require('h5.step');
var request = require('request');
var cheerio = require('cheerio');

var CHECK_INTERVAL = 60 * 60 * 1000;
var remoteChecks = {};

module.exports = function checkRemoteServer(app, docsModule, nc15)
{
  var remoteServer = docsModule.settings.remoteServer;

  if (_.isEmpty(remoteServer))
  {
    return;
  }

  if (!remoteChecks[nc15])
  {
    remoteChecks[nc15] = {
      inProgress: false,
      lastCheckAt: 0
    };
  }

  var remoteCheck = remoteChecks[nc15];

  if (remoteCheck.inProgress || (Date.now() - remoteCheck.lastCheckAt < CHECK_INTERVAL))
  {
    return;
  }

  remoteCheck.inProgress = Date.now();

  docsModule.debug("Checking document [%s] on remote server [%s]...", nc15, remoteServer);

  var OrderDocumentStatus = app[docsModule.config.mongooseId].model('OrderDocumentStatus');
  var remoteServerUrl = url.format({
    protocol: 'http',
    hostname: remoteServer,
    port: 80,
    pathname: '/ShellCgi/cpb_qdbi_proda_search_tpd_central.pl'
  });

  step(
    function requestDocumentsStep()
    {
      var form = {
        form_name: 'form_docsearch',
        query: nc15,
        tpd: 'ADT',
        designation: '',
        sheet_name: '',
        projects: '',
        doc_type: 'PDF',
        status_name: 'Final',
        results: 100,
        server: 'CENTRAL',
        dba: 'DEF'
      };

      request.post(remoteServerUrl, {form: form}, this.next());
    },
    function findDocumentsStep(err, res, body)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (res.statusCode !== 200)
      {
        return this.skip(new Error("Invalid response status code: " + res.statusCode));
      }

      if (!_.isString(body))
      {
        body = String(body);
      }

      var resultsStartIndex = body.indexOf('<div id=results>', 2048);

      if (resultsStartIndex === -1)
      {
        return this.skip(new Error("Invalid response body: missing `<div id=results>`!"));
      }

      var resultsEndIndex = body.indexOf('</div>', resultsStartIndex);

      if (resultsEndIndex === -1)
      {
        return this.skip(new Error("Invalid response body: missing `</div>`!"));
      }

      var documents = [];
      var maxStatusDate = 0;
      var $ = cheerio.load(body.substring(resultsStartIndex, resultsEndIndex));

      $('tr').each(function(i, row)
      {
        if (i === 0)
        {
          return;
        }

        var $td = $(row).children();
        var href = $td.first().find('a').attr('href');
        var statusDate = 0;
        var matches = ($($td.get(4)).text() || '').match(/([0-9]{4})-([0-9]{2})-([0-9]{2})/);

        if (matches !== null)
        {
          statusDate = Date.UTC(parseInt(matches[1], 10), parseInt(matches[2], 10) - 1, parseInt(matches[3], 10));
        }

        documents.push({
          url: href,
          file: url.parse(href).pathname,
          statusDate: statusDate,
          localFilePath: null
        });

        maxStatusDate = Math.max(maxStatusDate, statusDate);
      });

      docsModule.debug("Found %d files for document [%s]", documents.length, nc15);

      if (!documents.length)
      {
        return this.skip(null, false);
      }

      this.newDocuments = documents;
      this.maxStatusDate = maxStatusDate;
    },
    function findOrderDocumentStatus()
    {
      OrderDocumentStatus.findById(nc15).exec(this.next());
    },
    function checkOrderDocumentStatus(err, orderDocumentStatus)
    {
      if (err)
      {
        return this.skip(err);
      }

      var newFiles = this.newDocuments.map(function(document) { return document.file; });

      if (!orderDocumentStatus)
      {
        orderDocumentStatus = new OrderDocumentStatus({
          _id: nc15,
          statusDate: this.maxStatusDate,
          files: newFiles
        });
        orderDocumentStatus.save(function(err)
        {
          if (err)
          {
            docsModule.error("Failed to save OrderDocumentStatus: %s", err.message);
          }
        });
      }
      else if (orderDocumentStatus.statusDate <= this.maxStatusDate
        && JSON.stringify(orderDocumentStatus.files) === JSON.stringify(newFiles))
      {
        return this.skip(null, false);
      }

      orderDocumentStatus.statusDate = this.maxStatusDate;
      orderDocumentStatus.files = newFiles;

      this.orderDocumentStatus = orderDocumentStatus;

      setImmediate(this.next());
    },
    function downloadDocumentFilesStep()
    {
      var documents = this.newDocuments;

      docsModule.debug("Downloading %d files of document [%s]...", documents.length, nc15);

      var isSingleFile = documents.length === 1;

      for (var i = 0; i < documents.length; ++i)
      {
        var next = this.group();
        var document = documents[i];
        var fileName = nc15;

        if (!isSingleFile)
        {
          fileName += '.' + (i + 1);
        }

        fileName += '.pdf';

        document.localFilePath = path.join(docsModule.config.cachedPath, fileName);

        var writeStream = fs.createWriteStream(document.localFilePath);
        writeStream.on('error', onWriteStreamError);

        request
          .get(document.url)
          .on('error', next)
          .on('end', next)
          .pipe(writeStream);
      }
    },
    function combineDocumentFilesStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      var documents = this.newDocuments;

      if (documents.length === 1)
      {
        return;
      }

      docsModule.debug("Combining %d files into document [%s]", documents.length, nc15);

      var cmd = [
        docsModule.config.sejdaConsolePath,
        'merge',
        '--overwrite',
        '--output', '"' + path.join(docsModule.config.cachedPath, nc15 + '.pdf') + '"',
        '--files'
      ];

      for (var i = 0; i < documents.length; ++i)
      {
        cmd.push('"' + documents[i].localFilePath + '"');
      }

      exec(cmd.join(' '), this.next());
    },
    function removeSinglePagesStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (this.newDocuments.length > 1)
      {
        this.newDocuments.forEach(function(document) { fs.unlink(document.localFilePath, function() {}); });
      }
    },
    function finalizeStep(err, updated)
    {
      if (err)
      {
        docsModule.error("Failed to check document [%s] on remote server [%s]: %s", nc15, remoteServer, err.message);
      }
      else
      {
        remoteCheck.lastCheckAt = Date.now();

        docsModule.debug(
          "Checked document [%s] on remote server [%s] in %d s (%s)!",
          nc15,
          remoteServer,
          ((remoteCheck.lastCheckAt - remoteCheck.inProgress) / 1000).toFixed(3),
          updated ? 'updated' : 'not updated'
        );

        if (updated !== false)
        {
          app.broker.publish('orderDocuments.remoteChecked.' + nc15, {
            nc15: nc15
          });
        }
      }

      remoteCheck.inProgress = 0;

      this.newDocuments = null;
      this.maxStatusDate = null;
      this.orderDocumentStatus = null;
    }
  );

  function onWriteStreamError(err)
  {
    docsModule.error("Write stream error: %s", err.message);
  }
};
