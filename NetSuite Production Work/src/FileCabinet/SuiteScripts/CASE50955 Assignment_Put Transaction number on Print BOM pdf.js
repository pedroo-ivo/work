//need to put the transaction number on the Print BOM pdf
//when a purchase order is created from a work order, the transaction number of the purchase order will be put on the work order and will be printed on the Print BOM pdf
//when the purchase order is deleted, the transaction number will be removed from the work order

// Need to create a custom field on the work order to store the purchase order transaction number and have this field as disabled and dont even need to show on the work order, just needed on the Print BOM pdf
//custom field id: custcol1 NEED TO BE CHANGED TO A PROPER NAME AND ID
//script is deployed on purchase order record type
//finally show custom field created on the Print BOM pdf

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["N/record", "N/log", "N/search"], function (record, log, search) {
	function afterSubmit(context) {
		// 🔁 TRATA DELETE
		if (context.type === context.UserEventType.DELETE) {
			try {
				const poRecord = context.oldRecord;
				const createdFrom = poRecord.getValue("createdfrom");
				if (!createdFrom) return;

				const poTranid = poRecord.getValue("tranid");
				if (!poTranid) return;

				const woRecord = record.load({
					type: record.Type.WORK_ORDER,
					id: createdFrom,
					isDynamic: false,
				});

				const lineCount = woRecord.getLineCount({
					sublistId: "item",
				});

				for (let i = 0; i < lineCount; i++) {
					const currentVal = woRecord.getSublistValue({
						sublistId: "item",
						fieldId: "custcol1",
						line: i,
					});

					if (currentVal === poTranid) {
						woRecord.setSublistValue({
							sublistId: "item",
							fieldId: "custcol1",
							line: i,
							value: "",
						});
						log.audit(
							"Campo limpo",
							`Linha ${i} da WO ${createdFrom}`
						);
					}
				}

				woRecord.save({ ignoreMandatoryFields: true });
				log.audit(
					"Work Order atualizada após exclusão da PO",
					`Campos limpos: ${poTranid}`
				);
			} catch (e) {
				log.error(
					"Erro ao limpar custcol1 após exclusão da PO",
					e
				);
			}

			return;
		}

		// 🔁 TRATA CREATE NORMAL
		try {
			const poRecord = context.newRecord;

			if (context.type !== context.UserEventType.CREATE) return;

			const createdFrom = poRecord.getValue("createdfrom");
			if (!createdFrom) {
				log.audit(
					"PO criada sem origem",
					'PO não tem "createdfrom"'
				);
				return;
			}

			const poTranid = search.lookupFields({
				type: search.Type.PURCHASE_ORDER,
				id: poRecord.id,
				columns: ["tranid"],
			}).tranid;

			log.audit("Tranid gerado", poTranid);

			const woRecord = record.load({
				type: record.Type.WORK_ORDER,
				id: createdFrom,
				isDynamic: false,
			});

			const woLineCount = woRecord.getLineCount({
				sublistId: "item",
			});
			const poLineCount = poRecord.getLineCount({
				sublistId: "item",
			});

			for (let i = 0; i < poLineCount; i++) {
				const sourceLine = poRecord.getSublistValue({
					sublistId: "item",
					fieldId: "orderline",
					line: i,
				});

				if (sourceLine == null) continue;

				const targetLine = parseInt(sourceLine) - 1;

				if (targetLine >= 0 && targetLine < woLineCount) {
					woRecord.setSublistValue({
						sublistId: "item",
						fieldId: "custcol1",
						line: targetLine,
						value: poTranid,
					});
				}
			}

			woRecord.save({ ignoreMandatoryFields: true });
			log.audit(
				"WO atualizada com tranid da PO",
				`Tranid: ${poTranid}`
			);
		} catch (e) {
			log.error("Erro ao preencher tranid na WO", e);
		}
	}

	return {
		afterSubmit,
	};
});
