const router = require("express").Router();
const { users } = require("../database")
const bcrypt = require('bcrypt');
const JWT = require("jsonwebtoken")
const { check, validationResult } = require("express-validator");

// signup
router.post("/signup", [
    check("email", "Please input a valid email")
        .isEmail(),
    check("password", "Please input a password with a min length of 6")
        .isLength({ min: 6 })
], async (req, res) => {
    const { email, password } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        })
    }
    let user = users.find((user) => {
        return user.email === email
    });

    if (user) {
        return res.status(422).json({
            errors: [
                {
                    msg: "This user already exists",
                }
            ]
        })
    }
    const hashedPassword = await bcrypt.hash(password, 10);


    users.push({
        email,
        password: hashedPassword
    });

    const token = await JWT.sign({ email }, "f932bg932g93657", { expiresIn: 360000 });

    res.json({
        token
    })
})
router.post('/login', async (req, res) => {
    const { email, password } = req.body

    let user = users.find((user) => {
        return user.email === email
    });

    if (!user) {
        return res.status(422).json({
            errors: [
                {
                    msg: "Invalid Credentials",
                }
            ]
        })
    }

    // Check if the password if valid
    let isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(404).json({
            errors: [
                {
                    msg: "Invalid Credentials"
                }
            ]
        })
    }
    const token = await JWT.sign({ email }, "ksdjfidmcieimddim393ks", { expiresIn: 360000 })

    res.json({
        token
    })
})
router.get("/all", (req, res) => {
    res.json(users)
})

module.exports = router;