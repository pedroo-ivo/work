/**
 * when a machine hour created, update its asset record
 */
function afterSubmit(type) {
  if (type == 'create' || type == 'edit') {
    var assetId = nlapiGetFieldValue('custrecord_sh_asset');
    var serviceHours = nlapiGetFieldValue('custrecord_sh_hours');
    // Only link to SO - if transaction exist of any type.
    if (assetId && serviceHours) nlapiSubmitField('customrecord_nx_asset', assetId, 'custrecord_na_num_hours', serviceHours);
  }
}