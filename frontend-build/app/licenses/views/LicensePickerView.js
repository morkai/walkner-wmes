// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/core/View","../LicenseCollection","./LicenseListView","app/licenses/templates/picker"],function(e,s,i,t,n){"use strict";return s.extend({dialogClassName:"licensePicker-dialog",template:n,events:{"click #-unused":function(){this.model.unused=!this.model.unused,this.render()},"click tr[data-id]":function(e){this.trigger("licensePicked",this.licenses.get(e.currentTarget.dataset.id))}},initialize:function(){this.loading=!0,this.licenses=new i(null,{rqlQuery:"appId="+this.model.appId+"&sort(-expireDate)&limit(999)"}),this.model.usedLicenseIds={};var s=this;e.when(this.licenses.fetch({reset:!0}),this.model.usedLicenses.fetch({reset:!0})).always(function(){s.loading=!1,s.model.usedLicenseIds=s.model.usedLicenses.getUsedLicenseIds(),s.render()})},serialize:function(){return{idPrefix:this.idPrefix,unused:this.model.unused,loading:!1,licenses:this.serializeLicenses()}},serializeLicenses:function(){for(var e=[],s=0;s<this.licenses.length;++s){var i=this.licenses.models[s];this.model.unused&&this.model.usedLicenseIds[i.id]||(i=i.serialize(),i.shortId=i._id.substr(0,4)+"..."+i._id.substr(-4),e.push(i))}return e}})});