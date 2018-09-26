define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form orderDocumentClients-filter">\n  <div class="form-group">\n    <label>'),__append(t("orderDocumentClients","PROPERTY:status")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-status" class="btn-group filter-btn-group" data-toggle="buttons">\n      <label class="btn btn-default"><input type="checkbox" name="status[]" value="online"><i class="fa fa-plug"></i><span>'),__append(t("orderDocumentClients","status:online")),__append('</span></label>\n      <label class="btn btn-default"><input type="checkbox" name="status[]" value="offline"><i class="fa fa-power-off"></i><span>'),__append(t("orderDocumentClients","status:offline")),__append('</span></label>\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-prodLine">'),__append(t("orderDocumentClients","PROPERTY:prodLine")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-prodLine" class="form-control orderDocumentClients-filter-prodLine" name="prodLine" type="text" autocomplete="new-password">\n  </div>\n  '),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(t("orderDocumentClients","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});