var express = require('express');
//var myMongoDb = require('./../models/myMongoDb.js');
var mdlError = require('./../models/error.js');
var mdlResponse = require('./../models/response.js');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});
/*router.get('/xAPI/activities/state', function(req, res) {
    var activityId = decodeURIComponent(req.query.activityId);
    try{
        var agent = JSON.parse(decodeURIComponent(req.query.agent));
    }
    catch(err){
        var objErr = {
            status:500,
            message:err,
            contentType:'application/json'
        };
        return mdlError.send(req,res,objErr);
    }
    var stateId = decodeURIComponent(req.query.stateId);
    
    var query = { "$and": [ 
        { "activitiId": activityId }, 
        { "agent.account.homePage":agent.account.homePage},
        { "agent.account.name":agent.account.name},
        { "agent.objectType":agent.objectType},
        { "stateId": stateId } 
    ]};
    var promise = myMongoDb.getState(query);
    promise.then(
        function (states) {
            var objRes = typeof states === 'object' && states.length > 0 ? {status:200,message:states[0].stateval,contentType:'application/json'} : {status:404,message:"State not found",contentType:'text/html;charset=utf-8'};
            mdlResponse.send(req,res,objRes);
        },
        function(err){
            var objErr = {
                status:500,
                message:err,
                contentType:'application/json'
            };
            mdlError.send(req,res,objErr);
        }
    );
});

// max
// ritorna per un tente di una scuola lo stato del corso e degli sco relativi
// { "$and": 
//    [{"agent.account.name": "cape2014"}, {"agent.account.homePage": "http://127.0.0.1:3000"},
//    {"activitiId" : /http:\/\/127.0.0.1:3000\/0007/}
//    ]}
router.get('/xAPI/activities/state/monitoring', function(req, res) {
// ritorna tutti i corsi monitorati da LRS  equivale ad una distinct  
// var query =  [ {"$match" : {"stateId" : "course"}}, {"$group" : {"_id" : {activitiId:"$activitiId"}}}] 
var query =  { $query: { $and: [ { "agent.account.name": "cape2014" }, { "agent.account.homePage": "http://127.0.0.1:3000" } , {"stateId" : /course|sco/} ]}, $orderby: { "activitiId" : 1 }}
    query.$query.$and[0]["agent.account.name"] = decodeURIComponent(req.query.name)
    query.$query.$and[1]["agent.account.homePage"] = decodeURIComponent(req.query.homePage)
console.log(query.$query.$and[0]["agent.account.name"], query.$query.$and[1]["agent.account.homePage"])
console.log(JSON.stringify(query))
    var promise = myMongoDb.getState(query);
    promise.then(
        function (states) {
            var objRes = typeof states === 'object' && states.length > 0 ? {status:200,message:states,contentType:'application/json'} : {status:404,message:"State not found",contentType:'text/html;charset=utf-8'};
            mdlResponse.send(req,res,objRes);
        },
        function(err){
            var objErr = {
                status:500,
               message:err,
               contentType:'application/json'
           };
           mdlError.send(req,res,objErr);
       }
    );
});    

router.post('/xAPI/activities/state', function(req, res) {
    var activityId = decodeURIComponent(req.query.activityId);
    try{
        var agent = JSON.parse(decodeURIComponent(req.query.agent));
    }
    catch(err){
        var objErr = {
            status:500,
            message:err,
            contentType:'application/json'
        };
        return mdlError.send(req,res,objErr);
    }
    var stateId = decodeURIComponent(req.query.stateId);
    var stateval = req.body;
    var query = { "$and": [ 
        { "activitiId": activityId }, 
        { "agent.account.homePage":agent.account.homePage},
        { "agent.account.name":agent.account.name},
        { "agent.objectType":agent.objectType},
        { "stateId": stateId } 
    ]};
    var promise = myMongoDb.getState(query);
    promise.then(
        function (states) {
            var objRes = typeof states === 'object' && states.length > 0 ? states : null;
            if(!objRes){
                objRes = {
                    activitiId: activityId,
                    agent: agent,
                    stateId: stateId,
                    stateval:stateval
                }
                return myMongoDb.postState(objRes);
            }
            else{
                var parRes = {_id:states[0]._id};
                objRes = {
                    $set: {
                        stateval:stateval
                    }
                };
                return myMongoDb.putState(parRes,objRes);
            }
        }
    )
    .then(
        function (states) {
            mdlResponse.send(req,res,{status:201,message:states,contentType:'application/json'});
        }
    )
    .catch(function(err){
        var objErr = {
            status:500,
            message:err,
            contentType:'application/json'
        };
        return mdlError.send(req,res,objErr);
    });
});
router.get('/xAPI/statements', function(req, res) {
    var agent;
    try{
        agent = JSON.parse(decodeURIComponent(req.query.agent));
    }
    catch(err){
        var objErr = {
            status:500,
            message:err,
            contentType:'application/json'
        };
        return mdlError.send(req,res,objErr);
    }
    var query = { "$and": [ 
        { "actor.account.homePage":agent.account.homePage},
        { "actor.account.name":agent.account.name}
    ]};
    var promise = myMongoDb.getStatements(query);
    promise.then(
        function (statements) {
            mdlResponse.send(req,res,{status:201,message:statements,contentType:'application/json'});
        }
    )
    .catch(function(err){
        var objErr = {
            status:500,
            message:err,
            contentType:'application/json'
        };
        return mdlError.send(req,res,objErr);
    });
});
router.post('/xAPI/statements', function(req, res) {
    var statements = req.body;
    var promise = myMongoDb.postStatements(statements);
    promise.then(
        function (statement) {
            mdlResponse.send(req,res,{status:201,message:statement,contentType:'application/json'});
        }
    )
    .catch(function(err){
        var objErr = {
            status:500,
            message:err,
            contentType:'application/json'
        };
        return mdlError.send(req,res,objErr);
    });
});
*/
module.exports = router;
