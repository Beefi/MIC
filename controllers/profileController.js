const db = require('../models/db.js');
const Users = require('../models/UserModel.js');
const Posts = require('../models/PostModel.js');
const Comments = require('../models/CommentModel.js');
const bcrypt = require('bcrypt');
const path = require('path');
const util = require('util');
const clone = require('clone');
const saltRounds = 10;

const profileController = {
    getProfile: function (req, res) {
        var query = {
            username: req.params.username,
        };

        var projection = 'userID firstName lastName username numPosts followers';

        db.findOne(Users, query, projection, function(result) {
            if(result != null) {
                var details = {
                    userID: result.userID,
                    sessionname: req.session.username,
                    sessionID: req.session.userID,
                    firstName: result.firstName,
                    lastName: result.lastName,
                    username: result.username,
                    numPosts: result.numPosts,
                    followers: result.followers
                };

                req.session.refferal = '/profile/'+sessionname;
                res.render('profile', details);
            }
            else {
                var error = 'Cannot find profile';
                res.render('error', error);
            }
        });
    },

    getProfileAvatar: function (req, res) {
        var query = {
            username: req.params.username
        }

        var projection = 'username avatar';
        db.findOne(Users, query, projection, function (result) {
            res.send(result);
        });
    },

    getProfilePosts: function (req, res) {
        var username = req.params.username;
        
        var projection = 'postID posterID userPostNum username contentPath description likes comments tags';
        
        db.findMany(Posts, {username, username}, projection, function (results) {
            res.render('profile', {results})
        });
    },

    getUploadPage: function (req, res) {
        var query = {
            username: req.session.username
        }

        var projection = 'username avatar';

        db.findOne(Users, query, projection, function (result) {
            if (result != null) {
                var details = {
                    username: result.username,
                    avatar: result.avatar
                };

                req.session.refferal = '/uploadPage/'+query.username;

                res.render('uploadPage', details)
            }
            else {
                var error = 'Cannot find profile';
                res.render('error', {error});
            }
        });
    },

    upload: async function (req, res) {
        try {
            var hiddenInfo = {
                username: req.body.hiddenUsername,
                avatar: req.body.avatarPath
            }

            const file = req.files.file;
            const fileName = file.name;
            const size = file.data.length;
            const extension = path.extname(fileName);
            const toBeDeleted = req.body.avatarPath;

            const allowedExtensions = /png|jpeg|jpg/;

            if (!allowedExtensions.test(extension)) throw "Unsupported extension";
            if (size > 12000000) throw "File must be less than 12MB";

            const md5 = file.md5;

            const URL = "/images/avatar/"+hiddenInfo.username+extension;

            var newInfo = {
                username: req.body.hiddenUsername,
                avatar: ".."+URL
            }

            await util.promisify(file.mv)("./public"+URL);

            db.updateOne(Users, hiddenInfo, newInfo, function (result) {
                if (result != null) {
                    var username = newInfo.username;
                    res.redirect('/profile/'+username);
                }
            });

        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: err
            });
        }
    },

    getEditProfile: function (req, res) {
        var query = {
            username: req.params.username
        }

        var projection = 'firstName lastName username';

        db.findOne(Users, query, projection, function (result) {
            if (result != null) {
                var details = {
                    firstName: result.firstName,
                    lastName: result.lastName,
                    username: result.username
                };

                req.session.refferal = '/editprofile/'+query.username;

                res.render('editprofile', details)
            }
            else {
                var error = 'Cannot find profile';
                res.render('error', error);
            }
        });
    },

    postProfileInfo: function (req, res) {
        var hiddenInfo = {
            username: req.body.hiddenUsername,
            firstName: req.body.hiddenFirstName,
            lastName: req.body.hiddenLastName
        }

        var newInfo = {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        }

        var newname = newInfo.username;
        req.session.username = newname;

        console.log(hiddenInfo.username + " to " + newInfo.username);

        db.updateOne(Users, hiddenInfo, newInfo, function (result) {
            if (result != null) {
                var oldPostQ = {
                    username: hiddenInfo.username
                }
                var newPostQ = {
                    username: newname
                }
                db.updateMany(Comments, oldPostQ, newPostQ, function (results) {
                    if (results) {
                        db.updateMany(Posts, oldPostQ, newPostQ, function (results) {
                            if (results) {
                                res.redirect('/profile/'+newname);
                            }
                        });
                    }
                });
            }
        });
    },

    getChangePassword: function (req, res) {
        var query = {
            username: req.params.username
        }

        var projection = 'username password';

        db.findOne(Users, query, projection, function (result) {
            if (result != null) {
                var details = {
                    username: result.username,
                    password: result.password
                };

                req.session.refferal = '/changepassword/'+query.username;

                res.render('changepass', details);
            }
            else {
                var error = 'Cannot find profile';
                res.render('error', error);
            }
        })
    },

    postChangePassword: function (req, res) {
        var curPassword = req.body.curPassword;
        var username = req.body.hiddenUsername;

        var hiddenInfo = {
            username: req.body.hiddenUsername,
            password: req.body.hiddenPassword
        }
        var newInfo = {
            username: req.body.hiddenUsername,
            password: req.body.newPassword
        }

        var projection = 'userID username password';

        db.findOne(Users, hiddenInfo, projection, function(result) {
            if (result.username == username && result != null) {
                bcrypt.compare(curPassword, result.password, function (err, equal) {
                    if (equal) {
                        bcrypt.hash(newInfo.password, saltRounds, function (err, hash) {
                            if(hash != null) {
                                console.log ("Password changed from: "+hiddenInfo.password+" to: "+newInfo.password);
                                console.log ("Hash: "+ hash)

                                newInfo.password = hash;

                                db.updateOne(Users, hiddenInfo, newInfo, function (result) {
                                    if (result != null) {
                                        var username = newInfo.username;
                                        res.redirect('/profile/'+username);
                                    }
                                }); 
                            }
                            else {
                                var error = 'Something went wrong in storing password';
                                res.render('error', error);
                            }
                        });
                    }
                    else {
                        var error = 'Wrong password entered.'
                        res.render('error', error);
                    }
                });
            }
        });
    },

    deleteAccount: function (req, res) {
        var username = req.params.username;
        var userID = req.params.userID;

        console.log(username);
        console.log(userID);

        var query = {
            userID: userID
        }

        db.deleteOne(Users, query, function (result) {
            if (result) {

                query = {
                    username: username
                }

                db.deleteMany(Posts, query, function (result) {
                    if (result) {
                        db.deleteMany(Comments, query, function (result) {
                            if (result) {
                                res.send(true);
                            }
                        });
                    }
                });
            }
        });
    },

    followAccount: function (req, res) {
        var toBeFollowed = req.params.username;
        var sessionname = req.session.username;
        var sessionID = req.session.userID;

        console.log(toBeFollowed+" "+sessionname);

        var query = {
            username: toBeFollowed
        }

        var projection = 'userID username followers';

        db.findOne(Users, query, projection, function (result) {
            if (result != null) {
                var oldInfo = {
                    username: result.username,
                    followers: result.followers
                }

                var newFollowers = clone(result.followers);
                newFollowers.push(sessionID);

                var newInfo = {
                    username: result.username,
                    followers: newFollowers
                }

                db.updateOne(Users, oldInfo, newInfo, function (result) {
                    if (result) {
                        res.send(true);
                    }
                });
            }
        });
    },

    getFollowers: function (req, res) {
        var username = req.params.username;
        console.log(username);

        var query = {
            username: username
        }

        var projection = 'username followers';

        db.findOne(Users, query, projection, function (result) {
            if (result != null) {
                res.send(result.followers);
            }
        });
    }
}

/*
    exports the object `profileController` (defined above)
    when another script exports from this file
*/
module.exports = profileController;
