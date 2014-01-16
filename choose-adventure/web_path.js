// WebPath script by Dave Doyle (http://www.davedoyle.com)
// You may use this script free of charge, but please leave these lines
// to give me credit.
// More scripts available at Dave's Script archive http://www.davedoyle.com/scripts/

// This script can be used to create 'solveable' problems for the web.  
// Create a SinglePath to do basic solutions path where a solution is 
// uncovered step by step (such as math equations or logic problems
// Create a MultiPath to do more complex solutions which involve the
// user being able to make a choice at each step.  This type is much more
// complex to set up but is is good for more complex equations or 
// logic problems, as well as for games - such as the 
// 'choose-you-own-adventure' type of game

/*
 Issues to solve
 1) When path loops to earlier step, steps are re-ordered if hidelaststep is off, but that means
     original step moves to new location (would have to do this as text, not divs)
*/

/*
	This file contains 2 types of step-through examples.  The first allows only a single-path
	step-by-step example.  This is found immediately following the comment.  The second is
	a more complex type of step through that allows the user to make choices at each step.  
	This is found in the second half of the file
*/

function BrowserCheck() {
	var b = navigator.appName;
	if (b.indexOf('Netscape')!=-1) this.b="ns";
	else if (b=="Microsoft Internet Explorer") this.b = "ie";
	if (!b) alert("Unidentified browser.\nThis browser is not supported,");

	this.version = navigator.appVersion;
	this.v = parseInt(this.version);
	this.ns = (this.b=="ns" && this.v>=4);
	this.ns4 = (this.b=="ns" && this.v==4);
	this.ns6=(this.b=="ns" && this.v==5);
	this.ns7 = (this.b=="ns" && this.v==7);
	this.ie = (this.b=="ie" && this.v>=4);
	this.ie4 = (this.version.indexOf('MSIE 4')>0);
	this.ie5 = (this.version.indexOf('MSIE 5')>0);
	this.ie55=(this.version.indexOf('MSIE 5.5')>0);
	this.ie6=(this.version.indexOf('MSIE 6.0')>0);
	this.min = (this.ns||this.ie);
	this.mac = (this.version.indexOf("Mac") != -1);
}
is = new BrowserCheck()



/*
   Creates a simple step-by-step example for the user.  
   The initial step is shown to the user, as is a button that they can press in order
   to uncover each subsequent step.  As each step is shown, text is also shown
   outlining what just happened.  There are a few options for this path that are explained
   below, which outline how the steps are presented.
*/


/*
   The single step-by-step examples consist of a number of individual steps.  Each step contains a
   few things.  The 'content', or what is shown when the step is uncovered.  And an 'explanation', 
   which is helpful text which outlines what has changed during this step. 
*/

function SinglePathStep() {
   this.content;           // what is shown for this step
   this.explainText;    // helpful text outlining what has changed during the previous step and this step
   this.id;                // unique identifier for this step.
}

SinglePathStep.prototype.setContent = function(content) { 
	if (typeof content == "object" && content.toString) { // handle case where they passed an equation
		this.content = content.toString();
	} else {
		this.content = content; 
	}
}

SinglePathStep.prototype.getContent = function() { return this.content; }

SinglePathStep.prototype.setExplanation = function(text) { this.explainText = text; }
SinglePathStep.prototype.getExplanation = function() { return this.explainText; }

// private methods allowing users to get/set the ID of the step
SinglePathStep.prototype.setID = function(id) { this.id = id; }
SinglePathStep.prototype.getID = function() { return this.content; }


/*
   A SinglePath() is a simple step-by-step solution.  Each step is uncovered in turn.
*/
function SinglePath() {
   this.curStep = 0;					// the step to show
   this.steps;								// list of steps
   // NOTE: this next parameter exists to fixe a refresh bug of having MP equations in a table
   this.style = "v";						// style of steps: 'vertical' or 'horizontal'
   this.addEquals=true;			// will add an equals sign between the steps.  i.e. step1 = step2 = step3...
   this.helpLoc = "i"					// help location is 'internal' or 'external'
   this.valid = false;					// if Toggle object is valid
}

