#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include <Date.au3>
#include <StringConstants.au3>
#include "_Common.au3"

$order = ReadIni("T_LP10", "Order", "")
$qtyProposal = ReadIni("T_LP10", "QtyProposal", "total")
$totalQty = ReadIni("T_LP10", "TotalQty", "")
$totalQtyPercent = ReadIni("T_LP10", "TotalQtyPercent", "")
$targetQty = ReadIni("T_LP10", "TargetQty", "")
$uom = ReadIni("T_LP10", "UoM", "")
$priority = ReadIni("T_LP10", "Priority", "")
$date = ReadIni("T_LP10", "Date", "+1")
$time = ReadIni("T_LP10", "Time", "23:59:59")
$recipient = ReadIni("T_LP10", "Recipient", "")
$unloadingPoint = ReadIni("T_LP10", "UnloadingPoint", "")
$toCreation = ReadIni("T_LP10", "ToCreation", "0")
$completeTr = ReadIni("T_LP10", "CompleteTr", "0")
$confirmedQty = ReadIni("T_LP10", "ConfirmedQty", "0")
$workCenter = ReadIni("T_LP10", "WorkCenter", "")
$plant = ReadIni("T_LP10", "Plant", "")
$operAct = ReadIni("T_LP10", "OperAct", "")
$sequence = ReadIni("T_LP10", "Sequence", "")
$background = ReadIni("T_LP10", "Background", "1")

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug("T_LP10.exe <arguments>")
  LogDebug()
  LogDebug("Arguments:")
  LogDebug("  --order")
  LogDebug("  --qty-proposal (rem, indiv or total)")
  LogDebug("  --total-qty")
  LogDebug("  --total-qty-percent")
  LogDebug("  --target-qty")
  LogDebug("  --uom")
  LogDebug("  --priority")
  LogDebug("  --date")
  LogDebug("  --time")
  LogDebug("  --recipient")
  LogDebug("  --unloading-point")
  LogDebug("  --to-creation")
  LogDebug("  --complete-tr")
  LogDebug("  --confirmed-qty")
  LogDebug("  --workcenter")
  LogDebug("  --plant")
  LogDebug("  --oper-act")
  LogDebug("  --sequence")
  LogDebug("  --background")
  Exit(0)
EndIf

If $CmdLine[0] > 0 And Mod($CmdLine[0], 2) = 0 Then
  For $i = 1 To ($CmdLine[0] - 1) Step 2
    $k = StringLower(StringReplace($CmdLine[$i], "-", "", 0, 2))
    $v = $CmdLine[$i + 1]

    Switch $k
      Case "order"
        $order = $v
      Case "qtyproposal"
        $qtyProposal = $v
      Case "totalqty"
        $totalQty = $v
      Case "totalqtypercent"
        $totalQtyPercent = $v
      Case "targetqty"
        $targetQty = $v
      Case "uom"
        $uom = $v
      Case "priority"
        $priority = $v
      Case "date"
        $date = $v
      Case "time"
        $time = $v
      Case "recipient"
        $recipient = $v
      Case "unloadingpoint"
        $unloadingPoint = $v
      Case "tocreation"
        $toCreation = $v
      Case "completetr"
        $completeTr = $v
      Case "confirmedqty"
        $confirmedQty = $v
      Case "workcenter"
        $workCenter = $v
      Case "plant"
        $plant = $v
      Case "operact"
        $operAct = $v
      Case "sequence"
        $sequence = $v
      Case "background"
        $background = $v
    EndSwitch
  Next
EndIf

LogDebug("T_LP10")
LogDebug("--order=" & $order)
LogDebug("--qty-proposal=" & $qtyProposal)
LogDebug("--total-qty=" & $totalQty)
LogDebug("--total-qty-percent=" & $totalQtyPercent)
LogDebug("--target-qty=" & $targetQty)
LogDebug("--uom=" & $uom)
LogDebug("--priority=" & $priority)
LogDebug("--date=" & $date)
LogDebug("--time=" & $time)
LogDebug("--recipient=" & $recipient)
LogDebug("--unloading-point=" & $unloadingPoint)
LogDebug("--to-creation=" & $toCreation)
LogDebug("--complete-tr=" & $completeTr)
LogDebug("--confirmed-qty=" & $confirmedQty)
LogDebug("--workcenter=" & $workCenter)
LogDebug("--plant=" & $plant)
LogDebug("--oper-act=" & $operAct)
LogDebug("--sequence=" & $sequence)
LogDebug("--background=" & $background)

