// ModuleName:  BaseGridMain_Utiltities
// version: 	v3-1
// date:		Sept-2016
// innovator code tree location: ../Client/Solutions/CommonUtilities/javascript/BaseGridMain_Utiltities.js

/// Part of package: "commonBase Grid Utilities"

/// can be used to build your own "programmed" grids  (Tree or Flat)
/// use with your own JS logic that connects to Form Event "onload". Example code below shows how to include into your logic
/// SAMPLE:  if (typeof BaseGrid != 'function') {eval(top.aras.getFileText(top.aras.getBaseURL() + "/Solutions/CommonUtilities/javascript/CommonBaseGridUtilities.js"));}

/// assumes grid will get connected to an html field on an Aras form.

/// registers grid events to connect your callbacks to.

/// can be used together with module - "commonBase Grid Configurations"  (read grid/toolbar/menu configurations from config items from Aras server)

/// ======================================
/// ======BASE GRID CLASS ================
/// ======================================
BaseGrid = function () {
    // determine browser type
    navigator.sayswho = (function () {
        var ua = navigator.userAgent, tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d\.]+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+(\.\d+)?)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/([\.\d]+)/i)) !== null) { M[2] = tem[1]; }
        return M.join(' ');
    })();
    this.browserType = navigator.sayswho;
    //if (navigator.sayswho.indexOf("MSIE") < 0)
    //{
    //alert("This form only works with 'Internet Explorer' !  Your browser is '"+ navigator.sayswho +"'");
    //}
	
	// mix-in C# like .format function to string class
	if (!String.prototype.format) {
		String.prototype.format = function() {
			var s = this,i = arguments.length;
			while (i--) {s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);}
			return s;
		};
	}
	
	var variable_dom;
	variable_dom = top.aras.getItemFromServerByName("Variable", "VersionMajor", "value,default_value");
	var arasReleaseCode = variable_dom.getProperty("value","");
	variable_dom = top.aras.getItemFromServerByName("Variable", "VersionServicePack", "value,default_value");
	arasReleaseCode += "-" + variable_dom.getProperty("value","");
	this.arasRelaseCode = arasReleaseCode;
	this.arasUseOldDojoPath = false;
	if (this.arasRelaseCode === "10-SP3" || this.arasRelaseCode === "10-SP2" || this.arasRelaseCode === "10-SP1" ) { // backward compatibility
		this.arasUseOldDojoPath = true; }

	this.gridDataAML = null;
	this.icons = {};
	this.iconsOpen = {};
	this.use_svg_icons = true;  /*enables icons: "locked","locked_else","item_chk0","item_chk1" */
	
	// item type based icons
	this.icons["default"] = "";
};

