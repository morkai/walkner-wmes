define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-id" class="control-label is-required">'),__append(helpers.t("PROPERTY:_id")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-id" class="form-control" type="text" autocomplete="new-password" name="_id" autofocus required maxlength="20" pattern="^[A-Za-z0-9-_]+$">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-name" class="control-label is-required">'),__append(helpers.t("PROPERTY:name")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-name" class="form-control" type="text" autocomplete="new-password" name="name" required maxlength="100">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-manager" class="control-label">'),__append(helpers.t("PROPERTY:manager")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-manager" type="text" autocomplete="new-password" name="manager">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-position" class="control-label is-required">'),__append(helpers.t("PROPERTY:position")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-position" class="form-control" type="number" name="position" min="0" required>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});