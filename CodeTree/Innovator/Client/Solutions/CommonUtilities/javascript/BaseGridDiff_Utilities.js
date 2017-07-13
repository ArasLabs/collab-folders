// ModuleName:  BaseGridDiff_Utiltities
// version: 	v3-1
// date:		Sept-2016
// innovator code tree location: ../Client/Solutions/CommonUtilities/javascript/BaseGridMain_Utiltities.js

/// Part of package: "commonBase Grid Utilities"

/// can be used to build your own "programmed" grids  (Tree or Flat)
/// use with your own JS logic that connects to Form Event "onload". Example code below shows how to include into your logic
/// SAMPLE:  if (typeof BaseGrid != 'function') {eval(top.aras.getFileText(top.aras.getBaseURL() + "/Solutions/CommonUtilities/javascript/CommonBaseGridUtilities.js"));}

/// Only works together with module "BaseGridMain_Utiltities" !!!

/// ===========================================
/// ====== Extensions to BASE GRID CLASS ======
/// ===========================================

//--- API
/// <summary>
///
/// </summary>
BaseGrid.prototype.DrawStructureRootDiffRow = function BaseGrid_DrawStructureRootDiffRow(gridStructureRelShipName, itemNode, rowConfig) {
		//debugger;
        return this.DrawStructureDiffRow_ex(gridStructureRelShipName, itemNode, null, null, null, rowConfig, true);
};

//--- API
/// <summary>
///
/// </summary>
BaseGrid.prototype.DrawStructureDiffRowChildren = function BaseGrid_DrawStructureDiffRowChildren(gridStructureRelShipName, parentItem, parentItemConfigId, parent_row_id, parents, rowConfig) {
	parents[parentItemConfigId] = true;
	var structRels = parentItem.getRelationships(gridStructureRelShipName);
	for (var i = 0; i < structRels.getItemCount() ; i++) {
		var relationshipNode = structRels.getItemByIndex(i);
		var itemNode = relationshipNode.getRelatedItem();
		if (itemNode) {
			if (itemNode.getAttribute("typeId", "") === "") { // re-used item - get item details from first use
				itemNode = this.FindItemInGridData(parentItem.getType(), itemNode.getID());
			}
			if (itemNode && itemNode.node) { // single item
				var childItemConfigId = itemNode.getProperty("config_id", "");
				var rowID = this.DrawStructureDiffRow_ex(gridStructureRelShipName, itemNode, relationshipNode, parentItemConfigId, parent_row_id, rowConfig, true);
				if (parents[childItemConfigId] !== true) {
					this.DrawStructureDiffRowChildren(gridStructureRelShipName, itemNode, childItemConfigId, rowID, parents, rowConfig);
				}
			}
		}
	}
	delete parents[parentItemConfigId];
};

//--- API
/// <summary>
///
/// </summary>
BaseGrid.prototype.InitChangeActionInAllRowData = function BaseGrid_InitChangeActionInAllRowData(thisRowId) {
	if (thisRowId && thisRowId !== undefined && thisRowId !== "") {
		// set for this row and children of this row
		//this.setChangeActionInRow(thisRowId, this.diffViewChangeActions.changeActionDeleted);
		var childIds = this.grid.getChildItemsId(thisRowId, true, "|").split("|");
		for (i=0; i<childIds.length && childIds[0] !== ""; i++) {
			this.setChangeActionInRow(childIds[i], this.diffViewChangeActions.changeActionDeleted);
		}
	}
	else {
		// set for all registered rows
		for (var rowId in this.gridRowUserData) {
			if (this.getGridRowUserData(rowId,"isPhantomRow") !== "1") {
				this.setChangeActionInRow(rowId, this.diffViewChangeActions.changeActionDeleted);
			}
		}
	}
};
///==========================================================================================================================

//--- NO API
BaseGrid.prototype.DrawStructureDiffRow_ex = function BaseGrid_DrawStructureDiffRow_ex(gridStructureRelShipName, itemNode, relationshipNode, parentItemConfigId, parentRowId, rowConfig, addRelatinonshipRows) {
	//conditional debugging --> 
	var itemID = itemNode.getID(); if (itemID === "297A0B83ADE749238F3ABA816097D15F") {debugger;}

	var parentItemID = null;
	if (relationshipNode) { parentItemID = relationshipNode.getProperty("source_id"); }
	var itemConfigID = itemNode.getProperty("config_id", "");

	var newRowID;
	if (parentRowId) {
		if (this.disallowDuplicateStructureItems) {
			newRowID = parentItemConfigId + "-" + itemConfigID;
		}
		else {
			newRowID = relationshipNode.getProperty("config_id", "") + "-" + itemConfigID;
		}
	}
	else { newRowID = "ROOT-" + itemConfigID; }

	this.UpdateDiffColumnsAndChangeActionOfRow(gridStructureRelShipName, parentItemID, parentItemConfigId, parentRowId, newRowID, itemNode, relationshipNode, rowConfig, addRelatinonshipRows);
	
	return newRowID;
};

