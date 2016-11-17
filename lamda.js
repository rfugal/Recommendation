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
        body: err ? err.message : res,
        headers: {'Content-Type': 'text/html; charset=UTF-8'}
//        body: err ? err.message : JSON.stringify(res),
//        headers: {
//            'Content-Type': 'application/json',
//        },
    });

    var userId;
    switch (event.httpMethod) {
        case 'GET':
            if (event.queryStringParameters !== null && event.queryStringParameters.userId !== undefined) userId = event.queryStringParameters.userId;
            getNewCard();
            break;
        case 'PUT':
            event.body = JSON.parse(event.body);
            if (verifyCard(event.body.Card)) {
                userId = event.body.Card.userId;
                intakeCard();
            } else {
                done(new Error('Invalid Card'));
            }
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }

    function getNewCard() {
        const params = {
            TableName : 'UserCardQueue',
            KeyConditionExpression : 'userId = :this_user',
            ExpressionAttributeValues : {':this_user' : userId}
        };
        if (userId !== undefined) dynamo.query( params, function (err, res) {
            if (err) {
                done (err);
            } else if (res.Items !== undefined && res.Items.length > 0) {
                res.Items = shuffle(res.Items);
                let html =  "<html><head><title>Fluently with Sara.ai</title>" +
                            "<meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'>" +
                            "<script src='https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js'></script>" +
                            "<script src='https://reader.sara.ai/webapp/swipe.js'></script>" +
                            "<link rel='stylesheet' href='https://reader.sara.ai/webapp/swipe.css'>" +
                            "<link rel='stylesheet' href='https://reader.sara.ai/webapp/framework7.ios.min.css'>" +
                            "<link rel='stylesheet' href='https://reader.sara.ai/webapp/framework7.ios.colors.min.css'>" +
                            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Swiper/3.4.0/css/swiper.min.css">' +
                            "</head><body>" +
                            '<div class="swiper-container swiper-container-h">' +
                                '<div class="swiper-wrapper swiper-wrapper-h">' +
                            '</div></div>' +
                            "<div id='lambdaResponse' hidden>" + JSON.stringify(res.Items) + "</div>" +
                            "<script src='https://reader.sara.ai/webapp/framework7.min.js'></script>" +
                            '<script src="https://cdnjs.cloudflare.com/ajax/libs/Swiper/3.4.0/js/swiper.jquery.min.js"></script>' +
                            "</body></html>";
                done (null, html);
            } else {
                done (new Error("User has no cards"));
            }
        });
        else done (new Error("No User Id"));
    }

    function intakeCard() {
        // remove any PUT card from UserCardQueue except 1Q and sentence0 cards that were not recognized. 
        if (event.body.recognized || event.body.Card.label == "2Q" || event.body.Card.label == "3Q" || event.body.Card.label == "sentence1") removeCard(event.body.Card); 
        
        // further process based on tags
        if (event.body.wpm !== null) {
            postWPM(event.body.Card, event.body.wpm, function(err, res){
                if (err) console.log (err);
            });
            done (null, "WPM Recorded");
        }
        else if (event.body.recognized && event.body.Card.unknown !== null) {
            recognizedCard(event.body.Card, function(err, res){
                if (err) console.log (err);
            });
            done (null, "Recognized");
        }
        else if (event.body.taught && event.body.Card.unknown !== null) {
            taughtCard(event.body.Card, function(err, res){
                if (err) console.log (err);
            });
            done (null, "Taught");
        }
    }
};

function removeCard(Card){
    const cleanupParams = {
        TableName : 'UserCardQueue',
        KeyConditionExpression: "userId = :userId and stringId = :stringId",
        ExpressionAttributeValues: {
            ":userId" : Card.userId,
            ":stringId" : Card.stringId
        }
    };
    dynamo.query( cleanupParams, function (err, data) {
        if (err) console.log(err);
        else if (data.Count !== 0) {
            const deleteParams = {
                TableName: 'UserCardQueue',
                Key: {
                    userId: data.Items[0].userId,
                    stringId: data.Items[0].stringId
                }
            };
            dynamo.deleteItem( deleteParams, function (e) {
                if (e) {
                    console.log(e);
                }
                replaceCard(data.Items[0].userId, data.Items[0].label);
            });
        }
    });
}

