define([
        './F5_StandardConstants'
    ],
    function (f5_standard) {
        var TRANSACTION_FIELDS = f5_standard.TransactionField;
        TRANSACTION_FIELDS.TOTAL_AMOUNT = 'custbody_f5_total_amount';
        TRANSACTION_FIELDS.status = 'orderstatus';
        TRANSACTION_FIELDS.isCreatedInReleased = 'custbody_f5_is_created_in_released'
        TRANSACTION_FIELDS.CREATED_BY = 'custbody_f5_po_createdby';
        TRANSACTION_FIELDS.CREATED_FROM_PO = 'custbody_f5_createdfrompo';
        TRANSACTION_FIELDS.EFF_XML2NS_TRANSACTION = 'custbody_eff_nsp2p_xml2nstrans';
        // TRANSACTION_FIELDS.FOO = 'custbody_f5_foo';     // Add custom fields here
        var ENTITY_FIELDS = f5_standard.EntityField;
        // ENTITY_FIELDS.BAR = 'custentity_f5_foo';     // Add custom fields here
        var ITEM_FIELDS = f5_standard.ItemField;
        ITEM_FIELDS.AVERAGE_COST_HOLDER = 'custitem_f5_average_cost_holder';
        ITEM_FIELDS.LAST_COST_HOLDER = 'custitem_f5_last_purchase_price_holder';
        // ITEM_FIELDS.BAZ = 'custitem_f5_foo';     // Add custom fields here
        var ITEM_NUMBER_FIELDS = f5_standard.ItemNumberField;
        // ITEM_NUMBER_FIELDS.FOO = 'custitemnumber_f5_foo';     // Add custom fields here
        var ENTITY_FIELDS = f5_standard.EntityField;
        // ENTITY_FIELDS.BAR = 'custentity_f5_foo';     // Add custom fields here
        var SUBLISTS = f5_standard.Sublist;
        // Add custom sublists here
        var SUBLIST_FIELDS = f5_standard.SublistField;
        SUBLIST_FIELDS.CUSTOM_RATE = 'custcol_f5_rate';
        SUBLIST_FIELDS.CUSTOM_AMOUNT = 'custcol_f5_amount';
        SUBLIST_FIELDS.PARENT_ASSEMBLY_ITEM = 'custcol_f5_woparentasitem';
        SUBLIST_FIELDS.PARENT_ASSEMBLY_ITEM_LINE = 'custcol_f5_woparentasitem_line';
        SUBLIST_FIELDS.WO_HEADER_ITEM = 'custcol_f5_woheaderasitem';
        SUBLIST_FIELDS.WO_ASSEMBLY_LEVEL = 'custcol_f5_wo_assembly_level';
        SUBLIST_FIELDS.PARENT_ASSEMBLY_ITEM_LINEID = 'custcol_f5_woparentasitem_lineid';
        // Add custom fields here
        var ROLES = f5_standard.Role;
        // Add custom roles here
        var TABS = f5_standard.Tab;
        // Add custom tabs here
        var SUBTABS = f5_standard.Subtab;
        // Add custom subtabs here

        return {
            Field: f5_standard.Field,
            AddressField: f5_standard.AddressField,
            TransactionField: TRANSACTION_FIELDS,
            EntityField: ENTITY_FIELDS,
            ItemField: ITEM_FIELDS,
            ItemNumberField: ITEM_NUMBER_FIELDS,
            Sublist: SUBLISTS,
            SublistField: SUBLIST_FIELDS,
            WorkflowField: f5_standard.WorkflowField,
            Join: f5_standard.Join,
            TransactionTypeShort: f5_standard.TransactionTypeShort,
            TransactionTypeName: f5_standard.TransactionTypeName,
            TransactionTypeInternalId: f5_standard.TransactionTypeInternalId,
            CheckBox: f5_standard.CheckBox,
            Role: ROLES,
            Feature: f5_standard.Feature,
            Preference: f5_standard.Preference,
            User: f5_standard.User,
            Mode: f5_standard.Mode,
            ItemType: f5_standard.ItemType,
            ItemTypeInternalId: f5_standard.ItemTypeInternalId,
            ButtonId: f5_standard.ButtonId,
            Subtab: SUBTABS,
            Tab: TABS,
            CustomRecordType: {
                // FOO: 'customrecord_f5_foo'
                PRICING_GROUP_MARK_UP: 'customrecord_f5_pricing_group_mark_up'
            },
            CustomList: {
                // BAR: 'customlist_f5_bar'
            },
            ScriptParameter: {
                // FOO: 'custscript_f5_foo'
                ITEM_CHANGED_PRICE_SEARCH: 'custscript_f5_mr_uisp_item_saved_search',
              ITEMS_RECEIVED: 'custscript_f5_mr_update_item_price_ss',
                MR_UISP_PRICING_GROUP_ID: 'custscript_f5_mr_uisp_pricing_group_id',
                SYSTEM_NOTES_WORKORDER_SEARCH: 'custscript_f5_system_notes_search'
            },
            ScriptId: {
                MR_UPDATE_ITEM_SALES_PRICE: 'customscript_f5_mr_updateitemsalesprice'
                // SL_FOO: 'customscript_f5_sl_foo',
                // MR_BAR: 'customscript_f5_mr_bar',
                // SS_BAZ: 'customscript_f5_ss_baz'
            },
            DeploymentId: {
                MR_UISP_PRICING_GROUP_UPDATE: 'customdeploy_f5_mr_uisp_pricing_group_up'
                // SL_FOO: 'customdeploy_f5_sl_foo',
                // MR_BAR: 'customdeploy_f5_mr_bar',
                // SS_BAZ: 'customdeploy_f5_ss_baz'
            },
            FormulaTemplate: {
                CASE_IN_STRINGS: "CASE WHEN {{name}} IN ('{values}') THEN 1 ELSE 0 END",
                CASE_IN_INTEGERS: "CASE WHEN {{name}} IN ({values}) THEN 1 ELSE 0 END",
                SALES_PRICE_MULTIPLIER: "CASE WHEN COALESCE({averagecost},0) > COALESCE({lastpurchaseprice},0) THEN {averagecost} ELSE {lastpurchaseprice} END"
            },
            PricingGroupMarkUpField: {
                INTERNAL_ID: 'internalid',
                MARK_UP: 'custrecord_f5_pgmu_mark_up',
                PRICING_GROUP: 'custrecord_f5_pgmu_pricing_group'
            }
        }
    });