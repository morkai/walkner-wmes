define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(n){return String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div>\n  <div class="panel panel-primary">\n    <div class="panel-heading">\n      ',t("xiconfPrograms","PANEL:TITLE:details"),'\n    </div>\n    <div class="panel-details">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">',t("xiconfPrograms","PROPERTY:name"),'</div>\n          <div class="prop-value">',escape(model.name),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconfPrograms","PROPERTY:createdAt"),'</div>\n          <div class="prop-value">',escape(model.createdAt),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconfPrograms","PROPERTY:updatedAt"),'</div>\n          <div class="prop-value">',escape(model.updatedAt),"</div>\n        </div>\n      </div>\n    </div>\n  </div>\n  "),model.steps.forEach(function(n){buf.push("\n  "+function(){var s=[];return s.push(""),n.enabled&&(s.push("\n"),"pe"===n.type?s.push("\n"+function(){var s=[];return s.push('<div class="panel panel-default xiconfPrograms-details-pe">\n  <div class="panel-heading">\n    ',t("xiconfPrograms","step:pe"),'\n  </div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">',t("xiconfPrograms","PROPERTY:startTime"),'</div>\n        <div class="prop-value">',escape(time.toString(n.startTime)),'</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("xiconfPrograms","PROPERTY:duration"),'</div>\n        <div class="prop-value">',escape(time.toString(n.duration)),'</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("xiconfPrograms","PROPERTY:voltage"),'</div>\n        <div class="prop-value">',escape(n.voltage.toLocaleString()),'</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("xiconfPrograms","PROPERTY:resistance:max"),'</div>\n        <div class="prop-value">',escape(n.resistanceMax.toLocaleString()),"</div>\n      </div>\n    </div>\n  </div>\n</div>\n"),s.join("")}()+"\n"):"sol"===n.type?s.push("\n"+function(){var s=[];return s.push('<div class="panel panel-default xiconfPrograms-details-sol">\n  <div class="panel-heading">\n    ',t("xiconfPrograms","step:sol"),'\n  </div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">',t("xiconfPrograms","PROPERTY:voltage"),'</div>\n        <div class="prop-value">',escape(n.voltage.toLocaleString()),"</div>\n      </div>\n    </div>\n  </div>\n</div>\n"),s.join("")}()+"\n"):"fn"===n.type&&s.push("\n"+function(){var s=[];return s.push('<div class="panel panel-default xiconfPrograms-details-fn">\n  <div class="panel-heading">\n    ',t("xiconfPrograms","step:fn"),'\n  </div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">',t("xiconfPrograms","PROPERTY:startTime"),'</div>\n        <div class="prop-value">',escape(time.toString(n.startTime)),'</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("xiconfPrograms","PROPERTY:duration"),'</div>\n        <div class="prop-value">',escape(time.toString(n.duration)),'</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("xiconfPrograms","PROPERTY:voltage"),'</div>\n        <div class="prop-value">',escape(n.voltage.toLocaleString()),'</div>\n      </div>\n      <div class="prop">\n        '),n.powerMin===n.powerMax&&n.powerReq===n.powerMin?s.push('\n        <div class="prop-name">',t("xiconfPrograms","PROPERTY:power:req"),'</div>\n        <div class="prop-value">',escape(n.powerReq),"</div>\n        "):s.push('\n        <div class="prop-name">',t("xiconfPrograms","PROPERTY:power"),'</div>\n        <div class="prop-value">',escape(n.powerMin)," &lt;= ",escape(n.powerReq)," &lt;= ",escape(n.powerMax),"</div>\n        "),s.push("\n      </div>\n    </div>\n  </div>\n</div>\n"),s.join("")}()+"\n"),s.push("\n")),s.push("\n"),s.join("")}()+"\n  ")}),buf.push("\n</div>\n\n")}();return buf.join("")}});