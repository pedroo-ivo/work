/**
 * @NApiVersion 2.x
 */
require(['N/datasetLink', 'N/dataset'], function(datasetLink, dataset) {
    // Load the datasets to link
    var caseDataset = dataset.load({
        id: '_f5_testds1case'
    });
    var timeDataset = dataset.load({
        id: '_f5_testds2time'
    });

    // Create expressions for columns in each dataset
    // The alias parameter value represents the alias set
    // on the associated column in the dataset
    var caseExp = caseDataset.getExpressionFromColumn({
        alias: 'internalid'
    });
    var timeExp = timeDataset.getExpressionFromColumn({
        alias: 'custcol_nxc_related_case.internalid'
    });

    // Link the datasets
    var myDatasetLink = datasetLink.create({
        datasets: [caseDataset, timeDataset],
        expressions: [[caseExp, timeExp]],
        id: '_f5_testlinkeddataset'
    });
});