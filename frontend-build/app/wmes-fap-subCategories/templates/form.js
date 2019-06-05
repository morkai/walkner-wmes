define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <div class="checkbox">\n          <label class="control-label">\n            <input type="checkbox" name="active" value="true">\n            '),__append(helpers.t("PROPERTY:active")),__append('\n          </label>\n        </div>\n      </div>\n      <div class="form-group has-required-select2">\n        <label for="'),__append(idPrefix),__append('-parent" class="control-label is-required">'),__append(helpers.t("PROPERTY:parent")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-parent" name="parent" type="text" autocomplete="new-password" required autofocus>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-name" class="control-label is-required">'),__append(helpers.t("PROPERTY:name")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-name" class="form-control" type="text" autocomplete="new-password" name="name" required maxlength="100">\n      </div>\n      <div class="form-group">\n        <label class="control-label">\n          <input id="'),__append(idPrefix),__append('-etoCategoryToggle" name="etoCategoryToggle" type="checkbox" value="true">\n          '),__append(helpers.t("PROPERTY:etoCategory")),__append('\n        </label>\n        <input id="'),__append(idPrefix),__append('-etoCategory" type="text" autocomplete="new-password" name="etoCategory">\n      </div>\n      <div class="form-group">\n        <div class="checkbox">\n          <label class="control-label">\n            <input type="checkbox" name="planners" value="true">\n            '),__append(helpers.t("PROPERTY:planners")),__append('\n          </label>\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-users" class="control-label">'),__append(helpers.t("PROPERTY:users")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-users" type="text" autocomplete="new-password" name="users">\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__append(helpers.t("PROPERTY:notifications")),__append('</label>\n        <table class="table table-bordered table-condensed">\n          <thead>\n          <tr>\n            <th class="is-min">'),__append(helpers.t("PROPERTY:notifications.subdivisions")),__append('</th>\n            <th class="is-min">'),__append(helpers.t("PROPERTY:notifications.prodFunctions")),__append('</th>\n            <th class="actions">'),__append(t("core","LIST:COLUMN:actions")),__append('</th>\n            <th></th>\n          </tr>\n          </thead>\n          <tbody id="'),__append(idPrefix),__append('-notifications">\n          <tr>\n            <td><input name="notifications[].subdivisions" type="text"></td>\n            <td><input name="notifications[].prodFunctions" type="text"></td>\n            <td class="actions">\n              <div class="actions-group">\n                <button type="button" class="btn btn-default" data-action="removeNotification"><i class="fa fa-times"></i></button>\n              </div>\n            </td>\n            <td></td>\n          </tr>\n          </tbody>\n        </table>\n        <button id="'),__append(idPrefix),__append('-addNotification" class="btn btn-default" type="button"><i class="fa fa-plus"></i><span>'),__append(helpers.t("FORM:notifications:add")),__append('</span></button>\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__append(helpers.t("FORM:tester:label")),__append('</label>\n        <div style="display: flex; margin-bottom: 5px">\n          <input id="'),__append(idPrefix),__append('-tester-mrp" class="form-control text-mono" type="text" style="width: 46px" placeholder="'),__append(helpers.t("FORM:tester:mrp")),__append('">\n          <input id="'),__append(idPrefix),__append('-tester-orderNo" class="form-control text-mono" type="text" style="width: 85px; margin-left: 5px" placeholder="'),__append(helpers.t("FORM:tester:orderNo")),__append('">\n          <input id="'),__append(idPrefix),__append('-tester-nc12" class="form-control text-mono" type="text" style="width: 110px; margin-left: 5px" placeholder="'),__append(helpers.t("FORM:tester:nc12")),__append('">\n          <input id="'),__append(idPrefix),__append('-tester-date" class="form-control" type="datetime-local" style="width: 200px; margin-left: 5px">\n        </div>\n        <table class="table table-bordered table-condensed" style="margin-bottom: 0">\n          <thead>\n          <tr>\n            <th class="is-min">'),__append(helpers.t("users","PROPERTY:name")),__append('</th>\n            <th class="is-min">'),__append(helpers.t("users","PROPERTY:prodFunction")),__append('</th>\n            <th class="is-min">'),__append(helpers.t("users","PROPERTY:kdPosition")),__append('</th>\n            <th class="is-min">'),__append(helpers.t("FORM:tester:sms")),__append('</th>\n            <th></th>\n          </tr>\n          </thead>\n          <tbody id="'),__append(idPrefix),__append('-tester">\n          <tr>\n            <td class="is-min"></td>\n            <td class="is-min"></td>\n            <td class="is-min"></td>\n            <td class="is-min"></td>\n            <td></td>\n          </tr>\n          </tbody>\n        </table>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});