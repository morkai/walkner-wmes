define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(u){return void 0==u?"":String(u).replace(_MATCH_HTML,function(u){return _ENCODE_HTML_RULES[u]||u})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<form class="users-form" method="post" action="'),__output.push(formAction),__output.push('">\n  <input type="hidden" name="_method" value="'),__output.push(formMethod),__output.push('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__output.push(panelTitleText),__output.push('</div>\n    <div class="panel-body">\n      <div class="row">\n        <div class="col-md-3 form-group">\n          <label for="'),__output.push(idPrefix),__output.push('-login" class="control-label is-required">'),__output.push(t("users","PROPERTY:login")),__output.push('</label>\n          <input id="'),__output.push(idPrefix),__output.push('-login" class="form-control" type="text" name="login" required maxlength="50">\n        </div>\n        <div class="col-md-3 form-group">\n          <label for="'),__output.push(idPrefix),__output.push('-email" class="control-label">'),__output.push(t("users","PROPERTY:email")),__output.push('</label>\n          <input id="'),__output.push(idPrefix),__output.push('-email" class="form-control" type="email" name="email" maxlength="100">\n        </div>\n        <div class="col-md-3 form-group">\n          <label for="'),__output.push(idPrefix),__output.push('-password" class="control-label">'),__output.push(t("users","PROPERTY:password")),__output.push('</label>\n          <input id="'),__output.push(idPrefix),__output.push('-password" class="form-control" type="password" name="password">\n        </div>\n        <div class="col-md-3 form-group">\n          <label for="'),__output.push(idPrefix),__output.push('-password2" class="control-label">'),__output.push(t("users","PROPERTY:password2")),__output.push('</label>\n          <input id="'),__output.push(idPrefix),__output.push('-password2" class="form-control" type="password">\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-md-3 form-group">\n          <label for="'),__output.push(idPrefix),__output.push('-firstName" class="control-label">'),__output.push(t("users","PROPERTY:firstName")),__output.push('</label>\n          <input id="'),__output.push(idPrefix),__output.push('-firstName" class="form-control" type="text" name="firstName" autofocus maxlength="50">\n        </div>\n        <div class="col-md-3 form-group">\n          <label for="'),__output.push(idPrefix),__output.push('-lastName" class="control-label">'),__output.push(t("users","PROPERTY:lastName")),__output.push('</label>\n          <input id="'),__output.push(idPrefix),__output.push('-lastName" class="form-control" type="text" name="lastName" maxlength="50">\n        </div>\n        <div class="col-md-6 form-group">\n          <label for="'),__output.push(idPrefix),__output.push('-gender" class="control-label is-required">'),__output.push(t("users","PROPERTY:gender")),__output.push('</label>\n          <div>\n            <label class="radio-inline">\n              <input type="radio" name="gender" value="female" required> '),__output.push(t("users","gender:female")),__output.push('\n            </label>\n            <label class="radio-inline">\n              <input type="radio" name="gender" value="male" required> '),__output.push(t("users","gender:male")),__output.push('\n            </label>\n          </div>\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-md-6">\n          <div class="row">\n            <div class="col-md-6 form-group">\n              <label for="'),__output.push(idPrefix),__output.push('-company" class="control-label">'),__output.push(t("users","PROPERTY:company")),__output.push('</label>\n              <select id="'),__output.push(idPrefix),__output.push('-company" name="company" data-placeholder="'),__output.push(t("users","NO_DATA:prodFunction")),__output.push('">\n                <option></option>\n                '),companies.forEach(function(u){__output.push('\n                <option value="'),__output.push(u._id),__output.push('">'),__output.push(escape(u.name)),__output.push("</option>\n                ")}),__output.push('\n              </select>\n            </div>\n            <div class="col-md-6 form-group">\n              <label for="'),__output.push(idPrefix),__output.push('-prodFunction" class="control-label">'),__output.push(t("users","PROPERTY:prodFunction")),__output.push('</label>\n              <input id="'),__output.push(idPrefix),__output.push('-prodFunction" name="prodFunction" type="text" data-placeholder="'),__output.push(t("users","NO_DATA:prodFunction")),__output.push('">\n            </div>\n          </div>\n          <div class="row">\n            <div class="col-md-6 form-group">\n              <label for="'),__output.push(idPrefix),__output.push('-kdDivision" class="control-label">'),__output.push(t("users","PROPERTY:kdDivision")),__output.push('</label>\n              <input id="'),__output.push(idPrefix),__output.push('-kdDivision" class="form-control" type="text" name="kdDivision" maxlength="100">\n            </div>\n            <div class="col-md-6 form-group">\n              <label for="'),__output.push(idPrefix),__output.push('-kdPosition" class="control-label">'),__output.push(t("users","PROPERTY:kdPosition")),__output.push('</label>\n              <input id="'),__output.push(idPrefix),__output.push('-kdPosition" class="form-control" type="text" name="kdPosition" maxlength="100">\n            </div>\n          </div>\n          <div class="row">\n            <div class="col-md-6 form-group">\n              <label for="'),__output.push(idPrefix),__output.push('-personellId" class="control-label">'),__output.push(t("users","PROPERTY:personellId")),__output.push('</label>\n              <input id="'),__output.push(idPrefix),__output.push('-personellId" class="form-control" type="text" name="personellId" maxlength="15">\n            </div>\n            <div class="col-md-6 form-group">\n              <label for="'),__output.push(idPrefix),__output.push('-card" class="control-label">'),__output.push(t("users","PROPERTY:card")),__output.push('</label>\n              <input id="'),__output.push(idPrefix),__output.push('-card" class="form-control" type="text" name="card" maxlength="15">\n            </div>\n          </div>\n        </div>\n        <div class="col-md-6">\n          <div class="orgUnitDropdowns-container"></div>\n          <div class="form-group users-form-aor">\n            <label for="'),__output.push(idPrefix),__output.push('-aors" class="control-label">'),__output.push(t("users","PROPERTY:aors")),__output.push('</label>\n            <select id="'),__output.push(idPrefix),__output.push('-aors" name="aors[]" multiple data-placeholder="'),__output.push(t("users","NO_DATA:aors")),__output.push('">\n              <option></option>\n              '),aors.forEach(function(u){__output.push('\n              <option value="'),__output.push(u._id),__output.push('">'),__output.push(escape(u.name)),__output.push("\n              ")}),__output.push('\n            </select>\n          </div>\n          <div class="form-group">\n            <label for="'),__output.push(idPrefix),__output.push('-vendor" class="control-label">'),__output.push(t("users","PROPERTY:vendor")),__output.push('</label>\n            <input id="'),__output.push(idPrefix),__output.push('-vendor" type="text" name="vendor" maxlength="15">\n          </div>\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-privileges" class="control-label">'),__output.push(t("users","PROPERTY:privileges")),__output.push('</label>\n        <div class="input-group">\n          <input id="'),__output.push(idPrefix),__output.push('-privileges" type="text" name="privileges">\n          <span class="input-group-btn">\n            <button id="'),__output.push(idPrefix),__output.push('-copyPrivileges" class="btn btn-default" type="button"><i class="fa fa-copy"></i></button>\n          </span>\n        </div>\n      </div>\n      <div class="form-group">\n        <div class="checkbox">\n          <label><input type="checkbox" name="active" value="true"> '),__output.push(t("users","PROPERTY:active")),__output.push('</label>\n        </div>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__output.push(formActionText),__output.push("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});