define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="divisions-form" method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-_id" class="control-label is-required">'),__append(t("divisions","PROPERTY:_id")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-_id" class="form-control" type="text" autocomplete="new-password" name="_id" autofocus required maxlength="50" pattern="^[a-zA-Z][a-zA-Z0-9_\\-]*$">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-type" class="control-label is-required">'),__append(t("divisions","PROPERTY:type")),__append('</label>\n        <div class="radio">\n          <label><input type="radio" name="type" value="prod" checked required> '),__append(t("divisions","TYPE:prod")),__append('</label>\n        </div>\n        <div class="radio">\n          <label><input type="radio" name="type" value="dist" required> '),__append(t("divisions","TYPE:dist")),__append('</label>\n        </div>\n        <div class="radio">\n          <label><input type="radio" name="type" value="other" required> '),__append(t("divisions","TYPE:other")),__append('</label>\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-description" class="control-label is-required">'),__append(t("divisions","PROPERTY:description")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-description" class="form-control" type="text" autocomplete="new-password" name="description" required maxlength="150">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-deactivatedAt" class="control-label">'),__append(t("divisions","PROPERTY:deactivatedAt")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-deactivatedAt" class="form-control" type="date" name="deactivatedAt" maxlength="10">\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});