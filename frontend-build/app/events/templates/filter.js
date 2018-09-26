define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form id="'),__append(idPrefix),__append('-form" class="well filter-form">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-from-date">'),__append(t("core","filter:date:from")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-from" class="form-group-datetime">\n      <input id="'),__append(idPrefix),__append('-from-date" class="form-control" name="from-date" type="date" placeholder="YYYY-MM-DD">\n      <input id="'),__append(idPrefix),__append('-from-time" class="form-control" name="from-time" type="time" placeholder="hh:mm">\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-to-date">'),__append(t("core","filter:date:to")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-to" class="form-group-datetime">\n      <input id="'),__append(idPrefix),__append('-to-date" class="form-control" name="to-date" type="date" placeholder="YYYY-MM-DD">\n      <input id="'),__append(idPrefix),__append('-to-time" class="form-control" name="to-time" type="time" placeholder="hh:mm">\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-type">'),__append(t("events","PROPERTY:type")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-type" name="type" type=text" placeholder="'),__append(escapeFn(t("events","filter:placeholder:type"))),__append('">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-user">'),__append(t("events","PROPERTY:user")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-user" name="user" type="text" autocomplete="new-password">\n  </div>\n  '),__append(renderLimit()),__append('\n  <div class="form-group">\n    <label>'),__append(t("events","PROPERTY:severity")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-severity" class="btn-group filter-btn-group" data-toggle="buttons-checkbox">\n      <button class="btn btn-default" type="button" value="debug">&nbsp;</button>\n      <button class="btn btn-info" type="button" value="info">&nbsp;</button>\n      <button class="btn btn-success" type="button" value="success">&nbsp;</button>\n      <button class="btn btn-warning" type="button" value="warning">&nbsp;</button>\n      <button class="btn btn-danger" type="button" value="error">&nbsp;</button>\n    </div>\n  </div>\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(t("events","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});