function replaceCard(userId, label) {
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
    }
}

function postCard(Card) {
    const postParams = {
        TableName: "UserCardQueue",
        Item: Card
    };
    dynamo.putItem(postParams, function (err, res) {
        if (err) console.log(err);
        else console.log(res);
    });
}

function recognizedCard(Card) {
    if (Card.unknown[2] == "_") {
        let params = {
            TableName: "UserQ_word",
            Key: {
                userId: Card.userId,
                Q_word: Card.unknown
            }
        }
        dynamo.deleteItem(params, function (err, res){
            if (err) console.log (err);
            else console.log ("User " + Card.userId + ": Removed " + Card.unknown + " from UserQ_word");
        });
    } else {
        let params = {
            TableName: "UserAddedWord",
            Item: {
                userId: Card.userId,
                word: Card.unknown
            }
        }
        dynamo.putItem(params, function (err, res){
            if (err) console.log (err);
            else console.log ("User " + Card.userId + ": Added " + Card.unknown + " to UserAddedWord");
        });
    }
}

function taughtCard(Card) {
    let params = {
        TableName: "UserWordEncounter",
        KeyConditionExpression: "userId = :userId and word = :unknown",
        ExpressionAttributeValues: {
            ":userId": Card.userId,
            ":unknown": Card.unknown
        }
    }
    dynamo.query(params, function(err, res){
        if (err) console.log (err);
        else if (res.Count > 0) {
            var params = {
                TableName: "UserWordEncounter",
                Key: {
                    "userId": Card.userId,
                    "word": Card.unknown
                },
                UpdateExpression: "SET encounters = encounters + :incr",
                ExpressionAttributeValues: { 
                    ":incr": 1
                },
                ReturnValues: "ALL_NEW"
            };
            dynamo.updateItem(params, function(e, data) {
                if (e) {
                    console.log(e);
                }
                else if (data.Attributes.encounters > 14) {
                    recognizedCard({
                        userId: data.Attributes.userId,
                        unknown: data.Attributes.word
                    });
                }
            });
        } else {
            let encounterParams = {
                TableName: "UserWordEncounter",
                Item: {
                    userId: Card.userId,
                    word: Card.unknown,
                    encounters: 1
                }
            };
            dynamo.putItem(encounterParams, function(e, data){
                if (e) console.log(e);
                else console.log("User " + Card.userId + ": added " + Card.unknown + " to UserWordEncounter")
            });
        }
    });
}

function postWPM(Card, wpm) {
    removeCard(Card);
}

function getQ_word(userId, label) {
    const Qparams = {
      TableName: "UserQ_word",
        KeyConditionExpression: "userId = :user and begins_with(Q_word, :quartile)",
        ExpressionAttributeValues: {
            ":user": userId,
            ":quartile": label
        }
    };
    if (userId) dynamo.query( Qparams, function (err, data) {
        if (err) {
            console.log(err);
        } else if (data.Items.length > 0) {
            let r = Math.floor(Math.random() * (data.Items.length - 0.1));
            const Card = {
                userId: data.Items[r].userId,
                stringId: data.Items[r].Q_word,
                label: data.Items[r].Q_word.slice(0,2),
                string: data.Items[r].Q_word.slice(3,data.Items[r].Q_word.length),
                unknown: data.Items[r].Q_word
            };
            postCard(Card);
        } else if (label == "2Q" && Math.random() > 0.5) {
            getQ_word(userId, "3Q");
        }
    });
}

function queueSentenceMatch(userId, label) {
    let timestamp = new Date();
    const queuedSentenceQuery = {
        "label": label,
        "timestamp": timestamp,
        "userId": userId
    }
    const matchParams = {
        TableName: "SentenceMatchQueue",
        Item: queuedSentenceQuery
    }
    dynamo.putItem(matchParams);
}

function verifyCard(Card) {
    var result = true;
    if (Card.userId === undefined || Card.userId == null) result = false;
    if (Card.stringId === undefined || Card.stringId == null) result = false;
    if (Card.label === undefined || Card.label == null) result = false;
    if (Card.string === undefined || Card.string == null) result = false;
    if (Card.unknown === undefined) result = false;
    return result;
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}