If StringRegExp($date, "^[+-]?[0-9]{1,2}$") Then
  Local $dateParts, $timeParts

  _DateTimeSplit(_DateAdd("D", Int($date), _NowCalcDate()), $dateParts, $timeParts)

  $date = $dateParts[3] & "." & $dateParts[2] & "." & $dateParts[1]
EndIf

If Not StringRegExp($date, "^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{4}$") Then
  $date = ""
EndIf

Global $candidateSession = Null
$wrapper = ObjCreate("SapROTWr.SAPROTWrapper")

LogDebug("CHECKING_WRAPPER_0")

If IsObj($wrapper) Then
  $sapgui = $wrapper.GetROTEntry("SAPGUI")

  LogDebug("CHECKING_SAPGUI_0")

  If IsObj($sapgui) Then
    $application = $sapgui.GetScriptingEngine()

    LogDebug("CHECKING_SCRIPTING_ENGINE_0")

    If IsObj($application) Then
      $application.AllowSystemMessages = False
      $application.HistoryEnabled = False

      $connection = $application.Children(0)

      LogDebug("CHECKING_CONNECTION_0")

      If IsObj($connection) Then
        For $i = 0 To $connection.Children.Count
          LogDebug("CHECKING_CANDIDATE_" & $i)

          $candidate = $connection.Children($i)

          If IsObj($candidate) And Not $candidate.Busy And IsObj($candidate.FindById("wnd[0]/usr/txtLRESB-AUFNR")) And IsObj($candidate.FindById("wnd[0]/usr/radRLCPP-DUNKL")) Then
            $candidateSession = $candidate
            ExitLoop
          EndIf
        Next
      EndIf
    EndIf
  EndIf
EndIf

$startTransaction = Not IsObj($candidateSession)

#include "_Logon.au3"

LogDebug("STARTING_TRANSATION")

If $startTransaction Then
  ; Start transaction
  $session.StartTransaction("LP10")
EndIf

$session.FindById("wnd[0]").maximize()
$session.FindById("wnd[0]").setFocus()

WinActivate("Stage Remaining Material Quantities for Production Order")

; Order
$session.FindById("wnd[0]/usr/txtLRESB-AUFNR").text = $order

; Quantity Proposal
Switch $qtyProposal
  Case "rem"
    $session.FindById("wnd[0]/usr/radRLCPP-RESTM").select
  Case "indiv"
    $session.FindById("wnd[0]/usr/radRLCPP-EINZL").select
  Case "total"
    $session.FindById("wnd[0]/usr/radRLCPP-PROAN").select
EndSwitch

$session.FindById("wnd[0]/usr/txtRLCPP-PROZM").text = $totalQtyPercent
$session.FindById("wnd[0]/usr/txtRLCPP-GMENG").text = $targetQty
$session.FindById("wnd[0]/usr/txtLRESB-ERFME").text = $uom

; Additional Info for Transfer Requirement
$session.FindById("wnd[0]/usr/txtLTBK-TBPRI").text = $priority
$session.FindById("wnd[0]/usr/ctxtLTBK-PDATU").text = $date
$session.FindById("wnd[0]/usr/ctxtLTBK-PZEIT").text = $time
$session.FindById("wnd[0]/usr/txtLTBP-WEMPF").text = $recipient
$session.FindById("wnd[0]/usr/txtLTBP-ABLAD").text = $unloadingPoint
$session.FindById("wnd[0]/usr/chkRLCPP-DIRTA").selected = $toCreation = "1" ? True : False
$session.FindById("wnd[0]/usr/chkRLCPP-KZTBV").selected = $completeTr = "1" ? True : False
$session.FindById("wnd[0]/usr/chkRLCPP-KZBMG").selected = $confirmedQty = "1" ? True : False

; Additional Selections
$session.FindById("wnd[0]/usr/txt*CRHD-ARBPL").text = $workCenter
$session.FindById("wnd[0]/usr/ctxt*CRHD-WERKS").text = $plant
$session.FindById("wnd[0]/usr/txtLRESB-VORNR").text = $operAct
$session.FindById("wnd[0]/usr/txtLRESB-PLNFL").text = $sequence

;Screen Control
If $background = "1" Then
  $session.FindById("wnd[0]/usr/radRLCPP-DUNKL").select
Else
  $session.FindById("wnd[0]/usr/radRLCPP-HELL").select
EndIf

$session.UnlockSessionUI()

Exit(0)
