$(document).ready(function() {
    console.log("ready!");
});

$(function() {
    $("#panel-user-name").text(localStorage.getItem("userEmail"));
    $("body>[data-role='panel']").panel().enhanceWithin();
});

$(document).on('pageshow', '#page_first', function() {
    getUserCredentials();
    $("#panel-user-name").text(localStorage.getItem("userEmail"));
});

$(document).on('pageshow', '#page_home', function() {
    $("#panel-user-name").text(localStorage.getItem("userEmail"));
    var searchTags = [];
    if (localStorage.getItem("search-tags")) {
        searchTags = JSON.parse(localStorage.getItem("search-tags"));
    }
    $("#tags-button").text("Tags (" + searchTags.length + ")");
    getSuggestedHuddles();
});

function getUserCredentials() {
    if (localStorage.getItem("userEmail")) {
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
    $.ajax({
        traditional: true,
        url: "http://huddlesrest.appspot.com/api",
        type: "POST",
        dataType: "json",
        data: {
            "db_function": "addUser",
            "userSkill": [jQuery("#skillone").val(),
                jQuery("#skilltwo").val(),
                jQuery("#skillthree").val(),
            ],
            "userName": jQuery("#textinput-1").val(),
            "userEmail": jQuery("#textinput-2").val(),
            "userPassword": encodeURIComponent(sha256_digest(jQuery("#password").val() + "salt")),
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
            $("#save-1").text("Saved");
            $('#save-1').attr('disabled', 'disabled');
        },
        error: function(request, error) {
            // This callback function will trigger on unsuccessful action
            alert('Network error has occurred please try again!');
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
        var tags = [jQuery("#tagone").val(),
            jQuery("#tagtwo").val(),
            jQuery("#tagthree").val(),
        ];
        data = {
            "db_function": "createHuddle",
            'huddleLocation': [position.coords.latitude, position.coords.longitude],
            'huddleDateAndTime': position.timestamp,
            'huddleTag': tags,
            'huddleName': jQuery("#label_huddlename").val(),
            'huddleAdmin': localStorage.getItem("userEmail"),
        };
        console.log(data);
        $.ajax({
            traditional: true,
            url: "http://huddlesrest.appspot.com/api",
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
                console.log("Huddle created!");
                getSuggestedHuddles();
            },
            error: function(request, error) {
                // This callback function will trigger on unsuccessful action
                alert('Network error has occurred please try again!');
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
    console.log("Getting Huddles!");
    // huddles = "";
    $('#suggestedHuddlesList').empty();
    $.ajax({
        traditional: true,
        url: "http://huddlesrest.appspot.com/api",
        type: "POST",
        dataType: "json",
        data: {
            "db_function": "getSuggestedHuddles",
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
            console.log("Got suggested Huddles!", result);
            $.each(huddles, function(index, value) {
                $('#suggestedHuddlesList').append($('<li/>', { //here appending `<li>`
                    'data-icon': 'huddleicon',
                }).append($('<a/>', { //here appending `<a>` into `<li>`
                    'href': '#' + value,
                    'data-transition': 'slide',
                    'class': 'ui-btn ui-corner-all',
                    'text': value,
                })));

            });
            // $('#suggestedHuddlesList').listview('refresh');
        },
        error: function(request, error) {
            // This callback function will trigger on unsuccessful action
            alert('Network error has occurred please try again!');
        }
    });
}

function getHuddleInfo(huddleName) {
    console.log("Getting Huddle info");
    $.ajax({
        traditional: true,
        url: "http://huddlesrest.appspot.com/api",
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
            console.log("Got Huddle info!", huddles);
            $('#tags_huddle').empty();
            $.each(huddles, function(index, value) {
                $('#tags_huddle').append($('<li/>', { //here appending `<li>`
                    'class': 'ui-first-child ui-last-child',
                }).append("#" + value));

            });
        },
        error: function(request, error) {
            // This callback function will trigger on unsuccessful action
            alert('Network error has occurred please try again!');
        }
    });
}

$(document).on('click', '#suggestedHuddlesList li a', function() {
    $("#heading_huddle").text($(this).text());
    window.location = "#page_huddle";
    getHuddleInfo($(this).text());
    getHuddleUsers();
});

$(document).on('click', '#join_huddle', function() {
    console.log('Joining Huddle');
    $.ajax({
        traditional: true,
        url: "http://huddlesrest.appspot.com/api",
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
            console.log("Joined huddle!", huddle);
            getHuddleUsers();
            $(this).attr('disabled', 'disabled');
        },
        error: function(request, error) {
            // This callback function will trigger on unsuccessful action
            alert('Network error has occurred please try again!');
        }
    });
});

function getHuddleUsers() {
    console.log('Getting Huddle users');
    $.ajax({
        traditional: true,
        url: "http://huddlesrest.appspot.com/api",
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
            console.log("Got Huddle users!", huddleUsers);
            $('#huddle_users').empty();
            $.each(huddleUsers, function(index, value) {
                $('#huddle_users').append($('<li/>', { //here appending `<li>`
                    'class': 'ui-first-child ui-last-child',
                }).append(value));

            });
        },
        error: function(request, error) {
            // This callback function will trigger on unsuccessful action
            alert('Network error has occurred please try again!');
        }
    });
}

$(document).on('click', '#suggested_huddles_link', function() {
    getSuggestedHuddles();
});

$(document).on('click', '#sign-in-button', function() {
    console.log("Signing in");
    $.ajax({
        traditional: true,
        url: "http://huddlesrest.appspot.com/api",
        type: "POST",
        dataType: "json",
        data: {
            "db_function": "authenticateUser",
            "userEmail": encodeURIComponent(jQuery("#loginEmail").val()),
            "userPassword": encodeURIComponent(sha256_digest(jQuery("#loginPass").val() + "salt")),
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
            var huddleUser = result;
            if (huddleUser === null) {
                $('#page_first').trigger("pagecreate");
                $("#login_popup").popup("open");
                return;
            }
            console.log("Authenticated user: " + huddleUser);
            localStorage.setItem("userEmail", huddleUser);
            jQuery("#loginPass").val(null);
            $.mobile.changePage($('#page_home'));
        },
        error: function(request, error) {
            // This callback function will trigger on unsuccessful action
            alert('Network error has occurred please try again!');
        }
    });
});

$(document).on('click', '#sign-up-button', function() {
    console.log("Signing up");
    $.mobile.changePage($('#page_editprofile'));
});

$(document).on('click', '#log-out-button', function() {
    console.log("Loggin out: " + localStorage.getItem("userEmail"));
    localStorage.removeItem("userEmail");
    $.mobile.changePage($('#page_first'));
});

$(document).on('click', "#tags-button", function() {
    console.log(localStorage.getItem("search-tags"));
    $("#search-tag-list").empty();
    if (localStorage.getItem("search-tags")) {
        var searchTags = JSON.parse(localStorage.getItem("search-tags"));
        console.log(searchTags);
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
        $("#search-tag-list").append($('<a/>', { //here appending `<a>` into `<li>`
            'href': '#',
            'data-transition': 'slide',
            'class': 'search-tag ui-btn ui-icon-delete ui-btn-icon-right',
            'text': "#" + jQuery("#tag-input").val(),
        }));
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
    // TODO: Get tags from local storage
    console.log("Remove tag: " + this.text);
    $(this).remove();
    var searchTags = [];
    $.each($('.search-tag'), function(index, value) {
        console.log(value);
        searchTags.push(value.text);
    });
    $("#tags-button").text("Tags (" + searchTags.length + ")");
    localStorage.setItem("search-tags", JSON.stringify(searchTags));
});

$(document).on("change", "#avatar", function() {
    console.log($("#imagePreview").attr("src"));
    var files = !! this.files ? this.files : [];
    if (!files.length || !window.FileReader) return; // no file selected, or no FileReader support

    if (/^image/.test(files[0].type)) { // only image file
        var reader = new FileReader(); // instance of the FileReader
        reader.readAsDataURL(files[0]); // read the local file

        reader.onloadend = function() { // set image data as src
            img_width = $("#imagePreview").width();
            $("#imagePreview").attr('src', this.result);
            $("#imagePreview").attr("width", img_width);
        };
    }
});