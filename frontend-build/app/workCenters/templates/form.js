define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="workCenters-form" method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="orgUnitDropdowns-container"></div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-_id" class="control-label is-required">'),__append(t("workCenters","PROPERTY:_id")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-_id" class="form-control" type="text" autocomplete="new-password" name="_id" required maxlength="50" pattern="^[a-zA-Z0-9_\\-~]*$">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-description" class="control-label is-required">'),__append(t("workCenters","PROPERTY:description")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-description" class="form-control" type="text" autocomplete="new-password" name="description" required maxlength="150">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-deactivatedAt" class="control-label">'),__append(t("workCenters","PROPERTY:deactivatedAt")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-deactivatedAt" class="form-control" type="date" name="deactivatedAt" maxlength="10">\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});