sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
    "../model/formatter",
    "sap/ui/core/format/DateFormat",
   "sap/ui/model/Filter",
   "sap/ui/model/FilterOperator"

   
], function (BaseController, JSONModel, History, formatter, DateFormat, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("project1.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page shows busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
					busy : true,
					delay : 0
				});
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this.setModel(oViewModel, "objectView");
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */


		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
         * Furthermore, it removes the defined binding context of the view by calling unbindElement().
        
         * @public
		 */
		onNavBack : function() {
			var sPreviousHash = History.getInstance().getPreviousHash();
            this.getView().unbindElement();
            
            if (sPreviousHash !== undefined) {
				// eslint-disable-next-line sap-no-history-manipulation
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched : function (oEvent) {
			var sObjectId =  oEvent.getParameter("arguments").objectId;
			this._bindView("/MeineappSet" + sObjectId);
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView : function (sObjectPath) {
			var oViewModel = this.getModel("objectView");

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange : function () {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
                oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle();

			oView.getBindingContext().requestObject().then((function (oObject) {
				var sObjectId = oObject.patientennummer,
					sObjectName = oObject.patientennummer;


				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/shareSendEmailSubject",
					oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
					oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
            }).bind(this));
            

    // Update the comments in the list
         var oList = this.byId("idCommentsList");
         var oBinding = oList.getBinding("items");
         oBinding.filter(new Filter("productID", FilterOperator.EQ, sObjectId));
      },
      /**
      * Updates the model with the user comments on Products.
      * @function
      * @param {sap.ui.base.Event} oEvent object of the user input
      */
      onPost: function (oEvent) {
         var oFormat = DateFormat.getDateTimeInstance({style: "medium"});
         var sDate = oFormat.format(new Date());
         var oObject = this.getView().getBindingContext().getObject();
         var sValue = oEvent.getParameter("value");
         var oEntry = {
             productID: oObject.ProductID,
             type: "Comment",
             date: sDate,
             comment: sValue
         };        
         // update model
         var oFeedbackModel = this.getModel("productFeedback");
         var aEntries = oFeedbackModel.getData().productComments;
         aEntries.push(oEntry);
         oFeedbackModel.setData({
            productComments : aEntries
         });
      }





        
        



	});

});