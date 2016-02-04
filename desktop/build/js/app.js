/*
 * App JS
 */
var lang = {
    basketProductAddError: 'Произошла ошибка. Товар не может быть добавлен в корзину.',
    basketProductAddSuccess: 'Товар успешно добавлен в корзину.',
    basketProductClear: 'Корзина очищена',
    basketProductClearError: 'Произошла ошибка при очистке корзины. Обновите страницу и попробуйте снова.',
    basketRequestDelete: 'Вы уверены что хотите удалить товар из корзины?',
    buttonTextInBasket: 'В корзине',
    product: 'товар',
    currencySymbol: '&#x20bd;',
    DeliveryDate: 'Дата доставки',
    DeliveryFormattedString: 'Доставка на {1} {2}',
    morning: 'Утро',
    afternoon: 'День',
    evening: 'Вечер',
    creditcardquestdelete: 'Вы уверены что хотите удалить карту "{1}"?',
    creditcardNotFound: 'У вас не привязано ни одной карты',
    dialogChangePhoneAlert: 'Изменение телефонного номера привяжет вашу историю заказов к новому номеру',
    dialogEditButton: 'Редактировать',
    dialogDismissButton: 'Отмена',
    dialogDeleteButton: 'Удалить',
    dialogCloseButton: 'Закрыть',
    deliveryaddressrequestdelete: 'Вы уверены что хотите удалить адрес доставки "{1}"?',
    deliveryaddressNotFound: 'У вас не привязано ни одного адреса доставки. Чтобы привязать адрес вам необходимо создать любой заказ',
    processCallbackTitle: 'Заказ<br>звонка',
    processPhoneCheck: 'Проверка<br>номера телефона',
    processConfirmCheck: 'Проверка<br>кода',
    processSave: 'Сохранение данных',
    processAuthorization: 'Пожалуйста подождите',
    loading: 'Ожидайте',
    bouquet: 'Букет',
    bouquetNotFound: 'Доступных букетов не найдено',
    bouquetInBasketPopupCart: 'В корзине {1} на {2}'
};
var app;
var ajaxloader;
var settings;
var device = {};

