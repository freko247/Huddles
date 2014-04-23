function initDB() {
    db.transaction(populateDB);
}

function populateDB(tx) {
    tx.executeSql('DROP TABLE IF EXISTS USER');
    tx.executeSql('CREATE TABLE IF NOT EXISTS USER (userEmail, active)');
    tx.executeSql('SELECT userEmail FROM user WHERE active = "X"', [], function(tx, results) {
        if (results.rows.length < 1) {
            alert("Is this your first time using Huddles? Please enter user information...");
            window.location = "#page_editprofile";
        } else {
            alert(results.rows.length);
        }
    });
}

function errorCB(err) {
    alert("Error processing SQL: " + err.code + err.message);
}

function successCB() {
    return;
}

function addUser() {
    var db = window.openDatabase("Database", "1.0", "Huddles db", 200000);
    db.transaction(function(tx) {
        var userEmail = jQuery("#textinput-2").val();
        tx.executeSql('INSERT OR REPLACE INTO USER (userEmail, active) VALUES ("' + userEmail + '", "X")');
    }, errorCB);
    db.transaction(function(tx) {
        tx.executeSql('SELECT userEmail FROM user WHERE active = "X"', [], function(tx, results) {
            $('#first').popup("open");
        });
    });
    $.ajax({
        traditional: true,
        url: "http://huddlesrest.appspot.com/api",
        type: "POST",
        dataType: "json",
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
        'data-transition': 'slide',
        'text': jQuery("#skill-control-group").val()
    })));

    $('ul').listview('refresh');
}


// $('#skill-list li').click(function) {
//     $(this).remove()
// }
// $('ul').listview('refresh');

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
        var tags = [jQuery("#tagone").val(),
            jQuery("#tagtwo").val(),
            jQuery("#tagthree").val(),
        ];
        // $('#huddle-tag-list input').each(function() {
        //     tags.push($(this).val());
        // });
        data = {
            "db_function": "createHuddle",
            'huddleLocation': [position.coords.latitude, position.coords.longitude],
            'huddleDateAndTime': position.timestamp,
            'huddleTag': tags,
            'huddleName': jQuery("#label_huddlename").val(),
            'huddleAdmin': "admin@huddles.com",
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
                console.log("Huddle created!")
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