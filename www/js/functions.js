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
    $('ul').append($('<li/>', { //here appending `<li>`
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
    $(this).remove();
}