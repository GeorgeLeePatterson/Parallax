
/*global browser:false */
/*global window:false */
/*global document:false */
/*global console:false */
/*global $:false */

var ckbe = {
		
		util: {
            
					setEnvironmentStatus: function(id) {
						
						ckbe.environment.status = id;
						console.log("Setting Environment Status: " + ckbe.environment.status);
						
					},
					
					checkEnvironment: function (obj) {
                        
						var $obj = $(obj);
						
						console.log("checkEnvironment: launcher's - " + $obj.data("id") + " || environment - " + ckbe.environment.status);
						
                        //If the object checking the environment is not the active one, close it, otherwise, return doing nothing.
						if ($obj.data("id")!==ckbe.environment.status)
							ckbe.util.closeActiveStatus(ckbe.environment.status);
						else
							return true;
						
						console.log("checkEnvironment: returning false -- " + $obj.data("id"));
						
                        //A different return type would be advisable. 
						return false;
					},
					
					closeActiveStatus: function (id) {
						
						$("#" + id).remove();
					
					},
                    
                    //Function is used for dynamic tooltip positioning. Pulled out here so that it can be used for other animations.
					getDimensions: function (obj) {
								
								var $obj = $(obj);
								
								//Save positioning to an array
								var dimensions = {
											height: $obj.outerHeight(),
											width: $obj.outerWidth(),
											left:  $obj.offset().left,
											top:  $obj.offset().top,
											right:  $obj.offset().left + $obj.outerHeight(),
											bottom:  $obj.offset().top + $obj.outerWidth()
								};
								
								return dimensions;
					}
					
		},
		
		environment: {
			
			status:null
			
		},
		
		elements: {
			
            uiBillboard: function() {

                    var sel = ".ui-billboard";

                    if ($(sel).length) {
                        
                        $(sel).each( function (i, obj) {

                            var intrv;

                            //Set fade in and fade out speeds as well as interval
                            var speed = 400;
                            var int = 10000;
                            
                            //Need to declare our stage with (this) or multiple ui-menus won't operate independently
                            var $stg = $(this);
                            
                            //Now we can find our components in the context of this stage
                            var $sld = $stg.children(".slides");
                            var $data = $stg.children(".data");
                            var $prev = $stg.children(".previous-button");
                            var $next = $stg.children(".next-button");
                            
                            var img_l = $data.data("list").split("|");
                            var img_s = $data.data("source");

                            var cde_p = "blb_code_";
                            var url_p = "blb_url_";

                            //Used jQuery to determine slides
                            var $cnt_cur = $sld.children(".current-slide");
                            var $cnt_prev = $cnt_cur.prev();
                            var $cnt_next = $cnt_cur.next();

                            //Data Objects
                            var active = $data.data("active");
                            var hover = $data.data("hover");
                            var cur = $data.data("current");
                            var cnt = $data.data("count");

                            var tar = 1;

                            $stg.on("mouseover", function() {

                                hover = true;

                                setTimeout( function() {

                                    if (hover) {

                                        $prev.fadeIn(speed);
                                        $next.fadeIn(speed);

                                        clearInterval(intrv);

                                    }
                                }, 100);
                            
                            });

                            $stg.on("mouseout", function () {

                                hover = false;

                                setTimeout( function() {

                                    if (!hover) {

                                        clearInterval(intrv);

                                        $prev.fadeOut(speed);
                                        $next.fadeOut(speed);

                                        intrv = setInterval(ckbeMotion_billboard_autoNext, int);

                                    }
                                }, 100);
                            
                            });

                            $prev.on("click", function() {

                                if (!active) {

                                    clearInterval(intrv);

                                    tar = cur - 1;

                                    if (tar < 1) tar = cnt;

                                    ckbeMotion_billboard_animate(tar, "prev");

                                }
                            
                            });

                            $next.on("click", function() {

                                if(!active) {

                                    clearInterval(intrv);

                                    tar = cur + 1;

                                    if (tar > cnt) tar = 1;

                                    ckbeMotion_billboard_animate(tar, "next");

                                }
                                
                            });

                            function ckbeMotion_billboard_animate(tar, dir) {

                                if (active) return;

                                active = true;

                                var img = img_s + img_l[tar-1];
                                var cde = cde_p + tar;
                                var url = url_p + tar;

                                $cnt_cur.css("cursor", "default");
                                $cnt_cur.off("click");

                                cde = $("#"+cde).html();
                                url = $("#"+url).html();
                                
                                var $cnt = (dir == "next") ? $cnt_next : $cnt_prev;
                                var anim = (dir == "next") ? "-=" : "+=";
                                
                                $cnt.css("background-image", "url(" + img + ")");  
                                $cnt.html(cde);

                                //Devnote: Even though slide is animating "left", it is moving -=, which right to left
                                $sld.animate({left:anim + "100%"}, 1000, function() {

                                    $cnt_cur.css("background-image", $cnt.css("background-image"));
                                    $cnt_cur.html($cnt.html());

                                    if (url === "")
                                        $cnt_cur.css("cursor", "default").off("click");
                                    else 
                                        $cnt_cur.css("cursor", "pointer").click( function () { ckbeCommon_go(url); });
                                    
                                    active=false;
                                    
                                });

                                $sld.animate({'left':'0'},0);

                                cur = tar;
                            
                            }

                            function ckbeMotion_billboard_autoNext() {

                                if (!active) {

                                    tar = cur + 1;

                                    if (tar > cnt) tar = 1;

                                    ckbeMotion_billboard_animate(tar, "next");

                                }
                            }

                            intrv = setInterval(ckbeMotion_billboard_autoNext, int);

                        });
                    }

            },
            
			uiTooltip: {
				
				defaults: {
					
						position: "top",
						trigger: "mouseenter",
						speed: 250,
						delay: 1000,
						tlt_off: 5
					
				},
				
				selectors: {
					obj: ".ui-tooltip-launcher",
					tlt: "ui-tooltip",
					data: "div.data"
				},
				
				timeouts: {
					
					ckbe_timeout: ""
					
				},
				
				init: function() {
                
							var sel = ckbe.elements.uiTooltip.selectors.obj;//Declare the selector for the tooltip launcher, the objent that will receive a tooltip
							var tlt_s = ckbe.elements.uiTooltip.selectors.tlt;//Declare the selector that the tooltip will have
							var sel_d = ckbe.elements.uiTooltip.selectors.data;//Delcaring the selector the data div that will hold the tooltip content

							//Setting the approximate horizontal and vertical margins of the Arrow. This needs to be done differently.
							var tlt_off = ckbe.elements.uiTooltip.defaults.tlt_off;

							//Make sure the objent exists on the page
							if ($(sel).length) {

									$(sel).each(function(i, obj) {

										var $obj = $(obj);

										//If data-content attribute exists, use that as content, otherwise, use data div's
										var cont = $(obj).data("content") ? $(obj).data("content") : $(obj).next(sel_d) ? $(obj).next(sel_d).html() : ""; 
										var evnt = $(obj).data("event") ? $(obj).data("event") : ckbe.elements.uiTooltip.defaults.trigger;
										var clas = $(obj).data("class") ? $(obj).data("class") : "";
										var pos = $(obj).data("position") ? $(obj).data("position") : ckbe.elements.uiTooltip.defaults.position;
										var spd = $(obj).data("speed") ? $(obj).data("speed") : ckbe.elements.uiTooltip.defaults.speed;
										var dly = $(obj).data("delay") ? $(obj).data("delay") : ckbe.elements.uiTooltip.defaults.delay;

										//SET THE LAUNCHER'S ID AS WELL AS THE TOOLTIP'S ID
										var obj_id = new Date().getTime() + i;
										
										$obj.attr("id", obj_id).data("id", obj_id + "-b");

										//DECLARING OBJECT BEFORE BINDING TO PRESERVE CONTEXT
										var $self = $(this);

										///////////////////////////////////////
										//Launcher binding
										$obj.on(evnt + ".ckbe" + tlt_s, function(e) {


												clearTimeout(ckbe.elements.uiTooltip.timeouts.ckbe_timeout);

												var tlt_open = ckbe.util.checkEnvironment($obj);

												console.log("Environment Status: " + ckbe.environment.status + " || " + tlt_open);

												if(ckbe.environment.status && tlt_open)
													return;

												//If the tooltip is fading out, but we mouseover it, bring it back
												if($("#" + $(this).data("id")) && $("#" + $(this).data("id")).is(":animated")) {

														$("#" + $(this).data("id")).stop().fadeIn(150);

												}

												//INITIALIZE THE TOOLTIP
												var $tlt_id = ckbe.elements.uiTooltip.create($self, pos, clas, cont, spd, dly);

												//SHOW THE TOOLTIP
												ckbe.elements.uiTooltip.show($self);

										});

										$obj.on("mouseleave", function() {

												ckbe.elements.uiTooltip.timeouts.ckbe_timeout = setTimeout( function() {

															//ckbe.elements.uiTooltip.hide($self, spd);

												}, dly);

										});

										///////////////////////////////////////
										//Window binding
										$(window).on("resize", function() {

												if(!ckbe.environment.status || !$( $("#"+ckbe.environment.status).data("id") )) {

														return;

												}

												var e_id = $("#" + ckbe.environment.status).data("id");
												var $e = $("#" + e_id);

												ckbe.elements.uiTooltip.position($e);

										});
										//END BINDINGS
									});//END sel.each

							}//END sel.length
					
					},
					
				create: function(obj, pos, clas, cont, speed, dly) {

						var $obj = $(obj);

						//CREATE NEW DIV FOR TOOLTIP
						var $tlt = $(document.createElement("div"));

						//Fill the new tooltip div with the innerHTML of the data div or the data attribute if there is one set
						$tlt.html(cont);

						//Set the classes that the new div will possess
						$tlt.addClass(ckbe.elements.uiTooltip.selectors.tlt + " " + pos + " " + clas);

						//Set the div's visibility to hidden, not display:none, as then it will have no dimensions
						$tlt.css("visibility","hidden");

						var tlt_id = $obj.data("id");

						$tlt.attr("id", tlt_id).data("id", $obj.attr("id")).appendTo("body");

						console.log("TLT AppendedL: " + $tlt.html());

						///////////////////////////////////////
						//Tooltip binding
						$tlt.on("mouseenter", function() { 

								clearTimeout(ckbe.elements.uiTooltip.timeouts.ckbe_timeout);

								//If the tooltip is fading out, but we mouseover it, bring it back
								if($(this).is(":animated")){

										$(this).stop().fadeIn(150);

								}

						});

						$tlt.on("click", function(event) { event.stopPropagation(); });

						$tlt.on("mouseleave", function() {

								ckbe.elements.uiTooltip.timeouts.ckbe_timeout = setTimeout( function() { 

									ckbe.elements.uiTooltip.hide($obj, speed); 

								} , dly);

						});	

						console.log("returning TLT ID: " + $tlt.attr("id"));

						return $tlt.attr("id");

				},

				show: function(obj) {

						var $obj = $(obj);

						var $tlt = $("#" + $obj.data("id"));

						console.log("show id-b: " + $obj.data("id"));
						console.log("Adding Active: " + $obj.attr("id"));

						ckbe.util.setEnvironmentStatus($obj.data("id"));

						$tlt.css("position", "absolute").css("display", "block").css("visibility", "visible");

						ckbe.elements.uiTooltip.position($obj);

						$tlt.fadeIn(250, function() { console.log("Tooltip faded in"); });

				},
					
				hide: function(obj, speed) {

						var $obj = $(obj);
					
						$("#" + $obj.data("id")).fadeOut(speed, function () { 

								ckbe.util.closeActiveStatus($obj.data("id")); 

								if(ckbe.environment.status==$obj.data("id")) {

									ckbe.environment.status=null;

								}

						});

				},

				position: function position(obj) {

						var $obj = $(obj);

						var $tlt = $("#" + $obj.data("id"));

						var pos = $obj.data("position");

						var win_w = $(window).width();

						var el_p  = ckbe.util.getDimensions($obj);

						var tlt_off = ckbe.elements.uiTooltip.defaults.tlt_off;
					
						console.log("obj ID: " + $obj.attr("id") + " || tt id: " + $tlt.attr("id"));

						var tlt_w = $tlt.outerWidth();
						var tlt_h = $tlt.outerHeight();
						var el_l = el_p.left;
						var el_t = el_p.top;
						var el_w = el_p.width;
						var el_h = el_p.height;

						var tlt_l;//Tootltip Left Position
						var tlt_t;//Tooltip Right Position


						//The switch below allows for cascading based on the location of the tooltip
						//to the window. If a left tooltip goes off the screen, then it will turn into a 
						//right tooltip. If right is ALSO off the screen, it will then turn to a top tooltip.
						switch(pos) {

								 case "left": 

									 tlt_l = el_l - tlt_w - tlt_off;
									 tlt_t = el_t + el_h/2 - tlt_h / 2;

									 if(tlt_l > 0) 
										break;

									 $tlt.removeClass("left").addClass("right");

								 case "right":

									  tlt_l = el_l + el_w + tlt_off;
									  tlt_t = el_t + el_h/2 - tlt_h/2;

									  if((tlt_l+tlt_w) < win_w) 
										break;

									 $tlt.removeClass("right").addClass("top");

								 case "top": 

									  tlt_l = el_l + el_w/2 - tlt_w/2;
									  tlt_t = el_t - tlt_h - tlt_off;
									  break;

								 case "bottom":

									  tlt_l = el_l + el_w/2 - tlt_w/2;
									  tlt_t = el_t + el_h + tlt_off;
									  break;

						}

						var win_diff = tlt_l + tlt_w - win_w;

						if(win_diff>0)
						{

								//Shifting the bubble over to 3/4s the width of the launcher
								tlt_l = ( el_l + (el_w/2) ) - tlt_w + 0.25*el_w;

								$tlt.addClass("pull-right");

								console.log("pulling-right");

						}
						else if(tlt_l<0)
						{

								tlt_l = el_l;	

								$tlt.addClass("pull-left");

								console.log("pulling-left");

						}
						else
						{

								//If the window is being resized, we need to move the arrow into the correct position
								 if($tlt.hasClass("pull-left")) {

										$tlt.removeClass("pull-left");

								 } else if ($tlt.hasClass("pull-right")) {

										$tlt.removeClass("pull-right");

								 }

						}

						console.log("tlt_l " + tlt_l + " || tlt w " +tlt_w + " || el_l: " + el_l + " || pos: " + pos);

						$tlt.css({

								 "left" : tlt_l,
								 "top" : tlt_t

						});

					}
					
			},
			
			uiMenu: {
				
				defaults: {
					
						trigger: "mouseenter",
						sub_tme_o: 120       
					
				},
				
				selectors: {
					
					mnu: ".ui-menu",
					top_links: ".labels * a",
					lnks: ".labels",
					panel: ".panel",
					overlay: ".overlay"
					
				},
				
				timeouts: {
					
					menu_timeout: "",
					submenu_timeout: ""
					
				},
				
				init: function() {
							
					var mnu = ckbe.elements.uiMenu.selectors.mnu;
					var sel = ckbe.elements.uiMenu.selectors.top_links;
					var lab = ckbe.elements.uiMenu.selectors.lnks;
					var pan = ckbe.elements.uiMenu.selectors.panel;
					var blk = ckbe.elements.uiMenu.selectors.overlay;

					if($(mnu).length) {

						$(mnu).each( function (i, men){

							var $mnu = $(this);

							var $sel = $mnu.find(sel);
							var $lab = $mnu.children(lab);
							var $pan = $mnu.children(pan);//Get the panel in the context of this menu
							var $blk = $mnu.children(blk);

							var menu_timeout = ckbe.elements.uiMenu.timeouts.menu_timeout;
							var submenu_timeout = ckbe.elements.uiMenu.timeouts.submenu_timeout;

							var evnt = $mnu.data("event") ? $mnu.data("event") : ckbe.elements.uiMenu.defaults.trigger;

							if(!$pan.data("active")) {

									$pan.data("active",false);

							}

							if($sel.length) {

								//Go through all the top menu links
								$sel.each( function (a, obj) {

											var $obj = $(this);

											var a_fix = parseInt(a + 1);//nth-child is based off of a 1-index, not 0-index

											var $o_pan = $pan.children("div:nth-of-type(" + a_fix + ")");//Get the specific panel for the object

											//Error trap for no corresponding menu
											if(!$o_pan) {

													return true;

											}

											//Get the panels not engaged
											var $n_pan = $pan.children("div:not(:nth-of-type(" + a_fix + "))");

											//Get the top menus not engaged
											var $n_sel = $sel.not(this);

											var $first = $o_pan.children(":nth-child(1)");
											var $second = $o_pan.children(":nth-child(2)");
											var $last = $o_pan.children(":nth-child(3)");//Currently not being used, the context for the third "Image" panel

											//REMOVE CLASS ON MENU ITEMS NOT ACTIVE
											$n_sel.each( function(b,e) {

													var b_fix = Number(b+1);//1-index, not 0

													if(!$pan.children("div:nth-of-type(" + b_fix + ")").is(":visible")) {

															$(this).removeClass("active");

													}

											});

											//Bind Event to Top Menu Items
											$obj.on(evnt + ".ckbe" + mnu, function(e){

													var $this = $(this);

													//Maintain $second context in memory for this scope
													var $sec = $second;

													clearTimeout(ckbe.elements.uiMenu.timeouts.menu_timeout); 

													//Close tooltips when switching menus
													var $tt = $("#"+ckbe.environment.status);
													var $tt_l = $("#" + $("#"+ckbe.environment.status).data("id") );

													//Deal with any other elements opened
													if( ckbe.environment.status && $tt_l.length && $tt.length ){

															if(!$o_pan.has( $tt_l ).length && !$lab.has( $tt_l ).length ){

																	ckbe.util.closeActiveStatus(ckbe.environment.status);

															}
													}

													console.log("Cleared Timeout");

													if(!$obj.hasClass("active")) {

															$obj.addClass("active");

													}

													//REMOVE PANELS NOT ACTIVE
													$n_pan.each( function(){ 

															$(this).css("display","none"); 

													});

													//Show the Panel only if it isn't already shown
													if(!$pan.data("active")) {

															console.log("Sel slide down");

															(function() {

																	//Set overlays position and height
																	var blk_t = Number($sel.position().top + $sel.outerHeight()) + 40;//+ 40 compensating to make sure it sits below panel top
																	var doc_h = $(document).height();
																	var blk_h = doc_h - blk_t;

																	$blk.css("height",blk_h).css("position","absolute").css("top",blk_t);

																	ckbe.elements.uiMenu.showMenu(e, $mnu, $(sel), $pan, $blk, 250);

															})();

													}

													//Show the panel content selected
													$o_pan.css("display","block");

													//ADD DEFAULT MENU SELECTED, SO THAT WHEN THE MENU IS FIRST OPENED, THE FIRST LINKS ARE VISIBLE
													if(!$("div ul:visible",$sec).length){

															var $t_pan = $pan.children("div:nth-child(" + a_fix + ")");//Set the context
															var $t_sub = $("div ul:nth-child(1)",$t_pan);//Get the default (first) sub
															var $n_sub = $("div ul:not(:nth-child(1))",$t_pan);//Get the sub-menus not engaged

															//Close the non-default sub-menus if they are open
															$n_sub.each( function(){ 

																	$(this).css("display","none"); 

															});

															$t_sub.css("display","inline-block").css("visibility","visible");

															$("li:not(:first)",$first).removeClass("active");
															$("li:first",$first).addClass("active");

													}

													//Begin sub-menu binding
													$("li",$first).each( function (b, li) {

															var $li = $(li);

															//FIRST SUB-MENU MOUSEOVER HANDLER		
															$li.on("mouseenter", function () {

																	clearTimeout(ckbe.elements.uiMenu.timeouts.submenu_timeout);

																	var $n_li = $("li", $first).not(this);//Get the menu items not engaged

																	$n_li.removeClass("active");

																	ckbe.elements.uiMenu.timeouts.submenu_timeout = setTimeout( function() {

																			var $sec = $second;

																			var b_fix = b + 1;//nth-child is based off of a 1-index, not 0-index

																			var $sub = $("ul:nth-child(" + b_fix+ ")",$sec);//Get the sub-menu
																			var $n_sub = $("ul:not(:nth-child(" + b_fix+ "))",$sec);//Get the sub-menus not engaged

																			//Moved down from line 689 above
																			$li.addClass("active");

																			//Close sub-menus not engaged
																			$n_sub.each( function(){ 

																					$(this).css("display","none"); 

																			});

																			$sub.css("display", "inline-block").css("visibility","visible");

																	}, ckbe.elements.uiMenu.defaults.sub_tme_o);//THIS VALUE SETS THE DELAY BETWEEN SUB-MENU ITEMS

															});

															//FIRST SUB-MENU MOUSELEAVE
															$li.on("mouseleave", function(ev) {

																	if($second.has($(ev.relatedTarget)).length){

																			clearTimeout(ckbe.elements.uiMenu.timeouts.submenu_timeout);

																	}

																	$(this).removeClass("active");

															});

															$li.on("click", function(ev){

																	ev.preventDefault(); 

																	//@ALEX: LINK CLICK FUNCTIONALITY WILL NEED TO GO HERE!!!
																	window.open($("a",$(this)).attr('href'),'_self');
																	
																	return; 

															});

													});//END LI (FIRST SUBMENU) EACH

											});//END OBJ.ON

											$obj.on("mouseleave", function(ev) {

													clearTimeout(ckbe.elements.uiMenu.timeouts.menu_timeout);

													ckbe.elements.uiMenu.timeouts.menu_timeout = setTimeout( function(){ 

															ckbe.elements.uiMenu.closeMenu(ev, $(sel), $pan, $blk, 300 ); 

													}, 1000);

													$(this).removeClass("active");

											});

											$obj.on("click", function(ev){ 

													ev.preventDefault(); 

											});

								});//END SEL.EACH

							}//END SEL.LENGTH

							$pan.on("mouseenter" , function(ev){

								clearTimeout(ckbe.elements.uiMenu.timeouts.menu_timeout);

								if($pan.is(":animated")){	

										$pan.stop();
										ckbe.elements.uiMenu.showMenu(ev, $mnu, $(sel), $pan, $blk, 150);

								}

							});

							$pan.on("mouseleave", function(ev) {

									clearTimeout(ckbe.elements.uiMenu.timeouts.menu_timeout);

									ckbe.elements.uiMenu.timeouts.menu_timeout = setTimeout( function(){ 

											ckbe.elements.uiMenu.closeMenu(ev, $(sel), $pan, $blk, 300); 

									}, 1000);

							});

							$blk.on("mouseenter", function (ev){

									//if the menu timeout has already been set, use that one
									ckbe.elements.uiMenu.timeouts.menu_timeout = ckbe.elements.uiMenu.timeouts.menu_timeout ? ckbe.elements.uiMenu.timeouts.menu_timeout : setTimeout( function() { 

											ckbe.elements.uiMenu.closeMenu(ev, $(sel), $pan, $blk, 300 ); 

									}, 1000);

							});

							$blk.on("click", function(ev) {

								//If window click occurred inside of menu, don't close
								if($pan.has($(ev.target)).length){

										return;	

								}

								//Deal with Global Actives
								if(!$("#" + ckbe.environment.status).has($(ev.target)).length){

										ckbe.util.closeActiveStatus(ckbe.environment.status);
										ckbe.environment.status=null;

								}

								ckbe.elements.uiMenu.closeMenu(ev, $(sel), $pan, $blk, 0);

							});

							$(window).on("click", function(ev) {

								//If window click occurred inside of menu, don't close
								if($(mnu).has($(ev.target)).length){

										return;	

								}

								//Deal with Global Actives
								if(!$("#" + ckbe.environment.status).has($(ev.target)).length){

										ckbe.util.closeActiveStatus(ckbe.environment.status);
										ckbe.environment.status=null;

								}

								if($pan.data("active")){

										ckbe.elements.uiMenu.closeMenu(ev, $(sel), $pan, $blk, 0);

								}

							});

						});//END MNU.EACH

					}
					
				},
						
				showMenu: function(e, $mnu, $lnks, $pan, $blk, dur) {

					//Cache variables in this scope
					var ev = e;
					var $panel = $pan;
					var $menu = $mnu;
					var $links = $lnks;
					var $overlay = $blk;
					
					//CHECKING IF ANY TOOLTIPS ARE INSIDE THE MENU, IF NOT, CLOSE THEM
					var $tt = $("#"+ckbe.environment.status);
					var $tt_l = $("#" + $("#"+ckbe.environment.status).data("id") );

					if(ckbe.environment.status && $tt_l.length && $tt.length ){

							if(!$menu.has( $tt_l ).length && !$links.has( $tt_l ).length ){

									ckbe.util.closeActiveStatus(ckbe.environment.status);

							}

					}

					//SLIDE THE PANEL DOWN
					$panel.slideDown({
						"duration":dur,
						"complete":function(){

								if(!$(this).hasClass("active")){

										$(this).addClass("active");

								}

								$(this).data("active",true).css("display","block");

						}
					});

					$overlay.fadeIn(dur);
				},

				closeMenu: function(e, $lnks, $pan, $blk, dur) {

						var ev = e;
						var $panel = $pan;
						var $links = $lnks;
						var $overlay = $blk;

						//This is a fix implemented for tooltips and other absolutely positioned elements
						//that may live inside this menu on the page, but not inside it in the DOM
						if( (e.pageY > $panel.offset().top && e.pageY < ($panel.offset().top + $panel.outerHeight()) ) && 
							(e.pageX > $panel.offset().left && e.pageX < ($panel.offset().left + $panel.outerWidth()) ) ){

								return;

						}

						if($panel.has($(e.relatedTarget)).length) {

								return;

						}

						//Get rid of the panel
						$panel.slideUp({

								"duration":dur,
								"start":function(){
									
										$overlay.fadeOut(dur);
								
								},
								"complete":function(){

										$(this).data("active",false);

										if($(this).hasClass("active")){

												$(this).removeClass("active");

										}

										$links.removeClass("active");

										clearTimeout(ckbe.elements.uiMenu.timeouts.menu_timeout);

								}

						});

				}
			
			},
            
            uiFileUpload: {
				
				selectors: {
					
						upld: ".ui-file-upload",
						frm: "form",
						drp: ".drop-area",
						fle_nme: "input.filename",
						fle_upl: "input:file",
						inpts: ".inputs-block",
						ntfy: ".notification",
						tggl: ".toggle-dd",
						sbmt: "form :submit",
						cnfrm: "#confirmation_number"
					
				},
				
				defaults: {
					
						url: "index.php",
						load_img:  "include/images/activity_detail.gif",
						dir: "upload",
						module: "fileupload",
						upload_action: "uploadFiles",
						save_action: "saveFiles",
						thumb: "include/images/activity_thumb.gif",
						warning_class: "warning",
						provide_warning: "Please make sure you have provided both a front and a back of your license.",
						format_warning: "Please upload an image in either JPG or PDF formats.",
						allowed: "jpeg,pdf"
					
				},
				
				init: function() {
					
											
						var upl = ckbe.elements.uiFileUpload.selectors.upld;
						var frm = ckbe.elements.uiFileUpload.selectors.frm;
						var drp = ckbe.elements.uiFileUpload.selectors.drp;
						var fle_nme = ckbe.elements.uiFileUpload.selectors.fle_nme;
						var fle_upl = ckbe.elements.uiFileUpload.selectors.fle_upl;

						var inpts = ckbe.elements.uiFileUpload.selectors.inpts;

						var ntfy = ckbe.elements.uiFileUpload.selectors.ntfy;
						var tggl = ckbe.elements.uiFileUpload.selectors.tggl;

						var sub = ckbe.elements.uiFileUpload.selectors.sbmt;

						var conf = ckbe.elements.uiFileUpload.selectors.cnfrm;//CONFIRMATION NUMBER INPUT
						var cnfrm;

						if( $(upl).length ) {

								cnfrm = $(conf).val();

								$(upl).each( function( i, obj ) {

									var $upl = $(this);
									var $frm = $upl.find(frm);
									var $ntfy = $upl.find(ntfy);
									var $tggl = $upl.find(tggl);
									var $drp = $frm.find(drp);
									var $fle_upl = $frm.find(fle_upl);
									var $inpts = $frm.find(inpts);

									var $sub = $upl.find(sub);

									if($drp.length) {

										$drp.each( function( a, elem ) {

											if($(this).hasClass("hidden")){
												
												$(this).css("display","none");
												
											}
											
											$(this).on("drop", function (ev) {

													var $this = $(this);

													var $filename = $this.children(fle_nme);

													ev.preventDefault();  
													ev.stopPropagation();  

													var files = ev.originalEvent.dataTransfer.files || ev.target.files;//ev.target.files || (ev.dataTransfer && ev.dataTransfer.files);

													ckbe.elements.uiFileUpload.processDrop( files, $this, $filename, cnfrm, $ntfy );

											});

											$(this).on("dragover", function (ev) {
												
													ev.preventDefault();
													ev.stopPropagation();
												
											});

										});

										$fle_upl.on("change", function (ev) {

												var nme = $(this).val().replace(/^.*(\\|\/|\:)/, '');

												$(this).next(fle_nme).val(nme);

												var fld = "[data-field='" + $(this).attr("id") + "']";

												ckbe.elements.uiFileUpload.processDrop( this.files, $frm.find(fld) , $frm.find(fld).children(fle_nme), cnfrm , $ntfy );

										});
										
									}

									if($tggl.length) {

											$tggl.on("click", function (ev) {

												$inpts.css("display","block");

												//Turn off drop handler for old-fashioned upload
												$(drp).off("drop");
												
											});
										
									}

									$frm.on("submit", function (ev) {

										ev.preventDefault();

										ckbe.elements.uiFileUpload.saveFilesToServer( ckbe.elements.uiFileUpload.defaults.url, cnfrm, $ntfy);

									});

								});


								$(window).on("dragover", function (ev) {
									
										ev.preventDefault();
										ev.stopPropagation();
									
								});

								$(window).on("drop", function (ev) {

										ev.preventDefault();
										ev.stopPropagation();

								});

						}
					
				},
				
                processDrop: function( files, $drp, $filename, cnfrm, $ntfy ) {
                
                    var file;
                    var file_arr = [];
                    
                    for( var i=0; i<files.length; i++) {
                    
							file = files[i];

							var _add;
							var _lst = ckbe.elements.uiFileUpload.defaults.allowed.split(",");

							for( var a=0; a<_lst.length; a++) {

								var _chk = _lst[a];
								
								console.log("");
								console.log(_chk);
								
								if(file.type.indexOf(_chk)!=-1 ) {

									_add = true;
									break;

								}

							}

							if (_add) {

								file_arr.push(file);

							} else {

								alert(ckbe.elements.uiFileUpload.defaults.format_warning);

							}

                    }
                    
                    if(file_arr.length > 0 ) {

							for (var a=0; a<file_arr.length; a++) {

								file = file_arr[a];

								ckbe.elements.uiFileUpload.sendFileToServer( ckbe.elements.uiFileUpload.defaults.dir, file, ckbe.elements.uiFileUpload.defaults.url, $drp, $filename, cnfrm, $ntfy);
								
							}
                        
                    }
					
                },
                               
                sendFileToServer: function( dir, file, url, $drp, $filename , cnfrm, $ntfy ) {
                    	
                        // Upload File to Server
                        if($drp.hasClass(ckbe.elements.uiFileUpload.defaults.warning_class)) {
							
                            	$drp.removeClass(ckbe.elements.uiFileUpload.defaults.warning_class);
							
						}
                        
                        $drp.children(".label").css("display","none");
                        
                        //SET LOADING IMAGE
                        $drp.css("background-image", "url(" + ckbe.elements.uiFileUpload.defaults.load_img + ")" );
                        $drp.css("background-size", "contain" );
                        $drp.css("background-repeat", "no-repeat" );
                        $drp.css("background-position", "center" );
                        
                        var fd = new FormData();
                        
                        fd.append("file_action", "upload");
                        fd.append("file_directory", dir);
                        fd.append("file", file);
                        fd.append("action", ckbe.elements.uiFileUpload.defaults.upload_action);
                        fd.append("submit", "ajax");
                        
                        var xhr = new XMLHttpRequest();
                        
                        var xhr_url = url + "?id=" + cnfrm;
						
                        xhr.open("post", xhr_url);
                        
                        var this_name;
                        var this_src;
                        var $btn;
					
                        xhr.onload = function() {
                            
                            if(!JSON.parse(xhr.responseText).error) {
								
									this_name = JSON.parse(xhr.responseText).file.name;
									this_src = JSON.parse(xhr.responseText).file.src;

									//Below is for mobile vs. desktop display.
									if($drp.css("display")=="none") {

											$btn = $(ckbe.elements.uiFileUpload.selectors.inpts).find( "#" + $drp.data("field") ).prev("button");
											$btn.css("background-color","#50b424").html("IMAGE UPLOADED");

									} else {

											$btn = $(ckbe.elements.uiFileUpload.selectors.inpts).find( "#" + $drp.data("field") ).prev("button");
											$btn.css("background-color","#50b424").html("IMAGE UPLOADED");


											if(file.type.indexOf("pdf") > 0 ) {

													$drp.css("background", "url(include/images/pdf_icon.png) no-repeat center" );
													$drp.css("background-size", "auto 128px" );

											} else {

													$drp.css("background", "url('" + this_src + this_name + "') no-repeat center" );
													$drp.css("background-size", "contain" );										

											}


									}

									$filename.val(this_name);
                                
                            } else {
                                
								//AJAX ERROR
								console.log(xhr.responseText);
								
                            }
                        };

                        xhr.send(fd);
                        
                        return this_name;
                        
                    

                },
                
                saveFilesToServer: function( url, cnfrm, $ntfy ) {
                    
						var save = true;

						var fle_nmes = {};

						$(ckbe.elements.uiFileUpload.selectors.drp).children(ckbe.elements.uiFileUpload.selectors.fle_nme).each( function (i) {

							var warning = ckbe.elements.uiFileUpload.defaults.warning_class;
							
							if(!$(this).val() && i <= 1) {

								save = false;
								$(this).parent().addClass(warning);    

							} else {

								if($(this).parent().hasClass(warning)) {

										$(this).parent().removeClass(warning);

								}

								fle_nmes[ $(this).parent().data("field") ] = $(this).val();

							}

						});

						if(!save) {
							
							alert(ckbe.elements.uiFileUpload.defaults.provide_warning);
							return;
							
						}

						var $json = JSON.stringify(fle_nmes);

						var fd = new FormData();

						fd.append("submit", "ajax");
						fd.append("action", ckbe.elements.uiFileUpload.defaults.save_action);
						fd.append("file_names", $json);

						var xhr = new XMLHttpRequest();

						var xhr_url = url + "?id=" + cnfrm;

						xhr.open("post", xhr_url);

						xhr.onload = function() {

							if(!JSON.parse(xhr.responseText).error) {
								
									window.location = url + "?id=" + cnfrm + "&done=true";
								
							}

							$ntfy.html(JSON.parse(xhr.responseText).Response);
							
						};

						xhr.send(fd);
					
                }
                
			},
		
			bsNavbar: {

					selectors: {

						mnu: ".navbar .navbar-nav li a",
						nav: ".navbar-collapse",
						tog: ".navbar-toggle",
						brnd: ".navbar-brand"

					},

					init: function() {

							var $window = $(window);

							/*----------- TOP MENU CLASS MANAGMENT -----------*/
							var mnu_slct = ckbe.elements.bsNavbar.selectors.mnu;
							var navbar = ckbe.elements.bsNavbar.selectors.nav;
							var toggle = ckbe.elements.bsNavbar.selectors.tog;
							var brnd = ckbe.elements.bsNavbar.selectors.brnd;

							if ($(mnu_slct).length) {

									$(mnu_slct).each( function(i) {

											$(this).on("click", function() {

													//Toggle menu classes
													$(this).parent().addClass("active");

													//Remove brand active
													var $brnd = $(brnd);
													$brnd.removeClass("active");

													//Set non-active menus            
													var $n_mnu_slct = $(mnu_slct).not(this);
													$n_mnu_slct.parent().removeClass("active");

													///////////////////////////////////////////
													//Deal with $navbar and scrollspy on click
													var $navbar = $(navbar);

													$navbar.removeClass("scrollspy");

													//Close navbar after link is clicked to preserve space
													if($navbar.hasClass("in")) {

															//Close the navbar after a link is click
															$(toggle).click();

													}

											});

									});

									$window.on("scroll", function() {

											var $brnd = $(brnd);

											//Remove the ::after arrow when scrolling away from logo
											if ($brnd.hasClass("active")) {

													$brnd.removeClass("active");

											}

											clearTimeout($.data(this, 'scrollTimer'));

											$.data(this, 'scrollTimer', setTimeout( function() {


													var $navbar = $(navbar);

													$navbar.addClass("scrollspy");

													$('[data-spy="scroll"]').each( function () {

														$(this).scrollspy('refresh');

													});

											}, 50));

									});

							}

					}

			}

		},

		motion: {
		
			parallax: {

					defaults: {
						
							dir: "vertical",
							bg_offset: "0"
						
					},
				
					selectors: {

							sel: '[data-type="background"]'

					},
				
					init: function() {
							
							var sel = ckbe.motion.parallax.selectors.sel;
							
							//Make sure the objent exists on the page
							if ($(sel).length) {

									$(sel).each( function(i, obj) {
																																	
											var $window = $(window);
											
											var dir = $(obj).data("direction") ? $(obj).data("direction") : ckbe.motion.parallax.defaults.dir;
											var bgOffset = $(obj).data("bg-offset") ? $(obj).data("bg-offset") : ckbe.motion.parallax.defaults.bg_offset;

											var $scroll = $(this);

											var $this = $(this);
										
											$window.on("scroll", function() {

													//Disable parallax if iPhone is being used. Parallax is buggy in iPhone
													if ( (navigator.platform.indexOf("iPhone") != -1) ||
															(navigator.platform.indexOf("iPod") != -1) ) {

															return;

													}
												
													var scrollTop = $window.scrollTop();
													var windowHeight = $window.height();
													var pageBottom = scrollTop + windowHeight;
													var offset = $this.offset().top;
													var height = $this.outerHeight();
													
													if( offset > (scrollTop + $(window).height()))
													{
														
															//console.log("Offset: " + offset + " :: scrollTop + windowHeight: " + pageBottom);
															return;
														
													}
													
													var speed = $scroll.data('speed')/10;

													var pos = -1 * ( pageBottom - offset + bgOffset) / speed; 

														//console.log("ScrollTop2 : " + $window.scrollTop())
													var coords;
												
													if(dir=="vertical"){
														
															coords = "50%" + pos + "px";
														
															//console.log("coords: " + coords + " == scrolltop: " + scrollTop);
														
													} else if (dir=="horizontal"){
														
															coords = pos + "px " + "50%";
																												
													}
												
													$scroll.css({ backgroundPosition: coords });

											});

									});

							}
						
					}

			},

			smoothScroll: {

					selectors: {

							mnu_lnks: ".navbar .navbar-nav li a[href^='#']",

					},

					init: function() {

							$(ckbe.motion.smoothScroll.selectors.mnu_lnks).on('click', function(e) {

									//Added to remove "skip" that happens when menu clicked
									//Todo: need to bring back hash functionality
									e.preventDefault();

									$('html, body').animate({ 

											scrollTop: $(this.hash).offset().top

									}, 500);

							});

					}

			},
	
			parallax2: {

					defaults: {
						
							dir: "vertical",
							delay: 0,
							reverse: false,
							hold: false,
							end: 0
							
					},
				
					timeouts: {

						scroll_timeout: ""

					},
				
					selectors: {

							sel: '[data-type="parallax2"]',
							bg: "parallax-bg",
							stage: ".parallax-stage"

					},
				
					init: function() {
							
							var sel = ckbe.motion.parallax2.selectors.sel;
							
							//Make sure the objent exists on the page
							if ($(sel).length) {

									$(sel).each( function(i, obj) {
												
											var $this = $(obj);
											
											var dir = $(obj).data("direction") ? $(obj).data("direction") : ckbe.motion.parallax2.defaults.dir;
											var reverse = $(obj).data("reverse") ? $(obj).data("reverse") : ckbe.motion.parallax2.defaults.reverse;
											var delay = $(obj).data("delay") ? $(obj).data("delay") : ckbe.motion.parallax2.defaults.delay;
											var end = $(obj).data("end") ? $(obj).data("end") : ckbe.motion.parallax2.defaults.end;
											var hold = $(obj).data("hold") ? $(obj).data("hold") : ckbe.motion.parallax2.defaults.hold;

											var p_offset = $this.offset().top;
																					
											$(window).on("scroll resize load", function(e) {
													
													var $window = $(this);
												
													//Disable parallax if iPhone is being used. Parallax is buggy in iPhone
													if ( (navigator.platform.indexOf("iPhone") != -1) ||
															(navigator.platform.indexOf("iPod") != -1) ) {

															return;

													}
												
													var scrollTop = $window.scrollTop();
													var windowHeight = $window.height();
													var windowWidth = $window.width();
												
													var pageBottom = scrollTop + windowHeight;
												
													var s_offset = $this.parent().offset().top;
													var p_left = $this.parent().offset().left;
													var p_width = $this.parent().outerWidth();
													var p_height = $this.parent().outerHeight();
													
													var offset = $this.offset().top;
													var left = $this.offset().left;
													var width = $this.find("img." + ckbe.motion.parallax2.selectors.bg).outerWidth();
																											
													var height = $this.outerHeight();
													
													var scrollDelay = delay;
													var pxDelay = 0;
												
													if( hold ){
														
															pxDelay = (windowHeight - p_height) / 2;
														
													}
												
													var parent_diff = pageBottom - p_offset;
												
													var diff, ratio, coords, pos;
												
													if( dir=="vertical" ){
														
															if(reverse){
																
																	//Ratio is our speed calculation. We can speed this up or slow it down, right now it is calculated
																	//based on Window Height but can be adjusted.
																	ratio = ((height + windowHeight ) / (p_height + windowHeight));
																
																	diff = parent_diff * ratio;	
																
																	pos = diff - height;
																
															} else {
																 
																	//Ratio is our speed calculation. We can speed this up or slow it down, right now it is calculated
																	//based on Window Height but can be adjusted.
																	ratio = (height - p_height)/(p_height + windowHeight);
																
																	diff = ratio * (parent_diff);
																
																	pos = -1 * diff;
																
															}
														
																
															coords = {'top': pos};
														
															if( $this.hasClass("layer7" )){

																	console.log($this.attr("class") + " = " + " pos: " + pos + " || parent_diff: " + parent_diff + " || wH: " + windowHeight);
																	console.log($this.attr("class") + " = " + " ratio: " + ratio + " || h+wH: " + (height + windowHeight) + " || p_height: " + p_height);
																	console.log($this.attr("class") + " = " + " pageBottom: " + pageBottom);

															}
															
													} else if( dir=="horizontal" ){
															
															//Ratio is our speed calculation. We can speed this up or slow it down, right now it is calculated
															//based on Window Height but can be adjusted.
															ratio =  parent_diff/(p_height + windowHeight);
															
															if(reverse){
																

																	diff = (width - p_width) * ratio;

																	pos =-1 * (pos + diff);
																
																
															} else {
																
																	if(hold) {
																		
																			ratio = (s_offset - p_offset)/(width - p_height);
																		
																	}																		

																	diff = (width - p_width) * ratio;
																	
																	pos = diff > 0 ? diff : 0;
																	
																	if(hold){

																			ckbe.motion.parallax2.hold($this, pxDelay, p_height, p_offset, width, pos);

																	}
																
															}
															
														if(hold && 1!=1) {
															console.log($this.attr("class") + " = " + " Height: " + p_height + " || Width: " + width + " || PXDELAY: " + pxDelay);
															console.log("p_width: " + p_width + " || ratio: " + ratio + " || pageBottom: " + pageBottom + " || p_offset: " + p_offset);
															console.log("p_height: " + p_height + " || windowHeight: " + windowHeight + " || parent_diff: " + parent_diff);
															console.log("ScrollTop: " + scrollTop + " || pos: " + pos);
															
														}
														
															coords = {"left": pos};
																									
													}
														
													$this.animate(coords, 0);

											});
											

									});

							}
						
					},
				
					hold: function( $obj, pxDelay, pHeight, p_offset, width, pos ) {
						
						var $window = $(window);
						
						var windowHeight = $window.height();
						var windowWidth = $window.width();
						var $this = $obj;
						
						if( !$(".anim-wrapper").length ) {

								$this.parent()
									.wrap("<div class='parallax-stage'></div>")
									.parent(ckbe.motion.parallax2.selectors.stage)
									.wrap("<div class='anim-wrapper'></div>");

						}
						
						$this.parent().parent(ckbe.motion.parallax2.selectors.stage).css({"height": windowHeight + "px"});//, "top":0});

						$(".anim-wrapper").css("height",width + "px");
						
						if( ( $window.scrollTop() + pxDelay ) >= ( p_offset - 1 ) ) {
															
								$this.parent()
									.parent(ckbe.motion.parallax2.selectors.stage)
									.css({
										"position":"fixed", 
										"top": (windowHeight - pHeight)/2 + "px"
									});
							
						}
						
						if($this.hasClass("layer7")) {

						console.log($this.attr("class") + " = " + " scrollTop: " + $window.scrollTop() + " || pxDelay: " + pxDelay);
						console.log("------------------ p_offset: " + p_offset + " || wH: " + windowHeight);

						}
						
						if( ( $window.scrollTop() + pxDelay ) <= ( p_offset ) ) {
							
								$this.parent()
									.parent(ckbe.motion.parallax2.selectors.stage)
									.css({
										"position":"absolute", 
										"top":0
									});
							
						}
												
						//Deal with the fixed object hitting the lower bound of the wrapper window
						if( ( $window.scrollTop() ) >= ( (p_offset + width) - windowHeight -  pxDelay) ) { 
							
								$this.parent()
									.parent(ckbe.motion.parallax2.selectors.stage)
									.css({
										"position":"absolute", 
										"top": (width - pHeight) + "px"
									});
							
						}
						
					}

			},
	
		},
	
		init: function() {
			
            ckbe.elements.uiTooltip.init();
            ckbe.elements.uiMenu.init();
            ckbe.elements.uiBillboard();
            ckbe.elements.uiFileUpload.init();
			ckbe.elements.bsNavbar.init();
			
			ckbe.motion.parallax.init();
			ckbe.motion.parallax2.init();
			ckbe.motion.smoothScroll.init();
			
		}
	
};

$(document).ready(function($) {

	ckbe.init();
	
});



	