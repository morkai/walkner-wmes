// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var util = require('util');
var exec = require('child_process').exec;
var path = require('path');
var _ = require('lodash');
var step = require('h5.step');
var gm = require('gm');
var fs = require('fs-extra');

module.exports = function setUpOmr(app, module)
{
  var INPUT_DIR_CALM_PERIOD = app.options.env !== 'development' ? (30 * 1000) : (5 * 1000);
  var SURVEY_PAGE_COUNT = 2;
  var INPUT_FILE_RE = /^[0-9]+\.(?:jpe?g)$/i;

  var mongoose = app[module.config.mongooseId];
  var OpinionSurvey = mongoose.model('OpinionSurvey');
  var OpinionSurveyScanTemplate = mongoose.model('OpinionSurveyScanTemplate');
  var OpinionSurveyOmrResult = mongoose.model('OpinionSurveyOmrResult');
  var OpinionSurveyResponse = mongoose.model('OpinionSurveyResponse');

  var queuedInputDirs = {};
  var inputDirQueue = [];
  var currentInputDir = null;
  var cachedSurveys = {};
  var cachedScanTemplates = {};
  var currentSurveyId = null;
  var currentPageNumbers = [];

  app.broker.subscribe('directoryWatcher.changed')
    .setFilter(function(fileInfo) { return fileInfo.moduleId === module.config.directoryWatcherId; })
    .on('message', queueInputDir);

  function queueInputDir(fileInfo)
  {
    if (queuedInputDirs[fileInfo.fileName])
    {
      return;
    }

    step(
      function()
      {
        fs.stat(fileInfo.filePath, this.next());
      },
      function(err, stats)
      {
        if (err)
        {
          return module.error("[omr] Failed to stat input dir [%s]: %s", fileInfo.fileName, err.message);
        }

        if (stats.isDirectory())
        {
          queuedInputDirs[fileInfo.fileName] = true;

          inputDirQueue.push(fileInfo);

          module.debug("[omr] Queued a new input dir: %s", fileInfo.fileName);

          processNextInputDir();
        }
      }
    );
  }

  function processNextInputDir()
  {
    if (currentInputDir)
    {
      return;
    }

    var startedAt = Date.now();

    currentInputDir = inputDirQueue.shift();

    if (!currentInputDir)
    {
      return;
    }

    step(
      function calmDownStep()
      {
        module.debug("[omr] Waiting for input dir to calm down: %s", currentInputDir.fileName);

        waitForInputDirToCalmDown(currentInputDir.filePath, this.next());
      },
      function readDirStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        module.debug("[omr] Reading input dir: %s", currentInputDir.fileName);

        fs.readdir(currentInputDir.filePath, this.next());
      },
      function readConfigFileStep(err, files)
      {
        if (err)
        {
          return this.skip(err);
        }

        module.debug("[omr] Reading config file...");

        var next = this.next();

        fs.readFile(path.join(currentInputDir.filePath, 'config.json'), 'utf8', function(err, config)
        {
          try
          {
            config = JSON.parse(config);
          }
          catch (err) {}

          next(null, config || {}, files);
        });
      },
      function prepareInputScansStep(err, config, files)
      {
        if (err)
        {
          return this.skip(err);
        }

        var surveyPageCount = config.surveyPageCount || SURVEY_PAGE_COUNT;
        var inputFiles = files.filter(function(file) { return INPUT_FILE_RE.test(file); });
        var inputScans = _.chunk(inputFiles, surveyPageCount);
        var lastIndex = inputScans.length - 1;

        if (lastIndex !== -1 && inputScans[lastIndex].length !== surveyPageCount)
        {
          inputScans.pop();
        }

        this.inputScans = inputScans;

        setImmediate(this.next());
      },
      function processInputScansStep()
      {
        processNextInputScan(this.inputScans, this.next());
      },
      function readRemainingFilesStep()
      {
        module.debug("[omr] Reading files remaining in input dir: %s", currentInputDir.fileName);

        fs.readdir(currentInputDir.filePath, this.next());
      },
      function handleRemainingFilesStep(err, files)
      {
        if (!files)
        {
          files = [];
        }

        files = files.filter(function(file) { return INPUT_FILE_RE.test(file); });

        if (err || files.length)
        {
          module.debug("[omr] Moving files remaining in input dir: %s", currentInputDir.fileName);

          moveDir(
            currentInputDir.filePath,
            path.join(module.config.processingPath, currentInputDir.fileName),
            this.next()
          );
        }
        else
        {
          module.debug("[omr] Removing input dir: %s", currentInputDir.fileName);

          removeDir(currentInputDir.filePath, this.next());
        }
      },
      function finalizeStep(err)
      {
        if (err)
        {
          module.error("[omr] Failed to process input dir [%s]: %s", currentInputDir.fileName, err.message);
        }
        else
        {
          module.debug(
            "[omr] Finished processing input dir [%s] in %ds",
            currentInputDir.fileName,
            ((Date.now() - startedAt) / 1000).toFixed(3)
          );
        }

        delete queuedInputDirs[currentInputDir.fileName];

        currentInputDir = null;
        cachedSurveys = {};
        cachedScanTemplates = {};
        currentSurveyId = null;
        currentPageNumbers = [];

        setImmediate(processNextInputDir);
      }
    );
  }

  function waitForInputDirToCalmDown(inputDir, done)
  {
    fs.stat(inputDir, function(err, stats)
    {
      if (err)
      {
        return done(err);
      }

      if (Date.now() - stats.mtime.getTime() < INPUT_DIR_CALM_PERIOD)
      {
        return setTimeout(
          waitForInputDirToCalmDown,
          Math.round(INPUT_DIR_CALM_PERIOD / 3),
          inputDir,
          done
        );
      }

      return done(null);
    });
  }

  function moveDir(from, to, done)
  {
    var cmd;

    if (process.platform === 'win32')
    {
      cmd = util.format('robocopy "%s" "%s" /MOVE', from, path.join(to, path.dirname(from)));
    }
    else
    {
      cmd = util.format('mv -f "%s" "%s"', from, to);
    }

    exec(cmd, done);
  }

  function removeDir(dir, done)
  {
    exec(util.format(process.platform === 'win32' ? 'rmdir /S /Q "%s"' : 'rm -rf "%s"', dir), done || function() {});
  }

  function processNextInputScan(inputScans, done)
  {
    var inputScan = inputScans.shift();

    if (!inputScan)
    {
      return setImmediate(done);
    }

    var responseId = module.generateId();
    var results = [];
    var steps = [];

    _.forEach(inputScan, function(inputFileName, scanIndex)
    {
      steps.push(function processInputFileStep()
      {
        var next = this.next();

        processInputFile(inputFileName, scanIndex, responseId, function(err, result)
        {
          results.push(result);

          if (result.survey && result.pageNumber)
          {
            currentSurveyId = result.survey;
            currentPageNumbers[scanIndex] = result.pageNumber;
          }

          setImmediate(next);
        });
      });
    });

    steps.push(function handleResultsStep()
    {
      handleResults(results, this.next());
    });

    steps.push(processNextInputScan.bind(null, inputScans, done));

    step(steps);
  }

  function processInputFile(inputFileName, scanIndex, responseId, done)
  {
    var resultId = module.generateId();
    var extName = path.extname(inputFileName);
    var baseName = path.basename(inputFileName, extName);
    var inputFilePath = path.join(currentInputDir.filePath, inputFileName);
    var processingDirPath = path.join(module.config.processingPath, resultId);
    var processingFilePath = path.join(processingDirPath, inputFileName);
    var deskewedFilePath = path.join(processingDirPath, baseName + '.deskewed' + extName);
    var resizedFilePath = path.join(processingDirPath, baseName + '.resized' + extName);
    var result = {
      _id: resultId,
      inputDirName: currentInputDir.fileName,
      inputFileName: inputFileName,
      startedAt: new Date(),
      finishedAt: null,
      status: 'unrecognized',
      errorCode: null,
      errorMessage: null,
      response: responseId,
      qrCode: null,
      survey: null,
      pageNumber: 0,
      scanTemplate: null,
      omrInput: null,
      omrOutput: null,
      matchScore: 0,
      answers: {}
    };

    module.debug("[omr] [%s] Processing input file: %s", responseId, inputFileName);

    step(
      function createProcessingDirStep()
      {
        fs.mkdir(processingDirPath, this.next());
      },
      function handleCreateProcessingDirResultStep(err)
      {
        if (err)
        {
          result.errorCode = 'CREATE_PROCESSING_DIR_FAILURE';
          result.errorMessage = err.message;

          return this.skip();
        }
      },
      function moveInputFileStep()
      {
        fs.move(inputFilePath, processingFilePath, this.next());
      },
      function handleMoveInputFileResultStep(err)
      {
        if (err)
        {
          result.errorCode = 'MOVE_INPUT_FILE_FAILURE';
          result.errorMessage = err.message;

          return this.skip();
        }
      },
      function decodeQrCodeStep()
      {
        module.debug("[omr] [%s] Decoding the QR code: %s", responseId, inputFileName);

        module.decodeQrCode(processingFilePath, this.next());
      },
      function handleDecodeQrCodeResultStep(err, qrCodes)
      {
        if ((!Array.isArray(qrCodes) || !qrCodes.length) && currentSurveyId && currentPageNumbers[scanIndex])
        {
          result.qrCode = currentSurveyId + '/' + currentPageNumbers[scanIndex];

          module.debug(
            "[omr] [%s] Failed to decode QR code for [%s]. Using the previous survey [%s] and page number [%d].",
            responseId,
            inputFileName,
            currentSurveyId,
            currentPageNumbers[scanIndex]
          );

          return;
        }

        if (err)
        {
          result.errorCode = 'DECODE_QR_CODE_FAILURE';
          result.errorMessage = err.message;

          return this.skip();
        }

        if (!qrCodes.length)
        {
          result.errorCode = 'DECODE_QR_CODE_FAILURE';
          result.errorMessage = "No QR codes detected.";

          return this.skip();
        }

        result.qrCode = qrCodes[0];
      },
      function parseSurveyAndPageNumberStep()
      {
        var matches = result.qrCode.replace(/[^a-z0-9-_/]+/ig, '').match(/(?:^http.*?\/r\/|^)(.*?)\/([0-9]+)/);

        if (matches === null)
        {
          module.debug(
            "[omr] [%s] Invalid QR code for [%s]: %s. Using the previous survey [%s] and page number [%d].",
            responseId,
            inputFileName,
            result.qrCode,
            currentSurveyId,
            currentPageNumbers[scanIndex]
          );

          result.survey = currentSurveyId;
          result.pageNumber = currentPageNumbers[scanIndex] || 0;
        }
        else
        {
          result.survey = matches[1];
          result.pageNumber = parseInt(matches[2], 10);

          if (result.survey === '1')
          {
            result.survey = '2015-07';
          }
        }

        if (!result.survey || !result.pageNumber)
        {
          result.errorCode = 'DECODE_QR_CODE_FAILURE';
          result.errorMessage = "No survey ID and page number.";

          return this.skip();
        }
      },
      function getScanTemplatesStep()
      {
        if (!cachedScanTemplates[result.survey])
        {
          cachedScanTemplates[result.survey] = {};
        }

        var surveyScanTemplates = cachedScanTemplates[result.survey];

        if (surveyScanTemplates[result.pageNumber])
        {
          return setImmediate(this.next(), null, surveyScanTemplates[result.pageNumber]);
        }

        OpinionSurveyScanTemplate
          .find({survey: result.survey, pageNumber: result.pageNumber})
          .lean()
          .exec(this.next());
      },
      function cacheScanTemplatesStep(err, scanTemplates)
      {
        if (err)
        {
          result.errorCode = 'FIND_SCAN_TEMPLATES_FAILURE';
          result.errorMessage = err.message;

          return this.skip();
        }

        cachedScanTemplates[result.survey][result.pageNumber] = scanTemplates;

        if (!scanTemplates.length)
        {
          result.errorCode = 'FIND_SCAN_TEMPLATES_FAILURE';
          result.errorMessage = "No scan templates found for the detected survey and page.";

          return this.skip();
        }
      },
      function deskewInputImageStep()
      {
        module.debug("[omr] [%s] Deskewing the input image: %s", responseId, inputFileName);

        module.deskewImage(processingFilePath, deskewedFilePath, this.next());
      },
      function handleDeskewInputImageResultStep(err)
      {
        if (err)
        {
          result.errorCode = 'DESKEW_FAILURE';
          result.errorMessage = err.message;

          return this.skip();
        }
      },
      function resizeInputImageStep()
      {
        module.debug("[omr] [%s] Resizing the input image: %s", responseId, inputFileName);

        gm(deskewedFilePath)
          .autoOrient()
          .quality(100)
          .resize(1280)
          .noProfile()
          .write(resizedFilePath, this.next());
      },
      function recognizeMarksStep()
      {
        recognizeMarksUsingNextTemplate(
          result,
          resizedFilePath,
          [].concat(cachedScanTemplates[result.survey][result.pageNumber]),
          this.next()
        );
      },
      function()
      {
        result.finishedAt = new Date();

        setImmediate(done, null, result);
      }
    );
  }

  function recognizeMarksUsingNextTemplate(result, inputFilePath, scanTemplates, done)
  {
    var scanTemplate = scanTemplates.shift();

    if (!scanTemplate)
    {
      result.errorCode = 'LOW_SCORE';

      return setImmediate(done);
    }

    var scanTemplateId = scanTemplate._id.toString();
    var omrInput = createOmrInput(result, inputFilePath, scanTemplate);

    module.debug(
      "[omr] [%s] Recognizing marks using template [%s] in: %s",
      result.response,
      scanTemplateId,
      result.inputFileName
    );

    module.recognizeMarks(omrInput, function(err, omrOutput)
    {
      if (err)
      {
        result.errorCode = 'OMR_FAILURE';
        result.errorMessage = err.message;

        return done();
      }

      var answers = {};
      var matchScore = calculateMatchScore(omrOutput, scanTemplate.regions, answers);

      module.debug(
        "[omr] [%s] Recognized %d of %d options (%d%) using template [%s] in: %s",
        result.response,
        matchScore.actual,
        matchScore.required,
        (matchScore.ratio * 100).toFixed(2),
        scanTemplateId,
        result.inputFileName
      );

      if (matchScore.ratio >= result.matchScore)
      {
        result.errorCode = null;
        result.errorMessage = null;
        result.scanTemplate = scanTemplate;
        result.omrInput = omrInput;
        result.omrOutput = omrOutput;
        result.matchScore = matchScore.ratio;
        result.answers = answers;
      }

      if (matchScore.ratio === 1)
      {
        var missingAnswers = [];

        _.forEach(answers, function(answer, question)
        {
          if (answer === null)
          {
            missingAnswers.push(question);
          }
        });

        if (missingAnswers.length)
        {
          result.errorCode = 'MISSING_ANSWERS';
          result.errorMessage = "No answers for questions: " + missingAnswers.join(', ');

          if (!scanTemplates.length)
          {
            return setImmediate(done);
          }
        }
        else
        {
          result.errorCode = null;
          result.errorMessage = null;
          result.status = 'recognized';

          return setImmediate(done);
        }
      }

      return setImmediate(
        recognizeMarksUsingNextTemplate,
        result,
        inputFilePath,
        scanTemplates,
        done
      );
    });
  }

  function createOmrInput(result, inputFilePath, scanTemplate)
  {
    return {
      dp: scanTemplate.dp,
      minDist: scanTemplate.minimumDistance,
      canny: scanTemplate.cannyThreshold,
      accu: scanTemplate.circleAccumulatorThreshold,
      minR: scanTemplate.minimumRadius,
      maxR: scanTemplate.maximumRadius,
      filled: scanTemplate.filledThreshold,
      marked: scanTemplate.markedThreshold,
      regions: scanTemplate.regions.map(function(region)
      {
        return {
          type: region.question === 'comment' ? 'image' : 'circles',
          x: region.left,
          y: region.top,
          w: region.width,
          h: region.height
        };
      }),
      input: inputFilePath,
      output: path.join(module.config.processingPath, result._id, scanTemplate._id.toString())
    };
  }

  function calculateMatchScore(omrRegions, templateRegions, answers)
  {
    var requiredMatchCount = templateRegions.map(function(templateRegion)
    {
      return templateRegion.question === 'comment' ? 1 : templateRegion.options.length;
    });
    var actualMatchCount = [];
    var questionToRegionIndexes = {};

    _.forEach(omrRegions, function(omrRegion, regionIndex)
    {
      var templateRegion = templateRegions[regionIndex];
      var question = templateRegion.question;

      if (answers[question] === undefined)
      {
        questionToRegionIndexes[question] = [];
        answers[question] = null;
      }

      questionToRegionIndexes[question].push(regionIndex);

      if (omrRegion.type === 'image')
      {
        actualMatchCount.push(1);

        answers[question] = '';

        return;
      }

      if (omrRegion.type === 'circles')
      {
        var marked = omrRegion.marked;

        if (marked.length > 1)
        {
          marked = ignoreWronglyMarkedCircles(omrRegion.circles, marked);
        }

        actualMatchCount.push(
          marked.length === 1 || answers[question] !== null
            ? requiredMatchCount[actualMatchCount.length]
            : omrRegion.circles.length
        );

        if (answers[question] !== null)
        {
          return;
        }

        if (marked.length === 1)
        {
          var answer = templateRegion.options[marked[0]];

          if (answer)
          {
            answers[question] = answer;
          }
        }
      }
    });

    _.forEach(questionToRegionIndexes, function(regionIndexes, question)
    {
      if (answers[question] === null)
      {
        return;
      }

      _.forEach(regionIndexes, function(regionIndex)
      {
        actualMatchCount[regionIndex] = requiredMatchCount[regionIndex];
      });
    });

    var matchScoreNum = 0;
    var matchScoreDen = 0;

    _.forEach(requiredMatchCount, function(requiredCount, i)
    {
      matchScoreNum += actualMatchCount[i];
      matchScoreDen += requiredCount;
    });

    var matchScore = matchScoreNum / matchScoreDen;

    if (isNaN(matchScore) || matchScore > 1)
    {
      matchScore = -1;
    }

    return {
      actual: matchScoreNum,
      required: matchScoreDen,
      ratio: matchScore
    };
  }

  function ignoreWronglyMarkedCircles(circles, wronglyMarked)
  {
    var markedCircles = [];

    _.forEach(circles, function(circle, i)
    {
      if (_.includes(wronglyMarked, i))
      {
        markedCircles.push({
          ratio: circle.blackPixels / circle.allPixels,
          index: i
        });
      }
    });

    markedCircles.sort(function(a, b)
    {
      return b.ratio - a.ratio;
    });

    var mostBlackRatio = markedCircles[0].ratio;
    var secondMostBlackRatio = markedCircles[1].ratio;
    var ratioDifference = mostBlackRatio - secondMostBlackRatio;

    return ratioDifference >= 0.15 ? [markedCircles[0].index] : wronglyMarked;
  }

  function handleResults(results, done)
  {
    if (!results.length)
    {
      return done();
    }

    step(
      function insertOmrResultsStep()
      {
        OpinionSurveyOmrResult.create(results, this.next());
      },
      function handleInsertOmrResultsResultStep(err)
      {
        if (err)
        {
          module.error("[omr] Failed to insert OMR results: %s", err.message);
        }
      },
      function findSurveyStep()
      {
        var surveyId = results[0].survey;

        if (!surveyId)
        {
          return setImmediate(this.next(), null, null);
        }

        if (cachedSurveys[surveyId])
        {
          return setImmediate(this.next(), null, cachedSurveys[surveyId]);
        }

        OpinionSurvey.findById(surveyId).lean().exec(this.next());
      },
      function handleFindSurveyResultStep(err, survey)
      {
        if (err)
        {
          return this.skip(new Error("[omr] Failed to find survey: " + err.message));
        }

        if (!survey)
        {
          return this.skip();
        }

        this.survey = survey;
      },
      function createResponseStep()
      {
        var questions = this.survey.questions;
        var response = {
          _id: results[0].response,
          survey: this.survey._id,
          createdAt: new Date(),
          creator: {label: 'System'},
          comment: '',
          employer: null,
          division: null,
          superior: null,
          answers: new Array(questions.length)
        };

        for (var r = 0; r < results.length; ++r)
        {
          var answers = results[r].answers;

          if (!answers)
          {
            continue;
          }

          if (answers.employer)
          {
            response.employer = answers.employer;
          }

          if (answers.superior)
          {
            response.superior = answers.superior;
          }

          for (var q = 0; q < questions.length; ++q)
          {
            var question = questions[q];

            if (!response.answers[q])
            {
              response.answers[q] = {
                question: question._id,
                answer: 'null'
              };
            }

            if (answers[question._id])
            {
              response.answers[q].answer = answers[question._id];
            }
          }
        }

        var superior = _.find(this.survey.superiors, {_id: response.superior});

        if (superior)
        {
          response.division = superior.division;
        }

        OpinionSurveyResponse.create(response, this.next());
      },
      function handleCreateResponseResultStep(err, response)
      {
        if (err)
        {
          module.error(
            "[omr] [%s] Failed to insert a new response created from the OMR results: %s",
            results[0].response,
            err.message
          );
        }
        else if (response)
        {
          module.debug("[omr] [%s] response created!", results[0].response);

          cleanUpProcessingFiles(results);
        }

        return done();
      }
    );
  }

  function cleanUpProcessingFiles(results)
  {
    step(
      function()
      {
        this.processingDirPaths = [];

        for (var i = 0; i < results.length; ++i)
        {
          var result = results[i];
          var processingDirPath = path.join(module.config.processingPath, result._id);
          var fromInputFilePath = result.omrOutput
            ? path.join(processingDirPath, result.scanTemplate._id.toString(), 'input.jpg')
            : path.join(processingDirPath, result.inputFileName);
          var toInputFilePath = path.join(module.config.responsesPath, result._id + '.jpg');

          fs.move(fromInputFilePath, toInputFilePath, this.group());

          if (!result.errorCode)
          {
            this.processingDirPaths.push(processingDirPath);
          }
        }
      },
      function(err)
      {
        if (err)
        {
          module.error("[omr] [%s] Failed to clean up the processing files: %s", results[0].response, err.message);
        }

        _.forEach(this.processingDirPaths, function(dirPath)
        {
          removeDir(dirPath);
        });
      }
    );
  }
};
