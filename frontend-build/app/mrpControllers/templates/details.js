define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="panel panel-primary">\n  <div class="panel-heading">\n    ',t("mrpControllers","PANEL:TITLE:details"),'\n  </div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">',t("mrpControllers","PROPERTY:subdivision"),'</div>\n        <div class="prop-value">',orgUnitPath||"-",'\n        </div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("mrpControllers","PROPERTY:_id"),'</div>\n        <div class="prop-value">',escape(model._id),'</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("mrpControllers","PROPERTY:description"),'</div>\n        <div class="prop-value">',escape(model.description||"-"),"</div>\n      </div>\n    </div>\n  </div>\n</div>\n")}();return buf.join("")}});