define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form pfepEntries-filter">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-from">'),__append(t("core","filter:date:from")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-from" class="form-control" name="from" type="date" placeholder="'),__append(t("core","placeholder:date")),__append('" min="2016-01-01">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-to">'),__append(t("core","filter:date:to")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-to" class="form-control" name="to" type="date" placeholder="'),__append(t("core","placeholder:date")),__append('" min="2016-01-01">\n  </div>\n  <div class="form-group hidden" data-filter="nc12">\n    <label for="'),__append(idPrefix),__append('-nc12">'),__append(t("pfepEntries","filter:nc12")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-nc12" class="form-control" name="nc12" type="text" autocomplete="new-password" maxlength="12">\n  </div>\n  <div class="form-group hidden" data-filter="packType">\n    <label for="'),__append(idPrefix),__append('-packType">'),__append(t("pfepEntries","filter:packType")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-packType" class="form-control" name="packType" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group hidden" data-filter="vendor">\n    <label for="'),__append(idPrefix),__append('-vendor">'),__append(t("pfepEntries","filter:vendor")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-vendor" class="form-control" name="vendor" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group hidden" data-filter="creator">\n    <label for="'),__append(idPrefix),__append('-creator">'),__append(t("pfepEntries","PROPERTY:creator")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-creator" name="creator" type="text" autocomplete="new-password">\n  </div>\n  '),__append(renderLimit({hidden:!0})),__append('\n  <div class="form-group filter-actions">\n    <div class="btn-group">\n      <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(t("pfepEntries","filter:submit")),__append('</span></button>\n      <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="'),__append(t("pfepEntries","filter:filters")),__append('"><span class="caret"></span></button>\n      <ul class="dropdown-menu">\n        '),filters.forEach(function(e){__append('\n        <li><a data-filter="'),__append(e),__append('">'),__append(escapeFn(t("pfepEntries","filter:"+e))),__append("</a></li>\n        ")}),__append("\n      </ul>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});