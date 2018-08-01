// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/View","app/kanban/templates/search"],function(e,t){"use strict";return e.extend({events:{submit:function(){var e=this.$id("phrase").val(),t=this.model.entries.get(e);return t&&!t.attributes.deleted?this.trigger("found","entry",t):(t=this.model.components.get(e))&&this.trigger("found","component",t),this.closeDialog(),!1},"keydown #-phrase":function(e){return e.ctrlKey||e.shiftKey||e.altKey?70!==e.keyCode:!(1===e.key.length&&!/^[0-9]$/.test(e.key))},"input #-phrase":function(){var e,t=this.$id("phrase"),i=this.$id("phrase").val();if(0===i.length)e="";else if(i.length<6)e=this.t("search:invalid");else if(i.length<8){var s=this.model.entries.get(i);e=s&&!s.attributes.deleted?"":this.t("search:invalid:ccn")}else e=this.model.components.get(i)?"":this.t("search:invalid:nc12");t[0].setCustomValidity(e)},"blur #-phrase":function(){this.closeDialog()}},dialogClassName:"kanban-search-dialog",template:t,closeDialog:function(){},onDialogShown:function(e){this.closeDialog=e.closeDialog.bind(e)}})});