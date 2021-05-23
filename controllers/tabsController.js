const db = require('../models/db.js');
const Users = require('../models/UserModel.js');
const Posts = require('../models/PostModel.js');
const Comments = require('../models/CommentModel.js');

const tabsController = {
	getTabs: function (req,res) {
		var username = req.session.username;

		req.session.refferal = '/tabs';

		res.render('tabs', {username});
	}
}

module.exports = tabsController;