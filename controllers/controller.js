const controller = {
    getFavicon: function (req, res) {
        res.status(204);
    },

    getIndex: function (req, res) {
        res.render('index');
    },

    getSession: function (req, res) {
    	if (req.session.username) {
    		res.redirect('/profile/'+req.session.username);
    		console.log('session found user: '+req.session.username);
    	}
    	else {
    		res.render('login');
    	}
    },

    getBack: function (req, res) {
        res.redirect('back');
    }
}

module.exports = controller;