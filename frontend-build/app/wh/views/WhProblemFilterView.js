define(["app/core/View","app/wh/templates/problemFilter"],function(e,t){"use strict";return e.extend({template:t,events:{"click #-useDarkerTheme":function(){this.displayOptions.toggleDarkerThemeUse()}},initialize:function(){this.listenTo(this.displayOptions,"change:useDarkerTheme",this.updateToggles)},getTemplateData:function(){return{useDarkerTheme:this.displayOptions.isDarkerThemeUsed()}},updateToggles:function(){this.$id("useDarkerTheme").toggleClass("active",this.displayOptions.isDarkerThemeUsed())}})});