// The style sets a number of different attributes that control how the steps are going to look.  And these parameters
// affect each other.  First is whether or not the overall apperance of the steps is vertical or horizontal.
// that is:  step 1 = step 2 = ... 
// vs.
// step 1 = step2
//             = step3
//             ...

// Next is whether or not we should automatically insert equals signs.  The big effect here is in vertical layouts.  If 
// equals signs are added, then we get the above layout, if not, we get
// step 1
// step 2
// step 3

// Last is how help text is presented.  This only effects vertical layout.  If help is internal, then help text
// is printed on the same line as the step.  If not, it is assumed that the help will be shown another way that
// is up to the page creator.
// NOTE: default is vertical, add equals sign, internal help
SinglePath.prototype.setStyle = function(direction, addEquals, helpLocation) {
	// first, trap for illegal conditions
	if (direction == "horizontal" && helpLocation == "internal") {
		showError(this, "horizontal layout cannot have an internal help representation");
		return;
	}

	// set style (default to 'vertical')
   if (direction == "horizontal") {
      this.style = "h";
   } else {
      this.style = "v";
   }

   if (addEquals || addEquals == "true") {
		this.addEquals = true;
   }

	// set help location (default to internal)
   if (helpLocation == "external") {
	   this.helpLoc = "e";
   } else {
	   this.helpLoc = "i";
   }
}

// getter methods to get the data set in the style parameter
SinglePath.prototype.getStepDirection = function() { return (this.style=="v" ? "vertical" : "horizontal");  }
SinglePath.prototype.getAddsEqualsSign = function() { return this.addEquals; }
SinglePath.prototype.getHelpLocation = function() { return (this.helpLoc=="i" ? "internal" : "external");  }


// private method which states what step we are currently on.
SinglePath.prototype.setCurrentStep = function(num) { this.curStep = num; }


// passes in the set of steps (SimplePathSteps) in our example
SinglePath.prototype.setSteps = function(steps) {
   // an array of ToggleSteps should be passed in
   this.steps = new Array();
   for (var i=0; i<steps.length; i++) {
      if (typeof steps[i] == "string") {
         // get the actual object
         this.steps[i] = document.getElementById(steps[i]);
      } else if (typeof steps[i] == "object") {
         this.steps[i] = steps[i];
      }
   }
   this.valid=true;
}


// reset the path back to the first setp
SinglePath.prototype.reset = function() { this.curStep = 0; }


// Uncovers the next step in the example
SinglePath.prototype.showNextStep = function() {
   if (!this.valid) { showError(this, "must call setSteps before you can show a step"); }

   // if all steps are shown, don't do anything
   if (this.curStep >= this.steps.length-1) return;

   if (this.style=="h") {
      document.getElementById(this.steps[this.curStep].id).style.display = 'none';
   }
   document.getElementById(this.steps[++this.curStep].id).style.display = 'block';
}


// writes out all of the steps into the webpage.  This should be called *somewhere*
// in the body of the document in order for the step-by-step example to work.  How
// these steps appear in the page is based upon the 3 style attributes (set in setStyle)
SinglePath.prototype.write = function() {
   if (this.style=="v") {
	   if (this.addEquals) {
	      document.write(this.writeMultiColumn());
	   } else {
	      document.write(this.writeColumn());
	   }
   } else {
      document.write(this.writeRow());
   }
}


// private method, called by write().  Writes out each step (after the initial step) below the previous ones.
// In format:
// step 1
// step 2
//  ...
SinglePath.prototype.writeColumn = function() {
   for (var i=0; i<this.steps.length; i++) {
      this.steps[i].id = "webpath_step"+i;
      text += "<div id=\""+this.steps[i].id+"\"style=\" display:none\">\n"; 
      text += "<table cellpadding=\"0\" cellspacing=\"0\"><tr><td>\n"

	  text += this.steps[i].content+"\n";
      text += "</td><td width=\"20px\"></td><td>\n";
	  if (this.helpLoc == "i") {
	      text += this.steps[i].explainText+"\n";
	  }
      text += "</td></tr></table>\n";
      text += "</div>\n";
   }
   return text;
}

