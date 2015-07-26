define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<form class="well filter-form orderDocumentClients-filter">\n  <div class="form-group">\n    <label>'),__output.push(t("orderDocumentClients","PROPERTY:status")),__output.push('</label>\n    <div id="'),__output.push(idPrefix),__output.push('-status" class="btn-group filter-btn-group" data-toggle="buttons">\n      <label class="btn btn-default"><input type="checkbox" name="status[]" value="online"><i class="fa fa-plug"></i><span>'),__output.push(t("orderDocumentClients","status:online")),__output.push('</span></label>\n      <label class="btn btn-default"><input type="checkbox" name="status[]" value="offline"><i class="fa fa-power-off"></i><span>'),__output.push(t("orderDocumentClients","status:offline")),__output.push('</span></label>\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-prodLine">'),__output.push(t("orderDocumentClients","PROPERTY:prodLine")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-prodLine" class="form-control orderDocumentClients-filter-prodLine" name="prodLine" type="text">\n  </div>\n  '),__output.push(renderLimit()),__output.push('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__output.push(escape(t("orderDocumentClients","filter:submit"))),__output.push("</span></button>\n  </div>\n</form>\n");return __output.join("")}});