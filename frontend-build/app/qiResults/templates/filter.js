define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escape=escape||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form qiResults-filter">\n  <div class="form-group">\n    <label>'),__append(t("qiResults","filter:result")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-result" class="btn-group filter-btn-group qiResults-filter-result" data-toggle="buttons">\n      <label class="btn btn-default qiResults-filter-ok"><input type="radio" name="result" value="ok"> '),__append(t("qiResults","filter:result:ok")),__append('</label>\n      <label class="btn btn-default qiResults-filter-nok"><input type="radio" name="result" value="nok"> '),__append(t("qiResults","filter:result:nok")),__append('</label>\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-from">'),__append(t("core","filter:date:from")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-from" class="form-control" name="from" type="date" placeholder="'),__append(t("core","placeholder:date")),__append('" min="2016-01-01">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-to">'),__append(t("core","filter:date:to")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-to" class="form-control" name="to" type="date" placeholder="'),__append(t("core","placeholder:date")),__append('" min="2016-01-01">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-order">'),__append(t("qiResults","filter:order")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-order" class="form-control" name="order" type="text" maxlength="12">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-productFamily">'),__append(t("qiResults","filter:productFamily")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-productFamily" name="productFamily" type="text">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-division">'),__append(t("qiResults","filter:division")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-division" name="division" type="text">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-kind">'),__append(t("qiResults","filter:kind")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-kind" name="kind" type="text">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-errorCategory">'),__append(t("qiResults","PROPERTY:errorCategory")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-errorCategory" name="errorCategory" type="text">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-faultCode">'),__append(t("qiResults","PROPERTY:faultCode")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-faultCode" name="faultCode" type="text">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-inspector">'),__append(t("qiResults","PROPERTY:inspector")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-inspector" name="inspector" type="text">\n  </div>\n  '),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escape(t("qiResults","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});