define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<form class="workCenters-form" method="post" action="'),__output.push(formAction),__output.push('">\n  <input type="hidden" name="_method" value="'),__output.push(formMethod),__output.push('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__output.push(panelTitleText),__output.push('</div>\n    <div class="panel-body">\n      <div class="orgUnitDropdowns-container"></div>\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-_id" class="control-label">'),__output.push(t("workCenters","PROPERTY:_id")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-_id" class="form-control" type="text" name="_id" required maxlength="50" pattern="^[a-zA-Z0-9_-~]+$">\n      </div>\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-description" class="control-label">'),__output.push(t("workCenters","PROPERTY:description")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-description" class="form-control" type="text" name="description" required maxlength="150">\n      </div>\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-deactivatedAt" class="control-label">'),__output.push(t("workCenters","PROPERTY:deactivatedAt")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-deactivatedAt" class="form-control" type="date" name="deactivatedAt" maxlength="10">\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__output.push(formActionText),__output.push("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});