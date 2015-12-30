#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include "_Common.au3"

$outputPath = ReadIni("T_ZSE16D", "OutputPath", ReadIni("Transactions", "OutputPath", "C:\SAP\Output"))
$outputFile = ReadIni("T_ZSE16D", "OutputFile", "T_ZSE16D.txt")
$codePage = ReadIni("T_ZSE16D", "OutputEncoding", ReadIni("Transactions", "OutputEncoding", "4110"))
$table = ReadIni("T_ZSE16D", "Table", "")
$variant = ReadIni("T_ZSE16D", "Variant", "")

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug("T_ZSE16D.exe <arguments>")
  LogDebug()
  LogDebug("Arguments:")
  LogDebug("  --output-path")
  LogDebug("  --output-file")
  LogDebug("  --code-page")
  LogDebug("  --table")
  LogDebug("  --variant")
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
    EndSwitch
  Next
EndIf

LogDebug("T_ZSE16D")
LogDebug("--output-path=" & $outputPath)
LogDebug("--output-file=" & $outputFile)
LogDebug("--code-page=" & $codePage)
LogDebug("--table=" & $table)
LogDebug("--variant=" & $variant)

#include "_Logon.au3"

LogDebug("STARTING_TRANSATION")

; Start transaction
$session.StartTransaction("ZSE16D")

; Set variant
$session.FindById("wnd[0]/mbar/menu[2]/menu[0]/menu[0]").Select()
$session.FindById("wnd[1]/usr/ctxtGS_SE16N_LT-TAB").Text = $table
$session.FindById("wnd[1]/usr/ctxtGS_SE16N_LT-NAME").Text = $variant
$session.FindById("wnd[1]/tbar[0]/btn[0]").Press()

; Execute
$session.FindById("wnd[0]/tbar[1]/btn[8]").Press()

; Save to file (replace)
$session.FindById("wnd[0]/usr/cntlRESULT_LIST/shellcont/shell").pressToolbarContextButton("&MB_EXPORT")
$session.FindById("wnd[0]/usr/cntlRESULT_LIST/shellcont/shell").selectContextMenuItem("&PC")
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
