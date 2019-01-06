const expect = require('chai').expect;

const { checkLogin } = require('../routes/routes.js');

function resObj(status, err, data) {
    this.status = status;
    this.error = err;
    this.data = data;
}

let req = {
    body: {},
};

let res = {
    sendCalledWith: resObj("success", null, null),
    send: function(arg) {
        this.sendCalledWith = arg;
    }
};

describe('signup Route', function() {
    describe('signup valid user', function() {
        it('Should error out if no name provided ', function() {
            checkLogin(req, res);
            console.log(res);
            expect(res.sendCalledWith);
        });
    });
    describe('email collision', function() {
        it('Should error out if no name provided ', function() {
            checkLogin(req, res);
            console.log(res);
            expect(res.sendCalledWith);
        });
    });
});

describe('checkLogin Route', function() {
    describe('Valid login', function() {
        it('Should error out if no name provided ', function() {
            checkLogin(req, res);
            console.log(res);
            expect(res.sendCalledWith);
        });
    });
    describe('invalid login', function() {
        it('Should error out if no name provided ', function() {
            checkLogin(req, res);
            console.log(res);
            expect(res.sendCalledWith);
        });
    });
});
