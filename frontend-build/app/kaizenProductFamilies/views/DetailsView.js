define(["app/core/views/DetailsView","app/kaizenCategories/views/CoordSectionsDetailsView","app/kaizenProductFamilies/templates/details","css!app/kaizenCategories/assets/coordSections"],function(e,i,t){"use strict";return e.extend({template:t,initialize:function(){e.prototype.initialize.apply(this,arguments),this.setView("#-coordSections",new i({model:this.model}))}})});