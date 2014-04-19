function addUser() {
    $.ajax({
        traditional: true,
        // url: 'http://localhost:8080/api',
        url: 'http://huddlesrest.appspot.com/api',
        type: 'POST',
        dataType: 'json',
        data: {
            "db_function": "addUser",
            "userName": jQuery("#textinput-1").val(),
            "userEmail": jQuery("#textinput-2").val(),
            "userPassword": sha256_digest(jQuery("#password").val() + "salt"),
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
        'onclick': 'removeSkill()',
        'data-transition': 'slide',
        'text': jQuery("#skill-control-group").val()
    })));

    $('ul').listview('refresh');
}

function removeSkill() {
    $(this).closest('li').remove();
    $('ul').listview('refresh');
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

    $('ul').listview('refresh');
}

function createHuddle() {
    var onSuccess = function(position) {
        alert('Latitude: ' + position.coords.latitude + '\n' +
            'Longitude: ' + position.coords.longitude + '\n' +
            'Altitude: ' + position.coords.altitude + '\n' +
            'Accuracy: ' + position.coords.accuracy + '\n' +
            'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
            'Heading: ' + position.coords.heading + '\n' +
            'Speed: ' + position.coords.speed + '\n' +
            'Timestamp: ' + new Date(position.timestamp) + '\n');
    };

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: ' + error.code + '\n' +
            'message: ' + error.message + '\n');
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}