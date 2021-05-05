sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
   "sap/m/MessageBox",
   'sap/ui/core/mvc/Controller'  
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, MessageToast, MessageBox, Controller) {
	"use strict";

	return BaseController.extend("project1.controller.Worklist", {
     formatter: formatter,
   


		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {         

 	var oMessageManager = sap.ui.getCore().getMessageManager(),
				oMessageModel = oMessageManager.getMessageModel(),
				oMessageModelBinding = oMessageModel.bindList("/", undefined, [],
					new Filter("technical", FilterOperator.EQ, true)),
				oViewModel = new JSONModel({
					busy : false,
					hasUIChanges : false,
					patientennummerEmpty : true,
					order : 0
				});
			this.getView().setModel(oViewModel, "appView");
			this.getView().setModel(oMessageModel, "message");

			oMessageModelBinding.attachChange(this.onMessageBindingChange, this);
			this._bTechnicalErrors = false;

		

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished : function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress : function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler for navigating back.
		 * Navigate back in the browser history
		 * @public
		 */
		onNavBack : function() {
			// eslint-disable-next-line sap-no-history-manipulation
			history.go(-1);
		},


		onSearch : function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("patientennummer", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

        },
        
      /**
       * Displays an error message dialog. The displayed dialog is content density aware.
       * @param {String} sMsg The error message to be displayed
       * @private
       */
      _showErrorMessage: function(sMsg) {
         MessageBox.error(sMsg, {
            styleClass: this.getOwnerComponent().getContentDensityClass()
         });
      },
       


		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh : function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject : function (oItem) {
			var that = this;

			oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
				that.getRouter().navTo("object", {
                    objectId_Old: oItem.getBindingContext().getProperty("patientennummer"),
					objectId : sObjectPath.slice("/MeineappSet".length) // /Products(3)->(3)
				});
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function(aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},


/**
       * Error and success handler for the unlist action.
       * @param sPatientenId the product id for which this handler is called
       * @param bSuccess true in case of a success handler, else false (for error handler)
       * @param iRequestNumber the counter which specifies the position of this request
       * @param iTotalRequests the number of all requests sent
       * @param oData forwarded data object received from the remove/update OData API
         * @param oResponse forwarded response object received from the remove/update OData API
         * @private
         */
      _handleUnlistActionResult : function (sPatientenId, bSuccess, iRequestNumber, iTotalRequests, oData, oResponse){
         // create a counter for successful and one for failed requests
         // ...
         // however, we just assume that every single request was successful and display a success message once
         if (iRequestNumber === iTotalRequests) {
            MessageToast.show(this.getModel("i18n").getResourceBundle().getText("StockRemovedSuccessMsg", [iTotalRequests]));
         }
      },
/**
       * Error and success handler for the reorder action.
       * @param sPatientenId the product id for which this handler is called
       * @param bSuccess true in case of a success handler, else false (for error handler)
       * @param iRequestNumber the counter which specifies the position of this request
       * @param iTotalRequests the number of all requests sent
       * @param oData forwarded data object received from the remove/update OData API
       * @param oResponse forwarded response object received from the remove/update OData API
       * @private
       */


      _handleReorderActionResult : function (sPatientenId, bSuccess, iRequestNumber, iTotalRequests, oData, oResponse){
         // create a counter for successful and one for failed requests
         // ...
         // however, we just assume that every single request was successful and display a success message once
         if (iRequestNumber === iTotalRequests) {
            MessageToast.show(this.getModel("i18n").getResourceBundle().getText("StockUpdatedSuccessMsg", [iTotalRequests]));
         }
      },


 		/**
		 * Create a new entry.
		 */

        /*https://stackoverflow.com/questions/50947692/sapui5-sap-m-table-how-to-add-input-as-column-on-click-of-add-row-button/50967812*/
        /*onCreate : function (oEvent) {
            var table = this.getView().byId("table");
            var itemRow = {
                patientennummer: new sap.m.Input(),
                vorname: new sap.m.Input(),
                nachname : new sap.m.Input(),
                editable: true,
                LeaveType: " " 
            };
            var oModel = this.getView().getModel('userInfoTableModel').getData();
            oModel.push(itemRow);
            this.getView().getModel('userInfoTableModel').setData(oModel);
        },*/


  		onCreate : function (oEvent) {
			var oList = this.byId("table"),
				oBinding = oList.getBinding("items"),
                // Create a new entry through the table's list binding
                oContext = oBinding.create({
					"patientennummer" : "",
					"vorname" : "",
                    "nachname" : "",
                    editable: true,
                    LeaveType: ""
				});

			this._setUIChanges(true);
			this.getView().getModel("appView").setProperty("/patientennummerEmpty", true);

			// Select and focus the table row that contains the newly created entry
			oList.getItems().some(function (oItem) {
				if (oItem.getBindingContext() === oContext) {
					oItem.focus();
					oItem.setSelected(true);
					return true;
				}
			});
        },


		/**
		 * Delete an entry.
		 */
		/*onDelete : function () {
			var oSelected = this.byId("table").getSelectedItem();

			if (oSelected) {
				oSelected.getBindingContext().delete("$auto").then(function () {
                    /*MessageToast.show(this._getText("deletionSuccessMessage"));
                    MessageBox.confirm("Patient {anrede} {vorname} {name} / {patientennummer} unwiederruflich entfernen?");
				}.bind(this), function (oError) {
                    MessageBox.error(oError.message);
				});
			}
        },*/

        onDelete : function() {    
            var oSelected = this.byId("table").getSelectedItem();
            if (oSelected) {
               oSelected.getBindingContext().delete("$auto").then(function () {

                MessageBox.warning("Patient {anrede} {vorname} {nachname} / {patientennummer} unwiederruflich entfernen?.", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL], 
                emphasizedAction: MessageBox.Action.OK,
            });
                }.bind(this), function (oError) {
                    MessageBox.error(oError.message);
				});

			} 
        },


        

        _setUIChanges : function (bHasUIChanges) {
			if (this._bTechnicalErrors) {
				// If there is currently a technical error, then force 'true'.
				bHasUIChanges = true;
			} else if (bHasUIChanges === undefined) {
				bHasUIChanges = this.getView().getModel().hasPendingChanges();
			}
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/hasUIChanges", bHasUIChanges);
        },

        onSave : function () {
			var fnSuccess = function () {
				this._setBusy(false);
				MessageToast.show(this._getText("changesSentMessage"));
				this._setUIChanges(false);
			}.bind(this);

			var fnError = function (oError) {
				this._setBusy(false);
				this._setUIChanges(false);
				MessageBox.error(oError.message);
			}.bind(this);

			this._setBusy(true); // Lock UI until submitBatch is resolved.
			this.getView().getModel().submitBatch("peopleGroup").then(fnSuccess, fnError);
			this._bTechnicalErrors = false; // If there were technical errors, a new save resets them.
		},

		_setBusy : function (bIsBusy) {
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/busy", bIsBusy);
        },
        
        onMessageBindingChange : function (oEvent) {
			var aContexts = oEvent.getSource().getContexts(),
				aMessages,
				bMessageOpen = false;

			if (bMessageOpen || !aContexts.length) {
				return;
			}

			// Extract and remove the technical messages
			aMessages = aContexts.map(function (oContext) {
				return oContext.getObject();
			});
			sap.ui.getCore().getMessageManager().removeMessages(aMessages);

			this._setUIChanges(true);
			this._bTechnicalErrors = true;
			MessageBox.error(aMessages[0].message, {
				id : "serviceErrorMessageBox",
				onClose : function () {
					bMessageOpen = false;
				}
			});

			bMessageOpen = true;
        },
        
        onResetChanges : function () {
			this.byId("table").getBinding("items").resetChanges();
			this._bTechnicalErrors = false; 
			this._setUIChanges();
		},

        onInputChange : function (oEvt) {
			if (oEvt.getParameter("escPressed")) {
				this._setUIChanges();
			} else {
				this._setUIChanges(true);
				if (oEvt.getSource().getParent().getBindingContext().getProperty("patientennummer")) {
					this.getView().getModel("appView").setProperty("/patientennummerEmpty", false);
				}
			}
        },
        
	});
});