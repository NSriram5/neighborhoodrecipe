"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
    authenticateJWT,
    ensureLoggedIn,
} = require("./auth");


const { SECRET_KEY } = require("../config/config");
const testJwt = jwt.sign({ userName: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ userName: "test", isAdmin: false }, "wrong");


describe("authenticateJWT", function() {
    test("works: via header", function() {
        expect.assertions(2);
        const req = { headers: { authorization: `Bearer ${testJwt}` } };
        const res = { locals: {} };
        const next = function(err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({
            user: {
                iat: expect.any(Number),
                userName: "test",
                isAdmin: false,
            },
        });
    });

    test("works: no header", function() {
        expect.assertions(2);
        const req = {};
        const res = { locals: {} };
        const next = function(err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });

    test("works: invalid token", function() {
        expect.assertions(2);
        const req = { headers: { authorization: `Bearer ${badJwt}` } };
        const res = { locals: {} };
        const next = function(err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });
});

// describe("troubleshooting a specific JWT", function() {
//     test("should be able to validate", function() {
//         let problemUuId = 'b54385e9-6869-4181-bb6c-842991402c63';
//         let problemuserName = 'artain';
//         let problemisAdmin = false
//         let problemPayload = {
//             userName: problemuserName,
//             userUuId: problemUuId,
//             isAdmin: problemisAdmin
//         }
//         let createdJWT = jwt.sign(problemPayload, SECRET_KEY);
//         let problemJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6ImFydGFpbiIsInVzZXJVdUlkIjoiYjU0Mzg1ZTktNjg2OS00MTgxLWJiNmMtODQyOTkxNDAyYzYzIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTYyMDE5NjA2OH0.8_k3NYpClkyIn-Et4Mq0olBvvF3KBU45aYydTfi9P4k';
//         const req = { headers: { authorization: `Bearer ${problemJWT}` } }
//         const res = { locals: {} };
//         const next = function(err) {
//             expect(err).toBeFalsy();
//         };
//         authenticateJWT(req, res, next);
//         expect(res.locals).toEqual("fish");
//     })
// })

describe("ensureLoggedIn", function() {
    test("works", function() {
        expect.assertions(1);
        const req = {};
        const res = { locals: { user: { userName: "test", isAdmin: false } } };
        const next = function(err) {
            expect(err).toBeFalsy();
        };
        ensureLoggedIn(req, res, next);
    });

    test("unauth if no login", function() {
        expect.assertions(1);
        const req = {};
        const res = { locals: {} };
        const next = function(err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureLoggedIn(req, res, next);
    });
});