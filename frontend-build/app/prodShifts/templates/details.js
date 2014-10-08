define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(d){return String(d).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="panel panel-',panelType,'">\n  <div class="panel-heading">\n    ',t("prodShifts","PANEL:TITLE:details"),'\n  </div>\n  <div class="panel-details row">\n    <div class="col-md-4">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">',t("prodShifts","PROPERTY:prodLine"),'</div>\n          <div class="prop-value">',escape(model.prodLine),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("prodShifts","PROPERTY:date"),'</div>\n          <div class="prop-value">',escape(model.date||"?"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("prodShifts","PROPERTY:shift"),'</div>\n          <div class="prop-value">',escape(model.shift||"?"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("prodShifts","PROPERTY:createdAt"),'</div>\n          <div class="prop-value">',escape(model.createdAt||"-"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("prodShifts","PROPERTY:creator"),'</div>\n          <div class="prop-value">',model.creator||"?",'</div>\n        </div>\n      </div>\n    </div>\n    <div class="col-md-4">\n      <div class="props">\n        <div class="prop">\n          <div class="prop-name">',t("core","ORG_UNIT:division"),'</div>\n          <div class="prop-value">',escape(model.division||"?"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("core","ORG_UNIT:subdivision"),'</div>\n          <div class="prop-value">',escape(model.subdivision),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("core","ORG_UNIT:mrpController"),'</div>\n          <div class="prop-value">',escape(model.mrpControllers),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("core","ORG_UNIT:prodFlow"),'</div>\n          <div class="prop-value">',escape(model.prodFlow),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("core","ORG_UNIT:workCenter"),'</div>\n          <div class="prop-value">',escape(model.workCenter||"?"),'</div>\n        </div>\n      </div>\n    </div>\n    <div class="col-md-4">\n      <div class="props">\n        <div class="prop">\n          <div class="prop-name">',t("prodShifts","PROPERTY:master"),'</div>\n          <div class="prop-value">',model.master,'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("prodShifts","PROPERTY:leader"),'</div>\n          <div class="prop-value">',model.leader,'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("prodShifts","PROPERTY:operator"),'</div>\n          <div class="prop-value">',model.operator,'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("prodShifts","PROPERTY:totalQuantityDone"),'</div>\n          <div class="prop-value">',t("prodShifts","totalQuantityDone",totalQuantityDone),"</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n")}();return buf.join("")}});