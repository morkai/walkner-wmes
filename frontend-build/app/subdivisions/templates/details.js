define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(s){return String(s).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="panel panel-primary">\n  <div class="panel-heading">\n    ',t("subdivisions","PANEL:TITLE:details"),'\n  </div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">',t("subdivisions","PROPERTY:division"),'</div>\n        <div class="prop-value">',model.division||"-",'</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("subdivisions","PROPERTY:type"),'</div>\n        <div class="prop-value">',escape(model.type),'</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("subdivisions","PROPERTY:name"),'</div>\n        <div class="prop-value">',escape(model.name||"-"),'</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("subdivisions","PROPERTY:prodTaskTags"),'</div>\n        <div class="prop-value">',escape(model.prodTaskTags||"-"),'</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("subdivisions","PROPERTY:aor"),'</div>\n        <div class="prop-value">',escape(model.aor||"-"),"</div>\n      </div>\n    </div>\n  </div>\n</div>\n")}();return buf.join("")}});