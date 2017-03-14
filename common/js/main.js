/*global $ */
/*global swal */
/*global window */
/*global io */
/*global document */
/*global location */
/*jshint -W030 */


/* GLOBAL VARIABLES */
var order = window.order || {};
var kitchen = window.kitchen || {};
var analytics = window.analytics || {};
var drinkOrder, drinkButton, orderButtons, socket, roomLink, socketHost, totalNumDrinks, selectedDrink, addPersonTxt;
var drinkHtml = '';
var message = '';
var socketHost = '';
var socket = '';
var drinkOrderArray = [];
var drinkListArray = [];
var teaListArray = [];
var milkListArray = [];
//var sugarListArray = [];
var kitchenOrder = {};

var categoryGA, actionGA, labelGA;

/* ON DOM LOAD */

$(document).ready(function () {

	if ($('body').hasClass('dev')) {
		//socket = io.connect('http://localhost');
		socketHost = 'http://localhost';
	} else {
		//    socket = io.connect('http://coffee.fcb.com');
//		socketHost = 'http://coffee.fcb.com';
        socketHost = 'http://localhost';
	}

	socket = io.connect(socketHost);

	if ($('body').hasClass('order')) {
		order.init();
		orderButtons = '<div class="orderButton"><p class="actionLinks"><a href="#" class="delete-drink"><i class="fa fa-trash"> </i></a></p></div>';
//		addPersonTxt = '<span class="drinkPerson"></span><input class="personTxt" placeholder="For who?">';
	}

	if ($('body').hasClass('kitchen')) {
		kitchen.init();
	}
	
	(function (document, navigator, standalone) {
		// prevents links from apps from oppening in mobile safari
		// this javascript must be the first script in your <head>
		if ((standalone in navigator) && navigator[standalone]) {
			var curnode, location = document.location,
				stop = /^(a|html)$/i;
			document.addEventListener('click', function (e) {
				curnode = e.target;
				while (!(stop).test(curnode.nodeName)) {
					curnode = curnode.parentNode;
				}
				// Condidions to do this only on links to your own app
				// if you want all links, use if('href' in curnode) instead.
				if ('href' in curnode && (curnode.href.indexOf('http') || ~curnode.href.indexOf(location.host))) {
					e.preventDefault();
					location.href = curnode.href;
				}
			}, false);
		}
	})(document, window.navigator, 'standalone');

//	$( document ).on(
//    "click",
//    "a",
//    function( event ){
//
//        // Stop the default behavior of the browser, which
//        // is to change the URL of the page.
//        event.preventDefault();
//
//        // Manually change the location of the page to stay in
//        // "Standalone" mode and change the URL at the same time.
//        location.href = $( event.target ).attr( "href" );
//
//    }
//);
});