// private method, called by write().  Writes out each step as such
// step 1 = step 2
//             = step 3
//             ...
// (useful if you're showing how to solve a math/science question
SinglePath.prototype.writeMultiColumn = function() {
	// print out step 1 (located differently than other steps)
   this.steps[0].id = "webpath_step0";
   var text = "<table><tr><td valign=\"top\">";
   text += "<div id=\""+this.steps[0].id+"\">\n"; 
   text += this.steps[0].content+"\n";
   text += "</div>\n";
   text += "</td><td>\n";

   for (var i=1; i<this.steps.length; i++) {
      this.steps[i].id = "webpath_step"+i;
      text += "<div id=\""+this.steps[i].id+"\"style=\" display:none\">\n"; 
      text += "<table cellpadding=\"0\" cellspacing=\"0\"><tr><td>\n"
      if (i>0) {
         text += "= ";
      }
      text += this.steps[i].content+"\n";
      text += "</td><td width=\"20px\"></td><td>\n";
	  if (this.helpLoc == "i") {
	      text += this.steps[i].explainText+"\n";
	  }
      text += "</td></tr></table>\n";
      text += "</div>\n";
   }
   text += "</td></tr></table>\n";
   return text;
}


// private method, called by write().  Writes out each step horizontally after the previous ones.
// step 1 . step 2 = step 3...
// (again useful for math/science questions)
// NOTE: the help location cannot be internal for this
SinglePath.prototype.writeRow = function() {
	var text="";
	// print all step groups (step 1, step 1 = step 2 ...) invisibly
	for (var i=0; i<this.steps.length; i++) {
		this.steps[i].id = "webpath_step"+i
		text += "<div id=\""+this.steps[i].id+"\""; 
		if (i>0) {
			text += "style=\"display:none\">\n";
		} else {
			text += ">\n";
		}
		for (var j=0; j<=i; j++) {
			text += this.steps[j].content+"\n";
			if (j<i && this.addEquals) {
				text += " = ";
			}
		}
		text += "</div>\n";
	}

   return text;
}


// writes out the introductory explanation into the webpage
SinglePath.prototype.writeInitialHelp = function() { document.write(this.getHelpText()); }


// updates the help text to show the text for the current step.
SinglePath.prototype.updateHelp = function() { 
   var helpdiv = document.getElementById("webpath_help");
   if (helpdiv) {
      helpdiv.innerHTML = this.steps[this.curStep].getExplanation(); 
   }
}


// private method.  Returns a location for the explanation of each step, and puts the explanation into it.
SinglePath.prototype.getHelpText = function(border) {
   var text = "";
   if ( this.steps[this.curStep]) {
	   if (border == true || border == "true") {
		   text += "<table border=\"1\"><tr><td>\n";
	   } else {
		   text += "<table><tr><td>\n";
	   }
	   text += "<div id=\"webpath_help\">\n";
	   text += this.steps[this.curStep].getExplanation();
	   text += "</div>";
	   text += "</td></tr></table>\n";
   }
   return text;   
}


