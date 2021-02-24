#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include <StringConstants.au3>
#include "_Common.au3"

$outputPath = ReadIni("T_ZSE16D", "OutputPath", ReadIni("Transactions", "OutputPath", "C:\SAP\Output"))
$outputFile = ReadIni("T_ZSE16D", "OutputFile", "T_ZSE16D.txt")
$codePage = ReadIni("T_ZSE16D", "OutputEncoding", ReadIni("Transactions", "OutputEncoding", "4110"))
$table = ReadIni("T_ZSE16D", "Table", "")
$variant = ReadIni("T_ZSE16D", "Variant", "")
$layout = ReadIni("T_ZSE16D", "Layout", "")
$criteria = ObjCreate("Scripting.Dictionary")

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug("T_ZSE16D.exe <arguments>")
  LogDebug()
  LogDebug("Arguments:")
  LogDebug("  --output-path")
  LogDebug("  --output-file")
  LogDebug("  --code-page")
  LogDebug("  --table")
  LogDebug("  --variant")
  LogDebug("  --layout")
  LogDebug("  --criteria")
  Exit(0)
EndIf

If $CmdLine[0] > 0 And Mod($CmdLine[0], 2) = 0 Then
  For $i = 1 To ($CmdLine[0] - 1) Step 2
    $k = $CmdLine[$i]
    $v = $CmdLine[$i + 1]

    Switch $k
      Case "--output-path"
        $outputPath = $v
      Case "--output-file"
        $outputFile = $v
      Case "--code-page"
        $codePage = $v
      Case "--table"
        $table = $v
      Case "--variant"
        $variant = $v
      Case "--layout"
        $layout = $v
      Case "--criteria"
        $parts = StringSplit($v, ",")
        $key = $parts[1] & "," & $parts[2]
        $value = ""

        For $ii = 3 To $parts[0]
           $value = $value & @CRLF & $parts[$ii]
        Next

        $criteria.Add($key, StringStripWS($value, 3))
    EndSwitch
  Next
EndIf

If Not $layout Then
  $layout = "WMES_" & $table
EndIf

LogDebug("T_ZSE16D")
LogDebug("--output-path=" & $outputPath)
LogDebug("--output-file=" & $outputFile)
LogDebug("--code-page=" & $codePage)
LogDebug("--table=" & $table)
LogDebug("--variant=" & $variant)
LogDebug("--layout=" & $layout)

For $key in $criteria
  LogDebug("--criteria=" & $key & "=" & StringReplace($criteria.Item($key), @CRLF, " \r\n "))
Next

#include "_Logon.au3"

StartTransaction("ZSE16D")

; Set variant
If $variant <> "" Then
  $session.FindById("wnd[0]/mbar/menu[2]/menu[0]/menu[0]").Select()
  Sleep(100)
  $session.FindById("wnd[1]/usr/ctxtGS_SE16N_LT-TAB").Text = $table
  $session.FindById("wnd[1]/usr/ctxtGS_SE16N_LT-NAME").Text = $variant
  $session.FindById("wnd[1]/tbar[0]/btn[0]").Press()
Else
  ; Set table
  $session.FindById("wnd[0]/usr/ctxtGD-TAB").Text = $table
  $session.FindById("wnd[0]").SendVKey(0)

  ; Set layout
  $session.FindById("wnd[0]/usr/ctxtGD-VARIANT").Text = "WMES_" & $table
  $session.FindById("wnd[0]").SendVKey(0)
EndIf

; Set maximum no. of hits
$session.FindById("wnd[0]/usr/txtGD-MAX_LINES").Text = "99999"
$session.FindById("wnd[0]").SendVKey(0)
Sleep(100)
$session.FindById("wnd[1]/tbar[0]/btn[0]").Press()

Sleep(500)

; Set selection criteria
For $key In $criteria
  $value = $criteria.Item($key)

  LogDebug("SETTING_SELECTION_CRITERIA=" & $key)

  If StringInStr($key, "m", 1) Then ; Multiple from clipboard
    $session.FindById("wnd[0]/usr/tblSAPLSE16NSELFIELDS_TC/btnPUSH[" & StringReplace($key, "m", "4") & "]").SetFocus()
    $session.FindById("wnd[0]/usr/tblSAPLSE16NSELFIELDS_TC/btnPUSH[" & StringReplace($key, "m", "4") & "]").Press()
    Sleep(100)
    $session.FindById("wnd[1]/tbar[0]/btn[34]").Press()
    ClipPut($value)
    $session.FindById("wnd[1]/tbar[0]/btn[24]").Press()
    ClipPut("")
    $session.FindById("wnd[1]/tbar[0]/btn[8]").Press()
  ElseIf StringInStr($key, "F", 1) Then ; File
    $session.FindById("wnd[0]/usr/tblSAPLSE16NSELFIELDS_TC/btnPUSH[" & StringReplace($key, "F", "4") & "]").SetFocus()
    $session.FindById("wnd[0]/usr/tblSAPLSE16NSELFIELDS_TC/btnPUSH[" & StringReplace($key, "F", "4") & "]").Press()
    Sleep(100)
    $session.FindById("wnd[1]/tbar[0]/btn[34]").Press()
    $session.FindById("wnd[1]/tbar[0]/btn[21]").Press()
    Sleep(100)
    $parts = StringSplit($value, @CRLF, 1)
    $session.FindById("wnd[2]/usr/ctxtDY_PATH").Text = $parts[1]
    $session.FindById("wnd[2]/usr/ctxtDY_FILENAME").Text = $parts[2]
    $session.FindById("wnd[2]/tbar[0]/btn[0]").Press()
    $session.FindById("wnd[1]/tbar[0]/btn[8]").Press()
  ElseIf StringInStr($key, "f", 1) Then ; From
    $session.FindById("wnd[0]/usr/tblSAPLSE16NSELFIELDS_TC/ctxtGS_SELFIELDS-LOW[" & StringReplace($key, "f", "2") & "]").Text = $value
  ElseIf StringInStr($key, "t", 1) Then ; To
    $session.FindById("wnd[0]/usr/tblSAPLSE16NSELFIELDS_TC/ctxtGS_SELFIELDS-HIGH[" & StringReplace($key, "t", "3") & "]").Text = $value
  EndIf
Next

; Execute
$session.FindById("wnd[0]/tbar[1]/btn[8]").Press()

; Save to file (replace)
$session.FindById("wnd[0]/usr/cntlRESULT_LIST/shellcont/shell").PressToolbarContextButton("&MB_EXPORT")
$session.FindById("wnd[0]/usr/cntlRESULT_LIST/shellcont/shell").SelectContextMenuItem("&PC")
$session.FindById("wnd[1]/tbar[0]/btn[0]").Press()
$session.FindById("wnd[1]/usr/ctxtDY_PATH").Text = $outputPath
$session.FindById("wnd[1]/usr/ctxtDY_FILENAME").Text = $outputFile
$session.FindById("wnd[1]/usr/ctxtDY_FILE_ENCODING").Text = $codePage
$session.FindById("wnd[1]/tbar[0]/btn[11]").Press()

; Back to main screen
$session.FindById("wnd[0]/tbar[0]/btn[15]").Press()
$session.FindById("wnd[0]/tbar[0]/btn[15]").Press()

LogDebug("ENDING_TRANSACTION")

CloseSession()
