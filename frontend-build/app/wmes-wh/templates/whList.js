define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<div class="planning-mrp-lineOrders-list">\n  <table class="planning-mrp-lineOrders-table">\n    <thead>\n      <tr>\n        '),[{id:"no",class:"is-min text-center",width:35},{id:"group",class:"is-min text-center",width:29},{id:"mrp",class:"is-min",width:42},{id:"order",class:"is-min",width:71},{id:"planStatus",class:"is-min",width:71},{id:"nc12",class:"is-min",width:91},{id:"name",class:"is-min",width:315},{id:"qty",class:"is-min",width:55},{id:"shift",class:"is-min text-center",width:35},{id:"startTime",class:"is-min",width:68},{id:"finishTime",class:"is-min",width:58},{id:"line",class:"is-min",width:50},{id:"whStatus",class:"is-min",width:80},{id:"set",class:"is-min text-center",width:35},{id:"picklist",class:"is-min text-center",width:50},{id:"fmx",class:"is-min text-center",width:50},{id:"kitter",class:"is-min text-center",width:50},{id:"packer",class:"is-min text-center",width:50},{id:"comment"}].forEach(function(n){__append('\n        <th class="'),__append(n.class||""),__append('" colspan="'),__append(n.colSpan||1),__append('" style="min-width: '),__append(n.width?n.width:"1"),__append('px">'),__append(t("wh","prop:"+n.id)),__append("</th>\n        ")}),__append("\n      </tr>\n    </thead>\n    <tbody>\n      "),rows.forEach(function(n){__append("\n      "),n.newGroup?__append('\n      <tr class="planning-wh-newGroup-tr">\n        <td class="planning-wh-newGroup" colspan="999"></td>\n      </tr>\n      '):n.newLine&&__append('\n      <tr class="planning-wh-newLine-tr">\n        <td class="planning-wh-newLine" colspan="999"></td>\n      </tr>\n      '),__append("\n      "),__append(renderRow({row:n})),__append("\n      ")}),__append("\n    </tbody>\n  </table>\n</div>\n");return __output}});