// users may choose to show help via a button call, rather than printing the help message directly on the page
SinglePath.prototype.showPopupHelp = function() {
   var bgColor="white", textColor="black", titleColor="#0099ff";
   var title="Hint";

   msg=window.open("","TestResults","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=no,width=400,height=400");
   msg.document.clear();
   msg.document.writeln("<html>");
   msg.document.writeln("<head><title>"+title+"</title></head>");
   msg.document.writeln("<body onBlur=\"self.setTimeout('window.close()','4500')\" bgcolor='"+bgColor+"' text='"+textColor+"'>");
   msg.document.writeln("<br/>");
   msg.document.writeln("<center><h3><font color='"+titleColor+"'>"+title+"</font></h3></center>");
   msg.document.writeln("<center><hr width='75%'/></center>");
   msg.document.writeln("<blockquote>");
   msg.document.writeln(this.steps[this.curStep].getExplanation());
   msg.document.writeln("</blockquote>");
   msg.document.writeln("<center><hr width='75%'/></center>");
   msg.document.writeln("<p><form>");
   msg.document.writeln("<center><input type='submit' value='Done' onclick='window.close();'/></center>");
   msg.document.writeln("</form></p>");
   msg.document.writeln("</body>");
   msg.document.writeln("</html>");
   msg.document.close()
}




/*
   A multi-path step-by-step example is a more complex way to show people step-by-step solutions to 
   problems.  Every step in the process could lead to a number of different steps, depending on what 
   choice the user makes.  This entire process forms a tree, where step one can 'branch' into a number
   of steps, each of which can branch again into further steps.  Steps can also return to previous steps

   A multi-path step tree starts by showing a single step, and a number of options that the user could choose.  
   Depending on which choice the user makes, another step is uncovered.  Eventually, either the problem
   is solved, or becomes unsolveable.  If the user reaches a dead end, they can back up to previous
   steps and try a different choice.

   A MultiPath consists of a number of MultiPathSteps that are connected together.  Each MultiPathStep 
   can lead to several other MultiPathSteps depending on what choice the user makes.
*/


// A single 'step' in the multi-path tree.  This is essentially what the user 'encounters' at each step
function MultiPathStep() {
   this.id = null;								// unique id of the step for the dom (gotten when attached to tree)
   this.content;									// content of step, may include multiple equations
   this.helpText;									// help text message
   this.nextSteps = new Array();				// pointers to the next steps user could go to
   this.choices = new Array();				// list of choices that could be done
	this.tree = null;								// a pointer to the tree that it is attached to
}

 // set the content of the step
 MultiPathStep.prototype.setContent = function(content) { 
	// handle case where they passed an object containing the content
	if (typeof content == object) {
		if (content.toString) {
			this.content = content.toString();
		} else {
			alert("Can't set step content from object without toString method");
		}
	} else {
		this.content = content; 
	}
}
MultiPathStep.prototype.getContent = function() { return this.content; } // return the content of the step

// private methods allowing user to get the id of the step
MultiPathStep.prototype.getID = function() { return this.id; } // get unique identifier

// attach one of the next steps to this one
MultiPathStep.prototype.setNextStep = function(nextstep, choice) { 
   this.nextSteps.push(nextstep);  // the next step object they would go to if the specific choice chosen
   this.choices.push(choice);
}

// get a specific next step
MultiPathStep.prototype.getNextStep = function(num) { 
   if (num < this.nextSteps.length) return nextSteps[num]; 
   else return null;
}


// set the help associated with the step
MultiPathStep.prototype.setHelp = function(helpstr) { this.helpText = helpstr; }


// show the help associated with the step
MultiPathStep.prototype.showHelp = function() { return this.helpText; }


// quick method to both set the content of the step and set the help for the step
MultiPathStep.prototype.setData = function(content, help) { 
   this.content=content; 
   this.helpText = help;
}


// show a specific choice associated with this step
MultiPathStep.prototype.showChoice = function(i) {
   if (num < this.choices.length) return choices[num]; 
   else return null;
}


