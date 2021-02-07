#Region ;**** Directives created by AutoIt3Wrapper_GUI ****
#AutoIt3Wrapper_Change2CUI=y
#EndRegion ;**** Directives created by AutoIt3Wrapper_GUI ****

#include "_Common.au3"

$t = "T_DP_CH"

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug($t & " <items>")
  LogDebug()
  LogDebug("Items: <sales-order-no>/<sales-order-item-1>[/<sales-order-item-n>...]")
  Exit(0)
EndIf

If $CmdLine[0] > 0 Then
  For $i = 1 To $CmdLine[0] Step 1
    If Not StringRegExp($CmdLine[$i], "^[0-9]+(\/[0-9]+)+$") Then
      LogError("INVALID_ITEMS", 1)
    EndIf
  Next
EndIf

LogDebug($t)

#include "_Logon.au3"

LogDebug("STARTING_TRANSATION")

; Start transaction
$session.StartTransaction("VA03")

$itemOverviewId = "wnd[0]/tbar[1]/btn[6]"
$itemTblId = "wnd[0]/usr/tabsTAXI_TABSTRIP_OVERVIEW/tabpT\02/ssubSUBSCREEN_BODY:SAPMV45A:4401/subSUBSCREEN_TC:SAPMV45A:4900/tblSAPMV45ATCTRL_U_ERF_AUFTRAG"
$configTblId1 = "wnd[0]/usr/tabsTABSTRIP_CHAR/tabpTAB1/ssubCHARACTERISTICS:SAPLCEI0:1400/tblSAPLCEI0CHARACTER_VALUES"
$configTblId2 = "wnd[0]/usr/subCHARACTERISTICS:SAPLCEI0:1400/tblSAPLCEI0CHARACTER_VALUES"