analytics = {
		event: function (categoryGA, actionGA, labelGA) {
			console.log('GA ', categoryGA, actionGA, labelGA);
			socket.emit('analytics', {
				'Category': categoryGA,
				'Action': actionGA,
				'Label': labelGA
			});

		}

	},

	order = {

		init: function () {

			totalNumDrinks = 0;

			socket.on('start', function (data) {
				drinkListArray = data.drinks;
				teaListArray = data.tea;
				milkListArray = data.milk;
//				sugarListArray = data.sugar;
				drinkOrder = order.buildDrinkObj(drinkListArray);
				console.log('drinkOrder', drinkOrder);
				order.build();
			});


			$('#drinkList').hide();
			$('#listToggle').hide();

			$('#listTab').on('click', function () {
				if (!$(this).hasClass('active')) {
					order.tabToggle($(this).attr('id'));

					/* GA event code */
					categoryGA = 'Button';
					actionGA = 'Nav';
					labelGA = 'List Tab';
					analytics.event(categoryGA, actionGA, labelGA);
				}
			});

			$('#drinksTab').on('click', function () {
				if (!$(this).hasClass('active')) {
					order.tabToggle($(this).attr('id'));

					/* GA event code */
					categoryGA = 'Button';
					actionGA = 'Nav';
					labelGA = 'Drinks Tab';
					analytics.event(categoryGA, actionGA, labelGA);
				}
			});

			$('button.done').on('click', function () {
				order.sendOrder(drinkOrderArray);
			});

			$('button.addMessage').on('click', function () {
				order.addMessage();
			});

			$('#side-nav-button').on('click', function () {
				order.sideNav();
			});

			$('#leftMenu a').on('click', function () {
					categoryGA = 'Button';
					actionGA = 'Nav';
					labelGA = $(this).text();
					analytics.event(categoryGA, actionGA, labelGA);
				});

			roomLink = $('header').attr('class');

			socket.on('orderUp', function (data) {
				if (roomLink == data.room) {
					swal("Coffees ready", "Will be with you shortly", "success");
					drinkOrder = order.buildDrinkObj(drinkListArray);
					order.build();
				}
			});

		},

		tabToggle: function (id) {

			if (id == 'listTab') {
				$('#drinkList').show();
				$('#newOrder').hide();
			} else {
				$('#drinkList').hide();
				$('#newOrder').show();
			}

			order.build();
			$('#listTab').toggleClass('active');
			$('#drinksTab').toggleClass('active');

		},

		addMessage: function () {
			
			if(message === ''){
				totalNumDrinks++;
				if(totalNumDrinks === 1){
					$('#listToggle').fadeIn('fast');
				}
			}
			
			swal({
					title: "",
					text: "Anything else to say?",
					type: "input",
					showCancelButton: true,
					closeOnConfirm: false,
					inputPlaceholder: message
				},
				function (inputValue) {
					if (inputValue === false) {
						return false;
					}
					if (inputValue === "") {
						swal.showInputError("You need to write something");
						return false;
					}
					swal({
						title: inputValue,
						text: "Added to order",
						timer: 1500,
						showConfirmButton: false
					});

					//add to drinkOrder
					message = inputValue;
					order.build();
					$('button.addMessage').html('EDIT MESSAGE');

					/* GA event code */
					categoryGA = 'Button';
					actionGA = 'Message';
					labelGA = message;
					analytics.event(categoryGA, actionGA, labelGA);

				});

			order.closeOptions();
		},


		add: function (drink, options) {
			/* add order to drinkOrder object */
			$('#listToggle').fadeIn('fast');
			drinkOrder[drink].number++;
			totalNumDrinks++;
			// ADD Options

			console.log('options',options);
			
			categoryGA = 'Add';

			if (options === undefined) {
//				if (drink == 'Other') {
//					var optionArrayLength = drinkOrder[drink].option.length;
//					actionGA = drink;
//					labelGA =  drinkOrder.Other.option[optionArrayLength - 1];
//				} else {
					actionGA = drink;
					labelGA = '';
//				}
			} else {
				if (options.hasOwnProperty('tea')) {
					drinkOrder[drink].option.push({
						'tea': options.tea,
						'milk': options.milk,
//						'sugar': options.sugar,
						'drinker': options.drinker
					});
					actionGA = options.tea;
					labelGA = options.milk;
				} else if (options.hasOwnProperty('other')) {
					drinkOrder[drink].option.push({
						'other': options.other,
						'drinker': options.drinker
					});
					actionGA = options.other;
					labelGA = '';
				} else {
					drinkOrder[drink].option.push({
						'milk': options.milk,
//						'sugar': options.sugar,
						'drinker': options.drinker
					});
					actionGA = drink;
					labelGA = options.milk;
				}
			}

			window.setTimeout(order.build, 100);

			analytics.event(categoryGA, actionGA, labelGA);

			return drinkOrder[drink].number;
		},

		delete: function (drink, id) {
			
			categoryGA = 'Delete';

			if (!drink) {
				analytics.event(categoryGA, 'Message', message);
				message = '';
				order.build();
				$('button.addMessage').html('ADD MESSAGE');

			} else {

				if (drink == 'Water') {
					if (drinkOrder[drink].number === 0) {
						$(".drink[data-drink='" + drink + "'] p.drinkIcon span.drinkNumber").html('');
					} else {
						$(".drink[data-drink='" + drink + "'] p.drinkIcon span.drinkNumber").html(' x ' + drinkOrder[drink].number);
					}
					actionGA = drink;
					labelGA = '';
				} else if(drink == 'Other'){
					actionGA = drink;
					labelGA =  drinkOrder.Other.option[id];
				} else if(drink == 'Tea'){
					actionGA = drinkOrder.Tea.option[id].tea ;
					labelGA =  drinkOrder.Tea.option[id].milk ;
				} else {
					actionGA = drink;
					labelGA =  drinkOrder[drink].option[id].milk ;
				}

				analytics.event(categoryGA, actionGA, labelGA);

				$(".drink[data-drink='" + drink + "'] p.drinkIcon span.drinkNumber").html('');

				drinkOrder[drink].number--;
			}
			
			totalNumDrinks--;
			order.build();

			if (totalNumDrinks === 0) {
				$('#listToggle').fadeOut('fast', order.tabToggle('drinksTab'));
//					console.log('hide list toggle');
			}
			console.log('totalNumDrinks',totalNumDrinks);
		},

		build: function () {

			var i = 0;
			drinkHtml = ''; // Html for list of drinks
			drinkOrderArray = [];
			drinkButton = ''; // Number of drinks on the button

			for (var drink in drinkOrder) {
				var drinkName = drink;
				var drinkAmount = drinkOrder[drink].number;

//				console.log('drinkOrder[drink] ',drinkOrder[drink]);
				
				if (drinkOrder[drink].number > 0) {
					if (drinkName == "Other") {
						for (var j = 0; j < drinkOrder.Other.option.length; j++) {
							drinkHtml += '<li class="order other" data-drink="' + drinkName + '" data-id="' + j + '"><div class="orderText"><p> <span class="drinkName">' + drinkOrder[drink].option[j].other + '</span><span class="drinkPerson">'+drinkOrder[drink].option[j].drinker+'</span></p></div>' + orderButtons + '</li>';
							drinkOrderArray.push(drinkOrder[drink].option[j].other + ': ' + drinkOrder[drink].option[j].drinker);
						}
					} else if (drinkName == "Water") {
						drinkHtml += '<li class="order water" data-drink="' + drinkName + '"><div class="orderText"><p> <span class="drinkName">' + drinkAmount + '</span> x <span class="drinkName">' + drinkName + '</span><span class="drinkPerson"></span></p></div>' + orderButtons + '</li>';
						drinkOrderArray.push(drinkAmount + ' x ' + drinkName);
					} else if (drinkName == "Tea") {
						for (var l = 0; l < drinkOrder[drink].option.length; l++) {
							drinkHtml += '<li class="order tea" data-drink="' + drinkName + '" data-id="' + l + '"><div class="orderText"><p> <span class="drinkName">' + drinkOrder[drink].option[l].tea + '</span> - <span class="drinkOption">' + drinkOrder[drink].option[l].milk +  '</span><span class="drinkPerson">'+drinkOrder[drink].option[l].drinker+'</span></p></div>' + orderButtons + '</li>';
							drinkOrderArray.push(drinkOrder[drink].option[l].tea + ' - ' + drinkOrder[drink].option[l].milk +  ': ' + drinkOrder[drink].option[l].drinker);
						}
					} else {
						for (var k = 0; k < drinkOrder[drink].option.length; k++) {
							drinkHtml += '<li class="order ' + drinkName + '" data-drink="' + drinkName + '" data-id="' + k + '"><div class="orderText"><p> <span class="drinkName">' + drinkName + '</span> - <span class="drinkOption">' + drinkOrder[drink].option[k].milk + '</span><span class="drinkPerson">'+drinkOrder[drink].option[k].drinker+'</span></p></div>' + orderButtons + '</li>';
							drinkOrderArray.push(drinkName + ' - ' + drinkOrder[drink].option[k].milk + ': ' + drinkOrder[drink].option[k].drinker);
						}
					}
					drinkButton += '<div data-drink="' + drinkName + '" class="drink"><p class="drinkIcon"><i class="fa fa-coffee  fa-2x"><span class="drinkNumber">x <span class="num">' + drinkAmount + '</span></span></i></p><p class="drinkName">' + drinkName + '</p>';
				} else {
					drinkButton += '<div data-drink="' + drinkName + '" class="drink"><p class="drinkIcon"><i class="fa fa-coffee  fa-2x"></i></p><p class="drinkName">' + drinkName + '</p>';
				}
				if (i < 6) { // add triangle first 6 boxes
					drinkButton += '<div class="triangle-down"></div></div>';
				} else {
					drinkButton += "</div>";
				}

				// add options field
				if (i % 2 == 1 && i < 8) {
					drinkButton += '<div class="options"></div>';
				}

				i++;
			}

			/* Message */
			if (message !== '') {
				//			drinkHtml += '<li class="message"><div class="orderText"><p>' +message+'</li>';
				drinkHtml += '<li class="order message"><div class="orderText"><p> <span class="drinkName">' + message + '</span></p></div>' + orderButtons + '</li>';
			}


			/* Build list */
			$('#newOrder').html(drinkButton);
			$('#drinkList ul').html(drinkHtml);

			/* add click event to delete button */
			$('.delete-drink').on('click', function () {
				var drink = $(this).parent().parent().parent().data('drink');
				var id = $(this).parent().parent().parent().data('id');
				var water = $(this).parent().parent().parent().hasClass('water');
				var msg = $(this).parent().parent().parent().hasClass('message');

				order.delete(drink, id);


				if (!water && !msg) { // delete options
					var optionsArray = drinkOrder[drink].option;
					for (var i = 0; i < optionsArray.length; i++) {
						if (i === id) {
							optionsArray.splice(i, 1);
						}
					}
				}

			});
			
				/* add click event to name button */
//			$('.name-drink').on('click', function () {
//				var drink = $(this).parent().parent().parent().data('drink');
//				var id = $(this).parent().parent().parent().data('id');
//				console.log(drink,id);
//				
//			});

			$("#newOrder .drink").each(function () {

				$(this).on('click', function () {
					var drink = $(this).data('drink');


					if ($(this).hasClass('open')) {
						$(this).removeClass('open');
						order.closeOptions();
					} else {
						$('.drink').removeClass('open');
						$(this).addClass('open');
//						if (drink == "Other") {
//							swal({
//									title: "What would you like to order? ",
//									text: "",
//									type: "input",
//									showCancelButton: true,
//									closeOnConfirm: false,
//									inputPlaceholder: "Coke, Ginger beer, etc"
//								},
//							function (inputValue) {
//									if (inputValue === false) {
//										return false;
//									}
//									if (inputValue === "") {
//										swal.showInputError("You need to write something");
//										return false;
//									}
//									swal({
//										title: inputValue,
//										text: "Added to order list",
//										timer: 1500,
//										showConfirmButton: false
//									});
////									var drinkNum = order.add(drink);
//
//									drinkOrder.Other.option[drinkOrder.Other.number] = inputValue;
//									order.add(drink);
//									order.build();
//									$(this).find('span.drinkNumber').html('');
//									$(this).find('span.drinkNumber').html('x <strong>' + drinkNum + '</strong>');
//
//								/* GA event code */
//									categoryGA = 'Button';
//									actionGA = 'Drink';
//									labelGA = inputValue;
//									analytics.event(categoryGA, actionGA, labelGA);
//								});
//
//							order.closeOptions();
//						} 
//						 else
						if (drink == "Water") {
							var drinkNum = order.add(drink);
							$(this).find('span.drinkNumber').html('');
							$(this).find('span.drinkNumber').html('x <strong>' + drinkNum + '</strong>');

							/* GA event code */
							categoryGA = 'Button';
							actionGA = 'Drink';
							labelGA = drink;
							analytics.event(categoryGA, actionGA, labelGA);

						} else {
							order.closeOptions();
							order.openOptions($(this));

							/* GA event code */
							categoryGA = 'Button';
							actionGA = 'Drink';
							labelGA = drink;
							analytics.event(categoryGA, actionGA, labelGA);

						}
					}
				});
			});
		},

		closeOptions: function () {
			$('.options').css('height', '0px');
			$('.triangle-down').css({
				'border-left': '0px solid transparent',
				'border-right': '0px solid transparent',
				'bottom': '0px'
			});
			$('.copy').css('display', 'none');
		},

		openOptions: function (el) {
			el.find('.triangle-down').css({
				'border-left': '10px solid transparent',
				'border-right': '10px solid transparent',
				'bottom': '-15px'
			});

			var optionsSelected;
			var newDrinkWithOptions = {};

			if (el.next().attr('class') == "options") {
				optionsSelected = el.next();
			} else {
				optionsSelected = el.next().next();
			}

			selectedDrink = el.data('drink');

			if (selectedDrink == "Tea") {
				optionsSelected.css('height', '160px');
				order.teaDialog(optionsSelected, newDrinkWithOptions);
			} else if (selectedDrink == "Other") {
				optionsSelected.css('height', '110px');
				order.otherDialog(optionsSelected, newDrinkWithOptions);
			} else {
				optionsSelected.css('height', '110px');
				order.milkDialog(optionsSelected, newDrinkWithOptions);
			}

		},

		sent: function () {
			swal({
					title: "Order sent to Kitchen",
					text: "The barista is making your drinks",
					type: "success",
					showCancelButton: true,
					confirmButtonColor: "#AEDEF4",
					confirmButtonText: "Send to my email",
					cancelButtonColor: "#AEDEF4",
					cancelButtonText: "OK",
					closeOnConfirm: false
				},
				function (isConfirm) {
					if (isConfirm) {
						swal({
								title: "",
								text: "Your email address",
								type: "input",
								showCancelButton: true,
								closeOnConfirm: false,
								inputPlaceholder: 'email'
							},
							function (inputValue) {
								if (inputValue === false) {
									return false;
								}
								if (inputValue === "") {
									swal.showInputError("Please add an email");
									return false;
								}

								order.sendOrder(drinkOrderArray, inputValue);

								console.log(inputValue);

							});
					}
				});
		},

		sendOrder: function (drinkOrderArray, anotherEmail) {

			/* GA event code */
			categoryGA = 'Button';
			actionGA = 'Nav';

			if(anotherEmail === undefined){
				labelGA = 'Place Order';
			} else {
				labelGA = 'Send To Another Email : '+ anotherEmail;
			}

			analytics.event(categoryGA, actionGA, labelGA);


			var from, to, subject, text, roomName, time, roomLink, bcc;

			var now = new Date();
			var hours = now.getHours();
			var minutes = now.getMinutes().toString();

			if (minutes < 10) {
				time = hours + ':0' + minutes;
			} else {
				time = hours + ':' + minutes;
			}
			roomName = $('header h1').html().replace(": Order", "");
			roomLink = $('header').attr('class');

			var maillist = ['Akl.Reception@fcb.com', 'Rebecca.Odom@fcb.com', 'holly.crawford@fcb.com', 'Kate.Tucker@fcb.com', 'tony.susi@fcb.com'];
//			var maillist = ['tony.susi@fcb.com'];

			if(anotherEmail){
				to = anotherEmail;
			} else {
				if(socketHost == 'http://coffee.fcb.com' ){
					to = maillist;
				} else {
					to = ['tony.susi@fcb.com'];
				}
			}

			bcc = ['tonysusi@gmail.com'];
			subject = 'New Coffee Order for ' + roomName;
			from = 'FCB Barista <barista@fcb.com>';
			text = roomName + "\n" +
				"===========\n" +
				"\n";

			console.log('drinkOrderArray', drinkOrderArray);
			console.log('to', to);

			for (var i = 0; i < drinkOrderArray.length; i++) {
				text += drinkOrderArray[i] + "\n";
			}
			text += "\n";
			if (message !== '') {
				text += "-----------\n" +
					"Message: " + message;
			}
			text += "\n-----------\n" +
				"Ordered at " + time;

			socket.emit('order', {
				'time': time,
				'room': roomName,
				'drinkOrder': drinkOrder,
				'roomLink': roomLink,
				'message': message
			}, order.sent());

//			console.log('time', time, 'room', roomName, 'drinkOrder', drinkOrder, 'roomLink', roomLink);

			/* SEND EMAIL*/
			$.get(socketHost + ":3003/send", {
				to: to,
				bcc: bcc,
				from: from,
				subject: subject,
				text: text,
				drinkOrder: drinkOrder,
				roomLink: roomLink
			}, function (data) {
				if (data == "sent") {
					console.log('data sent');
					if(anotherEmail){
						swal({
							title: "Order emailed to",
							text: inputValue,
							timer: 1500,
							showConfirmButton: false
						});
					}
				}
			});

		},
		milkDialog: function (optionsSelected, newDrinkWithOptions) {

			optionsSelected.css('height', '110px');

			var htmlCode = '<div class="copy"><p>Type of Milk</p><ul class="milk"><li>';
			var iStart;

			if (selectedDrink == 'Latte' || selectedDrink == 'Flat White' || selectedDrink == 'Cappuccino' || selectedDrink == 'Cappuccino') {
				iStart = 1;
			} else {
				iStart = 0;
			}

			for (var i = iStart; i < milkListArray.length; i++) {
				htmlCode += '<li><button data-milk="' + milkListArray[i] + '">' + milkListArray[i] + '</button></li>';
			}

			htmlCode += '</ul></div>';

			optionsSelected.html(htmlCode);

			window.setTimeout(function () {
				optionsSelected.find('.copy').fadeIn('fast');
			}, 100);
			// ADD click events to milk
			$('ul.milk li button').on('click', function () {
				newDrinkWithOptions.milk = $(this).data('milk');
//				console.log('newDrinkWithOptions', selectedDrink, newDrinkWithOptions)
//				order.sugarDialog(optionsSelected, newDrinkWithOptions);
				order.drinkerDialog(optionsSelected, newDrinkWithOptions);
				
				categoryGA = 'Button';
				actionGA = 'Milk';
				labelGA = $(this).data('milk');
				analytics.event(categoryGA, actionGA, labelGA);
			});
		},
		drinkerDialog: function (optionsSelected, newDrinkWithOptions) {

			optionsSelected.css('height', '110px');

			var htmlCode = '<div class="copy"><p>Who is this for?</p><ul class="drinker"><li>';

			htmlCode += '<li><input type="text" class="drinker"><button class="drinkerButton">done</button></li>';
			
			htmlCode += '</ul></div>';

			optionsSelected.html(htmlCode);

			window.setTimeout(function () {
				optionsSelected.find('.copy').fadeIn('fast');
				optionsSelected.find('input').focus();
			}, 100);
			// ADD click events to drinker
			$('ul.drinker li button').on('click', function () {
//				console.log($(this).siblings('input')[0].value,$(this).siblings('input'));
				
				newDrinkWithOptions.drinker = $(this).siblings('input')[0].value;
				console.log('newDrinkWithOptions', selectedDrink, newDrinkWithOptions)
				order.closeOptions();
				order.add(selectedDrink, newDrinkWithOptions);

				categoryGA = 'Button';
				actionGA = 'Drinker';
				labelGA = $(this).siblings('input')[0].value;
				analytics.event(categoryGA, actionGA, labelGA);
			});
		},	
		otherDialog: function (optionsSelected, newDrinkWithOptions) {

			
			
			optionsSelected.css('height', '110px');

			var htmlCode = '<div class="copy"><p>What would you like to order?</p><ul class="other"><li>';

			htmlCode += '<li><input type="text" class="other"><button class="otherButton">Next</button></li>';
			
			htmlCode += '</ul></div>';

			optionsSelected.html(htmlCode);
			
			
			window.setTimeout(function () {
				optionsSelected.find('.copy').fadeIn('fast');
				optionsSelected.find('input').focus();
			}, 100);
			
			// ADD click events to drinker
			$('ul.other li button').on('click', function () {
//				console.log($(this).siblings('input')[0].value,$(this).siblings('input'));
				
				newDrinkWithOptions.other = $(this).siblings('input')[0].value;
				console.log('newDrinkWithOptions', selectedDrink, newDrinkWithOptions)
//				order.closeOptions();
//				order.add(selectedDrink, newDrinkWithOptions);
				order.drinkerDialog(optionsSelected, newDrinkWithOptions);

				categoryGA = 'Button';
				actionGA = 'Other';
				labelGA = $(this).siblings('input')[0].value;
				analytics.event(categoryGA, actionGA, labelGA);
			});
		},	
		teaDialog: function (optionsSelected, newDrinkWithOptions) {
			var htmlCode = '<div class="copy"><p>Type of Tea</p><ul class="tea"><li>';

			for (var i = 0; i < teaListArray.length; i++) {
				htmlCode += '<li><button data-tea="' + teaListArray[i] + '">' + teaListArray[i] + '</button></li>';

			}
			htmlCode += '</ul></div>';

			optionsSelected.html(htmlCode);

			window.setTimeout(function () {
				optionsSelected.find('.copy').fadeIn('fast');
			}, 100);


			// ADD click events to tea
			$('ul.tea li button').on('click', function () {
				newDrinkWithOptions.tea = $(this).data('tea');
//				console.log('newDrinkWithOptions', selectedDrink, newDrinkWithOptions);
				order.milkDialog(optionsSelected, newDrinkWithOptions);

				categoryGA = 'Button';
				actionGA = 'Drink';
				labelGA = $(this).data('tea');
				analytics.event(categoryGA, actionGA, labelGA);
			});

		},
//		sugarDialog: function (optionsSelected, newDrinkWithOptions) {
//			var htmlCode = '<div class="copy"><p>Sugar?</p><ul class="sugar"><li>';
//
//			for (var i = 0; i < sugarListArray.length; i++) {
//				htmlCode += '<li><button data-sugar="' + sugarListArray[i] + '">' + sugarListArray[i] + '</button></li>';
//
//			}
//			htmlCode += '</ul></div>';
//
//			optionsSelected.html(htmlCode);
//
//			window.setTimeout(function () {
//				optionsSelected.find('.copy').fadeIn('fast');
//			}, 100);
//
//			// ADD click events to sugar
//			$('ul.sugar li button').on('click', function () {
//				newDrinkWithOptions.sugar = $(this).data('sugar');
////				console.log('newDrinkWithOptions', selectedDrink, newDrinkWithOptions);
////				order.closeOptions();
////				order.add(selectedDrink, newDrinkWithOptions);
//				order.drinkerDialog(optionsSelected, newDrinkWithOptions);
//
//				categoryGA = 'Button';
//				actionGA = 'Sugar';
//				labelGA = $(this).data('sugar');
//				analytics.event(categoryGA, actionGA, labelGA);
//			});
//		},
		buildDrinkObj: function (list) {
			var drinkOrderNew = {};
			for (var i = 0; i < list.length; i++) {
				var drinkName = list[i];
				//        console.log('drinkName',drinkName);
				if (drinkName == "Other") {
					drinkOrderNew[drinkName] = {
						"number": 0,
						'option': []
					};
				} else if (drinkName == "Water") {
					drinkOrderNew[drinkName] = {
						"number": 0
					};
				} else {
					drinkOrderNew[drinkName] = {
						"number": 0,
						"option": []
					};
				}
			}
			return drinkOrderNew;
		},
		sideNav: function () {
			var state;
//			$('body').toggleClass("side-nav-push-toright");
//			$('#leftMenu').toggleClass("side-nav-open");

			if($('#leftMenu').hasClass("side-nav-open")){
				state = ':Open';
				$( "#leftMenu" ).removeClass( "side-nav-open" );
				$('body').removeClass("side-nav-push-toright");
			} else {
				state = ':Close';
				$( "#leftMenu" ).addClass( "side-nav-open" );
				$('body').addClass("side-nav-push-toright");

			}

			/* GA event code */
			categoryGA = 'Button';
			actionGA = 'Nav';
			labelGA = 'Side Nav'+state;
			analytics.event(categoryGA, actionGA, labelGA);

		}
	},

