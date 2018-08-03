define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-_id" class="control-label is-required">'),__append(helpers.t("PROPERTY:_id")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-_id" class="form-control" type="text" name="_id" required pattern="^[A-Za-z0-9_-]{1,10}$">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-name" class="control-label is-required">'),__append(helpers.t("PROPERTY:name")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-name" class="form-control" type="text" name="name" required>\n      </div>\n      <div style="display: flex">\n        '),["length","width","height"].forEach(function(e){__append('\n        <div class="form-group">\n          <label for="'),__append(idPrefix),__append("-"),__append(e),__append('" class="control-label is-required">'),__append(helpers.t("PROPERTY:"+e)),__append('</label>\n          <input id="'),__append(idPrefix),__append("-"),__append(e),__append('" class="form-control" type="number" name="'),__append(e),__append('" required min="0" step="1" style="width: 125px; margin-right: 15px">\n        </div>\n        ')}),__append('\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-image" class="control-label">'),__append(helpers.t("PROPERTY:image")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-image" class="form-control" type="file" name="image" accept="image/jpeg,image/png">\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});