function initDB() {
    var db = window.openDatabase("Database", "1.0", "Huddles db", 200000);
    db.transaction(populateDB);
}

function populateDB(tx) {
    tx.executeSql('DROP TABLE IF EXISTS USER');
    tx.executeSql('CREATE TABLE IF NOT EXISTS USER (userEmail, active)');
    tx.executeSql('SELECT userEmail FROM user WHERE active = "X"', [], function(tx, results) {
        if (results.rows.length < 1) {
            alert("Is this your first time using Huddles? Please enter user information...");
            window.location = "#profile";
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
        var tags = [];
        $('#huddle-tag-list li').each(function() {
            tags.push($(this).text());
        });
        data = {
            'huddlePosition': [position.coords.latitude, position.coords.longitude],
            'huddleTimestamp': position.timestamp,
            'huddleTag': tags,
            'huddleName': jQuery("#textinput-1").val(),
        };
        console.log(data);
        // alert(data);
    };

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: ' + error.code + '\n' +
            'message: ' + error.message + '\n');
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}