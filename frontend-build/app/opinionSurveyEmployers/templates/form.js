define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-id" class="control-label is-required">'),__append(t("opinionSurveyEmployers","PROPERTY:_id")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-id" class="form-control" type="text" autocomplete="new-password" name="_id" autofocus required maxlength="30" pattern="^[A-Za-z0-9-_]+$">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-short" class="control-label is-required">'),__append(t("opinionSurveyEmployers","PROPERTY:short")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-short" class="form-control" type="text" autocomplete="new-password" name="short" required maxlength="30">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-full" class="control-label is-required">'),__append(t("opinionSurveyEmployers","PROPERTY:full")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-full" class="form-control" type="text" autocomplete="new-password" name="full" required maxlength="250">\n      </div>\n      '),__append(renderColorPicker({idPrefix:idPrefix,property:"color",label:t("opinionSurveyEmployers","PROPERTY:color"),value:model.color})),__append('\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});