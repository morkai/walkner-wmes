define(["underscore","jquery","app/core/View","app/orderDocumentTree/templates/path","app/orderDocumentTree/templates/folderSelector"],function(e,t,r,o,l){"use strict";return r.extend({template:o,events:{"click .orderDocumentTree-path-label":function(e){var t=this.$(e.target).closest(".orderDocumentTree-path-item")[0].dataset.folderId;if(t)return this.hideFolderSelector(),this.model.setSelectedFolder(t,{scroll:!0}),!1},"click .orderDocumentTree-path-dropdown":function(e){var t=this.$(e.target).closest(".orderDocumentTree-path-item")[0].dataset.folderId;if(t){var r="null"!==t?this.model.getChildFolders(this.model.folders.get(t)):this.model.getRootFolders();return 1===r.length?this.model.setSelectedFolder(r[0].id,{scroll:!0}):this.showFolderSelector(t||null,r,!0),!1}},"mouseenter .orderDocumentTree-path-item":function(e){if(this.$folderSelector){var t=this.$(e.target).closest(".orderDocumentTree-path-item")[0].dataset.folderId,r="null"!==t?this.model.getChildFolders(this.model.folders.get(t)):this.model.getRootFolders();this.showFolderSelector(t||null,r,!1)}}},initialize:function(){var e=this,r=e.model;e.$folderSelector=null,e.listenTo(r,"change:selectedFolder change:searchPhrase",this.render),e.listenTo(r.folders,"change:name change:parent",this.onFolderChange),t(window).on("click."+e.idPrefix,e.hideFolderSelector.bind(e)).on("resize."+e.idPrefix,e.positionFolderSelector.bind(e,null)),t("body").on("keydown."+e.idPrefix,function(t){27===t.keyCode&&e.hideFolderSelector()})},destroy:function(){t(window).off("."+this.idPrefix),t("body").off("."+this.idPrefix),this.hideFolderSelector()},serialize:function(){return e.extend(r.prototype.serialize.apply(this,arguments),{searchPhrase:this.model.get("searchPhrase"),path:this.model.getPath().map(function(e){var t=e.getLabel();return-1===t.indexOf(" ")&&(t=t.replace(/_/g," ")),{id:e.id,label:t,children:e.hasAnyChildren()}})})},beforeRender:function(){this.hideFolderSelector()},afterRender:function(){},showFolderSelector:function(e,r,o){var d=this;d.$folderSelector&&e===d.$folderSelector.attr("data-parent-folder-id")?o&&d.hideFolderSelector():(d.hideFolderSelector(),d.$folderSelector=t(l({parentFolderId:e,folders:r.map(function(e){return{id:e.id,label:e.getLabel()}})})),d.$folderSelector.on("click",".orderDocumentTree-folderSelector-item",function(e){d.model.setSelectedFolder(e.currentTarget.dataset.folderId,{scroll:!0})}),this.positionFolderSelector(r.length?"visible":"hidden"),d.$('.orderDocumentTree-path-item[data-folder-id="'+e+'"]').addClass("is-selecting"),d.$folderSelector.appendTo(document.body))},positionFolderSelector:function(e){if(this.$folderSelector){var t=this.$folderSelector.attr("data-parent-folder-id"),r=this.$('.orderDocumentTree-path-item[data-folder-id="'+t+'"]'),o=r[0].getBoundingClientRect();this.$folderSelector.css({top:o.top+r.outerHeight()+"px",right:window.innerWidth-o.right-17+"px"}),e&&this.$folderSelector.css("visibility",e)}},hideFolderSelector:function(){this.$folderSelector&&(this.$(".is-selecting").removeClass("is-selecting"),this.$folderSelector.remove(),this.$folderSelector=null)},onFolderChange:function(e){this.model.get("searchPhrase")||this.$('.orderDocumentTree-path-item[data-folder-id="'+e.id+'"]').length&&this.render()}})});