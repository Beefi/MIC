const successController = {
    getSuccess: function (req, res) {
        var details = {
            firstName: req.query.fName,
            lastName: req.query.lName,
            username: req.query.username
        };

        req.session.refferal = '/success';

        res.render('success', details);
    }

}

module.exports = successController;
