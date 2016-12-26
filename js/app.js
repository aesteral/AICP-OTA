/*global console, window, jQuery, alert*/

/**
 * Created by eboye on 3/15/15.
 */

/* Configuration */
(function ($) {
    'use strict';
    //noinspection JSUnresolvedVariable
    var noDataMessage = 'No data provided!',
        noDeviceMessage = 'You have to specify device name!',
        domain = location.href.replace(location.hash, ""),
        config = '/config/devices.json',
        deviceImages = '/imgs/devices/',
        oemCheck = '',
        // proxy = 'https://crossorigin.me/',
        proxy = 'http://cors-anywhere.herokuapp.com/',
        aicpAPI = proxy + 'http://updates.aicp-rom.com/update.php',
        storage = $.localStorage,
        graphHeight = 30;

    /* Main Functions */

    /* Colored ConsoleLog */

    function log(msg, color) {
        color = color || "black";
        var bgc = "White";
        switch (color) {
        case "success":
            color = "Green";
            bgc = "LimeGreen";
            break;
        case "info":
            color = "DodgerBlue";
            bgc = "Turquoise";
            break;
        case "error":
            color = "Red";
            bgc = "Black";
            break;
        case "start":
            color = "OliveDrab";
            bgc = "PaleGreen";
            break;
        case "warning":
            color = "Tomato";
            bgc = "Black";
            break;
        case "end":
            color = "Orchid";
            bgc = "MediumVioletRed";
            break;
        default: //noinspection SillyAssignmentJS
            color = color;
        }

        if (typeof msg === "object") {
            console.log(msg);
        } else if (typeof color === "object") {
            console.log("%c" + msg, "color: PowderBlue;font-weight:bold; background-color: RoyalBlue;");
            console.log(color);
        } else {
            console.log("%c" + msg, "color:" + color + ";font-weight:bold; background-color: " + bgc + ";");
        }
    }

    /* HomePage Rendering of Cards */

    var homePageRender = function (data) {
            if (!data) {
                console.log(noDataMessage);
            } else {

                /* Sort array by OEMs then by name */

                /** @namespace data.devices */
                /** @namespace data.codename */
                /** @namespace data.OEM */
                var sortBy = 'OEM',
                    thenBy = 'name',
                    deviceThumb,
                    oemHeader,
                    i,
                    devices = data.devices.sort(function (a, b) {
                        if (a[sortBy] === b[sortBy]) {
                            if (a[sortBy] === b[sortBy]) {

                                if (a[thenBy] === b[thenBy]) {
                                    return 0;
                                } else if (a[thenBy] < b[thenBy]) {
                                    return -1;
                                } else {
                                    return 1;
                                }

                            }
                        } else if (a[sortBy] < b[sortBy]) {
                            return -1;
                        } else {
                            return 1;
                        }
                    });

                for (i = 0; i < devices.length; i += 1) {

                    /* Make device card */

                    deviceThumb = '<div data-codename="' + devices[i].codename + '" class="modal-btn col-xs-12 col-sm-6 col-md-3">' +
                        '<div class="thumbnail">' +
                        '<img src="' + domain + deviceImages + devices[i].codename + '.jpg" alt="">' +
                        '<div class="caption">' +
                        '<h5>' + devices[i].name + '<small><br>made by <strong>' + devices[i].OEM + '</strong></small></h5>' +
                        '<h6>codename: <span class="label label-primary">' + devices[i].codename + '</span></h6>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    oemHeader = '<div class="clearfix"></div>' +
                        '<div class="page-header container">' +
                        '<h3 class="anchor-fix" id="' + devices[i].OEM.toLowerCase() + '">' + devices[i].OEM + '</h3>' +
                        '</div>' +
                        '<div class="clearfix"></div>';

                    /* Check if new OEM starts and add heading */

                    if (oemCheck !== devices[i].OEM) {

                        /* Make scroll buttons */
                        $('#devicechoose').append('<a class="btn btn-default btn-lg" href="#' + devices[i].OEM.toLowerCase() + '" role="button">' + devices[i].OEM + '</a>');


                        $('#thumbnail-devices').append(oemHeader).append(deviceThumb);
                    } else {
                        $('#thumbnail-devices').append(deviceThumb);
                    }

                    oemCheck = devices[i].OEM;

                }

            }

            return true;

        },

        /* Make Modal with data provided */

        makeModal = function (data, deviceName, deviceHeader) {
            if (data === 'error') {
                log(noDataMessage, 'error');
                $('#modal').modal().find('.modal-body').html('There was an error connecting AICP servers');
                $('#downloadModal').html('<h5>No OTAs found, sorry!</h5>');
            } else if (!data || data === '' || data.error === 'Nothing found') {
                log(noDataMessage, 'error');
                $('#modal').modal().find('.modal-body').html('No data provided');
                $('#downloadModal').html('<h5>No OTAs found, sorry!</h5>');
            } else {

                /** @namespace data.updates */
                var updates = data.updates,
                    deviceTable = '',
                    i,
                    currentSize,
                    tr,
                    date,
                    year,
                    month,
                    day,
                    time,
                    updateRow,
                    sizes = $.map(updates, function (updates) {
                        return updates.size;
                    }),
                    maxSize = Math.max.apply(this, sizes),
                    minSize = Math.min.apply(this, sizes),
                    difference = maxSize - minSize;

                for (i = 0; i < updates.length; i += 1) {

                    /* Graph Drawing */

                    currentSize = updates[i].size;

                    if (i < 12) {

                        $('.graph .bar' + i).height((maxSize - currentSize) * (difference / graphHeight) + 20).text(currentSize);
                    }

                    tr = '<tr data-url="' + updates[i].url + '">';
                    date = updates[i].name.slice(-12, -4);
                    year = date.slice(0, 4);
                    month = date.slice(4, 6);
                    day = date.slice(6, 8);
                    time = day + '/' + month + '/' + year;

                    if (updates[i].version.toLowerCase().indexOf('experimental') >= 0) {
                        tr = '<tr data-url="' + updates[i].url + '" class="danger">';
                    } else if (updates[i].version.toLowerCase().indexOf('nightly') >= 0) {
                        tr = '<tr data-url="' + updates[i].url + '" class="warning">';
                    } else if (updates[i].version.toLowerCase().indexOf('release') >= 0) {
                        tr = '<tr data-url="' + updates[i].url + '" class="success">';
                    }

                    /** @namespace updates.md5 */
                    updateRow = tr +
                        '<td class="dload"><strong>' + time + '</strong></td>' +
                        '<td class="dload">' + updates[i].version + '</td>' +
                        '<td class="dload">' + updates[i].name + '</td>' +
                        '<td class="dload"><strong>' + currentSize + ' MB</strong></td>' +
                        '<td class="dload">' + updates[i].md5 + '</td>' +
                        '<td><a href="' + updates[i].url + '" class="btn btn-sm btn-default">D/L</a></td>' +
                        '</tr>';

                    deviceTable = deviceTable + updateRow;

                }

                deviceTable = '<div class="table-responsive"><table class="table table-condensed table-hover">' +
                    '<tr><th>Date</th><th>Version</th><th>Filename</th><th>Size</th><th>md5</th><th>D/L</th></tr>' +
                    deviceTable + '</table></div>';

                $('#modal').modal().find('.modal-body').html(deviceTable);
                $('#downloadModal').html(deviceHeader);

            }

            log('Modal width data for ' + deviceName + ' opened', 'success');
            return true;

        },

        /* Get Data from local storage */

        getLocalStorage = function (devicename) {
            if (!devicename) {

                log(noDeviceMessage, 'error');
                return false;

            } else {

                log(devicename + ' data retrived from localstorage', 'success');
                var theData = storage.get(devicename);
                log(theData);
                return storage.get(theData);

            }

        },

        /* Store data locally */

        storeLocally = function (devicename, data) {
            if (data && devicename) {

                storage.set(devicename, data);
                storage.set(devicename + '-timestamp', $.now());

                log('Stored info of ' + devicename + ' to localStorage', 'success');
                return true;

            } else if (!devicename) {

                log(noDeviceMessage, 'error');
                return false;

            } else if (!data) {

                log(noDataMessage, 'error');
                return false;
            } else {
                return false;
            }

        },

        /* Get fresh data from server and make modal */

        modalWithNewData = function (deviceToGrab, deviceHeader) {
            if (!deviceToGrab) {
                log(deviceToGrab, 'error');
            } else {

                //noinspection JSUnusedGlobalSymbols
                $.ajax({
                    url: aicpAPI,
                    type: 'GET',
                    dataType: 'json',
                    async: true,
                    contentType: 'application/x-www-form-urlencoded; charset=utf-8',
                    data: {
                        'device': deviceToGrab
                    },
                    xhrFields: {
                        onprogress: function (e) {

                            /** @namespace e.lengthComputable */
                            /** @namespace e.loaded */
                            /** @namespace e.total */
                            if (e.lengthComputable) {
                                log(e.loaded / e.total * 100 + '%');
                            }
                        }
                    },
                    success: function (data) {
                        makeModal(data, deviceToGrab, deviceHeader);
                        storeLocally(deviceToGrab, data);

                    },
                    error: function (e) {
                        makeModal('error', null, null);
                        log(e.message, 'error');
                    }
                });

            }

        };

    /* OTA page only */

    if ($('body').hasClass('ota')) {

        $.getJSON(domain + config, function (data) {
            homePageRender(data);
        });

        $(document).on('click', '.modal-btn', function () {

            var deviceToGrab = $(this).attr('data-codename'),
                deviceHeader = $(this).find('.caption').html(),
                localData = getLocalStorage(deviceToGrab),
                deviceDataLastChecked = $.now() - storage.get(deviceToGrab + '-timestamp');

            if (localData !== null && (deviceDataLastChecked !== undefined || deviceDataLastChecked < 3600000)) { /* One hour is 3600000 ms */

                makeModal(localData, deviceToGrab, deviceHeader);

            } else {

                modalWithNewData(deviceToGrab, deviceHeader);

            }
            //noinspection JSUnresolvedVariable,JSLint
            var _gaq = _gaq || [];
            _gaq.push(['_setAccount', 'UA-71822266-1']);
            _gaq.push(['_trackPageview', deviceToGrab]);

        });

        $(document).on('click', '.modal tr .dload', function () {
            var downloadLink = $(this).parent().attr('data-url');
            window.open(downloadLink, '_blank');
        });

    }
}(jQuery));