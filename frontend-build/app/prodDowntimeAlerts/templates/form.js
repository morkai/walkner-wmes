define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form method="post" action="'),__append(formAction),__append('" class="prodDowntimeAlerts-form">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-name" class="control-label is-required">'),__append(t("prodDowntimeAlerts","PROPERTY:name")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-name" name="name" class="form-control" type="text" required>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-repeatInterval" class="control-label">'),__append(t("prodDowntimeAlerts","PROPERTY:repeatInterval")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-repeatInterval" name="repeatInterval" class="form-control prodDowntimeAlerts-form-repeatInterval" type="text" placeholder="0h 0m 0s">\n        <p class="help-block">'),__append(t("prodDowntimeAlerts","FORM:HELP:repeatInterval")),__append('</p>\n      </div>\n      <div class="panel panel-default prodDowntimeAlerts-form-conditions">\n        <div class="panel-heading is-with-actions">\n          '),__append(t("prodDowntimeAlerts","PROPERTY:conditions")),__append('\n          <div class="panel-actions">\n            <select id="'),__append(idPrefix),__append('-conditionTypes" class="form-control prodDowntimeAlerts-form-conditions-types">\n              <option value="" disabled selected hidden>'),__append(t("prodDowntimeAlerts","FORM:conditions:type")),__append("</option>\n              "),_.forEach(conditions,function(n){__append('\n              <option value="'),__append(n.type),__append('" '),__append(n.hidden?"":"disabled"),__append(">"),__append(t("prodDowntimeAlerts","conditions:types:"+n.type)),__append("</option>\n              ")}),__append('\n            </select>\n            <button id="'),__append(idPrefix),__append('-conditions-add" class="btn btn-default" type="button"><i class="fa fa-plus"></i><span>'),__append(t("prodDowntimeAlerts","FORM:conditions:add")),__append('</span></button>\n          </div>\n        </div>\n        <div class="panel-body">\n          <p id="'),__append(idPrefix),__append('-conditions-empty" class="prodDowntimeAlerts-form-empty">'),__append(t("prodDowntimeAlerts","FORM:conditions:empty")),__append("</p>\n          "),_.forEach(conditions,function(n,e){__append('\n          <div class="form-group prodDowntimeAlerts-form-condition '),__append(n.hidden?"hidden":""),__append('" data-type="'),__append(n.type),__append('">\n            <button class="btn btn-default prodDowntimeAlerts-form-condition-remove" type="button" title="'),__append(t("prodDowntimeAlerts","FORM:conditions:remove")),__append('"><i class="fa fa-remove"></i></button>\n            <label for="'),__append(idPrefix),__append("-conditions-"),__append(n.type),__append('" class="control-label">'),__append(t("prodDowntimeAlerts","conditions:types:"+n.type)),__append('</label>\n            <div class="prodDowntimeAlerts-form-condition-modes">\n              '),_.forEach(["include","exclude"],function(n){__append('\n              <label class="radio-inline"><input type="radio" name="conditions['),__append(e),__append('].mode" value="'),__append(n),__append('"> '),__append(t("prodDowntimeAlerts","conditions:modes:"+n)),__append("</label>\n              ")}),__append('\n            </div>\n            <input id="'),__append(idPrefix),__append("-conditions-"),__append(n.type),__append('" name="conditions['),__append(e),__append('].values" type="text">\n            <input type="hidden" name="conditions['),__append(e),__append('].type" value="'),__append(n.type),__append('">\n          </div>\n          ')}),__append('\n        </div>\n      </div>\n      <div class="panel panel-default prodDowntimeAlerts-form-actions">\n        <div class="panel-heading is-with-actions">\n          '),__append(t("prodDowntimeAlerts","PROPERTY:actions")),__append('\n          <div class="panel-actions">\n            <input id="'),__append(idPrefix),__append('-actions-validity" class="btn btn-default prodDowntimeAlerts-form-actions-validity" type="text" tabindex="-1">\n            <button id="'),__append(idPrefix),__append('-actions-add" class="btn btn-default prodDowntimeAlerts-form-actions-add" type="button"><i class="fa fa-plus"></i><span>'),__append(t("prodDowntimeAlerts","FORM:actions:add")),__append('</span></button>\n          </div>\n        </div>\n        <div id="'),__append(idPrefix),__append('-actions" class="panel-body">\n          <p id="'),__append(idPrefix),__append('-actions-empty" class="prodDowntimeAlerts-form-empty">'),__append(t("prodDowntimeAlerts","FORM:actions:empty")),__append("</p>\n          "),_.forEach(actions,function(n,e){__append("\n          "),__append(renderAction({i:e,action:n})),__append("\n          ")}),__append('\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-userWhitelist" class="control-label">'),__append(t("prodDowntimeAlerts","PROPERTY:userWhitelist")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-userWhitelist" class="js-actionsValidity" name="userWhitelist" type="text">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-userBlacklist" class="control-label">'),__append(t("prodDowntimeAlerts","PROPERTY:userBlacklist")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-userBlacklist" name="userBlacklist" type="text">\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});