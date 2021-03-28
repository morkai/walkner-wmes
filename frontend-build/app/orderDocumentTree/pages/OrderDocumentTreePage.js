define(["underscore","jquery","app/i18n","app/user","app/viewport","app/core/View","app/core/util/bindLoadingMessage","app/orderDocumentTree/OrderDocumentFolder","app/orderDocumentTree/views/PathView","app/orderDocumentTree/views/FoldersView","app/orderDocumentTree/views/FilesView","app/orderDocumentTree/views/UploadsView","app/orderDocumentTree/views/ToolbarView","app/orderDocumentTree/templates/page"],function(e,t,i,s,o,l,r,n,d,h,a,c,f,u){"use strict";return l.extend({template:u,layoutName:"page",events:{"scroll #-folders":function(){return!1}},actions:function(){return[{label:this.t("PAGE_ACTION:settings"),icon:"cogs",privileges:"DOCUMENTS:MANAGE",href:"#orders;settings?tab=documents"}]},breadcrumbs:function(){return[this.t("BREADCRUMB:base"),this.t("BREADCRUMB:root")]},initialize:function(){var i=this.model;this.onResize=e.debounce(this.resize.bind(this),20),this.$els={foldersContainer:null,folders:null,filesContainer:null,files:null,uploadContainer:null},this.pathView=new d({model:i}),this.foldersView=new h({model:i}),this.toolbarView=new f({model:i}),this.filesView=new a({model:i}),this.uploadsView=new c({model:i});var s="#"+this.idPrefix+"-";this.setView(s+"path",this.pathView),this.setView(s+"folders",this.foldersView),this.setView(s+"toolbar",this.toolbarView),this.setView(s+"files",this.filesView),this.setView(s+"uploadContainer",this.uploadsView),r(i.folders,this,"MSG:LOADING_FAILURE:folders"),r(i.files,this,"MSG:LOADING_FAILURE:files"),i.subscribe(this.pubsub),this.listenTo(i,"change:selectedFolder change:searchPhrase",this.onSelectedChange.bind(this,!0)),this.listenTo(i,"change:selectedFile change:dateFilter",this.onSelectedChange.bind(this,!1)),this.listenTo(i.files,"remove",this.onFileRemove),this.listenTo(i.uploads,"reset add remove",this.onUploadChange),t(window).on("resize."+this.idPrefix,this.onResize).on("scroll."+this.idPrefix,this.resize.bind(this))},destroy:function(){t(window).off("."+this.idPrefix)},load:function(e){var i=this,s=i.model;if(!s.hasSelectedFile()||s.hasSelectedFolder())return e(s.folders.fetch({reset:!0}),s.files.fetch({reset:!0}));var l=t.Deferred();return i.ajax({url:"/orderDocuments/files/"+s.get("selectedFile")}).fail(function(){o.msg.show({type:"warning",time:3e3,text:i.t("MSG:fileNotFound",{nc15:s.get("selectedFile")})})}).done(function(e){s.setSelectedFolder(e.folders[0],{keepFile:!0})}).always(function(){t.when(s.folders.fetch({reset:!0}),s.files.fetch({reset:!0})).fail(function(){l.reject()}).done(function(){l.resolve()})}),e(l.promise())},getTemplateData:function(){return{uploading:this.model.uploads.length>0}},afterRender:function(){var t=this;e.forEach(t.$els,function(e,i){t.$els[i]=t.$id(i)}),t.$els.folders.on("wheel",function(e){return!t.foldersView.isContextMenuVisible()&&(!(e.originalEvent.deltaY<0&&0===this.scrollTop)&&(!(e.originalEvent.deltaY>0&&this.scrollTop>=this.scrollHeight-this.offsetHeight)&&void 0))}),t.$els.folders.on("scroll",function(){this.scrollLeft=0}),this.resize()},resize:function(){var e=this.$els.filesContainer;if(e&&e.length){var t=Math.max(15,e[0].offsetTop-window.scrollY),i=window.innerHeight-17-t;this.$els.uploadContainer.css("top",t+"px").css("height",i+"px"),this.$els.foldersContainer.css("top",t+"px"),this.$els.folders.css("height",i+"px"),this.foldersView.hideContextMenu()}},updateUrl:function(e){var t="/orderDocuments/tree?";this.model.hasSelectedFolder()&&(t+="folder="+this.model.get("selectedFolder")+"&"),this.model.hasSelectedFile()&&(t+="file="+this.model.get("selectedFile")+"&"),this.model.hasSearchPhrase()&&(t+="search="+encodeURIComponent(this.model.get("searchPhrase"))+"&"),this.model.hasDateFilter()&&(t+="date="+this.model.getDateFilter()+"&"),this.broker.publish("router.navigate",{url:t,replace:e,trigger:!1})},onSelectedChange:function(e,t,i,s){this.updateUrl(!(s&&s.updateUrl)),e&&this.promised(this.model.files.fetch({reset:!0}))},onFileRemove:function(e){e.id===this.model.get("selectedFile")&&this.model.setSelectedFile(null)},onUploadChange:function(){this.$el.toggleClass("is-uploading",this.model.uploads.length>0),this.pathView.positionFolderSelector(),this.foldersView.hideContextMenu(),this.filesView.positionPreview()}})});