define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form xiconf-filter">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-from">'),__append(t("core","filter:date:from")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-from" class="form-control" name="from" type="datetime-local" placeholder="YYYY-MM-DD HH:mm">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-to">'),__append(t("core","filter:date:to")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-to" class="form-control" name="to" type="datetime-local" placeholder="YYYY-MM-DD HH:mm">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-srcId">'),__append(t("xiconf","PROPERTY:srcId")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-srcId" name="srcId" type="text" placeholder="'),__append(t("xiconf","filter:placeholder:srcId")),__append('">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-serviceTag">'),__append(t("xiconf","PROPERTY:serviceTag")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-serviceTag" class="form-control" name="serviceTag" type="text" pattern="^(P|p)[0-9]+$">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-orderNo">'),__append(t("xiconf","PROPERTY:no")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-orderNo" class="form-control" name="orderNo" type="text" maxlength="9" pattern="^[0-9]+$">\n  </div>\n  <div class="form-group">\n    <div class="filter-radioLabels">\n      <label>\n        <input name="nc12Type" type="radio" value="program">\n        '),__append(t("xiconf","filter:nc12Type:program")),__append('\n      </label><label>\n        <input name="nc12Type" type="radio" value="led">\n        '),__append(t("xiconf","filter:nc12Type:led")),__append('\n      </label>\n    </div>\n    <input id="'),__append(idPrefix),__append('-nc12" class="form-control" name="nc12" type="text" maxlength="12">\n  </div>\n  <div class="form-group">\n    <label>'),__append(t("xiconf","PROPERTY:result")),__append('</label>\n    <div class="btn-group filter-btn-group xiconf-filter-result" data-toggle="buttons">\n      <label class="btn btn-success xiconf-filter-success">\n        <input type="checkbox" name="result[]" value="success"> '),__append(t("xiconf","filter:result:success")),__append('\n      </label>\n      <label class="btn btn-danger xiconf-filter-failure">\n        <input type="checkbox" name="result[]" value="failure"> '),__append(t("xiconf","filter:result:failure")),__append("\n      </label>\n    </div>\n  </div>\n  "),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(t("xiconf","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});