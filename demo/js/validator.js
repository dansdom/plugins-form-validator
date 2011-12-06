/*
	jQuery Form Validator Plugin v1.4
	Copyright (c) 2011 Daniel Thomson
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/
// version 1.1	- added full date functionality
//				- added custom 'valid' message
// version 1.2	- changed fieldType declaration to the name attribute rather than the class name
//				- made custom error messages optional rather than necessary, now if there is no custom message then it will display the validation type error
//				- added reset event that replaces .error with &#42; and resets class behaviour
// version 1.3	- added maxValue and minValue rules for testing integer sizes
//				- added custom rule function that will let the developer add their own validation routines. more than one should be allowed
//				- added isUsername to check for valid twitter username for my project
// version 1.4	- added support for custom validation functions
//				- added option to validate on key change or only on field blur
//				- added field valid message class
//				- added optional field class that will validate
//
// Notes:
// checkboxes and radio button groups will share the same name attribute to identify the group
//		  Avaliable Rules:
//		  min			  		- value: numeric;	 minimum length of input
//		  max			  		- value: numeric;	 maximum langth of input
//		  minValue		  		- value: numeric;	 minimum numeric value of a field
//		  maxValue		  		- value: numeric;	 maximum numeric value of a field		
//		  checkboxMin			- value: numeric;	 minimum number of checkboxes that can be selected
//		  checkboxMax			- value: numeric;	 maximum number of checkboxes that can be selected - "true" = all
//		  fileType		  		- value: string;	 file types allowed for file inputs, this is a list of extensions seperated by a comma
//		  isNumber		  		- value: boolean;	 only numbers allowed as an input value
//		  lettersOnly			- value: boolean;	 only letters allowed as an input value
//		  passConfirm			- value: boolean;	 the field that it is checking the value against
//		  validURL		  		- value: boolean;	 validates a url input - set to "true". default is false
//		  validEmail	  		- value: boolean;	 checks that the value is a valid emial address
//		  date			  		- value: boolean;	 checks that the value is in a valid date format, supporting some of datepickers format types.
//		  dateFuture	  		- value: boolean;	 checks that the value is a date in the future
//		  datePast		  		- value: boolean;	 checks that the date is in the past
//		  checkHtmlTags	  		- value: string;	 list of tags seperated by commas. eg. "<div>,<p>,<span>" - if empty, checks for all tags. Checks for HTML tags in the input data
//		  selectNull	  		- value: string;	 default value of the select box - used to check against. Data object only, will return error if this is the value
//		  selectHasValue  		- value: boolean;	 checks whether the default value of the select box is not selected - will test against a true value
//		  radioReq		  		- value: boolean;	 true: a radio btn has to be selected. This will only validate on form submit
//		  noSpaces		  		- value: boolean;	 true: no spaces are allowed in the input
//		  custom				- value: boolean;  true: checks the custom validation function
//		  onChangeValidation	- value: boolean; true: option to validate on input change, if false then validation occurs on the blur event
//		  Date format type allowed:
//		  numeric values: D,M,Y
//		  seperators: , / - &nbps;
//		  Month values: short and long, word or number
//		  Day values: short and long
//		  Valid year range: 1000 - 3000
// Notes on Functionality
// 1. Associated error message will carry the same title and have the errorClass name
// 2. plugin will only validate the fields that have the requiredClass name
// Default input types are just a guide. It is recommended that the user define his own custom field. Do this thus:
// 1. define the input type name eg. myField
// 2. define the name of the input in the HTML eg. inputName: 'myFieldName'
// 3. define the rules to apply to that field eg. rules:{min:2,max:10,validURL:true}
// 4. define a custom error message (optional) eg. message: 'This field has particular needs'
// 5. putting it together on a <form id="pageForm"> :
//
//	$(document).ready(function(){
//		$("#pageForm").validator({
//				inputTypes:{
//					 myField: {
//								inputName: 'myFieldName',
//								rules: {min:2,max:10,validURL:true},
//								message: 'This field has particular needs'}}
//							  });
(function ($)
{

	$.fn.validator = function (config)
	{
		// config - default settings
		$.fn.validator.defaults = {
			inputTypes: {
				textField: {
					inputName: 'firstName',
					// this is the name attribute of the HTML form element
					rules: {
						min: 2,
						max: 20,
						lettersOnly: true,
						noSpaces: true
					}
				},
				textMessage: {
					inputName: 'message',
					rules: {
						min: 5,
						max: 100,
						validHTMLTags: '<div>,<p>,<span>,<b>'
					}
				},
				urlField: {
					inputName: 'url',
					rules: {
						validURL: true
					}
				},
				selectBox: {
					inputName: 'selectbox',
					rules: {
						selectHasValue: true,
						selectNull: '-please select-'
					},
					error: 'Please select a value for this field',
					valid: 'the field is valid - woot!'
				},
				radioBtn: {
					inputName: 'radio1',
					rules: {
						radioReq: true
					}
				},
				fileData: {
					inputName: 'fileData',
					rules: {
						fileType: 'doc,txt,html'
					}
				},
				checkboxField: {
					inputName: 'checkboxField',
					rules: {
						checkboxMin: 1
					}
				},
				date: {
					inputName: 'dateField',
					rules: {
						date: true
					}
				}
			},
			formClasses: {
				// have something to do validation when navigating to different fieldsets?!?
				// could do a $(".myfieldset").find("."+opts.formClasses.requiredClass).each(function(){$.fn.validator.validateField($(this),opts)}) on a click event or something;
				// fieldsetClass: 'formField',
				submitClass: 'submitField',
				resetClass: 'reset',
				requiredClass: 'required',
				optionalClass: 'optional',
				errorClass: 'error',
				errorMessage: 'The field has an error!',
				validClass: 'valid',
				validMessage: 'The field should be valid!',
				fieldActive: 'fieldActive',
				fieldActiveValid: 'fieldActiveValid',
				fieldActiveInvalid: 'fieldActiveInvalid'
			},
			longMonths: ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
			shortMonths: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
			longDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
			shortDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
			errorCount: 0,
			onChangeValidation: true
		};

		// if settings have been defined then overwrite the default ones
		// comments:	 true value makes the merge recursive. that is - 'deep' copy
		//			{} creates an empty object so that the second object doesn't overwrite the first object
		//			this emtpy takes object1, extends2 onto object1 and writes both to the empty object
		//			the new empty object is now stored in the var opts.
		var opts = $.extend(true, {}, $.fn.validator.defaults, config),
			theForm = $(this),
			theFormRequired = $(this).find("." + opts.formClasses.requiredClass),
			theFormOptional = $(this).find("." + opts.formClasses.optionalClass),
			theFormValidationFields = $(this).find("." + opts.formClasses.requiredClass + ", ." + opts.formClasses.optionalClass);

		return this.each(function ()
		{

			// start event handling for each of the required fields in the form
			theFormValidationFields.each(function ()
			{

				$(this).focus(function ()
				{
					$(this).addClass(opts.formClasses.fieldActive);
				});

				$(this).blur(function ()
				{
					$(this).removeClass(opts.formClasses.fieldActive);
					$(this).removeClass(opts.formClasses.fieldActiveValid);
					$(this).removeClass(opts.formClasses.fieldActiveInvalid);
					// if this field has a value then validate it
					if ($(this).attr("value") !== "")
					{
						$.fn.validator.validateField($(this), opts);
					}
				});

				$(this).change(function ()
				{
					// if this is a required field then validate it											
					$.fn.validator.validateField($(this), opts);
				});

				$(this).keyup(function ()
				{
					// if this field has a value and the option to validate 'on the fly' is true then validate it
					if ($(this).attr("value") !== "" && opts.onChangeValidation == true)
					{
						$.fn.validator.validateField($(this), opts);
					}
				});

				// basically the event 'change' doesn't work on select and radio boxes in IE6 - so I have to add a 'click'
				// event handler to those elements so that IE will play nice - dang!
				if (($(this).attr("type") == "checkbox" || $(this).attr("type") == "radio"))
				{
					$(this).click(function ()
					{
						$.fn.validator.validateField($(this), opts);
					});
				}
			});

			// do validation when the form has been submitted
			theForm.submit(function ()
			{

				opts.errorCount = 0;

				theFormRequired.each(function ()
				{
					//validate each of the required fields and then send off to the back end :)		
					//console.log("validating field: "+theFormRequired.attr("id"));							 
					$.fn.validator.validateField($(this), opts);
				});

				// check the error count									  
				if (opts.errorCount === 0)
				{
					// if no errors then return the page true
					return true;
				}
				else
				{
					//alert("you still have errors in the form");
					theForm.find("." + opts.formClasses.fieldActiveValid).removeClass(opts.formClasses.fieldActiveValid);
					return false;
				}
			});

			theForm.find("." + opts.formClasses.resetClass).click(function ()
			{
				// remove error class from the form, and maybe reset all values?
				// not sure I need to remove the last two classes here
				theForm.find("." + opts.formClasses.errorClass).removeClass(opts.formClasses.validClass).removeClass(opts.formClasses.fieldActiveValid).removeClass(opts.formClasses.fieldActiveInvalid);
				theForm.find("." + opts.formClasses.errorClass).html("&#42;");
			});

		});					 

		// return jQuery object
		return this;
	};

	// plugin functions go here - example of two different ways to call a function, and also two ways of using the namespace
	// note: $.fn.testPlugin.styleBox allows for this function to be extended beyond the scope of the plugin and used elsewhere,
	// that is why it is a superior namespace. Also: anonymous function calling I think is probably better naming practise too.

	// I might look to break up this function - its a bit long and hairy atm
	// Validate the current field
	$.fn.validator.validateField = function (field, opts)
	{
		var hasError = false,
			fieldName = field.attr("name"),
			fieldValue = field.attr("value"),
			fieldType, fieldRules, fieldErrorMessage, fieldValidMessage, errorMessage, checkedInField, dateArray, i;

		// if a select box then look for the option:selected value
		if (field.children("option").length > 0)
		{
			fieldValue = field.children("option:selected").text();
		}

		// check whether its an empty field or not
		if (fieldValue === "")
		{
			hasError = true;
		}

		// check which input type this field has
		for (i in opts.inputTypes)
		{
			// loop through the list of classes on the object and see if any match a class on the inputTypes object
			if (fieldName == opts.inputTypes[i].inputName)
			{
				fieldType = i;
				fieldRules = opts.inputTypes[i].rules;
				fieldErrorMessage = opts.inputTypes[i].error;
				fieldValidMessage = opts.inputTypes[i].valid;
			}
		}

		// add new rulesets to this switch function
		// check whether the rule is defined. If so, then do the validation routine on it.
		if (fieldValue)
		{
			fieldValue = $.fn.validator.stripWhiteSpace(fieldValue);
		}

		for (i in fieldRules)
		{
			// check if field is empty and min is not 0, if so throw an error
			if (fieldRules.hasOwnProperty(i))
			{
				switch (i)
				{
				case "min":
					// check min length
					if (fieldValue.length < fieldRules[i])
					{
						hasError = true;
						errorMessage = "Must be at least " + fieldRules[i] + " characters";
					}
					break;
				case "max":
					// check max length
					if (fieldValue.length > fieldRules[i])
					{
						hasError = true;
						errorMessage = "Must be less than " + fieldRules[i] + " characters";
					}
					break;
				case "minValue":
					if (parseFloat(fieldValue) < fieldRules[i])
					{
						hasError = true;
						errorMessage = "the value is lower than the minimum value";
					}
					break;
				case "maxValue":
					if (parseFloat(fieldValue) > fieldRules[i])
					{
						hasError = true;
						errorMessage = "the value is higher than the maximum allowed";
					}
					break;
				case "checkboxMin":
					// check how many checkboxes checked
					// get a list of checkboxes in the group - have the same name
					checkedInField = $("input[name=" + fieldName + "]:checked");
					if (checkedInField.length < fieldRules[i])
					{
						hasError = true;
						errorMessage = "More options need to be selected";
					}
					break;
				case "checkboxMax":
					// check how many checkboxes checked
					checkedInField = $("input[name=" + fieldName + "]:checked");
					if (checkedInField.length > fieldRules[i])
					{
						hasError = true;
						errorMessage = "More than the maximum allowable have been selected";
					}
					break;
				case "radioReq":
					// check that at least one field is selected in the radio list
					checkedInField = $("input[name=" + fieldName + "]:checked");
					if (checkedInField.length > 1)
					{
						//console.warn("more than one radio fields selected");
						hasError = true;
						errorMessage = "More than radio field has been selected";
					}
					break;
				case "selectNull":
					// check whether the current value is the same as the 'null' value
					if (fieldValue == fieldRules[i])
					{
						hasError = true;
						errorMessage = "Please select a value";
					}
					break;
				case "fileType":
					// check file extension
					if (!$.fn.validator.isFileValid(fieldValue, fieldRules[i]))
					{
						hasError = true;
						errorMessage = "The wrong type of file has been selected";
					}
					break;
				case "isNumber":
					// check that value is a number
					if (fieldRules[i] && !$.fn.validator.isNumber(fieldValue))
					{
						hasError = true;
						errorMessage = "The value is not a number";
					}
					break;
				case "lettersOnly":
					// check that value is a word
					// could probably combine the logic of these two if statements
					if (fieldRules[i] && !$.fn.validator.isText(fieldValue))
					{
						hasError = true;
						errorMessage = "The input can only be text";
					}
					break;
				case "validPassword":
					// check that the password is valid
					if (fieldRules[i] && !$.fn.validator.isValidPassword(fieldValue))
					{
						hasError = true;
						errorMessage = "The password has illegal characters";
					}
					break;
				case "passConfirm":
					// check the value of the pass confirmation
					var thisTitle = field.attr("title");
					var passField = $("input[type='password'][title=" + thisTitle + "][name!=" + fieldName + "]");
					var passValue = passField.attr("value");
					if (fieldValue != passValue)
					{
						hasError = true;
						errorMessage = "The password does not match";
					}
					break;
				case "validURL":
					// check whether the value is valid url
					if (fieldRules[i] && !$.fn.validator.isValidURL(fieldValue))
					{
						hasError = true;
						errorMessage = "That is not a valid URL";
					}
					break;
				case "validEmail":
					// check whether the value is a valid email
					if (fieldRules[i] && !$.fn.validator.isValidEmail(fieldValue))
					{
						hasError = true;
						errorMessage = "That is not a valid email address";
					}
					break;
				case "date":
					// check whether the value is a valid date
					if (fieldRules[i] === true)
					{
						// get the input value as an array and then pass it to isDateValid to test if it is valid. Need to test that $.fn.validator.getDateArray is not false before running isDateValid
						dateArray = $.fn.validator.getDateArray(fieldValue, opts);
						if (!dateArray || !$.fn.validator.isValidDate(dateArray, opts))
						{
							hasError = true;
							errorMessage = "The date format is not valid";
						}
					}
					break;
				case "dateFuture":
					if (fieldRules[i] === true)
					{
						//alert("finding rule");
						// check logic of this and 'past' test. Need to test that $.fn.validator.getDateArray is not false before running dateTense
						dateArray = $.fn.validator.getDateArray(fieldValue, opts);
						if (!dateArray || $.fn.validator.dateTense(dateArray, opts) != 'future')
						{
							hasError = true;
							errorMessage = "The date needs to be in the future";
						}
					}
					break;
				case "datePast":
					if (fieldRules[i] === true)
					{
						// need to test that $.fn.validator.getDateArray is not false before running dateTense
						dateArray = $.fn.validator.getDateArray(fieldValue, opts);
						if (!dateArray || $.fn.validator.dateTense(dateArray, opts) != 'past')
						{
							hasError = true;
							errorMessage = "The date needs to be in the past";
						}
					}
					break;
				case "checkHTMLTags":
					// check that there are no HTML tags in the input - won't be using this function now
					if (fieldRules[i] === true)
					{
						if ($.fn.validator.findHTML(fieldValue, opts))
						{
							hasError = true;
							errorMessage = "The input contains HTML tags";
						}
					}
					break;
				case "validHTMLTags":
					// check that there are no HTML tags in the input, and also filter out the valid ones
					if (fieldRules[i] && $.fn.validator.findHTMLTags(fieldValue, fieldRules[i]))
					{
						hasError = true;
						errorMessage = "The input contains non-valid HTML tags";
					}
					break;
				case "noSpaces":
					// check that there are no spaces in between character input
					if (fieldRules[i] && fieldValue.split(" ").length > 1)
					{
						hasError = true;
						errorMessage = "There are spaces in the input";
					}
					break;											
				default:
					// do nothing here
				}

				if (hasError === true)
				{
					// if no custom message then add the generic one
					if (!fieldErrorMessage)
					{
						var message = errorMessage;																				
					}
					else
					{	
						var message = fieldErrorMessage;																	
					}
					$("." + opts.formClasses.errorClass + "[title='" + fieldName + "']").html(message);					
					field.removeClass("fieldActiveValid").addClass("fieldActiveInvalid");
					opts.errorCount++;
				}
				else
				{
					// if no custom valid message, then add the generic one
					if (!fieldValidMessage)
					{
						var message = opts.formClasses.validMessage;						
					}
					else
					{
						var message = fieldValidMessage;
					}
					$("." + opts.formClasses.errorClass + "[title='" + fieldName + "']").html('<span class="' + opts.formClasses.validClass + '">' + message + '</span>');
					field.removeClass("fieldActiveInvalid").addClass("fieldActiveValid");					
				}
			}
		}

	};

	// file validation function
	$.fn.validator.isFileValid = function (file, ext)
	{
		var theRule = ext.split(","),
			filePath = file.split("/"),
			filePathLength = filePath.length,
			fileName = filePath[filePathLength - 1],
			fileType = fileName.split("."),
			fileTypeLength = fileType.length,
			fileExt = fileType[fileTypeLength - 1],
			i;
		// validate fileExt against the validation rule now.
		for (i = 0; i < theRule.length; i++)
		{
			if (fileExt == theRule[i])
			{
				return true;
			}
		}
		return false;
	};

	// Check for Valid URL: - url regex is not so good
	$.fn.validator.isValidURL = function (url)
	{
		var regex = /^(([\w]+:)?\/\/)?(([\d\w]|%[a-fA-f\d]{2,2})+(:([\d\w]|%[a-fA-f\d]{2,2})+)?@)?([\d\w][\-\d\w]{0,253}[\d\w]\.)+[\w]{2,4}(:[\d]+)?(\/([\-+_~.\d\w]|%[a-fA-f\d]{2,2})*)*(\?(&?([\-+_~.\d\w]|%[a-fA-f\d]{2,2})=?)*)?(#([\-+_~.\d\w]|%[a-fA-f\d]{2,2})*)?$/;
		if (regex.test(url))
		{
			return true;
		}
		else
		{
			return false;
		}
	};

	// Check for Valid Email Address: - this regex seems to be working, will need to do some proper testing on it though. Obviously you can't cover everything with this
	$.fn.validator.isValidEmail = function (email)
	{
		var regex = /^((([a-z]|[0-9]|!|#|$|%|&|'|\*|\+|\-|\/|=|\?|\^|_|`|\{|\||\}|~)+(\.([a-z]|[0-9]|!|#|$|%|&|'|\*|\+|\-|\/|=|\?|\^|_|`|\{|\||\}|~)+)*)@((((([a-z]|[0-9])([a-z]|[0-9]|\-){0,61}([a-z]|[0-9])\.))*([a-z]|[0-9])([a-z]|[0-9]|\-){0,61}([a-z]|[0-9])\.)[\w]{2,4}|(((([0-9]){1,3}\.){3}([0-9]){1,3}))|(\[((([0-9]){1,3}\.){3}([0-9]){1,3})\])))$/;
		if (regex.test(email))
		{
			return true;
		}
		else
		{
			return false;
		}
	};

	// Strip white spaces around a string
	$.fn.validator.stripWhiteSpace = function (string)
	{
		// just a straight regex replace to delete whitespace before and after the string
		var cleanString = string.replace(/^\s+|\s+$/g, '');
		return cleanString;
	};

	// Detects whether there is white space in the string
	$.fn.validator.hasWhiteSpace = function (string)
	{
		var regex = /[\s+]/; // space
		// going to just do a search for spaces
		if (regex.test(string))
		{
			return true;
		}
		else
		{
			return false;
		}
	};

	// Check input in Text Field:
	$.fn.validator.haveValue = function (text)
	{
		// clear whitespaces before and after text value
		var inputText = text.replace(/^\s+|\s+$/g, '');
		if (inputText !== '')
		{
			return true;
		}
		else
		{
			return false;
		}
	};

	$.fn.validator.isText = function (string)
	{
		var regex = /[^a-zA-Z\s]/; // not a word, space
		// going to just do a search for non text chars - this regex is bogus, I think?
		if (!regex.test(string))
		{
			return true;
		}
		else
		{
			return false;
		}
	};

	// letters, numbers and underscore - also need less than 15 chars, but will put that elsewhere
	$.fn.validator.isUsername = function (string)
	{
		var regex = /[^a-zA-Z0-9\_\s]/; // not a word, space
		// going to just do a search for non text chars - this regex is bogus, I think?			  
		if (!regex.test(string))
		{
			return true;
		}
		else
		{
			return false;
		}
	};

	// checks for a real number
	$.fn.validator.isNumber = function (inputValue)
	{
		//var regex = /(a plus or minus sign)(a number)(a decimal point)(another number) or (a plus or minus sign)(a decimal point)(another number) /;
		var regex = /^([\-\+]?[0-9]+[\.]?[0-9]+|[\-\+]?[\.]?[0-9]+){1}$/;
		if (regex.test(inputValue))
		{
			return true;
		}
		else
		{
			return false;
		}
	};

	// check a maximum of decimal places
	$.fn.validator.isMoney = function (inputValue)
	{
		var decimalSplit = false;
		if (inputValue.split(".") != undefined)
		{
			decimalSplit = inputValue.split(".");
		}
		if (decimalSplit && decimalSplit.length == 2)
		{
			if (decimalSplit[1].length < 3)
			{
				return true;
			}
			else
			{
				return false;
			}
		}
		else
		{
			return true;
		}
		return true;
	};

	// test for Valid Password: any letter or number, underscore, or any of - !@#$%^&*()-+
	// Note: this is checking for a password between 6 and 10 characters long, {6,10}
	// I need to take the 6-10 chars length out of the
	$.fn.validator.isValidPassword = function (password)
	{
		var regex = /^[a-zA-Z0-9!\@#\$%\^&\*\(\)\-\+=\.\?]+$/;
		if (regex.test(password))
		{
			return true;
		}
		else
		{
			return false;
		}
	};


	//	 Iv'm not using this function anymore. I've incorporated it into the findHTMLTags function
	//	 $.fn.validator.findHTML = function(fieldValue,opts)
	//	 {
	//		 var regex = /<\/?[a-zA-Z]+\s?([a-zA-Z]+=["'][^>"']+["']|[^>"']+)*>/;
	//		 // this won't do a property that doesn't have quotes
	//		 if (regex.test(fieldValue))
	//		 {
	//			return true;
	//		 }
	//		 else
	//		 {
	//			return false;
	//		 };
	//	 };
	// checks the list of allowable HTML tags, strips them out, and then tests for other html tags in the input data
	$.fn.validator.findHTMLTags = function (fieldValue, validTags)
	{
		var inputData = fieldValue;
		var tagsArray = validTags.split(",");
		var regex = /<\/?[a-zA-Z]+\s?([a-zA-Z]+=["'][^>"']+["']|[^>"']+)*>/;
		var tagsRegex = "";
		for (var i in tagsArray)
		{
			if (tagsArray.hasOwnProperty(i))
			{
				// add tags to the regex, then parse
				// I have to strip the brakets out of the [i] value before putting in the string and then turn it into a regex, and then replace out those tags
				var tag = tagsArray[i].replace(/[<>]/g, "");
				tagsRegex = "<\/?" + tag + "\\s?([a-zA-Z]+=[\"\'][^>\"\']+[\"\']|[^>\"\']+)*>";
				tagsRegex = new RegExp(tagsRegex, "gi");
				inputData = inputData.replace(tagsRegex, "");
			}
		}
		// now that the 'allowed' tags have been stripped out of the html, do a re-test of the field value to see if it still contains html
		if (regex.test(inputData))
		{
			return true;
		}
		else
		{
			return false;
		}
	};

	$.fn.validator.getDateArray = function (inputValue, opts)
	{

		// split the date input into its component parts. 3 seperators - " " or "-" or "/"
		// clean up commas and white spaces
		// if array is contains days of the week, then give it the chop
		var dateArray, isDay, dayIndex, i, j;
		inputValue = inputValue.replace(",", "");
		inputValue = inputValue.replace(/[\s]+?/g, " ");
		dateArray = inputValue.split(/[\s\-\/]/);

		// I need to now splice out the empty array elements
		for (i = 0; i < dateArray.length; i++)
		{
			if (dateArray[i] === '')
			{
				dateArray.splice(i, 1);
				i--;
			}
		}

		// if dataArray is length 4 then look for either a full day of short day text and splice it out
		for (i in opts.longDays)
		{
			if (opts.longDays.hasOwnProperty(i))
			{
				for (j in dateArray)
				{
					if (dateArray.hasOwnProperty(j))
					{
						if (dateArray[j] == opts.longDays[i])
						{
							isDay = true;
							dayIndex = j;
						}
					}
				}
			}
		}
		for (i in opts.shortDays)
		{
			if (opts.shortDays.hasOwnProperty(i))
			{
				for (j in dateArray)
				{
					if (dateArray.hasOwnProperty(j))
					{
						if (dateArray[j] == opts.shortDays[i])
						{
							isDay = true;
							dayIndex = j;
						}
					}
				}
			}
		}

		// want to clean up any 'st', 'nd' and 'rd' and 'th' in each element in the date array
		for (i in dateArray)
		{
			if (dateArray[i])
			{
				dateArray[i] = dateArray[i].replace(/(st)|(nd)|(rd)|(th)/gi, "");
			}
		}

		// if there are any day strings then chop 'em out
		if (dateArray.length === 4 && isDay === true)
		{
			dateArray.splice(dayIndex, 1);
		}

		// then test if it is 3 long - if so return it
		if (dateArray.length == 3)
		{
			return dateArray;
		}
		// if other than 3 long return false, date not valid
		return false;

	};

	// Date validation function
	$.fn.validator.isValidDate = function (dateArray, opts)
	{
		var isMonth = false,
			isYear = false,
			isDay = false,
			i,
			// check the months value first
			regex = /^[0-9]{1,2}$/,
			month, year, days = 31;
		// for numeric value
		if (regex.test(dateArray[1]) && (dateArray[1] > 0 && dateArray[1] < 13))
		{
			// first valus is a date
			month = parseInt(dateArray[1], 10);
			isMonth = true;
		}
		// for text value
		else
		{
			//for (i in longMonths)
			for (i in opts.longMonths)
			{
				if (dateArray[1].toLowerCase() == opts.longMonths[i])
				{
					month = parseInt(i, 10) + 1;
					isMonth = true;
				}
			}
			//for (i in shortMonths)
			for (i in opts.shortMonths)
			{
				if (dateArray[1].toLowerCase() == opts.shortMonths[i])
				{
					month = parseInt(i, 10) + 1;
					isMonth = true;
				}
			}
		}

		// check the years value for a valid numeric value. the range is between 1000 and 3000
		regex = /^([0-9]{2}|[0-9]{4})$/;
		// if ( (its a number) and (its between 0 and 99 or between 1000 and 3000) )
		if (regex.test(dateArray[2]) && (((dateArray[2] >= 0) && (dateArray[2] < 100)) || ((dateArray[2] > 1000) && dateArray[2] < 3000)))
		{
			// first valus is a date
			year = dateArray[2];
			isYear = true;
		}

		// check the second item in the array for either a numeric value or text value
		// check the number of days that the month has
		if (month == 4 || month == 6 || month == 9 || month == 11)
		{
			days = 30;
		}
		else if (month === 2)
		{
			if ((year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0)))
			{
				days = 29;
			}
			else
			{
				days = 28;
			}
		}

		// test whether input value is in the date range
		if (dateArray[0] > 0 && dateArray[0] <= days)
		{
			isDay = true;
		}

		// if all the values are true then return true
		if (isDay === true && isMonth === true && isYear === true)
		{
			return true;
		}
		else
		{
			return false;
		}

	};

	// this function will return true if the date is in the future, and false if the date is in the past
	$.fn.validator.dateTense = function (dateArray, opts)
	{
		var dateArrayI, inputDate, currentTime, i;
		// if the month is a word, then convert it to a number. search longMonths and shortMonths arrays for a match and then convert to that index
		for (i in opts.longMonths)
		{
			if (opts.longMonths.hasOwnProperty(i))
			{
				// convert to string and then to lower case
				dateArrayI = (dateArray[1] + "").toLowerCase();
				if (dateArrayI == opts.longMonths[i])
				{
					dateArray[1] = parseInt(i, 10) + 1;
				}
			}
		}
		for (i in opts.shortMonths)
		{
			if (opts.shortMonths.hasOwnProperty(i))
			{
				// convert to string and then to lower case
				dateArrayI = (dateArray[1] + "").toLowerCase();
				if (dateArrayI == opts.shortMonths[i])
				{
					dateArray[1] = parseInt(i, 10) + 1;
				}
			}
		}
		dateArray[1] = dateArray[1] - 1;
		// i have to convert the year to the correct century
		if (dateArray[2] < 100)
		{
			dateArray[2] = parseInt(dateArray[2], 10) + 2000; // will make the value in the year 2000 something
		}
		inputDate = new Date();
		inputDate.setFullYear(dateArray[2], dateArray[1], dateArray[0]);
		// round to the nearest day
		inputDate = Math.round(inputDate.getTime() / (1000 * 60 * 60 * 24)); // convert input time (sec) to number of days
		currentTime = new Date();
		// round to the nearest day
		currentTime = Math.round(currentTime.getTime() / (1000 * 60 * 60 * 24)); // convert current time (sec) to number of days
		// I now have days since 1 jan 1970, test which is bigger and then return boolean
		if (inputDate > currentTime)
		{
			return 'future';
		}
		else if (inputDate < currentTime)
		{
			return 'past';
		}
		else
		{
			return 'today';
		}
	};
	
	

	// end of module
})(jQuery);