#include "_Common.au3"

While True
  LogDebug("SEARCHING_MODEL_WINDOW")

  $modalWin = FindModalWin()

  If Not IsHWnd($modalWin) Then
    LogDebug("MODAL_WINDOW_NOT_FOUND")
    ExitLoop
  EndIf

  LogDebug("SEARCHING_CANCEL_BUTTON")

  $buttonFound = False

  For $ii = 0 To (UBound($cancelButtonTexts) - 1)
    $buttonText = $cancelButtonTexts[$ii]
    $buttonId = ControlGetHandle($modalWin, "", "[CLASS:Button; TEXT:" & $buttonText & "]")

    If Not IsHWnd($buttonId) Then ContinueLoop

    $buttonFound = True

    LogDebug("CANCEL_BUTTON_FOUND=" & $buttonText)

    ControlClick($modalWin, "", $buttonId)
    Sleep(1337)

    ExitLoop
  Next

  If Not $buttonFound Then
    LogDebug("CANCEL_BUTTON_NOT_FOUND")
    ExitLoop
  EndIf
WEnd
