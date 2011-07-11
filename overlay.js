/**
 * quintons@qsheppard.com
 */

 
(function($){ 
	
	$.overlaySettings = {
		wrapper: 'overlay-wrapper',
		width: null,
		height: null,
 		load: false,
 		contentType: 'inpage', /*inpage, iframe, ajax*/
 		contentSrc: null, /*class/id, URL*/
 		closeButtonId: '.closeButton',
 		submitPageOnClose: false, /*mastek only code*/
 		speed: 500,
 		pos: ($.browser.msie && $.browser.version <= 6) ? 'absolute' : 'fixed',
 		mask: {
 			id: "Mask",
			color: '#000',
			speed: 500, /*loading/unloading speed*/
			opacity: 0.8
		},
 		progress: {
 			id: "Progress",
 			src: null
 		},
 		
	}
	
	var $mask, $progress, $overlay = null;
	
	var progress = {
		load: function(conf){
   		
   		$progress = $(conf.progress.id);
   		
   		// does progress exist?
   		if(!$progress.length){
	   		// create & show progress
	   		$progress = typeof conf.progress.src === 'string' ?
	   			$('<img src="'+conf.progress.src+'" id="'+conf.progress.id+'" />') : 
	   			conf.progress.src !== null ? conf.progress.src.attr('id', conf.progress.id) : null;
	   		
	   		if($progress === null){
   				throw("unable to create progress, you must pass either a jQ object or image name");
   			}
	   		$progress.css({
	   			top: '50%',
	   			display: 'none',
	   			left: '50%',
	   			zIndex: '9998',
	   			position: conf.pos
	   		})
	   		$('body').append($progress);
   		}
		},
		close: function(conf, callback){
			$progress.fadeOut(500, callback)
		}
	}
	
	var mask = {
		load: function(conf, callback){
			// does the mask exist?
			$mask = $('#' + conf.mask.id);
			var $w = $(window);
			
			// create the mask if not found
			if(!$mask.length){
				$mask = $("<div />").attr("id", conf.mask.id)
				$('body').append($mask);
			}
			
			// set its properties
			$mask.css({
				top: 0,
				left: 0,
				position: conf.pos,
				backgroundColor: conf.mask.color,
				height: $w.height(),
				width: $w.width(),
				display: 'none',
				opacity: conf.mask.opacity,
				zIndex: '9997'
			}).fadeIn(conf.mask.speed, callback); // animate mask
			
			// resize mask on window resize
			$(window).bind('resize.mask', function(e){
				$mask.css({
					height: $w.height(),
					width: $w.width()
				})
			})

		},
		close: function(conf, callback){
			$mask.fadeOut(conf.mask.speed, callback);
		}
	}
	
	/* Description: 	Constructor Overlay
   /*						sets up overlay, applies
   * Arguments:
   * 	trigger - this.
   * 	conf - options.
   */
   function Overlay(trigger, conf){
   	
   	// private members
   	var self = this,
   		opened = false,
   		oid,
   		uid = Math.random().toString().slice(10),
   		$w = $(window);
   	
   	// test if mastek showOverlay exists - set accordingly
   	if(conf.mastek){$.extend(conf, mastek.setConf(trigger, conf))}
   	
   	// private methods
		// get overlay class wrapper
   	oid = conf.wrapper || trigger.attr('data-wrapper');
   	$overlay = $(oid);
   	
   	// can't find the overlay!
   	if(!$overlay) { throw('Cound not find overlay: ' + oid) }
   	
   	// trigger load
   	if(trigger){
   		trigger.click(function(e){
   			self.load(e);
   			return e.preventDefault();
   		})
   	}
   	
		// resize overlay on window resize
		$w.bind('resize.overlay', function(e){
			if(opened){
	   		var h = ($w.height() -40 < self.height) ? $w.height() -40 : self.height;
	   		var w = ($w.width() -40 < self.width) ? $w.width() -40 : self.width;
				$overlay.css({
					height: h,
					width: w,
					marginTop: '-' + h/2 + 'px',
					marginLeft: '-' + w/2 + 'px'})
			}
		})
   	
   	var setOverlayCss = function(){
   		// set the overlay's default width/height
   		self.width 	= 	conf.width != null ? conf.width : 
								trigger.data('width') ? trigger.data('width') : $overlay.width();
   		self.height = 	conf.height != null ? conf.height : 
	   						trigger.data('height') ? trigger.data('height') : $overlay.height();
	   	
	   	// set the current overlay width/height depending on window size
	   	var h = $w.height() -40 < self.height ? $w.height() -40 : self.height;
	   	var w = $w.width() -40 < self.width ? $w.width() -40 : self.width;
			
	   	// set overlay css.
	   	$overlay.css({
				width: w,
				height: h,
				display: 'none',
				position: conf.pos,
				top: '50%',
				left: '50%',
				marginLeft: '-' + w/2 + 'px',
				marginTop: '-' + ((h/2)+4) + 'px',
				zIndex: '9999'
			})
	   }
   	
   	var loadContent = function(){
			// load content
			switch(conf.contentType){
				case 'iframe':
				
   				$overlay = $('<iframe />').prependTo('body');
   				
   				if(conf.wrapper != null){ $overlay.attr("class", conf.wrapper); }
	   			
   				$overlay
   				.css({ left: '-1000px', position: 'absolute', display: 'block' })
   				.attr("src", conf.contentSrc)
					.bind('load', function(){
						
						setOverlayCss();
			   		
					   // fade in content
					   $progress.fadeOut(500, function(){
					   	$overlay.fadeIn(conf.speed)
					   })
		   			
		   			//---- Chrome Issue
		   			// Only access iframe with same domain name
			   		$overlay.contents().find(conf.closeButtonId).one('click', function(e){
			   			self.close(e);
			   			return e.preventDefault();
			   		})
	   			})
					break;
				case 'inpage':
					console.warn('"inpage" switch not enabled');
					
					break;
				case 'ajax':
					console.warn('"ajax" switch not enabled');
					break;
				default:
					break;
			}
			
			
   	}
   	
   	$.extend(self, {
   		// public methods
   		load: function(e){
   			
   			progress.load(conf);
   			
   			// show mask
   			mask.load(conf, 
   				function(){
   						$progress.fadeIn(500, loadContent())
   				} 
   			)
   			
   			opened = true;
   		},
   		close: function(e){
   			$overlay.fadeOut(conf.speed, 
   				function(){mask.close(conf	, 
						function(){
							if(conf.submitPageOnClose){document.forms[0].submit();}
						}
   				)}
   			);
   			opened = false;
   		},
   		width: null,
   		height: null,
   		getOverlay: function(){
   			return $overlay;
   		}
   	})
    	
    	if(conf.load){
    		self.load();
    	}
    	
   	return self;
   }
			


	$.fn.overlay = function(conf){
		// create new instance of overlay
   	var el = this.data('overlay'),
   		$this = $(this);
    	if(el){ return el; }
    	$.extend(true, $.overlaySettings, conf);
    	el = new Overlay($this, $.overlaySettings);
  		$this.data('overlay', el);
  		
  		return this;
	}
	
	$.extend({
		overlay: function(conf){
			conf.load = true;
			return Overlay(null, $.extend(true, $.overlaySettings, conf));
		}
	})
	
  	// mastek only code.
  	var mastek = {
  		setConf: function(trigger, conf){
  			var a;
  			window.showOverlay = function(){ a = arguments;}
  			var onclick = trigger.attr('onclick');
  			
  			if(onclick !== undefined){
  				eval('('+onclick+')()');
  			}else{
  				throw('No onclick event with "showOverlay()" available on trigger element.')
  				return false;
  			}
  			
  			return {
		  		wrapper : (function(){
		  				return (a.length == 3) ? 
		  					(a[0] != null && a[0].length > 0) ? a[0] : conf.wrapper : conf.wrapper;
		  		})(),
		  		contentSrc : (function(){
		  				return (a.length == 3) ?
		  					(a[2] != null && a[2].length > 0) ? a[2] : conf.contentSrc : conf.contentSrc;
		  		})()
		  	}
  		}
  	}
  	
})(jQuery);