$(function() {
	var $w = $(window);
	settings = {
	    env: 'dev', // clear to production
	    loadBouquets: 6,
	    imageBouquetsBrightnessThreshold: 110,
	    timeoutResendConfirmPhoneCode: 60 //seconds
	}

	app = {
		init: function() {
			moment.locale('ru');
			app.device.getInfo();
			app.layout.initStyle();
			app.content.initStyle();

			app.bind.document();
			app.bind.forms();
			app.bind.buttons();
			app.sidebar.init();
			app.widgets.load();

			app.checkout.load(); // Get Basket info
		},
		device: {
			getInfo: function() {
				var ob = $('body');
				var height = $w.height();
				var width = $w.width();
				if( width > height ) {
					device.orientation = 'landscape';
					if (ob.hasClass('portrait')) {
						ob.removeClass('portrait').addClass('landscape');
					}
					else
						ob.addClass('landscape');
				} else {
					device.orientation = 'portrait';
					if (ob.hasClass('landscape')) {
						ob.removeClass('landscape').addClass('portrait');
					}
					else
						ob.addClass('portrait');
				}

				if(width >= 1441){
					device.type = 'desktop';
					device.subtype = 'fullhd';
				}

				if( width >= 1281 && width <= 1440 ){
					device.type = 'desktop';
					device.subtype = 'hd';
				}

				if( width >= 1024 && width <= 1280 ){
					device.type = 'desktop';
					device.subtype = 'small';
				}

				if(width >= 768 && width <= 1023)
					device.type = 'planshet';
				if(width < 768)
					device.type = 'mobile';
				if(width <= 320)
					device.type = 'smallmobile';

				device.windowHeight = height;
				device.windowWidth = width;

				if(settings.env  == 'dev') {
					console.log('[DEVICE] Get device data')
					console.log(device);
				}
			}
		},
		resize: function() {
			if(settings.env  == 'dev')
				console.log('[APP] Window size is changed')

			if(app.popup.isOpened())
				app.popup.hide();

			app.device.getInfo();
			app.sidebar.initStyle();
			app.content.initStyle();
			app.layout.initStyle();

			if(app.widgets.calendar && app.widgets.calendar.loaded)
				app.widgets.calendar.setPosition();
		},
		scroll: function() {

		},
		bind: {
			document: function() {
				$(document).ready(function(){
					$('input[type="tel"]').mask('+7(999)999-9999');
					$('input[name="phone"]').mask('+7(999)999-9999');
				});
				$(document).keyup(function(e) {
					if (e.keyCode == 27 && app.popup.isOpened())
						app.popup.hide();   // esc
				});
				$('body').swipe( {
					swipeRight:function(event, direction, distance, duration, fingerCount) {
						if(settings.env == 'dev')
							console.log('TouchSwipe Right Event');

						var target = $(event.target);
						if( (device.type == 'desktop' && device.subtype == 'small') || device.type != 'desktop') {
							//console.log(target);
							//console.log(!target.is('body'));
							//console.log(target.closest('div[class^="owl-item"]').length == 0);
							//console.log((target.closest('div[class^="modal"]').length == 0 && !target.hasClass('modal')));
							if (
								!target.is('body') &&
								target.closest('div[class^="owl-item"]').length == 0 &&
								(target.closest('div[class^="modal"]').length == 0 && !target.hasClass('modal'))
							)
								app.popup.show('#sidebar');
						}

					},
					swipeLeft:function(event, direction, distance, duration, fingerCount) {
						if(settings.env == 'dev')
							console.log('TouchSwipe Left Event');
						if(app.sidebar.isOpened())
							app.popup.hide();
					}
				});

				$('.tooltip').tooltipster({
					animation: 'grow'
				});


				// Popup
				$(document).on('click', '*[data-toggle="popup"]', function(e) {
					var order = $(this).data('order') ? $(this).data('order') : false;
					app.popup.show($(this).data('target'), order);
				});
				$(document).on('click', '#popup-bg', function() {
					app.popup.hide();
				});
				$(document).on('click', 'button.popup-close', function() {
					app.popup.hide();
				});

				// Modal
				$(document).on('click', 'button.modal-close', function(e) {
					if($.magnificPopup)
						$.magnificPopup.close();
				});

				// Basket
				$(document).on('click', 'button[data-toggle="to-basket"]', function(e) {
					event.preventDefault();
					e.stopPropagation();
					app.basket.add(e);
				});
				$(document).on('click', 'button[data-toggle="clear-basket"]', function() {
					app.basket.clear();
				});


			},
			forms: function() {

			},
			buttons: function() {
				$('button[data-toggle="modal"]').on('click', function() {
					$.magnificPopup.open({
						type:'inline',
						items: {
							src: $(this).data('target')
						},
						removalDelay: 500,
						showCloseBtn: false,
						callbacks: {
							beforeOpen: function() {
								this.st.mainClass = 'mfp-zoom-in';
							}
						},
						midClick: true
					});
				})

				$('button[data-toggle="dialog"]').on('click', function() {
					var title = ($(this).data('title')?$(this).data('title'):'');
					var content = ($(this).data('content')?$(this).data('content'):'');
					app.modal.dialog({
						title: title,
						content: content,
						buttons: {
							yes: {
								title: 'ОК',
								class: 'edit',
								action: function(){
									if(settings.env == 'dev') console.log('[Dialog (default)] Confirmed');
									app.modal.lastConfirmed = true;
								}
							},
							no: {
								title: lang.dialogCloseButton,
								class: 'dismiss',
								action: function(){ if(settings.env == 'dev') console.log('[Dialog (default)] Not confirmed'); app.modal.lastConfirmed = false; }
							}
						}
					});
				});

			}
		},
		sidebar: {
			opened: false,
			isOpened: function() {
				return this.opened;
			},
			init: function() {
				var _this = this;
				var sidebar;
				this.sidebarObj = sidebar = $('#sidebar');

				sidebar.on('open', function() {
					_this.open();
				});
				sidebar.on('close', function() {
					_this.close();
				});
				$('button[data-toggle="close-sidebar"]').on('click', function() {
					$(this).addClass('closing');
					$(this).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {

					});
					if($(this).hasClass('closing'))
						$(this).removeClass('closing');
					app.sidebar.close();
				});

				this.initStyle();

				$(document).on('raketa.bouquets.loaded', function() {
					var offset = 0;
					var content = $("#bouquet-list");
					if(settings.env == 'dev')
						console.log('[SIDEBAR] Bouquets new loaded check style sidebar');
					if(
						content.length &&
						(content.outerHeight() + $('#header').height()) < device.windowHeight - sidebar.find('.sidebar-bottom').height()
					) {
						console.log(offset);
						offset = (device.windowHeight - content.height()) - content.offset().top - sidebar.find('.sidebar-bottom').height();
						sidebar.find('.sidebar-bottom').css({bottom: offset});
					} else {
						sidebar.find('.sidebar-bottom').css({bottom: 0});
					}
				});
			},
			initStyle: function() {
				var sidebar = this.sidebarObj;
				if(device.type == 'desktop' && (device.subtype == 'hd' || device.subtype == 'fullhd'))
					sidebar.removeClass('collapsed');
				else
					sidebar.addClass('collapsed');

				var sh = sidebar.find('.sidebar-top').outerHeight() + sidebar.find('.sidebar-bottom').height();
				var posB = $w.height() < sh? 'relative': 'absolute';
				var posS = $w.height() < sh? 'absolute': 'fixed';
				var offset = 0;
				var content = $("#bouquet-list"); // mainpage content

				if(
					device.windowHeight > 1000 &&
					content.length > 0 &&
					content.find('li').length > 0 &&
					(content.outerHeight() + $('#header').height()) < device.windowHeight - sidebar.find('.sidebar-bottom').height()
				)
				{
					offset = (device.windowHeight - content.height()) - content.offset().top - sidebar.find('.sidebar-bottom').height();
					sidebar.find('.sidebar-bottom').css({bottom: offset});
				} else {
					sidebar.find('.sidebar-bottom').css({bottom: 0});
				}
				sidebar.find('.sidebar-bottom').css({position: posB});
			},
            open: function() {
                if(settings.env == 'dev')
                    console.log('[SIDEBAR] Open navbar');
                var sidebar = $('#sidebar');

				try {
					sidebar.addClass('open');
				} catch(e) {
					console.log('Popup open error: ' + e);
				}

				sidebar.find('.popup-close').hide().delay(200).fadeIn(200, function() {
					$(this).addClass('closing');
				});
				sidebar.find('.popup-close').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
					if($(this).hasClass('closing'))
						$(this).removeClass('closing');
				});
				this.opened = true;
            },
            close: function() {
                if(settings.env == 'dev')
                    console.log('[SIDEBAR] Close navbar')
				var sidebar = $('#sidebar');
				sidebar.removeClass('open');

				sidebar.find('.popup-close').addClass('closing');
				sidebar.find('.popup-close').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
					if($(this).hasClass('closing'))
						$(this).removeClass('closing');
				});
				$('button[data-toggle="sidebar"]').removeClass('opened');
				this.opened = false;
            }
		},
		popup: {
			isOpened: function() {
				if(this.opened && this.opened.length)
					return true
				else
					return false
			},
			show: function(target, orderred) {
				if(this.isOpened() && !orderred)
					return;

				var target = $(target);

				if(!orderred) {
					var zindex = target.css('z-index');
					$('<div />')
						.appendTo("#wrapper")
						.attr('id', 'popup-bg')
						.addClass((target.hasClass('product-cart') ? 'gray': 'default'))
						.css('z-index', --zindex)
						.fadeIn(200);

					$('body').css('overflow', 'hidden').on('touchmove', function(e) {
						e.preventDefault();
					});
				}

				target.trigger('open');
				$(document).trigger('popup-show');

				this.opened = target;
				this.initialized = true;
			},
			hide: function() {
				if(this.opened) {
					this.opened.trigger('close');
					$('#popup-bg').fadeOut(200, function() {
						$(this).remove();
					});
					$('body').css('overflow', 'auto').off('touchmove');
					delete this.opened;
					$(document).trigger('popup-close');
				}
			}
		},
		modal: {
			lastConfirmed: false,
			dialog: function(params) {
				this.lastConfirmed = false;

				var _buttons = params.buttons;

				var tmpId = 'dialog_' + guid(),
					buttonHTML = '',
					template = '';

				params.id = tmpId;

				if(params.content.indexOf('#') === 0)
					params.content = $(params.content).html();

				$.each(_buttons, function(name,obj){
					if(!obj.class)
						obj.class = '';

					buttonHTML += '<button class="'+ obj.class +'">'+ (!obj.title?name:obj.title)+'</button>' + "\n";

					if(!obj.action)
						obj.action = function(){};
				});

				params.buttons = buttonHTML;

				try {
					template = tmpl(
						document.getElementById("tmpl-dialog").innerHTML,
						params
					);
					var obj = $(template).appendTo('body');

					if(typeof params.afterRender === "function")
						params.afterRender(obj);

					var buttons = $('#' + tmpId + ' button'),
						i = 0;

					$.each(_buttons, function(name,obj) {
						buttons.eq(i++).on('click', function(){
							if(params.type == 'form') {
								var form = $('#' + tmpId).find('form');
								if(obj.beforeAction && typeof obj.beforeAction === "function" ) {
									form.on('submit', function() {
										if(obj.beforeAction(form)) {
											obj.action($(this));
											$.magnificPopup.close();
										}
										return false;
									});
									form.trigger('submit');
								}
								else {
									$.magnificPopup.close();
								}
							}
							else {
								obj.action();
								$.magnificPopup.close();
							}
							return false;

						});
					});

					$.magnificPopup.open({
						items: {
							src: '#' + tmpId
						},
						showCloseBtn: false,
						removalDelay: 500,
						mainClass: 'mfp-zoom-in',
						callbacks: {
							close: function() {
								$('#' + tmpId).remove();
								if(settings.env == 'dev')
									console.log('Popup is completely closed');

							}
						},
						type: 'inline'
					});
				} catch (e) {
					console.log('Template dialog rendering and open failed', e);
				}
			}
		},
		content: {
			initStyle: function() {
				$("#content").css('height', ($w.height() - $('#header').height()) + 'px');
			}
		},
		bouquets: {
			data: [],
			get: function(params) {
				$("#ajax-loader").fadeIn(200);
				var defaults = {
					start: 0,
					to: null,
					limit: settings.loadBouquets,
					type: 'json',
					after: function(response) {}
				};

				this.options = $.extend({}, defaults, params);

				// Ajax simulation
				// example server response = var bouquetsList
				var self = this;
				setTimeout(function() {
					var response;
					app.bouquets.data = response = bouquetsList;
					// callback function After
					self.options.after.call(self, response); // callback
					app.bouquets.buildListHtml(bouquetsList);
                    $("#ajax-loader").delay(500).fadeOut(300, function() {

					});

				}, 1000);
			},
			buildListHtml: function(data) {
				var list = $("#bouquet-list");
				if(settings.env == 'dev')
					console.log("[FLOWERS] Load flowers");

				if(!data || $.isEmptyObject(data)) {
					var emptyData = $('<div />').hide().addClass('not-found').html(lang.bouquetNotFound)
					$('#content').append(emptyData);
					emptyData.fadeIn();
					console.log("[FLOWERS] Data is empty");
					return;
				} else {
					$('#content > .not-found').remove();
				}
				var lastItem = 0;
				$.each(data, function(key, value) {
					var item = $('<li />').attr('data-bouquet-id', value.id);

					getImageLightness(value.imgSrc)
						.done(function(brightness) {
							if(settings.env == 'dev')
								console.log("[IMAGE => LIGHNESS] Bouquet #" + value.id );

							var lightness = 'dark';

							if(brightness > settings.imageBouquetsBrightnessThreshold)
								lightness = 'light';

							if(settings.env == 'dev')
								console.log(' -> Bouquet #' + value.id + ': ' + value.imgSrc + ': ' + brightness + '(' + lightness + ')');

							list.find('li[data-bouquet-id="'+ value.id +'"] > div.bouquet').addClass(lightness);

						});

					item.append(app.bouquets.render('tmpl-bouquet-list-item', value));
					item.append(app.bouquets.render('tmpl-bouquet-list-item-popup', value));
					list.append(item);
					lastItem++;
				});
				list.find(".bouquet").each(function(i) {
					$(this).delay(i*100).fadeIn(300, function() {
						if(i==(lastItem-1))
							$(document).trigger('raketa.bouquets.loaded');
					});

				});

			},
			render: function(template, data) {
				var item = '';
				try {
					item = tmpl(
						document.getElementById(template).innerHTML,
						data
					);
					return item;
				} catch (e) {
					console.log('Template rendering failed', e);
				}
			}
		},
		basket: {
			store: [],
			get: function() {

			},
			add: function(e) {
				console.log(e);
				var $this = $(e.currentTarget);

				var bid = $this.data('product-id');
				var productObi = $('#bouquet-list li[data-bouquet-id="' + bid + '"]');

				if(settings.env == 'dev')
					console.log('[BASKET] Add product with ID #' + bid + ' to basket');

				if(!productObi.length)
					throw Error("Невозможно найти DOM объект товара");

				$this.addClass('added');
				$this.find('span.icon').html(lang.buttonTextInBasket);

				if(settings.env == 'dev')
					console.log('[BASKET] [ID #' + bid + '] Get product details');

				var product = app.bouquets.data.filter(function (bouquet) { return bouquet.id == bid })[0];
				if(product.length == 0)
					throw Error("Невозможно найти товар c id " + bid );


				product.count = 1;

				var indexes = $.map(app.checkout.basket, function(obj, index) { if(obj.id == product.id) return index; });
				if(indexes.length > 0)
				{
					if(settings.env == 'dev')
						console.log('Find in basket product with the same ID');
					app.checkout.basket[indexes[0]]['count'] += product.count;
					product.count = app.checkout.basket[indexes[0]]['count'];
				} else {
					app.checkout.basket.push(product);
				}

				this.saveBasket();
				this.updateHtml();

				// Если виджет productcart загружен, есть открытый объект, popup открыт, то проверяем какой шаг открыть
				if(app.widgets.productcart
					&& app.widgets.productcart.openedObj
					&& app.popup.isOpened())
				{
					if($.isEmptyObject(app.checkout.delivery))
					{
						// Не указана дата доставки - открываем шаг 2
						app.widgets.productcart.step('delivaryDate');
					}
					else
					{
						// Указана дата доставки и товар добавлен в корзину
						app.widgets.productcart.step('orderInfo');
					}
				}
			},
			clear: function() {
				if(this.destroyBasket()) {


				} else {

				}
			},
			destroyBasket: function() {
				// Remove basket from Cookie or session
				// Ajax
				return true;
			},
			saveBasket: function() {
				// SAVE TO SESSION ? or cookie? Async!
				var data = JSON.stringify(app.checkout.basket); // JSON ???
				console.log('SAVE data basket');
				console.log(app.checkout.basket);
				// Ajax
			},
			updateHtml: function() {
				var basketButton = $('#header a.basket');
				basketButton.addClass('notempty').html('<span>' + app.checkout.basket.length + '</span>');
			},
			productInBasket: function(productId) {
				var indexes = $.map(app.checkout.basket, function(obj, index) { if(obj.id == productId) return index; });
				if(indexes.length > 0)
					return indexes;
				else
					return false;
			},
			getProductFromBasket: function(productId) {
				var indexes = $.map(app.checkout.basket, function(obj, index) { if(obj.id == productId) return index; });
				if(indexes.length > 0)
					return app.checkout.basket[indexes];
				else
					return false;
			},
			removeProductFromBasket: function(productId, callback) {
				var indexes = $.map(app.checkout.basket, function(obj, index) { if(obj.id == productId) return index; });
				if(indexes.length > 0)
				{
					try {
						console.log(indexes);
						app.checkout.basket.splice(indexes[0], 1);
						if(typeof callback === "function")
							callback();
					} catch (e) {
						console.error('Failed to delete product from basket with error: ' + e);
					}
				}
			}
		},
		checkout: {
			basket: [],
			delivery: {},
			load: function() {
				if(this.basket.length && !$.isEmptyObject(this.delivery))
					return;

				this.getBasketData();
				this.getDeliveryDate();
			},
			getBasketData: function() {
				if(this.basket.length)
					return;
				// Get basket from cookies or session from server, maybe store in html as JS var
				// See app.widget.productcart.hashProcess()
				// This deffered object. Ajax must be return "return ajax({.....}) ..."
				// Ajax Simulation
				return $.Deferred(function() {
					var self = this;
					console.log('Get basket from session or cookies');
					setTimeout(function() { // <-- example of some async operation
						// Server Response
						var response = [{
							id: 2,
							count: 3,
							imgSrc: 'img/b2.jpg',
							price: 2800,
							name: 'Черничный пирог',
							availableData: 'с 28 октября',
							label: 'autumn',
							size: {
								dia: '60 см',
								height: '30 см'
							},
							composition: 'Роза свитнесс, Гербера мини, Салал, Эвкалипт Бэби Блю, Хлопок, Лента',
							info: 'Диаметр: 60см<br>Высота: 30см<hr><p>Роза свитнесс, Гербера мини, Салал, Эвкалипт Бэби Блю, Хлопок, Лента</p>'
						},
						{
							id: 3,
							count: 1,
							imgSrc: 'img/b3.jpg',
							price: 1900,
							name: 'Свет добра',
							availableData: 'с 14 марта',
							size: {
								dia: '60 см',
								height: '30 см'
							},
							composition: 'Роза свитнесс, Гербера мини, Салал, Эвкалипт Бэби Блю, Хлопок, Лента',
							info: 'Диаметр: 60см<br>Высота: 30см<hr><p>Роза свитнесс, Гербера мини, Салал, Эвкалипт Бэби Блю, Хлопок, Лента</p>'
						}];
						app.checkout.basket = response;
						app.basket.updateHtml();
						$(document).trigger('raketa.basket.get-data');
						self.resolve();
					},500);
				});
			},
			getDeliveryDate: function() {
				// Get from cookie
				var date =  Cookies.get('raketa_delivary__date');
				var timeofday =  Cookies.get('raketa_delivary__timeofday');
				if(date)
					this.delivery.date = date;
				if(timeofday)
					this.delivery.timeofday = timeofday;

				if(app.widgets.calendar && app.widgets.calendar.loaded && timeofday && date) {
					var obj = $('#widget-calendar');
					obj.find('.radio-group input[name="timeofday"]:checked').attr('checked', false);
					obj.find('#tod_' + timeofday).attr('checked', true);
					$('#delivery-date').datetimepicker({value: date});
					obj.find('button[type="submit"]').removeAttr('disabled');
					obj.find('button[data-toggle="clear-date"]').removeAttr('disabled');
					$('#selectedDate').html(app.widgets.calendar.getDateString());
					$('button[data-target="#widget-calendar"]').html(app.widgets.calendar.getDateString());
				}
			},
			save: function(callback) {
				console.log('[FOR DELIVERY] Send form data to server:');

				//
				var data = {
					basket : this.basket,
					delivery: this.delivery,
					for: this.for
				};
				// Ajax simulation
				setTimeout(function() {
					var response = {
						status: true,
						paymentUrl: 'order_success.html'
					};
					if(typeof callback === "function")
						callback(response);
				}, 2000);
			}
		},
		widgets: {
			load: function() {
				$.each(this, function(index, value) {
					if(index !== 'load') {
						try {
							value.load();
						} catch (e) {
							console.error('Error loading widget @' + index + ' with error: ' + e);
						}
					}
				});
			},
			calendar: {
				obj: {},
				loaded: false,
				cleared: false,
				opened: false,
				position: {},
				setPosition: function() {
					var button = $('button[data-target="#widget-calendar"]'); // setting the position relative to the element
					if(button.length) {
						var _w = this.obj.width();
						var _h = this.obj.height() ;
						var button_offset = button.offset();
						var right = device.windowWidth - (button_offset.left + button.outerWidth()) - 20;
						this.obj.css('top', - (_h + 40) + 'px');// box shadow
						this.obj.css('right', Math.floor(right) + 'px');
						this.obj.css('height', _h + 'px');
						this.position.width = _w;
						this.position.height = _h;
						this.position.top = - _h;
						this.position.right = - right;
					}

				},
				load: function() {
					this.obj = $("#widget-calendar");
					var button = $('button[data-target="#widget-calendar"]');

					var _this = this;

					$.datetimepicker.setLocale('ru');
					$('#delivery-date').datetimepicker({
						format:'d.m.Y',
						value: 0,
						timepicker:false,
						inline:true,
						todayButton: false,
						prevButton: false,
						nextButton: false,
						scrollMonth: false,
						dayOfWeekStart: 1,
						yearStart: '2016',
						yearEnd: '2020',
						minDate:new Date(),
						maxDate: new Date(+new Date + 12096e5), // magic number is 14 days in ms
						onChangeDateTime:function(dp,$input){
							_this.obj.find('button[type="submit"]').removeAttr('disabled');
							_this.obj.find('input[name="timeofday"]').removeAttr('disabled');
							var widget = $input.parents('.widget');
							widget.find('button[data-toggle="clear-date"]').removeAttr('disabled');
							var label = $input.data('targetdate');
							$('#'+ label).html(_this.getDateString());
						},
						onGenerate: function(ct) {
							var calendar = $(this).find('.xdsoft_calendar');
							//if($.isEmptyObject(app.checkout.delivery))
							//	$(this).find('.xdsoft_current').removeClass('xdsoft_current');

							//$.each(calendar.find('tbody tr'), function( index, tr ) {
							//	var i = 0;
							//	var $tr = $(tr);
							//	$.each($tr.find('td'), function (index, td) {
							//		if($(td).hasClass('xdsoft_disabled'))
							//			i++;
							//	});
                            //
							//	if(i == 7)
							//		$tr.hide();
							//});

							if(button.length > 0 && (!_this.position.width || !_this.position.height || !_this.position.top || !_this.position.right )) {
								_this.setPosition();
							}
						}
					});
					//$('#delivery-date').appendDtpicker({
					//	inline: true,
					//	locale: "ru",
					//	firstDayOfWeek: 1,
					//	animation: false,
					//	todayButton: false,
					//	closeButton: false,
					//	dateOnly: true,
					//	dateFormat: "DD.MM.YYYY",
					//	futureOnly: true,
					//	minDate: new Date(),
					//	maxDate: new Date(+new Date + 12096e5),
					//	onInit: function() {
					//		console.log('asdasdsa');
					//		if(button.length > 0 && (!_this.position.width || !_this.position.height || !_this.position.top || !_this.position.right )) {
					//			_this.setPosition();
					//		}
                    //
					//		var calendar = $('#widget-calendar').find('.datepicker_table');
					//		//if($.isEmptyObject(app.checkout.delivery))
					//		//	$(this).find('.xdsoft_current').removeClass('xdsoft_current');
                    //
					//		var prevTrMonth = 0;
					//		var _prevTrMonth = false;
					//		$.each(calendar.find('tbody tr'), function( index, tr ) {
					//			var i = 0;
					//			var b = 0;
					//			var $tr = $(tr);
					//			var trMounth = 12;
                    //
					//			$.each($tr.find('td'), function (index, td) {
					//				var tdMounth = $(td).data('month');
					//				//if(i==0) {
					//				//	trMounth = tdMounth;
					//				//	b++;
					//				//}
					//				//else if(i>0 && trMounth == tdMounth){
					//				//	b++;
					//				//}
					//				if(tdMounth < trMounth)
					//					trMounth = tdMounth;
                    //
					//				if($(td).hasClass('out_of_range'))
					//					i++;
					//			});
					//			//console.log(prevTrMonth == trMounth);
					//			if(index > 0 && prevTrMonth == trMounth) {
					//				_prevTrMonth = true;
					//			}
                    //
					//			prevTrMonth = trMounth;
                    //
					//			if(b==7 && _prevTrMonth)
					//				$tr.prepend('<div class="month">'+trMounth+'</div>');
					//			else
					//				$tr.prepend('<div class="month">'+prevTrMonth+'</div>');
                    //
					//			//if(i == 7)
					//			//	$tr.hide();
					//		});
					//	},
					//	onSelect: function() {
					//		console.log('asdasdsa');
					//		if(button.length > 0 && (!_this.position.width || !_this.position.height || !_this.position.top || !_this.position.right )) {
					//			_this.setPosition();
					//		}
                    //
					//		var calendar = $('#widget-calendar').find('.datepicker_table');
					//		//if($.isEmptyObject(app.checkout.delivery))
					//		//	$(this).find('.xdsoft_current').removeClass('xdsoft_current');
                    //
					//		var prevTrMonth = 0;
					//		var _prevTrMonth = false;
					//		$.each(calendar.find('tbody tr'), function( index, tr ) {
					//			var i = 0;
					//			var b = 0;
					//			var $tr = $(tr);
					//			var trMounth = 12;
                    //
					//			$.each($tr.find('td'), function (index, td) {
					//				var tdMounth = $(td).data('month');
					//				//if(i==0) {
					//				//	trMounth = tdMounth;
					//				//	b++;
					//				//}
					//				//else if(i>0 && trMounth == tdMounth){
					//				//	b++;
					//				//}
					//				if(tdMounth < trMounth)
					//					trMounth = tdMounth;
                    //
					//				if($(td).hasClass('out_of_range'))
					//					i++;
					//			});
					//			//console.log(prevTrMonth == trMounth);
					//			if(index > 0 && prevTrMonth == trMounth) {
					//				_prevTrMonth = true;
					//			}
                    //
					//			prevTrMonth = trMounth;
                    //
					//			if(b==7 && _prevTrMonth)
					//				$tr.prepend('<div class="month">'+trMounth+'</div>');
					//			else
					//				$tr.prepend('<div class="month">'+prevTrMonth+'</div>');
                    //
					//			//if(i == 7)
					//			//	$tr.hide();
					//		});
					//	}
					//});

					this.obj.find('button[type="submit"]').on('click', function(e) {
						e.preventDefault();
						if(!_this.cleared)
							_this.process();
						app.popup.hide();
					});

					this.obj.find('input[name="timeofday"]').on('change', function() {
						$('#selectedDate').html(_this.getDateString());
						if(app.checkout.delivery !== undefined)
							button.html(_this.getDateString());
						else
							button.html(lang.DeliveryDate);
					});

					this.obj.find('button[data-toggle="clear-date"]').on('click', function(e) {
						_this.obj.find('#delivery-date').val(new Date());
						_this.obj.find('.xdsoft_current').removeClass('xdsoft_current');
						$('#delivery-date').datetimepicker({value: new Date()});
						$('#' + _this.obj.find('#delivery-date').data('targetdate')).html(lang.DeliveryDate);
						button.html(lang.DeliveryDate);
						$(this).attr('disabled', 'disabled');
						_this.obj.find('button[type="submit"]').attr('disabled', 'disabled');
						_this.obj.find('input[name="timeofday"]:checked').attr('checked', false);
						_this.obj.find('input[name="timeofday"]').attr('disabled', 'disabled');
						_this.cleared = true;
						delete app.checkout.delivery;
						Cookies.remove('raketa_delivary__date', { path: '/' });
						Cookies.remove('raketa_delivary__timeofday', { path: '/' });
						app.popup.hide();
					});

					$(document).on('open', "#widget-calendar", function() {
						_this.open();
					});
					$(document).on('close', "#widget-calendar", function() {
						_this.close();
						button
					});

					this.loaded = true;
				},
				getDateString: function() {
					var _str = lang.DeliveryFormattedString;
					var timeofday = this.obj.find('input[name="timeofday"]:checked').val();
					var date = this.obj.find('input[name="date"]').val();
					if(date)
						date = moment(date, 'DD.MM.YYYY').format('D MMMM');
					else
						date = '';
					_str = String.template(_str, (lang[timeofday] ? lang[timeofday] : ''), date);
					_str = _str.toLowerCase().capitalizeFirstLetter();
					return _str;
				},
				open: function() {
					if(settings.env == 'dev')
						console.log('[WIDGET] Open widget @calendar');

					if($.isEmptyObject(app.checkout.delivery))
						this.obj.find('.xdsoft_current').removeClass('xdsoft_current');


					this.obj.addClass('animation');
					this.obj.transition({ y: Math.floor(this.obj.height() + 40) }); //box shadow

					var _this = this;
					this.obj.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
						_this.obj.removeClass('animation').addClass('opened');
					});


					_this.cleared = false;
					_this.opened = true;
				},
				close: function() {
					if(settings.env == 'dev')
						console.log('[WIDGET] Close widget @calendar');


					this.obj.removeClass('opened').addClass('animation');
					this.obj.transition({ y: this.position.top, complete: function() {
						this.opened = false;
					}});

				},
				process: function() {
					var button = $('button[data-target="#widget-calendar"]');
					var data = this.obj.find('form').serializeObject();
					app.checkout.delivery = data;
					if(app.checkout.delivery !== undefined)
						button.html(this.getDateString());
					else
						button.html(lang.DeliveryDate);

					console.log(data);
					// Save to cookie or maybe ajax?
					Cookies.set('raketa_delivary__date', data.date, { expires: 1, path: '/' });
					Cookies.set('raketa_delivary__timeofday', data.timeofday, { expires: 1, path: '/' });

				}
			},
			productcart: {
				loaded: false,
				cleared: false,
				startPosition: {},
				startTitle: '',
				hashProcess: function() {
					//$('#bouquet-list').on('raketa.bouquets.loaded raketa.basket.get', function() {
					var bouquets = $.Deferred(function() {
						var self = this;
						$(document).on('raketa.bouquets.loaded', function() {
							self.resolve();
						});
					});
					var basket = $.Deferred(function() {
						var self = this;
						$(document).on('raketa.basket.get-data', function() {
							self.resolve();
						});
					});
					$.when(basket, bouquets).then(function() {
						var hash = Hash.get();
						var obj;
						if (hash.anchor) {
							window.location.hash = hash.anchor;
						} else if (hash.bouquet) {
							obj = $('#bouquet-list li[data-bouquet-id="' + hash.bouquet + '"] > div[data-toggle="popup"]')
						}
						if(obj)
							obj.trigger('click');
					});
				},
				load: function() {
					this.obj = $('.product-cart');
					var _this = this;

					this.hashProcess();

					$(document).on('open', '.product-cart', function(e) {
						_this.open(e);
					});
					$(document).on('close', '.product-cart', function() {
						_this.close();
					});

					$(document).on('click', '.product-cart button[data-toggle="show-product-info"]', function() {
						var id = $(this).data('product-id');
						$(this).toggleClass('active');
						$('#popup-product-' + id + ' .product-info').fadeToggle(300, function() {

						});
					});


					$(document).on('click', '.product-cart button.direction', function(e) {
						var direction = $(this).data('direction');
						if(settings.env == 'dev')
							console.log('[WIDGET] @productcart - change current cart (' + direction + ')');

						var currentIndex = index = _this.openedObj.closest('li[data-bouquet-id]').index();
						console.log('Opened index element ' + index);

						switch (direction) {
							case 'prev':
								index = (index - 1 < 0 ? $('#bouquet-list li:last-child').index() : index - 1);
								break;
							case 'next':
								index = (index + 1 > $('#bouquet-list li').length - 1 ? 0 : index + 1);
								break;
						}

						_this.close();
						var indexed = $('#bouquet-list li').eq(index);
						setTimeout(function() {
							indexed.find('div[data-toggle="popup"]').data('order', true).trigger('click');
						}, 300);

					});

					$(document).on('raketa.bouquets.loaded', function() {
						var gallery = $('.product-cart').find('.gallery-list');
						var w = $('.product-cart').width();
						var h = $('.product-cart').height();
						if(gallery.length > 0) {
							gallery.css('height', h);
							gallery.find('.owl-lazy').css('height', h);
							gallery.find('.owl-lazy').css('width', w/2);
							gallery.find('.owl-height').css('height', $('.product-cart').height());
							gallery.css('width', w/2);

							gallery.magnificPopup({
								delegate: 'a.owl-lazy',
								type:'image',
								mainClass: 'mfp-no-margins mfp-zoom-in',
								closeOnContentClick: true,
								closeBtnInside: false,
								fixedContentPos: true,
								image: {
									verticalFit: true
								}
							});

							var params = {
								items: 1,
								margin: 0,
								lazyLoad:true,
								loop:true,
								autoplay: true,
								autoplayTimeout: 5000,
								autoplayHoverPause: true
							};

							if(settings.env == 'dev')
								console.log('[WIDGET] @productcart Found gallery in product cart');

							gallery.on('initialized.owl.carousel', function(event) {
								var element = $(event.target);
								var item = event.item.index;
								var current = element.find('.owl-item').eq(item).find('.item');

							});

							gallery.owlCarousel(params);
						}
					});

					this.loaded = true;
				},
				open: function(e) {
					var obj = $(e.target);
					if(settings.env == 'dev')
						console.log('[WIDGET] Open widget @productcart with id #' + obj.attr('id'));

					$('#bouquet-list li[data-bouquet-id="' + obj.data('product-id') + '"] > div[data-toggle="popup"]').data('order', false);

					//var height = ($w.height() - $('#header').height()) - 50;
					var height = obj.height();
					var width = obj.width();
					obj.css('top', -height).css('visibility', 'visible');
					this.startPosition.top = -height;

					// Если этот товар в корзине и указана дата доставки, то шаг 3
					var index;
					if(app.basket.productInBasket(obj.data('product-id')) && !$.isEmptyObject(app.checkout.delivery))
					{
						if(settings.env == 'dev')
							console.log('[WIDGET] @productcart go to step 3');

						this.loadStep3(obj, app.basket.productInBasket(obj.data('product-id')));
					}
					else if(app.basket.productInBasket(obj.data('product-id')) && $.isEmptyObject(app.checkout.delivery)) // Товар в корзине и дата доставки не указана - шаг 2
					{
						if(settings.env == 'dev')
							console.log('[WIDGET] @productcart go to step 2');
						obj.find('.step').hide().removeClass('active');
						obj.find('.step2').addClass('active').show();
					}

					var width = obj.outerWidth();
					obj.css('margin-left', Math.ceil(-width/2));

					obj.addClass('transition');

					if(device.type == 'desktop' && (device.subtype == 'fullhd' || device.subtype == 'hd'))
						obj.transition({ y: Math.floor(device.windowHeight - (device.windowHeight - height)/2) });
					else
						obj.transition({ y: Math.floor(height + $('#header').height())});

					obj.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
						obj.removeClass('transition').addClass('opened');
						obj.find('.bottom button:first-child').focus();
					});
					// History add
					this.startTitle = document.title;
					document.title = lang.bouquet + ' ' + obj.data('title');
					Hash.add('bouquet', obj.data('product-id'));
					this.openedObj = obj;
					this.cleared = false;
				},
				close: function() {
					var obj = this.openedObj;
					if(settings.env == 'dev')
						console.log('[WIDGET] Close widget @productcart');

					obj.removeClass('opened').addClass('animation');
					obj.transition({ y: this.startPosition.top });
					window.location.hash = '';
					history.pushState('', document.title, window.location.pathname);
					document.title = this.startTitle;
					delete this.openedObj;
				},
				step: function(step) {
					if(!step)
						return;

					if(settings.env == 'dev')
						console.log('[WIDGET] @productcart go to step - ' + step);

					var obj = this.openedObj;
					switch (step) {
						case 'delivaryDate':
							console.log(obj);
							obj.find('.step.active').fadeOut('fast', function() {
								obj.find('.step.step2').fadeIn('fast');
							});
							break;
						case 'orderInfo':
							obj.find('.step.active').fadeOut('fast', function() {
								obj.find('.step.step3').fadeIn('fast');
							});
							break;
					}
				},
				loadStep3: function(obj, index) {
					obj.find('.step').hide().removeClass('active');
					obj.find('.step3').addClass('active').show();
					console.log(index);
					var inBasket = app.basket.getProductFromBasket(obj.data('product-id'));

					var _str = lang.bouquetInBasketPopupCart;
					var _str2 = inBasket.count + ' ' + lang.bouquet + getNumEnding(inBasket.count, ['', 'а', 'ов']);

					var price = inBasket.count * inBasket.price;
					if(price > 10000)
						price = price.format(0, 3, ' ', '.');

					_str = String.template(_str, _str2.toLowerCase(), price + lang.currencySymbol);

					$('#in-basket-product-' + obj.data('product-id')).html('<span class="icon-basket"></span> ' + _str);
					$('#p' + obj.data('product-id') + '-count').val(inBasket.count);

					$('[data-trigger="spinner"]')
						.spinner('max', 99)
						.spinner('changing', function(e, newVal, oldVal) {
							var name = $(this).attr('name');

							if(newVal < 0)
								return;

							app.checkout.basket[index[0]].count = newVal;

							var _str = lang.bouquetInBasketPopupCart;
							var _str2 = newVal + ' ' + lang.bouquet + getNumEnding(inBasket.count, ['', 'а', 'ов']);

							var price = newVal * inBasket.price;
							if(price > 10000)
								price = price.format(0, 3, ' ', '.');

							_str = String.template(_str, _str2.toLowerCase(), price + lang.currencySymbol);

							$('#in-basket-product-' + obj.data('product-id')).html('<span class="icon-basket"></span> ' + _str);

							app.basket.saveBasket();
						});
				}
			}
		},
		layout: {
			currentLayout: {},
			initStyle: function() {
				if($.isEmptyObject(this.currentLayout)) return;

				if(settings.env == 'dev') console.log('Set layout('+this.currentLayout.name+') template style');
				this.setStyleLayout(this.currentLayout.name, this.currentLayout.container);
			},
			init: function(container, callback) {
				if(!container)
					container = $('div[data-layout]');

				var layout = container.data('layout');

				if (!layout){
					console.error('Layout attribute not found');
					return;
				}

				this.currentLayout.name = layout;
				this.currentLayout.container = container;
				this.currentLayout.callback = callback;
				if(settings.env == 'dev') console.log('Initialize layout('+layout+')');
				this.loadLayout(layout, container, callback);
			},
			setStyleLayout: function(layout, container) {
				var currentH = container.outerHeight();
				var newH = ($w.height() - $('#header').height()) - 50;
				container.css('height', newH + 'px');
			},
			loadLayout: function(layout, container, callback) {
				switch (layout) {
					case 'devided-slider':
						this.setStyleLayout(layout, container);

						var w = $("#content").width();
						var owl = $('#slider-content');
						owl.css('width', w/2);

						owl.on('initialized.owl.carousel', function(event) {
							var element = $(event.target);
							var item = event.item.index;
							var current = element.find('.owl-item').eq(item).find('.item');
							var hash = current.data('hash');
							container.find('.layout-menu li.active').removeClass('active');
							container.find('.layout-menu a[href="#' + hash + '"]').parent().addClass('active');

							if(settings.env == 'dev')
								console.log('[OWL Carousel] Event initialized.owl.carousel');

							container.find('.content-panel > .bottom').hide();
							container.find('.content-panel > .bottom[data-to-slide="'+ hash +'"]').fadeIn(200);
						});
						owl.on('changed.owl.carousel', function(event) {
							var element = $(event.target);
							var item = event.item.index;
							var current = element.find('.owl-item').eq(item).find('.item');
							var hash = current.data('hash');
							container.find('.layout-menu li.active').removeClass('active');
							container.find('.layout-menu a[href="#' + hash + '"]').parent().addClass('active');
							if(hash)
								window.location.hash = hash;
							if(settings.env == 'dev')
								console.log('[OWL Carousel] Event changed.owl.carousel');

							container.find('.content-panel > .bottom').hide();
							container.find('.content-panel > .bottom[data-to-slide="'+ hash +'"]').fadeIn(300);
						});
						owl.owlCarousel({
							autoHeight: true,
							items:1,
							URLhashListener:true,
							startPosition: 'URLHash',
							animateOut: 'fadeOut',
							smartSpeed:450,
							animateIn: 'fadeIn',
							afterInit: function(elem){

							}
						});

						$("#content ul.layout-menu a").on('click', function(e) {
							if(!$(this).parent().hasClass('active')) {
								$(this).parents('.layout-menu').find('li.active').removeClass('active');
								$(this).parent().addClass('active');
							}
						});

						owl.find('button,input,select').addClass('not-draggable').on("touchstart mousedown", function(e) {
							// Prevent carousel swipe
							e.stopPropagation();
						});

						owl.parent().find('button[type="submit"]').on('click', function() {
							var slide = owl.find('.item[data-hash="' + $(this).data('to-slide') +'"]');
							slide.find('form').trigger('submit');
						});

						break;

					case 'default':
						this.setStyleLayout(layout, container);

						break;

					case 'devided':
						this.setStyleLayout(layout, container);

						break;
				}

				if(typeof callback === 'function')
					callback(container);
			}
		},
		callback: {
			order: function(form) {
				$('button[data-to-form="#' + form.attr('id') + '"]').hide();
				var data = form.serializeArray();
				ajaxloader.local({
					element: form,
					to: '.item[data-hash="callback"]',
					title: lang.processPhoneCheck
				});
				this.process(data, function(response) {
					ajaxloader.finish();
					form.hide();
					$('#slider-content .owl-height').css('height', $('#support').height());
					$('#callback-order-success').css('height', $('#support').height()).fadeIn(200);

					countDown({
						time: 10, // in seconds
						display:  $('#callback-order-success .timer'),
						afterFinish: function() {
							$('#callback-order-success').fadeOut(200, function() {
								form[0].reset();
								form.fadeIn(200);
								$('#slider-content .owl-height').css('height', form.outerHeight());
								$('button[data-to-form="#' + form.attr('id') + '"]').show();
							});

						}
					});

				});

			},
			process: function(data, callback) {
				// Ajax simulation
				setTimeout(function() {

					var response = [];
					if(typeof callback === "function")
						callback(response);
				}, 2000);
			}
		},
		auth: {
			init: function() {
				var auth_form = $('#auth-form');
				this.validateForm(auth_form);
				auth_form.find('input').on('keyup', function() {
					$(this).removeClass('error').parent().removeClass('has-error');
					$(this).next('i.fa').remove();
				});

				auth_form.closest('.content-panel').find('.bottom button[type="submit"]').on('click', function(e) {
					var targetForm = $(this).data('to-form');

					if(settings.env == 'dev')
						console.log('Click bottom button with target form ' + targetForm);
					if(!targetForm || $(targetForm).length == 0)
						return;

					var form = $(targetForm);
					form.trigger('submit');
					form.closest('.static').find('.form-status').remove();
					return false;
				});
			},
			validateForm: function(form) {
				var _this = this;
				jQuery.validator.addMethod(
					'regexp',
					function(value, element, regexp) {
						var re = new RegExp(regexp);
						return this.optional(element) || re.test(value);
					},
					"Please check your input."
				);
				form.validate({
					onfocusout: false,
					onkeyup: false,
					onclick: false,
					focusInvalid: false,
					submitHandler: function() {
						_this.authorizationSubmitHandler(form);
						return false;
					},
					rules: {
						name: {
							required: true,
							minlength: 3,
							regexp: '^[А-яA-zёЁ\s-]{3,}$'
						},
						phone: {
							required: true,
							minlength: 5,
							regexp: '^\\+[0-9\\+\\-()\s]{14,16}$'
						},
						email: {
							required: true,
							email: true
						}
					},
					messages:{
						name: {
							required: "Поле обязательно для заполнения",
							minlength: "Имя не может быть менее 3 символов",
							regexp: "Имя указано не верно"
						},
						phone: {
							required: "Поле обязательно для заполнения",
							minlength: "Телефон не может сожержать менее 5 символов",
							regexp: "Телефон указан не верно"
						},
						email: "Введите корректный адрес"
					},
					showErrors: function(errorMap, errorList) {
						if (errorList.length < 1) {
							form.removeClass('has-error');
							form.find('input').removeClass('error').parent().removeClass('has-error');
							form.find('i.fa').remove();
							return;
						}
						$.each(errorList, function(index, error) {
							form.find('input[name="'+error.element.name+'"]').next('i.fa').remove();
							form.find('input[name="'+error.element.name+'"]').addClass('error').parent().addClass('has-error');
							form.addClass('has-error');
							form.find('input[name="'+error.element.name+'"]').after('<i class="fa fa-exclamation-triangle tooltip" data-toggle="tooltip" title="' + error.message + '"></i>');
						});
					}
				});
			},
			authorizationProcess: function(data,callback) {
				console.log('[AUTHORIZATION] Send form data to server:');
				console.log(data);
				// Ajax simulation
				setTimeout(function() {
					var response = {
						message: 'Неверно указан номер',
						status: false, // example phone error
					};
					if(typeof callback === "function")
						callback(response);
				}, 20000);
			},
			authorizationSubmitHandler: function(form) {
				$('button[data-to-form="#' + form.attr('id') + '"]').hide();
				var data = form.serializeArray();
				var step = form.closest('.static');
				form.css('opacity', 0);
				ajaxloader.local({
					element: form,
					to: '.static',
					title: lang.processAuthorization
				});
				this.authorizationProcess(data, function(response) {
					if(response.status != true)
					{

						var message = $('<div />').addClass('table form-status')
							.css('width', step.outerWidth())
							.css('height', step.outerHeight())
							.append('<div class="cell middle"><span class="error">' + response.message + '</span></div>');
						step.prepend(message);

						ajaxloader.finish();

						form.find('input[name="phone"]').parent().addClass('has-error'); // Example

						setTimeout(function() {
							message.css('background-color', 'transparent');
							message.find('span').addClass('inline');
							message.transition({
								y: -250,
								complete: function() {
									message.css('z-index', 0);
									form.fadeTo(200, 1);
									$('button[data-to-form="#' + form.attr('id') + '"]').fadeIn(200);
								}
							});
						}, 700)
					}
					else
					{
						window.location = "/";
					}
				});
			},
		}
	};


	ajaxloader = {
		local: function(params) {
			if(!params.element)
				return;

			var element = params.element;


			var ajaxloader = $('<div />').addClass('ajax-loader-local')
				.css('width', element.outerWidth())
				.css('height', element.outerHeight());

			if(params.title && params.title.length > 0)
			{
				var title = $('<div />').addClass('title').html(params.title);
				ajaxloader.append(title);
			}

			if(params.image && params.image.length > 0)
			{
				var image = $('<img />').addClass('image')
					.attr('src', params.image);
				ajaxloader.append(image);
			} else {
				var icon = $('<div />').addClass('icon')
					.attr('src', params.image);
				ajaxloader.append(icon);
			}

			if(params.to && params.to != '') {
				var to = element.closest(params.to);
				ajaxloader.css('width', to.outerWidth())
					.css('height', to.outerHeight());
				to.prepend(ajaxloader);
			} else
				element.prepend(ajaxloader);
			ajaxloader.fadeIn(200);
			this.ajaxloader = ajaxloader;
		},
		finish: function() {
			if(!this.ajaxloader)
				return
			var _this = this;
			this.ajaxloader.fadeOut(200, function() {
				_this.ajaxloader.remove();
			});

		}
	};

	app.profile = {
	    init: function() {
	        this.bind();
	    },
	    bind: function() {
	        $('#edit-personal-data').submit(function(e) {
	            console.log(e);
	            e.preventDefault();
	            app.profile.personal.save($(this));
	            return false;
	        });
	
	        $('#edit-personal-data input[type="text"]').on('keydown', function(e) {
	            $('button[data-to-slide="personal"]').removeAttr('disabled');
	            var bottom = $('#profile .content-panel > *[data-to-slide="personal"]');
	            bottom.find('.button-group').removeClass('one-button').addClass('two-button');
	            bottom.find('button.btn-dismiss').removeClass('hide');
	        });
	
	        $(document).on('click', 'button[type="dismiss"]', function(e) {
	            e.preventDefault();
	            var form = $('#edit-personal-data');
	            form[0].reset();
	            var bottom = $('#profile .content-panel > *[data-to-slide="personal"]');
	            bottom.find('.button-group').removeClass('two-button').addClass('one-button');
	            bottom.find('button.btn-dismiss').addClass('hide');
	            var input = form.find('input[name="phone"]');
	            input.attr('disabled', 'disabled');
	            input.parent().addClass('disabled');
	            input.parents('.form-group').find('button.edit-phone').hide();
	        });
	
	        $(document).on('click', 'button[type="delete-card"]', function(e) {
	            e.preventDefault();
	            var cardId = $(this).parents('li[data-card-id]').data('card-id');
	            var cartName = $(this).parents('div.creditcard').find('.creditcard-name').html();
	            var str = String.template(lang.creditcardquestdelete, cartName);
	            if(cardId) {
	                app.modal.dialog({
	                    content: str,
	                    buttons: {
	                        yes: {
	                            title: lang.dialogDeleteButton,
	                            class: 'delete',
	                            action: function(){
	                                if(settings.env == 'dev') console.log('[Dialog] Confirmed');
	                                app.profile.creditcard.del(cardId);
	                            }
	                        },
	                        no: {
	                            title: lang.dialogDismissButton,
	                            class: 'dismiss',
	                            action: function(){ if(settings.env == 'dev') console.log('[Dialog] Not confirmed'); }
	                        }
	                    }
	                });
	            } else {
	                console.error('Not found creditcard id');
	            }
	        });
	        $('button[type="add-card"]').on('click', function(e) {
	            e.preventDefault();
	            var title = ($(this).data('title')?$(this).data('title'):'');
	            var content = ($(this).data('content')?$(this).data('content'):'');
	            app.modal.dialog({
	                title: title,
	                content: content,
	                type: 'form',
	                popupClass: 'add-card-popup',
	                afterRender: function(obj) {
	                    obj.find('#cardnumber').validateCreditCard(function(result) {
	                        $(this).removeClass();
	                        if (result.card_type == null)
	                            return;
	
	                        $(this).addClass(result.card_type.name);
	                        $(this).closest('form').find('input[name="cardtype"]').val(result.card_type.name);
	
	                        if (result.valid) {
	                            return $(this).addClass('valid');
	                        } else {
	                            return $(this).removeClass('valid');
	                        }
	                    }, {
	                        accept: ['visa', 'visa_electron', 'mastercard', 'maestro']
	                    });
	                    obj.find('#cardholder').keypress(function(event){
	                        if(!((event.which >= 65 && event.which  <= 90) ||
	                            (event.which >= 97 && event.which <= 122) || event.which == 32)) {
	                            event.preventDefault();
	                        }
	                    });
	                },
	                buttons: {
	                    yes: {
	                        title: 'Добавить',
	                        class: 'edit',
	                        beforeAction: function(form) { // jQuery object
	                            // validate
	                            var valid = true;
	                            var data = form.serializeArray();
	                            form.find('input').each(function() {
	                                if(!$(this).val()) {
	                                    valid = false;
	                                    console.log('Поле ' + $(this).attr('name') + ' не заполнено');
	                                }
	                            });
	
	                            return valid;
	                        },
	                        action: function(form){ // jQuery object
	                            if(settings.env == 'dev') console.log('[Dialog (add credit card)] Confirmed');
	                            app.profile.creditcard.add(form);
	                        }
	                    },
	                    no: {
	                        title: lang.dialogDismissButton,
	                        class: 'dismiss',
	                        action: function(){ if(settings.env == 'dev') console.log('[Dialog (add credit card)] Not confirmed');  }
	                    }
	                }
	            });
	        });
	
	        $(document).on('click', 'button[type="delete-address"]', function(e) {
	            e.preventDefault();
	            var addressId = $(this).parents('li[data-address-id]').data('address-id');
	            var address = $(this).prev().html();
	            var str = String.template(lang.deliveryaddressrequestdelete, address);
	            if(addressId) {
	                app.modal.dialog({
	                    content: str,
	                    buttons: {
	                        yes: {
	                            title: lang.dialogDeleteButton,
	                            class: 'delete',
	                            action: function(){
	                                if(settings.env == 'dev') console.log('[Dialog] Confirmed');
	                                app.profile.delivery.del(addressId);
	                            }
	                        },
	                        no: {
	                            title: lang.dialogDismissButton,
	                            class: 'dismiss',
	                            action: function(){ if(settings.env == 'dev') console.log('[Dialog] Not confirmed'); }
	                        }
	                    }
	                });
	            } else {
	                console.error('Not found delivery address id');
	            }
	        });
	
	        $('button[data-toggle="edit-phone"]').on('click', function() {
	            app.modal.dialog({
	                content: lang.dialogChangePhoneAlert,
	                buttons: {
	                    yes: {
	                        title: lang.dialogEditButton,
	                        class: 'edit',
	                        action: function(){
	                            if(settings.env == 'dev') console.log('[Dialog] Confirmed');
	                            var input = $('#slider-content input[name="phone"]');
	                            input.removeAttr('disabled');
	                            input.parent().removeClass('disabled');
	                            input.parents('.form-group').find('button.edit-phone').hide();
	
	                        }
	                    },
	                    no: {
	                        title: lang.dialogDismissButton,
	                        class: 'dismiss',
	                        action: function(){ if(settings.env == 'dev') console.log('[Dialog] Not confirmed'); }
	                    }
	                }
	            });
	        });
	
	        $('.creditcard .tooltip').tooltipster('option', 'position', 'left');
	        $('.creditcard .tooltip').tooltipster('option', 'arrow', true);
	
	    },
	    creditcard: {
	        obj: {},
	        add: function(form) {
	            try {
	                var _data = form.serializeObject();
	
	                var tmpId = 'card_' + guid();
	                var data = {
	                    cardname: _data.cardname,
	                    cardtype: _data.cardtype,
	                    cardnumber: _data.cardnumber.substr(-4)
	                };
	
	                var cardtemplate = tmpl(
	                    document.getElementById("tmpl-creditcard").innerHTML,
	                    data
	                );
	
	                var li = $('<li />')
	                    .append(cardtemplate)
	                    .attr('data-card-id', tmpId).hide(); // After ajax change card-id attribute
	
	                var list = $('ul.creditcard-list');
	                if(list.find('li.notfound').length)
	                    list.find('li.notfound').remove();
	
	                li.find('.creditcard .tooltip').tooltipster({
	                    animation: 'grow',
	                    position: 'left'
	                });
	                list.append(li);
	
	                this.process.add(function(response) {
	                    $('#slider-content .owl-height').css('height', list.outerHeight() + li.height());
	                    $('ul.creditcard-list li[data-card-id="' + tmpId +'"]').fadeIn(300, 'easeOutQuad', function() {
	                        $(this).data('card-id', response.newId).attr('data-card-id', newId);
	                    });
	                });
	
	            } catch (e) {
	                console.log('Creditcard add failed', e);
	            }
	        },
	        del: function(id) {
	            if(settings.env == 'dev')
	                console.log('Remove card with id #' + id);
	
	            this.process.del(function(response) {
	                var cnt = $('ul.creditcard-list li').length;
	                $('ul.creditcard-list li[data-card-id="' + id +'"]').slideUp(300, 'easeOutQuad', function() {
	                    $(this).remove();
	                    if(cnt == 0) {
	                        $('<li />')
	                            .appendTo("ul.creditcard-list")
	                            .html(lang.creditcardNotFound)
	                            .addClass('notfound')
	                            .fadeIn(200);
	                    }
	                    var list = $('ul.creditcard-list');
	                    $('#slider-content .owl-height').css('height', list.outerHeight());
	                });
	            });
	
	        },
	        process: {
	            del: function(callback) {
	                $("#ajax-loader").fadeIn(200);
	                // Ajax simulation
	                setTimeout(function () {
	                    $("#ajax-loader").delay(500).fadeOut(300, function () {
	                        var response = [];
	                        if(typeof callback === "function")
	                            callback(response);
	                    });
	
	                }, 1000);
	
	            },
	            add: function(callback) {
	                $("#ajax-loader").fadeIn(200);
	                // Ajax simulation
	                setTimeout(function() {
	                    $("#ajax-loader").delay(500).fadeOut(300, function() {
	                        var response = {'newId': 4};
	                        if(typeof callback === "function")
	                            callback(response);
	                    });
	                }, 1000);
	            }
	        }
	    },
	    personal: {
	        save: function(form) {
	            if(settings.env == 'dev')
	                console.log('Save personal data');
	
	            var data = form.serializeArray();
	            this.process(data, function(response) {
	                console.log('Personal data saved');
	                $('button[data-to-slide="personal"]').attr('disabled', 'disabled');
	                var bottom = $('#profile .content-panel > *[data-to-slide="personal"]');
	                bottom.find('.button-group').removeClass('two-button').addClass('one-button');
	                bottom.find('button.btn-dismiss').addClass('hide');
	            });
	
	
	        },
	        process: function(data, callback) {
	            console.log(data);
	            $("#ajax-loader").fadeIn(200);
	            // Ajax simulation
	            setTimeout(function() {
	                $("#ajax-loader").delay(500).fadeOut(300, function() {
	                    var response = [];
	                    if(typeof callback === "function")
	                        callback(response);
	                });
	
	
	
	            }, 1000);
	        }
	    },
	    delivery: {
	        del: function(addressId) {
	            this.process.del(addressId, function(response) {
	                var cnt = $('ul.creditcard-list li').length;
	                console.log('Address removed');
	                $('ul.delivery-list li[data-address-id="'+addressId+'"]').remove();
	                if(cnt == 0) {
	                    $('<li />')
	                        .appendTo("ul.delivery-list")
	                        .html(lang.deliveryaddressNotFound)
	                        .addClass('notfound')
	                        .fadeIn(200);
	                }
	                var list = $('ul.delivery-list');
	                $('#slider-content .owl-height').css('height', list.outerHeight());
	            });
	        },
	        process: {
	            del: function(addressId, callback) {
	                $("#ajax-loader").fadeIn(200);
	                // Ajax simulation
	                setTimeout(function() {
	                    $("#ajax-loader").delay(500).fadeOut(300, function() {
	                        $('button[data-to-slide="personal"]').attr('disabled', 'disabled');
	                        var response = [];
	                        if(typeof callback === "function")
	                            callback(response);
	                    });
	
	                }, 1000);
	            }
	        }
	    }
	};
	
	var _checkout = {
	    init: function() {
	        var _this = this;
	        $('#checkout .content-panel .bottom button[type="submit"]').on('click', function(e) {
	            var targetForm = $(this).data('to-form');
	
	            if(settings.env == 'dev')
	                console.log('Click bottom button with target form ' + targetForm);
	            if(!targetForm || $(targetForm).length == 0)
	                return;
	
	            var form = $(targetForm);
	            form.trigger('submit');
	            form.closest('.step1').find('.form-status').remove();
	            return false;
	        });
	
	        $('#checkout .content-panel .bottom button[type="dismiss"]').on('click', function(e) {
	            _this.goToStep(8); // last step
	            return false;
	        });
	
	        $('#checkout-step button[data-toggle="gotostep"]').on('click', function() {
	            var step = $(this).data('to-step');
	            _this.goToStep(step);
	        });
	
	        if(!app.checkout.loadLastStep())
	            app.checkout.goToStep(1);
	    },
	    step: {
	        1: {
	            loaded: false,
	            load: function() {
	                var form_step__1 = $('#checkout-auth');
	                this.validateForm(form_step__1);
	                form_step__1.find('input').on('keyup', function() {
	                    $(this).removeClass('error').parent().removeClass('has-error');
	                    $(this).next('i.fa').remove();
	                    form_step__1.closest('.step1').find('.form-status').remove();
	                });
	                this.loaded = true;
	            },
	            init: function() {
	
	            },
	            validateForm: function(form) {
	                var _this = this;
	                jQuery.validator.addMethod(
	                    'regexp',
	                    function(value, element, regexp) {
	                        var re = new RegExp(regexp);
	                        return this.optional(element) || re.test(value);
	                    },
	                    "Please check your input."
	                );
	                form.validate({
	                    onfocusout: false,
	                    onkeyup: false,
	                    onclick: false,
	                    focusInvalid: false,
	                    submitHandler: function() {
	                        _this.registrationSubmitHandler(form);
	                        return false;
	                    },
	                    rules: {
	                        name: {
	                            required: true,
	                            minlength: 3,
	                            regexp: '^[А-яA-zёЁ\s-]{3,}$'
	                        },
	                        phone: {
	                            required: true,
	                            minlength: 5,
	                            regexp: '^\\+[0-9\\+\\-()\s]{14,16}$'
	                        },
	                        email: {
	                            required: true,
	                            email: true
	                        }
	                    },
	                    messages:{
	                        name: {
	                            required: "Поле обязательно для заполнения",
	                            minlength: "Имя не может быть менее 3 символов",
	                            regexp: "Имя указано не верно"
	                        },
	                        phone: {
	                            required: "Поле обязательно для заполнения",
	                            minlength: "Телефон не может сожержать менее 5 символов",
	                            regexp: "Телефон указан не верно"
	                        },
	                        email: "Введите корректный адрес"
	                    },
	                    showErrors: function(errorMap, errorList) {
	                        if (errorList.length < 1) {
	                            form.removeClass('has-error');
	                            form.find('input').removeClass('error').parent().removeClass('has-error');
	                            form.find('i.fa').remove();
	                            return;
	                        }
	                        $.each(errorList, function(index, error) {
	                            form.find('input[name="'+error.element.name+'"]').next('i.fa').remove();
	                            form.find('input[name="'+error.element.name+'"]').addClass('error').parent().addClass('has-error');
	                            form.addClass('has-error');
	                            form.find('input[name="'+error.element.name+'"]').after('<i class="fa fa-exclamation-triangle tooltip" data-toggle="tooltip" title="' + error.message + '"></i>');
	                        });
	                    }
	                });
	            },
	            registrationProcess: function(data,callback) {
	                console.log('[REGISTRATION] Send form data to server:');
	                console.log(data);
	                // Ajax simulation
	                setTimeout(function() {
	                    var response = {
	                        message: 'Неверно указан номер',
	                        status: true, // example phone error
	                    };
	                    if(typeof callback === "function")
	                        callback(response);
	                }, 2000);
	            },
	            registrationSubmitHandler: function(form) {
	                $('button[data-to-form="#' + form.attr('id') + '"]').hide();
	                var data = form.serializeArray();
	                var step = form.closest('.step1');
	                form.css('opacity', 0);
	                ajaxloader.local({
	                    element: form,
	                    to: '.step1',
	                    title: lang.processPhoneCheck
	                });
	                this.registrationProcess(data, function(response) {
	                    if(response.status != true)
	                    {
	
	                        var message = $('<div />').addClass('table form-status')
	                            .css('width', step.outerWidth())
	                            .css('height', step.outerHeight())
	                            .append('<div class="cell middle"><span class="error">' + response.message + '</span></div>');
	                        step.prepend(message);
	
	                        ajaxloader.finish();
	
	                        form.find('input[name="phone"]').parent().addClass('has-error'); // Example
	
	                        setTimeout(function() {
	                            message.css('background-color', 'transparent');
	                            message.find('span').addClass('inline');
	                            message.transition({
	                                y: -250,
	                                complete: function() {
	                                    message.css('z-index', 0);
	                                    form.fadeTo(200, 1);
	                                    $('button[data-to-form="#' + form.attr('id') + '"]').fadeIn(200);
	                                }
	                            });
	                        }, 700)
	                    }
	                    else
	                    {
	
	                        app.checkout.goToStep(2);
	                    }
	                });
	            },
	        },
	        2: {
	            loaded: false,
	            load: function() {
	                var form_step__2 = $('#checkout-auth-confirm-phone');
	                var _this = this;
	
	                form_step__2.find('input').on('keyup', function() {
	                    form_step__2.closest('.step2').find('.form-status').remove();
	                    $('button[data-to-form="#' + form_step__2.attr('id') + '"]').removeAttr('disabled').removeClass('btn-bordered').addClass('btn-primary');
	                });
	
	                form_step__2.on('submit', function() {
	                    _this.confirmSubmitHander($(this));
	                    return false;
	                });
	
	                this.loaded = true;
	            },
	            init: function() {
	                countDown({
	                    time: settings.timeoutResendConfirmPhoneCode, // in seconds
	                    display:  $('#timein span'),
	                    showMinutes: true,
	                    afterFinish: function() {
	                        $('#timein').fadeOut(200, function() {
	                            $('#timeout').fadeIn(200);
	                        })
	                    }
	                });
	
	            },
	            confirmProcess: function(data, callback) {
	                console.log('[CONFIRM] Send form data to server:');
	                console.log(data);
	                // Ajax simulation
	                setTimeout(function() {
	                    var response = {
	                        message: 'Неверный код',
	                        status: true, // example code error
	                    };
	                    if(typeof callback === "function")
	                        callback(response);
	                }, 2000);
	            },
	            confirmSubmitHander: function(form) {
	                $('button[data-to-form="#' + form.attr('id') + '"]').hide();
	                var data = form.serializeArray();
	                var step = form.closest('.step2');
	                form.css('opacity', 0);
	                ajaxloader.local({
	                    element: form,
	                    to: '.step2',
	                    title: lang.processConfirmCheck
	                });
	                this.confirmProcess(data, function(response) {
	                    if(response.status != true)
	                    {
	
	                        var message = $('<div />').addClass('table form-status')
	                            .css('width', step.outerWidth())
	                            .css('height', step.outerHeight())
	                            .append('<div class="cell middle"><span class="error">' + response.message + '</span></div>');
	                        step.prepend(message);
	
	                        ajaxloader.finish();
	
	                        form.find('input[name="phone"]').parent().addClass('has-error'); // Example
	
	                        setTimeout(function() {
	                            message.css('background-color', 'transparent');
	                            message.find('span').addClass('inline');
	                            message.transition({
	                                y: -150,
	                                complete: function() {
	                                    message.css('z-index', 0);
	                                    form.fadeTo(200, 1);
	                                    $('button[data-to-form="#' + form.attr('id') + '"]').fadeIn(200);
	                                }
	                            });
	                        }, 700)
	                    }
	                    else
	                    {
	                        app.checkout.goToStep(8);
	                    }
	                });
	            }
	        },
	        3: {
	            loaded: false,
	            map: null,
	            map_created: false,
	            load: function() {
	                $('#map').height($('#checkout .content-panel').height());
	                ymaps.ready(this.loadMap);
	                this.loadKladr();
	
	                var _this = this;
	
	                $('#delivery-address-form').on('submit', function() {
	                    _this.deliverySubmitHandler($(this));
	                    return false;
	                });
	                this.loaded = true;
	            },
	            init: function() {
	
	            },
	            deliveryProcess: function(data, callback) {
	                console.log('[DELIVERY ADDRESS] Send form data to server:');
	                console.log(data);
	                // Ajax simulation
	                setTimeout(function() {
	                    var response = {
	                        status: true, // example code error
	                    };
	                    if(typeof callback === "function")
	                        callback(response);
	                }, 500);
	            },
	            deliverySubmitHandler: function(form) {
	                var data = form.serializeArray();
	                var dataObj = form.serializeObject();
	                var step = form.closest('.step3');
	                this.deliveryProcess(data, function(response) {
	                    if (response.status != true) {
	                        console.log('Change address error');
	                    } else {
	                        app.checkout.delivery.address = dataObj;
	                        $(document).trigger('raketa.checkout.update');
	                        app.checkout.goToStep(8);
	                    }
	                })
	            },
	            loadMap: function() {
	                    if (this.map_created) return;
	                    this.map_created = true;
	
	                    this.map = new ymaps.Map('map', {
	                            center: [59.9382558321876,30.308662213671802],
	                            zoom: 12,
	                            controls: []
	                        }),
	                        ZoomLayout = ymaps.templateLayoutFactory.createClass("<div>" +
	                            "<div id='zoom-in' class='map-btn zoom-in'></div>" +
	                            "<div id='zoom-out' class='map-btn zoom-out'></div>" +
	                            "</div>", {
	
	                            build: function () {
	                                ZoomLayout.superclass.build.call(this);
	                                this.zoomInCallback = ymaps.util.bind(this.zoomIn, this);
	                                this.zoomOutCallback = ymaps.util.bind(this.zoomOut, this);
	                                $('#zoom-in').bind('click', this.zoomInCallback);
	                                $('#zoom-out').bind('click', this.zoomOutCallback);
	                            },
	                            clear: function () {
	                                $('#zoom-in').unbind('click', this.zoomInCallback);
	                                $('#zoom-out').unbind('click', this.zoomOutCallback);
	                                ZoomLayout.superclass.clear.call(this);
	                            },
	                            zoomIn: function () {
	                                var map = this.getData().control.getMap();
	                                this.events.fire('zoomchange', {
	                                    oldZoom: map.getZoom(),
	                                    newZoom: map.getZoom() + 1
	                                });
	                            },
	                            zoomOut: function () {
	                                var map = this.getData().control.getMap();
	                                this.events.fire('zoomchange', {
	                                    oldZoom: map.getZoom(),
	                                    newZoom: map.getZoom() - 1
	                                });
	                            }
	                        }),
	                        zoomControl = new ymaps.control.ZoomControl({ options: { layout: ZoomLayout } });
	
	                    map.controls.add(zoomControl, {
	                        position: {
	                            left: 10,
	                            bottom: 180
	                        }
	                    });
	
	                    var geoLayout = ymaps.templateLayoutFactory.createClass("<div>" +
	                        "<div id='geolocation' class='map-btn geo'></div>" +
	                        "</div>", {
	
	                        build: function () {
	                            geoLayout.superclass.build.call(this);
	                            this.geolocation = ymaps.util.bind(this.geolocation, this);
	                            this.zoomOutCallback = ymaps.util.bind(this.zoomOut, this);
	                            $('#geolocation').bind('click', this.geolocation);
	                            $('#zoom-out').bind('click', this.zoomOutCallback);
	                        },
	                        clear: function () {
	                            $('#zoom-in').unbind('click', this.zoomInCallback);
	                            $('#zoom-out').unbind('click', this.zoomOutCallback);
	                            geoLayout.superclass.clear.call(this);
	                        },
	                        geolocation: function () {
	                            var map = this.getData().control.getMap();
	                            this.events.fire('zoomchange', {
	                                oldZoom: map.getZoom(),
	                                newZoom: map.getZoom() + 1
	                            });
	                        }
	                    });
	
	                    var geolocationControl = new ymaps.control.GeolocationControl({
	                        options: {
	                            //layout: geoLayout
	                            //noPlacemark: true
	                        }
	                    });
	
	                    map.controls.add(geolocationControl, {
	                        position: {
	                            left: 10,
	                            bottom: 144
	                        }
	                    });
	            },
	            loadKladr: function() {
	                var $kladr_form = $('#delivery-address-form');
	
	                $kladr_form.find('input').on('keyup', function() {
	                    if($(this).val())
	                        $('button[data-to-form="#' + $kladr_form.attr('id') + '"]').removeAttr('disabled').removeClass('white');
	                    else
	                        $('button[data-to-form="#' + $kladr_form.attr('id') + '"]').attr('disabled','disabled').addClass('white');
	                });
	
	                var $region = $kladr_form.find('[name="region"]'),
	                    $district = $kladr_form.find('[name="district"]'),
	                    $city = $kladr_form.find('[name="city"]'),
	                    $street = $kladr_form.find('[name="street"]'),
	                    $building = $kladr_form.find('[name="building"]');
	
	                $()
	                    .add($region)
	                    .add($district)
	                    .add($city)
	                    .add($street)
	                    .add($building)
	                    .kladr({
	                        parentInput: '.kladr-form',
	                        verify: true,
	                        spinner: false,
	                        labelFormat: function (obj, query) {
	                            var label = '';
	
	                            var name = obj.name.toLowerCase();
	                            query = query.name.toLowerCase();
	
	                            var start = name.indexOf(query);
	                            start = start > 0 ? start : 0;
	
	                            if (obj.typeShort) {
	                                label += obj.typeShort + '. ';
	                            }
	
	                            if (query.length < obj.name.length) {
	                                label += obj.name.substr(0, start);
	                                label += '<strong>' + obj.name.substr(start, query.length) + '</strong>';
	                                label += obj.name.substr(start + query.length, obj.name.length - query.length - start);
	                            } else {
	                                label += '<strong>' + obj.name + '</strong>';
	                            }
	
	                            if (obj.parents) {
	                                for (var k = obj.parents.length - 1; k > -1; k--) {
	                                    var parent = obj.parents[k];
	                                    if (parent.name) {
	                                        if (label) label += '<small>, </small>';
	                                        label += '<small>' + parent.name + ' ' + parent.typeShort + '.</small>';
	                                    }
	                                }
	                            }
	
	                            return label;
	                        },
	                        change: function (obj) {
	                            if (obj) {
	
	                                setLabel($(this), obj.type);
	                            }
	                            addressUpdate();
	                            mapUpdate();
	                        },
	                        openBefore: function () {
	                            // Проверяем если выбран пользовательский адрес, прекращаем работу kladr
	                            //return false;
	                        },
	                        checkBefore: function () {
	                            var $input = $(this);
	
	                            if (!$.trim($input.val())) {
	
	                                addressUpdate();
	                                mapUpdate();
	                                return false;
	                            }
	                        }
	                    });
	
	                $street.kladr({
	                    labelFormat: function (obj, query) {
	                        var label = '';
	
	                        var name = obj.name.toLowerCase();
	                        query = query.name.toLowerCase();
	
	                        var start = name.indexOf(query);
	                        start = start > 0 ? start : 0;
	
	                        if (obj.typeShort) {
	                            label += obj.typeShort + '. ';
	                        }
	
	                        if (query.length < obj.name.length) {
	                            label += obj.name.substr(0, start);
	                            label += '<strong>' + obj.name.substr(start, query.length) + '</strong>';
	                            label += obj.name.substr(start + query.length, obj.name.length - query.length - start);
	                        } else {
	                            label += '<strong>' + obj.name + '</strong>';
	                        }
	
	                        if (obj.parents) {
	                            for (var k = obj.parents.length - 1; k > -1; k--) {
	                                var parent = obj.parents[k];
	                                if (parent.name && parent.contentType == 'city') {
	                                    if (label) label += '<small>, </small>';
	                                    label += '<small>' + parent.typeShort + '. ' + parent.name + '</small>';
	                                }
	                            }
	                        }
	
	                        return label;
	                    }
	                });
	                $region.kladr('type', $.kladr.type.region);
	                $district.kladr('type', $.kladr.type.district);
	                $city.kladr('type', $.kladr.type.city);
	                $street.kladr('type', $.kladr.type.street);
	                $building.kladr('type', $.kladr.type.building);
	
	                $.kladr.setValues({
	                    region: 7800000000000,
	                    city: 7800000000000
	                }, '.kladr-form');
	
	                // Включаем получение родительских объектов для населённых пунктов
	                $city.kladr('withParents', true);
	                $street.kladr('withParents', true);
	
	                // Отключаем проверку введённых данных для строений
	                $building.kladr('verify', false);
	
	                function setLabel($input, text) {
	                    text = text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
	                    $input.parent().find('label').text(text);
	                }
	
	                function mapUpdate() {
	                    var zoom = 4;
	                    var address = $.kladr.getAddress($kladr_form, function (objs) {
	                        var result = '';
	                        $.each(objs, function (i, obj) {
	                            var name = '',
	                                type = '';
	
	                            if ($.type(obj) === 'object') {
	                                name = obj.name;
	                                type = obj.type + ' ';
	
	                                switch (obj.contentType) {
	                                    case $.kladr.type.region:
	                                        zoom = 4;
	                                        break;
	
	                                    case $.kladr.type.district:
	                                        zoom = 7;
	                                        break;
	
	                                    case $.kladr.type.city:
	                                        zoom = 10;
	                                        break;
	
	                                    case $.kladr.type.street:
	                                        zoom = 13;
	                                        break;
	
	                                    case $.kladr.type.building:
	                                        zoom = 16;
	                                        break;
	                                }
	                            }
	                            else {
	                                name = obj;
	                            }
	
	                            if (result) result += ', ';
	                            result += type + name;
	                        });
	
	                        return result;
	                    });
	
	                    if (address && this.map_created) {
	                        var geocode = ymaps.geocode(address);
	                        geocode.then(function (res) {
	                            this.map.geoObjects.each(function (geoObject) {
	                                map.geoObjects.remove(geoObject);
	                            });
	
	                            var position = res.geoObjects.get(0).geometry.getCoordinates(),
	                                placemark = new ymaps.Placemark(position, {}, {});
	
	                            this.map.geoObjects.add(placemark);
	                            this.map.setCenter(position, zoom);
	                        });
	                    }
	                }
	
	                function addressUpdate() {
	                    var address = $.kladr.getAddress($kladr_form);
	                    $kladr_form.find('input[name="fulladdress"]').val(address);
	                }
	            },
	
	        },
	        4: {
	            loaded: false,
	            load: function(){
	                var form = $('#who-delivery-product');
	                var userlist = this.getUserList();
	
	                form.find('select[name="who"]').selectize({
	                    allowEmptyOption: false,
	                    create: false,
	                    plugins: {
	                        'dropdown_footer': {
	                            title: 'Мы можем доставить цветы вам, или поздравить кого-нибудь от вас'
	                        }
	                    },
	                });
	                form.find('select[name="reason"]').selectize({
	                    allowEmptyOption: false,
	                    create: false,
	                    plugins: {
	                        'dropdown_footer': {
	                            title: 'Вы можете изменить или добавить новые поводы <a href="reasons.html">здесь</a>'
	                        }
	                    }
	                });
	                userlist.done(function(response){
	                    console.log('Get user list');
	                    console.log(response);
	                    form.find('select[name="fromme_to_name"]').selectize({
	                        allowEmptyOption: false,
	                        valueField: 'id',
	                        labelField: 'name',
	                        searchField: ['name', 'phone'],
	                        options: response,
	                        addPrecedence: 'Добавить',
	                        render: {
	                            item: function(item, escape) {
	                                return '<div>' +
	                                    (item.name ? '<span class="name">' + escape(item.name) + '</span>' : '')
	                                    '</div>';
	                            },
	                            option: function(item, escape) {
	                                var label = item.name || item.phone;
	                                var caption = item.name ? item.phone : null;
	                                return '<div>' +
	                                    '<span class="label">' + escape(label) + '</span>' +
	                                    (caption ? ' <span class="caption">' + escape(caption) + '</span>' : '') +
	                                    '</div>';
	                            }
	                        },
	                        onChange: function(value) {
	                            var dp = this.$dropdown_content.find('[data-value="' + value +'"]');
	                            var caption = dp.find('.caption').text();
	                            form.find('input[type="tel"]').val(caption);
	                        },
	                        plugins: {
	                            'dropdown_footer': {
	                                title: 'Если вы еще никого не поздравляли от своего имени, просто укажите имя получателя'
	                            }
	                        },
	                        create: true,
	                    });
	                });
	
	                form.find('select[name="who"]').on('change', function(e) {
	                    if($(this).val() == 'fromme')
	                    {
	                        form.find('.fromme .raketa-select').css('width', form.width());
	                        form.find('.fromme').removeClass('hide').hide().slideDown(150);
	                    } else {
	                        form.find('.fromme').slideUp(200).addClass('hide');
	                    }
	                });
	                form.find('select').on('change', function() {
	                    $('button[data-to-form="#' + form.attr('id') + '"]').removeClass('btn-bordered').addClass('btn-primary').removeAttr('disabled');
	                });
	                var _this = this;
	                form.on('submit', function() {
	                    var formObject = $(this).serializeObject();
	                    var dataObject = {};
	                    $.each(formObject, function(index, value) {
	                        if(index != 'csrf') {
	                            dataObject[index] = {
	                                index: index,
	                                value: value,
	                                textValue: form.find('[name="' + index + '"] option[value="' + value +'"]').text()
	                            }
	                        }
	                    });
	                    app.checkout.for = dataObject;
	                    _this.submitHandler($(this));
	                    return false;
	                });
	                this.loaded = true;
	            },
	
	            init: function() {
	                $('#checkout-step').parent().removeClass('middle');
	
	            },
	            close: function() {
	                $('#checkout-step').parent().addClass('middle');
	            },
	            getUserList: function() {
	                return $.Deferred(function () {
	                    var self = this;
	                    //Ajax simulation
	                    var userlist = [];
	                    setTimeout(function () {
	                        userlist = [
	                            {id: 1, name: 'Екатерина', phone: '+7(956)000-0011'},
	                            {id: 2, name: 'Мария', phone: '+7(956)111-0022'},
	                            {id: 3, name: 'Иван', phone: '+7(956)222-0033'}
	                        ];
	                        self.resolve(userlist);
	                    }, 2000);
	                });
	            },
	            submitProcess: function(data, callback) {
	                console.log('[FOR DELIVERY] Send form data to server:');
	                console.log(data);
	                // Ajax simulation
	                setTimeout(function() {
	                    var response = {
	                        status: true
	                    };
	                    if(typeof callback === "function")
	                        callback(response);
	                }, 2000);
	            },
	            submitHandler: function(form) {
	                $('button[data-to-form="#' + form.attr('id') + '"]').closest('.bottom').removeClass('show');
	                var data = form.serializeArray();
	                var step = app.checkout.getCurrentStep();
	                step.closest('.content-panel').addClass('middle');
	                form.hide();
	                console.log(step);
	                ajaxloader.local({
	                    element: form,
	                    to: '.step4',
	                    title: lang.processSave
	                });
	                this.submitProcess(data, function(response) {
	                    ajaxloader.finish();
	                    form.show();
	                    step.closest('.content-panel').removeClass('middle');
	                    $('button[data-to-form="#' + form.attr('id') + '"]').closest('.bottom').addClass('show');
	                    if(response.status == true)
	                    {
	                        $(document).trigger('raketa.checkout.update');
	                        app.checkout.goToStep(8);
	                    }
	                });
	            },
	        },
	        5: {
	            loaded: false,
	            init: function() {
	
	            }
	        },
	        6: {
	            loaded: false,
	            init: function() {
	
	            }
	        },
	        7: {
	            loaded: false,
	            init: function() {
	
	            }
	        },
	        8: {
	            loaded: false,
	            load: function() {
	                var _this = this;
	                $(document).on('raketa.checkout.update', function() {
	                    _this.updateHtml();
	                });
	
	                $('button[type="checkout"]').on('click', function() {
	                    ajaxloader.local({
	                        element: $('#result'),
	                        to: '.step8',
	                        title: lang.loading
	                    });
	                    $(this).hide();
	                    app.checkout.save(function(response) {
	                        ajaxloader.finish();
	                        if(response.status == true)
	                        {
	                            window.location = response.paymentUrl;
	                        }
	                        $(this).show();
	                    });
	                    return false;
	                });
	
	                this.loaded = true;
	            },
	            init: function() {
	                if(
	                    app.checkout.basket.length &&
	                    app.checkout.delivery.address &&
	                    app.checkout.delivery.timeofday &&
	                    app.checkout.delivery.date &&
	                    app.checkout.for
	                )
	                {
	                    $('button[type="checkout"]').removeAttr('disabled');
	                } else {
	                    $('button[type="checkout"]').attr('disabled', 'disabled');
	                }
	
	
	                this.updateHtml();
	            },
	            updateHtml: function() {
	                var result = $('#result');
	
	                if(app.checkout.for)
	                {
	                    var recipient = app.checkout.for;
	                    if(recipient.who.value != "me") {
	                        var text = recipient.fromme_to_name.textValue;
	                        var phone = recipient.fromme_to_phone.value;
	                        var reason = recipient.reason.textValue;
	                        result.find('li.who span').html(text + '<br><b>'+phone+',</b>' + ' <i>' + reason + '</i>');
	                    } else {
	                        result.find('li.who span').html(app.checkout.for.who.textValue);
	                    }
	                    console.log(app.checkout.for);
	
	                }
	
	
	                if(app.checkout.delivery.address)
	                {
	                    var fulladdress = app.checkout.delivery.address.fulladdress;
	                    var address = fulladdress.split(',');
	                    console.log(app.checkout.delivery.address);
	                    var strAddress = [
	                        address[2],
	                        (address[3]?address[3]:app.checkout.delivery.address.building),
	                        (app.checkout.delivery.address.apartment?'кв ' + app.checkout.delivery.address.apartment:'')
	                    ];
	                    result.find('li.address span').html(strAddress.join(', ')).parent().removeClass('empty');
	                }
	                else
	                {
	                    result.find('li.address span').html('Адрес').parent().addClass('empty');
	                }
	
	
	                if(app.checkout.delivery.date &&
	                    app.checkout.delivery.timeofday)
	                {
	                    var date = app.checkout.delivery.date;
	                    date = moment(date, 'DD.MM.YYYY').format('D MMMM');
	                    var timeofday = lang[app.checkout.delivery.timeofday];
	                    result.find('li.delivery-date span').html(timeofday + ' '+date);
	                }
	            }
	        }
	    },
	    loadLastStep: function() {
	        var step = Cookies.get('reketa_checkout__step');
	        if(step)
	        {
	            this.goToStep(step);
	            return true
	        } else
	            return false
	    },
	    getCurrentStep: function() {
	        return this.currentStep;
	    },
	    goToStep: function(step) {
	        Cookies.set('reketa_checkout__step', step, { expires: 365, path: '/' });
	        var checkout = $('#checkout-step');
	        var currentStep = checkout.find('.step.active');
	        if(currentStep.length)
	            this.currentStep = currentStep;
	        else
	            this.currentStep = $('#checkout-step .step[data-step="'+ step +'"]');
	
	        var stepItem = (currentStep.data('step') ? currentStep.data('step') : step);
	        currentStep.trigger('close');
	        if(this.step[stepItem] && this.step[stepItem].close)
	            this.step[stepItem].close();
	        currentStep.removeClass('active');
	
	        if(settings.env == 'dev')
	            console.log('[STEP] Go to checkout step #' + step);
	
	        checkout.find('.step.step' + step).addClass('active').trigger('open');
	        checkout.parent().find('.bottom[data-to-step]').removeClass('show');
	        checkout.parent().find('.bottom[data-to-step="step' + step + '"]').addClass('show');
	
	        if(this.step[step]
	            && !this.step[step].loaded
	            && (typeof this.step[step].load === "function")
	        )
	            this.step[step].load()
	
	        if(this.step[step]
	            && this.step[step].loaded
	            && (typeof this.step[step].init === "function")
	        )
	            this.step[step].init()
	    },
	};
	
	$.extend( app.checkout, _checkout );


	$w.scroll(function () {
		app.scroll();
	});
	$w.resize(function () {
		app.resize();
	});

	app.init();



});


