APIUrl = "http://huddlesrest.appspot.com/api";

$(document).ready(function() {
    console.log("ready!");
    $(function() {
        $("body>[data-role='panel']").panel().enhanceWithin();
    });
    var onSuccess = function(position) {
        localStorage.setItem("userPosition", JSON.stringify([position.coords.latitude, position.coords.longitude]));
    };

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: ' + error.code + '\n' +
            'message: ' + error.message + '\n');
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
});

document.addEventListener("backbutton", backKeyDown, true);

function backKeyDown() {
    // Call my back key code here.
    console.log("go back!");
}

$(document).on("pageinit", "#page_home", function(event) {
    if (localStorage.getItem("userEmail")) {
        getUserInfo(localStorage.getItem("userEmail"));
    }
});

$(document).on('pageshow', '#page_editprofile', function(event) {
    userSkills = JSON.parse(localStorage.getItem("userSkill"));
    $("#skillone").val(userSkills[0]);
    $("#skilltwo").val(userSkills[1]);
    $("#textinput-1").val(localStorage.getItem("userName"));
    $("#textinput-2").val(localStorage.getItem("userEmail"));
});

$(document).on('pageshow', '#page_first', function() {
    getUserCredentials();
    $("#panel-user-name").text(localStorage.getItem("userName"));
});

$(document).on('pageshow', '#page_home', function() {
    if (!$("#huddle-date").val()) {
        var string_date = $.format.date(new Date(), "yyyy-MM-dd");
        $("#huddle-date").val(string_date);
        console.log("setting date to: " + string_date);
    }
    $("#panel-user-name").text(localStorage.getItem("userName"));
    var searchTags = [];
    if (localStorage.getItem("search-tags")) {
        searchTags = JSON.parse(localStorage.getItem("search-tags"));
    }
    $("#tags-button").text("Tags (" + searchTags.length + ")");
    getSuggestedHuddles();
});

function getUserCredentials() {
    if (localStorage.getItem("userEmail")) {
        getUserInfo(localStorage.getItem("userEmail"));
        $("#panel-user-name").text(localStorage.getItem("userName"));
        $.mobile.changePage($('#page_home'));
    }
}

function getLocalSettings() {
    if (!localStorage.getItem("userEmail")) {
        alert("Is this your first time using Huddles? Please enter user information...");
        window.location = "#page_editprofile";
    }
}

function addUser() {
    localStorage.setItem("userEmail", jQuery("#textinput-2").val());
    data = {
        "db_function": "addUser",
        "userSkill": [jQuery("#skillone").val(),
            jQuery("#skilltwo").val(),
            jQuery("#skillthree").val(),
        ],
        "userName": jQuery("#textinput-1").val(),
        "userEmail": jQuery("#textinput-2").val(),
        "userPassword": encodeURIComponent(sha256_digest(jQuery("#new_password").val() + "salt")),
        "userAvatar": localStorage.getItem("userAvatar"),
    };
    $.ajax({
        traditional: true,
        url: APIUrl,
        type: "POST",
        dataType: "json",
        data: data,
        beforeSend: function() {
            // This callback function will trigger before data is sent
            $.mobile.loading('show');
        },
        complete: function() {
            // This callback function will trigger on data sent/received complete
            $.mobile.loading('hide');
        },
        success: function(result) {
            $("#save-1").text("Saved");
            $('#save-1').attr('disabled', 'disabled');
        },
        error: function(request, error) {
            // This callback function will trigger on unsuccessful action
            alert('No network connection to server. Check your connection and try again or try again later');
        }
    });
}

function addSkill() {
    $('#skill-list').append($('<li/>', { //here appending `<li>`
        'data-icon': 'delete',
        'class': 'skill-item',
    }).append($('<a/>', { //here appending `<a>` into `<li>`
        'href': '#',
        'data-transition': 'slide',
        'text': jQuery("#skill-control-group").val()
    })));

    // $('ul').listview('refresh');
}

