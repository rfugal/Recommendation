var synth = window.speechSynthesis;
var voices = synth.getVoices();
var Cards;
var activeUnknown = '';
$(document).ready(function () {
	Cards = JSON.parse($('#lambdaResponse').text());
	Cards.unshift({string:'No More Cards',stringId:null,unknown:null});	
	Cards.unshift({string:'Refresh Page',stringId:null,unknown:null});	
	let countDown = document.createElement('canvas');
	$(countDown).attr({'id':'timer','width':'400','height':'400'});
	let learn = document.createElement('div');
	$(learn).attr('id','learnCard').text('abc').on('click', function (){
		$('.flipside').hide();
		$('#learnCard').hide();
		$('.swiper-wrapper-h').show();
		var mySwiper = $('.swiper-container-h')[0].swiper;
		mySwiper.lockSwipeToPrev();
		if (activeCards[mySwiper.realIndex].unknown !== undefined) makeButtons();
	});
	
	$('body').append(countDown, learn);
	buildCards();
});

var allottedtime;
var endtime;

function beginTimer(sentence) {
	$('.flipside').hide();
	$('#timer').show();
	$('#learnCard').hide();
	$('.swiper-wrapper-h').show();
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
			$('.swiper-wrapper-h').hide();
			$('.flipside').show();
			$('#timer').hide();
			$('#learnCard').show();
			speakWord(activeUnknown);
		}
	}
	
	updateClock();
	var timeinterval = setInterval(updateClock, 50);
}
var activeCards = ['',{stringId:null}];
function buildCards() {
	console.log('building Cards');
	activeCards[0] = Cards.pop();
	let Card = document.createElement('div');
	$(Card).addClass('swiper-slide');
	$(Card).append(replaceUnknown(activeCards[0].unknown,activeCards[0].string));
	let Blank = document.createElement('div');
	$(Blank).addClass('swiper-slide');
	$('.swiper-wrapper-h').append(Card,Blank);
	let VslideBack = document.createElement('div');
	$(VslideBack).addClass('flipside').attr('style','background-image:url(https://reader.sara.ai/wp-content/uploads/2016/10/swipe.png)').hide();
	$('.swiper-container-h').append(VslideBack);
	var swiperH = new Swiper('.swiper-container-h', {
		effect: 'flip',
		grabCursor: true,
		initialSlide: 0,
		speed: 300,
		centeredSlides: true,
		onlyExternal: false,
		allowSwipeToPrev: true,
		allowSwipeToNext: true,
		loop: true,
		onSlideChangeStart: function(swiper) {
			beginTimer($('.swiper-slide-active').text());
			swiper.unlockSwipeToPrev();
			$('#userInput').remove();
		},
		onSlidePrevEnd: function(swiper) {
			var wpm = null;
			if (swiper.realIndex == 0) {
				let test = activeCards;
				if (activeCards[1].unknown == null && new Date() < endtime) wpm = ((allottedtime - 2000)/500 + 1)/(Math.floor(new Date()) - Math.floor(endtime) + allottedtime - 600);
				putCard(test[1], true, false, wpm);
				activeCards[1] = Cards.pop();
				let cardString = activeCards[1].string;
				cardString = replaceUnknown(activeCards[1].unknown,cardString);
				$('.swiper-slide-prev').html(cardString);
				$('.swiper-slide-next').html(cardString);
			} else if (swiper.realIndex == 1) {
				let test = activeCards;
				if (activeCards[0].unknown == null && new Date() < endtime) wpm = ((allottedtime - 2000)/500 + 1)/(Math.floor(new Date()) - Math.floor(endtime) + allottedtime - 600);
				putCard(test[0], true, false, wpm);
				activeCards[0] = Cards.pop();
				let cardString = activeCards[0].string;
				cardString = replaceUnknown(activeCards[0].unknown,cardString);
				$('.swiper-slide-prev').html(cardString);
				$('.swiper-slide-next').html(cardString);
			}
		},
		onSlideNextEnd: function(swiper) {
			if (swiper.realIndex == 0) {
				let test = activeCards;
				putCard(test[1], false, false, null);
				activeCards[1] = Cards.pop();
				let cardString = activeCards[1].string;
				cardString = replaceUnknown(activeCards[1].unknown,cardString);
				$('.swiper-slide-prev').html(cardString);
				$('.swiper-slide-next').html(cardString);
			} else if (swiper.realIndex == 1) {
				let test = activeCards;
				putCard(test[0], false, false, null);
				activeCards[0] = Cards.pop();
				let cardString = activeCards[0].string;
				cardString = replaceUnknown(activeCards[0].unknown,cardString);
				$('.swiper-slide-prev').html(cardString);
				$('.swiper-slide-next').html(cardString);
			}
		}
	});
}
function replaceUnknown(unknown, cardString) {
	if (unknown == null) {
		activeUnknown = '';
		return cardString;
	}
	if (unknown[2] == '_') unknown = unknown.slice(3,unknown.length);
	activeUnknown = unknown;
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
	if ($('.swiper-slide-active').find('.unknown').length !== 0) {
		let word = $('.swiper-slide-active').find('.unknown').addClass('learn').text().toLowerCase();
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
					if ($('.swiper-slide-active').find(letter).length == 0) $('.letter').removeClass('digested');
					else {
						$('.swiper-slide-active').find(letter).addClass('digested');
						if ($('.digested').length == $('.swiper-slide-active').find('.letter').length) learnword($('.swiper-slide-active').find('.unknown').text());
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
		var mySwiper = $('.swiper-container-h')[0].swiper;
		if (mySwiper.realIndex == 0 && activeCards[0].unknown !== null) {
			putCard(activeCards[0], false, true, null); 
		} else if (mySwiper.realIndex == 1 && activeCards[1].unknown !== null) {
			putCard(activeCards[1], false, true, null); 
		}
		mySwiper.slideNext();
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
	u1.voice = voices[3];
	u1.voiceURI = 'native';
	u1.volume = 1;
	speechSynthesis.speak(u1);
}