'use strict';

app.masterDetailView = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});

// START_CUSTOM_CODE_masterDetailView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_masterDetailView
(function(parent) {
    var dataProvider = app.data.jsonDataProvider,
        fetchFilteredData = function(paramFilter, searchFilter) {
            var model = parent.get('masterDetailViewModel'),
                dataSource = model.get('dataSource');

            if (paramFilter) {
                model.set('paramFilter', paramFilter);
            } else {
                model.set('paramFilter', undefined);
            }

            if (paramFilter && searchFilter) {
                dataSource.filter({
                    logic: 'and',
                    filters: [paramFilter, searchFilter]
                });
            } else if (paramFilter || searchFilter) {
                dataSource.filter(paramFilter || searchFilter);
            } else {
                dataSource.filter({});
            }
        },
        processImage = function(img) {

            if (!img) {
                var empty1x1png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=';
                img = 'data:image/png;base64,' + empty1x1png;
            }

            return img;
        },
        dataSourceOptions = {
            type: 'json',
            transport: {
                read: {
                    url: dataProvider.url
                }
            },
            error: function(e) {

                if (e.xhr) {
                    alert(JSON.stringify(e.xhr));
                }
            },
            schema: {
                data: 'Activities',
                model: {
                    fields: {
                        'Text': {
                            field: 'Text',
                            defaultValue: ''
                        },
                    },
                    icon: function() {
                        var i = 'globe';
                        return kendo.format('km-icon km-{0}', i);
                    }
                }
            },
            serverFiltering: true,
            serverSorting: true,
            sort: {
                field: 'CreatedAt',
                dir: 'asc'
            },
            serverPaging: true,
            pageSize: 100
        },
        dataSource = new kendo.data.DataSource(dataSourceOptions),
        // start data sources
        // end data sources
        masterDetailViewModel = kendo.observable({
            dataSource: dataSource,
            fixHierarchicalData: function(data) {
                var result = {},
                    layout = {};

                $.extend(true, result, data);

                (function removeNulls(obj) {
                    var i, name,
                        names = Object.getOwnPropertyNames(obj);

                    for (i = 0; i < names.length; i++) {
                        name = names[i];

                        if (obj[name] === null) {
                            delete obj[name];
                        } else if ($.type(obj[name]) === 'object') {
                            removeNulls(obj[name]);
                        }
                    }
                })(result);

                (function fix(source, layout) {
                    var i, j, name, srcObj, ltObj, type,
                        names = Object.getOwnPropertyNames(layout);

                    for (i = 0; i < names.length; i++) {
                        name = names[i];
                        srcObj = source[name];
                        ltObj = layout[name];
                        type = $.type(srcObj);

                        if (type === 'undefined' || type === 'null') {
                            source[name] = ltObj;
                        } else {
                            if (srcObj.length > 0) {
                                for (j = 0; j < srcObj.length; j++) {
                                    fix(srcObj[j], ltObj[0]);
                                }
                            } else {
                                fix(srcObj, ltObj);
                            }
                        }
                    }
                })(result, layout);

                return result;
            },
            itemClick: function(e) {
                var dataItem = e.dataItem || masterDetailViewModel.originalItem;

                app.mobileApp.navigate('#components/masterDetailView/details.html?uid=' + dataItem.uid);

            },
            addClick: function() {
                app.mobileApp.navigate('#components/masterDetailView/add.html');
            },
            editClick: function() {
                var uid = this.originalItem.uid;
                app.mobileApp.navigate('#components/masterDetailView/edit.html?uid=' + uid);
            },
            deleteItem: function() {
                var dataSource = masterDetailViewModel.get('dataSource');

                dataSource.remove(this.originalItem);

                dataSource.one('sync', function() {
                    app.mobileApp.navigate('#:back');
                });

                dataSource.one('error', function() {
                    dataSource.cancelChanges();
                });

                dataSource.sync();
            },
            deleteClick: function() {
                var that = this;

                navigator.notification.confirm(
                    "Are you sure you want to delete this item?",
                    function(index) {
                        //'OK' is index 1
                        //'Cancel' - index 2
                        if (index === 1) {
                            that.deleteItem();
                        }
                    },
                    '', ["OK", "Cancel"]
                );
            },
            detailsShow: function(e) {
                masterDetailViewModel.setCurrentItemByUid(e.view.params.uid);
            },
            setCurrentItemByUid: function(uid) {
                var item = uid,
                    dataSource = masterDetailViewModel.get('dataSource'),
                    itemModel = dataSource.getByUid(item);

                if (!itemModel.Text) {
                    itemModel.Text = String.fromCharCode(160);
                }

                masterDetailViewModel.set('originalItem', itemModel);
                masterDetailViewModel.set('currentItem',
                    masterDetailViewModel.fixHierarchicalData(itemModel));

                return itemModel;
            },
            linkBind: function(linkString) {
                var linkChunks = linkString.split('|');
                if (linkChunks[0].length === 0) {
                    return this.get("currentItem." + linkChunks[1]);
                }
                return linkChunks[0] + this.get("currentItem." + linkChunks[1]);
            },
            imageBind: function(imageField) {
                if (imageField.indexOf("|") > -1) {
                    return processImage(this.get("currentItem." + imageField.split("|")[0]));
                }
                return processImage(imageField);
            },
            currentItem: {}
        });

    parent.set('addItemViewModel', kendo.observable({
        // start add model properties
        // end add model properties
        // start add model functions
        // end add model functions
        onShow: function(e) {
            // Reset the form data.
            this.set('addFormData', {
                radio: '',
                date: '',
                checkbox: '',
                dropdownlist: '',
                textAreaField2: '',
                textField: '',
                // start add form data init
                // end add form data init
            });
            // start add form show
            // end add form show
            //addItemViewModel insert functionality
        },
        onCancel: function() {
            app.clearFormDomData('add-item-view');
        },
        onSaveClick: function(e) {
            var addFormData = this.get('addFormData'),
                filter = masterDetailViewModel && masterDetailViewModel.get('paramFilter'),
                dataSource = masterDetailViewModel.get('dataSource'),
                addModel = {};

            function saveModel(data) {
                // start add form data save
                // end add form data save
                dataSource.add(addModel);
                dataSource.one('change', function(e) {
                    app.mobileApp.navigate('#:back');
                });

                dataSource.sync();
            };

            // on save
            saveModel();
        }
    }));

    parent.set('editItemViewModel', kendo.observable({
        // start edit model properties
        // end edit model properties
        // start edit model functions
        // end edit model functions
        onShow: function(e) {
            var that = this,
                itemUid = e.view.params.uid,
                dataSource = masterDetailViewModel.get('dataSource'),
                itemData = dataSource.getByUid(itemUid),
                fixedData = masterDetailViewModel.fixHierarchicalData(itemData);

            this.set('itemData', itemData);
            this.set('editFormData', {
                fileUpload: '',
                dropdownlist1: '',
                textAreaField3: '',
                textField1: '',
                // start edit form data init
                // end edit form data init
            });
            // start edit form show
            // end edit form show
            //editItemViewModel insert functionality
            app.showFileUploadName('edit-item-view');
        },
        editFormData: {},
        linkBind: function(linkString) {
            var linkChunks = linkString.split(':');
            return linkChunks[0] + ':' + this.get("itemData." + linkChunks[1]);
        },
        onSaveClick: function(e) {
            var that = this,
                editFormData = this.get('editFormData'),
                itemData = this.get('itemData'),
                dataSource = masterDetailViewModel.get('dataSource');

            // edit properties
            // start edit form data save
            // end edit form data save

            function editModel(indexes, data) {
                // edit model save properties
                var fileUploadIndex = indexes.indexOf('fileUploadIndex');
                if (fileUploadIndex >= 0) {
                    itemData.set('undefined', data.Result[fileUploadIndex].Id);
                }
                dataSource.one('sync', function(e) {
                    // start edit form data save success
                    // end edit form data save success

                    app.mobileApp.navigate('#:back');
                });

                dataSource.one('error', function() {
                    dataSource.cancelChanges(itemData);
                });

                dataSource.sync();
            };

            // prepare edit
            var formData = new FormData(),
                fieldsToReUpload = [];
            if ($('#fileUpload')[0].files[0]) {
                fieldsToReUpload.push('fileUploadIndex');
                formData.append("fileUpload", $('#fileUpload')[0].files[0]);
            }
            // formData edit elements
            if (fieldsToReUpload.length === 0) {
                editModel();
            } else {
                $.ajax({
                    url: dataProvider.files.getUploadUrl(), // Url to which the request is send, check http://docs.telerik.com/platform/backend-services/javascript/files/files-upload#upload-files-using-an-html-form
                    type: "POST", // Type of request to be send, called as method
                    data: formData, // Data sent to server, a set of key/value pairs (i.e. form fields and values)
                    contentType: false, // The content type used when sending data to the server.
                    cache: false, // To unable request pages to be cached
                    processData: false, // To send DOMDocument or non processed data file it is set to false
                    success: editModel.bind(this, fieldsToReUpload),
                    error: function(error) {} // A function to be called if request fails
                });
            }
        },
        onCancel: function() {
            app.clearFormDomData('edit-item-view');
        }
    }));

    if (typeof dataProvider.sbProviderReady === 'function') {
        dataProvider.sbProviderReady(function dl_sbProviderReady() {
            parent.set('masterDetailViewModel', masterDetailViewModel);
        });
    } else {
        parent.set('masterDetailViewModel', masterDetailViewModel);
    }

    parent.set('onShow', function(e) {
        var param = e.view.params.filter ? JSON.parse(e.view.params.filter) : null,
            isListmenu = false,
            backbutton = e.view.element && e.view.element.find('header [data-role="navbar"] .backButtonWrapper');

        if (param || isListmenu) {
            backbutton.show();
            backbutton.css('visibility', 'visible');
        } else {
            if (e.view.element.find('header [data-role="navbar"] [data-role="button"]').length) {
                backbutton.hide();
            } else {
                backbutton.css('visibility', 'hidden');
            }
        }

        fetchFilteredData(param);
    });

})(app.masterDetailView);

// START_CUSTOM_CODE_masterDetailViewModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_masterDetailViewModel