Hash = {
	get: function() {
		var vars = {}, hash, splitter, hashes;
		if (!this.oldbrowser()) {
			var pos = window.location.href.indexOf('?');
			hashes = (pos != -1) ? decodeURIComponent(window.location.href.substr(pos + 1)) : '';
			splitter = '&';
		}
		else {
			hashes = decodeURIComponent(window.location.hash.substr(1));
			splitter = '/';
		}

		if (hashes.length == 0) {return vars;}
		else {hashes = hashes.split(splitter);}

		for (var i in hashes) {
			if (hashes.hasOwnProperty(i)) {
				hash = hashes[i].split('=');
				if (typeof hash[1] == 'undefined') {
					vars['anchor'] = hash[0];
				}
				else {
					vars[hash[0]] = hash[1];
				}
			}
		}
		return vars;
	},
	set: function(vars) {
		var hash = '';
		for (var i in vars) {
			if (vars.hasOwnProperty(i)) {
				hash += '&' + i + '=' + vars[i];
			}
		}

		if (!this.oldbrowser()) {
			if (hash.length != 0) {
				hash = '?' + hash.substr(1);
			}
			window.history.pushState(hash, document.title, document.location.pathname + hash);
		}
		else {
			window.location.hash = hash.substr(1);
		}
	},
	add: function(key, val) {
		var hash = this.get();
		hash[key] = val;
		this.set(hash);
	},
	remove: function(key) {
		var hash = this.get();
		delete hash[key];
		this.set(hash);
	},
	clear: function() {
		this.set({});
	},
	oldbrowser: function() {
		return !(window.history && history.pushState);
	},
};
function getImageLightness(imageSrc) {
    var deferred = $.Deferred();
    var img = document.createElement("img");
    img.src = imageSrc;
    img.style.display = "none";
    document.body.appendChild(img);

    var colorSum = 0;

    img.onload = function() {
        // create canvas
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this,0,0);

        var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        var data = imageData.data;
        var r,g,b,avg;

        for(var x = 0, len = data.length; x < len; x+=4) {
            r = data[x];
            g = data[x+1];
            b = data[x+2];

            avg = Math.floor((r+g+b)/3);
            colorSum += avg;
        }

        var brightness = Math.floor(colorSum / (this.width*this.height));
        deferred.resolve(brightness);
        this.remove();
    }
    img.onerror = function() {
        console.log('Error loading image: ' + imageSrc);
        deferred.fail();
    }
    return deferred.promise();
}

