﻿function formLogin()
{
	$('body').html('\
<div id="login">\
	<div class="container">\
		<img class="login-logo" src="img/logo-main.png" width="30%" /><br />\
		<form>\
			<label class="message">username or password is not valid.</label>\
			<input name="email" class="form-control" type="email" placeholder="Email" />\
			<input name="password" class="form-control" type="password" placeholder="Password" />\
			<button id="btn-login">Login</button>\
		</form>\
	</div>\
</div>');
}