define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<tr>\n  <td class="is-min">\n    <input type="hidden" name="observations['),__append(i),__append('].behavior" value="'),__append(observation.id),__append('">\n    '),__append(escapeFn(observation.behavior)),__append('\n  </td>\n  <td class="is-min behaviorObsCards-form-radio">\n    <input type="radio" name="observations['),__append(i),__append('].safe" value="1" '),__append(!0===observation.safe?"checked":""),__append('>\n  </td>\n  <td class="is-min behaviorObsCards-form-radio">\n    <input type="radio" name="observations['),__append(i),__append('].safe" value="0" '),__append(!1===observation.safe?"checked":""),__append('>\n  </td>\n  <td class="behaviorObsCards-form-textarea">\n    <textarea class="form-control" name="observations['),__append(i),__append('].observation" rows="2" required '),__append(!1!==observation.safe?"disabled":""),__append(">"),__append(escapeFn(observation.observation)),__append('</textarea>\n  </td>\n  <td class="behaviorObsCards-form-textarea">\n    <textarea class="form-control" name="observations['),__append(i),__append('].cause" rows="2" required '),__append(!1!==observation.safe?"disabled":""),__append(">"),__append(escapeFn(observation.cause)),__append('</textarea>\n  </td>\n  <td class="is-min behaviorObsCards-form-radio">\n    <input type="radio" name="observations['),__append(i),__append('].easy" value="1" required '),__append(!1===observation.safe&&!0===observation.easy?"checked":""),__append(" "),__append(!1!==observation.safe?"disabled":""),__append('>\n  </td>\n  <td class="is-min behaviorObsCards-form-radio">\n    <input type="radio" name="observations['),__append(i),__append('].easy" value="0" required '),__append(!1===observation.safe&&!1===observation.easy?"checked":""),__append(" "),__append(!1!==observation.safe?"disabled":""),__append('>\n    <input type="radio" name="observations['),__append(i),__append('].safe" value="-1" tabindex="-1" '),__append(null===observation.safe?"checked":""),__append(">\n  </td>\n</tr>\n");return __output.join("")}});