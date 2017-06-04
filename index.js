'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");


const restService = express();
restService.use(bodyParser.json());

var foodJson = {};
var workoutJson = {};
var dbJson = {};

fs.readFile( "foodItem.json", 'utf8', function (err, data) 
{
    foodJson = JSON.parse(data);
});
fs.readFile( "workout.json", 'utf8', function (err, data) 
{
   workoutJson = JSON.parse(data);
});

restService.post('/hook', function (req, res) {

    console.log('hook request');

    try {
        var speech = 'empty speech';
        var cmd = '';

        if (req.body) {
            var requestBody = req.body;

            if (requestBody.result) {
                speech = '';

                if (requestBody.result.metadata.intentName) {
                    cmd = requestBody.result.metadata.intentName;
                    console.log('cmd: ', cmd);
                    if(cmd == 'Having_Food')
                    {
                        //having food request
                        //save parameters food to today date
                        //return enjoy your food and calories he is consuming

                        speech += 'Enjoy Your Food.\n'

                        var foodItem = requestBody.result.parameters.foodItem;
                        for(var i = 0; i < foodItem.length; i++) 
                        {
                            var food = foodItem[i];
                            var foodarr = food.split("_");
                            var item = foodarr[0];
                            var type = foodarr[1];
                            var calories = 0;
                            if(foodJson[item])
                            { 
                               calories = foodJson[item];
                            }
                            
                            var data = dbJson;    
                            var datetime = new Date().toDateString();
                            console.log('result: ', data);
                            if(!data[datetime])
                            {
                                data[datetime] = {"add":0,"minus":0};
                            }
                            data[datetime].add += calories;
                            
                            speech += 'You consumed '+type+' '+item+' for ';
                            speech += calories;
                            speech += ' cal\n'

                        }


                    }
                    else if(cmd == 'My_Workout')
                    {
                        //My workout intent
                        //save parameter to workout to today date
                        //return good job...you burned this many calories

                        speech += 'Enjoy Your Workout.\n'

                        var workoutItem = requestBody.result.parameters.workoutItems;
                        
                        for(var i = 0; i < workoutItem.length; i++) 
                        {
                            var workout = workoutItem[i];
                            var workoutarr = workout.split(" ");
                            
                            var item = workoutarr[0];
                            var val = workoutarr[1];
                            var time = workoutarr[2];
                            var calories = 0;
                            if(workoutJson[item])
                            {
                                calories = (workoutJson[item])*val;
                            }
                            var data = dbJson;
                            console.log('data: ', data);
                            var datetime = new Date().toDateString();
                            if(!data[datetime])
                            {
                                data[datetime] = {"add":0,"minus":0};
                            }
                            data[datetime].minus += calories;
                            
                            speech += 'You Burnt calories through '+workout+' :';
                            speech += calories;
                            speech += ' cal\n'

                        }
                    }
                    else if(cmd == 'get_result')
                    {
                        //return all calories consumed and burnt for date mentioned
                        speech += 'Your details for date '

                        var date = requestBody.result.parameters.date;
                        var dateId = new Date(date).toDateString();
                        var caladd = 0;
                        var calminus = 0;
                        
                       
                        var data = dbJson;
                        console.log('data: ', data);
                        if(data[dateId])
                        {
                            caladd = data[dateId].add;
                            calminus = data[dateId].minus;
                        }
                        speech += ''+dateId+':\n';
                        speech += 'calories Consumed:'+caladd+' cal\n';
                        speech += 'calories Burned:'+calminus+' cal\n';
                        speech += 'Total:'+(caladd-calminus)+' cal';
                            
                            
                        });
                        
                    }
                    else
                    {
                        //no intent
                        speech += 'I am not able to understant you query';
                    }
                }

            }
        }
    
        return res.json({
            speech: speech,
            displayText: speech,
            source: 'santeapp-rest-server'
        });

    } catch (err) {
        console.error("Can't process request", err);

        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

function processTotalSpeech(speech, dateId, caladd, calminus, isResponse , res)
{
    speech += ''+dateId+':\n';
    speech += 'calories Consumed:'+caladd+' cal\n';
    speech += 'calories Burned:'+calminus+' cal\n';
    speech += 'Total:'+caladd-calminus+' cal';
    if(isResponse)
    {
        return res.json({
            speech: speech,
            displayText: speech,
            source: 'santeapp-rest-server'
        });
    }
}

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});
