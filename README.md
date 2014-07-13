#One Page Scroll Extended
This is an extended version of the [One Page Scroll](https://github.com/peachananr/onepage-scroll) plugin by Pete R.
It allows you to create a dynamic, presentation-like page.

License: [Attribution-ShareAlike 4.0 International](http://creativecommons.org/licenses/by-sa/4.0/deed.en_US)

## Description
The One Page Scroll plugin is already great for one page presentations. The only thing missing was the ability, to trigger animations while on a page. This extended version adds this functionality.
You are now able to add animations to your elements, that will trigger on scroll.

Check out [the demo](http://divine-coding.com/examples/jquery.onepage.scroll.extended/) to see the new features in action.

## Requirement

jQuery (1.9.0 or later)

note: jQuery 1.9.0 or later is strongly recommended although I changed the original script to prevent XSS attacks ( Not fully tested! ). Still, better safe than sorry. You shouldn't use older jQuery versions anyway...

## Compatibility
Modern browsers such as Chrome, Firefox, and Safari on both desktop and smartphones have been tested. Also tested on IE 9 and above. The "updateURL" option does not work on IE 9!

## Basic Usage

The basic functionality of the original script remained, so all you have to do is include the latest jQuery library together with jquery.onepage-scroll.extended.js and onepage-scroll.css and make a
html markup simmilar to this: 

````html
<body>
  ...
  <div class="main">
    <section id="first">...</section>
    <section id="second">...</section>
    ...
  </div>
  ...
</body>
````
Container "Main" must be one level below the `body` tag in order to make it work full page. Below you can find all of the options you can set, when you initialize the script
(the added options to the extended version are labeled as such):
 
````javascript
$(".main").onepage_scroll_extended({
        sectionContainer: "section",     // sectionContainer accepts any kind of selector in case you don't want to use section
        easing: "ease",                  // Easing options accepts the CSS3 easing animation such "ease", "linear", "ease-in",
        // "ease-out", "ease-in-out", or even cubic bezier value such as "cubic-bezier(0.175, 0.885, 0.420, 1.310)"
        animationTime: 1000,             // AnimationTime let you define how long each section takes to animate
        pagination: true,                // You can either show or hide the pagination. Toggle true for show, false for hide.
        paginationContainer:"body", // Added feature in the extended version: This is the container the pagination will be appended to. The default is "body"
        updateURL: true,                // Toggle this true if you want the URL to be updated automatically when the user scroll to each page.
        beforeMove: function(index) {},  // This option accepts a callback function. The function will be called before the page moves.
        afterMove: function(index) {},   // This option accepts a callback function. The function will be called after the page moves.
        loop: true,                     // You can have the page loop back to the top/bottom when the user navigates at up/down on the first/last page.
        keyboard: true,                  // You can activate the keyboard controls
        responsiveFallback: 600,        // You can fallback to normal page scroll by defining the width of the browser in which
        // you want the responsive fallback to be triggered. For example, set this to 600 and whenever
        // the browser's width is less than 600, the fallback will kick in.
        direction: "vertical",            // You can now define the direction of the One Page Scroll animation. Options available are "vertical" and "horizontal". The default value is "vertical".
        useCssTransitions:true,		// Added feature in the extended version: The script will automatically use css transitions if available. But in some cases, this is not prefereable (if, for example,
		//you would like to add a fixed element to any page, the element would not be always on the screen because of css transitions). If you set this option to false, the transition
		//between pages will be made using pure javascript
        pagesEvents:{             // Added feature in the extended version: this is the main change in the extended script. Here is where you define all the animations and functions you want to add to your page.
								  // You'll find the detailed explanation below.
            "section#first":{
                selector:"#element-selector",
                scrollDown:"fadeIn",
                scrollUp:{
					action:"animate",
					args:[500,{opacity:0}]
				},
				onlyOnScroll:false,
				isGlobal:false
            },
            "section#second":[{
                selector:"#different-element-selector",
                scrollDown:function(){
				//do stuff
				},
                scrollUp:function(){
				//do more stuff
				},
				onlyOnScroll:false,
				isGlobal:false
            },
                {
                    selector:"#another-element-selector",
                    scrollDown:"slideDown",
                    scrollUp:"slideUp"
                }
            ]
        }
});
````

## Pages Events
the "pagesEvents" option allows you to add animations to elements included in your sections. The animations will trigger sequentially instead of a page scroll. For example, if you added 3 page event objects to one of your section, you can scroll to that section,
next time you scroll the first animation triggers, then the second one, then the third one and finally the scroll to the next section.
The keys in the page events object are the selectors for your sections. The value can be either an object or an array of objects:

````javascript
{
	selector:"#element-selector", //this is the element selector on which the animation will occur. The default is 'undefined'
	scrollDown:"fadeIn", //this function occurs when scrolling down. It can be one of three types of values:
	
	// a string: This is a shorthand. In this case a jQuery function will trigger. If no such function exists, it won't trigger. For example, "fadeIn" will trigger $("#element-selector").fadeIn(). If this option is used, the selector is required!
	//an object: if a jQuery function requires arguments, you can use an object to describe it. If this option is used, the selector is required! The object must look like this:
	// {
	//		action: 'fadeIn', //the function you want to trigger
	//		args: [arg1,arg2] // an array containing the function arguments	
	//	}
	// a callback: the most flexible option is to add a callback function. The this keyword will refer to a jQuery object, defined by the above selector.
	
	//the scrollUp option is the same as scrollDown except it is used when the user scrolls up.
	scrollUp:{
		action:"animate",
		args:[500,{opacity:0}]
	},
	onlyOnScroll:false, //normally, if the user uses a link to get to a specific section, or he uses the pagination, all animations will be triggered to make it look like the user actually scrolled 
	//down to that page. In some cases, like a played sound, or an ajax request, this behaviour is not desirable. If this option is set to true, the animations will trigger only if the user actually scrolls to that section.
	isGlobal:false // normally the plugin searches for the element inside the section defined by the key. If this flag is set to true, it will search for the element inside the main container instead.
	//this is a minor addition that can give you a huge flexibility. This way you can trigger animations on any element on any section and even manipulate the sections themselves.
}
````

## Pagination Text
This extended version provides an option to insert text into the pagination links if you want. Just add a 'data-pagination-text' attribute to your section and the value of this attribute will appear in the pagination link.

## Keyboard Shortcuts
You can trigger page move with hotkeys as well:

### Up arrow / Page Up
Pressing the up arrow or the page up key allows you to move the page up by one.


### Down arrow / Page Donw
Pressing the down arrow or the page down key allows you to move the page down by one.


### Home
Pressing the home key brings you back to the first page.


### End
Pressing the end key brings you to the last page.

## Public Methods
You can also trigger page move programmatically as well:

### $.fn.moveUp()
This method allows you to move the page up by one. This action is equivalent to scrolling up/swiping down.

````javascript
  $(".main").moveUp();
````

### $.fn.moveDown()
This method allows you to move the page down by one. This action is equivalent to scrolling down/swiping up.

````javascript
  $(".main").moveDown();
````

### $.fn.moveTo(page_index)
This method allows you to move to the specified page index programatically.

````javascript
  $(".main").moveTo(3);
````

## Callbacks
You can use callbacks to perform actions before or after the page move.

### beforeMove(current_page_index)
This callback gets called before the plugin performs its move.

````javascript
  $(".main").onepage_scroll({
    beforeMove: function(index) {
      ...
    }
  });
````

### afterMove(next_page_index)
This callback gets called after the move animation was performed.

````javascript
  $(".main").onepage_scroll({
    afterMove: function(index) {
      ...
    }
  });
````

## Other Resources
- [The3 original Onepage-scroll jQuery plugin](https://github.com/peachananr/onepage-scroll)
