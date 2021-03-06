const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const ObjectId = mongoose.Types.ObjectId;

const Company = mongoose.model('Company');
const Student = mongoose.model('Student');

module.exports.register = (req, res, next) => {
    var company = new Company();
    company.company_name = req.body.company_name;
    companyEmail = req.body.email.toLowerCase();
    company.email = companyEmail;
    company.siret = req.body.siret;
    company.description = req.body.description;
    company.password = req.body.password;
    company.save((err, doc) => {
        if(!err) {
            res.send(doc);
        } else {
            if (err.code == 11000) {
                res.status(422).send(['Cette addresse mail existe déjà']);
            } else {
                return next(err);
            }
        }
    });
}

module.exports.getCompanies = (req, res) => {
    Company.find((err, companies) => {
        if(!companies) {
            return res.status(409).json({status: false, message: 'Aucune entreprise trouvée'})
        } else {
            return res.status(200).json({ status: true, companies })
        }
    })
};

module.exports.getCompany = (req, res, next) => {
    Company.findOne({ _id: req._id },
        (err, company) => {
            if (!company) {
                return res.status(404).json({ status: false, message: 'Company record not found'});
            } else {
                return res.status(200).json({ status: true, company});
            }
        }
    );
};

module.exports.companyProfile = (req, res, next) => {
    Company.aggregate([
        {
            $match: {_id: ObjectId(req._id)}
        },
        {
            $lookup: {
                from: "posts",
                localField: "_id",
                foreignField: "_company",
                as: "posts"
            }
        }
    ],
    (err, company) => {
        if(!company){
            return res.status(409).json({ status: false, message: 'L\'entreprise n\'a pas été trouvée'});
        }
        else {
            return res.status(200).json({ status: true, company});
        }
    }
    )
}

module.exports.addFavorite = (req, res, next) => {


    Company.findByIdAndUpdate({_id: req._id}, 
        {$push: {favorites: req.params.id}},
        (err, user) => { 
            if(!user){
                // Reponse status 409: Conflict (La requête ne peut être traitée en l’état actuel.)
                return res.status(409).json({status: false, message: "L'utilisateur n'a pas été trouvé", erreur: err});
            }
            else{
                Student.findByIdAndUpdate({_id: req.params.id},
                    {$push: {favorites: req._id}},
                    (err, student) => {
                        if(!student){
                            console.log('pas de student');
                        }
                        else{
                            console.log('student');
                        }
                    }
                );
                return res.status(200).json({status: true, user});
            }
        }
    );
    
}

module.exports.removeFavorite = (req, res, next) => {
    Company.findOneAndUpdate({_id: req._id}, {$pull: {favorites: req.params.id}},
        (err, user) => {
            if(!user){
                // Reponse status 409: Conflict (La requête ne peut être traitée en l’état actuel.)
                return res.status(409).json({status: false, message: "L'utilisateur n'a pas été trouvé", erreur: err});
            }
            else{
                Student.findOneAndUpdate({_id: req.params.id},
                    {$pull: {favorites: req._id}},
                    (err, student) => {
                        
                    }
                )
                return res.status(200).json({status: true, user});
            }
        }
    );
}

module.exports.getAllFavorites = (req, res, next) => {
    Company.findOne({_id: req._id},
        (err, company) => {
            if (!company) {
                return res.status(404).json({ status: false, message: "L'entreprise n'a pas été trouvée"});
            } else {
                Student.find({_id: {$in: company.favorites}},
                    (err, favorites) => {
                        return res.status(200).json({ status: true, favorites });
                    }
                );
            }
        }
    );
}

module.exports.getCompanyProfileId = (req, res, next) => {
    Company.findOne({_id: req.params.id},
        (err, company) => {
            if(!company){
                return res.status(409).json({status: false, message: "L'entreprise n'a pas été trouvée", erreur: err});
            }
            else{
                return res.status(200).json({status: true, company});
            }
        }
    );
}


module.exports.updateCompany = (req, res, next) => {
    var companyUpdate = Company.find({_id: req._id});
    companyUpdate._id = req._id;
    companyUpdate.company_name = req.body.company_name;
    companyUpdate.email = req.body.email.toLowerCase();
    companyUpdate.description = req.body.description;
    
    if(req.body.password) {
        companyUpdate.password = req.body.password;
    }

    Company.findOneAndUpdate({_id: req._id}, {$set: {company_name: companyUpdate.company_name, email: companyUpdate.email, password: companyUpdate.password, description: companyUpdate.description}}, { omitUndefined: true,  runValidators: true, context: 'query' },
        (err, company) => {
            if(err) {
                return res.status(500).json({status: false, message: 'Modification impossible'});
            }
            else {
                return res.status(200).json({status: true, company});
            }
        }
    
    )

}
