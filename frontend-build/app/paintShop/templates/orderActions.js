define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(t){return _ENCODE_HTML_RULES[t]||t}var __output="";function __append(t){void 0!==t&&null!==t&&(__output+=t)}with(locals||{})__append('<div class="paintShop-orderDetails-actions">\n  '),"new"===order.status||"aside"===order.status?(__append("\n  "),order.drilling?(__append('\n  <button class="btn btn-info" type="button" data-action="start" data-cabin="0">'),__append(t("action:start")),__append("</button>\n  ")):(__append('\n  <div class="paintShop-orderDetails-actions-group">\n    <button class="btn btn-info" type="button" data-action="start" data-cabin="1">'),__append(t("action:start:cabin",{cabin:1})),__append('</button>\n    <button class="btn btn-info" type="button" data-action="start" data-cabin="2">'),__append(t("action:start:cabin",{cabin:2})),__append("</button>\n  </div>\n  ")),__append("\n  "),"new"===order.status?(__append('\n  <button class="btn btn-danger" type="button" data-action="aside">'),__append(t("action:aside")),__append("</button>\n  ")):(__append('\n  <button class="btn btn-default" type="button" data-action="reset">'),__append(t("action:reset")),__append("</button>\n  ")),__append('\n  <button class="btn btn-danger" type="button" data-action="cancel">'),__append(t("action:cancel")),__append("</button>\n  ")):"cancelled"===order.status?(__append('\n  <button class="btn btn-default" type="button" data-action="reset">'),__append(t("action:reset")),__append("</button>\n  ")):"started"===order.status?(__append('\n  <div class="paintShop-orderDetails-qtyDone">\n    <input id="'),__append(idPrefix),__append('-qtyDone" class="form-control" type="text" autocomplete="new-password" maxlength="3" min="0" max="999" placeholder="'),__append(order.qty),__append('" data-vkb="numeric">\n    <button class="btn btn-success" type="button" data-action="finish" title="'),__append(t("action:finish")),__append('"><i class="fa fa-check"></i></button>\n  </div>\n  <button class="btn btn-default" type="button" data-action="reset">'),__append(t("action:reset")),__append('</button>\n  <button class="btn btn-danger" type="button" data-action="cancel">'),__append(t("action:cancel")),__append("</button>\n  ")):"partial"===order.status?(__append("\n  "),order.drilling?(__append('\n  <button class="btn btn-info" type="button" data-action="start" data-cabin="0">'),__append(t("action:continue")),__append("</button>\n  ")):(__append('\n  <div class="paintShop-orderDetails-actions-group">\n    <button class="btn btn-info" type="button" data-action="continue" data-cabin="1">'),__append(t("action:continue:cabin",{cabin:1})),__append('</button>\n    <button class="btn btn-info" type="button" data-action="continue" data-cabin="2">'),__append(t("action:continue:cabin",{cabin:2})),__append("</button>\n  </div>\n  ")),__append('\n  <button class="btn btn-default" type="button" data-action="reset">'),__append(t("action:reset")),__append('</button>\n  <button class="btn btn-danger" type="button" data-action="cancel">'),__append(t("action:cancel")),__append("</button>\n  ")):"finished"!==order.status&&"delivered"!==order.status||(__append('\n  <div class="paintShop-orderDetails-qtyDlv">\n    <input id="'),__append(idPrefix),__append('-qtyDlv" class="form-control" type="text" autocomplete="new-password" maxlength="4" min="0" max="999" placeholder="'),__append(Math.max(0,order.qty-order.qtyDlv)),__append('" data-vkb="numeric negative">\n    <button class="btn btn-success" type="button" data-action="deliver" title="'),__append(t("action:deliver")),__append('"><i class="fa fa-shopping-cart"></i></button>\n  </div>\n  '),order.drilling?(__append('\n  <button class="btn btn-info" type="button" data-action="start" data-cabin="0">'),__append(t("action:continue")),__append("</button>\n  ")):(__append('\n  <div class="paintShop-orderDetails-actions-group">\n    <button class="btn btn-info" type="button" data-action="continue" data-cabin="1">'),__append(t("action:continue:cabin",{cabin:1})),__append('</button>\n    <button class="btn btn-info" type="button" data-action="continue" data-cabin="2">'),__append(t("action:continue:cabin",{cabin:2})),__append("</button>\n  </div>\n  ")),__append('\n  <button class="btn btn-default" type="button" data-action="reset">'),__append(t("action:reset")),__append('</button>\n  <button class="btn btn-danger" type="button" data-action="cancel">'),__append(t("action:cancel")),__append("</button>\n  ")),__append("\n</div>\n");return __output}});