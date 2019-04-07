define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-_id" class="control-label is-required">'),__append(helpers.t("PROPERTY:_id")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-_id" class="form-control" type="text" autocomplete="new-password" name="_id" required maxlength="40" pattern="^[A-Za-z0-9-]{1,40}$">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-name" class="control-label is-required">'),__append(helpers.t("PROPERTY:name")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-name" class="form-control" type="text" autocomplete="new-password" name="name" required maxlength="100">\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__append(helpers.t("PROPERTY:io")),__append('</label>\n        <table class="table table-bordered table-condensed">\n          <thead>\n          <tr>\n            <th style="width: 175px">'),__append(helpers.t("PROPERTY:io._id")),__append('</th>\n            <th style="width: 250px">'),__append(helpers.t("PROPERTY:io.name")),__append('</th>\n            <th class="is-min">'),__append(helpers.t("PROPERTY:io.type")),__append('</th>\n            <th style="width: 125px">'),__append(helpers.t("PROPERTY:io.device")),__append('</th>\n            <th style="width: 125px">'),__append(helpers.t("PROPERTY:io.channel")),__append('</th>\n            <th></th>\n            <th class="actions"></th>\n          </tr>\n          </thead>\n          <tbody id="'),__append(idPrefix),__append('-io">\n          <tr>\n            <td><input name="io[]._id" class="form-control" type="text" maxlength="40" pattern="^[A-Za-z0-9-_.]{1,40}$"></td>\n            <td><input name="io[].name" class="form-control" type="text" maxlength="100"></td>\n            <td class="is-min">\n              '),ioTypes.forEach(function(n,e){__append('\n              <label class="radio-inline">\n                <input name="io[].type" type="radio" value="'),__append(n),__append('" '),__append(0===e?"checked":""),__append("> "),__append(helpers.t("ioType:"+n)),__append("\n              </label>\n              ")}),__append('\n            </td>\n            <td><input name="io[].device" class="form-control" type="number" min="0" max="127"></td>\n            <td><input name="io[].channel" class="form-control" type="number" min="0" max="24"></td>\n            <td></td>\n            <td class="actions">\n              <div class="actions-group">\n                <button class="btn btn-default" type="button" data-action="removeIo"><i class="fa fa-times"></i></button>\n              </div>\n            </td>\n          </tr>\n          </tbody>\n        </table>\n        <button id="'),__append(idPrefix),__append('-addIo" class="btn btn-default" type="button"><i class="fa fa-plus"></i></button>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});