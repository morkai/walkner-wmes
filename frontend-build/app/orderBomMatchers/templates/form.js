define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="orderBomMatchers-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <div class="checkbox">\n          <label class="control-label">\n            <input type="checkbox" name="active" value="true">\n            '),__append(helpers.t("PROPERTY:active")),__append('\n          </label>\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-description" class="control-label is-required">'),__append(helpers.t("PROPERTY:description")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-description" class="form-control" type="text" autocomplete="new-password" name="description" required maxlength="60">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-matchers-line" class="control-label">'),__append(helpers.t("PROPERTY:line")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-matchers-line" type="text" autocomplete="new-password" name="matchers.line">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-matchers-mrp" class="control-label">'),__append(helpers.t("PROPERTY:mrp")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-matchers-mrp" class="form-control" type="text" autocomplete="new-password" name="matchers.mrp">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-matchers-nc12" class="control-label">'),__append(helpers.t("PROPERTY:nc12")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-matchers-nc12" class="form-control" type="text" autocomplete="new-password" name="matchers.nc12">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-matchers-name" class="control-label">'),__append(helpers.t("PROPERTY:name")),__append('</label>\n        <textarea id="'),__append(idPrefix),__append('-matchers-name" class="form-control" type="text" name="matchers.name" rows="4" style="font-family: monospace"></textarea>\n      </div>\n      <label class="control-label">'),__append(helpers.t("PROPERTY:components")),__append('</label>\n      <table class="table table-bordered table-condensed">\n        <thead>\n        <tr>\n          <th class="is-min">'),__append(helpers.t("core","#")),__append('</th>\n          <th class="is-min">'),__append(helpers.t("PROPERTY:components.pattern")),__append('</th>\n          <th class="is-min">'),__append(helpers.t("PROPERTY:components.description")),__append('</th>\n          <th class="is-min text-center">'),__append(helpers.t("PROPERTY:components.single")),__append('</th>\n          <th class="is-min text-center">'),__append(helpers.t("PROPERTY:components.unique")),__append('</th>\n          <th class="is-min">'),__append(helpers.t("PROPERTY:components.nc12Index")),__append('</th>\n          <th class="is-min">'),__append(helpers.t("PROPERTY:components.snIndex")),__append("</th>\n          <th>"),__append(helpers.t("PROPERTY:components.labelPattern")),__append('</th>\n          <th class="actions">'),__append(helpers.t("core","LIST:COLUMN:actions")),__append('</th>\n        </tr>\n        </thead>\n        <tbody id="'),__append(idPrefix),__append('-components"></tbody>\n      </table>\n      <button id="'),__append(idPrefix),__append('-addComponent" type="button" class="btn btn-default"><i class="fa fa-plus"></i><span>'),__append(helpers.t("FORM:ACTION:addComponent")),__append('</span></button>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});