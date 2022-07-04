const {expressjwt: expressJwt} = require('express-jwt');

function authJwt() {
    const secret = process.env.secret
    const api = process.env.API_URL
    return expressJwt({
        secret,
        algorithms: ["HS256"],
        isRevoked: isRevoked
    }).unless({
        path: [
            {url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']},
            `${api}/users/login`,
            `${api}/users/register`
        ]
    })
}

async function isRevoked(req, payload, done) {
    //need to be changed
    console.log('123')
    if (!payload.payload.isAdmin) {
        console.log('2345')
        done(null, true)
        return false
    }
    console.log('345')
    return true
}

module.exports = authJwt;
