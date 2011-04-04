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
 		loadSpeed: 500,
 		reloadPageOnClose: false, /*mastek only code*/
 		timeoutSec: 8,
 		pos: ($.browser.msie && $.browser.version <= 6) ? 'absolute' : 'fixed',
 		mask: {
 			maskId: "mask",
			color: '#000',
			loadSpeed: 500,
			opacity: 0.7,
		},
 		progress: {
 			src: 'progress.gif'
 		}
	}
	
	var $mask, $progress, $overlay = null;
	
	$.mask = {
		load: function(conf, callBack){
			// does the mask exist?
			$mask = $('#' + conf.maskId);
			
			// create the mask if not found
			if(!$mask.length){
				$mask = $("<div />").attr("id", conf.maskId)
				$('body').append($mask);
			}
			
			// set its properties
			$mask.css({
				position: $.overlaySettings.pos,
				left: '0',
				top: '0',
				backgroundColor: conf.color,
				height: $(window).height(),
				width: $(window).width(),
				display: 'none',
				opacity: conf.opacity,
				zIndex: '9997'
			})
			
			// animate mask
			$mask.fadeIn(conf.loadSpeed, callBack);
			
			// resize mask on window resize
			$(window).bind('resize.mask', function(e){
				$('#' + conf.maskId).css({
					height: $(window).height(),
					width: $(window).width()
				})
			})

		},
		close: function(conf, callBack){
			$mask.fadeOut(conf.mask.loadSpeed, callBack);
		},
		getMask: function(){
			return $mask;
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
   		uid = Math.random().toString().slice(10);
   	
   	// test if mastek showOverlay exists - set accordingly
   	if(conf.mastek){$.extend(conf, mastek.setConf(trigger, conf))}
   	
   	// private methods
		// get overlay class wrapper
   	oid = conf.wrapper || trigger.attr('data-overlay-wrapper');
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
   	
   	var loadContent = function(){
			// load content
			//iframe, ajax, inpage
			switch(conf.contentType){
				case 'iframe':
   				$overlay = $('<iframe />');
   				$overlay.css({ left: '-1000px', position: 'absolute', display: 'block' })
   				
   				if(conf.wrapper != null){
   					$overlay.attr("class", conf.wrapper);
   				}
   				
   				// w/h from config or element?
					var w = (conf.width != null) ? conf.width : $overlay.width();
   				var h = (conf.height != null) ? conf.height : $overlay.height();  						
   				
   				$overlay.attr("src", conf.contentSrc);
   				
   				// bind load event to iframe
   				$overlay.bind('load', function(){
   					
			   		$overlay.css({
		   				width: w,
		   				height: h,
		   				display: 'none',
		   				position: conf.pos,
		   				top: '50%',
		   				marginLeft: '-' + w/2 + 'px',
		   				marginTop: '-' + h/2 + 'px',
		   				zIndex: '9999'
		   			})
			   			
		   			// fade in content
		   			$progress.fadeOut('500', function(){
		   				$overlay.css({left: '50%'}).fadeIn(conf.loadSpeed)
		   			})
			   			
		   			//TODO: throw error if !localhost && !sameDomain
		   			//var isDomainMatch = true;
		   			//if(conf.closeButtonId && isDomainMatch){
		   				$overlay.contents().find(conf.closeButtonId).one('click', function(e){
		   					self.close(e)
		   					return e.preventDefault()
		   				})
		   			//}
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
			
			$('body').prepend($overlay);
   	}
   	
   	$.extend(self, {
   		// public methods
   		load: function(e){
   			// load overlay code...
   			if(self.isOpened()){return self;}
   			
   			$progress = $('#overlayProgress');
   			
   			// does progress exist?
   			if(!$progress.length){
	   			// create & show progress
	   			$progress = $('<img src="'+conf.progress.src+'" id="overlayProgress" />');
	   			$progress.css({
	   				top: '50%',
	   				display: 'none',
	   				left: '50%',
	   				zIndex: '9998',
	   				position: conf.pos
	   			})
	   			$('body').append($progress);
   			}
   			
   			// show mask
   			$.mask.load(conf.mask, 
   				function(){
   						$progress.fadeIn('slow', loadContent())
   				} 
   			)
   			
   			opened = true;
   		},
   		close: function(e){
   			this.getOverlay().fadeOut(500, 
   				function(){$.mask.close(conf, 
						function(){
							if(conf.reloadPageOnClose){window.location.reload();}
						}
   				)}
   			);
   			opened = false;
   		},
   		isOpened: function(){
   			return opened;
   		},
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
  			function showOverlay(){ a = arguments;}
  			eval('('+trigger.attr('onclick')+')()');
  			
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