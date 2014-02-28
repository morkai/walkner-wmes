define(["app/nls/locale/pl"],function(n){var r={locale:{}};return r.locale.pl=n,{TITLE:function(){var n="";return n+="Wannabe MES"},"MSG:LOADING":function(){var n="";return n+="Ładowanie..."},"MSG:LOADING_FAILURE":function(){var n="";return n+="Ładowanie nie powiodło się :("},"MSG:LOG_OUT:FAILURE":function(){var n="";return n+="Wylogowanie nie powiodło się :("},"MSG:LOG_OUT:SUCCESS":function(){var n="";return n+="Zostałeś wylogowany!"},"PAGE_ACTION:filter":function(){var n="";return n+="Filtruj"},"LIST:COLUMN:actions":function(){var n="";return n+="Akcje"},"LIST:NO_DATA":function(){var n="";return n+="Brak danych."},"LIST:NO_DATA:cell":function(){var n="";return n+="brak danych"},"LIST:ACTION:viewDetails":function(){var n="";return n+="Pokaż szczegóły"},"LIST:ACTION:edit":function(){var n="";return n+="Edytuj"},"LIST:ACTION:delete":function(){var n="";return n+="Usuń"},"BREADCRUMBS:edit":function(){var n="";return n+="Edycja"},"BREADCRUMBS:delete":function(){var n="";return n+="Usuwanie"},"BREADCRUMBS:error":function(n){var r="";if(r+="Błąd ",!n)throw new Error("MessageFormat: No data passed to function.");if(r+=n.code,r+=": ",!n)throw new Error("MessageFormat: No data passed to function.");var t="codeStr",a=n[t],e={e401:function(){var n="";return n+="nieautoryzowany dostęp"},e404:function(){var n="";return n+="nie znaleziono"},other:function(){var n="";return n+="nieprawidłowe zapytanie"}};return r+=(e[a]||e.other)(n)},"ERROR:400":function(){var n="";return n+="Żądanie nie może być obsłużone z powodu błędnej składni zapytania :("},"ERROR:401":function(){var n="";return n+="Niestety, ale nie masz wystarczających uprawnień do wykonania żądanej akcji :("},"ERROR:404":function(){var n="";return n+="Wybrana strona nie istnieje :("},"PAGINATION:FIRST_PAGE":function(){var n="";return n+="Pierwsza strona"},"PAGINATION:PREV_PAGE":function(){var n="";return n+="Poprzednia strona"},"PAGINATION:NEXT_PAGE":function(){var n="";return n+="Następna strona"},"PAGINATION:LAST_PAGE":function(){var n="";return n+="Ostatnia strona"},"LOG_IN_FORM:DIALOG_TITLE":function(){var n="";return n+="Logowanie do systemu"},"LOG_IN_FORM:LABEL:LOGIN":function(){var n="";return n+="Login"},"LOG_IN_FORM:LABEL:PASSWORD":function(){var n="";return n+="Hasło"},"LOG_IN_FORM:LABEL:SUBMIT":function(){var n="";return n+="Zaloguj się"},"BOOL:true":function(){var n="";return n+="Tak"},"BOOL:false":function(){var n="";return n+="Nie"},GUEST_USER_NAME:function(){var n="";return n+="Gość"},"NAVBAR:TOGGLE":function(){var n="";return n+="Pokaż menu"},"NAVBAR:DASHBOARD":function(){var n="";return n+="Dashboard"},"NAVBAR:EVENTS":function(){var n="";return n+="Zdarzenia"},"NAVBAR:ORDERS":function(){var n="";return n+="Zlecenia"},"NAVBAR:MECH_ORDERS":function(){var n="";return n+="Zlecenia działu mechanicznego"},"NAVBAR:OTHER_ORDERS":function(){var n="";return n+="Zlecenia reszty działów"},"NAVBAR:EMPTY_ORDERS":function(){var n="";return n+="Puste zlecenia"},"NAVBAR:LINES":function(){var n="";return n+="Linie produkcyjne"},"NAVBAR:USERS":function(){var n="";return n+="Użytkownicy"},"NAVBAR:MY_ACCOUNT":function(){var n="";return n+="Moje konto"},"NAVBAR:UI_LOCALE":function(){var n="";return n+="Lokalizacja UI"},"NAVBAR:LOCALE_PL":function(){var n="";return n+="Po polsku"},"NAVBAR:LOCALE_US":function(){var n="";return n+="Po angielsku"},"NAVBAR:LOG_IN":function(){var n="";return n+="Zaloguj się"},"NAVBAR:LOG_OUT":function(){var n="";return n+="Wyloguj się"},"NAVBAR:DICTIONARIES":function(){var n="";return n+="Słowniki"},"NAVBAR:ORDER_STATUSES":function(){var n="";return n+="Statusy zleceń"},"NAVBAR:DOWNTIME_REASONS":function(){var n="";return n+="Powody przestojów"},"NAVBAR:LOSS_REASONS":function(){var n="";return n+="Powody strat materiałowych"},"NAVBAR:AORS":function(){var n="";return n+="Obszary odpowiedzialności"},"NAVBAR:WORK_CENTERS":function(){var n="";return n+="WorkCentra"},"NAVBAR:COMPANIES":function(){var n="";return n+="Firmy"},"NAVBAR:DIVISIONS":function(){var n="";return n+="Wydziały"},"NAVBAR:SUBDIVISIONS":function(){var n="";return n+="Działy"},"NAVBAR:MRP_CONTROLLERS":function(){var n="";return n+="Kontrolery MRP"},"NAVBAR:PROD_FUNCTIONS":function(){var n="";return n+="Funkcje na produkcji"},"NAVBAR:PROD_FLOWS":function(){var n="";return n+="Przepływy"},"NAVBAR:PROD_TASKS":function(){var n="";return n+="Zadania produkcyjne"},"NAVBAR:PROD_LINES":function(){var n="";return n+="Linie produkcyjne"},"NAVBAR:HOURLY_PLANS":function(){var n="";return n+="Plany godzinowe"},"NAVBAR:FTE":function(){var n="";return n+="FTE"},"NAVBAR:FTE:MASTER":function(){var n="";return n+="Produkcja"},"NAVBAR:FTE:MASTER:LIST":function(){var n="";return n+="Historia"},"NAVBAR:FTE:MASTER:CURRENT":function(){var n="";return n+="Przydzielanie zasobów"},"NAVBAR:FTE:LEADER":function(){var n="";return n+="Magazyn"},"NAVBAR:FTE:LEADER:LIST":function(){var n="";return n+="Historia"},"NAVBAR:FTE:LEADER:CURRENT":function(){var n="";return n+="Przydzielanie zasobów"},"NAVBAR:VIS":function(){var n="";return n+="Wizualizacja"},"NAVBAR:VIS:STRUCTURE":function(){var n="";return n+="Struktura organizacyjna"},"NAVBAR:PRESS_WORKSHEETS":function(){var n="";return n+="Karty pracy"},"NAVBAR:REPORTS":function(){var n="";return n+="Raporty"},"NAVBAR:REPORTS:1":function(){var n="";return n+="Wskaźniki"},"NAVBAR:REPORTS:2":function(){var n="";return n+="CLIP"},"NAVBAR:REPORTS:3":function(){var n="";return n+="OEE"},"NAVBAR:PROD":function(){var n="";return n+="Produkcja"},"NAVBAR:PROD:LOG_ENTRIES":function(){var n="";return n+="Historia operacji"},"NAVBAR:PROD:SHIFTS":function(){var n="";return n+="Zmiany"},"NAVBAR:PROD:SHIFT_ORDERS":function(){var n="";return n+="Zlecenia"},"NAVBAR:PROD:DOWNTIMES":function(){var n="";return n+="Przestoje"},"ACTION_FORM:BUTTON":function(){var n="";return n+="Wykonaj akcję"},"ACTION_FORM:BUTTON:delete":function(){var n="";return n+="Usuń"},"ACTION_FORM:BUTTON:cancel":function(){var n="";return n+="Anuluj"},"ACTION_FORM:MESSAGE":function(){var n="";return n+="Czy na pewno chcesz wykonać żądaną akcję?"},"ACTION_FORM:MESSAGE:failure":function(){var n="";return n+="Wykonywanie akcji nie powiodło się :("},"ORG_UNIT:division":function(){var n="";return n+="Wydział"},"ORG_UNIT:subdivision":function(){var n="";return n+="Dział"},"ORG_UNIT:mrpController":function(){var n="";return n+="Kontroler MRP"},"ORG_UNIT:prodFlow":function(){var n="";return n+="Przepływ"},"ORG_UNIT:workCenter":function(){var n="";return n+="WorkCenter"},"ORG_UNIT:prodLine":function(){var n="";return n+="Linia montażowa"},"SHIFT:1":function(){var n="";return n+="I"},"SHIFT:2":function(){var n="";return n+="II"},"SHIFT:3":function(){var n="";return n+="III"},"highcharts:decimalPoint":function(){var n="";return n+=","},"highcharts:thousandsSep":function(){var n="";return n+="."},"highcharts:noData":function(){var n="";return n+="Brak danych :("},"highcharts:resetZoom":function(){var n="";return n+="1:1"},"highcharts:resetZoomTitle":function(){var n="";return n+="Ustaw poziom przybliżenia na 1:1"},"highcharts:loading":function(){var n="";return n+="Ładowanie..."},"highcharts:months":function(){var n="";return n+="Styczeń_Luty_Marzec_Kwiecień_Maj_Czerwiec_Lipiec_Sierpień_Wrzesień_Październik_Listopad_Grudzień"},"highcharts:shortMonths":function(){var n="";return n+="Sty_Lut_Mar_Kwi_Maj_Cze_Lip_Sie_Wrz_Paź_Lis_Gru"},"highcharts:weekdays":function(){var n="";return n+="Niedziela_Poniedziałek_Wtorek_Środa_Czwartek_Piątek_Sobota"}}});