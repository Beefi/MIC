const db = require('../models/db.js');
const Users = require('../models/UserModel.js');
const Posts = require('../models/PostModel.js');
const Comments = require('../models/CommentModel.js');
const path = require('path');
const util = require('util');
const clone = require('clone');

const searchController = {
	getSearch: function (req, res) {
		var sessionname = req.session.username;

		details = {
			sessionname: sessionname,
		}

		res.render('search', details);
	},

	getResults: function (req, res) {
		var type = req.query.type;
		var searchQuery = req.query.query;
		console.log("Type: "+type)
		console.log("Query: "+searchQuery);

		// Search Posts
		if (type == 'post') {
			var projection = 'postID posterID username type contentPath description likes tags'
			db.findMany(Posts, {description: {"$regex": searchQuery, "$options": "i"}}, projection, function (results) {
				res.send(results);
			});
		}

		// Search Users
		if (type == 'user') {
			var projection = 'userID username password email firstName lastName numPosts avatar followers liked';
			db.findMany(Users, {username: {"$regex": searchQuery, "$options": "i"}}, projection, function (results) {
				res.send(results);
			});
		}

		// Search Comments
		if (type == 'comment') {
			var projection = 'commentID commenterID commentNum postID username content';
			db.findMany(Comments, {content: {"$regex": searchQuery, "$options": "i"}}, projection, function (results) {
				res.send(results);
			});
		}

		// Search Tabs
		if (type == 'tabs') {

		}
	}
}

module.exports  = searchController;