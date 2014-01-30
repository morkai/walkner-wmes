define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="panel panel-primary users-details">\n  <div class="panel-heading">\n    ',t("users","PANEL:TITLE:details"),'\n  </div>\n  <div class="panel-details row">\n    <div class="col-md-4">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">',t("users","PROPERTY:name"),'</div>\n          <div class="prop-value">',escape(model.lastName||"")," ",escape(model.firstName||""),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("users","PROPERTY:personellId"),'</div>\n          <div class="prop-value">',escape(model.personellId||"-"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("users","PROPERTY:card"),'</div>\n          <div class="prop-value">',escape(model.card||"-"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("users","PROPERTY:active"),'</div>\n          <div class="prop-value">',escape(t("users","ACTIVE:"+model.active)),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("users","PROPERTY:orgUnit"),'</div>\n          <div class="prop-value">',model.orgUnit||"-",'</div>\n        </div>\n      </div>\n    </div>\n    <div class="col-md-4">\n      <div class="props">\n        <div class="prop">\n          <div class="prop-name">',t("users","PROPERTY:company"),'</div>\n          <div class="prop-value">',escape(model.company||"-"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("users","PROPERTY:kdDivision"),'</div>\n          <div class="prop-value">',escape(model.kdDivision||"-"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("users","PROPERTY:kdPosition"),'</div>\n          <div class="prop-value">',escape(model.kdPosition||"-"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("users","PROPERTY:aors"),'</div>\n          <div class="prop-value">',escape(model.aors||"-"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("users","PROPERTY:prodFunction"),'</div>\n          <div class="prop-value">',escape(model.prodFunction||"-"),'</div>\n        </div>\n      </div>\n    </div>\n    <div class="col-md-4">\n      <div class="props">\n        <div class="prop">\n          <div class="prop-name">',t("users","PROPERTY:login"),'</div>\n          <div class="prop-value">',escape(model.login),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("users","PROPERTY:email"),'</div>\n          <div class="prop-value">',escape(model.email||"-"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("users","PROPERTY:privileges"),'</div>\n          <div class="prop-value">\n            '),model.privileges.forEach(function(e){buf.push('\n            <span class="label label-',/MANAGE/.test(e)?"warning":"info",'">',t("users","PRIVILEGE:"+e),"</span>\n            ")}),buf.push("\n          </div>\n        </div>\n    </div>\n  </div>\n</div>\n")}();return buf.join("")}});