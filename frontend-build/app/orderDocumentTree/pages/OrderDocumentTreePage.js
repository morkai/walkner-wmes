// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/user","app/viewport","app/core/View","app/core/util/bindLoadingMessage","app/orderDocumentTree/OrderDocumentFolder","app/orderDocumentTree/views/PathView","app/orderDocumentTree/views/FoldersView","app/orderDocumentTree/views/FilesView","app/orderDocumentTree/views/UploadsView","app/orderDocumentTree/views/ToolbarView","app/orderDocumentTree/templates/page"],function(e,i,o,t,s,l,r,n,d,a,c,u,h,f){"use strict";return l.extend({template:f,layoutName:"page",events:{"scroll #-folders":function(){return!1}},actions:function(){return[{label:o.bound("orderDocumentTree","PAGE_ACTION:settings"),icon:"cogs",privileges:"DOCUMENTS:MANAGE",href:"#orders;settings?tab=documents"}]},breadcrumbs:function(){return[o("orderDocumentTree","BREADCRUMBS:base"),o("orderDocumentTree","BREADCRUMBS:root")]},initialize:function(){var o=this,t=o.model;o.onResize=e.debounce(o.resize.bind(o),20),o.$els={foldersContainer:null,folders:null,filesContainer:null,files:null,uploadContainer:null},o.pathView=new d({model:t}),o.foldersView=new a({model:t}),o.toolbarView=new h({model:t}),o.filesView=new c({model:t}),o.uploadsView=new u({model:t});var s="#"+o.idPrefix+"-";o.setView(s+"path",o.pathView),o.setView(s+"folders",o.foldersView),o.setView(s+"toolbar",o.toolbarView),o.setView(s+"files",o.filesView),o.setView(s+"uploadContainer",o.uploadsView),r(t.folders,o,"MSG:LOADING_FAILURE:folders"),r(t.files,o,"MSG:LOADING_FAILURE:files"),t.subscribe(o.pubsub),o.listenTo(t,"change:selectedFolder change:searchPhrase",o.onSelectedChange.bind(o,!0)),o.listenTo(t,"change:selectedFile",o.onSelectedChange.bind(o,!1)),o.listenTo(t.files,"remove",o.onFileRemove),o.listenTo(t.uploads,"add remove",o.onUploadChange),i(window).on("resize."+o.idPrefix,o.onResize).on("scroll."+o.idPrefix,o.resize.bind(o))},destroy:function(){i(window).off("."+this.idPrefix),this.$els=null},load:function(e){var t=this.model;if(!t.hasSelectedFile()||t.hasSelectedFolder())return e(t.folders.fetch({reset:!0}),t.files.fetch({reset:!0}));var l=i.Deferred(),r=function(){i.when(t.folders.fetch({reset:!0}),t.files.fetch({reset:!0})).fail(function(){l.reject()}).done(function(){l.resolve()})};return this.ajax({url:"/orderDocuments/files/"+t.get("selectedFile")}).fail(function(){s.msg.show({type:"warning",time:3e3,text:o("orderDocumentTree","MSG:fileNotFound",{nc15:t.get("selectedFile")})})}).done(function(e){t.setSelectedFolder(e.folders[0],{keepFile:!0})}).always(r),e(l.promise())},serialize:function(){return{idPrefix:this.idPrefix,uploading:this.model.uploads.length>0}},afterRender:function(){var i=this;e.forEach(i.$els,function(e,o){i.$els[o]=i.$id(o)}),i.$els.folders.on("wheel",function(e){return!i.foldersView.isContextMenuVisible()&&(!(e.originalEvent.deltaY<0&&0===this.scrollTop)&&(!(e.originalEvent.deltaY>0&&this.scrollTop>=this.scrollHeight-this.offsetHeight)&&void 0))}),i.$els.folders.on("scroll",function(){this.scrollLeft=0}),this.resize()},resize:function(){var e=Math.max(15,this.$els.filesContainer[0].offsetTop-window.scrollY),i=window.innerHeight-17-e;this.$els.uploadContainer.css("top",e+"px").css("height",i+"px"),this.$els.foldersContainer.css("top",e+"px"),this.$els.folders.css("height",i+"px"),this.foldersView.hideContextMenu()},updateUrl:function(e){var i="/orderDocuments/tree?";this.model.hasSelectedFolder()&&(i+="folder="+this.model.get("selectedFolder")+"&"),this.model.hasSelectedFile()&&(i+="file="+this.model.get("selectedFile")+"&"),this.model.hasSearchPhrase()&&(i+="search="+encodeURIComponent(this.model.get("searchPhrase"))+"&"),this.broker.publish("router.navigate",{url:i,replace:e,trigger:!1})},onSelectedChange:function(e,i,o,t){this.updateUrl(!(t&&t.updateUrl)),e&&this.promised(this.model.files.fetch({reset:!0}))},onFileRemove:function(e){e.id===this.model.get("selectedFile")&&this.model.setSelectedFile(null)},onUploadChange:function(){this.$el.toggleClass("is-uploading",this.model.uploads.length>0),this.pathView.positionFolderSelector(),this.foldersView.hideContextMenu(),this.filesView.positionPreview()}})});