// private method used to create the choices form for the MultiPath's GetChoicesText() method
MultiPathStep.prototype.showChoices = function() {
   var text =""
   for (var i=0; i<this.nextSteps.length; i++) {
      text += "<input type=\"radio\" name=\"next\" value=\""+this.nextSteps[i].id+"\"/>"+this.choices[i]+"<br/>\n";
   }

   var spaces = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
   text += "<br />" + spaces;
   if (this.nextSteps.length > 0) {
      text += "<input type=\"button\" value=\"next step\" onclick=\""+this.tree.name+".showNextStep();\"/>\n";
   } else {
      text += "<b>You've reached an endpoint</b><br /><br/>\n";
   }

   text += spaces;
   //KRM - no backing up.
//   text += "<input type=\"button\" value=\" back up \" onclick=\""+this.tree.name+".backUpStep();\"/><br/>";
//   text += spaces;
   if (this.tree.showHint && this.tree.showHintAsPopup) {
	   text += "<input type=\"button\" value=\"show hint\" onclick=\""+this.tree.name+".showPopupHelp();\"/>";
	   text += spaces;
   } else {
	   text += spaces+spaces;
   }
   text += "<input type=\"button\" value=\"start over\" onclick=\""+this.tree.name+".restart();\"/>";
   text += spaces + "<br />&nbsp;";
	//alert(text);
   return text;
}


///////////////////////////////////////////////////////////////////////////////

// the structure that collects the steps together forming the step-by-step tree heirarchy
function MultiPath(nameStr) {
   this.startStep;							// starting step
   this.allSteps = new Array();			// an array containing all the steps in this structure (for creating)
   this.prevSteps = new Array();			// the list of previous steps the user went through (to allow backup);
   this.curStep = 0;							// the step to show
   this.hideLast = false;					// whether or not the last step stays visible when this one is shown
   this.showHint = true;					// user is given the ability to see hints
	this.showHintAsPopup = true;			// if hint is shown, does it come up in separate window?
   this.valid = false;						// states whether tree is valid
	this.name = nameStr;						// the name has to be overtly passed in for steps to access
	this.numForNextStep = 1;				// a counter so that each step has a unique ID
}

// shows/hides button that allows user to get a hint/help
MultiPath.prototype.showHintBtn = function(showIt) { this.showHint = showIt; } 
// set the first step in the tree
MultiPath.prototype.setStartStep = function(step) { this.startStep = this.curStep = step; } 
// hide previous steps?
MultiPath.prototype.hideLastStep = function(shouldHideLast) { this.hideLast = shouldHideLast; } 
// private method which sets the step that is shown to the user
MultiPath.prototype.setCurrentStep = function(num) { this.curStep = num; } // sets the current step


// this write function writes out everything into a standard format.
// to have more flexibility in how things are written out, a person could
// use the 'writeSteps' and 'writeInitialChoices' methods wherever they wanted
// them.
MultiPath.prototype.write = function() {
	if (!this.valid) {
		this.validate();
	}
	if (this.valid) {
		document.write("<table width=\"100%\"><tr valign=\"top\"><td width=\"50%\">");
		//alert(this.getContentText());
		this.writeSteps();
		document.write("</td><td>");
	   this.writeInitialChoices();
		document.write("</td></tr></table>");
	}
}

// write out the entire tree into the document.  All steps are written out, however, most of 
// them are set to be invisible to the user, and only get uncovered at the appropriate time.  
// This method needs to be called somewhere within the body of the document for it to work.
MultiPath.prototype.writeSteps = function() {
	if (!this.valid) {
		this.validate();
	}
	if (this.valid) {
	   document.write(this.getContentText());
	}
}


// Private method: create the divs for the actual content
MultiPath.prototype.getContentText = function() {
	var text="";
	for (var i=0; i<this.allSteps.length; i++) {
		var curStep = this.allSteps[i];
		text += "<div id=\"webpath_step_"+this.name+curStep.id+"\""; 
		if (curStep != this.startStep) {
			text += " style=\"display:none\">\n";
		} else {
			text += ">\n";
		}
		text +=curStep.content+"\n";
		text += "</div>\n";
	}

   return text;
}


// Private method - produce the choices in a div, so that the text can be replaced with new choices
MultiPath.prototype.getChoicesText = function() {
   var text = "<form id=\"webpath_choiceform_"+this.name+"\">\n";
   text += "<table border=\"1\" cellpadding=\"3\"><tr><td>\n";
   text += "<div id=\"webpath_choices_"+this.name+"\">";
   text += this.curStep.showChoices();
   text += "</div>";

   text += "</td></tr></table>\n";
   text += "</form>";
   return text;
}
MultiPath.prototype.writeInitialChoices = function() { document.write(this.getChoicesText()); }


