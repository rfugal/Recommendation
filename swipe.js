var Cards;
$(document).ready(function () {
	Cards = JSON.parse($('#lambdaResponse').text());
	Cards.unshift({string:'No More Cards',stringId:null});	
	Cards.unshift({string:'Refresh Page',stringId:null});	
	let countDown = document.createElement('canvas');
	$(countDown).attr({'id':'timer','width':'400','height':'400'});
	let learn = document.createElement('div');
	$(learn).attr('id','learnCard').text('abc').on('click', function (){
		$('.flipside').hide();
		$('#learnCard').hide();
		$('.swiper-wrapper-h').show();
		let userInput = document.createElement('div');
		$(userInput).attr('id','userInput');
		var mySwiper = $('.swiper-container-h')[0].swiper;
		mySwiper.lockSwipeToPrev();
		if (activeCards[mySwiper.realIndex].unknown !== undefined) {
			let unknown = activeCards[mySwiper.realIndex].unknown;
			if (unknown !== null) {
				if (unknown[2] == '_') unknown = unknown.slice(3,unknown.length);
				let parsed_unknown = document.createElement('span');
				for (i=0; i<unknown.length; i++) {
					let letter = document.createElement('span');
					$(letter).addClass('letter_' + unknown[i].toLowerCase()).text(unknown[i]);
					$(parsed_unknown).append(letter);
					if ($('.button_' + unknown[i].toLowerCase()).length == 0) {
						let letter_button = document.createElement('button');
						$(letter_button).addClass('letterButton').text(unknown[i]).on('click', function() {
							$('.letter_'+unknown[i].toLowerCase).addClass('deconstructed');
						});
						$(userInput).append(letter_button);
					}
				}
				let cardString = activeCards[mySwiper.realIndex].string;
				cardString = cardString.replace(unknown, "<span class='unknown'>" + $(parsed_unknown).html() + "</span>");
				$('.swiper-slide-active').html(cardString);
			}
		}
		let textbox = document.createElement('input');
		$(textbox).attr({'type':'text','id':'typeHere','placeholder':'type the red word here'});
		let submitbutton = document.createElement('button');
		$(submitbutton).text('OK').attr('id','submitbutton');
		$(userInput).append(textbox, "<br/>", submitbutton);
		$('body').append(userInput);
		$('#submitbutton').on('click', function() {
			learnword();
		});
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
	$(Card).append(activeCards[0].string);
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
				//$('#currently-tagged').text('Recognized ' + test[1].stringId);
				if (activeCards[1].unknown == null && new Date() < endtime) wpm = ((allottedtime - 2000)/500 + 1)/(Math.floor(new Date()) - Math.floor(endtime) + allottedtime - 600);
				putCard(test[1], true, false, wpm);
				activeCards[1] = Cards.pop();
				$('.swiper-slide-prev').text(activeCards[1].string);
				$('.swiper-slide-next').text(activeCards[1].string);
			} else if (swiper.realIndex == 1) {
				let test = activeCards;
				//$('#currently-tagged').text('Recognized ' + test[0].stringId);
				if (activeCards[0].unknown == null && new Date() < endtime) wpm = ((allottedtime - 2000)/500 + 1)/(Math.floor(new Date()) - Math.floor(endtime) + allottedtime - 600);
				putCard(test[0], true, false, wpm);
				activeCards[0] = Cards.pop();
				$('.swiper-slide-prev').text(activeCards[0].string);
				$('.swiper-slide-next').text(activeCards[0].string);
			}
		},
		onSlideNextEnd: function(swiper) {
			if (swiper.realIndex == 0) {
				let test = activeCards;
				//$('#currently-tagged').text('Unknown ' + test[1].stringId);
				putCard(test[1], false, false, null);
				activeCards[1] = Cards.pop();
				$('.swiper-slide-prev').text(activeCards[1].string);
				$('.swiper-slide-next').text(activeCards[1].string);
			} else if (swiper.realIndex == 1) {
				let test = activeCards;
				//$('#currently-tagged').text('Unknown ' + test[0].stringId);
				putCard(test[0], false, false, null);
				activeCards[0] = Cards.pop();
				$('.swiper-slide-prev').text(activeCards[0].string);
				$('.swiper-slide-next').text(activeCards[0].string);
			}
		}
	});
}
function learnword () {
	let userInput = $('#typeHere').val();
	userInput = /\b[A-z']+/.exec(userInput)[0].toLowerCase();
	console.log(userInput);
	$('#userInput').remove();
	var mySwiper = $('.swiper-container-h')[0].swiper;
	if (mySwiper.realIndex == 0 && activeCards[0].unknown !== null) {
		let comp = activeCards[0].unknown;
		if (comp[2] == '_') comp = comp.slice(3,comp.length);
		console.log(comp);
		if (comp == userInput) putCard(activeCards[0], false, true, null); 
	} else if (mySwiper.realIndex == 1 && activeCards[1].unknown !== null) {
		let comp = activeCards[1].unknown;
		if (comp[2] == '_') comp = comp.slice(3,comp.length);
		console.log(comp);
		if (comp == userInput) putCard(activeCards[1], false, true, null); 
	}
	mySwiper.slideNext();
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
