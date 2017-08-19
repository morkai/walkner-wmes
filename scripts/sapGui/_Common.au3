#include-once

#include "_Errors.au3"

Global $cancelButtonTexts[] = ["Cancel", "Anuluj", "No", "Nie", "&Cancel", "&Anuluj", "&No", "&Nie", "OK", "Yes", "Tak", "&OK", "&Yes", "&Tak"]

Func ReadIni($section, $key, $default)
  return IniRead(@ScriptDir & "\SAP.ini", $section, $key, $default)
EndFunc

Func LogDebug($message = "")
  ConsoleWrite($message & @CRLF)
EndFunc

Func LogError($message, $exitCode = -1)
  ConsoleWriteError($message & @CRLF)

  If $exitCode <> -1 Then
    Exit($exitCode)
  EndIf
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