function addHuddleTag() {
    $('#huddle-tag-list').append($('<li/>', { //here appending `<li>`
        'data-icon': 'delete',
        'class': 'huddle-tag-item',
    }).append($('<a/>', { //here appending `<a>` into `<li>`
        'href': '#',
        'data-transition': 'slide',
        'text': jQuery("#huddle-tag-control-group").val()
    })));

    // $('ul').listview('refresh');
}

function createHuddle() {
    var onSuccess = function(position) {
        var huddleName = jQuery("#label_huddlename").val();
        var tags = [];
        $.each([jQuery("#tagone").val(),
            jQuery("#tagtwo").val(),
            jQuery("#tagthree").val(),
        ], function(index, value) {
            if (value) {
                tags.push('#' + value);
            }
        });
        data = {
            "db_function": "createHuddle",
            'huddleLocation': [position.coords.latitude, position.coords.longitude],
            'huddleDateAndTime': position.timestamp,
            'huddleTag': tags,
            'huddleName': huddleName,
            'huddleAdmin': localStorage.getItem("userEmail"),
        };
        $.ajax({
            traditional: true,
            url: APIUrl,
            type: "POST",
            dataType: "json",
            data: data,
            beforeSend: function() {
                // This callback function will trigger before data is sent
                $.mobile.loading('show');
            },
            complete: function() {
                // This callback function will trigger on data sent/received complete
                $.mobile.loading('hide');
            },
            success: function(result) {
                setTimeout(function() {}, 1000);
                $("#heading_huddle").text(huddleName);
                getHuddleInfo(huddleName);
                getHuddleUsers();
                $.mobile.changePage($('#page_huddle'));
            },
            error: function(request, error) {
                // This callback function will trigger on unsuccessful action
                alert('No network connection to server. Check your connection and try again or try again later');
            }
        });
    };

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: ' + error.code + '\n' +
            'message: ' + error.message + '\n');
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

function getSuggestedHuddles() {
    $('#suggestedHuddlesList').empty();
    var filterDistance = "";
    var userLocation = JSON.parse(localStorage.getItem("userPosition"));
    if ($("#rangecheck").is(":checked")) {
        filterDistance = ($("#rangeslider").val() + ".0");
    }
    var huddleDate = "";
    if ($("#timecheck").is(":checked")) {
        huddleDate = $("#huddle-date").val();
    }
    var searchTags = "";
    if ($("#tagscheck").is(":checked")) {
        searchTags = localStorage.getItem("search-tags");
    }
    $.ajax({
        traditional: true,
        url: APIUrl,
        type: "POST",
        dataType: "json",
        data: {
            "db_function": "getSuggestedHuddles",
            "filterDistance": filterDistance,
            "userLocation": userLocation,
            "searchTags": searchTags,
            "huddleDate": huddleDate,
        },
        beforeSend: function() {
            // This callback function will trigger before data is sent
            $.mobile.loading('show');
        },
        complete: function() {
            // This callback function will trigger on data sent/received complete
            $.mobile.loading('hide');
        },
        success: function(result) {
            var huddles = result[0];
            $.each(huddles, function(index, value) {
                var tags = "";
                if (value) {
                    $.each(value[1], function(index, tag) {
                        tags += '<strong>' + tag + '</strong><br>';
                    });
                    $('#suggestedHuddlesList').append($('<li/>', { //here appending `<li>`
                        'data-icon': 'huddleicon',
                        'text': value[0],
                    }).html(
                        '<div class="huddle-item">' +
                        '<div class="ui-grid-solo">' +
                        '<h2><u>' + value[0] + '</u></h2>' +
                        '<div class="ui-block-a">' +
                        '</div>' +
                        '</div>' +
                        '<div class="ui-grid-a">' +
                        '<div class="ui-block-a">' +
                        '<p>' +
                        tags +
                        '</p>' +
                        '</div>' +
                        '<div class="ui-block-b">' +
                        '<p>' +
                        '<strong>Lat: ' + value[2][0] + '</strong><br>' +
                        '<strong>Lon: ' + value[2][1] + '</strong><br>' +
                        '<strong>Created: ' + value[3] + '</strong><br>' +
                        '</p>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<hr class="list-divider">'
                    ));
                }
            });
            if (huddles.length === 0) {
                $('#suggestedHuddlesList').append($('<div/>', { //here appending `<li>`
                    'class': 'ui-grid-solo',
                }).html(
                    '<h3>Sorry no matches found</h3>' +
                    '<p>Please try the manual filter, and help us improve the search algorithm.</p>' +
                    '</div>'
                ));
            }
        },
        error: function(request, error) {
            // This callback function will trigger on unsuccessful action
            alert('No network connection to server. Check your connection and try again or try again later');
        }
    });
}

