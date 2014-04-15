function addUser() {
    $.ajax({
        traditional: true,
        // url: 'http://localhost:8080/api',
        url: 'http://huddlesrest.appspot.com/api',
        type: 'POST',
        dataType: 'json',
        data: {
            'db_function': 'addUser',
            'userEmail': 'user@mail.com',
            'userName': 'John Doe',
            'userSkill': ['Python', 'Android', ],
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
        },
        error: function(request, error) {
            // This callback function will trigger on unsuccessful action
            alert('Network error has occurred please try again!');
        }
    });
}