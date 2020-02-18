#include <WinAPI.au3>
#include "_Common.au3"

$SAP_LOGON_EXE = ReadIni("Logon", "SapLogonExe", "")
$SAP_CONNECTION_FILTER = ReadIni("Logon", "ConnectionFilter", "PUBLIC")
$SAP_LOGON_CLIENT = ReadIni("Logon", "Client", "000")
$SAP_LOGON_USER = ReadIni("Logon", "User", "test")
$SAP_LOGON_PASSWORD = ReadIni("Logon", "Password", "test")
$SAP_LOGON_LANGUAGE = ReadIni("Logon", "Language", "")
$SAP_TIMEOUT_LOGON = Number(ReadIni("Logon", "SapLogonWindowTimeout", "10"))
$SAP_TIMEOUT_FRONTEND = Number(ReadIni("Logon", "SapFrontendSessionWindowTimeout", "10"))
$SAP_TIMEOUT_SESSION = Number(ReadIni( "Logon", "SapFreeSessionCreationTimeout", "10")) * 1000
$SAP_LOGON_REGEX = ReadIni("Logon", "SapLogonWindowTitleRegex", "^SAP Logon [0-9]+$")
$SAP_FREE_SESSION_REGEX = ReadIni("Logon", "SapFreeSessionWindowTitleRegex", "^SAP Easy Access.*")
$SAP_LOGIN_FORM_WINDOW_TITLE = "[REGEXPTITLE:^SAP$; CLASS:SAP_FRONTEND_SESSION]"

$wrapper = Null
$sapgui = Null
$application = Null

Global $connection = Null
Global $session = Null

Func TryToLogIn()
  LogDebug("LOGGING_IN")

  $session.findById("wnd[0]/usr/txtRSYST-MANDT").text = $SAP_LOGON_CLIENT
  $session.findById("wnd[0]/usr/txtRSYST-BNAME").text = $SAP_LOGON_USER
  $session.findById("wnd[0]/usr/pwdRSYST-BCODE").text = $SAP_LOGON_PASSWORD
  $session.findById("wnd[0]/usr/txtRSYST-LANGU").text = $SAP_LOGON_LANGUAGE
  $session.findById("wnd[0]/tbar[0]/btn[0]").press()

  If $session.findById("wnd[0]/sbar").Text <> "" Then
    LogDebug('"' & $session.findById("wnd[0]/sbar").Text & '"')
    LogError("ERR_INVALID_CREDENTIALS", $ERR_INVALID_CREDENTIALS)
  EndIf

  LogDebug("LOGGED_IN")
EndFunc

Func CloseSession()
  LogDebug("CLOSING_SESSION")
  If IsObj($session) Then
    $session.TestToolMode = 0
    $session.UnlockSessionUI()
    $connection.CloseSession($session.Id)
  EndIf
EndFunc

Func FindFreeSession()
  For $freeSessionIdx = 1 To ($connection.Children.Length - 1)
    $freeSessionCandidate = $connection.Children($freeSessionIdx)

    If $freeSessionCandidate.Busy Then
      ContinueLoop
    EndIf

    $window = $freeSessionCandidate.findById("wnd[0]")

    If IsObj($window) And StringRegExp($window.Text, $SAP_FREE_SESSION_REGEX) And Not IsWinLocked($window.Handle) Then
      Return $freeSessionCandidate
    EndIf
  Next

  Return Null
EndFunc

$wrapper = ObjCreate("SapROTWr.SAPROTWrapper")

LogDebug("CHECKING_WRAPPER_1")

If IsObj($wrapper) Then
  $sapgui = $wrapper.GetROTEntry("SAPGUI")

  LogDebug("CHECKING_SAPGUI_1")

  If IsObj($sapgui) Then
    $application = $sapgui.GetScriptingEngine()

    LogDebug("CHECKING_SCRIPTING_ENGINE_1")

    If IsObj($application) Then
      $application.AllowSystemMessages = False
      $application.HistoryEnabled = False

      $connection = $application.Children(0)

      LogDebug("CHECKING_CONNECTION_1")

      If IsObj($connection) Then
        $session = $connection.Children(0)
      EndIf
    EndIf
  EndIf
EndIf

Unlock()

LogDebug("CHECKING_SESSION_1")

