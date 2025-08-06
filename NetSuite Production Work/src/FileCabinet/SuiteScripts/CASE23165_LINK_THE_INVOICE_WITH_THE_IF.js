// need to create script deployment for invoice
// need to create custom column field on invoice: this is the id: _dce_related_fulfillment_numbe and apply to sale item

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["N/search", "N/record", "N/log"], function (search, record, log) {
	function deepCopy(obj) {
		return JSON.parse(JSON.stringify(obj));
	}
	function afterSubmit(context) {
		if (
			context.type !== context.UserEventType.CREATE &&
			context.type !== context.UserEventTypes.EDIT
		)
			return;

		var invoice = context.newRecord;
		var invoiceId = invoice.id;
		var createdFromId = invoice.getValue({
			fieldId: "createdfrom",
		});

		if (!createdFromId) {
			log.debug(
				"No createdfrom",
				"Invoice not created from SO or IF."
			);
			return;
		}

		// Descobre o tipo do "createdfrom"
		var createdFromTypeObj = search.lookupFields({
			type: "transaction",
			id: createdFromId,
			columns: ["type"],
		});
		var createdFromType = createdFromTypeObj.type[0].value;

		if (createdFromType === "SalesOrd") {
			// 1. Busca todas as IFs do SO, por item, ordenadas por data
			var fulfillmentSearch = search.create({
				type: "itemfulfillment",
				filters: [
					["createdfrom", "anyof", createdFromId],
					"AND",
					["mainline", "is", "F"],
				],
				columns: [
					"tranid",
					"item",
					"quantity",
					"datecreated",
					"internalid",
				],
			});

			var itemToFulfills = {};

			fulfillmentSearch.run().each(function (result) {
				var itemId = result.getValue("item");
				var tranid = result.getValue("tranid");
				var internalid = result.getValue("internalid");
				var qty = parseFloat(result.getValue("quantity") || 0);
				var date = result.getValue("datecreated");

				if (qty <= 0) return true; // IGNORA linha negativa ou zero!

				if (!itemToFulfills[itemId])
					itemToFulfills[itemId] = [];
				itemToFulfills[itemId].push({
					tranid: tranid,
					internalid: internalid,
					origQty: qty,
					restante: qty,
					date: date,
				});
				return true;
			});

			// REMOVE DUPLICIDADE: só uma vez por (tranid, internalid) para cada item
			for (var key in itemToFulfills) {
				var unique = {};
				itemToFulfills[key] = itemToFulfills[key].filter(
					function (obj) {
						var ukey =
							obj.tranid + "-" + obj.internalid;
						if (!unique[ukey]) {
							unique[ukey] = true;
							return true;
						}
						return false;
					}
				);
				// Ordena IFs por data (FIFO)
				itemToFulfills[key].sort(function (a, b) {
					return new Date(a.date) - new Date(b.date);
				});
				// Loga as IFs únicas por item
				log.debug(
					"Fulfillments únicos para o item " + key,
					JSON.stringify(itemToFulfills[key])
				);
			}

			// 2. Busca todas as invoices (menos a atual) para calcular o saldo de cada IF/ITEM
			var soInvoiceSearch = search.create({
				type: "invoice",
				filters: [
					["createdfrom", "anyof", createdFromId],
					"AND",
					["internalid", "noneof", invoiceId],
				],
				columns: [
					"internalid",
					"item",
					"quantity",
					"custcol_dce_related_fulfillment_numbe",
				],
			});
			// Map: {itemId: {IFTranid: totalQtyFaturada}}
			var ifQtyFaturada = {};

			soInvoiceSearch.run().each(function (res) {
				var item = res.getValue("item");
				var qty = parseFloat(res.getValue("quantity") || 0);
				var ifTranidField = res.getValue(
					"custcol_dce_related_fulfillment_numbe"
				);
				if (ifTranidField) {
					var ifTranids = ifTranidField
						.split(",")
						.map((t) => t.trim());
					if (!ifQtyFaturada[item])
						ifQtyFaturada[item] = {};
					ifTranids.forEach(function (tranid) {
						if (!ifQtyFaturada[item][tranid])
							ifQtyFaturada[item][tranid] = 0;
						ifQtyFaturada[item][tranid] +=
							qty / ifTranids.length;
					});
				}
				return true;
			});

			// 3. Ajusta o saldo restante de cada IF/ITEM
			for (var itemId in itemToFulfills) {
				itemToFulfills[itemId].forEach(function (ifObj) {
					var faturada =
						ifQtyFaturada[itemId] &&
						ifQtyFaturada[itemId][ifObj.tranid]
							? ifQtyFaturada[itemId][ifObj.tranid]
							: 0;
					ifObj.restante = Math.max(
						0,
						ifObj.origQty - faturada
					);
				});
			}

			// Copia o saldo das IFs para uso local durante o processamento dessa invoice
			var itemToFulfillsLive = deepCopy(itemToFulfills);

			// 4. Agora aplica o FIFO para as linhas da Invoice ATUAL
			var invRec = record.load({
				type: record.Type.INVOICE,
				id: invoiceId,
				isDynamic: false,
			});

			var lineCount = invRec.getLineCount({
				sublistId: "item",
			});
			for (var i = 0; i < lineCount; i++) {
				var itemId = invRec.getSublistValue({
					sublistId: "item",
					fieldId: "item",
					line: i,
				});
				var qtyLine = parseFloat(
					invRec.getSublistValue({
						sublistId: "item",
						fieldId: "quantity",
						line: i,
					}) || 0
				);

				var ifList = itemToFulfillsLive[itemId];
				var pickedIFs = [];
				var qtyToFill = qtyLine;

				log.debug(
					`Processando linha ${i + 1} (item ${itemId})`,
					`Qde: ${qtyLine} | IFs: ${JSON.stringify(ifList)}`
				);

				if (ifList && ifList.length > 0 && qtyToFill > 0) {
					var usedIFs = [];
					for (var k = 0; k < ifList.length; k++) {
						var available = ifList[k].restante;
						if (available > 0 && qtyToFill > 0) {
							var used = Math.min(
								qtyToFill,
								available
							);
							// Só adiciona uma vez cada IF usada
							if (
								usedIFs.indexOf(
									ifList[k].tranid
								) === -1
							) {
								usedIFs.push(ifList[k].tranid);
							}
							ifList[k].restante -= used;
							qtyToFill -= used;
						}
						if (qtyToFill <= 0) break;
					}
					pickedIFs = usedIFs;
				}

				var tranid = pickedIFs.join(", ");

				invRec.setSublistValue({
					sublistId: "item",
					fieldId: "custcol_dce_related_fulfillment_numbe",
					line: i,
					value: tranid,
				});
				log.debug(
					`Linha preenchida`,
					`Linha ${
						i + 1
					} (item ${itemId}): IF(s) ${tranid} (qty: ${qtyLine})`
				);
			}

			var savedId = invRec.save({
				ignoreMandatoryFields: true,
			});
			log.debug(
				"Invoice atualizada com IFs (FIFO sem repetir, multi-IFs)",
				`Invoice ID: ${savedId}`
			);
		} else if (createdFromType === "ItemShip") {
			log.debug("Fluxo", "Invoice criada direto da IF.");
			var ifTranid = search.lookupFields({
				type: "itemfulfillment",
				id: createdFromId,
				columns: ["tranid"],
			}).tranid;

			var invRecIF = record.load({
				type: record.Type.INVOICE,
				id: invoiceId,
				isDynamic: false,
			});

			var lineCountIF = invRecIF.getLineCount({
				sublistId: "item",
			});
			for (var j = 0; j < lineCountIF; j++) {
				invRecIF.setSublistValue({
					sublistId: "item",
					fieldId: "custcol_dce_related_fulfillment_numbe",
					line: j,
					value: ifTranid,
				});
				log.debug(
					`IF preenchida`,
					`Linha ${j + 1}: IF ${ifTranid}`
				);
			}
			var savedIdIF = invRecIF.save({
				ignoreMandatoryFields: true,
			});
			log.debug(
				"Invoice atualizada com IF direto",
				`Invoice ID: ${savedIdIF}`
			);
		} else {
			log.debug(
				"Outro fluxo",
				`Tipo de origem não tratado: ${createdFromType}`
			);
			return;
		}
	}

	return { afterSubmit: afterSubmit };
});
