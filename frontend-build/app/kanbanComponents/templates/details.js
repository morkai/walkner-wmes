define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-primary">\n  <div class="panel-heading">'),__append(helpers.t("PANEL:TITLE:details")),__append('</div>\n  <div class="panel-details row">\n    <div class="col-md-8">\n      <div class="props first">\n        '),["_id","description","storageBin","newStorageBin","maxBinQty","minBinQty","replenQty"].forEach(function(n){__append('\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:"+n)),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model[n])),__append("</div>\n        </div>\n        ")}),__append('\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:markerColor")),__append('</div>\n          <div class="prop-value">'),__append(model.markerColor),__append('</div>\n        </div>\n      </div>\n    </div>\n    <div class="col-md-4">\n      <div class="props first">\n        '),["createdAt","updatedAt","updater"].forEach(function(n){__append('\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:"+n)),__append('</div>\n          <div class="prop-value">'),__append(model[n]),__append("</div>\n        </div>\n        ")}),__append("\n      </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});