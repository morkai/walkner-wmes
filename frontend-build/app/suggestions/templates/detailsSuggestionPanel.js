define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="col-md-'),__append(suggestionColumnSize),__append('">\n  <div class="panel panel-warning">\n    <div class="panel-heading">'),__append(t("suggestions","type:suggestion")),__append('</div>\n    <div class="panel-details '),__append(model.changed.all?"is-changed":""),__append('">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.suggestionOwners?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:suggestionOwners")),__append('</div>\n          <div class="prop-value">\n            <ul>\n              '),model.suggestionOwners.forEach(function(n){__append("\n              <li>"),__append(n),__append("</li>\n              ")}),__append('\n            </ul>\n          </div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.date?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:date")),__append('</div>\n          <div class="prop-value">'),__append(model.date||"-"),__append('</div>\n        </div>\n        <div class="prop" data-dictionary="categories" data-property="category">\n          <div class="prop-name '),__append(model.changed.categories?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:categories")),__append(' <i class="fa fa-info-circle"></i></div>\n          <div class="prop-value">'),__append(escapeFn(model.categories)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.productFamily?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:productFamily")),__append('</div>\n          <div class="prop-value">'),__append(model.productFamily||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.howItIs?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:howItIs")),__append('</div>\n          <div class="prop-value text-lines">'),__append(model.howItIs||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.howItShouldBe?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:howItShouldBe")),__append('</div>\n          <div class="prop-value text-lines">'),__append(model.howItShouldBe||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.suggestion?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:suggestion")),__append('</div>\n          <div class="prop-value text-lines">'),__append(model.suggestion||"-"),__append("</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});