BaseGrid.prototype = {
    //variables
    grid: null,
    toolbar: null,

    numberOfGridColumns: -1,
    icons: {},
    iconsOpen: {},
    use_svg_icons: true,  /*enables icons: "locked","locked_else","item_chk0","item_chk1" */
	
    //methods
    handleToolbarOnClick: function (item) {
        this.grid.turnEditOff();
        var id = item.getId();
        this.onToolbarClick({ id: id });
    },

    handleToolbarOnChange: function (item) {
        var id = item.getId();
        this.onToolbarChange({ id: id });
    },
    handleToolbarKeyPress: function (key) {
        this.onToolbarKeyPress({ key: key });
    },

    handleGridClick: function (rowId, column) {
        this.onGridClick({ rowId: rowId, column: column });
    },

    handleGridDoubleClick: function (rowId) {
        this.onGridDoubleClick({ rowId: rowId });
    },

    handleGridLinkClick: function (strLink) {
        this.onGridLinkClick({ linkData: strLink });
    },

    handleGridMenuInit: function (rowId, col, p) {
        var menu = this.grid.getMenu();
        var menuItems = [];
        this.handleGridMenuClick = function (menuChoice) { }; // reset previous handler;
        menu.removeAll();
        var menuInit = this.onGridMenuInit({ rowId: rowId, column: col, menuItems: menuItems });
        if (menuInit) {
            for (var i = 0; i < menuItems.length; i++) {
                if (menuItems[i].separator) {
                    menu.addSeparator();
                } else {
                    //menu.add(i.toString(), (menuItems[i].label || ""), { disable: !menuItems[i].enabled });
                    menu.add(menuItems[i].name, (menuItems[i].label || ""), { disable: !menuItems[i].enabled });
                }
            }

            //set new handler which lock in closer menuItems
            this.handleGridMenuClick = function (menuChoice) {
                var selectedId = this.grid.getSelectedId();
                if (selectedId) {
					// to remain backward compatible with older versions, we must return the index of the menu item !!
					var menuItemIdx = -1;
					for (var i = 0; i < menuItems.length && menuItemIdx < 0; i++) {
						if (menuItems[i].name === menuChoice) {menuItemIdx = i;}
					}
                    if (menuItemIdx >=0) {this.onGridMenuClick(menuItemIdx);}
                    //var menu = menuItems[parseInt(menuChoice, 10)];
                    //this.onGridMenuClick({menu: menu});
                }
                return;
            };

            return true;
        }

        return false;
    },

    handleGridMenuClick: function (menuChoice) {
        //will be overridden in handleGridMenuInit;
    },

    handleGridKeyPress: function (key) {
        this.onGridKeyPress({ key: key });
    },

    handleGridDragEnter: function (a, b) {
        this.onGridDragEnter({ a: a, b: b });
    },

    handleGridDragDrop: function (a, b) {
        this.onGridDragDrop({ a: a, b: b });
    },

    handleGridDragStart: function (a, b) {
        this.onGridDragStart({ a: a, b: b });
    },

    //----default handlers (standardized on eArg) -- will get overridden by actual handlers -----------
    onToolbarClick: function (eArg) { return; },
    onToolbarChange: function (eArg) { return; },
    onGridClick: function (eArg) { return; },
    onGridDoubleClick: function (eArg) { return; },
    onGridLinkClick: function (eArg) { return; },
    onGridMenuInit: function (eArg) { return true; },
    onGridMenuClick: function (eArg) { (eArg.menu.handler.execute ? eArg.menu.handler.execute() : eArg.menu.handler()); return; },
    onBeginEditCell: function (eArg) { return false; },
    onCellInputHelper: function (eArg) { return false; },
    onEndEditCell: function (eArg) { return false; },
    onGridKeyPress: function (eArg) { return true; },
    onGridDragEnter: function (eArg) { return true; },
    onGridDragDrop: function (eArg) { return true; },
    onGridDragStart: function (eArg) { return true; },
    onGridOpenNode: function (eArg) { return; },
    onGridCloseNode: function (eArg) { return; },

	//--- API
	/// <summary>
	///
	/// <summary>
	initialize: function () {
		//load grid and toolbar was success
	},

	//--- API
	/// <summary>
	///
	/// </summary>
	loadFlatGridAndToolbarIntoHtmlBody: function () {
		this.loadGridAndToolbarControlIntoHtmlBody_ex(false);
	},

	//--- API
	/// <summary>
	///
	/// </summary>
	loadTreeGridAndToolbarIntoHtmlBody: function () {
		this.loadGridAndToolbarControlIntoHtmlBody_ex(true);
	},
    //--- not API
    loadGridAndToolbarControlIntoHtmlBody_ex: function (isTreeGrid) {
		fn_initDefaultIcons(this);
		
		this.isTreeGrid = isTreeGrid;
        var htmlText = '<table id="main_table" style="overflow:hidden; width: 100%; height: 100%; position: absolute; top: 0px; left: 0px;" cellspacing="0" cellpadding="0">' +
							'<tr style="vertical-align: top;">' +
								'<td id="toolbar_td" style="height: 28px;"></td>' +
							'</tr>' +
							'<tr style="vertical-align: top;">' +
								'<td id="gridTD" style="height: 100%;"></td>' +
								'<div id="loadingInProgress" style="top: 31px; width: 100%; height: 100%; position: absolute; padding-top: 20px; z-index: 100; background-color: #ffffff;">' +
									'<center><b>Loading...<img src="../images/Progress.gif" /></b></center>' +
								'</div>' +
							'</tr>' +
						'</table>',
			docElement = document.documentElement,
			mainDiv = document.createElement('div'),
			mainTable,
			toolbar,
			grid;
        mainDiv.setAttribute('style', 'position:absolute; width:100%; height:100%; overflow:hidden;');
        mainDiv.innerHTML = htmlText;
        document.body.appendChild(mainDiv);
        mainTable = document.getElementById('main_table');
        top.aras.browserHelper.adjustGridSize(window, function () {
            mainTable.style.height = (docElement.clientHeight - 30) + 'px';
        }, false);

		if (this.arasUseOldDojoPath ) { // backward compatibility
			dojo.require('Aras.Client.Controls.ToolBar');

			if (isTreeGrid) {dojo.require('Aras.Client.Controls.TreeGridContainer');}
			else {dojo.require('Aras.Client.Controls.GridContainer');}

			dojo.require('dojo.aspect');

			toolbar = new Aras.Client.Controls.ToolBar({ ImageBase: '../cbin/' });
			document.getElementById('toolbar_td').appendChild(toolbar.domNode);
			dojo.connect(toolbar, 'onClick', this, 'handleToolbarOnClick');
			dojo.connect(toolbar, 'onChange', this, 'handleToolbarOnChange');
			dojo.connect(toolbar, 'toolbarKeyPress', this, 'handleToolbarKeyPress');
			toolbar.startup();
			this.toolbar = toolbar;

			if (isTreeGrid) {
				grid = new Aras.Client.Controls.TreeGridContainer({ connectId:"gridTD", canEdit: function (){return true;} });
			}
			else {
				grid = new Aras.Client.Controls.GridContainer({ connectId:"gridTD", canEdit: function (){return true;} });
			}
		}
		else {
			dojo.require('Aras.Client.Controls.Public.ToolBar');
			if (isTreeGrid) {dojo.require('Aras.Client.Controls.Public.TreeGridContainer');}
			else {dojo.require('Aras.Client.Controls.Public.GridContainer');}
			dojo.require('dojo.aspect');

			toolbar = new Aras.Client.Controls.Public.ToolBar({ connectId: "toolbar_td", ImageBase: '../cbin/' });
			dojo.connect(toolbar, 'onClick', this, 'handleToolbarOnClick');
			dojo.connect(toolbar, 'onChange', this, 'handleToolbarOnChange');
			this.toolbar = toolbar;

			if (isTreeGrid) {
				grid = new Aras.Client.Controls.Public.TreeGridContainer({ connectId:"gridTD", canEdit: function (){return true;} });
			}
			else {
				grid = new Aras.Client.Controls.Public.GridContainer({ connectId:"gridTD", canEdit: function (){return true;} });
			}
		}
		dojo.connect(grid, 'gridClick', this, 'handleGridClick');
		dojo.connect(grid, 'gridDoubleClick', this, 'handleGridDoubleClick');
		dojo.connect(grid, 'gridLinkClick', this, 'handleGridLinkClick');
		dojo.connect(grid, 'gridMenuInit', this, 'handleGridMenuInit');
		dojo.connect(grid, 'gridMenuClick', this, 'handleGridMenuClick');
		dojo.connect(grid, 'onStartEdit_Experimental', this, function (rowId, field, value) {
			//##old## var columnIndex = this.grid.columns.get(field, 'index');
			var columnIndex = this.grid.columns_Experimental.get(field, 'index');
			return this.onBeginEditCell({ rowId: rowId, column: columnIndex, field: field});
		});
		dojo.connect(grid, 'onApplyEdit_Experimental', this, function (rowId, field, value) {
			//##old## var columnIndex = this.grid.columns.get(field, 'index');
			var columnIndex = this.grid.columns_Experimental.get(field, 'index');
			return this.onEndEditCell({ rowId: rowId, column: columnIndex, field: field, value: value});
		});
		dojo.connect(grid, 'gridKeyPress', this, 'handleGridKeyPress');
		if (isTreeGrid) {
			dojo.connect(grid, 'onToggleRow_Experimental', this, function (itemId, state) {
				//alert(itemId + " - "+state);
				if (state) {return this.onGridOpenNode({ rowId: itemId, state: state});}
				else {return this.onGridCloseNode({ rowId: itemId, state: state});}
			});
		}

		this.grid = grid;

		this.ready = true;
		this.initialize();
    },
    //--- API
	/// <summary>
	///
	/// <summary>
    loadToolbarIntoHtmlElement: function (toolbarElementId) {
		return this.loadToolbarControlIntoHtmlElement_ex(toolbarElementId);
    },
    //--- not API
    loadToolbarControlIntoHtmlElement_ex: function (toolbarElementId) {
        var toolbar;
		if (this.arasUseOldDojoPath ) { // backward compatibility
			dojo.require('Aras.Client.Controls.ToolBar');
			dojo.require('dojo.aspect');

			toolbar = new Aras.Client.Controls.ToolBar({ connectId: toolbarElementId, ImageBase: '../cbin/' });
			dojo.connect(toolbar, 'onClick', this, 'handleToolbarOnClick');
			dojo.connect(toolbar, 'onChange', this, 'handleToolbarOnChange');
			dojo.connect(toolbar, 'toolbarKeyPress', this, 'handleToolbarKeyPress');
		}
		else {
			dojo.require('Aras.Client.Controls.Public.ToolBar');
			dojo.require('dojo.aspect');

			toolbar = new Aras.Client.Controls.Public.ToolBar({ connectId: toolbarElementId, ImageBase: '../cbin/' });
			dojo.connect(toolbar, 'onClick', this, 'handleToolbarOnClick');
			dojo.connect(toolbar, 'onChange', this, 'handleToolbarOnChange');
		}
        return toolbar;
    },

    //--- API for barckward compatibility
    loadHTML_DojoTreeGridIntoElement: function (gridElementId) {
		return this.loadTreeGridIntoHtmlElement(gridElementId);
    },
    //--- API
	/// <summary>
	///
	/// </summary>
	loadFlatGridIntoHtmlElement: function (gridElementId) {
		return this.loadGridControlIntoHtmlElement_ex(gridElementId, false);
    },
    //--- API
	/// <summary>
	///
	/// </summary>
	loadTreeGridIntoHtmlElement: function (gridElementId) {
		return this.loadGridControlIntoHtmlElement_ex(gridElementId, true);
    },
    //--- not API
	loadGridControlIntoHtmlElement_ex: function (gridElementId, isTreeGrid) {
		fn_initDefaultIcons(this);
		
		this.isTreeGrid = isTreeGrid;
        var grid;
		if (this.arasUseOldDojoPath ) { // backward compatibility
			if (isTreeGrid) {dojo.require('Aras.Client.Controls.TreeGridContainer');}
			else {dojo.require('Aras.Client.Controls.GridContainer');}
			dojo.require('dojo._base.connect');
			dojo.require('dojo.aspect');

			if (isTreeGrid) {
				grid = new Aras.Client.Controls.TreeGridContainer({	connectId: gridElementId, canEdit: function (){return true;} });
			}
			else {
				grid = new Aras.Client.Controls.GridContainer({ connectId: gridElementId, canEdit: function (){return true;} });
			}
		}
		else {
			if (isTreeGrid) {dojo.require('Aras.Client.Controls.Public.TreeGridContainer');}
			else {dojo.require('Aras.Client.Controls.Public.GridContainer');}
			dojo.require('dojo._base.connect');
			dojo.require('dojo.aspect');

			if (isTreeGrid) {
				grid = new Aras.Client.Controls.Public.TreeGridContainer({ connectId: gridElementId, canEdit: function (){return true;} });
			}
			else {
				grid = new Aras.Client.Controls.Public.GridContainer({ connectId: gridElementId, canEdit: function (){return true;} });
			}
		}
        dojo.connect(grid, 'gridClick', this, 'handleGridClick');
        dojo.connect(grid, 'gridDoubleClick', this, 'handleGridDoubleClick');
        dojo.connect(grid, 'gridLinkClick', this, 'handleGridLinkClick');
        dojo.connect(grid, 'gridMenuInit', this, 'handleGridMenuInit');
        dojo.connect(grid, 'gridMenuClick', this, 'handleGridMenuClick');
		dojo.connect(grid, 'onStartEdit_Experimental', this, function (rowId, field, value) {
			//##old## var columnIndex = this.grid.columns.get(field, 'index');
			var columnIndex = this.grid.columns_Experimental.get(field, 'index');
			return this.onBeginEditCell({ rowId: rowId, column: columnIndex, field: field});
		});
        dojo.connect(grid, 'onApplyEdit_Experimental', this, function (rowId, field, value) {
			//##old## var columnIndex = this.grid.columns.get(field, 'index');
			var columnIndex = this.grid.columns_Experimental.get(field, 'index');
			return this.onEndEditCell({ rowId: rowId, column: columnIndex, field: field, value: value});

        });
		dojo.connect(grid, 'onInputHelperShow_Experimental', this, function (rowId, columnIndex) {
			return this.onCellInputHelper({ rowId: rowId, column: columnIndex});
		});
        dojo.connect(grid, 'gridKeyPress', this, 'handleGridKeyPress');
		if (isTreeGrid) {
			dojo.connect(grid, 'onToggleRow_Experimental', this, function (itemId, state) {
				//alert(itemId + " - "+state);
				if (state) {return this.onGridOpenNode({ rowId: itemId, state: state});}
				else {return this.onGridCloseNode({ rowId: itemId, state: state});}
			});
		}

        return grid;
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    getColumnLabelByName: function (typeName, propName) {
        var itemType = top.aras.getItemTypeForClient(typeName, "name");
        var propItem = itemType.getItemsByXPath("Relationships/Item[@type='Property' and name='" + propName + "']").node;
        return top.aras.getItemProperty(propItem, 'label');
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    setToolbarItemEnable: function (ctrlName, bool) {
        var toolbar = this.toolbar.getActiveToolbar();
        bool = (bool === undefined) ? true : !!bool;
        try {
            var tbi = toolbar.getElement(ctrlName);
            if (tbi) {
                tbi.setEnabled(bool);
            }
        } catch (excep) {
            top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.utils_exception_toolbar_item_enable").format(ctrlName));
        }
    },
    //--- API
    getProperty: function (node, element) {
        //this function is used instead of top.aras.getItemProperty because of performance reasons
        var value = "";
        if (node) {
            var tempNode = node.selectSingleNode(element);
            if (tempNode) {
                value = tempNode.text;
            }
        }
        return value;
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    expandAll: function (bool) {
        this.grid.setPaintEnabled(false);
        if (bool) {
            this.grid.expandAll();
        } else {
            this.grid.collapseAll();
        }
        this.grid.setPaintEnabled(true);
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    setLink: function (row_id, col, linkInfo, propName, propValue) {
        this.grid.SetCellTextColor(row_id, col, "#0000FF");
        // propname/Value extend the linkinfo - must be concatenated with '+'
        this.grid.SetCellLink(row_id, col, row_id + "~" + col + "~" + linkInfo + "+" + propName + "+" + propValue);
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    GetGridState: function () {
        return {
            expanded: this.grid.getOpenedItems(";").split(";"),
            selected: this.grid.getSelectedItemIDs(";").split(";")
        };
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    SetGridState: function (gridState) {
        var l = gridState.expanded.length;
        for (var i = 0; i < l; i++) {
            if (gridState.expanded[i]) {
                this.grid.openItem(gridState.expanded[i]);
            }
        }

        l = gridState.selected.length;
        for (i = 0; i < l; i++) {
            if (gridState.selected[i]) {
                this.grid.setSelectedRow(gridState.selected[i], true, true);
            }
        }
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    gridSetCellValue: function (rowId, col, value) {
//		if (this.grid.SetCellValue_Experimental) {return this.grid.SetCellValue_Experimental(rowId, col, value);}
        this.grid.cells(rowId, col).setValue(value);
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    gridSetCellBgColor: function (rowId, col, BgColor) {
		if (BgColor && BgColor !== undefined) {
            var gridCell = this.grid.cells(rowId, col);
			//if (this.isTreeGrid) {gridCell.setBgColor(BgColor);}
			//else {gridCell.SetBgColor_Experimental(BgColor);}
			//#TODO - replace _Experimental call# else {gridCell.SetBgColor(BgColor);}
			gridCell.SetBgColor_Experimental(BgColor);
		}
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    gridGetCellValue: function (rowId, col) {
//		if (this.grid.GetCellValue_Experimental) {return this.grid.GetCellValue_Experimental(rowId, col);}
		return this.grid.cells(rowId, col).getValue();
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    clearGridRowUserData: function (rowId) {
        if (rowId && rowId !== undefined) { this.gridRowUserData[rowId] = {}; return; }
        this.gridRowUserData = {};
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    setGridRowUserData: function (rowId, dataName, dataValue) {
        if (!rowId || rowId === "") { return; }
        var rowUserData = this.gridRowUserData[rowId];
        if (!rowUserData || rowUserData === undefined) { this.gridRowUserData[rowId] = {}; }
        this.gridRowUserData[rowId][dataName] = dataValue;
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    getGridRowUserData: function (rowId, dataName) {
        if (!rowId || rowId === "") { return; }
        if (!dataName || dataName === "") { return; }
        return this.gridRowUserData[rowId][dataName];
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    deleteGridRowUserData: function (rowId) {
        if (!rowId || rowId === "") { return; }
        delete this.gridRowUserData[rowId];
		return;
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    gridRowExists: function (rowId) {
        return (rowId in this.gridRowUserData);
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    getInputRowVals: function () {
        this.inputRowTdVals = new Array(); // set in context variable
        for (var i = 0; i < this.numberOfGridColumns; i++) {
            var cellVal = this.grid.cells("input_row", i).getValue();
            if (!cellVal) { cellVal = ""; }
            this.inputRowTdVals.push(cellVal);
        }
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    setInputRowVals: function () {
        if (!this.inputRowTdVals) { return; }
        for (var i = 0; i < this.inputRowTdVals.length; i++) {
            var elem = this.inputRowTdVals[i];
            var cell = this.grid.cells("input_row", elem.colId);
            cell.setValue(elem.val);
        }
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    clearInputRowVals: function () {
        if (!this.inputRowTdVals) { return; }
        for (var i = 0; i < this.inputRowTdVals.length; i++) {
            var elem = this.inputRowTdVals[i];
            var cell = this.grid.cells("input_row", elem.colId);
            cell.setValue("");
        }
    },
	
	/// <grid_toolbar_api>  expects this context to have toobar control connected in "this.toolbar"
    //--- API
	/// <summary>
	///
	/// </summary>
    setChoiceSelectionOnToolbar: function (choiceId, choiceValue) {
        fn_setToolbarElementChoice(this.toolbar, choiceId, choiceValue); // a change triggeres a refresh
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    getChoiceSelectionFromToolbar: function (choiceId) {
        return fn_getToolbarElementChoice(this.toolbar, choiceId);
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    setTextOnToolbarItem: function (tbItemId, textValue) {
    //    this.ignoreToolbarChangeEvent = ignoreToolbarChangeEvent; // grid's refresh logic can ignore refresh
        fn_setToolbarElementText(this.toolbar, tbItemId, textValue);
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    getTextFromToolbarItem: function (tbItemId) {
        fn_getToolbarElementText(this.toolbar, tbItemId);
    },
	
	/// <grid_context_menu_api>
	//--- API
	initMenuActionArgs: function (eActionArgs, selectedRowId, isStartedFromTab, effectivityMode) {
		if (selectedRowId && selectedRowId !== undefined) {
			eActionArgs.rowId = selectedRowId;
			eActionArgs.rowItemType = this.getGridRowUserData(selectedRowId,"rowItemType");
			eActionArgs.rowItemId = this.getGridRowUserData(selectedRowId,"rowItemID");
			eActionArgs.rowOfGroupName = this.getGridRowUserData(selectedRowId,"rowOfGroupName");
			eActionArgs.isPhantomRow = (this.getGridRowUserData(selectedRowId,"isPhantomRow") === "1");	
		}
		eActionArgs.gridHandler = this;
		eActionArgs.gridIsEditable = this.gridIsEditable;
		eActionArgs.userIsOwnerOfContextItem = this.currentUserIsOwnerOfTopItem;
		eActionArgs.isStartedFromTab = isStartedFromTab;
		eActionArgs.effectivityMode =  effectivityMode;
	},
	
	/// <flat_grid_api>
    //--- API
	/// <summary>
	///
	/// </summary>
    DrawFlatGridRow: function (itemNode, rowConfig, rowId, rowIcon ) {
        var itemNodeType = itemNode.getType();
        var itemID = itemNode.getID();

		//rowIcon and rowId are optional.
		//if used they will override calculated values
		var icon;
		if (rowIcon && rowIcon !== "") {
			icon = rowIcon;
		}
		else {
		if (rowConfig.rowIcon && rowConfig.rowIcon !== undefined && rowConfig.rowIcon !== "{rowItemType}") { // use icon configured in xml file
            icon = rowConfig.rowIcon;
        }
        else { //get small icon of item type
            if (!this.icons[itemNodeType] || this.icons[itemNodeType] === undefined) {
                this.icons[itemNodeType] = fn_GetSmallIconFormatOfItemType(itemNodeType);
                icon = this.icons[itemNodeType];
            }
            else {
                icon = this.icons[itemNodeType];
            }
        }
		}
		var data = { itemNode: itemNode, relationshipNode: null, parentRowId: null, rowIcon: icon};
		if (!rowConfig.columnMapping)
			{top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.utils_flat_grid_api_missing_columnmapping")); return;}
        var row = new RowClass(this, data, this.gridVisibleColumns, rowConfig.columnMapping);

		var newRowID;
		if (rowId && rowId !== "") {newRowID = rowId;}
		else {newRowID = itemNode.getProperty("config_id", "");}
		
		if (this.gridRowExists(newRowID)) {return newRowID;}
        this.grid.addRow(newRowID, row.getValues());
        row.bind(newRowID, rowConfig.rowBgColor, itemNodeType, itemID);

		return newRowID;
    },

	/// <tree_grid_api>
    //--- API
	/// <summary>
	///
	/// </summary>
    DrawPlainStructureRootRow: function (gridStructureRelShipName, itemNode, rowConfig) {
		//debugger;
        return this.DrawStructureRow_ex(gridStructureRelShipName, itemNode, null, null, null, rowConfig, false);
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    DrawStructureRootRow: function (gridStructureRelShipName, itemNode, rowConfig) {
		//debugger;
        return this.DrawStructureRow_ex(gridStructureRelShipName, itemNode, null, null, null, rowConfig, true);
    },
	
    //--- API
	/// <summary>
	///
	/// </summary>
    DrawPlainStructureChildRow: function (gridStructureRelShipName, itemNode, relationshipNode, parentItemConfigId, parentRowId, rowConfig) {
		return this.DrawStructureRow_ex (gridStructureRelShipName, itemNode, relationshipNode, parentItemConfigId, parentRowId, rowConfig, false);
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    DrawStructureRow: function (gridStructureRelShipName, itemNode, relationshipNode, parentItemConfigId, parentRowId, rowConfig) {
		return this.DrawStructureRow_ex (gridStructureRelShipName, itemNode, relationshipNode, parentItemConfigId, parentRowId, rowConfig, true);
    },
	//--- NO API
    DrawStructureRow_ex: function (gridStructureRelShipName, itemNode, relationshipNode, parentItemConfigId, parentRowId, rowConfig, addRelatinonshipRows) {

		var data = { itemNode: itemNode, relationshipNode: relationshipNode, parentRowId: parentRowId };
        var thisColumMapping;
        if (rowConfig.columnMapping) { thisColumMapping = rowConfig.columnMapping; }
        else { thisColumMapping = this.relShipColumnMappings[gridStructureRelShipName]; }
        var row = new RowClass(this, data, this.gridVisibleColumns, thisColumMapping);

        var itemID = itemNode.getID();
		//conditional debugging --> if (itemID === "CD0F627D5ACA4425963B32232E6141D8") {debugger;}

        var parentItemID = null;
        if (relationshipNode) { parentItemID = relationshipNode.getProperty("source_id"); }
        var itemConfigID = itemNode.getProperty("config_id", "");
        var itemNodeType = itemNode.getType();

        var icon;
        if (rowConfig.rowIcon && rowConfig.rowIcon !== undefined && rowConfig.rowIcon !== "{rowItemType}") { // use icon configured in xml file
            icon = rowConfig.rowIcon;
        }
        else { //get small icon of item type
			var iconItemType = itemNodeType;
            if (!this.icons[iconItemType] || this.icons[iconItemType] === undefined) {
                this.icons[iconItemType] = fn_GetSmallIconFormatOfItemType(iconItemType);
                icon = this.icons[iconItemType];
            }
            else {
                icon = this.icons[iconItemType];
            }
        }
        var iconOpen = icon;

        var newRowID;
        if (parentRowId) {
			if (parentItemConfigId === undefined || parentItemConfigId == null) {parentItemConfigId = "ROOT";}
			if (this.disallowDuplicateStructureItems) {
				newRowID = parentItemConfigId + "-" + itemConfigID;
			}
			else {
				newRowID = relationshipNode.getProperty("config_id", "") + "-" + itemConfigID;
			}
		}
        else { newRowID = "ROOT-" + itemConfigID; }

		if (!this.gridRowExists(newRowID)) {
			if (!parentRowId) {
				this.grid.insertRoot(newRowID, row.getValues(), newRowID, icon, iconOpen);
			} else {
				this.grid.insertNewChild(parentRowId, newRowID, row.getValues(), newRowID, icon, iconOpen);
			}
			row.bind(newRowID, rowConfig.rowBgColor, itemNodeType, itemID);
			this.setGridRowUserData(newRowID, "rowItemConfigId", itemConfigID);
			this.setGridRowUserData(newRowID, "rowRelationshipType", gridStructureRelShipName);
			this.setGridRowUserData(newRowID, "rowOfGroupName", gridStructureRelShipName);
		}
		// add other relationship items as children
		if (addRelatinonshipRows)
			{this.DrawStructureRowRelationshipsGroups(gridStructureRelShipName, parentItemID, parentItemConfigId, itemNode, newRowID, rowConfig);}
        return newRowID;
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    DrawStructureRowChildren: function (gridStructureRelShipName, parentItem, parentItemConfigId, parent_row_id, parents, rowConfig, levelsToDraw, reloadIcon) {
		if (levelsToDraw === undefined) {levelsToDraw = null;}
		if (reloadIcon === undefined) {reloadIcon = null;}
		if (parentItemConfigId === undefined || parentItemConfigId == null) {parentItemConfigId = "ROOT";}
		
        parents[parentItemConfigId] = true;
		// conditional debugging; if (Object.keys(parents).length == 1) {debugger;}
		
        var structRels = parentItem.getRelationships(gridStructureRelShipName);
        for (var i = 0; i < structRels.getItemCount() ; i++) {
            var structRel = structRels.getItemByIndex(i);
            var childItem = structRel.getRelatedItem();
			if (childItem) {
				if (childItem.getAttribute("typeId", "") === "") { // re-used item - get item details from first use
					childItem = this.FindItemInGridData(parentItem.getType(), childItem.getID());
				}
				if (childItem && childItem.node) { // single item
					var childItemConfigId = childItem.getProperty("config_id", "");
					var rowID = this.DrawStructureRow(gridStructureRelShipName, childItem, structRel, parentItemConfigId, parent_row_id, rowConfig);
					
					if (levelsToDraw !== null && reloadIcon !== null) {
						if (Object.keys(parents).length >= levelsToDraw) {
							this.grid.setRowIcons(rowID, reloadIcon, reloadIcon);
							this.setGridRowUserData(rowID, "reloadNextLevels", "1");
						}
					}
					
					if (parents[childItemConfigId] !== true) {
						this.DrawStructureRowChildren(gridStructureRelShipName, childItem, childItemConfigId, rowID, parents, rowConfig, levelsToDraw, reloadIcon);
					}
				}
			}
        }
        delete parents[parentItemConfigId];
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    SetGridDataItems: function (resultItem) {
		this.gridDataItems = resultItem;
	},
    //--- API
	/// <summary>
	///
	/// </summary>
	GetGridDataItems: function () {
		return this.gridDataItems;
	},
    //--- API
	/// <summary>
	///
	/// </summary>
	FindItemInGridData: function (typeName, itemId) {
		if (this.gridDataItems) {return this.gridDataItems.getItemsByXPath("//Item[@type='"+typeName+"' and id='"+itemId+"']");}
		return null;
	},
    //--- API
	/// <summary>
	///
	/// </summary>
    UpdateStructureRowValues: function (gridStructureRelShipName, rowId, itemNode, relationshipNode) {
        // row must exist
        if (!this.gridRowExists(rowId)) { return; }

        var data = { itemNode: itemNode, relationshipNode: relationshipNode };
        var row = new RowClass(this, data, this.gridVisibleColumns, this.relShipColumnMappings[gridStructureRelShipName]);
        var rowCellVals = row.getValues().split("|");

        for (var i = 0; i < rowCellVals.length; i++) {
            this.gridSetCellValue(rowId, i, rowCellVals[i]);
        }
    },
    //#API change --> relName is relQueryName
    //	DrawStructureRowSingleRelationshipRow: function (gridStructureRelShipName, relName, relshipNode, relItemNode, parentRowId, parentItemConfigId) {
    //--- API
    DrawStructureRowSingleRelationshipRow: function (gridStructureRelShipName, relQueryName, relshipNode, relItemNode, parentRowId, parentItemConfigId, insertGroupingRow) {
		if (parentItemConfigId === undefined || parentItemConfigId == null) {parentItemConfigId = "ROOT";}
		if (!insertGroupingRow || insertGroupingRow === undefined) {insertGroupingRow=false;}
		var groupOrParentId = parentRowId;

        var structItemRelShipConfig = {};
        structItemRelShipConfig.relQueryName = relQueryName;
        structItemRelShipConfig.relName = this.structureRowRelDefinitions[relQueryName].relationshipName; //relshipNode.getType();
        structItemRelShipConfig.rowIcon = this.structureRowRelDefinitions[relQueryName].rowIcon;
        structItemRelShipConfig.rowBgColor = this.structureRowRelDefinitions[relQueryName].rowBgColor;
		structItemRelShipConfig.disallowDuplicateItems = this.structureRowRelDefinitions[relQueryName].disallowDuplicateItems;

		// if no groupName defined, do not add phantom (grouping) row
		if (structItemRelShipConfig.groupName === "") {
			structItemRelShipConfig.groupRowId = "";
			insertGroupingRow = false;
		}
		
		if (insertGroupingRow) {
			structItemRelShipConfig.groupName = this.structureRowRelDefinitions[relQueryName].groupName;
			structItemRelShipConfig.groupLabel = this.structureRowRelDefinitions[relQueryName].groupLabel;
			structItemRelShipConfig.groupIcon = this.structureRowRelDefinitions[relQueryName].groupIcon;
			structItemRelShipConfig.groupRowBgColor = this.structureRowRelDefinitions[relQueryName].groupRowBgColor;

			// add phantom grid row - in case it does not exist
			structItemRelShipConfig.groupRowId = this.DrawGroupRowAsChild(gridStructureRelShipName, parentRowId, structItemRelShipConfig);
			groupOrParentId = structItemRelShipConfig.groupRowId;
		}

		rowItemConfigId = relItemNode.getProperty("config_id", "");
        var newRowID = parentItemConfigId + "-" + rowItemConfigId;
        var relItemType = relItemNode.getType();

        if (!this.gridRowExists(newRowID)) {
            var icon;
			var isRowItemIconDefined = false;
			var iconItemType = relItemType;
            if (structItemRelShipConfig.rowIcon && structItemRelShipConfig.rowIcon !== undefined && structItemRelShipConfig.rowIcon !== "{rowItemType}") { // use icon configured 
				if (structItemRelShipConfig.rowIcon.indexOf("useTypeOfRelProperty:") >= 0 ) {
					// {XXX}
					var itemTypeProp = structItemRelShipConfig.rowIcon.split(":")[1];
					itemTypeProp = itemTypeProp.replace(/}/g,"");
					itemTypeProp = itemTypeProp.replace(/ /g,"");
					iconItemType = relshipNode.getProperty(itemTypeProp, "");
				}
				else {
					icon = structItemRelShipConfig.rowIcon;
					isRowItemIconDefined = true;
				}
            }
			if (!isRowItemIconDefined) {  //get small icon of item type
                if (!this.icons[iconItemType] || this.icons[iconItemType] === undefined) {
                    this.icons[iconItemType] = fn_GetSmallIconFormatOfItemType(iconItemType);
                    icon = this.icons[iconItemType];
                }
                else {
                    icon = this.icons[iconItemType];
                }
            }
            var data = { itemNode: relItemNode, relationshipNode: relshipNode, parentRowId: parentRowId };
            var row = new RowClass(this, data, this.gridVisibleColumns, this.relShipColumnMappings[structItemRelShipConfig.relQueryName]);
            this.grid.insertNewChild(groupOrParentId, newRowID, row.getValues(), newRowID, icon, icon);
            row.bind(newRowID, structItemRelShipConfig.rowBgColor, relItemType, relItemNode.getID());
            this.setGridRowUserData(newRowID, "rowItemConfigId", rowItemConfigId);
            if (relshipNode) {this.setGridRowUserData(newRowID, "rowRelationshipType", relshipNode.getType());}
            this.setGridRowUserData(newRowID, "rowOfGroupName", relQueryName);

            // expand rows to see new rows
            this.grid.openItem(parentRowId);
            if (insertGroupingRow) {this.grid.openItem(structItemRelShipConfig.groupRowId);}
        }
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    DrawStructureRowRelationshipsGroups: function (gridStructureRelShipName, parentItemID, parentItemConfigId, dataItem, newRowID, rowConfig) {
        if (this.showStructureOnly) { return; }

        var phantomRowGroupIds = [];
        var structItemRelShipConfig = {};
        var groupName, relQueryName;

        for (relQueryName in this.structureRowRelDefinitions) {
            if (!phantomRowGroupIds[relQueryName] || phantomRowGroupIds[relQueryName] === undefined)
            { phantomRowGroupIds[relQueryName] = { rowId: "" }; }

            groupName = this.structureRowRelDefinitions[relQueryName].groupName;
            if (this.showRelShipsFilter && this.showRelShipsFilter !== undefined && (this.showRelShipsFilter.indexOf(groupName) >= 0 || this.showRelShipsFilter === "ALL")) {
			
				structItemRelShipConfig.updateDiffColumnsCallback = rowConfig.updateDiffColumnsCallback;			
                structItemRelShipConfig.relQueryName = relQueryName;
                structItemRelShipConfig.relName = this.structureRowRelDefinitions[relQueryName].relationshipName;
                structItemRelShipConfig.groupRowId = phantomRowGroupIds[relQueryName].rowId;
                structItemRelShipConfig.groupName = groupName;
                structItemRelShipConfig.groupLabel = this.structureRowRelDefinitions[relQueryName].groupLabel;
                structItemRelShipConfig.groupIcon = this.structureRowRelDefinitions[relQueryName].groupIcon;
                structItemRelShipConfig.rowIcon = this.structureRowRelDefinitions[relQueryName].rowIcon;
                structItemRelShipConfig.groupRowBgColor = this.structureRowRelDefinitions[relQueryName].groupRowBgColor;
                structItemRelShipConfig.rowBgColor = this.structureRowRelDefinitions[relQueryName].rowBgColor;
				structItemRelShipConfig.disallowDuplicateItems = this.structureRowRelDefinitions[relQueryName].disallowDuplicateItems;
                structItemRelShipConfig.isReverseQuery = false;
                structItemRelShipConfig.relatedItemReleasedCondition = "";
                structItemRelShipConfig.relatedItemCondition = "";
				structItemRelShipConfig.isApplyChildBgColorUpToRoot = rowConfig.isApplyChildBgColorUpToRoot;
				structItemRelShipConfig.bgColorOfStructItemWithChildren = rowConfig.bgColorOfStructItemWithChildren;
				structItemRelShipConfig.doNotColorRootRows = rowConfig.doNotColorRootRows;
				
                if (this.structureRowRelDefinitions[relQueryName].isReverseQuery) {
                    structItemRelShipConfig.isReverseQuery = this.structureRowRelDefinitions[relQueryName].isReverseQuery;
                    structItemRelShipConfig.relatedItemProperty = this.structureRowRelDefinitions[relQueryName].relatedItemProperty;
                    structItemRelShipConfig.relatedItemType = this.structureRowRelDefinitions[relQueryName].relatedItemType;
                    structItemRelShipConfig.relationshipSelectProperties = this.structureRowRelDefinitions[relQueryName].relationshipSelectProperties;
                    structItemRelShipConfig.relatedItemSelectProperties = this.structureRowRelDefinitions[relQueryName].relatedItemSelectProperties;
                    structItemRelShipConfig.relatedItemReleasedCondition = this.structureRowRelDefinitions[relQueryName].relatedItemReleasedCondition;
                    structItemRelShipConfig.relatedItemCondition = this.structureRowRelDefinitions[relQueryName].relatedItemCondition;
                }

                this.DrawStructureRowRelationshipsGroupRows(gridStructureRelShipName, parentItemID, parentItemConfigId, dataItem, newRowID, structItemRelShipConfig);
            }
        }
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    DrawGroupRowAsChild: function (gridStructureRelShipName, parentNodeId, structItemRelShipConfig) {
        var groupNodeRowId = parentNodeId + "-" + structItemRelShipConfig.groupName;
        if (this.gridRowExists(groupNodeRowId)) { return groupNodeRowId; }

        // add grouping phantom row
        var vals = [];
        vals[0] = structItemRelShipConfig.groupLabel;
        for (var v = 1; v < this.numberOfGridColumns; v++) { vals[v] = ""; }
        var gridRow = vals.join("|");
        this.grid.insertNewChild(parentNodeId, groupNodeRowId, gridRow, groupNodeRowId, structItemRelShipConfig.groupIcon, structItemRelShipConfig.groupIcon);
        this.setGridRowUserData(groupNodeRowId, "rowItemType", structItemRelShipConfig.groupName);
        this.setGridRowUserData(groupNodeRowId, "isPhantomRow", "1");

        // bg color of group row
        if (structItemRelShipConfig.groupRowBgColor && structItemRelShipConfig.groupRowBgColor !== "") { this.setBackgroundColorOfRow(groupNodeRowId, structItemRelShipConfig.groupRowBgColor); }

        return groupNodeRowId;
    },
    //--- API
	/// <summary>
	///
	/// </summary>
    DrawStructureRowRelationshipsGroupRows: function (gridStructureRelShipName, parentItemID, parentItemConfigId, dataItem, parentRowId, structItemRelShipConfig) {
		if (parentItemConfigId === undefined || parentItemConfigId == null) {parentItemConfigId = "ROOT";}
        var relItems, relItem;
		
		var doUpdateDiff = (structItemRelShipConfig.updateDiffColumnsCallback && structItemRelShipConfig.updateDiffColumnsCallback !== undefined);

        if (structItemRelShipConfig.isReverseQuery === true) {
            // build and run reverse Query
            var relShipItem = top.aras.newIOMItem(structItemRelShipConfig.relName, "get");
			if (structItemRelShipConfig.relationshipSelectProperties.indexOf(structItemRelShipConfig.relatedItemProperty) < 0)
				{relShipItem.setAttribute("select", structItemRelShipConfig.relationshipSelectProperties+","+structItemRelShipConfig.relatedItemProperty);}
			else {relShipItem.setAttribute("select", structItemRelShipConfig.relationshipSelectProperties);}

            relShipItem.setProperty("related_id", dataItem.getID());  //## for reverse query  - disconnected queries are different !!!!

            relItem = top.aras.newIOMItem(structItemRelShipConfig.relatedItemType, "get");
            relItem.setAttribute("select", structItemRelShipConfig.relatedItemSelectProperties);
            if (this.isReleasedMode) {
                fn_setConditonOnItem(relItem, structItemRelShipConfig.relatedItemReleasedCondition);
            }
            else {
                relItem.setProperty("is_current", "1");
            }
            if (structItemRelShipConfig.relatedItemCondition && structItemRelShipConfig.relatedItemCondition !== "") {
                fn_setConditonOnItem(relItem, structItemRelShipConfig.relatedItemCondition);
            }
            if (parentItemID) {
                relItem.setProperty("id", parentItemID);
                relItem.setPropertyAttribute("id", "condition", "ne");
            }
            relShipItem.setPropertyItem(structItemRelShipConfig.relatedItemProperty, relItem);
			// load relationships from server (reverse)
            relItems = relShipItem.apply();
        }
        else {
			// get relationships from loaded data
            relItems = dataItem.getRelationships(structItemRelShipConfig.relName);
            structItemRelShipConfig.relatedItemProperty = "related_id";
        }

        var relCount = relItems.getItemCount();

		// if .groupName not set, do not add phantom grid row for grouping
		var groupOrParentRowId = "";
        if (structItemRelShipConfig.groupName !== "") {
			if (structItemRelShipConfig.groupRowId === "" && relCount > 0)
				{ structItemRelShipConfig.groupRowId = this.DrawGroupRowAsChild(gridStructureRelShipName, parentRowId, structItemRelShipConfig); }

			groupOrParentRowId = structItemRelShipConfig.groupRowId;
		}
		else {
			// do not add phantom row
			groupOrParentRowId = parentRowId;
		    structItemRelShipConfig.groupRowId = "";
		}
		
		if (relItems.getItemCount() <= 0) { return; } //no data
		if (this.showDebugAlerts) {alert("Draw rows of Relationship = "+structItemRelShipConfig.relName+ " relCount = "+relCount);}

		// determine the row's icon (if not set)
        var icon = null;
		var RowIconItemTypeProp = "";
		var isRowIconItemTypePropOnRel = false;
        if (structItemRelShipConfig.rowIcon && structItemRelShipConfig.rowIcon !== undefined && structItemRelShipConfig.rowIcon !== "{rowItemType}" && structItemRelShipConfig.rowIcon.indexOf("useTypeOfRelProperty:") < 0) { // always use configured icon
            icon = structItemRelShipConfig.rowIcon;
        }
		else {
			if (structItemRelShipConfig.rowIcon.indexOf("useTypeOfRelProperty:") >= 0 ) {
				// {XXX}
				RowIconItemTypeProp = structItemRelShipConfig.rowIcon.split(":")[1];
				RowIconItemTypeProp = RowIconItemTypeProp.replace(/}/g,"");
				RowIconItemTypeProp = RowIconItemTypeProp.replace(/ /g,"");
				isRowIconItemTypePropOnRel = true;
			}
		}
		
		// color code parent row (and group row), if has children
		if (!doUpdateDiff && structItemRelShipConfig.bgColorOfStructItemWithChildren && structItemRelShipConfig.bgColorOfStructItemWithChildren !== "") {
		  if (structItemRelShipConfig.groupRowId !== "") {
			this.setBackgroundColorOfRow_ex(structItemRelShipConfig.groupRowId, structItemRelShipConfig.bgColorOfStructItemWithChildren, true, structItemRelShipConfig.isApplyChildBgColorUpToRoot, structItemRelShipConfig.doNotColorRootRows, true);}
		  else {
			this.setBackgroundColorOfRow_ex(parentRowId, structItemRelShipConfig.bgColorOfStructItemWithChildren, true, structItemRelShipConfig.isApplyChildBgColorUpToRoot, structItemRelShipConfig.doNotColorRootRows, true );}
		}

		// check if relevant grid config for newRows is available
		if (relItems.getItemByIndex(0).getProperty(structItemRelShipConfig.relatedItemProperty, "") === "") {
			if ( relItems.getItemByIndex(0).getProperty("config_id", "") === "") {
				top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.draw_struct_row_a_null_rel_config_is_missing_prop_config_id"));
			}
		}
		else {
			if ( relItems.getItemByIndex(0).getPropertyItem(structItemRelShipConfig.relatedItemProperty).getProperty("config_id", "") === "") {
				top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.draw_struct_row_a_rel_config_is_missing_prop_config_id"));
			}
		}
		var rowItemConfigId = dataItem.getProperty("config_id", "");

		// draw child rows
		var newRowID;
        for (var i = 0; i < relCount; i++) {
            var dataItemRel = relItems.getItemByIndex(i);
			var relItemId = dataItemRel.getProperty(structItemRelShipConfig.relatedItemProperty, "");
			var rowItemId = relItemId;
			
			// define newRowID - relationship could be a NULL relationship
			if (relItemId === "") {
				relItem = null;
				relItemType = dataItemRel.getType();
				rowItemId = dataItemRel.getID();
				newRowID = dataItemRel.getProperty("config_id", "") + "-" + rowItemConfigId;
			}
			else {
				relItem = dataItemRel.getPropertyItem(structItemRelShipConfig.relatedItemProperty);
				relItemType = relItem.getType();
				if (structItemRelShipConfig.disallowDuplicateItems) {
					newRowID = parentItemConfigId + "-" + rowItemConfigId + "-" + relItem.getProperty("config_id", "");
				}
				else {
					newRowID = dataItemRel.getProperty("config_id", "") + "-" + rowItemConfigId + "-" + relItem.getProperty("config_id", "");
				}
			}
			
			if (!doUpdateDiff) {
				// add a new rows
				newRowID = this.AddRowToGrid(parentRowId, groupOrParentRowId, newRowID, rowItemConfigId, dataItemRel, relItem, relItemType, rowItemId, icon, this.gridVisibleColumns, this.relShipColumnMappings[structItemRelShipConfig.relQueryName], structItemRelShipConfig, RowIconItemTypeProp, isRowIconItemTypePropOnRel);
			}
			else {
				// detect change action - then add or update the rows
				var addRow = !this.gridRowExists(newRowID);
				if (addRow) {
					newRowID = this.AddRowToGrid(parentRowId, groupOrParentRowId, newRowID, rowItemConfigId, dataItemRel, relItem, relItemType, rowItemId, icon, this.gridVisibleColumns, this.relShipColumnMappings[structItemRelShipConfig.relQueryName], structItemRelShipConfig, RowIconItemTypeProp, isRowIconItemTypePropOnRel);
				}
				else {
					// update values on diff columns and set the change Action --> calls callback function
					structItemRelShipConfig.updateDiffColumnsCallback(this, newRowID, dataItemRel, relItem, structItemRelShipConfig.relQueryName, structItemRelShipConfig.rowBgColor, addRow);
				}
			}

        } //--- for i
		if (relCount === 1) {return newRowID;}  //if only 1 row gets added, return its grid row id
    },
    AddRowToGrid: function (parentRowId, groupOrParentRowId, newRowID, rowItemConfigId, dataItemRel, relItem, relItemType, rowItemId, icon, gridVisibleColumns, columnMappings, structItemRelShipConfig, RowIconItemTypeProp, isRowIconItemTypePropOnRel) {
	
		if (!this.gridRowExists(newRowID)) {
			// determine icon for each row (can be mixed)
			if (icon === null) {  //get small icon of item type
				var iconItemType = relItemType;
				if (RowIconItemTypeProp !== "") {if (isRowIconItemTypePropOnRel) {iconItemType = dataItemRel.getProperty(RowIconItemTypeProp, "");}}
				if (!this.icons[iconItemType] || this.icons[iconItemType] === undefined) {
					this.icons[iconItemType] = fn_GetSmallIconFormatOfItemType(iconItemType);
					icon = this.icons[iconItemType];
				}
				else {
					icon = this.icons[iconItemType];
				}
			}
		
			var data = { itemNode: relItem, relationshipNode: dataItemRel, parentRowId: parentRowId };
			var row = new RowClass(this, data, gridVisibleColumns, columnMappings);
			//## use for detailed debugging
			//if (this.showDebugAlerts) {alert("row values = "+ row.getValues());}

			this.grid.insertNewChild(groupOrParentRowId, newRowID, row.getValues(), newRowID, icon, icon);
			row.bind(newRowID, structItemRelShipConfig.rowBgColor, relItemType, rowItemId);
			this.setGridRowUserData(newRowID, "rowItemConfigId", rowItemConfigId);
			this.setGridRowUserData(newRowID, "rowRelationshipType", structItemRelShipConfig.relName);
			this.setGridRowUserData(newRowID, "rowOfGroupName", structItemRelShipConfig.relQueryName);
			return newRowID;
		}
		return null;
	},

    //--- API
	/// <summary>
	///
	/// </summary>
    getIndexOfVisibleColumnByName: function (columnName) {
        for (var idx = 0; idx < this.gridVisibleColumns.length; idx++) {
            if (this.gridVisibleColumns[idx].Name === columnName) { return idx; }
        }
        return -1;
    },

    //--- API
	/// <summary>
	///
	/// </summary>
    setBackgroundColorOfRow: function (rowId, colorCode) {
        fn_SetBackgroundColorOfCellsInRow(this.grid, rowId, 0, this.numberOfGridColumns - 1, colorCode, this.isTreeGrid);
    },
	
    //--- API
	/// <summary>
	///
	/// </summary>
    setBackgroundColorOfFlatRow: function (rowId, colorCode) {
        fn_SetBackgroundColorOfCellsInRow(this.grid, rowId, 0, this.numberOfGridColumns - 1, colorCode, this.isTreeGrid);
    },

    //--- API
	/// <summary>
	///
	/// </summary>
    setBackgroundColorOfRow_ex: function (rowId, colorCode, applyToParentRow, applyUpToRoot, excludeRootRows, excludePhantomRows) {
        if (!applyToParentRow || applyToParentRow === undefined) { applyToParentRow = false; }
        if (!applyUpToRoot || applyUpToRoot === undefined) { applyUpToRoot = false; }
        if (!excludeRootRows || excludeRootRows === undefined) { excludeRootRows = false; }
		
        var startCell = 0;
        var endCell = this.numberOfGridColumns - 1;

        fn_SetBackgroundColorOfCellsInRow(this.grid, rowId, startCell, endCell, colorCode);
        var parent_row_id;

        // include one parent level
        if (applyToParentRow && !applyUpToRoot) {
            parent_row_id = this.grid.getParentId(rowId);
            if (parent_row_id && this.grid.getParentId(parent_row_id)) { fn_SetBackgroundColorOfCellsInRow(this.grid, parent_row_id, startCell, endCell, colorCode, this.isTreeGrid); }
        }
        if (!applyUpToRoot) { return; }
        parent_row_id = this.grid.getParentId(rowId);
        while (parent_row_id) {
            if (this.grid.getParentId(parent_row_id) || !excludeRootRows) { // exclude root row
                fn_SetBackgroundColorOfCellsInRow(this.grid, parent_row_id, startCell, endCell, colorCode, this.isTreeGrid);
            }
            parent_row_id = this.grid.getParentId(parent_row_id);
        }
        return;
    }
};

// include more BaseGrid prototypes from different js file
try {
   window.eval(top.aras.getFileText(top.aras.getBaseURL() + "/Solutions/CommonUtilities/javascript/BaseGridDiff_Utilities.js"));
}finally {}


// MISC GRID HELPER FUNCTIONS
//==================================
fn_initDefaultIcons = function (gridCtxt) {
	if (gridCtxt.use_svg_icons) {
		gridCtxt.icons["locked"] = 		"../images/LockedByMe.svg";
		gridCtxt.icons["locked_else"] = "../images/LockedByOthers.svg";
		gridCtxt.icons["item_chk0"] = 	"../images/checkbox-unchecked.svg";
		gridCtxt.icons["item_chk1"] = 	"../images/checkbox-checked.svg";
		gridCtxt.icons["newerItemGen"] = "../images/UpArrow.svg";
		
		//icon of item types of standard Aras Solutions
		gridCtxt.icons["CAD"] = 		"../images/CAD.svg";
		gridCtxt.icons["Document"] = 	"../images/Document.svg";
		gridCtxt.icons["Part"] = 		"../images/Part.svg";
	}
};

fn_setConditonOnItem = function (itm, amlConditions) {
    var conditions = amlConditions.split(";");
    for (var c = 0; c < conditions.length; c++) {
        var pos = conditions[c].indexOf(">");
        var pos2 = conditions[c].indexOf("</");
        if (pos >= 0) {
            var propName = conditions[c].substring(1, pos);
            var propVal = conditions[c].substring(pos + 1, pos2);
            itm.setProperty(propName, propVal);
        }
    }
};

fn_getItemByConfigId = function (itemType, configId, generation, isReleased, selectProps) {
	// if generation is set, ignore the rest of the args
	var aml = '<Item type="'+itemType+'" action="get" >';
	aml += '<config_id>'+configId+'</config_id>';
	if (generation && generation !== undefined && generation !== "") {
		aml += '<generation>'+generation+'</generation>';
	}
	else {
		if (isReleased) {
			aml += '<is_released>1</is_released>';	
		}
		else {
			aml += '<is_current>1</is_current>';
		}
	}
	aml += '</Item>';
	var itm = top.aras.newIOMItem("");
	itm.loadAML(aml);
	if (selectProps && selectProps !== undefined && selectProps !== "") {
		itm.setAttribute("select",selectProps);
	}
	itm.setAttribute("orderBy","generation");
	itm = itm.apply();
	if (itm.isError()) {return itm;}
	
	return itm.getItemByIndex(itm.getItemCount()-1);
};

fn_IsCurrUserMemberOfIdentityId = function (identity_id_to_check) {
    if (!identity_id_to_check || identity_id_to_check === undefined || identity_id_to_check === "") { return false; }

    var sessionIdentitites_array = top.aras.getIdentityList().split(",");
    // now we have all identities the current user (session) is member of
    // scan if given identity is in the list - if yes, return true
    for (var i = 0; i < sessionIdentitites_array.length; i++) {
        if (identity_id_to_check == sessionIdentitites_array[i]) { return true; }
    }
    return false;
};

fn_GetSmallIconFormatOfItemType = function (itemType) {
    // retrieving ICONs - get the small icon from item types "Part"
    var qryIcon = top.aras.newIOMItem();
    qryIcon.loadAML("<Item type='ItemType' action='get' select='name,open_icon'><name>" + itemType + "</name></Item>");
    qryIcon = qryIcon.apply();
	var smallIcon = "../images/ArrowRight.svg";
    if (qryIcon.getItemCount() === 1) { smallIcon = qryIcon.getProperty("open_icon", smallIcon); }
    return smallIcon;
};

//-----------------
fn_showFormInModalDialog = function (formName, title, itemTypeName, param, inCallback, contextItem) {
	if (param === undefined) {param=null;}
	if (contextItem === undefined) {contextItem=null;}
	if (inCallback === undefined) {inCallback=null;}
	var callback;
	if (inCallback !== null) {callback = inCallback;}
	else {
	  callback = {
		oncancel: function(dlgRes) {
			var result = dlgRes.result;
			if (!result || result === undefined || result === "") {return null;}
			return result;
		}
	  };
	}

  var formNd = top.aras.getItemByName("Form", formName, 0);

  var res = null;
  if (formNd)
  {
    var thisParam;
	if (param !== null) { thisParam = param;}
	else {thisParam	= {};}
    thisParam.title = title;
    thisParam.formId = formNd.getAttribute("id");
    thisParam.aras = top.aras;
    thisParam.itemTypeName = itemTypeName;
	if (contextItem !== null) {thisParam.item = contextItem;}  // will be document.thisItem when form is loaded

    var width = parseInt(top.aras.getItemProperty(formNd, "width")) +50;
    var height = parseInt(top.aras.getItemProperty(formNd, "height")) +50;

	var options = { dialogHeight:height, dialogWidth:width,  status:0, help:0, resizable:1, scroll:0 };

	var aWindow 
	var mw = top.aras.getMainWindow();
	if (mw.main) {
		aWindow = mw.main;	
	}
	else {
		aWindow = mw == window.top ? mw.document.getElementById("main").contentWindow : top;
	}
	top.aras.modalDialogHelper.show('DefaultPopup', aWindow, thisParam, options, 'ShowFormAsADialog.html', callback);

  }
};

//=========================
fn_SetBackgroundColorOfCellsInRow = function (gridCtrl, row, colStart, colEnd, bgColor, isTreeGrid) {
    var rowBg = [];
    for (c = colStart; c < colEnd + 1; c++) {
		if (isTreeGrid) {rowBg.push(bgColor);}
		else { gridCtrl.cells(row, c).SetBgColor_Experimental(bgColor);}
    }
	if (isTreeGrid) {gridCtrl.setRowBgColor(row, rowBg.join("|"));}
	//##TODO - fix when supported for flat grids##  else {gridCtrl.SetRowBgColor(row, rowBg.join("|"));}
};

//==================================
fn_LockThisItem = function (itemType, itemId) {
    var itm = top.aras.newIOMItem(itemType, "get");
    itm.setID(itemId);
    itm.loadAML("<Item type='" + itemType + "' action='lock' id='" + itemId + "' />");
    itm = itm.apply();
    return itm;
};

//==================================
fn_UnLockThisItem = function (itemType, itemId) {
    var itm = top.aras.newIOMItem(itemType, "get");
    itm.setID(itemId);
    itm.loadAML("<Item type='" + itemType + "' action='unlock' id='" + itemId + "' />");
    itm = itm.apply();
    return itm;
};
fn_getToolbarElementChoice = function (toolbarCtrl, choiceElementId) {
    if (!toolbarCtrl) { return; }
    var AT = toolbarCtrl.getActiveToolbar();
    try {
        var tbi = AT.getElement(choiceElementId);
        if (tbi) {
            return tbi.getSelectedItem();
        }
    }
    catch (excep) { top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.utils_exception_toolbar_item_get_choice").format(choiceElementId));}
    return "";
};
fn_setToolbarElementChoice = function (toolbarCtrl, choiceElementId, choiceItemId) {
    if (!toolbarCtrl) { return; }
    var AT = toolbarCtrl.getActiveToolbar();
    try {
        var tbi = AT.getElement(choiceElementId);
        if (tbi) {
            tbi.setSelected(choiceItemId); // select this item of dropdown list
            return choiceItemId;
        }
    }
    catch (excep) { top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.utils_exception_toolbar_item_set_choice").format(choiceElementId));}
    return "";
};
fn_setToolbarElementText = function (toolbarCtrl, textElementId, textVal) {
    if (!toolbarCtrl) { return; }
    var AT = toolbarCtrl.getActiveToolbar();
    try {
        var tbi = AT.getElement(textElementId);
        if (tbi) {
            tbi.setText(textVal);
            return;
        }
    }
    catch (excep) { top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.utils_exception_toolbar_item_set").format(textElementId));}
    return;
};
fn_getToolbarElementText = function (toolbarCtrl, textElementId) {
    if (!toolbarCtrl) { return; }
    var AT = toolbarCtrl.getActiveToolbar();
    try {
        var tbi = AT.getElement(textElementId);
        if (tbi) {return tbi.getText(textVal);}
    }
    catch (excep) { top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.utils_exception_toolbar_item_get").format(textElementId));}
    return "";
};

// =============================
fn_enableToolbarElement = function (toolbarCtrl, tbElementName, doEnable, hideWhenDisabled) {
    if (!toolbarCtrl) { return; }

    if (doEnable === undefined) { doEnable = true; }
    else { doEnable = Boolean(doEnable); }
    if (!hideWhenDisabled || hideWhenDisabled === undefined) { hideWhenDisabled = false; }
    else { hideWhenDisabled = Boolean(hideWhenDisabled); }

    var AT = toolbarCtrl.getActiveToolbar();
    try {
        var tbi = AT.getElement(tbElementName);
        if (!tbi) { return; }

        tbi.setEnabled(doEnable);
        if (!doEnable && hideWhenDisabled) {
            AT.hideItem(tbElementName);
        }
        else {
            AT.showItem(tbElementName);
        }
    }
    catch (excep) { top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.utils_exception_enable_element").format(tbElementName));}
};

//==================================
fn_GetLockedStatusOfItemFromServer = function (itemType, itemId) {
    //to avoid 2 requests to server, get locked_by_id and determine lock status
    //locked_by_id not set --> lockStatus = 0
    //locked_by_id = current User  --> lockStatus = 1,  else  --> lockStatus = 2
    var itm = top.aras.newIOMItem(itemType, "get");
    itm.setID(itemId);
    itm.loadAML("<Item type='" + itemType + "' action='get' select='locked_by_id' id='" + itemId + "' serverEvents='0' />");
    itm = itm.apply();
    if (itm.isError()) { return 0; }
    var lockUser = itm.getProperty("locked_by_id", "");
    if (lockUser === "") { return 0; }
    if (lockUser === top.aras.getUserID()) { return 1; }
    return 2;
};
//==================================
fn_LockThisItem = function (itemType, itemId) {
    var itm = top.aras.newIOMItem(itemType, "get");
    itm.setID(itemId);
    itm.loadAML("<Item type='" + itemType + "' action='lock' id='" + itemId + "' />");
    itm = itm.apply();
    return itm;
};
//==================================
fn_UnLockThisItem = function (itemType, itemId) {
    var itm = top.aras.newIOMItem(itemType, "get");
    itm.setID(itemId);
    itm.loadAML("<Item type='" + itemType + "' action='unlock' id='" + itemId + "' />");
    itm = itm.apply();
    return itm;
};
//==================================
fn_GetItemsOfCurrentGeneration = function (itemType, itemIds, selectProperties) {
    //add single quotes to ids list, if needed
    var idCondition;
    if (itemIds.indexOf(",") > 0) { //multiple ids
        if (itemIds.indexOf("'") < 0) { itemIds = "'" + itemIds.replace(/,/g, "','") + "'"; }
        idCondition = "<id condition='in'>" + itemIds + "</id>";
    }
    else { //single id passed in
        idCondition = "<id>" + itemIds + "</id>";
    }

    var itm = top.aras.newIOMItem(itemType, "get");
    itm.loadAML("<Item type='" + itemType + "' action='Get Current Items By IDs' select='" + selectProperties + "' >" + idCondition + "</Item>");
    itm = itm.apply();
    return itm;
};
//==================================
fn_GetItemsOfReleasedGeneration = function (itemType, itemIds, selectProperties) {
    //add single quotes to ids list, if needed
    var idCondition;
    if (itemIds.indexOf(",") > 0) { //multiple ids
        if (itemIds.indexOf("'") < 0) { itemIds = "'" + itemIds.replace(/,/g, "','") + "'"; }
        idCondition = "<id condition='in'>" + itemIds + "</id>";
    }
    else { //single id passed in
        idCondition = "<id>" + itemIds + "</id>";
    }

    var itm = top.aras.newIOMItem(itemType, "get");
    itm.loadAML("<Item type='" + itemType + "' action='Get Latest Released Items By IDs' select='" + selectProperties + "' >" + idCondition + "</Item>");
    itm = itm.apply();
    return itm;
};
