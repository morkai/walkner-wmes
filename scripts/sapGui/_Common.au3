#include-once

#include <StringConstants.au3>
#include "_Errors.au3"

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

Global $cancelButtonTexts[] = ["Cancel", "Anuluj", "No", "Nie", "&Cancel", "&Anuluj", "&No", "&Nie", "OK", "Yes", "Tak", "&OK", "&Yes", "&Tak"]

Global $wrapper = Null
Global $sapgui = Null
Global $application = Null
Global $connection = Null
Global $session = Null

Func ReadIni($section, $key, $default)
  return IniRead(@ScriptDir & "\SAP.ini", $section, $key, $default)
EndFunc

Func LogDebug($message = "")
  ConsoleWrite($message & @CRLF)
EndFunc

Func LogError($message, $exitCode = -1)
  ConsoleWriteError($message & @CRLF)

  If $exitCode <> -1 Then
    CloseSession()
    Exit($exitCode)
  EndIf
EndFunc

Func CloseSession()
  If IsObj($session) Then
    LogDebug("CLOSING_SESSION")
    $session.TestToolMode = 0
    $connection.CloseSession($session.Id)
  EndIf
EndFunc

Func AssertControl($control, $id)
  If Not IsObj($control) Then
    LogDebug("ERROR=CONTROL_NOT_FOUND=" & $id)
    LogError("INVALID_SCREEN", $ERR_INVALID_SCREEN)
  EndIf
EndFunc

Func TryToLogIn()
  LogDebug("LOGGING_IN")

  $session.findById("wnd[0]/usr/txtRSYST-MANDT").text = $SAP_LOGON_CLIENT
  $session.findById("wnd[0]/usr/txtRSYST-BNAME").text = $SAP_LOGON_USER
  $session.findById("wnd[0]/usr/pwdRSYST-BCODE").text = $SAP_LOGON_PASSWORD
  $session.findById("wnd[0]/usr/txtRSYST-LANGU").text = $SAP_LOGON_LANGUAGE
  $session.findById("wnd[0]/tbar[0]/btn[0]").press()

  $sbar = $session.findById("wnd[0]/sbar").text

  If $sbar = "" Then
    LogDebug("LOGGED_IN")
    Return Null
  EndIf

  $terminateOpt = $session.findById("wnd[1]/usr/radMULTI_LOGON_OPT1")

  If IsObj($terminateOpt) Then
    $terminateOpt.select()
    $session.findById("wnd[1]/tbar[0]/btn[0]").press()
  EndIf

  $sbar = $session.findById("wnd[0]/sbar").text

  If $sbar <> "" Then
    LogDebug('"' & $session.findById("wnd[0]/sbar").Text & '"')
    LogError("ERR_INVALID_CREDENTIALS", $ERR_INVALID_CREDENTIALS)
  EndIf

  LogDebug("LOGGED_IN")
EndFunc

Func FindFreeSession()
  For $freeSessionIdx = 1 To ($connection.Children.Length - 1)
    $freeSessionCandidate = $connection.Children($freeSessionIdx)

    If Not IsObj($freeSessionCandidate) Then
      ContinueLoop
    EndIf

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

Func IsWinLocked($win)
  return BitAND(WinGetState($win), 4) = 0
EndFunc

Func FindModalWin($titleRegexp = "^SAP")
  return WinGetHandle("[REGEXPTITLE:" & $titleRegexp & "; CLASS:#32770]")
EndFunc

Func SetVariant($session, $variantName, $variantCreator)
  If $variantName <> "" Then
    $session.FindById("wnd[0]/tbar[1]/btn[17]").Press()
    $session.FindById("wnd[1]/usr/txtV-LOW").Text = $variantName
    $session.FindById("wnd[1]/usr/txtENAME-LOW").Text = $variantCreator
    $session.FindById("wnd[1]/tbar[0]/btn[8]").Press()
  EndIf
EndFunc

Func Unlock()
  LogDebug("UNLOCKING")
  LogDebug("SEARCHING_MODAL_WINDOW")

  $modalWin = FindModalWin("^(SAP GUI|Information|Stop)")

  If Not IsHWnd($modalWin) Then
    LogDebug("MODAL_WINDOW_NOT_FOUND")
    Return
  EndIf

  $modalTitle = WinGetTitle($modalWin)

  LogDebug("MODAL_WINDOW_FOUND=" & $modalTitle)
  LogDebug("SEARCHING_CANCEL_BUTTON")

  $buttonFound = False

  For $ii = 0 To (UBound($cancelButtonTexts) - 1)
    $buttonText = $cancelButtonTexts[$ii]
    $buttonId = ControlGetHandle($modalWin, "", "[CLASS:Button; TEXT:" & $buttonText & "]")

    If Not IsHWnd($buttonId) Then ContinueLoop

    $buttonFound = True

    LogDebug("CANCEL_BUTTON_FOUND=" & ControlGetText($modalWin, "", $buttonId))

    ControlClick($modalWin, "", $buttonId)
    Sleep(250)

    ExitLoop
  Next

  If Not $buttonFound Then
    LogDebug("CANCEL_BUTTON_NOT_FOUND")
  EndIf
EndFunc

Func ReadAllText($parent, $nl = " ")
  $text = ""

  If Not IsObj($parent) Then
    Return $text
  EndIf

  If IsString($parent.Text) And $parent.Text <> "" Then
    $text = $parent.Text
  EndIf

  If IsObj($parent.Children) Then
    For $childI = 0 To $parent.Children.Length - 1 Step 1
      $text = $text & $nl & ReadAllText($parent.Children($childI), $nl)
    Next
  EndIf

  Return TrimString($text)
EndFunc

Func TrimString($str)
  Return StringStripWS($str, $STR_STRIPLEADING + $STR_STRIPTRAILING + $STR_STRIPSPACES)
EndFunc