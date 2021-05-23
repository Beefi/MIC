$(document).ready(function () {
    $('#username').keyup(function () {
        var username = $('#username').val();
        $.get('/getCheckUsername', {username: username}, function (result) {
            if(result.username == username) {
                $('#username').css('background-color', 'red');
                $('#submit').prop('disabled', true);
            }
            else {
                $('#username').css('background-color', '#E3E3E3');
                $('#submit').prop('disabled', false);
            }
        });
    });
    $("#password").keyup(function() 
    {
        var password = $("#password").val();
        $.get('/getCheckPassword', {password: password}, function(result) {
            if(result.password == password) {
                $("#password").css("background-color", "red");
                $("#submit").prop("disabled", true);
            }
            else {
                $("#password").css("background-color", "white");
                $("#submit").prop("disabled", false);
            }
        });
    });
});
