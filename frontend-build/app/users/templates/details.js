define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,function(p){return _ENCODE_HTML_RULES[p]||p})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="panel panel-primary users-details">\n  <div class="panel-heading">\n    '),__output.push(t("users","PANEL:TITLE:details")),__output.push('\n  </div>\n  <div class="panel-details row">\n    <div class="col-md-4">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("users","PROPERTY:name")),__output.push('</div>\n          <div class="prop-value">'),__output.push(escape(model.lastName||"")),__output.push(" "),__output.push(escape(model.firstName||"")),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("users","PROPERTY:gender")),__output.push('</div>\n          <div class="prop-value">'),__output.push(escape(model.gender?t("users","gender:"+model.gender):"-")),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("users","PROPERTY:personellId")),__output.push('</div>\n          <div class="prop-value">'),__output.push(escape(model.personellId||"-")),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("users","PROPERTY:card")),__output.push('</div>\n          <div class="prop-value">'),__output.push(escape(model.card||"-")),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("users","PROPERTY:active")),__output.push('</div>\n          <div class="prop-value">'),__output.push(escape(t("users","ACTIVE:"+model.active))),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("users","PROPERTY:orgUnit")),__output.push('</div>\n          <div class="prop-value">'),__output.push(model.orgUnit||"-"),__output.push('</div>\n        </div>\n      </div>\n    </div>\n    <div class="col-md-4">\n      <div class="props">\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("users","PROPERTY:company")),__output.push('</div>\n          <div class="prop-value">'),__output.push(escape(model.company||"-")),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("users","PROPERTY:kdDivision")),__output.push('</div>\n          <div class="prop-value">'),__output.push(escape(model.kdDivision||"-")),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("users","PROPERTY:kdPosition")),__output.push('</div>\n          <div class="prop-value">'),__output.push(escape(model.kdPosition||"-")),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("users","PROPERTY:aors")),__output.push('</div>\n          <div class="prop-value">'),__output.push(escape(model.aors||"-")),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("users","PROPERTY:prodFunction")),__output.push('</div>\n          <div class="prop-value">'),__output.push(escape(model.prodFunction||"-")),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("users","PROPERTY:vendor")),__output.push('</div>\n          <div class="prop-value">'),__output.push(escape(model.vendor||"-")),__output.push('</div>\n        </div>\n      </div>\n    </div>\n    <div class="col-md-4">\n      <div class="props">\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("users","PROPERTY:login")),__output.push('</div>\n          <div class="prop-value">'),__output.push(escape(model.login)),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("users","PROPERTY:email")),__output.push('</div>\n          <div class="prop-value">'),__output.push(escape(model.email||"-")),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("users","PROPERTY:privileges")),__output.push('</div>\n          <div class="prop-value">\n            '),model.privileges.length?(__output.push("\n            "),model.privileges.forEach(function(p){__output.push('\n            <span class="label label-'),__output.push(/MANAGE/.test(p)?"warning":"info"),__output.push('">'),__output.push(t("users","PRIVILEGE:"+p)),__output.push("</span>\n            ")}),__output.push("\n            ")):__output.push("\n            -\n            "),__output.push("\n          </div>\n        </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});