define([], function () {
    return {
        addMonths: function (date, additionalMonths) {
            var newDate = new Date(date.getTime());
            var day = newDate.getDate();
            newDate.setMonth(newDate.getMonth() + additionalMonths);

            if (newDate.getDate() !== day) {
                newDate.setDate(0);
            }

            return newDate;
        }
    };
});