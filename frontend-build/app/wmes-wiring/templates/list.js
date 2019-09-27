define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="wiring-list is-colored">\n  <table class="table table-bordered table-hover">\n    <thead>\n    <tr>\n      '),[{id:"mrp",class:"is-min"},{id:"nc12",class:"is-min"},{id:"name",class:"is-min"},{id:"qty",class:"is-min",colSpan:3},{id:"leadingOrders",class:"is-min"},{id:"status",class:"is-min"}].forEach(function(n){__append('\n      <th class="'),__append(n.class||""),__append('" colspan="'),__append(n.colSpan||1),__append('" style="min-width: '),__append(n.width?n.width:"1"),__append('px">'),__append(helpers.t("prop:"+n.id)),__append("</th>\n      ")}),__append("\n      "),canUpdate&&(__append('\n      <th class="actions">'),__append(t("core","LIST:COLUMN:actions")),__append("</th>\n      ")),__append("\n      <th></th>\n    </tr>\n    </thead>\n    <tbody>\n      "),rows.forEach(function(n){__append("\n      "),__append(renderRow({canUpdate:canUpdate,row:n})),__append("\n      ")}),__append("\n    </tbody>\n  </table>\n</div>\n");return __output.join("")}});