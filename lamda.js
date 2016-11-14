'use strict';

console.log('Loading function');

const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();

/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    switch (event.httpMethod) {
        case 'GET':
            getNewCard(event, done);
            break;
        case 'PUT':
            intakeCard(event, done);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};

function getNewCard(event, done) {
    const userId = event.queryStringParameters.userId;
    const params = {
        TableName : 'UserCardQueue',
        FilterExpression : 'userId = :this_user',
        ExpressionAttributeValues : {':this_user' : userId}
    };
    if (userId) dynamo.query( params, function (err, res, done) {
        if (err) return done (err);
        else {
            let r = Math.floor(Math.random() * res.Items.length);
            return done (null, res.Items[r]);
        };
    });
    else return done ("No User Id");
}

function intakeCard(event, done) {
    removeCard(event.body.Card);
    if (event.body.recognized && event.body.Card.unknown != null) recognizedCard(event.body.Card);
    if (event.body.taught && event.body.Card.unknown != null) taughtCard(event.body.Card);
    if (event.body.wpm != null) postWPM(event.body.Card.userId, event.body.wpm);
    getNewCard(event, done);
}

function removeCard(Card){
    const cleanupParams = {
        TableName : 'UserCardQueue',
        Key : {
            userId : Card.userId,
            stringId : Card.stringId
        }
    };
    dynamo.query( cleanupParams, function (err, data) {
        if (err) return;
        if (data.Count != 0) {
            replaceCard(data.Items[0].userId, data.Items[0].label);
            const deleteParams = {
                TableName: 'UserCardQueue',
                Key: {
                    userId: data.Items[0].userId,
                    stringId: data.Items[0].stringId
                }
            };
            dynamo.deleteItem( deleteParams, function (err, data) {
                if (err) return;
            });
        };
    });
}

function replaceCard(userId, label) {
    const Card = {};
    switch (label) {
        case '1Q':
            getQ_word(userId, label);
            break;
        case '2Q':
            getQ_word(userId, label);
            break;
        case '3Q':
            getQ_word(userId, label);
            break;
        case 'sentence0':
            queueSentenceMatch(userId, label);
            break;
        case 'sentence1':
            queueSentenceMatch(userId, label);
            break;
    };
}

function postCard(Card) {
    postParams = {
        TableName: "UserCardQueue",
        Item: Card
    };
    dynamo.putItem(postParams);
}

function recognizedCard(Card) {
    return;
}

function taughtCard(Card) {
    return;
}

function postWPM(userId, wpm) {
    return;
}

function getQ_word(userId, label) {
    var params = {
      TableName: "UserQ_word",
        KeyConditionExpression: "userId = :user and begins_with(Q_word, :quartile)",
        ExpressionAttributeValues: {
            ":user": userId,
            ":quartile": label
        }
    };
    if (userId) dynamo.query( params, function (err, data) {
        if (err) return done (err);
        else {
            let r = Math.floor(Math.random() * data.Items.length);
            const card = {
                userId: data.Items[r].userId,
                stringId: data.Items[r].Q_word,
                label: data.Items[r].Q_word,
                string: data.Items[r].Q_word,
                unknown: data.Items[r].Q_word
            };
        };
    });
    
}

function queueSentenceMatch(userId, label) {
    
}