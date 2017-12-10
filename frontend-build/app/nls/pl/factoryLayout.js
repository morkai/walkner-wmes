define(["app/nls/locale/pl"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,r){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(r||0)},v:function(n,r){return t.c(n,r),n[r]},p:function(n,r,e,o,i){return t.c(n,r),n[r]in i?i[n[r]]:(r=t.lc[o](n[r]-e),r in i?i[r]:i.other)},s:function(n,r,e){return t.c(n,r),n[r]in e?e[n[r]]:e.other}};return{"bc:layout":function(n){return"Monitoring"},"bc:layout:edit":function(n){return"Edycja układu fabryki"},"bc:list":function(n){return"Linie produkcyjne"},"bc:settings":function(n){return"Ustawienia"},"pa:settings":function(n){return"Zmień ustawienia"},"pa:layout:fullscreen":function(n){return"Tryb pełnoekranowy"},"pa:layout:edit":function(n){return"Edytuj układ fabryki"},"pa:layout:live":function(n){return"Publikuj"},"prop:master":function(n){return"Mistrz"},"prop:leader":function(n){return"Lider"},"prop:operator":function(n){return"Operator"},"prop:shift":function(n){return"Zmiana"},"prop:order":function(n){return"Zlecenie"},"prop:nc12":function(n){return"12NC"},"prop:downtime":function(n){return"Przestój"},"prop:lastOrder":function(n){return"Ostatnie zlecenie"},"prop:lastNc12":function(n){return"Ostatnie 12NC"},"prop:lastDowntime":function(n){return"Ostatni przestój"},"prop:qty":function(n){return"Wykonane ilości"},qty:function(n){return t.v(n,"actual")+" z "+t.v(n,"planned")},"statuses:online":function(n){return"Online"},"statuses:online:title":function(n){return"Linie produkcyjne z aktywnym połączeniem do serwera."},"statuses:offline":function(n){return"Offline"},"statuses:offline:title":function(n){return"Linie produkcyjne niepołączone z serwerem. Dane mogą być nieaktualne."},"states:idle":function(n){return"Bezczynność"},"states:working":function(n){return"Praca"},"states:downtime":function(n){return"Przestój"},"options:picker":function(n){return"Wybierz linie produkcyjne"},"options:save":function(n){return"Zapisz opcje wyświetlania"},"options:saved":function(n){return"Opcje wyświetlania zapisane!"},"options:blacklisted":function(n){return"Ignorowane"},"options:loadHistory":function(n){return"Pokaż historię"},"options:resetHistory":function(n){return"Pokaż aktualne dane"},noProdLines:function(n){return"Brak pasujących linii produkcyjnych."},loadingHistoryData:function(n){return"Ładowanie danych..."},"msg:historyDataRange":function(n){return"Nie można pobrać danych z więcej niż siedmiu dni na raz."},"picker:title":function(n){return"Wybieranie linii produkcyjnych"},"picker:submit":function(n){return"Wybierz"},"popover:order":function(n){return"Zlecenie:"},"popover:operation":function(n){return"Operacja:"},"popover:duration":function(n){return"Czas trwania:"},"popover:quantityDone":function(n){return"Ilość wykonana:"},"popover:workerCount":function(n){return"Ilość osób (SAP):"},"popover:taktTime":function(n){return"Czas taktu:"},"popover:cycleTime":function(n){return"Czas cyklu (IPT):"},"popover:avgCycleTime":function(n){return"Śr. czas cyklu:"},"popover:downtime":function(n){return"Przestój:"},"popover:aor":function(n){return"Obszar:"},"settings:tab:blacklist":function(n){return"Ignorowane jednostki org."},"settings:tab:divisionColors":function(n){return"Kolory wydziałów"},"settings:tab:other":function(n){return"Inne"},"settings:extendedDowntimeDelay":function(n){return"Długi przestój [min]"}}});