function getHuddleInfo(huddleName) {
    $.ajax({
        traditional: true,
        url: APIUrl,
        type: "POST",
        dataType: "json",
        data: {
            "db_function": "getHuddleInfo",
            "huddleName": encodeURIComponent(huddleName),
        },
        beforeSend: function() {
            // This callback function will trigger before data is sent
            $.mobile.loading('show');
        },
        complete: function() {
            // This callback function will trigger on data sent/received complete
            $.mobile.loading('hide');
        },
        success: function(result) {
            var huddles = result;
            $('#tags_huddle').empty();
            // Response is [huddleName, [huddleTag], [huddle.lat, huddle.lon], huddleDateAndTime]
            if (huddles) {
                $.each(huddles[1], function(index, value) {
                    $('#tags_huddle').append($('<li/>', { //here appending `<li>`
                        'class': 'ui-first-child ui-last-child',
                    }).append(value));

                });
            }
        },
        error: function(request, error) {
            // This callback function will trigger on unsuccessful action
            alert('No network connection to server. Check your connection and try again or try again later');
        }
    });
}

$(document).on('click', '#suggestedHuddlesList li div', function() {
    $("#heading_huddle").text($('h2', this).text());
    getHuddleInfo($('h2', this).text());
    getHuddleUsers();
    $.mobile.changePage($('#page_huddle'));
    $(document).one("pagechange", function() {
        $.mobile.changePage('#page_huddle');
    });
});

$(document).on('click', '#join_huddle', function() {
    $.ajax({
        traditional: true,
        url: APIUrl,
        type: "POST",
        dataType: "json",
        data: {
            "db_function": "joinHuddle",
            "huddleName": encodeURIComponent(jQuery("#heading_huddle").text()),
            "huddleUser": encodeURIComponent(localStorage.getItem("userEmail")),
        },
        beforeSend: function() {
            // This callback function will trigger before data is sent
            $.mobile.loading('show');
        },
        complete: function() {
            // This callback function will trigger on data sent/received complete
            $.mobile.loading('hide');
        },
        success: function(result) {
            var huddle = result;
            getHuddleUsers();
            $(this).attr('disabled', 'disabled');
        },
        error: function(request, error) {
            // This callback function will trigger on unsuccessful action
            alert('No network connection to server. Check your connection and try again or try again later');
        }
    });
});

function getHuddleUsers() {
    $.ajax({
        traditional: true,
        url: APIUrl,
        type: "POST",
        dataType: "json",
        data: {
            "db_function": "getHuddleUsers",
            "huddleName": encodeURIComponent(jQuery("#heading_huddle").text()),
        },
        beforeSend: function() {
            // This callback function will trigger before data is sent
            $.mobile.loading('show');
        },
        complete: function() {
            // This callback function will trigger on data sent/received complete
            $.mobile.loading('hide');
        },
        success: function(result) {
            var huddleUsers = result;
            $('#huddle_users').empty();
            if (huddleUsers) {
                $.each(huddleUsers, function(index, value) {
                    var userSkills = "";
                    if (value[1]) {
                        $.each(value[1], function(index, value) {
                            if (value) {
                                userSkills += "#" + value + '</br>';
                            }
                        });
                    }
                    $('#huddle_users').append($('<li/>', { //here appending `<li>`
                        'class': 'ui-first-child ui-last-child',
                    }).html('<div>' +
                        '<h3>' + value[0] + '</h3>' +
                        '<p>' + userSkills + '</p>' +
                        '</div>'
                    ));
                });
            }
        },
        error: function(request, error) {
            // This callback function will trigger on unsuccessful action
            alert('No network connection to server. Check your connection and try again or try again later');
        }
    });
}

