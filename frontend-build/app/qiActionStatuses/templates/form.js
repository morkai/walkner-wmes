define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-_id" class="control-label is-required">'),__append(t("qiActionStatuses","PROPERTY:_id")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-_id" class="form-control" type="text" autocomplete="new-password" name="_id" required maxlength="30" pattern="^[A-Za-z0-9-]+$">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-name" class="control-label is-required">'),__append(t("qiActionStatuses","PROPERTY:name")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-name" class="form-control" type="text" autocomplete="new-password" name="name" required maxlength="100">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-position" class="control-label is-required">'),__append(t("qiActionStatuses","PROPERTY:position")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-position" class="form-control" type="number" name="position" required>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});