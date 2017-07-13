//==================================================================================
//==== FLAT GRID CLASS ====
// reads flat Grid configuration from item of type "fgc_Configuration" into memory

//Data model: (with NULL relationships only)
//
//				[fgc_Configuration]  (state: New, In Review, Released) has Revisions: A,B,C
//					|
//					+->		[fgc_Constant]
//					+->		[fgc_Toolbar Element]
//					|			|
//					|			+->		[fgc_Toolbar Element Choice]
//					|
//					+->		[fgc_ColumnDef]
//					+->		[fgc_MenuAction]
//					+->		[fgc_Item Prop MappingDef]
//					|
//					+->		[fgc_Apply to Item Types]

//++++ Configurations Class (holds all configuration parameter)
FlatGridConfiguration = function FlatGridConfigurationFunc(configName) {
  this.configurationName = this.excapeXML(configName);
  this.configValues = {}; // holds simple parameter values
  this.isTreeGrid = false;
  
  this.toolbarId = "";
  this.toolbarElements = [];

  this.lockColumnIndex = -1;
  this.configItemIsLoaded = false;
  
  if (this.configurationName && this.configurationName !== undefined) {
	this.loadConfigItem(this.configurationName);
  }
};
FlatGridConfiguration.prototype = new GridConfigurationBase();

//++++ Flat Grid  INTERFACE API +++++
FlatGridConfiguration.prototype.getGridItemType = function FlatGridConfiguration_getGridItemType() {
	return this.getGridItemType;
};

FlatGridConfiguration.prototype.loadConfigItem = function FlatGridConfiguration_loadConfigItem(configItemName) {
  if (this.configItemIsLoaded) {return;}  // config is loaded already

  this.configurationName = this.excapeXML(configItemName);
  this.setValue("GridConfigItem", configItemName);
//debugger;

	if (!configItemName || configItemName === undefined) {configItemName="";}
	// call server method to find grid configuration - if configItemName = "", then the server methods finds it from variable settings
	//alert(this.applyToItemType);
	var configItem = top.aras.newIOMItem("");
	configItem.loadAML('<Item type="'+this.applyToItemType+'" action="CommonBase GetGridConfigItem" configName="'+configItemName+'" />');
	configItem = configItem.apply();
	if (configItem.isError()) {
		top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.cannot_load_grid_configuration").format(configItemName)+" - "+configItem.getErrorString());
		return false;
	}
	
	this.configItem = configItem;

	this.toolbarId = configItem.getProperty("toolbar_id","");
	var val;
	
	this.gridItemType = configItem.getProperty("grid_item_type","");
	if (this.gridItemType === "NULL") {this.gridItemType = "";}
	val = configItem.getProperty("item_select_properties","");
	this.gridItemSelect = val.replace(/ /g,"");
	val = configItem.getProperty("item_order_by","");
	this.gridItemOrderBy = val.replace(/ /g,"");

	this.gridRelationshipType = configItem.getProperty("grid_relationship_type","");
	val = configItem.getProperty("relationship_select_properties","");
	this.gridRelationshipSelect = val.replace(/ /g,"");
	
	this.gridItemReleasedCondition = configItem.getProperty("item_released_condition","");
	
	val = configItem.getProperty("row_bg_color","");	if (val === "") {val = "";} //default
	this.rowBgColor = val;
	val = configItem.getProperty("row_icon_path","");
	if (val !== "") {this.rowIcon = val;}
	
	var rels = configItem.getItemsByXPath("//Item/Relationships/Item[@type='fgc_Constant']");
	for(var i = 0; i < rels.getItemCount(); i++) {
		var constName = rels.getItemByIndex(i).getProperty("name","");
		var constValue = rels.getItemByIndex(i).getProperty("value","");
		this.setValue(constName,constValue);
	}

	this.configItemIsLoaded = true;
};
FlatGridConfiguration.prototype.getItemSelectProperties = function FlatGridConfiguration_getItemSelectProperties() {
	return this.gridItemSelect;
};
FlatGridConfiguration.prototype.buildGridDataQueryAML = function FlatGridConfiguration_buildGridDataQueryAML(isReleased, itemId) {
    // build Item query
	var queryItem = top.aras.newIOMItem(this.gridItemType,"get");
	queryItem.setAttribute("select",this.gridItemSelect);
	if (this.gridItemOrderBy !== "") {queryItem.setAttribute("orderBy",this.gridItemOrderBy);}

	if (itemId && itemId !== "") {queryItem.setID(itemId);}
	if (isReleased) {
		fn_setConditonOnItem (queryItem, this.gridItemReleasedCondition);
	}
	
	if (this.gridRelationshipType !== "") {
		var relshipItem = top.aras.newIOMItem(this.gridRelationshipType,"get");
		relshipItem.setAttribute("select",this.gridRelationshipSelect);	
		
		if (this.gridItemType !== "" && this.gridItemType !== "NULL") {relshipItem.setRelatedItem(queryItem);}
		return relshipItem.node.xml;
		
	}
	return queryItem.node.xml;
};

FlatGridConfiguration.prototype.getGridDefinitionXml = function FlatGridConfiguration_getGridDefinitionXml(hasInputRow) {
	this.allMenuActions = [];  // clear previous menu actions
	actionMenuItems = this.configItem.getItemsByXPath("//Item/Relationships/Item[@type='fgc_MenuAction']");
	this.addActionMenuItemConfig(actionMenuItems, "default");
	
	var colNames = this.configItem.getItemsByXPath("//Item/Relationships/Item[@type='fgc_ColumnDef']");
	this.setVisibleColumns(colNames, false);

	// read column mappings into memory
	var propMappings = this.configItem.getItemsByXPath("//Item/Relationships/Item[@type='fgc_Item Prop MappingDef']");
	this.itemColumnMappings = [];
	this.setPropertyMappingsConfig(propMappings, this.itemColumnMappings, null);
	
	return this.getGridXML(hasInputRow);
};
//^^^^^ INTERFACE API ^^^^^