$(document).on('click', '#suggested_huddles_link', function() {
    getSuggestedHuddles();
});

$(document).on('click', '#sign-in-button', function() {
    $.ajax({
        traditional: true,
        url: APIUrl,
        type: "POST",
        dataType: "json",
        data: {
            "db_function": "authenticateUser",
            "userEmail": encodeURIComponent(jQuery("#loginEmail").val()),
            "userPassword": sha256_digest(jQuery("#loginPass").val() + "salt"),
        },
        beforeSend: function() {
            // This callback function will trigger before data is sent
            $.mobile.loading('show');
        },
        complete: function() {
            // This callback function will trigger on data sent/received complete
            $.mobile.loading('hide');
        },
        success: function(result) {
            jQuery("#loginPass").val(null);
            var huddleUser = result;
            if (huddleUser) {
                localStorage.setItem("userEmail", huddleUser);
                getUserCredentials();
                $.mobile.changePage($('#page_home'));
            }
        },
        error: function(request, error) {
            // This callback function will trigger on unsuccessful action
            alert('No network connection to server. Check your connection and try again or try again later');
        }
    });
});

$(document).on('click', '#sign-up-button', function() {
    $.mobile.changePage($('#page_editprofile'));
});

$(document).on('click', '#log-out-button', function() {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userSkill");
    localStorage.removeItem("userAvatar");
    $.mobile.changePage($('#page_first'));
});

$(document).on('click', "#tags-button", function() {
    $("#search-tag-list").empty();
    if (localStorage.getItem("search-tags")) {
        var searchTags = JSON.parse(localStorage.getItem("search-tags"));
        $.each(searchTags, function(index, value) {
            $("#search-tag-list").append($('<a/>', { //here appending `<a>` into `<li>`
                'href': '#',
                'data-transition': 'slide',
                'class': 'search-tag ui-btn ui-icon-delete ui-btn-icon-right',
                'text': value,
            }));
        });
    }
});

$(document).on('click', "#add-tag-button", function() {
    var searchTags = [];
    if (jQuery($("#tag-input").val())) {
        $("#search-tag-list").append($('<li/>', {
            'data-icon': 'delete',
            'data-transition': 'slide',
            'class': 'search-tag ui-first-child ui-last-child',
        }).append($('<a/>', {
            'class': 'ui-btn ui-btn-icon-right ui-icon-delete',
            'text': "#" + jQuery("#tag-input").val(),
        })));
        if (localStorage.getItem("search-tags")) {
            searchTags = JSON.parse(localStorage.getItem("search-tags"));
        }
        searchTags.push("#" + $("#tag-input").val());
        $("#tags-button").text("Tags (" + searchTags.length + ")");
        localStorage.setItem("search-tags", JSON.stringify(searchTags));
        $("#tag-input").val(null);
    }
});

$(document).on('click', ".search-tag", function() {
    $(this).remove();
    var searchTags = [];
    $.each($('.search-tag'), function(index, value) {
        searchTags.push(value.text);
    });
    localStorage.setItem("search-tags", JSON.stringify(searchTags));
});

$(document).on("change", "#avatar", function() {
    var files = !! this.files ? this.files : [];
    if (!files.length || !window.FileReader) return; // no file selected, or no FileReader support

    if (/^image/.test(files[0].type)) { // only image file
        var reader = new FileReader(); // instance of the FileReader
        reader.readAsDataURL(files[0]); // read the local file

        reader.onloadend = function() { // set image data as src
            localStorage.setItem("userAvatar", this.result);
            setAvatar(this.result);
        };
    }
});

