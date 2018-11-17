// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const util = require('util');
const exec = require('child_process').exec;
const path = require('path');
const _ = require('lodash');
const step = require('h5.step');
const gm = require('gm');
const fs = require('fs-extra');

module.exports = function setUpOmr(app, module)
{
  const INPUT_DIR_CALM_PERIOD = app.options.env !== 'development' ? (30 * 1000) : (5 * 1000);
  const MAX_PARALLEL_PROCESSING = app.options.env !== 'development' ? 1 : 3;
  const SURVEY_PAGE_COUNT = 2;
  const INPUT_FILE_RE = /[0-9]+\.(?:jpe?g)$/i;

  const mongoose = app[module.config.mongooseId];
  const OpinionSurvey = mongoose.model('OpinionSurvey');
  const OpinionSurveyScanTemplate = mongoose.model('OpinionSurveyScanTemplate');
  const OpinionSurveyOmrResult = mongoose.model('OpinionSurveyOmrResult');
  const OpinionSurveyResponse = mongoose.model('OpinionSurveyResponse');

  const queuedInputDirs = {};
  const inputDirQueue = [];
  let currentInputDir = null;
  let cachedSurveys = {};
  let cachedScanTemplates = {};
  let currentSurveyId = null;
  let currentPageNumbers = [];

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
          return module.error('[omr] Failed to stat input dir [%s]: %s', fileInfo.fileName, err.message);
        }

        if (stats.isDirectory())
        {
          queuedInputDirs[fileInfo.fileName] = true;

          inputDirQueue.push(fileInfo);

          module.debug('[omr] Queued a new input dir: %s', fileInfo.fileName);

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

    const startedAt = Date.now();

    currentInputDir = inputDirQueue.shift();

    if (!currentInputDir)
    {
      return;
    }

    step(
      function calmDownStep()
      {
        module.debug('[omr] Waiting for input dir to calm down: %s', currentInputDir.fileName);

        waitForInputDirToCalmDown(currentInputDir.filePath, this.next());
      },
      function readDirStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        module.debug('[omr] Reading input dir: %s', currentInputDir.fileName);

        fs.readdir(currentInputDir.filePath, this.next());
      },
      function readConfigFileStep(err, files)
      {
        if (err)
        {
          return this.skip(err);
        }

        module.debug('[omr] Reading config file...');

        const next = this.next();

        // eslint-disable-next-line handle-callback-err
        fs.readFile(path.join(currentInputDir.filePath, 'config.json'), 'utf8', function(err, config)
        {
          try
          {
            config = JSON.parse(config);
          }
          catch (err) {} // eslint-disable-line no-empty

          next(null, config || {}, files);
        });
      },
      function prepareInputScansStep(err, config, files)
      {
        if (err)
        {
          return this.skip(err);
        }

        const surveyPageCount = config.surveyPageCount || SURVEY_PAGE_COUNT;
        const inputFiles = files.filter(function(file) { return INPUT_FILE_RE.test(file); });
        const inputScans = _.chunk(inputFiles, surveyPageCount);
        const lastIndex = inputScans.length - 1;

        if (lastIndex !== -1 && inputScans[lastIndex].length !== surveyPageCount)
        {
          inputScans.pop();
        }

        this.config = config;
        this.inputScans = inputScans;

        setImmediate(this.next());
      },
      function processInputScansStep()
      {
        for (let i = 0; i < MAX_PARALLEL_PROCESSING; ++i)
        {
          processNextInputScan(this.inputScans, this.config, this.group());
        }
      },
      function readRemainingFilesStep()
      {
        module.debug('[omr] Reading files remaining in input dir: %s', currentInputDir.fileName);

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
          module.debug('[omr] Moving files remaining in input dir: %s', currentInputDir.fileName);

          moveDir(
            currentInputDir.filePath,
            path.join(module.config.processingPath, currentInputDir.fileName),
            this.next()
          );
        }
        else
        {
          module.debug('[omr] Removing input dir: %s', currentInputDir.fileName);

          removeDir(currentInputDir.filePath, this.next());
        }
      },
      function finalizeStep(err)
      {
        if (err)
        {
          module.error('[omr] Failed to process input dir [%s]: %s', currentInputDir.fileName, err.message);
        }
        else
        {
          module.debug(
            '[omr] Finished processing input dir [%s] in %ds',
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
    let cmd;

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

  function processNextInputScan(inputScans, config, done)
  {
    const inputScan = inputScans.shift();

    if (!inputScan)
    {
      return setImmediate(done);
    }

    const responseId = module.generateId();
    const results = [];
    const steps = [];

    _.forEach(inputScan, function(inputFileName, scanIndex)
    {
      steps.push(function processInputFileStep()
      {
        const next = this.next();

        processInputFile(inputFileName, scanIndex, responseId, config, function(err, result)
        {
          if (!err && result)
          {
            results.push(result);

            if (result.survey && result.pageNumber)
            {
              currentSurveyId = result.survey;
              currentPageNumbers[scanIndex] = result.pageNumber;
            }
          }

          setImmediate(next);
        });
      });
    });

    steps.push(function handleResultsStep()
    {
      handleResults(results, this.next());
    });

    steps.push(processNextInputScan.bind(null, inputScans, config, done));

    step(steps);
  }

  function processInputFile(inputFileName, scanIndex, responseId, config, done)
  {
    const resultId = module.generateId();
    const extName = path.extname(inputFileName);
    const baseName = path.basename(inputFileName, extName);
    const inputFilePath = path.join(currentInputDir.filePath, inputFileName);
    const processingDirPath = path.join(module.config.processingPath, resultId);
    const processingFilePath = path.join(processingDirPath, inputFileName);
    const deskewedFilePath = path.join(processingDirPath, baseName + '.deskewed' + extName);
    const resizedFilePath = path.join(processingDirPath, baseName + '.resized' + extName);
    const result = {
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

    module.debug('[omr] [%s] Processing input file: %s', responseId, inputFileName);

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
        fs.move(inputFilePath, processingFilePath, {overwrite: true}, this.next());
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
        module.debug('[omr] [%s] Decoding the QR code: %s', responseId, inputFileName);

        module.decodeQrCode(processingFilePath, this.next());
      },
      function handleDecodeQrCodeResultStep(err, qrCodes)
      {
        if (config.qrCode)
        {
          result.qrCode = config.qrCode;

          return;
        }

        if ((!Array.isArray(qrCodes) || !qrCodes.length) && currentSurveyId && currentPageNumbers[scanIndex])
        {
          result.qrCode = currentSurveyId + '/' + currentPageNumbers[scanIndex];

          module.debug(
            '[omr] [%s] Failed to decode QR code for [%s]. Using the previous survey [%s] and page number [%d].',
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
          result.errorMessage = 'No QR codes detected.';

          return this.skip();
        }

        result.qrCode = qrCodes[0];
      },
      function parseSurveyAndPageNumberStep()
      {
        const matches = result.qrCode.replace(/[^a-z0-9-_/]+/ig, '').match(/(?:^http.*?\/r\/|^)(.*?)\/([0-9]+)/);

        if (matches === null)
        {
          module.debug(
            '[omr] [%s] Invalid QR code for [%s]: %s. Using the previous survey [%s] and page number [%d].',
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
          result.errorMessage = 'No survey ID and page number.';

          return this.skip();
        }
      },
      function getScanTemplatesStep()
      {
        if (!cachedScanTemplates[result.survey])
        {
          cachedScanTemplates[result.survey] = {};
        }

        const surveyScanTemplates = cachedScanTemplates[result.survey];

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
          result.errorMessage = 'No scan templates found for the detected survey and page.';

          return this.skip();
        }
      },
      function deskewInputImageStep()
      {
        module.debug('[omr] [%s] Deskewing the input image: %s', responseId, inputFileName);

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
        module.debug('[omr] [%s] Resizing the input image: %s', responseId, inputFileName);

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
    const scanTemplate = scanTemplates.shift();

    if (!scanTemplate)
    {
      result.errorCode = 'LOW_SCORE';

      return setImmediate(done);
    }

    const scanTemplateId = scanTemplate._id.toString();
    const omrInput = createOmrInput(result, inputFilePath, scanTemplate);

    module.debug(
      '[omr] [%s] Recognizing marks using template [%s] in: %s',
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

      const answers = {};
      const matchScore = calculateMatchScore(omrOutput, scanTemplate.regions, answers);

      module.debug(
        '[omr] [%s] Recognized %d of %d options (%d%) using template [%s] in: %s',
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
        const missingAnswers = [];

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
          result.errorMessage = 'No answers for questions: ' + missingAnswers.join(', ');

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
    const requiredMatchCount = templateRegions.map(function(templateRegion)
    {
      return templateRegion.question === 'comment' ? 1 : templateRegion.options.length;
    });
    const actualMatchCount = [];
    const questionToRegionIndexes = {};

    _.forEach(omrRegions, function(omrRegion, regionIndex)
    {
      const templateRegion = templateRegions[regionIndex];
      const question = templateRegion.question;

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
        let marked = omrRegion.marked;

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
          const answer = templateRegion.options[marked[0]];

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

    let matchScoreNum = 0;
    let matchScoreDen = 0;

    _.forEach(requiredMatchCount, function(requiredCount, i)
    {
      matchScoreNum += actualMatchCount[i];
      matchScoreDen += requiredCount;
    });

    let matchScore = matchScoreNum / matchScoreDen;

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
    const markedCircles = [];

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

    const mostBlackRatio = markedCircles[0].ratio;
    const secondMostBlackRatio = markedCircles[1].ratio;
    const ratioDifference = mostBlackRatio - secondMostBlackRatio;

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
          module.error('[omr] Failed to insert OMR results: %s', err.message);
        }
      },
      function findSurveyStep()
      {
        const surveyId = results[0].survey;

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
          return this.skip(new Error('[omr] Failed to find survey: ' + err.message));
        }

        if (!survey)
        {
          return this.skip();
        }

        this.survey = survey;
      },
      function createResponseStep()
      {
        const questions = this.survey.questions;
        const response = {
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

        for (let r = 0; r < results.length; ++r)
        {
          const answers = results[r].answers;

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

          for (let q = 0; q < questions.length; ++q)
          {
            const question = questions[q];

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

        const superior = _.find(this.survey.superiors, {_id: response.superior});

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
            '[omr] [%s] Failed to insert a new response created from the OMR results: %s',
            results[0].response,
            err.message
          );
        }
        else if (response)
        {
          module.debug('[omr] [%s] response created!', results[0].response);

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

        for (let i = 0; i < results.length; ++i)
        {
          const result = results[i];
          const processingDirPath = path.join(module.config.processingPath, result._id);
          const fromInputFilePath = result.omrOutput
            ? path.join(processingDirPath, result.scanTemplate._id.toString(), 'input.jpg')
            : path.join(processingDirPath, result.inputFileName);
          const toInputFilePath = path.join(module.config.responsesPath, result._id + '.jpg');

          fs.move(fromInputFilePath, toInputFilePath, {overwrite: true}, this.group());

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
          module.error('[omr] [%s] Failed to clean up the processing files: %s', results[0].response, err.message);
        }

        _.forEach(this.processingDirPaths, function(dirPath)
        {
          removeDir(dirPath);
        });
      }
    );
  }
};