BaseGrid.prototype.UpdateDiffColumnsAndChangeActionOfRow = function BaseGrid_UpdateDiffColumnsAndChangeActionOfRow(gridStructureRelShipName, parentItemID, parentItemConfigId, parentRowId, newRowID, itemNode, relationshipNode, rowConfig, addRelatinonshipRows) {
	var thisColumMapping;
	if (rowConfig.columnMapping) { thisColumMapping = rowConfig.columnMapping; }
	else { thisColumMapping = this.relShipBaselineColumnMappings[gridStructureRelShipName]; }

	haveItemPropsChanged = function (cntxt, itemType, itemId) {
		// detect if related Item got updated
		// expects released data to be loaded in 'gridData_AML' and current (diff) data to be loaded in 'gridDiffData_AML'
		var releasedItem = cntxt.gridData_AML.getItemsByXPath('//Item[@type="'+itemType+'" and @id="'+itemId+'"]')
		var currentItem = cntxt.gridDiffData_AML.getItemsByXPath('//Item[@type="'+itemType+'" and @id="'+itemId+'"]')
		if (releasedItem.getItemCount() === 1 && currentItem.getItemCount() === 1) {
			// assumes modified date on current item must be later than modified date on released item. (must be equal if no modifications were made)
			if (releasedItem.getProperty("modified_on","") !== currentItem.getProperty("modified_on","")) {
				return true;	
			}
		}
		return false;	
	};

	//+++ callback function to draw updated diff columns
	UpdateDiffColumnsOfRow = function (cntxt, rowId, relationshipNode, itemNode, relQueryName, bgColor, isAdded) {

		if (isAdded) {
			cntxt.setChangeActionInRow(rowId, cntxt.diffViewChangeActions["changeActionAdded"]);
			return;  // detail columns do not need data
		}
		else {
			var rowItemId = cntxt.getGridRowUserData(rowId, "rowItemID");
			if (rowItemId === itemNode.getID()) {
				if (haveItemPropsChanged(cntxt, itemNode.getType(), itemNode.getID())) {
					cntxt.setChangeActionInRow(rowId, cntxt.diffViewChangeActions["changeActionModified"]);
					return;  // detail columns do not need data
				}
				else {
					cntxt.setChangeActionInRow(rowId, cntxt.diffViewChangeActions["changeActionBlank"]);  // to reset the previously set default
					return;  // detail columns do not need data
				}
			}
			else {
				cntxt.setChangeActionInRow(rowId, cntxt.diffViewChangeActions["changeActionNewVersion"]);
				itemNode.setProperty("released_id", rowItemId); // here the itemNode points to the new item version !!! copy id of released item to new property
			}
		}
		
		// row must exist
		if (!cntxt.gridRowExists(rowId)) { return; }
		if (!bgColor || bgColor === undefined) { bgColor = null; }

		var data = { itemNode: itemNode, relationshipNode: relationshipNode };
		var row = new RowClass(cntxt, data, cntxt.gridVisibleColumns, thisColumMapping);
		row.bind(rowId, bgColor);

		var rowCellVals = row.getValues().split("|");

		// update row cells - assumes diffView columns are all to the right of column "CHG_ACTION"
		for (var i = cntxt.changeActionColumnNo + 1; i < rowCellVals.length; i++) {
			cntxt.gridSetCellValue(rowId, i, rowCellVals[i]);
		}
		
		cntxt.setGridRowUserData(rowId, "rowNewItemId", itemNode.getID());
		cntxt.setGridRowUserData(rowId, "rowItemType", itemNode.getType());
	};
	//--- callback function end

	
	var relQueryName;
	if (!relationshipNode) { relQueryName = gridStructureRelShipName; }
	else { relQueryName = relationshipNode.getType(); }
	
	// call later to 'DrawStructureRowRelationshipsGroups' needs this
	rowConfig.updateDiffColumnsCallback = UpdateDiffColumnsOfRow;

	if (!this.gridRowExists(newRowID)) {
		// changeAction = Added - add the new row
		var data = { itemNode: itemNode, relationshipNode: relationshipNode, parentRowId: parentRowId };
		var row = new RowClass(this, data, this.gridVisibleColumns, this.relShipColumnMappings[relQueryName]);

		var icon;
		if (rowConfig.rowIcon && rowConfig.rowIcon !== undefined && rowConfig.rowIcon !== "{rowItemType}") { // use icon configured in xml file
			icon = rowConfig.rowIcon;
		}
		else { //get small icon of item type
			var iconItemType = itemNode.getType();
			if (!this.icons[iconItemType] || this.icons[iconItemType] === undefined) {
				this.icons[iconItemType] = fn_GetSmallIconFormatOfItemType(iconItemType);
				icon = this.icons[iconItemType];
			}
			else {
				icon = this.icons[iconItemType];
			}
		}
		
		if (!parentRowId) {
			this.grid.insertRoot(newRowID, row.getValues(), newRowID, icon, icon);
		} else {
			this.grid.insertNewChild(parentRowId, newRowID, row.getValues(), newRowID, icon, icon);
		}
		row.bind(newRowID, rowConfig.rowBgColor, itemNode.getType(), itemNode.getID());
		this.setGridRowUserData(newRowID, "rowItemConfigId", itemNode.getProperty("config_id", ""));
		this.setGridRowUserData(newRowID, "rowRelationshipType", gridStructureRelShipName);
		this.setGridRowUserData(newRowID, "rowOfGroupName", gridStructureRelShipName);

		// add other relationship items as children
		if (addRelatinonshipRows) {
			this.DrawStructureRowRelationshipsGroups(gridStructureRelShipName, parentItemID, parentItemConfigId, itemNode, newRowID, rowConfig);
			// set same change action to all added children
			var childIds = this.grid.getChildItemsId(newRowID, true, "|").split("|");
			for (i=0; i<childIds.length && childIds[0] !== ""; i++) {
				this.setChangeActionInRow(childIds[i], this.diffViewChangeActions["changeActionAdded"]);
			}
		}
		// update values on diff columns and set the change Action
		UpdateDiffColumnsOfRow(this, newRowID, relationshipNode, itemNode, relQueryName, rowConfig.rowBgColor, true);

	}
	else {  
		//update existing rows
		var rowItemId = this.getGridRowUserData(newRowID, "rowItemID");
		if (rowItemId === itemNode.getID()) {
			if (haveItemPropsChanged(this, itemNode.getType(), itemNode.getID())) {
				this.setChangeActionInRow(newRowID, this.diffViewChangeActions["changeActionModified"]);
			}
			else {
				this.setChangeActionInRow(newRowID, this.diffViewChangeActions["changeActionBlank"]);  // to reset the previously set default
			}
			
			//### TODO ### detect if relationship Item got updated

			// update child items from other relationships (off of structure node item) --> calls callback to update to relevant changeAction
			if (addRelatinonshipRows)
				{this.DrawStructureRowRelationshipsGroups(gridStructureRelShipName, parentItemID, parentItemConfigId, itemNode, newRowID, rowConfig);}
		}
		else {
			// new version detected in this row
			
			// update child items from other relationships (off of structure node item) --> calls callback to update to relevant changeAction
			if (addRelatinonshipRows) {
				this.DrawStructureRowRelationshipsGroups(gridStructureRelShipName, parentItemID, parentItemConfigId, itemNode, newRowID, rowConfig);
			}
			// update values on diff columns and sets the change Action
			UpdateDiffColumnsOfRow(this, newRowID, relationshipNode, itemNode, relQueryName, rowConfig.rowBgColor, false);
		}
	}
};

