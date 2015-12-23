/**
 * @author Laboratorio delle Idee s.r.l.
 */
var error = require('./error');
var mDb = require("./myMongoDb");
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var server = require('./../app');
var response = require("./response");

/*
 MongoDB 2.4 database added.  Please make note of these credentials:

   Root User:     admin
   Root Password: GTHMzZ_43ve3
   Database Name: lrs

Connection URL: mongodb://$OPENSHIFT_MONGODB_DB_HOST:$OPENSHIFT_MONGODB_DB_PORT/
 */

var db_name = "lrs"
//provide a sensible default for local development
mongodb_connection_string = 'mongodb://127.0.0.1:27017/' + db_name;
var options = {
}
//take advantage of openshift env vars when available:
if(process.env.OPENSHIFT_MONGODB_DB_URL){
    mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + db_name;
    options = {
        user: 'admin',
        pass: 'GTHMzZ_43ve3'
    }
}
mongoose.connect(mongodb_connection_string,options);

var Schema = mongoose.Schema;
var ObjectId  = Schema.ObjectId;
var SchemaType = Schema.Types;

var stateSchema = new Schema(
    {
        activitiId:String,
        agent:Object,
        stateId:String,
        stateval:Object
    }
);

stateSchema.index({ activitiId: 1 }); // schema level

var State = mongoose.model('State', stateSchema);

exports.getState = function(query){
    return State.find(query).exec();
}
exports.postState = function(query){
    return State.create(query);
}
exports.putState = function(par,query){
    return State.update(par,query);
}

var statementSchema = new Schema(
    {
        actor:Object,
        authority:Object,
        context:Object,
        id:String,
        object:Object,
        timestamp:Date,
        stored:Date,
        verb:Object,
        result:Object,
        version:String
    }
);

statementSchema.index({ id: 1 }); // schema level

var Statement = mongoose.model('Statement', statementSchema);

exports.getStatements = function(query){
    return Statement.find(query).exec();
}
exports.postStatements = function(query){
    query.version = "1.0.1";
    query.stored = new Date();
    return Statement.create(query);
}
exports.putStatement = function(par,query){
    return Statement.update(par,query);
}
