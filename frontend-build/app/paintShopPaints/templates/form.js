define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-_id" class="control-label is-required">'),__append(t("paintShopPaints","PROPERTY:_id")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-_id" class="form-control" type="text" autocomplete="new-password" name="_id" required maxlength="12" pattern="^[0-9]{12}$">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-shelf" class="control-label is-required">'),__append(t("paintShopPaints","PROPERTY:shelf")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-shelf" class="form-control" type="text" autocomplete="new-password" name="shelf" required maxlength="2">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-bin" class="control-label is-required">'),__append(t("paintShopPaints","PROPERTY:bin")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-bin" class="form-control" type="text" autocomplete="new-password" name="bin" required maxlength="6">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-name" class="control-label is-required">'),__append(t("paintShopPaints","PROPERTY:name")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-name" class="form-control" type="text" autocomplete="new-password" name="name" required maxlength="40">\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});