const express = require("express");
const Users = require('./auth.model')
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('../../configs/cloudnaryConfig')
const { authMiddleWare } = require('../../middlewares/authMiddleware')


const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, './upload/Images')
    },
    filename: function (req, file, cb) {
        const suffix = Date.now() + '-' + Math.round(Math.random()) * 1E9;
        return cb(null, file.fieldname + '-' + suffix + path.extname(file.originalname));
    }
})

const upload = multer({
    storage,
    limits: {
        fileSize: 5000000,
        files: 1,
    }
})

const errhandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        res.send(err.message)
    }
}



const app = express.Router();
app.use(errhandler)



/* to upload the image and delete old file from server */

app.post('/update-avatar', upload.single('avatar'), authMiddleWare, async (req, res) => {
    if (req.file === undefined) {
        return res.send({
            Response: 0,
            message: 'Please upload a file'
        })
    }
    let img = req.file.filename;
    try {
        const result = await cloudinary.uploader.upload(`${req.file.destination + '/' + req.file.filename}`, {
            folder: 'profileImages'
        })
        await Users.updateOne({ _id: req.userId }, { $set: { img: result.secure_url } })
        let updatedUser = await Users.findOne({ _id: req.userId })
        res.send({
            updatedUser,
        })
    } catch (error) {
        res.status(401).send(error)
    }
})



app.get('/getuser', async (req, res) => {
    const [email, userId, password] = req.headers.token.split('_#_')
    try {
        const existingUser = await Users.findOne({ email: email, password }, { password: 0 }).populate(['following', 'followed', 'connected', 'connectReqSentPending', 'connectReqReceivedPending']);
        if (existingUser) {
            res.send(existingUser)
        } else {
            res.status(401).send('No such user exist!')
        }
    } catch (error) {
        res.status(401).send(error)
    }
})

app.get('/getAllUsers', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const allUsers = await Users.find({}).populate(['following', 'followed', 'connected', 'connectReqSentPending', 'connectReqReceivedPending']).limit(limit).skip((page - 1) * limit)
        res.send(allUsers)
    } catch (error) {
        console.log(error);
    }
})



app.post("/login", async (req, res) => {
    let { email, password } = req.body;
    password = String(password)
    try {
        let user = await Users.findOne({ email, password });
        if (user) {
            if (password == user.password) {
                res.send({
                    token: `${email}_#_${user._id}_#_${password}`,
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        age: user.age,
                        role: user.role,
                        createdAt: user.createdAt,
                    }
                })
            } else {
                res.status(401).send('Auth failure, incorrect password')
            }
        } else {
            res.status(401).send(`User with ${email} not found`);
        }
    } catch (err) {
        res.status(404).send(err.message);
    }
});

app.post("/register", async (req, res) => {
    let { email, password, firstName, lastName, age } = req.body;
    password = String(password)
    try {
        let existingUser = await Users.findOne({ email, password });
        if (existingUser) {
            res.status(401).send('cannot create an user with existing email')
        } else {
            let user = await Users.create({
                email, password, firstName, lastName, age
            })
            res.send({ token: `${user.email}_#_${user.password}` });
        }
    } catch (err) {
        res.status(401).send(err.message)
    }
});

//This is to update userProfile

app.patch('/update-profile', authMiddleWare, async (req, res) => {
    try {
        let updatedUser = await Users.findOneAndUpdate({ _id: req.userId }, {
            $set: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                occupation: req.body.occupation,
                socialLinks: {
                    facebook: req.body.socialLinks.facebook,
                    email: req.body.socialLinks.email,
                    twitter: req.body.socialLinks.twitter,
                    linkedin: req.body.socialLinks.linkedin,
                },
                measurement: {
                    height: req.body.measurement.height,
                    age: req.body.measurement.age,
                    weight: req.body.measurement.weight,
                }
            }
        }, { new: true })
        res.send(updatedUser)
    } catch (error) {
        res.status(401).send(error)
    }
})


module.exports = app;