If Not IsObj($session) Then
  LogDebug("CHECKING_LOGON_WINDOW")

  If Not WinExists("[REGEXPTITLE:" & $SAP_LOGON_REGEX & "]") Then
    If $SAP_LOGON_EXE = "" Then
      $SAP_LOGON_EXE = EnvGet('ProgramFiles(x86)')

      If $SAP_LOGON_EXE = "" Then
        $SAP_LOGON_EXE = @ProgramFilesDir
      EndIf

      $SAP_LOGON_EXE = $SAP_LOGON_EXE & "\SAP\FrontEnd\SAPgui\saplogon.exe"
    EndIf

    LogDebug("RUNNING_SAPLOGON=" & $SAP_LOGON_EXE)
    Run($SAP_LOGON_EXE)
    WinWait("[REGEXPTITLE:" & $SAP_LOGON_REGEX & "]", "", $SAP_TIMEOUT_LOGON)

    If Not WinExists("[REGEXPTITLE:" & $SAP_LOGON_REGEX & "]") Then
      LogError("ERR_NO_LOGON_WINDOW", $ERR_NO_LOGON_WINDOW)
    EndIf
  EndIf

  $sapLogonWin = WinGetHandle("[REGEXPTITLE:" & $SAP_LOGON_REGEX & "]")

  If IsWinLocked($sapLogonWin) Then
    LogError("ERR_LOGON_WINDOW_LOCKED", $ERR_LOGON_WINDOW_LOCKED)
  EndIf

  LogDebug("CHECKING_SAP_FRONTEND_SESSION_1")

  If Not WinExists($SAP_LOGIN_FORM_WINDOW_TITLE) Then
    LogDebug("FILTERING_CONNECTIONS")
    ControlSetText($sapLogonWin, "", "Edit1", "")
    ControlSend($sapLogonWin, "", "Edit1", $SAP_CONNECTION_FILTER)
    Sleep(666)

    LogDebug("SELECTING_CONNECTION")
    ControlClick($sapLogonWin, "", "SysListView321", "left", 1, 50, 30)
    Sleep(333)

    LogDebug("CONNECTING")
    ControlClick($sapLogonWin, "", "Button1")

    WinWait($SAP_LOGIN_FORM_WINDOW_TITLE, "", $SAP_TIMEOUT_FRONTEND / 10)

    If IsWinLocked($sapLogonWin) Then
      ControlClick("[REGEXPTITLE:^SAP Logon$; CLASS:#32770]", "", "Button3")
      LogError("ERR_NO_CONNECTTION", $ERR_NO_CONNECTTION)
    EndIf

    WinWait("[REGEXPTITLE:^SAP$; CLASS:SAP_FRONTEND_SESSION]", "", $SAP_TIMEOUT_FRONTEND - ($SAP_TIMEOUT_FRONTEND / 10))
  EndIf

  LogDebug("CHECKING_SAP_FRONTEND_SESSION_2")

  If Not WinExists($SAP_LOGIN_FORM_WINDOW_TITLE) Then
    If IsWinLocked($sapLogonWin) Then
      ControlClick("[REGEXPTITLE:^SAP Logon$; CLASS:#32770]", "", "Button3")
      LogError("ERR_NO_CONNECTTION", $ERR_NO_CONNECTTION)
    EndIf
    LogError("ERR_NO_FRONTEND_WINDOW", $ERR_NO_FRONTEND_WINDOW)
  EndIf

  LogDebug("CHECKING_WRAPPER_2")

  $wrapper = ObjCreate("SapROTWr.SAPROTWrapper")

  If Not IsObj($wrapper) Then
    LogError("ERR_NO_ROT_WRAPPER", $ERR_NO_ROT_WRAPPER)
  EndIf

  LogDebug("CHECKING_SAPGUI_2")

  $sapgui = $wrapper.GetROTEntry("SAPGUI")

  If Not IsObj($sapgui) Then
    LogError("ERR_NO_SAPGUI", $ERR_NO_SAPGUI)
  EndIf

  LogDebug("CHECKING_SCRIPTING_ENGINE_2")

  $application = $sapgui.GetScriptingEngine()

  If Not IsObj($application) Then
    LogError("ERR_NO_SCRIPTING_ENGINE", $ERR_NO_SCRIPTING_ENGINE)
  EndIf

  $application.AllowSystemMessages = False
  $application.HistoryEnabled = False

  LogDebug("CHECKING_CONNECTION_2")

  $connection = $application.Children(0)

  If Not IsObj($connection) Then
    LogError("ERR_NO_CONNECTION", $ERR_NO_CONNECTION)
  EndIf

  LogDebug("CHECKING_SESSION_2")

  $session = $connection.Children(0)

  If Not IsObj($session) Then
    LogError("ERR_NO_SESSION", $ERR_NO_SESSION)
  EndIf
EndIf

$session.TestToolMode = 1

LogDebug("CHECKING_SAP_FRONTEND_SESSION_3")

If WinExists($SAP_LOGIN_FORM_WINDOW_TITLE) Then
  TryToLogIn()
EndIf

Unlock()

LogDebug("SEARCHING_FREE_SESSION")

$freeSession = FindFreeSession()

If Not IsObj($freeSession) Then
  LogDebug("NO_FREE_SESSION")

  If $connection.Children.Length = 6 Then
    LogError("ERR_NO_FREE_SESSIONS", $ERR_NO_FREE_SESSIONS)
  EndIf

  LogDebug("CREATING_FREE_SESSION")

  $session.CreateSession()

  $checks = 0
  $count = 0

  While $checks < $SAP_TIMEOUT_SESSION
    LogDebug("CHECKING_FREE_SESSION_" & $checks)
    $windows = WinList("[REGEXPTITLE:" & $SAP_FREE_SESSION_REGEX & "; CLASS:SAP_FRONTEND_SESSION]")
    $count = $windows[0][0]

    if $count > 1 Then
      ExitLoop
    EndIf

    $checks = $checks + 250
    Sleep(250)
  WEnd

  LogDebug("SEARCHING_NEW_FREE_SESSION")

  For $i = 1 To 6
    $freeSession = FindFreeSession()

    If IsObj($freeSession) Then ExitLoop

    LogDebug("FREE_SESSION_HIJACKED")

    Sleep(2000)
  Next

  If Not IsObj($freeSession) Then
    LogError("ERR_NO_FREE_SESSIONS", $ERR_NO_FREE_SESSIONS)
  EndIf

  LogDebug("CREATED_FREE_SESSION")
Else
  LogDebug("FOUND_FREE_SESSION")
EndIf

$session = $freeSession

LogDebug("SESSION_ID=" & $session.Id)

$session.TestToolMode = 1
