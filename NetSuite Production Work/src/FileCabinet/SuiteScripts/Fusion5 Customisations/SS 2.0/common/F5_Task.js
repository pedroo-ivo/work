define([
        'N/task',
        './F5_Search',
        './F5_Record',
        './F5_ScriptDeployment'
    ],
    function (task, f5_search, f5_record, f5_scriptDeployment) {
        return {
            submitScheduledScript: function submitScheduledScript(options) {
                options.taskType = task.TaskType.SCHEDULED_SCRIPT;
                var ssTask = task.create(options);
                return ssTask.submit();
            },
            submitMapReduce: function submitMapReduce(options) {
                options.taskType = task.TaskType.MAP_REDUCE;
                var mapReduceTask = task.create(options);
                return mapReduceTask.submit();
            },
            createMapReduce: function createMapReduce(options) {
                options.taskType = task.TaskType.MAP_REDUCE;
                return task.create(options);
            },
            runMapReduce: function runMapReduce(options) {
                try {
                    this.submitMapReduce(options);
                } catch (e) {
                    log.error('runMapReduce error', e);
                    var deploymentId = f5_scriptDeployment.getDeployScriptId(deploymentId);
                    if (deploymentId) {
                        var scriptDeployment = f5_scriptDeployment.copy({id: deploymentId});
                        scriptDeployment.save();
                        options.deploymentId = '';
                        var mapReduceTask = this.submitMapReduce(options);
                        log.error('runMapReduce mapReduceTask', mapReduceTask);
                    }
                }
            }
        };
    });