function setAvatar(img) {
    img_width = $("#imagePreview").width();
    $("#imagePreview").attr('src', img);
    $("#imagePreview").attr("width", img_width);
}

function getUserInfo() {
    var img = "";
    $.ajax({
        traditional: true,
        url: APIUrl,
        type: "POST",
        dataType: "json",
        data: {
            "db_function": "getUserInfo",
            "userEmail": localStorage.getItem("userEmail"),
        },
        beforeSend: function() {
            // This callback function will trigger before data is sent
            $.mobile.loading('show');
        },
        complete: function() {
            // This callback function will trigger on data sent/received complete
            $.mobile.loading('hide');
        },
        success: function(result) {
            userInfo = result;
            if (userInfo) {
                localStorage.setItem("userName", userInfo[0]);
                localStorage.setItem("userSkill", JSON.stringify(userInfo[1]));
                setAvatar(userInfo[2]);
            }
        },
        error: function(request, error) {
            // This callback function will trigger on unsuccessful action
            alert('No network connection to server. Check your connection and try again or try again later');
        }
    });
}

$(document).on('click', '#create-huddle-submit', function() {
    createHuddle();
});

$(document).on('click', "#update-suggested-huddles", function() {
    getSuggestedHuddles();
});

$(document).on('click', "#cancel-filter", function() {
    $("#filter-fieldset").collapsible("collapse");
});

$(document).on('click', "#tagscheck", function() {
    $('#tagscheck').hide();
});

$(document).on('click', "#peter-poppy", function() {
    $('#panel_chat').empty();
    $('#panel_chat').append(generatePMChat());
    $("[data-role=panel]").trigger('pagecreate');
    $("[data-role='panel']").panel().enhanceWithin();
});

$(document).on('click', '#chat_back', function() {
    $('#panel_chat').empty();
    $('#panel_chat').append(generateChats());
    $('[data-role=page]').trigger('pagecreate');
    $("[data-role='panel']").panel().enhanceWithin();
});

function generateChats() {
    var listview = '<ul data-role="listview" id="chat-list">' +
        '<li data-role="list-divider">PERSONAL CHAT(S)</li>' +
        '<li><a href="#" id="peter-poppy" class="ui-btn">Peter Poppy</a></li>' +
        '<li><a href="#" class="ui-btn">James Hendry</a></li>' +
        '<li><a href="#" class="ui-btn">Felix Tops</a></li>' +
        '<li data-role="list-divider">GROUP CHAT(S)</li>' +
        '<li><a href="#" class="ui-btn">Group 1337</a></li>' +
        '<li><a href="#" class="ui-btn">Group freako</a></li>' +
        '<li><a href="#" class="ui-btn">Group zeliax</a></li>' +
        '<li data-role="list-divider">HUDDLE CHAT(S)</li>' +
        '<li><a href="#" class="ui-btn">Mobile Application Prototyping</a></li>' +
        '<li><a href="#" class="ui-btn">Agile Digital Media Engineering</a></li>' +
        '</ul>';
    return listview;
}

function generatePMChat() {
    var chat = '<div data-role="header">' +
        '<a href="#" id="chat_back" class="ui-btn ui-icon-back ui-btn-icon-notext ui-corner-all">No text</a>' +
        '<h2>Peter Poppy</h2>' +
        '</div>' +
        '<div role="main" class="ui-content jqm-content jqm-fullwidth" data-theme="a">' +
        '<ul data-role="listview">' +
        '<li>' +
        '<h2>Peter Poppy</h2>' +
        '<p>Whats up bro?</p>' +
        '</li>' +
        '<li>' +
        '<h2>Me:</h2>' +
        '<p>Not much buddy..</p>' +
        '</li>' +
        '</ul>' +
        '<label for="input_box">Input</label>' +
        '<textarea name="input_box" id="input_box"></textarea>' +
        '<a href="#" class="ui-btn ui-corner-all">Send</a>' +
        '</div>';
    return chat;
}