//--- API
/// <summary>
///
/// </summary>
BaseGrid.prototype.colorCodeAddedAndDeletedRows = function BaseGrid_colorCodeAddedAndDeletedRows() {
	var c;
	for (var rowId in this.gridRowUserData) {
		var changeAction = this.gridRowUserData[rowId].rowChangeAction;
		if (!changeAction || changeAction === undefined) { changeAction = ""; }
		//else {alert(changeAction);}


		if (changeAction === this.diffViewChangeActions["changeActionDeleted"]) {
			// color code up to change Action column
			for (c = 0; c < this.changeActionColumnNo + 1; c++) { this.grid.SetCellTextColor(rowId, c, this.diffViewDeletedRowTextColor); }
		}
		if (changeAction === this.diffViewChangeActions["changeActionAdded"]) {
			// color code up to change Action column
			for (c = 0; c < this.changeActionColumnNo + 1; c++) { this.grid.SetCellTextColor(rowId, c, this.diffViewAddedRowTextColor); }
		}

		// highlight change Action cell
		var actionBg;
		switch (changeAction) {
			case "":
			case " ":
			case this.diffViewChangeActions["changeActionBlank"]:
			case this.diffViewChangeActions["changeActionModified"]:
				actionBg = "";
				break;
			default:
				actionBg = this.diffViewChangeActionBgColor;
				break;
		}
		if (actionBg !== "") {
			var gridCell = this.grid.cells(rowId, this.changeActionColumnNo);
			//if (this.isTreeGrid) {gridCell.setBgColor(actionBg);}
			//else {gridCell.SetBgColor_Experimental(actionBg);}
			//#TODO - replace _Experimental call# else {gridCell.SetBgColor(actionBg);}
			gridCell.SetBgColor_Experimental(actionBg);
		}
	}
};

//--- API
/// <summary>
///
/// </summary>
BaseGrid.prototype.setChangeActionInRow = function BaseGrid_setChangeActionInRow(rowId, changeAction) {
	this.gridSetCellValue(rowId, this.changeActionColumnNo, changeAction);
	this.setGridRowUserData(rowId, "rowChangeAction", changeAction);

	// also clear some cell values for added rows	
	if (changeAction === this.diffViewChangeActions["changeActionAdded"]) {
		var array = this.diffViewAddedRowColsToClear.split(",");
		for (var i = 0; i < array.length; i++) {
			var col = this.getIndexOfVisibleColumnByName(array[i]);
			if (col >= 0) { this.gridSetCellValue(rowId, col, ""); }  // clear cell in this column
		}
	}
	return;
};

