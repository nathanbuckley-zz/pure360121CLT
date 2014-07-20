#!/usr/bin/env node

/*
* A command line tool for sending a 1-2-1 Message through the Pure Response API.
* Must has a Valid Pure Response account with an active system login.
* System Requires node.
* v 0.1 
*/
var http = require('http'),
querystring = require('querystring'),
rl = require('readline').createInterface(process.stdin, process.stdout);

var prompts = ['sysLogin', 'password', 'recAddress', 'subLine', 'message'];
var p = 0;
var data = {}; //need to rewrite to remove global var's ! 

var get = function() {
	if(p == 0){
		console.log('Please enter valid Pure Response system login (usually ending in .sys)');
	}
	rl.setPrompt(prompts[p] + ' > ');
	rl.prompt(); 
	p++
};

get();

rl.on('line', function(line) {
	switch (p){ // Promp description. Called before each request
		case 1:
			console.log('Enter Password associated with system login');
			break;
		case 2:
			console.log('Enter Valid email address of recipient');
			break;
		case 3:
			console.log('Enter a subject line for your message');
			break;
		case 4:
			console.log('Enter your message contents (Plain Text Only)');
			break;
	}
	data[prompts[p - 1]] = line;
	if(p === prompts.length) {
		return rl.close();
	}
	get();
})

rl.on('close', function() {
	var postData = querystring.stringify({
    	'userName':data.sysLogin, //Must me a valid pure response system login
		'password':data.password,
		'message_contentType':'EMAIL',
		'toAddress':data.recAddress,
		'message_bodyHtml':data.message,
		'message_subject':data.subLine,
	});

	var options = { // DO NOT change anything in options 
		hostname: 'response.pure360.com',
		port: 80,
		path: '/interface/common/one2OneCreate.php', // One2One API wrapper
		method: 'POST',
		headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length
    	}
	};

	var postReq = http.request(options, function(res){ 
		console.log('response Status Code: ' + res.statusCode); //Shows response status code for connection status and debugging
		var resHead = JSON.stringify(res.headers, null, 4); // Makes Response header readable
		console.log('Sent time: ' + resHead.date );
		res.setEncoding('utf8');
  		res.on('data', function (chunk){
  			if(chunk == 'OK'){
  				console.log('Message Sent'); // If message is sucsessfully sent to pure response 
  			}
  			else{
  				console.log('Response: ' + chunk); // Prints response from pure if failed to send
  			}
    	});
	}).on('error', function(err){
		console.log(err);
	}).on('end', function(err){
		console.log(err);
	});

	postReq.write(postData);
	postReq.end(); // Ends Request and Process once Complete
});