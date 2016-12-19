var synth = window.speechSynthesis;
var voices = synth.getVoices();
var Cards;
$(document).ready(function () {
	Cards = JSON.parse($('#lambdaResponse').text());
	Cards.unshift({string:'Refresh Page',stringId:null,unknown:null});	
	let countDown = document.createElement('canvas');
	$(countDown).attr({'id':'timer','width':'400','height':'400'});
	let learn = document.createElement('div');
	$(learn).attr('id','learnCard').text('abc').on('click', function (){
		if (activeCard.unknown !== undefined) {
            $('#flipside').hide();
            $('#learnCard').hide();
            $('#cardFace').show();
            $('.fluencyButtons').hide();
            makeButtons();
        }
	});
	$('body').append(countDown, learn);
	buildCards();
});

var allottedtime;
var endtime;

function beginTimer(sentence) {
	$('#flipside').hide();
	$('#timer').show();
	$('#learnCard').hide();
	$('#cardFace').show();
	let wordCount = sentence.split(' ').length - 1;
	allottedtime = 2000 + wordCount * 500;
	endtime = new Date(Date.parse(new Date()) + allottedtime);
	initializeClock('timer');
}
function getTimeRemaining() {
	var t = Math.floor(endtime) - Math.floor(new Date());
	var hundredths = (t / allottedtime);
	return {
		'total': t,
		'hundredths': hundredths
	};
}
function initializeClock(id) {
	var clock = document.getElementById(id);
	
	function updateClock() {
		var t = getTimeRemaining();
		draw(t.hundredths);
		if (t.total <= 0) {
			clearInterval(timeinterval);
			$('#cardFace').hide();
			$('#flipside').show();
			$('#timer').hide();
			$('#learnCard').show();
		}
	}
	
	updateClock();
	var timeinterval = setInterval(updateClock, 50);
}
var activeCard;
function buildCards() {
	activeCard = Cards.pop();
	let Card = document.createElement('div');
	let VslideBack = document.createElement('div');
	let miss = document.createElement('button');
	let recog = document.createElement('button');
	$(Card).addClass('card').attr('id','cardFace');
	$(Card).append(replaceUnknown(activeCard.unknown,activeCard.string));
	$(VslideBack).addClass('card').text('use buttons on left and right').attr('id','flipside');
    $(VslideBack).attr('style','background-image:url(https://reader.sara.ai/wp-content/uploads/2016/10/swipe.png)').hide();
    $(miss).addClass('fluencyButtons').on('click',function(){
        missed();
    });
    $(recog).addClass('fluencyButtons').on('click',function(){
        recognized();
    });
	$('.container').append(miss,Card,VslideBack,recog);
}
function missed() {
    putCard(activeCard,false,false,null);
    nextCard();
}
function recognized() {
    putCard(activeCard,true,false,null);
    nextCard();
}
function nextCard() {
    if (Cards.length > 0) activeCard = Cards.pop();
    $('#cardFace').html('').append(replaceUnknown(activeCard.unknown,activeCard.string));
	$('.fluencyButtons').show();
	$('#userInput').remove();
    beginTimer($('#cardFace').text());
}
function replaceUnknown(unknown, cardString) {
	if (unknown == null) return cardString;
	if (unknown[2] == '_') unknown = unknown.slice(3,unknown.length);
	let parsed_unknown = document.createElement('span');
	for (i=0; i<unknown.length; i++) {
		let letter = document.createElement('span');
		$(letter).addClass('letter letter_' + unknown[i].toLowerCase()).text(unknown[i]);
		$(parsed_unknown).append(letter);
	}
	cardString = cardString.replace(unknown, "<span class='unknown'>" + $(parsed_unknown).html() + "</span>");
	return cardString;
}
function makeButtons() {
	let userInput = document.createElement('div');
	$(userInput).attr('id','userInput');
	$('body').append(userInput);
	if ($('#cardFace').find('.unknown').length !== 0) {
		let word = $('#cardFace').find('.unknown').addClass('learn').text().toLowerCase();
		speakWord(word);
		var unknown = [];
		for (l in word) {
			if ($.inArray(word[l], unknown) === -1) unknown.push(word[l]);
		}
		let c = 9;
		if (unknown.length > c) c = 12;
		unknown = abc(c, unknown);
		for (i=0; i<unknown.length; i++) {
			if ($('.button_' + unknown[i].length == 0)) {
				let letter_button = document.createElement('button');
				let letter = '.letter_'+unknown[i];
				$(letter_button).addClass('letterButton').text(unknown[i]).on('click', function(res) {
					let letter = '.letter_' + res.target.innerHTML;
					if ($('#cardFace').find(letter).length == 0) $('.letter').removeClass('digested');
					else {
						$('#cardFace').find(letter).addClass('digested');
						if ($('.digested').length == $('#cardFace').find('.letter').length) learnword($('#cardFace').find('.unknown').text());
					}
				});
				$(userInput).append(letter_button);
			}
		}
	}
}
function learnword (value) {
	speakWord(value);
	$('#userInput').remove();
	setTimeout(function(){
		putCard(activeCard, false, true, null); 
        nextCard();
    }, 2000);
}
function putCard (card, recognition, taught, wpm) {
	const putData = {
		'Card': card,
		'recognized': recognition,
		'taught': taught,
		'wpm': wpm
	};
	$.ajax({
		url: "https://zakmg68sdi.execute-api.us-east-1.amazonaws.com/prod/SaraWords",
		data: JSON.stringify(putData),
		type: "PUT",
		datatype: "xml"
	});
} 
function draw(t) { 
	var can = document.getElementById('timer');
	var canvas = document.getElementById("timer");
	var context = canvas.getContext("2d");
	var x = canvas.width / 2;
	var y = canvas.height / 2;
	var radius = (Math.min(x,y) * 4/5);
	var linewidth = Math.min(25,Math.floor(radius/5));
	
	var startAngle = - Math.PI/2;
	var endAngle = - t * 2 * Math.PI - Math.PI/2;
	
	var counterClockwise = true;
	context.clearRect(0,0,canvas.width,canvas.height);
	context.beginPath();
	context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
	context.lineWidth = linewidth;
	context.strokeStyle = 'blue';
	context.stroke();
}
function abc (c, unknown) {
	var abc = shuffle('abcdefghijklmnopqrstuvwxyz'.split(''));
	unknown = unknown.concat(abc);
	abc = [];
	for (l in unknown) {
		if ($.inArray(unknown[l], abc) === -1) abc.push(unknown[l]);
	}
	abc = shuffle(abc.slice(0,c));
	return abc;
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
function speakWord(value) {
	var u1 = new SpeechSynthesisUtterance(value);
	u1.lang = 'en-US';
	u1.pitch = 1;
	u1.rate = 1;
	//u1.voice = voices[3];
	u1.voiceURI = 'native';
	u1.volume = 1;
	speechSynthesis.speak(u1);
}