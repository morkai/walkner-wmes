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

Func Unlock()
  For $i = 0 To 5
    LogDebug("SEARCHING_MODAL_WINDOW")

    $modalWin = FindModalWin("^(SAP|Information)")

    If Not IsHWnd($modalWin) Then
      LogDebug("MODAL_WINDOW_NOT_FOUND")
      ExitLoop
    EndIf

    $modalTitle = WinGetTitle($modalWin)

    LogDebug("MODAL_WINDOW_FOUND=" & $modalTitle)

    If $modalTitle == "Information" Then
      LogDebug("SEARCHING_INFO_BUTTON")

      $buttonId = ControlGetHandle($modalWin, "", "[CLASS:Button; INSTANCE:2]")

      If IsHWnd($buttonId) Then
        LogDebug("INFO_BUTTON_FOUND=" & ControlGetText($modalWin, "", $buttonId))

        ControlClick($modalWin, "", $buttonId)
        Sleep(500)

        ContinueLoop
      EndIf
    EndIf

    LogDebug("SEARCHING_CANCEL_BUTTON")

    $buttonFound = False

    For $ii = 0 To (UBound($cancelButtonTexts) - 1)
      $buttonText = $cancelButtonTexts[$ii]
      $buttonId = ControlGetHandle($modalWin, "", "[CLASS:Button; TEXT:" & $buttonText & "]")

      If Not IsHWnd($buttonId) Then ContinueLoop

      $buttonFound = True

      LogDebug("CANCEL_BUTTON_FOUND=" & ControlGetText($modalWin, "", $buttonId))

      ControlClick($modalWin, "", $buttonId)
      Sleep(500)

      ExitLoop
    Next

    If Not $buttonFound Then
      LogDebug("CANCEL_BUTTON_NOT_FOUND")
      ExitLoop
    EndIf
  Next
EndFunc