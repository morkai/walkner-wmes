define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append("<h1>"),__append(t("isa","msg:accept:header",{requestType:requestType})),__append("</h1>\n<table>\n  <tbody>\n  "),"delivery"===requestType&&(__append("\n  <tr>\n    <th>Rodzaj palety:</th>\n    <td>"),__append(escape(palletKind)),__append("</td>\n  </tr>\n  ")),__append("\n  <tr>\n    <th>"),__append(t("isa","lineState:whman")),__append(":</th>\n    <td>"),__append(escape(whman)),__append("</td>\n  </tr>\n  <tr>\n    <th>"),__append(t("isa","lineState:division")),__append(":</th>\n    <td>"),__append(escape(orgUnit.division)),__append("</td>\n  </tr>\n  <tr>\n    <th>"),__append(t("isa","lineState:prodFlow")),__append(":</th>\n    <td>"),__append(escape(orgUnit.prodFlow)),__append("</td>\n  </tr>\n  <tr>\n    <th>"),__append(t("isa","lineState:workCenter")),__append(":</th>\n    <td>"),__append(escape(orgUnit.workCenter)),__append("</td>\n  </tr>\n  <tr>\n    <th>"),__append(t("isa","lineState:prodLine")),__append(":</th>\n    <td>"),__append(escape(orgUnit.prodLine)),__append("</td>\n  </tr>\n  </tbody>\n</table>\n");return __output.join("")}});