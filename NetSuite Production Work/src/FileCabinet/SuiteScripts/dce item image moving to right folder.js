/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/file', 'N/log', 'N/search', 'N/runtime'], function(file, log, search, runtime) {

    function beforeSubmit(context) {
        try {
            if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT) return;

            var newRecord = context.newRecord;
            var fieldId = 'custitem_atlas_item_image';
            var fileId = newRecord.getValue({ fieldId: fieldId });

            if (!fileId) return;

            var imageFile = file.load({ id: fileId });
            var currentFolderId = imageFile.folder;
            var correctFolderId = 1532844;

            if (currentFolderId !== correctFolderId) {
                var itemName = newRecord.getValue({ fieldId: 'itemid' });
                var extension = imageFile.name.split('.').pop();
                var newFileName = itemName + '.' + extension;

                var newFile = file.create({
                    name: newFileName,
                    fileType: imageFile.fileType,
                    contents: imageFile.getContents(),
                    folder: correctFolderId
                });

                var newId = newFile.save();
                newRecord.setValue({ fieldId: fieldId, value: newId });
                file.delete({ id: fileId });

                var oldFolderName = getFolderName(currentFolderId);
                var newFolderName = getFolderName(correctFolderId);
                var userName = runtime.getCurrentUser().name;

                log.audit('Imagem movida e renomeada', 
                    'Usuário: ' + userName + '\n' +
                    'Arquivo movido de "' + oldFolderName + '" para "' + newFolderName + '"\n' +
                    'Novo nome: ' + newFileName + ' | Novo ID: ' + newId);
            }
        } catch (e) {
            log.error('Erro ao processar imagem', e.message);
        }
    }

    function getFolderName(folderId) {
        var folderSearch = search.lookupFields({
            type: search.Type.FOLDER,
            id: folderId,
            columns: ['name']
        });
        return folderSearch.name || 'Desconhecido';
    }

    return {
        beforeSubmit: beforeSubmit
    };
});