kitchen = {
	init: function () {

		var start = false;

		socket.on('start', function (data) {
			//      console.log('data.rooms',data.rooms);
			if (!start) {
				for (var room in data.rooms) {
					kitchenOrder[data.rooms[room].link] = {
						"name": data.rooms[room].name,
						"short": data.rooms[room].short,
						"link": data.rooms[room].link,
						"order": {},
						"time": false,
						"message": ""
					};
				}
				start = true;
				//        console.log('KitchenOrder created', start);
			}
		});

		socket.on('order', function (data) {

			//      update kitchenOrder with new order
			$.each(kitchenOrder, function (i, order) {
				if (order.link == data.roomLink) {
					kitchenOrder[i].order = data.drinkOrder;
					kitchenOrder[i].time = data.time;
					kitchenOrder[i].message = data.message;
				}
			});
			kitchen.build(kitchenOrder);
		});
	},
	build: function (kitchenOrder) {

		console.log(kitchenOrder);
		var newOrderHtml = '';

		$.each(kitchenOrder, function (i, order) {
			if (order.time !== false) {

				console.log('build', kitchenOrder[i].name, kitchenOrder[i].order, kitchenOrder[i].message, order);

				var orderHeader = '<div class="orderHeader ' + kitchenOrder[i].link + '" data-room="' + kitchenOrder[i].link + '"><h2>' + kitchenOrder[i].name + '</h2><p>' + kitchenOrder[i].time + '</p><a class="btn orderDone" >done</a></div>';

				var drinks = '<ul>';

				if (kitchenOrder[i].message) {
					drinks += '<li class="message">' + kitchenOrder[i].message + '</li>';
				}

				$.each(kitchenOrder[i].order, function (i, drink) {
					console.log('drink', drink, i);
					if (drink.number > 0) {
						if (i == 'Water') {
							drinks += '<li>' + drink.number + ' x ' + i + '</li>';
						} else if (i == 'Tea') {
							for (var j = 0; j < drink.option.length; j++) {
								drinks += '<li>' + drink.option[j].tea + ' - ' + drink.option[j].milk +'</li>';
							}
						} else if (i == 'Other') {
							for (var l = 0; l < drink.option.length; l++) {
								drinks += '<li>' + drink.option[l] + '</li>';
							}
						} else {
							for (var k = 0; k < drink.option.length; k++) {
								drinks += '<li>' + i + ' - ' + drink.option[k].milk + '</li>';
							}
						}
					}
				});

				drinks += '</ul>';

				newOrderHtml = newOrderHtml + orderHeader + drinks;

			}
		});

		$('#orders').html(newOrderHtml);

		//    set event on done button
		$("a.orderDone").each(function () {
			$(this).on('click', function () {
				//            var roomLink = ;
				console.log('is this a roomLink', $(this).parent().data('room'));
				kitchen.done($(this).parent().data('room'));
				$(this).parent().hide();
				$(this).parent().next().hide();

				kitchenOrder[$(this).parent().data('room')].order = {};
				kitchenOrder[$(this).parent().data('room')].time = false;

				console.log(kitchenOrder, $(this).parent().data('room'));
			});
		});

	},
	done: function (sendToRoom) {
		socket.emit('orderUp', {
			'msg': sendToRoom + ' order complete',
			room: sendToRoom
		});
	}
};
