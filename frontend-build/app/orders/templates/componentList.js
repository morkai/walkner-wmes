define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<div class="panel panel-default orders-bom">\n  <div class="panel-heading">'),__append(t("PANEL:TITLE:bom"+(paint?":paint":""))),__append("</div>\n  "),_.isEmpty(bom)?(__append('\n  <div class="panel-body">\n    '),__append(t("BOM:NO_DATA")),__append("\n  </div>\n  ")):(__append('\n  <div class="list">\n    <div class="table-responsive">\n      <table class="table table-condensed table-hover table-bordered table-striped">\n        <thead>\n          <tr>\n            '),bom.length&&bom[0].orderNo&&(__append('\n            <th class="is-min">'),__append(t("PROPERTY:bom.orderNo")),__append('\n            <th class="is-min">'),__append(t("PROPERTY:bom.mrp")),__append("\n            ")),__append('\n            <th class="is-min">'),__append(t("PROPERTY:bom.item")),__append('\n            <th class="is-min">'),__append(t("PROPERTY:bom.nc12")),__append('\n            <th class="is-min">'),__append(t("PROPERTY:bom.name")),__append('\n            <th class="is-min">'),__append(t("PROPERTY:bom.qty")),__append('\n            <th class="is-min">'),__append(t("PROPERTY:bom.unloadingPoint")),__append('\n            <th class="is-min">'),__append(t("PROPERTY:bom.supplyArea")),__append('\n            <th class="is-min">'),__append(t("PROPERTY:bom.distStrategy")),__append("\n            <th>\n          </tr>\n        </thead>\n        <tbody>\n          "),_.forEach(bom,function(n){__append("\n          <tr>\n            "),n.orderNo&&(__append('\n            <td class="is-min is-number"><a href="#orders/'),__append(n.orderNo),__append('">'),__append(n.orderNo),__append('</a>\n            <td class="is-min">'),__append(escapeFn(n.mrp)),__append("\n            ")),__append("\n            "),n.nc12?(__append('\n            <td class="is-min is-number orders-bom-item">'),__append(n.item),__append('\n            <td class="is-min is-number">\n              '),n.nc12&&(__append("\n              "),linkPfep?(__append('\n              <a class="orders-bom-pfep">'),__append(n.nc12),__append("</a>\n              ")):(__append("\n              "),__append(n.nc12),__append("\n              ")),__append("\n              ")),__append('\n            <td class="is-min">'),__append(escapeFn(n.name)),__append('\n            <td class="is-min is-number">'),__append(n.qty.toLocaleString()),__append(" "),__append(n.unit),__append('\n            <td class="is-min">'),__append(escapeFn(n.unloadingPoint||"")),__append('\n            <td class="is-min">'),__append(escapeFn(n.supplyArea||"")),__append('\n            <td class="is-min">'),__append(escapeFn(n.distStrategy||"")),__append("\n            <td>\n            ")):(__append('\n            <td colspan="8">'),__append(escapeFn(n.name)),__append("\n            ")),__append("\n          </tr>\n          ")}),__append("\n        </tbody>\n      </table>\n    </div>\n  </div>\n  ")),__append("\n</div>\n");return __output}});