// Private method - produce the choices in a div, so that the text can be replaced with new choices
// NOTE: help may not be shown on the page at all, in which case, this <div> won't exist
MultiPath.prototype.getHelpText = function() {
   var text = "";
   text += "<table border=\"1\"><tr><td>\n";
   text += "<div id=\"webpath_help_"+this.name+"\">\n";
   text += this.curStep.showHelp();
   text += "</div>";
   text += "</td></tr></table>\n";
   return text;   
}

// writes the initial statement for the user of the page.  
MultiPath.prototype.writeInitialHelp = function() { document.write(this.getHelpText()); }

// validate the tree in order to ensure that it is in the proper order.
MultiPath.prototype.validate = function() {
	this.valid = true;

   if (this.curStep == 0) {
      this.valid = false;
		alert("No starting step specified.  Please call setStartStep(<step>)");
		return;
	}

	// traverse the tree and add all steps to the list of all steps
	// NOTE: if you have a LOT of steps, this could slow up the startup time.  
	//       To speed it up, comment this next line out and add a step to your HTML page 
	//         <treename>.allSteps(new Array(<list of all steps>));
	//       For example:
	//           mpath.allSteps(new Array(step1, step2, step3, step4...));
	this.addChildStep(this.curStep);
//	this.printout();
}

// private function just used to verify the structure of the tree is the way it is expected
MultiPath.prototype.printout = function() {
	for (var i=0; i<this.allSteps.length; i++) {
		alert(this.allSteps[i].id + " has "+this.allSteps[i].nextSteps.length + " children");
	}
}


// private function used to build a set of all steps in order to print them out.  
// Each step is stored in a linear array of allSteps.   By storing them here each 
// only once, recursive steps can be built into the multipath structure (a step can 
// lead you back to a previous step).  This is a depth first search.
// NOTE: that each step in the tree will still point to other steps
MultiPath.prototype.addChildStep = function(curStep) {
	var exists=false;
	for (var i=0; i<this.allSteps.length; i++) {
		if (this.allSteps[i] == curStep) {
			exists = true;
			break;
		}
	}
	if (!exists) {
		// if it hasn't been added already, add it and check it's children
		curStep.id = this.numForNextStep++; 
		curStep.tree = this; // ensure each step can access tree vars
		this.allSteps.push(curStep);   // give each step a unique identifier for the tree
//		alert("adding "+curStep.helpText + " with "+curStep.nextSteps.length+" children");
//		var sum="";
//		for (var i=0; i<curStep.nextSteps.length; i++) {
//			sum+=curStep.nextSteps[i].helpText+" - ";
//		}
//		alert(sum);

		for (var i=0; i<curStep.nextSteps.length; i++) {
			this.addChildStep(curStep.nextSteps[i]);
		}
	}
}


// show the next step based upon the choice the user made
MultiPath.prototype.showNextStep = function() {
   if (!this.valid) { showError(this, "must validate tree before you can use this"); }

   // if all steps are shown, don't do anything
   if (this.curStep.nextSteps.length == 0)
      return;

   var nextchoice = document.getElementById("webpath_choiceform_"+this.name).next; // get the user input & show this
   for (i =0; i<nextchoice.length; i++) {
      if (nextchoice[i].checked) {
         if (this.hideLast) { // if only 1 step is shown at a time, hide the previous step
            document.getElementById("webpath_step_"+this.name + this.curStep.id).style.display = 'none';
            document.getElementById("webpath_step_"+this.name + nextchoice[i].value).style.display = 'block';
         } else {
            // need to make sure things are in the right order, pull out the new div and insert it after the current step
            var oldstep = document.getElementById("webpath_step_"+this.name + this.curStep.id);
            var newstep = document.getElementById("webpath_step_"+this.name + nextchoice[i].value);
            oldstep.parentNode.insertBefore(newstep, oldstep.nextSibling);

            newstep.style.display = 'block';

         }
         this.prevSteps.push(this.curStep); // store the choice for undoing later
			this.curStep = this.curStep.nextSteps[i];

         // show the new set of choices (& optionally, show the new help)
         var ch = document.getElementById("webpath_choices_"+this.name);
         ch.innerHTML = this.curStep.showChoices();
			var he = document.getElementById("webpath_help_"+this.name);
         if (he) { // help may not always be on the page
            he.innerHTML = this.curStep.showHelp();
         }
      }
   }
}


