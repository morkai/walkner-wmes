#include <Constants.au3>
#include <Misc.au3>
#include <MsgBoxConstants.au3>

Global Const $PRODUCT_GUID = "00000000-0000-0000-0000-000000000000"
Global Const $PRODUCT_NAME = "Operator WMES"
Global Const $PRODUCT_VERSION = "0.0.0"
Global Const $PRODUCT_PUBLISHER = "Walkner elektronika przemysłowa Zbigniew Walukiewicz"
Global Const $PRODUCT_URL = "http://walkner.pl/"
Global Const $SERVICE_NAMe = "walkner-wmes-operator"
Global Const $BROWSER_TITLE = "Wannabe MES"

Func ExitWithError($error)
  SplashOff()
  MsgBox(BitOr($MB_OK, $MB_ICONERROR, $MB_TOPMOST), $PRODUCT_NAME, $error)
  Exit 1
EndFunc

Func SplashText($text, $notOnTop = False)
  SplashTextOn($PRODUCT_NAME, $text, 325, 75, -1, -1, BitOr($DLG_TEXTVCENTER, $notOnTop ? $DLG_NOTONTOP : 0))
EndFunc

Func RunGetStdout($cmd, $cwd = "")
  $stdout = ""
  $pid = Run($cmd, $cwd, @SW_HIDE, $STDOUT_CHILD)

  If $pid > 0 Then
    ProcessWaitClose($pid, 20)

    $stdout = StdoutRead($pid)

    If @error Then
      $stdout = ""
    EndIf
  EndIf

  Return $stdout
EndFunc

Func RemoveEmptyDir($dir)
  If CountFilesInDir($dir) == 0 Then
    DirRemove($dir)
  EndIf
EndFunc

Func CountFilesInDir($dir)
  $dirSize = DirGetSize($dir, 1)

  Return IsArray($dirSize) ? ($dirSize[1] + $dirSize[2]) : 0
EndFunc
