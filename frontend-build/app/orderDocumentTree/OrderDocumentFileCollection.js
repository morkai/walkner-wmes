// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../core/Collection","./OrderDocumentFile"],function(e,t,r){"use strict";return t.extend({model:r,rqlQuery:"sort(_id)&folders=null",initialize:function(e,t){this.parentFolderId=null,this.searchPhrase="",this.totalCount=0,t&&t.parentFolderId&&this.setParentFolderId(t.parentFolderId),t&&t.searchPhrase&&this.setSearchPhrase(t.searchPhrase)},parse:function(e){return this.totalCount=e.totalCount||0,e.collection||[]},setParentFolderId:function(e){this.parentFolderId=e,this.updateRqlQuery()},setSearchPhrase:function(e){this.searchPhrase=e.replace(/#/g,".").replace(/\*/g,".+"),this.updateRqlQuery()},updateRqlQuery:function(){var e="sort(_id)";e+=this.searchPhrase?"&limit(75)&_id=regex="+encodeURIComponent("^"+this.searchPhrase+"$"):"&folders="+(this.parentFolderId||"null"),this.rqlQuery=this.createRqlQuery(e)},handleFileRemoved:function(e){var t=this.get(e);t&&t.trash()},handleFileRecovered:function(e){var t=this.get(e);t&&t.recover()},handleFilePurged:function(e){var t=this.get(e);t&&this.remove(t)},handleFileUnlinked:function(e,t){var r=this.get(e);r&&r.unlinkFolder(t)},handleFileEdited:function(t,r){var i=this.get(t._id);i?i.set(t):e.includes(t.folders,r)&&this.add(t)},handleFileAdded:function(e){var t=this.get(e._id);t?t.set(e):this.add(e)}})});