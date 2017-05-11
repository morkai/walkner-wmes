// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');

module.exports = function setUpOrderDocumentsTree(app, module)
{
  const mongoose = app[module.config.mongooseId];
  const OrderDocumentFile = mongoose.model('OrderDocumentFile');
  const OrderDocumentFolder = mongoose.model('OrderDocumentFolder');
  const OrderDocumentUpload = mongoose.model('OrderDocumentUpload');

  const notifyFilesUploaded = _.debounce(
    app.broker.publish.bind(app.broker, 'orderDocuments.tree.filesUploaded'),
    1000
  );

  module.tree = {

    addFiles,
    editFile,
    unlinkFile,
    unlinkFiles,
    removeFile,
    removeFiles,
    recoverFile,
    purgeFile,
    addFolder,
    removeFolder,
    moveFolder,
    renameFolder,
    recoverFolder

  };

  function addFiles(params, user, done)
  {
    const filesToAdd = [];
    const nc15ToFilesMap = {};
    const idToFolderMap = {};

    _.forEach(params.files, function(file)
    {
      if (!_.isString(file.upload)
        || !file.upload.length
        || !_.isString(file.folder)
        || !file.folder.length
        || !_.isString(file.nc15)
        || !/^[0-9]{15}$/.test(file.nc15)
        || !_.isString(file.date)
        || !_.isString(file.hash)
        || !/^[a-f0-9]{32}$/.test(file.hash)
        || !_.isString(file.name))
      {
        return;
      }

      const date = moment(file.date, 'YYYY-MM-DD');

      if (date.isValid())
      {
        filesToAdd.push(file);

        if (!nc15ToFilesMap[file.nc15])
        {
          nc15ToFilesMap[file.nc15] = [];
        }

        nc15ToFilesMap[file.nc15].push(file);

        idToFolderMap[file.folder] = false;
      }
    });

    if (!filesToAdd.length)
    {
      return done(app.createError('NO_FILES', 400));
    }

    step(
      function()
      {
        OrderDocumentFile
          .find({_id: {$in: Object.keys(nc15ToFilesMap)}})
          .exec(this.parallel());

        OrderDocumentFolder
          .find({_id: {$in: Object.keys(idToFolderMap)}}, {parent: 1})
          .lean()
          .exec(this.parallel());
      },
      function(err, orderDocumentFiles, orderDocumentFolders)
      {
        if (err)
        {
          return this.skip(err);
        }

        orderDocumentFolders
          .filter(folder => folder.parent !== '__TRASH__')
          .forEach(folder => idToFolderMap[folder._id] = true);

        orderDocumentFiles.forEach(file => addFile(file, nc15ToFilesMap, idToFolderMap, user, this.group()));

        _.forEach(nc15ToFilesMap, filesToAdd =>
        {
          const fileToAdd = filesToAdd[0];
          const orderDocumentFile = new OrderDocumentFile({
            _id: fileToAdd.nc15,
            name: fileToAdd.name,
            folders: [],
            files: [],
            oldFolders: null
          });

          addFile(orderDocumentFile, nc15ToFilesMap, idToFolderMap, user, this.group());
        });
      },
      done
    );
  }

  function addFile(orderDocumentFile, nc15ToFilesMap, idToFolderMap, user, done)
  {
    var filesToAdd = nc15ToFilesMap[orderDocumentFile._id].filter(f => idToFolderMap[f.folder]);

    delete nc15ToFilesMap[orderDocumentFile._id];

    filesToAdd.forEach(fileToAdd =>
    {
      if (!orderDocumentFile.folders.includes(fileToAdd.folder))
      {
        orderDocumentFile.folders.push(fileToAdd.folder);
      }

      const date = moment.utc(fileToAdd.date, 'YYYY-MM-DD').toDate();

      orderDocumentFile.files = orderDocumentFile.files.filter(
        f => f.hash !== fileToAdd.hash && f.date.getTime() !== date.getTime()
      );

      orderDocumentFile.files.push({
        hash: fileToAdd.hash,
        type: 'application/pdf',
        date: date.toISOString()
      });

      orderDocumentFile.name = fileToAdd.name;
    });

    const isNew = orderDocumentFile.isNew;

    orderDocumentFile.files.sort((a, b) => b.date - a.date);

    orderDocumentFile.save(function(err)
    {
      if (err)
      {
        return done(err);
      }

      app.broker.publish(`orderDocuments.tree.${isNew ? 'fileAdded' : 'fileEdited'}`, {
        file: orderDocumentFile,
        user: user,
        uploadId: filesToAdd.map(f => f.upload)
      });

      createUploads(filesToAdd);

      done();
    });
  }

  function createUploads(addedFiles)
  {
    OrderDocumentUpload.create(addedFiles.map(f => ({_id: f.hash, nc15: f.nc15, count: 0})), function(err)
    {
      if (err)
      {
        module.error(`[tree] Failed to save uploads: ${err.message}`);
      }
      else
      {
        notifyFilesUploaded();
      }
    });
  }

  function editFile(params, user, done)
  {
    step(
      function()
      {
        OrderDocumentFile.findById(params.fileId).exec(this.next());
      },
      function(err, file)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!file)
        {
          return this.skip(app.createError('NOT_FOUND', 400));
        }

        const changes = params.changes;

        if (Array.isArray(changes.files))
        {
          changes.files = changes.files.filter(function(f)
          {
            return !isNaN(Date.parse(f.date))
              && /^[a-f0-9]{32}$/.test(f.hash)
              && /^[a-z0-9]{1,30}\/[a-z0-9]{1,100}$/.test(f.type);
          });

          changes.files.sort(function(a, b)
          {
            return Date.parse(b.date) - Date.parse(a.date);
          });
        }

        file.set(changes);
        file.save(this.next());
      },
      function(err, file)
      {
        if (err)
        {
          return done(err);
        }

        if (file)
        {
          app.broker.publish('orderDocuments.tree.fileEdited', {
            file: file,
            user: user
          });
        }

        done();
      }
    );
  }

  function unlinkFile(params, user, done)
  {
    step(
      function()
      {
        if (params.file && params.file instanceof OrderDocumentFile)
        {
          setImmediate(this.next(), null, params.file);
        }
        else
        {
          OrderDocumentFile.findById(params.fileId).exec(this.next());
        }
      },
      function(err, file)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!file)
        {
          return this.skip(app.createError('NOT_FOUND', 400));
        }

        if (!_.includes(file.folders, params.folderId))
        {
          return this.skip(app.createError('INVALID_FOLDER', 400));
        }

        file.folders = file.folders.filter(folderId => folderId !== params.folderId);

        file.save(this.next());
      },
      function(err, file)
      {
        if (err)
        {
          return done(err);
        }

        if (file)
        {
          app.broker.publish('orderDocuments.tree.fileUnlinked', {
            file: file,
            folderId: params.folderId,
            user: user
          });
        }

        done();
      }
    );
  }

  function unlinkFiles(params, user, done)
  {
    const fileIds = _.filter(params.fileIds, fileId => _.isString(fileId) && !_.isEmpty(fileId));

    if (_.isEmpty(fileIds))
    {
      return done(app.createError('INVALID_FILE_IDS'));
    }

    step(
      function()
      {
        OrderDocumentFile.find({_id: {$in: fileIds}}, {folders: 1}).exec(this.next());
      },
      function(err, files)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (_.isEmpty(files))
        {
          return this.skip(app.createError('NOT_FOUND', 400));
        }

        this.unlinkedFileIds = [];
        this.removedFileIds = [];

        files.forEach(file =>
        {
          if (file.folders.length > 1)
          {
            const next = this.group();

            unlinkFile({file, folderId: params.folderId}, user, err =>
            {
              if (!err)
              {
                this.unlinkedFileIds.push(file._id);
              }

              next();
            });
          }
          else if (params.remove && file.folders.length === 1)
          {
            const next = this.group();

            removeFile({file}, user, err =>
            {
              if (!err)
              {
                this.removedFileIds.push(file._id);
              }

              next();
            });
          }
        });
      },
      function(err)
      {
        if (err)
        {
          return done(err);
        }

        if (this.unlinkedFileIds.length || this.removedFileIds.length)
        {
          app.broker.publish('orderDocuments.tree.filesUnlinked', {
            unlinkedFileIds: this.unlinkedFileIds,
            removedFileIds: this.removedFileIds,
            folderId: params.folderId,
            user: user
          });
        }

        done();
      }
    );
  }

  function removeFile(params, user, done)
  {
    step(
      function()
      {
        if (params.file && params.file instanceof OrderDocumentFile)
        {
          setImmediate(this.next(), null, params.file);
        }
        else
        {
          OrderDocumentFile.findById(params.fileId).exec(this.next());
        }
      },
      function(err, file)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!file)
        {
          return this.skip(app.createError('NOT_FOUND', 400));
        }

        file.set({
          folders: ['__TRASH__'],
          oldFolders: file.folders
        });
        file.save(this.next());
      },
      function(err, file)
      {
        if (err)
        {
          return done(err);
        }

        if (file)
        {
          app.broker.publish('orderDocuments.tree.fileRemoved', {file, user});
        }

        done();
      }
    );
  }

  function removeFiles(params, user, done)
  {
    const fileIds = _.filter(params.fileIds, fileId => _.isString(fileId) && !_.isEmpty(fileId));

    if (_.isEmpty(fileIds))
    {
      return done(app.createError('INVALID_FILE_IDS'));
    }

    step(
      function()
      {
        OrderDocumentFile.find({_id: {$in: fileIds}}).exec(this.next());
      },
      function(err, files)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (_.isEmpty(files))
        {
          return this.skip(app.createError('NOT_FOUND', 400));
        }

        files.forEach(file => removeFile({file}, user, this.group()));
      },
      function(err)
      {
        if (err)
        {
          return done(err);
        }

        app.broker.publish('orderDocuments.tree.filesRemoved', {fileIds: fileIds, user});

        done();
      }
    );
  }

  function recoverFile(params, user, done)
  {
    step(
      function()
      {
        OrderDocumentFile.findById(params.fileId).exec(this.next());
      },
      function(err, file)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!file)
        {
          return this.skip(app.createError('NOT_FOUND', 400));
        }

        file.set({
          folders: file.oldFolders,
          oldFolders: null
        });
        file.save(this.next());
      },
      function(err, file)
      {
        if (err)
        {
          return done(err);
        }

        if (file)
        {
          app.broker.publish('orderDocuments.tree.fileRecovered', {file, user});
        }

        done();
      }
    );
  }

  function purgeFile(params, user, done)
  {
    step(
      function()
      {
        OrderDocumentFile.findById(params.fileId).exec(this.next());
      },
      function(err, file)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!file)
        {
          return this.skip(app.createError('NOT_FOUND', 400));
        }

        file.remove(this.next());
      },
      function(err, file)
      {
        if (err)
        {
          return done(err);
        }

        if (file)
        {
          app.broker.publish('orderDocuments.tree.filePurged', {file, user});
        }

        done();
      }
    );
  }

  function addFolder(params, user, done)
  {
    step(
      function()
      {
        new OrderDocumentFolder(params.folder).save(this.next());
      },
      function(err, folder)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.folder = folder;

        if (folder.parent)
        {
          OrderDocumentFolder.update(
            {_id: folder.parent},
            {$addToSet: {children: folder._id}},
            this.next()
          );
        }
      },
      function(err)
      {
        if (err)
        {
          return done(err);
        }

        if (this.folder)
        {
          app.broker.publish('orderDocuments.tree.folderAdded', {
            folder: this.folder,
            user: user
          });
        }

        done();
      }
    );
  }

  // TODO: Decide what to do with children
  function removeFolder(params, user, done)
  {
    step(
      function()
      {
        OrderDocumentFolder.findById(params.folderId).exec(this.next());
      },
      function(err, folder)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!folder)
        {
          return this.skip(app.createError('NOT_FOUND', 400));
        }

        folder.set({
          parent: '__TRASH__',
          oldParent: folder.parent
        });
        folder.save(this.parallel());

        OrderDocumentFolder.update({_id: '__TRASH__'}, {$addToSet: {children: folder._id}}, this.parallel());

        if (folder.oldParent)
        {
          OrderDocumentFolder.update({_id: folder.oldParent}, {$pull: {children: folder._id}}, this.parallel());
        }
      },
      function(err, folder)
      {
        if (err)
        {
          return done(err);
        }

        if (folder)
        {
          app.broker.publish('orderDocuments.tree.folderRemoved', {folder, user});
        }

        done();
      }
    );
  }

  function moveFolder(params, user, done)
  {
    step(
      function()
      {
        OrderDocumentFolder.findById(params.folderId).exec(this.parallel());

        if (params.parentId)
        {
          OrderDocumentFolder.findById(params.parentId, {_id: 1}).lean().exec(this.parallel());
        }
      },
      function(err, folder, newParentFolder)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!folder || (params.parentId && !newParentFolder))
        {
          return this.skip(app.createError('NOT_FOUND', 400));
        }

        this.newParentId = params.parentId;
        this.oldParentId = folder.parent;

        folder.set({
          parent: this.newParentId,
          oldParent: null
        });
        folder.save(this.parallel());

        if (this.newParentId)
        {
          OrderDocumentFolder.update({_id: this.newParentId}, {$addToSet: {children: folder._id}}, this.parallel());
        }

        if (this.oldParentId)
        {
          OrderDocumentFolder.update({_id: this.oldParentId}, {$pull: {children: folder._id}}, this.parallel());
        }
      },
      function(err, folder)
      {
        if (err)
        {
          return done(err);
        }

        if (folder)
        {
          app.broker.publish('orderDocuments.tree.folderMoved', {
            folder,
            user,
            oldParentId: this.oldParentId,
            newParentId: this.newParentId
          });
        }

        done();
      }
    );
  }

  function renameFolder(params, user, done)
  {
    const name = String(params.name).trim();

    if (!name.length)
    {
      return done(app.createError('INVALID_NAME'), 400);
    }

    step(
      function()
      {
        OrderDocumentFolder.findById(params.folderId).exec(this.next());
      },
      function(err, folder)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!folder)
        {
          return this.skip(app.createError('NOT_FOUND', 400));
        }

        folder.set('name', name);
        folder.save(this.next());
      },
      function(err, folder)
      {
        if (err)
        {
          return done(err);
        }

        if (folder)
        {
          app.broker.publish('orderDocuments.tree.folderRenamed', {folder, user});
        }

        done();
      }
    );
  }

  function recoverFolder(params, user, done)
  {
    step(
      function()
      {
        OrderDocumentFolder.findById(params.folderId).exec(this.parallel());
      },
      function(err, folder)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!folder)
        {
          return this.skip(app.createError('NOT_FOUND', 400));
        }

        if (folder.parent !== '__TRASH__')
        {
          return this.skip(app.createError('INVALID_PARENT', 400));
        }

        folder.set({
          parent: folder.oldParent,
          oldParent: null
        });
        folder.save(this.parallel());

        OrderDocumentFolder.update({_id: folder.parent}, {$addToSet: {children: folder._id}}, this.parallel());

        OrderDocumentFolder.update({_id: '__TRASH__'}, {$pull: {children: folder._id}}, this.parallel());
      },
      function(err, folder)
      {
        if (err)
        {
          return done(err);
        }

        if (folder)
        {
          app.broker.publish('orderDocuments.tree.folderRecovered', {
            folder,
            user
          });
        }

        done();
      }
    );
  }
};
