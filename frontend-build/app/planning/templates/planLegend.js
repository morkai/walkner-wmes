define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<ul class="planning-legend">\n  <li>\n    <span class="planning-legend-order" style="background: #333">&nbsp;</span>\n    <strong>Anulowane</strong>\n    <small>Zlecenie ze statusem TECO otrzymanym po rozpoczęciu planu.</small>\n  </li>\n  <li>\n    <span class="planning-legend-order" style="background: #ffffff">&nbsp;</span>\n    <strong>Całkowicie rozplanowane</strong>\n    <small>Wszystkie sztuki zostały zaplanowane na dostępnych liniach / nierozpoczęte na żadnej linii.</small>\n  </li>\n  <li>\n    <span class="planning-legend-order" style="background: #fbf2c0">&nbsp;</span>\n    <strong>Całkowicie nierozplanowane</strong>\n    <small>Ani jedna sztuka danego zlecenia nie została zaplanowana na żadnej z dostępnych linii.</small>\n  </li>\n  <li>\n    <span class="planning-legend-order" style="background: #fcf8e3">&nbsp;</span>\n    <strong>Częściowo nierozplanowane</strong>\n    <small>Przynajmniej jedna sztuka danego zlecenia została zaplanowana na jednej z dostępnych linii, ale nie wszystkie.</small>\n  </li>\n  <li>\n    <span class="planning-legend-order" style="background: #d9edf7">&nbsp;</span>\n    <strong>Robione</strong>\n    <small>Zlecenie jest aktualnie wybrane na danej linii.</small>\n  </li>\n  <li>\n    <span class="planning-legend-order" style="background: #dff0d8">&nbsp;</span>\n    <strong>Zrobione / zgodne z sekwencją</strong>\n    <small>Zrobiono wymaganą ilość / zlecenie zgodne z sekwencją.</small>\n  </li>\n  <li>\n    <span class="planning-legend-order" style="background: #f9daf9">&nbsp;</span>\n    <strong>Niezgodne z sekwencją</strong>\n    <small>Zlecenie robione niezgodnie z sekwencją.</small>\n  </li>\n  <li>\n    <span class="planning-legend-order" style="background: #ffe8e8">&nbsp;</span>\n    <strong>Nadwyżka / problem</strong>\n    <small>Zrobiono więcej niż wymagano / problem podczas kompletacji magazynu.</small>\n  </li>\n  <li>\n    <span class="planning-legend-order"><span style="border-bottom: 2px solid #aa00ff">&nbsp;</span></span>\n    <strong>Potwierdzone</strong>\n    <small>Zlecenie ma status CNF.</small>\n  </li>\n  <li>\n    <span class="planning-legend-order"><span style="border-top: 2px solid #ff007f">&nbsp;</span></span>\n    <strong>Dostarczone</strong>\n    <small>Zlecenie ma status DLV.</small>\n  </li>\n  <li>\n    <span class="planning-legend-order" style="text-decoration: line-through">123</span>\n    <strong>Ignorowane</strong>\n    <small>Zlecenie nie będzie brane pod uwagę podczas planowania.</small>\n  </li>\n  <li>\n    <i class="fa fa-star-o"></i>\n    <strong>Małe</strong>\n    <i class="fa fa-star-half-full"></i>\n    <strong>Łatwe</strong>\n    <i class="fa fa-star"></i>\n    <strong>Trudne</strong>\n  </li>\n  <li>\n    <i class="fa fa-plus"></i>\n    <strong>Dodane ręcznie</strong>\n  </li>\n  <li>\n    <i class="fa fa-exclamation"></i>\n    <strong>Pilne</strong>\n    <small>Zlecenie kolejkowane poza kolejnością priorytetów zleceń.</small>\n  </li>\n  <li>\n    <i class="fa fa-arrow-right"></i>\n    <strong>Niekompletne</strong>\n    <small>Automatycznie dodane, nierozplanowane zlecenie z poprzedniego dnia. Niekompletne zlecenie jest zawsze Pilne.</small>\n  </li>\n  <li>\n    <i class="fa fa-thumb-tack"></i>\n    <strong>Przypięte</strong>\n    <small>Zlecenie przypięte do konkretnej linii będzie na niej planowane w pierwszej kolejności.</small>\n  </li>\n  <li>\n    <i class="fa fa-hourglass-end"></i>\n    <strong>Opóźnione</strong>\n    <small>Automatycznie dodane, niezrobione zlecenie z poprzednich dni.</small>\n  </li>\n  <li>\n    <i class="fa fa-sort-numeric-desc"></i>\n    <strong>Zmieniona ilość</strong>\n    <small>Ilość do zrobienia została ustawiona ręcznie.</small>\n  </li>\n  <li>\n    <i class="fa fa-wrench"></i>\n    <strong>ETO</strong>\n    <small>Konstrukcja na zamówienie.</small>\n  </li>\n  <li>\n    <span style="display: inline-block; font-weight: bold; width: 30px; text-align: center">A-Z</span>\n    <strong>Tagi zlecenia</strong>\n    <small>Na przykład: E - Pilot ETO.</small>\n  </li>\n  <li>\n    <i class="fa fa-paint-brush"></i>\n    <strong>Status malarnii</strong>\n    <small>\n      <span style="color: #000000">Oczekuje</span>,\n      <span style="color: #5bc0de">W trakcie</span>,\n      <span style="color: #9c64a6">W trakcie (MSP)</span>,\n      <span style="color: #f0ad4e">Niekompletne</span>,\n      <span style="color: #449d44">Zakończone</span>,\n      <span style="color: #ff69b4">Odstawione</span>,\n      <span style="color: #d9534f">Anulowane</span>.\n    </small>\n  </li>\n  <li>\n    <i class="fa fa-cricle-o"></i>\n    <strong>Status wiercenia</strong>\n    <small>\n      <span style="color: #000000">Oczekuje</span>,\n      <span style="color: #5bc0de">W trakcie</span>,\n      <span style="color: #f0ad4e">Niekompletne</span>,\n      <span style="color: #449d44">Zakończone</span>,\n      <span style="color: #ff69b4">Odstawione</span>,\n      <span style="color: #d9534f">Anulowane</span>.\n    </small>\n  </li>\n  <li>\n    <i class="fa fa-level-down"></i>\n    <strong>Status drop zone</strong>\n    <small>\n      <span style="color: #000000">Do zrobienia</span>,\n      <span style="color: #449d44">Zrobione</span>.\n    </small>\n  </li>\n  <li>\n    <i class="fa fa-lock"></i>\n    <strong>Ilość zamrożonych zleceń na linii</strong>\n  </li>\n  <li>\n    <i class="fa fa-user"></i>\n    <strong>Ilość osób na linii</strong>\n  </li>\n  <li>\n    <i class="fa fa-clock-o"></i>\n    <strong>Czas dostępności linii</strong>\n  </li>\n  <li>\n    <i class="fa fa-arrow-right"></i>\n    <strong>Przekierowanie linii</strong>\n  </li>\n</ul>\n');return __output}});