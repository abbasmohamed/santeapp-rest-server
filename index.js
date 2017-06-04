'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");


const restService = express();
restService.use(bodyParser.json());

restService.post('/hook', function (req, res) {

    console.log('hook request');

    try {
        var speech = 'empty speech';

        if (req.body) {
            var requestBody = req.body;

            if (requestBody.result) {
                speech = '';
console.log('result: ', JSON.stringify(requestBody.result));
                if (requestBody.result.metadata.intentName) {
                    cmd = requestBody.result.metadata.intentName;
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
                            fs.readFile( "foodItem.json", 'utf8', function (err, data) 
                            {
                               var foodJson = JSON.parse(data);
                               if(foodJson.item)
                               {
                                    calories = foodJson.item;
                               }
                            });
                            fs.readFile( "db.json", 'utf8', function (err, data) 
                            {
                                data = JSON.parse(data);
                                var datetime = new Date().toDateString();
                                if(!data.datetime)
                                {
                                    data.datetime = {};
                                }
                                if(data.datetime.add)
                                {
                                    data.datetime.add += calories;
                                }
                                else
                                {
                                    data.datetime.add = calories;
                                    data.datetime.minus = 0;
                                }
                                
                            });
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

                        var workoutItem = requestBody.result.parameters.workoutItem;
                        for(var i = 0; i < workoutItem.length; i++) 
                        {
                            var workout = workoutItem[i];
                            var workoutarr = workout.split(" ");
                            var item = workoutarr[0];
                            var val = workoutarr[1];
                            var time = workoutarr[2];
                            var calories = 0;
                            fs.readFile( "workout.json", 'utf8', function (err, data) 
                            {
                               var workout = JSON.parse(data);
                               if(workout.item)
                               {
                                    calories = (workout.item)*val;
                               }
                            });
                            fs.readFile( "db.json", 'utf8', function (err, data) 
                            {
                                data = JSON.parse(data);
                                var datetime = new Date().toDateString();
                                if(!data.datetime)
                                {
                                    data.datetime = {};
                                }
                                if(data.datetime.minus)
                                {
                                    data.datetime.minus += calories;
                                }
                                else
                                {
                                    data.datetime.minus = calories;
                                    data.datetime.add = 0;
                                }
                                
                            });
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
                        
                       
                        fs.readFile( "db.json", 'utf8', function (err, data) 
                        {
                            data = JSON.parse(data);
                            if(data.dateId)
                            {
                                caladd = data.dateId.add;
                                calminus = data.dateId.minus;
                            }
                            
                        });
                        speech += ''+dateId+':\n';
                        speech += 'calories Consumed:'+caladd+' cal\n';
                        speech += 'calories Burned:'+calminus+' cal\n';
                        speech += 'Total:'+caladd-calminus+' cal';
                    }
                    else
                    {
                        //no intent
                        speech += 'I am not able to understant you query';
                    }
                }

            }
        }

        console.log('result: ', speech);

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

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});
