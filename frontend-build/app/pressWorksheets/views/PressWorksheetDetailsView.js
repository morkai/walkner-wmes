define(["app/i18n","app/core/views/DetailsView","./decoratePressWorksheet","app/pressWorksheets/templates/details"],function(e,t,n,r){return t.extend({template:r,serialize:function(){var e=t.prototype.serialize.call(this);return n(e.model),e}})});