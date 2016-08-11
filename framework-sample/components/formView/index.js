'use strict';

app.formView = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});

// START_CUSTOM_CODE_formView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_formView
(function(parent) {
    var formViewModel = kendo.observable({
        fields: {
            checkbox1: '',
            radio1: '',
            heading2: '',
            image2: '',
            group1: '',
            date1: '',
            dropdownlist2: '',
            textField2: '',
        },
        submit: function() {},
        cancel: function() {}
    });

    parent.set('formViewModel', formViewModel);
})(app.formView);

// START_CUSTOM_CODE_formViewModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_formViewModel