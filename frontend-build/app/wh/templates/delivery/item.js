define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<tbody class="wh-delivery-item '),__append(item.className),__append('" data-id="'),__append(item._id),__append('">\n<tr>\n  <td class="wh-delivery-item-cart">'),__append(item.cart),__append('</td>\n  <td class="wh-delivery-item-line '),__append(item.line.className),__append('" title="'),__append(escapeFn(item.line.title)),__append('">'),__append(item.line.label),__append('\n  </td>\n  <td class="wh-delivery-item-plan">\n    '),__append(item.date),__append("\n    <br>\n    "),__append(item.set),__append("\n  </td>\n  "),"delivering"===item.status&&(__append('\n  <td class="wh-delivery-item-info">\n    <i class="fa fa-hourglass-start"></i><span>'),__append(time.format(item.deliveringAt,"L LT")),__append('</span>\n    <br>\n    <i class="fa fa-user"></i><span>'),__append(escapeFn(item.deliveringBy.label)),__append("</span>\n  </td>\n  ")),__append('\n</tr>\n<tr class="wh-delivery-item-ft">\n  <td></td>\n  <td class="wh-delivery-item-orders" colspan="3">\n    '),item.sapOrders.forEach(function(e){__append('\n    <span class="wh-delivery-item-order">'),__append(e),__append("</span>\n    ")}),__append("\n  </td>\n</tr>\n</tbody>\n");return __output}});