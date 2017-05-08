// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/viewport","app/core/View","app/orderDocumentTree/templates/toolbar"],function(e,t,i,o,n,a,s){"use strict";return a.extend({template:s,events:{'change input[name="displayMode"]':function(){this.model.setDisplayMode(this.$('input[name="displayMode"]:checked').val())},"submit #-searchForm":function(){return this.model.setSearchPhrase(this.$id("searchPhrase").val()),!1},"keydown #-searchPhrase":function(e){return 27===e.keyCode?(this.model.setSearchPhrase(""),!1):void 0},"mousedown #-copyToClipboard":function(){document.execCommand("copy")}},initialize:function(){var e=this,i=e.model;e.loadingFiles=!1,e.listenTo(i,"change:searchPhrase change:selectedFolder",e.updateCountersAndSearchPhrase),e.listenTo(i.folders,"reset add remove change:parent",e.updateFolderCount),e.listenTo(i.files,"request",e.onFilesRequest),e.listenTo(i.files,"sync",e.onFilesSync),e.listenTo(i.files,"reset add remove",e.updateFileCount),t(document).on("copy."+e.idPrefix,e.onCopy.bind(e))},destroy:function(){t(document).off("."+this.idPrefix)},onCopy:function(e){e.preventDefault();var t=[];if(this.model.files.forEach(function(e){var i=[e.id,e.getLabel()];e.get("files").forEach(function(e){i.push(o.utc.format(e.date,"L"))}),t.push(i)}),t.length){e.originalEvent.clipboardData.setData("text/plain",t.map(function(e){return e.join("	")}).join("\r\n"));var a="<table><tr>";t.forEach(function(e){a+="<tr>",e.forEach(function(e,t){a+="<td>"+(2>t?"'":"")+e+"</td>"}),a+="</tr>"}),a+="</table>",e.originalEvent.clipboardData.setData("text/html",a),n.msg.show({type:"info",time:2e3,text:i("orderDocumentTree","toolbar:copyToClipboard:success",{rows:t.length})})}},serialize:function(){return e.assign(a.prototype.serialize.apply(this,arguments),{displayMode:this.model.getDisplayMode(),searchPhrase:this.model.getSearchPhrase(),folderCount:this.serializeFolderCount(),fileCount:this.serializeFileCount()})},serializeFolderCount:function(){var e=this.model;return e.hasSearchPhrase()?0:e.hasSelectedFolder()?e.getSelectedFolder().get("children").length:e.getRootFolders().length},serializeFileCount:function(){var e=this.model;return e.files.length?e.files.totalCount:this.loadingFiles?"?":0},updateCountersAndSearchPhrase:function(){this.updateFolderCount(),this.updateFileCount(),this.updateSearchPhrase()},updateSearchPhrase:function(){this.$id("searchPhrase").val(this.model.getSearchPhrase())},updateFolderCount:function(){this.$id("folderCount").text(this.serializeFolderCount())},updateFileCount:function(){this.$id("fileCount").text(this.serializeFileCount())},onFilesRequest:function(){this.loadingFiles=!0,this.updateFileCount()},onFilesSync:function(){this.loadingFiles=!1,this.updateFileCount()}})});