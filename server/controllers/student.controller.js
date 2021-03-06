const mongoose = require("mongoose");
const passport = require("passport");
const _ = require("lodash");

const Student = mongoose.model("Student");
const Company = mongoose.model("Company");
const CV = mongoose.model("cv");

module.exports.register = (req, res, next) => {
    var student = new Student();
    student.firstName = req.body.firstName;
    student.lastName = req.body.lastName;
    studentEmail = req.body.email.toLowerCase();
    student.email = studentEmail;
    student.birthDate = req.body.birthDate;
    student.phoneNumber = req.body.phoneNumber;
    student.status = req.body.status;
    student.password = req.body.password;
    student.hashtag = req.body.competencies;

    student.save((err, doc) => {
        if (!err) {
            res.send(doc);
        } else {
            if (err.code == 11000) {
                res.status(422).send(["Duplicate email address found."]);
            } else {
                return next(err);
            }
        }
    });
};

module.exports.getStudents = (req, res) => {
    Student.find((err, students) => {
        if(!students) {
            return res.status(409).json({status: false, message: 'Aucun étudiant trouvé'})
        } else {
            return res.status(200).json({ status: true, students })
        }
    })
};

module.exports.authenticate = (req, res, next) => {
    //On appelle la méthode d'authentification configurée dans passportConfig.js
    passport.authenticate("local", (err, user, info) => {
        //Si il y a une erreur on la retourne
        if (err) return res.status(400).json(err);
        //Si student est retourné (seulement si ça réussi), on crée un JsonWebToken grâce à la méthode définie dans student.model.js
        else if (user)
            return res.status(200).json({ token: user.generateJwt(req) });
        //Si l'email n'existe pas ou si le mot de passe est incorrect on affiche le message défini dans passportConfig.js
        else return res.status(404).json(info);
    })(req, res);
};

module.exports.studentProfile = (req, res, next) => {
    Student.findOne({ _id: req._id }, (err, student) => {
        if (!student) {
            return res
                .status(404)
                .json({ status: false, message: "Student record not found" });
        } else {
            return res.status(200).json({ status: true, student });
        }
    });
};

module.exports.getStudentProfile = (req, res, next) => {
    Student.findOne({ _id: req.params.id }, (err, student) => {
        if (!student) {
            return res
                .status(404)
                .json({ status: false, message: "Student record not found" });
        } else {
            return res.status(200).json({ status: true, student });
        }
    });
};


module.exports.removeFavorite = (req, res, next) => {
    Student.findOneAndUpdate({_id: req.params.id}, {$pull: {favorites: req.params.id}},
        (err, user) => {
            if(!user){
                // Reponse status 409: Conflict (La requête ne peut être traitée en l’état actuel.)
                return res.status(409).json({status: false, message: "L'utilisateur n'a pas été trouvé", erreur: err});
            }
            else{
                return res.status(200).json({status: true, user});
            }
        }
    );
}

module.exports.getAllFavorites = (req, res, next) => {
    Student.findOne({ _id: req._id }, (err, student) => {
        if (!student) {
            return res
                .status(404)
                .json({ status: false, message: "Student not found" });
        } else {
            Company.find({ _id: { $in: student.favorites } }, (err, favorites) => {
                return res.status(200).json({ status: true, favorites });
            });
        }
    });
};

module.exports.searchProfile = (req, res, next) => {
    const listCompetence = JSON.parse(req.params.arr);

    Student.find({ hashtag: { $all: listCompetence } }, (err, cv) => {
        if (!cv) {
            return res
                .status(500)
                .json({ status: false, message: "Cannot load all CV" });
        } else {
            return res.status(200).json({ status: true, cv });
        }
    });
};

module.exports.updateStudent = (req, res, next) => {
    var studentUpdate = Student.find({ _id: req._id });
    studentUpdate._id = req._id;
    studentUpdate.firstName = req.body.firstName;
    studentUpdate.lastName = req.body.lastName;
    studentUpdate.email = req.body.email.toLowerCase();

    if (req.body.password) {
        studentUpdate.password = req.body.password;
    }

    Student.findOneAndUpdate({ _id: req._id }, {
            $set: {
                firstName: studentUpdate.firstName,
                lastName: studentUpdate.lastName,
                email: studentUpdate.email,
                password: studentUpdate.password,
            },
        }, { omitUndefined: true, runValidators: true, context: "query" },
        (err, student) => {
            if (err) {
                return res
                    .status(500)
                    .json({
                        status: false,
                        message: "Student not found or update impossible",
                    });
            } else {
                return res.status(200).json({ status: true, student });
            }
        }
    );
};