String.template = function () {
    var str = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        str = str.replace(RegExp("\\{" + i + "\\}", "gm"), arguments[i]);
    }
    return str;
};
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

/**
 * Number.prototype.format(n, x, s, c)
 *
 * @param integer n: length of decimal
 * @param integer x: length of whole part
 * @param mixed   s: sections delimiter
 * @param mixed   c: decimal delimiter
 */
Number.prototype.format = function(n, x, s, c) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = this.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function countDown(params) {
    var duration = params.time;
    var display = params.display;
    var showMinutes = params.showMinutes;

    if(!duration)
        return;

    var start = Date.now(),
        diff,
        minutes,
        seconds;

    function timer() {
        diff = duration - (((Date.now() - start) / 1000) | 0);
        minutes = (diff / 60) | 0;
        seconds = (diff % 60) | 0;

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        if(display && showMinutes)
            display.text( minutes + ":" + seconds);
        else if(display)
            display.text((minutes != 0 ? minutes + ":" : "")    + seconds);

        if (diff <= 0) {
            clearInterval(interval);
            if(typeof params.afterFinish === 'function' )
                params.afterFinish();
        }
    }

    timer();
    var interval = setInterval(timer, 1000);
}


(function($,undefined){
    $.fn.serializeObject = function(){
        var obj = {};

        $.each( this.serializeArray(), function(i,o){
            var n = o.name,
                v = o.value;

            obj[n] = obj[n] === undefined ? v
                : $.isArray( obj[n] ) ? obj[n].concat( v )
                : [ obj[n], v ];
        });

        return obj;
    };
})(jQuery);


function getNumEnding(iNumber, aEndings)
{
    var sEnding, i;
    iNumber = iNumber % 100;
    if (iNumber>=11 && iNumber<=19) {
        sEnding=aEndings[2];
    }
    else {
        i = iNumber % 10;
        switch (i)
        {
            case (1): sEnding = aEndings[0]; break;
            case (2):
            case (3):
            case (4): sEnding = aEndings[1]; break;
            default: sEnding = aEndings[2];
        }
    }
    return sEnding;
}