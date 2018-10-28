define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-nc12" class="control-label is-required">'),__append(t("xiconfComponentWeights","PROPERTY:nc12")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-nc12" class="form-control" type="text" autocomplete="new-password" name="nc12" maxlength="12" required autofocus pattern="^[0-9]{12}$">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-description" class="control-label is-required">'),__append(t("xiconfComponentWeights","PROPERTY:description")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-description" class="form-control" type="text" autocomplete="new-password" name="description" maxlength="100" required>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-minWeight" class="control-label is-required">'),__append(t("xiconfComponentWeights","PROPERTY:minWeight")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-minWeight" class="form-control" type="number" name="minWeight" required min="1" step="1">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-maxWeight" class="control-label is-required">'),__append(t("xiconfComponentWeights","PROPERTY:maxWeight")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-maxWeight" class="form-control" type="number" name="maxWeight" required min="1" step="1">\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});