// restart the tree from step 1
MultiPath.prototype.restart = function() {
   if (!this.hideLast) {
      for (var i=0; i<this.prevSteps.length; i++) {
         document.getElementById("webpath_step_"+this.name+this.prevSteps[i].id).style.display = 'none';
      }
   }
   document.getElementById("webpath_step_"+this.name+this.curStep.id).style.display = 'none';
   this.curStep = this.startStep;
   document.getElementById("webpath_step_"+this.name+this.curStep.id).style.display = 'block';

   // show the new set of choices (& optionally, show the new help)
   var ch = document.getElementById("webpath_choices_"+this.name);
   ch.innerHTML = this.curStep.showChoices();
	var he = document.getElementById("webpath_help_"+this.name);
	if (he) { // help may not always be on the page
      he.innerHTML = this.curStep.showHelp();
   }
   this.prevSteps = new Array();
}


// return the state of the tree to what it was previously
MultiPath.prototype.backUpStep = function() {
   if (!this.valid) { showError(this, "must validate tree before you can use this"); }

   // if first step is shown, don't do anything
   if (this.prevSteps.length==0)  { return; }

   var prevStep = this.prevSteps.pop();

   document.getElementById("webpath_step_"+this.name + this.curStep.id).style.display = 'none';
   if(this.hideLast)
      document.getElementById("webpath_step_"+this.name + prevStep.id).style.display = 'block';

   var ch = document.getElementById("webpath_choices_"+this.name);
   ch.innerHTML = prevStep.showChoices();
	var he = document.getElementById("webpath_help_"+this.name);
	if (he) { // help may not always be on the page
      he.innerHTML = prevStep.showHelp();
   }

   this.checkChoice();
   this.curStep = prevStep;
}


// Private method - set the correct choice when backing up a step
MultiPath.prototype.checkChoice = function() {
   var nextchoice = document.getElementById("webpath_choiceform_"+this.name).next;
   for (i =0; i<nextchoice.length; i++)
      if(nextchoice[i].value == this.curStep.id) nextchoice[i].checked =true;
}


// users may choose to show help via a button call, rather than printing the help message directly on the page
MultiPath.prototype.showPopupHelp = function() {
   var bgColor="white", textColor="black", titleColor="#0099ff";
   var title="Hint";

   msg=window.open("","TestResults","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=no,width=400,height=400");
   msg.document.clear();
   msg.document.writeln("<html>");
   msg.document.writeln("<head><title>"+title+"</title></head>");
   msg.document.writeln("<body onBlur=\"self.setTimeout('window.close()','4500')\" bgcolor='"+bgColor+"' text='"+textColor+"'>");
   msg.document.writeln("<br/>");
   msg.document.writeln("<center><h3><font color='"+titleColor+"'>"+title+"</font></h3></center>");
   msg.document.writeln("<center><hr width='75%'/></center>");
   msg.document.writeln("<blockquote>");
   msg.document.writeln(this.curStep.showHelp());
   msg.document.writeln("</blockquote>");
   msg.document.writeln("<center><hr width='75%'/></center>");
   msg.document.writeln("<p><form>");
   msg.document.writeln("<center><input type='submit' value='Done' onclick='window.close();'/></center>");
   msg.document.writeln("</form></p>");
   msg.document.writeln("</body>");
   msg.document.writeln("</html>");
   msg.document.close()
}