For $orderI = 1 To $CmdLine[0] Step 1
  $parts = StringSplit($CmdLine[$orderI], "/")
  $order = $parts[1]

  LogDebug("SALES_ORDER_NO=" & $order)

  ; Set Sales order
  $ctrlId = "wnd[0]/usr/ctxtVBAK-VBELN"
  $ctrl = $session.FindById($ctrlId)
  AssertControl($ctrl, $ctrlId)
  $ctrl.Text = $order

  ; Execute Item overview
  $ctrl = $session.FindById($itemOverviewId)
  AssertControl($ctrl, $itemOverviewId)
  $ctrl.Press()

  ; Close a possible modal
  $modal = $session.FindById("wnd[1]")

  If IsObj($modal) Then
    LogDebug("CLOSING_DIALOG=" & ReadAllText($modal, " "))
    $modal.Close()
  EndIf

  ; Check the status bar
  $error = ""

  If Not IsObj($session.FindById($itemTblId)) Then
    $sbar = $session.FindById("wnd[0]/sbar")

    If IsObj($sbar) And $sbar.Text <> "" Then
      $btn = $session.FindById($itemOverviewId)

      If IsObj($btn) And $btn.Text = "Item overview" Then
        $btn.Press()

        If Not IsObj($session.FindById($itemTblId)) And $sbar.Text <> "" Then
          $error = "ERROR=STATUS_BAR=VA03: " & $sbar.Text
        EndIf
      Else
        $error = "ERROR=STATUS_BAR=VA03: " & $sbar.Text
      EndIf
    EndIf
  EndIf

  For $itemI = 2 To $parts[0] Step 1
    $item = $parts[$itemI]

    LogDebug("SALES_ORDER_ITEM=" & $item)

    If $error <> "" Then
      LogDebug($error)
      ContinueLoop
    EndIf

    ; Find Sales order item
    $tbl = $session.FindById($itemTblId)
    AssertControl($tbl, $itemTblId)

    $visibleRowCount = $tbl.VisibleRowCount - 1

    $tbl.VerticalScrollbar.Position = 0

    $lastKey = ""
    $itemFound = False
    $searching = True
    $page = 0

    LogDebug("SEARCHING")

    While $searching
      $page = $page + 1
      $tbl = $session.FindById($itemTblId)

      If Not IsObj($tbl) Then
        LogDebug("NO_TABLE_FOR_SEARCH")
        ExitLoop
      EndIf

      For $j = 0 To $visibleRowCount Step 1
        $cell = $tbl.GetCell($j, 0)

        If Not IsObj($cell) Or $cell.Text = $lastKey Then
          LogDebug("NO_CELL")
          $searching = False
          ExitLoop
        EndIf

        $lastKey = $cell.Text

        LogDebug("ITEM_CANDIDATE=" & $lastKey)

        If $lastKey = $item Then
          LogDebug("ITEM_FOUND")
          $cell.SetFocus()
          $itemFound = True
          $searching = False
          ExitLoop
        EndIf
      Next

      If $searching = True Then
        LogDebug("SCROLLING_ITEMS")

        $tbl = $session.FindById($itemTblId)

        If Not IsObj($tbl) Then
          LogDebug("NO_TABLE_FOR_SCROLL")
          ExitLoop
        EndIf

        $tbl.VerticalScrollbar.Position = $page * ($visibleRowCount + 1)
      EndIf
    WEnd

    If $itemFound = False Then
      LogDebug("ERROR=ITEM_NOT_FOUND")
      ContinueLoop
    EndIf

    ; Execute Item details: Configuration
    For $i = 1 To 3 Step 1
      LogDebug("EXECUTE_CONFIGURATION=" & $i)
      $ctrlId = "wnd[0]/usr/tabsTAXI_TABSTRIP_OVERVIEW/tabpT\02/ssubSUBSCREEN_BODY:SAPMV45A:4401/subSUBSCREEN_TC:SAPMV45A:4900/subSUBSCREEN_BUTTONS:SAPMV45A:4050/btnBT_POCO"
      $ctrl = $session.FindById($ctrlId)
      AssertControl($ctrl, $ctrlId)
      $ctrl.Press()

      ; Close any modal
      $modal = $session.FindById("wnd[1]")

      If IsObj($modal) Then
        LogDebug("CLOSING_MODAL=" & ReadAllText($modal, " "))
        If $modal.Text = "Conflict" Then
          $continue = $session.FindById("wnd[1]/tbar[0]/btn[0]")
          If IsObj($continue) Then
            LogDebug("SKIP_CONFLICT")
            $continue.Press()
          Else
            $modal.Close()
          EndIf
        Else
          $modal.Close()
        EndIf
      EndIf

      ; Check for constraint restriction
      $sbar = $session.FindById("wnd[0]/sbar")

      If Not IsObj($sbar) Or Not StringInStr($sbar.Text, "constraint restriction") Then
        ExitLoop
      EndIf

      If $i = 3 Then
        LogDebug("ERROR=STATUS_BAR=VA03: " & $sbar.Text)
      Else
        LogDebug("SKIP_CONSTRAINT_RESTRICTION=" & $sbar.Text)
      EndIf
    Next

    ; Find all characteristics
    $configTblId = $configTblId1
    $tbl = $session.FindById($configTblId)

    If Not IsObj($tbl) Then
      $configTblId = $configTblId2
      $tbl = $session.FindById($configTblId)
    EndIf

    If Not IsObj($tbl) Then
      LogDebug("ITEM_NOT_CONFIGURABLE")
      ContinueLoop
    EndIf

    ; Change language settings
    $nameCell = $tbl.GetCell(0, 0)
    If Not IsObj($nameCell) Or Not StringRegExp($nameCell.Text, "^[A-Z0-9]+_[A-Z0-9]+$") Then
      $session.FindById("wnd[0]").sendVKey(19)
      $ctrlId = "wnd[1]/usr/tabsSICHTEN/tabpBUT1/ssubEINSTELL:SAPLCUST:0210/radCSTS-NEUTR"
      $ctrl = $session.FindById($ctrlId)
      AssertControl($ctrl, $ctrlId)
      $ctrl.Select()
      $session.FindById("wnd[1]/usr/tabsSICHTEN/tabpBUT1/ssubEINSTELL:SAPLCUST:0210/radCHAR_VALUE").Select()
      $session.FindById("wnd[1]/tbar[0]/btn[5]").Press()
    EndIf

    $tbl = $session.FindById($configTblId)
    $visibleRowCount = $tbl.VisibleRowCount - 1
    $tbl.VerticalScrollbar.Position = 0

    $lastKey = ""
    $searching = True
    $page = 0

    While $searching
      $page = $page + 1
      $tbl = $session.FindById($configTblId)
      AssertControl($tbl, $configTblId)

      For $j = 0 To $visibleRowCount Step 1
        $cell = $tbl.GetCell($j, 0)

        If Not IsObj($cell) Or $cell.Text = $lastKey Then
          LogDebug("CONFIG_NAME_NOT_FOUND")
          $searching = False
          ExitLoop
        EndIf

        $lastKey = $cell.Text

        $cell = $tbl.GetCell($j, 1)

        If Not IsObj($cell) Then
          LogDebug("CONFIG_VALUE_NOT_FOUND")
          $searching = False
          ExitLoop
        EndIf

        LogDebug("CONFIG_FOUND=" & $lastKey & "=" & $cell.Text)
      Next

      If $searching = True Then
        LogDebug("SCROLLING_CONFIG")
        $tbl = $session.FindById($configTblId)
        AssertControl($tbl, $configTblId)
        $tbl.VerticalScrollbar.Position = $page * ($visibleRowCount + 1)
      EndIf
    WEnd

    ; Back to item overview
    For $i = 1 To 3 Step 1
      LogDebug("BACK_TO_ITEM_OVERVIEW=" & $i)
      $ctrlId = "wnd[0]/tbar[0]/btn[15]"
      $ctrl = $session.FindById($ctrlId)
      AssertControl($ctrl, $ctrlId)
      $ctrl.Press()

      ; Close possible modal
      $modal = $session.FindById("wnd[1]")

      If IsObj($modal) Then
        LogDebug("CLOSING_DIALOG=" & ReadAllText($modal, " "))

        If $modal.Text = "Exit Configuration" Then
          $ctrl = $session.FindById("wnd[1]/usr/btnSPOP-OPTION1")
          If IsObj($ctrl) Then
            $ctrl.Press()
          Else
            $modal.Close()
          EndIf
        Else
          $modal.Close()
        EndIf
      EndIf

      $btn = $session.FindById($configTblId)
      If Not IsObj($btn) Then
        ExitLoop
      EndIf
    Next
  Next

  ; Stay on the initial screen
  $btn = $session.FindById($itemOverviewId)
  If IsObj($btn) And $btn.Text = "Item overview" Then
    ContinueLoop
  EndIf

  ; Back to the initial screen
  LogDebug("BACK_TO_INITIAL_SCREEN")
  $ctrlId = "wnd[0]/tbar[0]/btn[12]"
  $ctrl = $session.FindById($ctrlId)
  AssertControl($ctrl, $ctrlId)
  $ctrl.Press()

  ; Close any modals
  While True
    $modal = $session.FindById("wnd[1]")

    If Not IsObj($modal) Then
      ExitLoop
    EndIf

    LogDebug("CLOSING_MODAL=" & ReadAllText($modal, " "))
    $modal.Close()
  WEnd

  ; Still on item overview: go back to the initial screen again
  If StringInStr($session.FindById("wnd[0]").Text, "Display Project Order") Then
    $ctrlId = "wnd[0]/tbar[0]/btn[12]"
    $ctrl = $session.FindById($ctrlId)
    AssertControl($ctrl, $ctrlId)
    $ctrl.Press()
  EndIf
Next

LogDebug("ENDING_TRANSACTION")
CloseSession()
