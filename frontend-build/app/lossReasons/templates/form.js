define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="lossReasons-form" method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-id" class="control-label is-required">'),__append(t("lossReasons","PROPERTY:_id")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-id" class="form-control" type="text" name="_id" autofocus required maxlength="50">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-label" class="control-label is-required">'),__append(t("lossReasons","PROPERTY:label")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-label" class="form-control" type="text" name="label" required maxlength="100">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-position" class="control-label is-required">'),__append(t("lossReasons","PROPERTY:position")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-position" class="form-control small" type="number" name="position" min="0" required>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});