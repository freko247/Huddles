$(document).ready(function() {
    console.log("ready!");
    // getLocalSettings();
});

$(function() {
    $("body>[data-role='panel']").panel().enhanceWithin();
});

$(document).on('pageshow', '#page_first', function() {
    getUserCredentials();
});

$(document).on('pageshow', '#page_home', function() {
    getSuggestedHuddles();
});

function getUserCredentials() {
    if (!localStorage.getItem("userEmail")) {
        $("#login_popup").popup("open");
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
                    'data-icon': 'delete',
                    'class': 'ui-first-child ui-last-child',
                }).append($('<a/>', { //here appending `<a>` into `<li>`
                    'href': '#' + value,
                    'data-transition': 'slide',
                    'class': 'ui-btn',
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