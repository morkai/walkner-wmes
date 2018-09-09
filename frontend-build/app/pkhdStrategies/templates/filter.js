define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form" autocomplete="off">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-s">'),__append(t("pkhdStrategies","PROPERTY:s")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-s" class="form-control no-controls" name="s" type="number" min="0" max="999">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-t">'),__append(t("pkhdStrategies","PROPERTY:t")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-t" class="form-control no-controls" name="t" type="number" min="0" max="999">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-name">'),__append(t("pkhdStrategies","PROPERTY:name")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-name" class="form-control" name="name" type="text">\n  </div>\n  '),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(t("pkhdStrategies","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});