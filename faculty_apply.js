
//   IPS-49917: By Eren on 12/03/2025

//	IPS-50501: Minor Changes to faculty recruitment portal and report format By Eren on 16.05.2025

//	IPS-51040: Fwd: Defense date not providing relevant option

 var js_request_uri = document.getElementById("js_request_uri").value;
 var js_site_base_url = document.getElementById("js_site_base_url").value;
 var js_aid = document.getElementById("js_aid").value;
 var js_session_email = document.getElementById("js_session_email").value;
 var js_userid = document.getElementById("js_userid").value;
 var is_iitgn_emp_flg = document.getElementById("is_iitgn_emp").value;

 $(document).ready(function(){

	$('#dob').on('keydown paste', function(e) {
	  e.preventDefault(); // block manual typing and pasting
	});

	$('.edu_join').on('keydown paste', function(e) {
	  e.preventDefault(); // block manual typing and pasting
	});

	$('.datefields').on('keydown paste', function(e) {
	  e.preventDefault(); // block manual typing and pasting
	});	

	$('.emp_join').on('keydown paste', function(e) {
	  e.preventDefault(); // block manual typing and pasting
	});

 	checkResetButtons(js_aid);
 	checkAllRequiredSections(js_aid,is_iitgn_emp_flg);

	bindJoinEduDatepickers(); // binds to the static #joinDate
	bindDatepickersPhdStatus(); //bind phd program date picker depending on radio button
 	bindJoinDatepickers(); // binds to the static #joinDate
 	bindDatepickers(); // binds to the static #joinDate



	$("body").tooltip({
		selector:'[id^=college],[id^=university]',
		title :"Please enter both the names of the Institution and University if they are different.",
        placement: "bottom",
        trigger: "focus",
        animation: true,
    }); 
    
    $("#discipline").change(function() {
        let disciplineValue = $(this).val();
        // Call function to populate the subsequent dropdown based on departmentValue
        populateDepartmentDropdown(disciplineValue);
    });

    let disciplineValue = $("#discipline").val();
    if(disciplineValue != ''){
    	populateDepartmentDropdown(disciplineValue);
    }

    $("#sdiscipline").change(function() {
        let disciplineValue = $(this).val();
        populateSDepartmentDropdown(disciplineValue);
    });

    // Trigger change event on page load to initialize the subsequent dropdown
    //$("#discipline").trigger("change");	


	$("#discipline").change(function(){
		var sel_disc = $(this).find("option:selected").val();	
		//do the ajax call
		// checking the discipline value
		if(sel_disc == 'OT')
		{
			$("input[alt ^= 'disotherOne_input").show();
			$("div[alt ^= 'disotherOne_input").show();
		} 
		else {
			$("input[alt ^= 'disotherOne_input']").hide();
			$("div[alt ^= 'disotherOne_input']").hide();
			$('#POther').val('');
		}
		// Ends here
	});

	$("#sdiscipline").change(function(){
		var sel_disc = $(this).find("option:selected").val();	
		//do the ajax call
		// checking the discipline value
		if(sel_disc == 'OT'){
			$("input[alt ^= 'dissecotherOne_input").show();
			$("div[alt ^= 'dissecotherOne_input").show();
		} 
		else {
			$("input[alt ^= 'dissecotherOne_input']").hide();
			$("div[alt ^= 'dissecotherOne_input']").hide();
			$('#sOther').val('');
		}
		// Ends here
	});



/***************************** For Publications Auto-fill START -------- ********************/
// Autocomplete for titles
	publication_title_autofill('1');
	conf_name_autofill('1');
	

/***************************** For Publications Auto-fill END -------- ********************/
	$.ajax({
	        type: 'post',
	        url: js_site_base_url + 'ajax/ajaxgetDepartment.php',
	        data: "id="+$('#discipline').val(),
	        dataType: "json",
			success: function(data){			 
	        	$.each(data, function(index, item) {    		
	        	    // Add each option to the dropdown
	                $('#department_label').html(item.DepartmentName);
	                $('#department').val(item.DepartmentName);
	    	    });    	     
	        },
			error: function () {
	    		alert('Failed to load data');
			}
	});

	// Script to copy Postal Address to Permanent Address
    const postalAddress = document.getElementById('mail_add');
    const permanentAddress = document.getElementById('mail_per');
    const sameAsPostal = document.getElementById('sameAsPostal');

    sameAsPostal.addEventListener('change', () => {
        if (sameAsPostal.checked) {
            permanentAddress.value = postalAddress.value; // Copy value
            //permanentAddress.disabled = true; // Disable editing
        } else {
            permanentAddress.disabled = false; // Enable editing
            permanentAddress.value = ''; // Clear value
        }
    });
});


function bindJoinEduDatepickers() {
	$('.edu_join').each(function () {
	    if (!$(this).hasClass('hasDatepicker')) {
	        $(this).datepicker({
                setDate: new Date(),
		        yearRange: "-50:+0",
		        dateFormat: "dd/mm/yy",
		        inline: true,
		        autoclose: true,
		        changeMonth: true,
		        changeYear: true,
		        maxDate: 0,  // Disable future dates
	            onSelect: function (dateText, inst) {
	                validateEduDates(inst.id); // Call with parameters
	            }
	        });
	    }
	});
}

function validateEduDates(fieldId) {
    let lastChar = fieldId.match(/\d+$/)[0]; // Extract the last number for matching eyj & eyl
    let eyjDate = $("#yj" + lastChar).datepicker("getDate"); // Get selected Date of Joining
    let eylDate = $("#yl" + lastChar).datepicker("getDate"); // Get selected Date of Leaving
   
    if (eyjDate && eylDate && eylDate < eyjDate) {
        alert("Date of Graduation cannot be before Date of Joining. Please select a valid date.");
        $("#yl" + lastChar).datepicker("setDate", null); // Reset invalid selection
    }
}

function bindJoinDatepickers() {
	$('.emp_join').each(function () {
	    if (!$(this).hasClass('hasDatepicker')) {
	        $(this).datepicker({
                setDate: new Date(),
		        yearRange: "-50:+0",
		        dateFormat: "dd/mm/yy",
		        inline: true,
		        autoclose: true,
		        changeMonth: true,
		        changeYear: true,
		        maxDate: 0,  // Disable future dates
	            onSelect: function (dateText, inst) {
	                validateDates(inst.id); // Call with parameters
	            }
	        });
	    }
	});
}

function validateDates(fieldId) {
    let lastChar = fieldId.match(/\d+$/)[0]; // Extract the last number for matching eyj & eyl
    let eyjDate = $("#eyj" + lastChar).datepicker("getDate"); // Get selected Date of Joining
    let eylDate = $("#eyl" + lastChar).datepicker("getDate"); // Get selected Date of Leaving

    if (eyjDate && eylDate && eylDate < eyjDate) {
        alert("Date of Leaving cannot be before Date of Joining. Please select a valid date.");
        $("#eyl" + lastChar).datepicker("setDate", null); // Reset invalid selection
    }
    else{
    	/*auto calculation for employement*/
    	from_date_id	=	$("#eyj" + lastChar).attr('id');
    	to_date_id		= 	$("#eyl" + lastChar).attr('id');
    	calc_duration_years(from_date_id, to_date_id);
    }
}

function bindDatepickers(){
	$('.datefields').each(function () {
	    if (!$(this).hasClass('hasDatepicker')) {
	        $(this).datepicker({
                setDate: new Date(),
		        yearRange: "-50:+0",
		        dateFormat: "dd/mm/yy",
		        inline: true,
		        autoclose: true,
		        changeMonth: true,
		        changeYear: true,
		        maxDate: 0,  // Disable future dates
	        });
	    }
	});
}



function bindDatepickersPhdStatus() {
  const selectedVal = $('input[type="radio"]:checked').val();
  const today = new Date();

  $('.phddatefield').each(function () {
    const $field = $(this);
    const fieldId = $field.attr('id');

    // Reset existing datepicker instance
    if ($field.hasClass('hasDatepicker')) {
      $field.datepicker('destroy');
      $field.removeClass('hasDatepicker');
    }

    let minDate = null;
    let maxDate = null;

    switch (selectedVal) {
      case "Awarded":
      case "Awaited":
        // 🔙 Both fields set to past till today
        minDate = null;
        maxDate = today;
        break;

      case "Submitted":
        if (fieldId === "phdyear") {
          minDate = null;
          maxDate = today;
        } else if (fieldId === "date_defense_phd_thesis") {
          minDate = today;
          maxDate = null;
        }
        break;

      case "Expected":
        // 🔜 Both fields set to future from today
        minDate = today;
        maxDate = null;
        break;
    }

    // Apply updated datepicker
    $field.datepicker({
      yearRange: "-50:+10",
      dateFormat: "dd/mm/yy",
      changeMonth: true,
      changeYear: true,
      minDate: minDate,
      maxDate: maxDate,
      defaultDate: today
    });

	// Prevent typing manually in the date field
	$field.on('keydown paste', function(e) {
	  e.preventDefault();
	});    

  });
}




function populateDepartmentDropdown(disciplineValue){
	$('#department').empty();
	$('#department_label').empty();
	$('#disc_hidden').val(disciplineValue);
	let sel_disc = disciplineValue;
    $.ajax({
        type: 'post',
        url: js_site_base_url + 'ajax/ajaxgetDepartment.php',
        data: "id="+disciplineValue,
        dataType: "json",
		success: function (data) {
            if (data.length > 0) {
                let firstDepartment = data[0]; // Store first department for label
                $('#department_label').html(firstDepartment.DepartmentName);

                let selected_discipline_id = firstDepartment.DisciplineId;

                // Auto-select the first department (optional)
                $('#department').val(firstDepartment.DepartmentName);

                // Call populateCADropdown with first department
                const departmentId = firstDepartment.DepartmentCode; 
                populateCADropdown(departmentId, selected_discipline_id);
            } else {
                $('#department_label').html("No departments available");
                $('#department').val(0);
            }
        },
		error: function () {
    		//alert('Failed to load data');
		}
    });
}


function populateCADropdown(departmentId,selected_discipline_id){
	
	let sel_ca1 = $('#sel_core_area1').val();
	let sel_ca2 = $('#sel_core_area2').val();
	let sel_ca3 = $('#sel_core_area3').val();
	
    $.ajax({
        type: 'post',
        url: js_site_base_url + 'ajax/ajaxgetCA.php',
        data: "department_id="+departmentId+"&discipline_id="+selected_discipline_id,
        dataType: "json",
		success: function(data){
			$("#core_area1").html('<option value="">Select Core Area (Select the closest that applies)</option>');
			$("#core_area2").html('<option value="">Select Core Area (Select the closest that applies)</option>');
			$("#core_area3").html('<option value="">Select Core Area (Select the closest that applies)</option>');
			
        	$.each(data, function(index, item) {     		
        		let isSelected1 = item.research_area === sel_ca1 ? "selected" : "";
        		let isSelected2 = item.research_area === sel_ca2 ? "selected" : "";
        		let isSelected3 = item.research_area === sel_ca3 ? "selected" : "";

        	    // Add each option to the dropdown
                $('#core_area1').append(
                   `<option value="${item.research_area}" ${isSelected1}>${item.research_area}</option>`
                );

                $('#core_area2').append(
                   `<option value="${item.research_area}" ${isSelected2}>${item.research_area}</option>`
                );

                $('#core_area3').append(
                   `<option value="${item.research_area}" ${isSelected3}>${item.research_area}</option>`
                );                                
    	    });
        },
		error: function () {
    		//alert('Failed to load data');
		}
    });
}


function populateSDepartmentDropdown(disciplineValue){
    $.ajax({
        type: 'post',
        url: js_site_base_url + 'ajax/ajaxgetDepartment.php',
        data: "id="+disciplineValue,
        dataType: "json",
		success: function(data){			 
        	$.each(data, function(index, item) {    			        		
        	    // Add each option to the dropdown           
                $('#sdepartment').val(item.DepartmentName);
    	    });
        },
		error: function () {
    		//alert('Failed to load data');
		}
    });
}


	 
$(document).ready(function(){
    $('#photo').change( function(e) {
		$('.image').attr('src', 'img/user_photo.jpg');
         if ($(this).valid() == true ) 
		 {
            var img = URL.createObjectURL(e.target.files[0]);
            $('.image').attr('src', img);
		 }
    });
});
	
	
	$(function() {
    $("#firstname").Setcase({caseValue : 'title'});
	$("#middlename").Setcase({caseValue : 'title'});
	$("#lastname").Setcase({caseValue : 'title'});
	$("#txtemail").Setcase({caseValue : 'lower'});
	$("#aemail").Setcase({caseValue : 'lower'});
	$("#POther").Setcase({caseValue : 'title'});
	$("#sOther").Setcase({caseValue : 'title'});
	});
	
     $(document).ready(function(){
		$('input[type="radio"]').click(function(){
				$('#phdyear').prop('required',true);

				$('#phdyear').val('');
				$('#date_defense_phd_thesis').val('');
				
				if($(this).attr("value")=="Awarded"){
					$('#phdsupervisor').prop('required',true);
					$('#DocInst').prop('required',true);
					$('#postphd').prop('required',true);
				    
					$( "#awarded_msg" ).show( "slow" );
					$( "#awaited_msg" ).hide( "slow" );
					$( "#submitted_msg" ).hide( "slow" );
					$( "#expected_msg" ).hide( "slow" );

					$('#phdmonth-error').css('display','block');
					$('#phdyear-error').css('display','block');
					$('#postphd-error').css('display','block');
					$(".js_phd_work_save").attr("disabled", false);
					$(".js_phd_work_reset").attr("disabled", false);
				}
				if($(this).attr("value")=="Awaited"){
					$('#phdmonth').prop('disabled',false);
					$("#postphd").prop("readonly", false);					
					$('#postphd').prop('required',true);
					$('#DocInst').prop('required',true);
					$('#phdsupervisor').prop('required',true);	

					$( "#awarded_msg" ).hide( "slow" );
					$( "#awaited_msg" ).show( "slow" );
					$( "#submitted_msg" ).hide( "slow" );
					$( "#expected_msg" ).hide( "slow" );
					
					$('#phdmonth-error').css('display','block');
					$('#phdyear-error').css('display','block');
					$('#postphd-error').css('display','block');
					$(".js_phd_work_save").attr("disabled", false);
					$(".js_phd_work_reset").attr("disabled", false);
				}
				if($(this).attr("value")=="Submitted"){
					$('#phdmonth').prop('disabled',false);
					$("#postphd").prop("readonly", false);
					$('#postphd').prop('required',true);
					$('#DocInst').prop('required',true);
					$('#phdsupervisor').prop('required',true);	

					$( "#awarded_msg" ).hide( "slow" );
					$( "#awaited_msg" ).hide( "slow" );
					$( "#submitted_msg" ).show( "slow" );
					$( "#expected_msg" ).hide( "slow" );
					
					$('#phdmonth-error').css('display','block');
					$('#phdyear-error').css('display','block');
					$('#postphd-error').css('display','block');
					$(".js_phd_work_save").attr("disabled", false);
					$(".js_phd_work_reset").attr("disabled", false);
				}				
				if($(this).attr("value")=="Expected"){
					$("#postphd").prop("readonly", true);
					$('#postphd').prop('required',false);
					$('#postphd').val('');
					$('#phdmonth').val('');
					$('#phdyear').val('');
					$('#phdmonth-error').css('display','none');
					$('#phdyear-error').css('display','none');
					$('#postphd-error').css('display','none');

					$( "#awarded_msg" ).hide( "slow" );
					$( "#awaited_msg" ).hide( "slow" );
					$( "#submitted_msg" ).hide( "slow" );
					$( "#expected_msg" ).show( "slow" );
					
					$(".js_phd_work_save").attr("disabled", true);
					$(".js_phd_work_reset").attr("disabled", true);
				}
				if($(this).attr("value")=="blue"){
					$(".box").not(".blue").hide();
					$(".blue").show();
				}
				bindDatepickersPhdStatus();
		});
	
		
		
		$('#dob').datepicker({
            setDate: new Date(),
            defaultDate: "-25y",
			yearRange: "-85:-25",
			dateFormat:"dd/mm/yy",
			inline: true,
            autoclose: true,
			changeMonth: true,
			changeYear: true,
			onSelect: function () {
            	$(this).valid(); // Trigger validation on date selection
        	}			
        }); 
        jQuery(function($){
			$("#dob").mask("99/99/9999");
		});
			 
		jQuery(function($){
			$(".input-datepicker").mask("99/99/9999");
		});

		jQuery.validator.addMethod("wordCount",
			function(value, element, params) {
				var typedWords = jQuery.trim(value).split(' ').length;
				if(typedWords <= params[0]) {
					return true;
				}
			},
			jQuery.validator.format("Only {0} words allowed.")
		);
				
				

				jQuery('.textarea').wysihtml5(
					{
						"font-styles": false, //Font styling, e.g. h1, h2, etc.
						"emphasis": true, //Italics, bold, etc.
						"lists": true, //(Un)ordered lists, e.g. Bullets, Numbers.
						"html": false, //Button which allows you to edit the generated HTML.
						"link": true, //Button to insert a link.
						"image": false, //Button to insert an image.
						"color": false //Button to change color of font
					},
				
					{
					"events":      {
							"load": function () {
							jQuery('.textarea').addClass('nicehide');
							}
						}
					}
					
					
					);
	
					
var tidyHtml = function() {
  var html = this.getValue();

  // remove empty paragraphs
  html = html.replace(/<p>(&nbsp;|\s+)?<\/p>/g, "");
  html = html.replace(/<p><b>(&nbsp;|\s+)?<\/b><\/p>/g, "");

  // remove newlines between words
  html = html.replace(/([^>])\n([^<])/g, "$1 $2");

  // remove excess whitespace
  html = html.replace(/(\n\s*)+/g, "\n");

  // add newlines between paragraphs
  html = html.replace(/<\/p><p>/g, "</p>\n<p>");

  this.setValue(html);
};

wysihtml5_options = {
  events: {
    "paste:composer": tidyHtml
  },
};				
					
					
					
					jQuery.validator.addMethod('filesize', function(value, element, param) {
						return this.optional(element) || (element.files[0].size <= param) 
					});

					jQuery.validator.addMethod("phoneno", function(phone_number, element) {
						phone_number = phone_number.replace(/\s+/g, "");
						return this.optional(element) || 
						phone_number.match(/^[0-9+]+$/);
					}, "<br />Please specify a valid phone number");
					
					jQuery.validator.addMethod("notEqual", function(value, element, param) {
						return this.optional(element) || value != param;
					},"Please specify a different email id");
						
					jQuery.validator.addMethod("notEqualTo",
						function(value, element, param) {
									var notEqual = true;
									value = $.trim(value);
								for (i = 0; i < param.length; i++) {
								if (value == $.trim($(param[i]).val())) { notEqual = false; }
								}
								return this.optional(element) || notEqual;
								},"Please enter a diferent value."
					);
						
					jQuery.validator.addMethod("notEqualph", function(value, element, param) {
						return this.optional(element) || value != param;
					},"Please specify a different Number");
						
					jQuery.validator.addMethod("notEqualToph",
						function(value, element, param) {
									var notEqualph = true;
									value = $.trim(value);
								for (i = 0; i < param.length; i++) {
								if (value == $.trim($(param[i]).val())) { notEqualph = false; }
								}
									return this.optional(element) || notEqualph;
								},"Please enter a diferent value."
					);					
					
				
				$(document).ajaxStart(function(){
													$("#wait").css("display", "block");
												});
			$(document).ajaxComplete(function(){
									$("#wait").css("display", "none");
												});
			
			
				// Tab 1 validation
		 				
			//Removal of AGE calculation function on 11


			
			// New Laboratories conidtion adding
					
			$(".js_blur_teaching").blur(function(){				
				var ctit1 = $("#LabFrm input[name=ctitle1]").val();
				var strorg1 = $("#pgug1").val();
				var strsole1 = $("#sole1").val();
				var strty1 = $("#tyl1").val();
				
			 
				if($.trim(ctit1) != '' || $.trim(strorg1) !='' || $.trim(strsole1) !='' || $.trim(strty1) !=''){
					$(".js_teaching_frm_save").attr("disabled", false);
					$(".js_teaching_frm_reset").attr("disabled", false);
				}else{
					$(".js_teaching_frm_save").attr("disabled", true);
					$(".js_teaching_frm_reset").attr("disabled", true);
				}
		});
			
			$("[id ^= 'labAdd']").on("click", function()
        	{
				
        	   var lastid = $("#labBlk tr:last").find("[id ^= 'ctitle']").attr("id");
        	   //var lastChar = parseInt(lastid.substr(lastid.length - 1))+parseInt(1);
			   if (parseInt(lastid.length)==parseInt(8))
				    {				   
						 var lastChar = parseInt(lastid.substr(lastid.length - 2))+parseInt(1);
				    }				   
				    else
				    {
					    var lastChar = parseInt(lastid.substr(lastid.length - 1))+parseInt(1);
				    }
			 
        	   var data = '<tr><td><input type="text" id="ctitle'+lastChar+'" name="ctitle'+lastChar+'" class="form-control" placeholder="Title of course taught"></td><td><input type="text"  id="pgug'+lastChar+'" name="pgug'+lastChar+'" class="form-control" placeholder="Postgraduate/ Undergraduate"></td><td><input type="text" id="sole'+lastChar+'" name="sole'+lastChar+'" class="form-control" placeholder="Primary Instructor/Shared Instructor/TA/Tutor"></td><td><select id="tyl'+lastChar+'" name="tyl'+lastChar+'" class="form-control js_blur_teaching" placeholder="Year" required></td><td><a id="labDelete'+lastChar+'" data-original-title="Delete" href="javascript:void(0)" class="btn btn-alt btn-sm btn-danger btn-option newTooltip border__radius_js" data-toggle="tooltip"><i class="fa fa-times"></i></a></td></tr>'; 
        	   $("#labBlk").append(data);        	  
				$("#ctitle"+lastChar).rules("add", {maxlength:200, messages: {maxlength:"Accept only 200 characters"}});
				$("#pgug"+lastChar).rules("add", {maxlength:200, messages: {maxlength:"Accept only 200 characters"}});
				$("#sole"+lastChar).rules("add", {maxlength:200, messages: {maxlength:"Accept only 200 characters"}});
				$("#tyl"+lastChar).rules("add", {required:true, messages: {required:"Required"}});

				var currentYear = new Date().getFullYear(); // Get the current year
				var startYear = currentYear - 70; // Define the start year

				// Populate the dropdown
 				$('#tyl'+lastChar).append($('<option>', {
				        value: '',
				        text: 'Please Select'
				    }));				
				for (var i = startYear; i <= currentYear; i++) {
				    $('#tyl'+lastChar).append($('<option>', {
				        value: i,
				        text: i
				    }));
				}				
       	    
			   $('body').tooltip({
					selector: '.newTooltip'
				});
        	});
			
			$("[id ^= 'labDelete']").live("click", function()
        	{
        	   $(this).closest("tr").remove();            
        	});
			
		var labFrmvalidator = $("#LabFrm").validate({	
		rules: {
			ctitle1: {			
				maxlength:200		
			},
			pgug1: {			
				maxlength:200		
			},
			sole1: {			
				maxlength:200		
			}
        },
        messages: {
			ctitle1: {			
				maxlength:"Accept only 200 charcters"		
			},
			pgug1: {			
				maxlength:"Accept only 200 charcters"		
			},
			sole1: {			
				maxlength:"Accept only 200 charcters"		
			} 
        },		
      
        // Ajax form submition
        submitHandler: function(form) {		
        	 $('#loadingmessage').show();   
             teach_check=0;
			     if ($('#tena').is(':checked'))
				 {
					teach_check=1;
				 }	
								
				 var formData = $(form).serialize();
				 /*formData.append("teach_check", teach_check);
				 formData.append("pg_check", pg_check);*/
				 
                $.ajax({
                    type: 'post',
                    url: js_site_base_url + 'ajax/ajaxlab.php',
                    data: formData+"&teach_check="+teach_check,
                    success: function (response) {
                    	 $('#loadingmessage').hide(); 
						 location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=thesisteach&mode=savesuccess";                         
                    }
                }); 
        }
    });
	
	$(".labEdit").click(function(){                
			var rowid = $(this).attr("rowid");        
			$('#labSaveButton'+rowid).show();
			$('#labEditButton'+rowid).hide();
			$('#labDeleteButton'+rowid).hide();
			// span hide
			$("[id ^= 'labRowOne_"+rowid+"']").hide();
			$("input[alt ^= 'labRowOne_input_"+rowid+"']").show();
			$("select[alt ^= 'labRowOne_input_"+rowid+"']").show();
		});
		
		$(".labSave").click(function(){
		 
        var rowid = $(this).attr("rowid");		
        var key = $(this).attr("rel");
		$("#ctitle"+key).rules("add", {maxlength:200, messages: {maxlength:"Accept only 200 characters"}});		
		$("#pgug"+key).rules("add", {maxlength:200, messages: {maxlength:"Accept only 200 characters"}});		
		$("#sole"+key).rules("add", {maxlength:200, messages: {maxlength:"Accept only 200 characters"}});		
		$("#tyl"+key).rules("add", {required:true, messages: {required:"Required"}});		
		var ctitle = $(this).closest("tr").find('td input:eq(0)').val();		
		var pgug = $(this).closest("tr").find('td input:eq(1)').val();
		var sole = $(this).closest("tr").find('td input:eq(2)').val();		
		var completion_year = $(this).closest("tr").find('td input:eq(3)').val();
		
			
		formData  = "nid=" + rowid + "&cotitle=" + ctitle + "&pgug=" + pgug +"&inssole=" + sole +
			"&clyear=" + completion_year + "&form_type=pg";
       $.ajax({
				   type: 'post',
				   url: js_site_base_url + 'ajax/labedit.php',                           
				   data: formData,
				   type: "POST",                           
				   success: function (response) {
					   $("input[alt = 'labRowOne_input_"+rowid+"']").hide();
					   $("#labSaveButton"+rowid).hide();
					   $("#labEditButton"+rowid).show();         	  
					   $("#labDeleteButton"+rowid).show();
				   }
			   }); 
			$(this).closest("tr").find('td span:eq(0)').html(ctitle).show();
			$(this).closest("tr").find('td span:eq(1)').html(pgug).show();
			$(this).closest("tr").find('td span:eq(2)').html(sole).show();
			$(this).closest("tr").find('td span:eq(3)').html(completion_year).show();
				
		
		});
		
		$("#tena").click(function(event){	
		if ($(this).is(":checked"))
		{		
		$("#hidena1").hide();
		$("#hidena2").hide();
		} else {
		$("#hidena1").show();
		$("#hidena2").show();
		}
		});
			
		// New Laboratories Ends hers
			
			// Postgraduate conidtion adding
			
			$(".js_blur_post_graduate").blur(function(){				
				var pstude = $("#LabFrm input[name=student1]").val();
				var strptit1 = $("#title1").val();
				var strdoct1 = $("#doctorate1").val();
				var strpy1 = $("#pyl1").val();
				
			 
				if($.trim(pstude) != '' || $.trim(strptit1) !='' || $.trim(strdoct1) !='' || $.trim(strpy1) !=''){
					$(".js_post_graduate_frm_save").attr("disabled", false);
					$(".js_post_graduate_frm_reset").attr("disabled", false);
				}else{
					$(".js_post_graduate_frm_save").attr("disabled", true);
					$(".js_post_graduate_frm_reset").attr("disabled", true);
				}
		});
			
			$("[id ^= 'pgAdd']").on("click", function(){
				var lastid = $("#pgBlk tr:last").find("[id^= 'student']").attr("id");
				if (lastid) {
		    		// Extract the numeric part from the ID
		    		var match = lastid.match(/\d+$/); // Finds the last number in the string
		    		if (match) {
		        		var lastChar = parseInt(match[0]) + 1; // Increment the extracted number
		        	} 
		        	else {
		        		var lastChar = 1; // Default to 1 if no number is found
		    		}
		    	}

        	   var data = '<tr><td><input type="text" id="student'+lastChar+'" name="student'+lastChar+'" class="form-control" placeholder="Name of Student/Research Scholar"></td><td><input type="text" id="doctorate'+lastChar+'" name="doctorate'+lastChar+'" class="form-control" placeholder="Doctorate/Master\'s"></td><td><input type="text"  id="pyl'+lastChar+'" name="pyl'+lastChar+'" class="form-control datefields" placeholder="Date of Submission" ></td><td><input type="number" min="0" max="5" id="coguide'+lastChar+'" name="coguide'+lastChar+'" class="form-control" placeholder="No. of Supervisors"></td><td><a id="thesisDelete'+lastChar+'" data-original-title="Delete" href="javascript:void(0)" class="btn btn-alt btn-sm btn-danger btn-option newTooltip border__radius_js" data-toggle="tooltip"><i class="fa fa-times"></i></a></td></tr>'; 
        	   $("#pgBlk").append(data);        	  
						
       	       $("#student"+lastChar).rules("add", {maxlength:200, messages: {maxlength:"Accept only 200 characters"}});
       	       $("#doctorate"+lastChar).rules("add", {maxlength:200, messages: {maxlength:"Accept only 200 characters"}});      	       
			   $("#coguide"+lastChar).rules("add", {maxlength:200,messages: {maxlength:"Accept only 200 characters"}});
			   $('body').tooltip({
					selector: '.newTooltip'
				});

				bindDatepickers();
				$('.datefields').on('keydown paste', function(e) {
				  e.preventDefault(); // block manual typing and pasting
				});
        	});
			
			$("[id ^= 'thesisDelete']").live("click", function(){
        	   $(this).closest("tr").remove();            
        	});
			
		var pgFrmvalidator = $("#pgFrm").validate({		
       rules: {
			student1: {			
				maxlength:200			
			},
			doctorate1: {			
				maxlength:200			
			},
			coguide1: {			
				maxlength:200			
			}
        },
        messages: {  
		student1: {			
				maxlength:"Accept only 200 characters"			
			},
			doctorate1: {			
				maxlength:"Accept only 200 characters"		
			},
			coguide1: {			
				maxlength:"Accept only 200 characters"			
			},
        },	
        // Ajax form submition
		submitHandler: function(form) {		

		    $('#loadingmessage').show(); 

		    // Prevent default submission
		    event.preventDefault(); //  This will throw an error because `event` is undefined

		    let pg_check = $('#tepg').is(':checked') ? 1 : 0;

		    // Correctly create FormData from the form element
		    let formData = new FormData(form);  //  Use `form` directly instead of `document.forms.namedItem("pgFrm")`

		    // Append additional data
		    formData.append("pg_check", pg_check);

		    $.ajax({
		        type: 'POST',
		        url: js_site_base_url + 'ajax/ajaxpostgraduate.php',
		        data: formData,
		        processData: false,  //  Required for FormData
		        contentType: false,  //  Required for FormData
		        success: function (response) {
		            $('#loadingmessage').hide(); 


		            if ($.trim(response) === 'success') {
		                location.href = js_site_base_url + "facultyapply/" + js_aid + "&tab=thesis&mode=savesuccess";
		            } else {
		                location.href = js_site_base_url + "facultyapply/" + js_aid + "&tab=thesis&mode=thesissavefailed";
		            }
		        }
		    }); 
		}
    });
	
	$(".pgEdit").click(function(){                
			var rowid = $(this).attr("rowid");        
			$('#pgSaveButton'+rowid).show();
			$('#pgEditButton'+rowid).hide();
			$('#pgDeleteButton'+rowid).hide();
			// span hide
			$("[id ^= 'pgRowOne_"+rowid+"']").hide();
			$("input[alt ^= 'pgRowOne_input_"+rowid+"']").show();
		});
		
		$(".pgSave").click(function(){
		 
        var rowid = $(this).attr("rowid");		
        var key = $(this).attr("rel");	
		   $("#student"+key).rules("add", {maxlength:200, messages: {maxlength:"Accept only 200 characters"}});
		   $("#doctorate"+key).rules("add", {maxlength:200, messages: {maxlength:"Accept only 200 characters"}});      	       
		   $("#coguide"+key).rules("add", {maxlength:200,messages: {maxlength:"Accept only 200 characters"}});
			
		 
		var student = $(this).closest("tr").find('td input:eq(0)').val();		
		var doctorate = $(this).closest("tr").find('td input:eq(1)').val();		
		var completion_year = $(this).closest("tr").find('td input:eq(2)').val();
		var coguide = $(this).closest("tr").find('td input:eq(3)').val();
			
		formData  = "nid=" + rowid + "&studentname=" + student + "&doctorate=" + doctorate +
			"&cyear=" + completion_year + "&cguide=" + coguide + "&form_type=pg";
       $.ajax({
				   type: 'post',
				   url: js_site_base_url + 'ajax/pgedit.php',                           
				   data: formData,
				   type: "POST",                           
				   success: function (response) {
					   $("input[alt = 'pgRowOne_input_"+rowid+"']").hide();
					   $("#pgSaveButton"+rowid).hide();
					   $("#pgEditButton"+rowid).show();         	  
					   $("#pgDeleteButton"+rowid).show();
				   }
			   }); 
			$(this).closest("tr").find('td span:eq(0)').html(student).show();
			$(this).closest("tr").find('td span:eq(1)').html(doctorate).show();
			$(this).closest("tr").find('td span:eq(2)').html(completion_year).show();
			$(this).closest("tr").find('td span:eq(3)').html(coguide).show();
			
		
		});
	
		$("#tepg").click(function(event){
			if ($(this).is(":checked"))
				$("#hidepg").hide();
			else 
				$("#hidepg").show();
		});

		jQuery.validator.addMethod("check_cpi", function(value, element) {
			grading_type=$(element).closest('tr').find('.grade_type').val();
			grading_score=$(element).closest('tr').find('.qual_score').val();
			grading_scale=$(element).closest('tr').find('.qual_scale').val();

			if(grading_type ==1 && grading_score !='' && grading_scale !=''){
				field_left=parseFloat(grading_score) ||0;
				field_right=parseFloat(grading_scale)||0;
				if(field_left <= field_right){//alert('in');
					return true;
				}
				return false;
			}
			return true;
		}, "Score should be less than Scale");

		/*qualification*/
		$("[id ^= 'degreeAdd']").on("click", function(){

		var lastid = $("#academicBlk tr:last").find("[id^= 'degree']").attr("id");
		console.log(lastid);

		if (lastid) {
		    // Extract the numeric part from the ID
		    var match = lastid.match(/\d+$/); // Finds the last number in the string

		    if (match) {
		        var lastChar = parseInt(match[0]) + 1; // Increment the extracted number
		        console.log("Next ID number: " + lastChar);
		    } else {
		        var lastChar = 1; // Default to 1 if no number is found
		    }
		}				    
			 
        	  var data = '<tr>' +
					    '<td>' +
					        /*'<input type="text" id="degree' + lastChar + '" name="degree' + lastChar + '" class="form-control" placeholder="Degree">' +*/
					    '<select id="degree' + lastChar + '" name="degree' + lastChar + '" class="form-control" placeholder="Degree" required="required" onchange="filldatafordegreeother('+lastChar+')"><option value="">Select</option><option value="P.G.">P.G.</option><option value="Ph.D.">Ph.D.</option><option value="Diploma">Diploma</option><option value="Other">Other</option></select>'+
					    '</td>' +
					    '<td>' +
					        '<input type="text" required="required" id="specialization' + lastChar + '" name="specialization' + lastChar + '" class="form-control" placeholder="Program" onchange="filldataforprogram('+lastChar+')">' +
					    '</td>' +
					    '<td>' +
					        '<input type="text" required="required" id="college' + lastChar + '" name="college' + lastChar + '" class="form-control" placeholder="Institution">' +
					    '</td>' +
					    '<td>' +
					        '<input type="text" id="university' + lastChar + '" name="university' + lastChar + '" class="form-control" placeholder="University">' +
					    '</td>' +
					    '<td>' +
					        '<input type="text" required="required" id="yj' + lastChar + '" name="yj' + lastChar + '" class="form-control edu_join" placeholder="Date of Joining" maxlength="10" >' +
					    '</td>' +
					    '<td>' +
					        '<input type="text" required="required" id="yl' + lastChar + '" name="yl' + lastChar + '" class="form-control edu_join" placeholder="Date of Graduation" maxlength="10" >' +
					    '</td>' +
					    '<td>' +
					        '<select class="form-control grade_type" name="grade_type' + lastChar + '" id="grade_type' + lastChar + '" required="required" aria-required="true" aria-invalid="false">' +
					            '<option value="">Please select</option>' +
					            '<option value="2">Percentage system</option>' +
					            '<option value="1">Point based system</option>' +
					            '<option value="3">Other</option>' +
					        '</select>' +
					    '</td>' +
					    '<td>' +
					        '<div class="qual_per_div">' +
					            '<input type="text" required="required" id="percentage' + lastChar + '" name="percentage' + lastChar + '" class="form-control percentage" placeholder="Percentage">' +
					        '</div>' +
					    '</td>' +
					    '<td>' +
					        '<a id="degreeDelete' + lastChar + '" data-original-title="Delete" href="javascript:void(0)" class="btn btn-alt btn-sm btn-danger btn-option newTooltip border__radius_js" data-toggle="tooltip">' +
					            '<i class="fa fa-times"></i>' +
					        '</a>' +
					    '</td>' +
					'</tr>';

				$("#academicBlk").append(data);
        	  
       	       $("#degree"+lastChar).rules("add", {required: true,maxlength:200, messages: {required: "Required",maxlength:"Accept only 200 characters"}});
       	       $("#specialization"+lastChar).rules("add", {required: true,maxlength:200, messages: {required: "Required",maxlength:"Accept only 200 characters"}});
       	       $("#college"+lastChar).rules("add", {required: true,maxlength:200, messages: {required: "Required",maxlength:"Accept only 200 characters"}});       	    
			   $("#yj"+lastChar).rules("add", {required: true, maxlength:10, messages: {required: "Required",minlength:"Maximum 10<br/> characters"}});
			   $("#yl"+lastChar).rules("add", {required: true, maxlength:10,messages: {required: "Required",minlength:"Maximum 10 <br/>characters"}});
			   $("#percentage"+lastChar).rules("add", 
			   										{	required: true,
			   											gradeNumberCheck: true,
			   											gradeMaxCheck: true,
			   											gradeMaxLength: true,
			   											messages: {
			   												required: "This field is required.",
			   												gradeNumberCheck: "Please enter a valid number.",
			   												gradeMaxCheck: "Value exceeds the allowed maximum.",
			   												gradeMaxLength: "Only 20 charcters are allowed for grade type - Other."
			   											}
			   										});
			  		


				bindJoinEduDatepickers();// rebind for new elements

				$('.edu_join').on('keydown paste', function(e) {
				  e.preventDefault(); // block manual typing and pasting
				});				

			    $('body').tooltip({
					selector: '.newTooltip'
				});
	});
			
			$("[id ^= 'degreeDelete']").live("click", function()
        	{
        	   $(this).closest("tr").remove();            
        	});

		
		var academicFrmvalidator = $("#academicFrm").validate({		
        rules: {
        	specialization1: {
				required:true,
				maxlength:200
			},
        	college1: {
				required:true,
				maxlength:200
			},
            yl1: {
                required : true,
            },			
			percentage1: {
				required: true,
	            gradeNumberCheck: true,
	            gradeMaxCheck: true,
	            gradeMaxLength: true,
	            min: 0
			},
			percentage2: {
				required: true,
	            gradeNumberCheck: true,
	            gradeMaxCheck: true,
	            gradeMaxLength: true,
	            min: 0
			},
			percentage3: {
				required: true,
	            gradeNumberCheck: true,
	            gradeMaxCheck: true,
	            gradeMaxLength: true,
	            min: 0
			},			
        },
		errorPlacement: function (error, element) {
            
		    if($(element).hasClass("qual_score") || $(element).hasClass("qual_scale"))
			{
				$(element).closest(".qual_point_div").find(".score_error").html('');
				error.appendTo($(element).closest(".qual_point_div").find(".score_error"));
			}
			else
			{
				error.insertAfter(element);
			}
        },
        messages: {
        	specialization1: {
			required:"Required",
			maxlength:"Accept only 200 characters"
			},
        	college1: {
			required:"Required",
			maxlength:"Accept only 200 characters"
			},
			graduation_status: {
                required: "Required",
                
            },
			 yl1: {
                required: "Required",
                
            },
		percentage1: {
				required: "This field is required.",
            	gradeNumberCheck: "Please enter a valid number.",
            	gradeMaxCheck: "Value exceeds the allowed maximum.",
            	gradeMaxLength: "Only 20 charcters are allowed for grade type - Other.",
            	min: "Please enter a value greater than or equal to 0."
		    },
				percentage2: {
				required: "This field is required.",
            	gradeNumberCheck: "Please enter a valid number.",
            	gradeMaxCheck: "Value exceeds the allowed maximum.",
            	gradeMaxLength: "Only 20 charcters are allowed for grade type - Other.",
            	min: "Please enter a value greater than or equal to 0."
		    },
		percentage3: {
				required: "This field is required.",
            	gradeNumberCheck: "Please enter a valid number.",
            	gradeMaxCheck: "Value exceeds the allowed maximum.",
            	gradeMaxLength: "Only 20 charcters are allowed for grade type - Other.",
            	min: "Please enter a value greater than or equal to 0."
		    }		    
        },
        // Ajax form submition
        submitHandler: function(form) {

        	 $('#loadingmessage').show();                    
                $.ajax({
                    type: 'post',
                    url: js_site_base_url + 'ajax/ajaxQualifications.php',
                    data: $(form).serialize(),
					
                    success: function (response) {
					
						if($.trim(response)=='success'){
							location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=qua&mode=savesuccessqua";    							
						} 
						else {
							location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=qua&mode=savefailed";   							
						}             
                    }
                }); 
        }
    });
	jQuery.validator.addClassRules('qual_score', {
        required: true,check_cpi:true 
    });


jQuery.validator.addMethod("gradeNumberCheck", function(value, element) {
    const grade_type = $(element).closest('tr').find('.grade_type').val();
    if (grade_type === '1' || grade_type === '2') {
        return $.isNumeric(value);
    }
    return true; // allow non-numeric for type 3
}, "Please enter a valid number.");

jQuery.validator.addMethod("gradeMaxCheck", function(value, element) {
    const grade_type = $(element).closest('tr').find('.grade_type').val();
    const num = parseFloat(value);
    if (grade_type === '1') {
        return num <= 10;
    } else if (grade_type === '2') {
        return num <= 100;
    }
    return true;
}, function(params, element) {
    const grade_type = $(element).closest('tr').find('.grade_type').val();
    if (grade_type === '1') {
        return "Value must be 10 or less for Point-based System.";
    } else if (grade_type === '2') {
        return "Value must be 100 or less for Percentage System.";
    }
    return "";
});

jQuery.validator.addMethod("gradeMaxLength", function(value, element) {
    const grade_type = $(element).closest('tr').find('#grade_type1').val();
    if (grade_type === '3') {
        return value.length <= 20;
    } else {
        return value.length <= 10;
    }
}, "Input exceeds allowed character limit.");




		$(".facultyEdit").click(function(){     		
			var rowid = $(this).attr("rowid");  
			$('#facultySaveButton'+rowid).show();
			$('#facultyEditButton'+rowid).hide();
			$('#facultyDeleteButton'+rowid).hide();
			// span hide
			$("[id ^= 'facultyRowOne_"+rowid+"']").hide();
			$("[alt ^= 'facultyRowOne_input_"+rowid+"']").show();
		});
		
		$(".facultySave").click(function(){
		 
        var rowid = $(this).attr("rowid");
        var key = $(this).attr("rel");	
			   $("#degree"+key).rules("add", {required: true,maxlength:200, messages: {required: "Required",maxlength:"Accept only 200 characters"}});
       	       $("#specialization"+key).rules("add", {required: true,maxlength:200, messages: {required: "Required",maxlength:"Accept only 200 characters"}});
       	       $("#college"+key).rules("add", {required: true,maxlength:200, messages: {required: "Required",maxlength:"Accept only 200 characters"}});
       	       $("#yj"+key).rules("add", {required: true,messages: {required: "Required"}});
			   $("#yl"+key).rules("add", {required: true,messages: {required: "Required"}});
			   $("#grade_type"+key).rules("add", {required: true,messages: {required: "Required"}});
       	       $("#percentage"+key).rules("add", 
       	       									{	required: true,
       	       										gradeNumberCheck: true,
       	       										gradeMaxCheck: true,
       	       										gradeMaxLength: true,
       	       										messages: {
       	       											required: "This field is required.",
       	       											gradeNumberCheck: "Please enter a valid number.",
       	       											gradeMaxCheck: "Value exceeds the allowed maximum.",
       	       											gradeMaxLength: "Only 20 charcters are allowed for grade type - Other."
       	       										}
       	       									});
			   
			   

			   
			   form_valid= $('#academicFrm').valid();
			   if(!form_valid)
			   {
				   return false;
			   }
			   $('body').tooltip({
					selector: '.newTooltip'
				});	
				
		
			var degree = $(this).closest("tr").find('td input:eq(0)').val();		
			var specialization = $(this).closest("tr").find('td input:eq(1)').val();
			var college = $(this).closest("tr").find('td input:eq(2)').val();
			var university = $(this).closest("tr").find('td input:eq(3)').val();
			var joining_year = $(this).closest("tr").find('td input:eq(4)').val();
			var leaving_year = $(this).closest("tr").find('td input:eq(5)').val();
			var percentage = $(this).closest("tr").find('td input:eq(6)').val();
			var score = $(this).closest("tr").find('td input:eq(7)').val();
			var scale = $(this).closest("tr").find('td input:eq(8)').val();
			var other = $(this).closest("tr").find('td input:eq(9)').val();
			var grade_type = $(this).closest("tr").find('td select:eq(1)').val();
			var grade_type_text = $(this).closest("tr").find('td select:eq(1) option:selected').text();
			var graduation_status = $(this).closest("tr").find('td select:eq(0)').val();
			var graduation_status_text = $(this).closest("tr").find('td select:eq(0) option:selected').text();
		
		
			formData  = "nid=" + rowid + "&Degree=" + degree + "&Specialization=" + specialization +"&College=" + college +"&University=" + university + "&graduation_status=" + graduation_status +
				"&YJ=" + joining_year + "&YL=" + leaving_year + "&Percentage=" + percentage + "&form_type=faculty" +"&grade_type="+grade_type+"&score="+score+"&scale="+scale+"&other="+other;
				
					$.ajax({
					   type: 'post',
					   url: js_site_base_url + 'ajax/qualificationedit.php',                           
					   data: formData,
					   type: "POST",                           
					   success: function (response) {
						   if($.trim(response)=='success'){
							   
							   $("[alt = 'facultyRowOne_input_"+rowid+"']").hide();
							   $("#facultySaveButton"+rowid).hide();
							   $("#facultyEditButton"+rowid).show();         	  
							   $("#facultyDeleteButton"+rowid).show();
							}
					   }
				   }); 
			   var cpi_val = '';

			 
			 if(grade_type ==0)
			 {
				 cpi_val= '-'; 
			 }
			 else{
			 	cpi_val=percentage;
			 }
			 
			 if(grade_type_text == 'Please select'){
				grade_type_text = '-';
			 }
			$(this).closest("tr").find('td span:eq(0)').html(degree).show();
			$(this).closest("tr").find('td span:eq(1)').html(specialization).show();
			$(this).closest("tr").find('td span:eq(2)').html(college).show();
			$(this).closest("tr").find('td span:eq(3)').html(university).show();
			$(this).closest("tr").find('td span:eq(4)').html(graduation_status).show();
			$(this).closest("tr").find('td span:eq(5)').html(joining_year).show();
			$(this).closest("tr").find('td span:eq(6)').html(leaving_year).show();
			$(this).closest("tr").find('td span:eq(7)').html(grade_type_text).show();
			$(this).closest("tr").find('td span:eq(8)').html(cpi_val).show();
			
		
		});
		 
		
			// Ends here
			//Employment edit starts here
		$(".employmentEdit").click(function(){  
		
			var rowid = $(this).attr("rowid");   
			var key = $(this).attr("rel");	
			$("#duration"+key).attr('readonly', true);
			$('#employmentSaveButton'+rowid).show();
			$('#employmentEditButton'+rowid).hide();
			$('#employmentDeleteButton'+rowid).hide();
			// span hide
			$("[id ^= 'employmentRowOne_"+rowid+"']").hide();
			
			$("input[alt ^= 'employmentRowOne_input_"+rowid+"']").show();
			$("select[alt^='employmentRowOne_input_" + rowid + "']").show();

			// Fetch the value of the selected option from the dropdown with alt="dropdown1"
			var selectedValue = $("#designation"+key).val();			
			console.log(selectedValue); // Output: "2"
			if(selectedValue == 'Other'){
				$('#designation_other'+key).show();
			}

		  	$("#designation"+rowid).rules("add", {maxlength:50,required:true, messages: {required:'Required',maxlength:"Accept up to 50 characters only."}});
			$("#organization"+rowid).rules("add", {maxlength:50,required:true, messages: {required:'Required',maxlength:"Accept up to 50 characters only."}});     	        				
			$("#eyj"+rowid).rules("add", {minlength:4,required:true, messages: {required:'Required',minlength:"Minimum 4 characters"}});
			$("#eyl"+rowid).rules("add", {minlength:4,required:true, messages: {required:'Required',minlength:"Minimum 4 characters"}});       	        				
			$("#place"+rowid).rules("add", {maxlength:50,required:true, messages: {required:'Required',maxlength:"Accept up to 50 characters only."}});
		});
		
		$(".employmentSave").click(function(){

	        var rowid = $(this).attr("rowid");		
		    var key = $(this).attr("rel");
			$("#designation"+key).rules("add", {required:true, messages: {required:'Required'}});
			$("#organization"+key).rules("add", {maxlength:50, messages: {required:'Required',maxlength:"Accept only 50 characters"}});     	        				
			$("#eyj"+key).rules("add", {minlength:4,required:true, messages: {required:'Required',minlength:"Minimum 4 characters"}});
			$("#duration"+key).rules("add", {maxlength:50,required:true, messages: {required:'Required',maxlength:"Accept only 50 characters"}});       	        				
			$("#place"+key).rules("add", {maxlength:50,required:true, messages: {required:'Required',maxlength:"Accept only 50 characters"}});
		    
			if(!$("#tab3_data").valid()){
				return false;
			}
		
			var designation = $('#designation'+key).val();
			if(designation == 'Other'){
				designation = $('#designation_other'+key).val();
			}
			var organization 	= $('#organization'+key).val();
			var joining_year 	= $('#eyj'+key).val();
			var leaving_year 	= $('#eyl'+key).val();
			var duration 		= $('#duration'+key).val();
			var place 			= $('#place'+key).val();
			var salary 			= $('#salary'+key).val();

			formData  = "nid=" + rowid + "&Designation=" + designation + "&Organization=" + organization +"&YJ=" + joining_year +
			"&YL=" + leaving_year + "&Duration=" + duration + "&Place=" + place + "&Salary=" + salary + "&form_type=employment";	

       		$.ajax({
       			type: 'post',
				url: js_site_base_url + 'ajax/employmentedit.php',                           
				data: formData,
				type: "POST",                           
				success: function (response) {
					if($.trim(response)=='failed'){
						alert('Data not saved. One or more information provided is either blank or invalid. Please try again.!');
					}
					else{
					   $("input[alt = 'employmentRowOne_input_"+rowid+"']").hide();
					   $("select[alt^='employmentRowOne_input_" + rowid + "']").hide();
					   $("#employmentRowOne_label_"+rowid).hide();
					   $('#designation_other'+key).hide();
					   $("#employmentSaveButton"+rowid).hide();
					   $("#employmentEditButton"+rowid).show();  
					   $('#employmentDeleteButton'+rowid).show();
					}
				}
			}); 
			$(this).closest("tr").find('td span:eq(0)').html(designation).show();
			$(this).closest("tr").find('td span:eq(1)').html(organization).show();
			$(this).closest("tr").find('td span:eq(2)').html(joining_year).show();
			$(this).closest("tr").find('td span:eq(3)').html(leaving_year).show();
			$(this).closest("tr").find('td span:eq(4)').html(duration).show();
			$(this).closest("tr").find('td span:eq(5)').html(place).show();
			$(this).closest("tr").find('td span:eq(6)').html(salary).show();
		});

		// Ends here
			
			//Publication Tab
			$("#publication").validate({
				ignore: ":hidden:not(textarea)",
				// Rules for form validation
    			rules : {
        			doi_url1 : {
						required : true,
						maxlength: 1000
					},    				
        			pub_title1 : {
						required : true,
						maxlength: 1000
					},
    				pub_authors1 : {
    					required : true,
    					maxlength: 1000    					
    				},
    				jc1 : {
    					required : true,
    					maxlength: 1000
    				},
    				doa1 : {
    					required : true
    				},
					c1 : {
    		        	required : true
    		        }
    			},

    			// Messages for form validation
    			messages : {
					doi_url1 : {
    					required : 'Required',
    					maxlength: 'Max. 1000 Characters are allowed.'
    				},    				
					pub_title1 : {
    					required : 'Required',
    					maxlength: 'Max. 1000 Characters are allowed.'
    				},
    				pub_authors1 : {
    					required : 'Required',
    					maxlength: 'Max. 1000 Characters are allowed.'
    				},
    				jc1 : {
    					required : 'Required',
    					maxlength: 'Max. 1000 Characters are allowed.'
    				},
    				doa1 : {
    		        	required : 'Required'
    		        },
					c1 : {
    		        	required : 'Required'
    		        }
    			},
    		
    			// Ajax form submition
    			submitHandler: function(form, event) {	    	
					
				 event.preventDefault();
				 var formData = new FormData(document.forms.namedItem("publication"));
					$.ajax({						
						type: 'POST',
						url: js_site_base_url + 'ajax/ajaxSavePublication.php',
						//data: $(form).serialize(),
						data: formData,
						async: false,
						cache: false,
						contentType: false,
						processData: false,
						success: function (response) {
							if($.trim(response)=='success'){
								location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=publication&mode=savesuccesspub";
							} 
							else {
								location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=publication&mode=savefailedpub";   							
							}
						}
					});	
    			},

    			// Do not change code below
    			errorElement: "span", 
    			errorPlacement : function(error, element) {
    				//error.insertAfter(element.parent());
    				error.insertAfter(element);							
    			}
    		});
		// Re-validate dynamically added fields
    	$("#publication").on("change", "input, textarea, select", function () {
        		$(this).valid(); // Re-validate the field
    	});	   	    		



		//Other Publication Tab
			$("#other_publication").validate({
				ignore: ":hidden:not(textarea)",
				// Rules for form validation
    			rules : {
        			other_pub_title1 : {
        				required : true,
        				maxlength: 500
					},
    				other_pub_authors1 : {
    					required : true,
        				maxlength: 500
    				},
    				other_jc1 : {
    					required : true,
        				maxlength: 500
    				},
    				other_doa1 : {
    					required : true
    				},
					other_c1 : {
    		        	required : true
    		        }
    			},

    			// Messages for form validation
    			messages : {		
					other_pub_title1 : {
    					required : 'Required',
        				maxlength: "Max. 500 Characters are allowed."
    				},
    				other_pub_authors1 : {
    					required : 'Required',
        				maxlength: "Max. 500 Characters are allowed."
    				},
    				other_jc1 : {
    					required : 'Required',
        				maxlength: "Max. 500 Characters are allowed."
    				},
    				other_doa1 : {
    		        	required : 'Required'
    		        },
					other_c1 : {
    		        	required : 'Required'
    		        }
    			},
    		
    			// Ajax form submition
    			submitHandler: function(form, event) {	    	
					
				 event.preventDefault();
				 var formData = new FormData(document.forms.namedItem("other_publication"));
    					$.ajax({						
    						type: 'POST',
    						url: js_site_base_url + 'ajax/ajaxSaveOtherPublication.php',
    						//data: $(form).serialize(),
							data: formData,
							async: false,
							cache: false,
							contentType: false,
							processData: false,
    						success: function (response) {
								if($.trim(response)=='success'){
									location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=other_publication&mode=savesuccessotherpub";    							
								} else {
									location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=other_publication&mode=savefailedotherpub";   							
								}
    						}
    					});	
    			},

    			// Do not change code below
    			errorElement: "span", 
    			errorPlacement : function(error, element) {
    				//error.insertAfter(element.parent());
    				error.insertAfter(element);							
    			}
    		});
		// Re-validate dynamically added fields
    	$("#other_publication").on("change", "input, textarea, select", function () {
        		$(this).valid(); // Re-validate the field
    	});




    	//Conference (Without DOI) Tab ----------- START --------
		$("#conference").validate({
				ignore: ":hidden:not(textarea)",
				// Rules for form validation
    			rules : { 				
        			confpub_title1 : {
        				required : true,
        				maxlength:500
					},
    				conf_authors1 : {
    					required : true,
        				maxlength:500
    				},
    				conf_name1 : {
    					required : true,
        				maxlength:500
    				},
    				conf_yoa1 : {
    					required : true
    				},
					conf_c1 : {
    		        	required : true
    		        },
    		        conf_q1 : {
    		        	required : true
    		        }
    			},

    			// Messages for form validation
    			messages : {			
					confpub_title1 : {
    					required : 'Required',
    					maxlength: 'Max. 500 Characters are allowed.'
    				},
    				conf_authors1 : {
    					required : 'Required',
    					maxlength: 'Max. 500 Characters are allowed.'
    				},
    				conf_name1 : {
    					required : 'Required',
    					maxlength: 'Max. 500 Characters are allowed.'
    				},
    				conf_yoa1 : {
    		        	required : 'Required'
    		        },
					conf_c1 : {
    		        	required : 'Required'
    		        },
					conf_q1 : {
    		        	required : 'Required'
    		        }    		        
    			},
    		
    			// Ajax form submition
    			submitHandler: function(form, event) {	    	
					
				 event.preventDefault();
				 var formData = new FormData(document.forms.namedItem("conference"));
    					$.ajax({						
    						type: 'POST',
    						url: js_site_base_url + 'ajax/ajaxSaveConference.php',
    						//data: $(form).serialize(),
							data: formData,
							async: false,
							cache: false,
							contentType: false,
							processData: false,
    						success: function (response) {
							if($.trim(response)=='success'){
								location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=conference&mode=savesuccessconf";    							
								} else {
								location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=conference&mode=savefailedconf";   							
								}
    						}
    					});	
    			},

    			// Do not change code below
    			errorElement: "span", 
    			errorPlacement : function(error, element) {
    				//error.insertAfter(element.parent());
    				error.insertAfter(element);							
    			}
    		});

		// Re-validate dynamically added fields
    	$("#conference").on("change", "input, textarea, select", function () {
        		$(this).valid(); // Re-validate the field
    	});    	
	//Conference (Without DOI)  Tab ----------- END --------    	


	//Conference (With DOI) Tab ----------- START --------
		$("#doi_conference").validate({
				ignore: ":hidden:not(textarea)",
				// Rules for form validation
    			rules : { 				
					doi_conf_url1 : {
						required : true,
						maxlength: 500
					},    				
        			doi_confpub_title1 : {
						required : true,
						maxlength: 500
					},
    				doi_conf_authors1 : {
    					required : true,
    					maxlength: 500
    				},
    				doi_conf_name1 : {
    					required : true,
    					maxlength: 500
    				},
    				doi_conf_yoa1 : {
    					required : true
    				},
					doi_conf_c1 : {
    		        	required : true
    		        },
    		        doi_conf_q1 : {
    		        	required : true
    		        }
    			},

    			// Messages for form validation
    			messages : {		
					doi_conf_url1 : {
						required : 'Required',
    					maxlength: 'Max. 500 Characters are allowed.'
					},    				    				
					doi_confpub_title1 : {
    					required : 'Required',
    					maxlength: 'Max. 500 Characters are allowed.'
    				},
    				doi_conf_authors1 : {
    					required : 'Required',
    					maxlength: 'Max. 500 Characters are allowed.'
    				},
    				doi_conf_name1 : {
    					required : 'Required',
    					maxlength: 'Max. 500 Characters are allowed.'
    				},
    				doi_conf_yoa1 : {
    		        	required : 'Required'
    		        },
					doi_conf_c1 : {
    		        	required : 'Required'
    		        },
					doi_conf_q1 : {
    		        	required : 'Required'
    		        }    		        
    			},
    		
    			// Ajax form submition
    			submitHandler: function(form, event) {	    	
					
				 event.preventDefault();
				 var formData = new FormData(document.forms.namedItem("doi_conference"));
    					$.ajax({						
    						type: 'POST',
    						url: js_site_base_url + 'ajax/ajaxSaveDOIConference.php',
    						//data: $(form).serialize(),
							data: formData,
							async: false,
							cache: false,
							contentType: false,
							processData: false,
    						success: function (response) {
							if($.trim(response)=='success'){
								location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=doi_conference&mode=savesuccessdoi_conf";    							
								} else {
								location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=doi_conference&mode=savefaileddoi_conf";   							
								}
    						}
    					});	
    			},

    			// Do not change code below
    			errorElement: "span", 
    			errorPlacement : function(error, element) {
    				//error.insertAfter(element.parent());
    				error.insertAfter(element);							
    			}
    		});

		// Re-validate dynamically added fields
    	$("#doi_conference").on("change", "input, textarea, select", function () {
        		$(this).valid(); // Re-validate the field
    	});    	
	//Conference (With DOI)  Tab ----------- END --------    




			//Patents and IP Tab --------START---------------
			$("#patent").validate({
				ignore: ":hidden:not(textarea)",
    			// Rules for form validation
    			rules : {
        			pat_title1 : {
						required : true,
						maxlength: 500
					},
    				pat_authors1 : {
    					required : true,
    					maxlength: 500
    				},
    				pat_c1 : {
    					required : true
    				},
    				pat_type1 : {
    					required : true
    				},
					pat_dof1 : {
    		        	required : true
    		        },
    		        pat_country1 : {
    		        	required : true
    		        }
    			},
    			// Messages for form validation
    			messages : {
					pat_title1 : {
    					required : 'Required',
    					maxlength: 'Max. 500 Characters are allowed.'
    				},
    				pat_authors1 : {
    					required : 'Required',
    					maxlength: 'Max. 500 Characters are allowed.'
    				},
    				pat_c1 : {
    					required : 'Required'
    				},
    				pat_type1 : {
    		        	required : 'Required'
    		        },
					pat_dof1 : {
    		        	required : 'Required'
    		        },
    		        pat_country1:{
    		        	required : 'Required'
    		        }
    			},
    			// Ajax form submition
    			submitHandler: function(form, event) {
				event.preventDefault();
				var formData = new FormData(document.forms.namedItem("patent"));
					$.ajax({						
						type: 'POST',
						url: js_site_base_url + 'ajax/ajaxSavePatent.php',
						//data: $(form).serialize(),
						data: formData,
						async: false,
						cache: false,
						contentType: false,
						processData: false,
						success: function (response) {
						if($.trim(response)=='success'){
							location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=patent&mode=savesuccesspat";    							
							} else {
							location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=patent&mode=savefailedpat";   							
							}
						}
					});	
    			},
    			// Do not change code below
    			errorElement: "span", 
    			errorPlacement : function(error, element) {
    				//error.insertAfter(element.parent());
    				error.insertAfter(element);							
    			}
    		});
			//Patents and IP Tab --------END---------------




			//Books Tab --------START---------------
			$("#book").validate({
				ignore: ":hidden:not(textarea)",
    			// Rules for form validation
    			rules : {
        			book_title1 : {
						required : true,
						maxlength: 500
					},
    				book_authors1 : {
    					required : true,
    					maxlength: 500
    				},
    				book_c1 : {
    					required : true
    				},
    		        book_fbc1 : {
    		        	required : true
    		        },
					book_dop1 : {
    		        	required : true
    		        }    		        
    			},
    			// Messages for form validation
    			messages : {
					book_title1 : {
    					required : 'Required',
    					maxlength: 'Max. 500 Characters are allowed.'
    				},
    				book_authors1 : {
    					required : 'Required',
    					maxlength: 'Max. 500 Characters are allowed.'
    				},
    				book_c1 : {
    					required : 'Required'
    				},
    				book_fbc1 : {
    		        	required : 'Required'
    		        },
					book_dop1 : {
    		        	required : 'Required'
    		        }
    			},
    			// Ajax form submition
    			submitHandler: function(form, event) {
				event.preventDefault();
				var formData = new FormData(document.forms.namedItem("book"));
					$.ajax({						
						type: 'POST',
						url: js_site_base_url + 'ajax/ajaxSaveBook.php',
						//data: $(form).serialize(),
						data: formData,
						async: false,
						cache: false,
						contentType: false,
						processData: false,
						success: function (response) {
						if($.trim(response)=='success'){
							location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=book&mode=savesuccessbook";    							
							} else {
							location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=book&mode=savefailedbook";
							}
						}
					});	
    			},
    			// Do not change code below
    			errorElement: "span", 
    			errorPlacement : function(error, element) {
    				//error.insertAfter(element.parent());
    				error.insertAfter(element);							
    			}
    		});
			//Books Tab --------END---------------			




			//Research Grants
			$("#research_grants").validate({
    			// Rules for form validation
				ignore: ":hidden:not(textarea)",
    			rules : {
					research_sanction : {
						
						required: {
							depends: function(element) { 
								 if($('#exp_not_applicable').is(':checked')){
									return false;
								 } else {
									 return true;
								 } 
							}
						},
						number:true,
						
    				},
					research_submitted : {
    					required: {
							depends: function(element) { 
								 if($('#exp_not_applicable').is(':checked')){
									return false;
								 } else {
									 return true;
								 } 
							}
						},
						number:true,
    				},
					Rsanction_text :{
						required: {
							depends: function(element) { 
								 if($('#exp_not_applicable').is(':checked')){
									return false;
								 } else {
									 return true;
								 } 
							}
						},
						wordCount: ['300']
					}  
    			},

    			// Messages for form validation
    			
    			messages : {
					research_sanction : {
    					required :'Required'
    				},
					research_submitted : {
    					required :'Required'
    				},					
    			},
    		
    			// Ajax form submition
    			submitHandler: function(form, event) {
        		
				 event.preventDefault();
				 var formData = new FormData(document.forms.namedItem("research_grants"));
    					$.ajax({						
    						type: 'POST',
    						url: js_site_base_url + 'ajax/ajaxSaveResearchGrants.php',
    						//data: $(form).serialize(),
							data: formData,
							async: false,
							cache: false,
							contentType: false,
							processData: false,
    						success: function (response) {

								if($.trim(response)=='success'){
    							location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=research_grants&mode=savesuccess";
								}
								else 
								{
									if($.trim(response)=='failed'){
										location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=research_grants&mode=savefailed";
									}

									if($.trim(response)=='research_grantserror'){
									location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=research_grants&mode=reerror";
									}
									if($.trim(response)=='research_grantspass'){
									location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=research_grants&mode=repass";
									}
								}
    						}
    					});	
    			},

    			// Do not change code below
    			errorElement: "span", 
    			errorPlacement : function(error, element) {
    				//error.insertAfter(element.parent());
    				error.insertAfter(element);							
    			}
    		});
			

			// Function to display messages in different colors
			function showMessage(message, type, blockname) {
			    var color = type === "success" ? "green" : type === "error" ? "red" : "blue";
			    if(type == "success"){
			    	var responseElement = $("#successresponse_" + blockname);
			    	responseElement.empty(); // Clear previous message
			    	if(message.includes("View Uploaded File"))
			    		responseElement.append($('<p>').html(message));
			    }
			    if(message.includes("View Uploaded File")){
					var message_success = "File uploaded successfully";
			    }
			    else{
			    	var message_success = message;
			    }
			    var responseElement1 = $("#response_" + blockname);
			    responseElement1.empty(); // Clear previous message
			    responseElement1.append($('<p>').css("color", color).html(message_success));
			}


			//Research Tab
			$("#research").on("submit", function (e) {
			
			 	event.preventDefault();

				var fileInput = $("#researchfile")[0];
        		var file = fileInput.files[0];

		        // Validation
		        if (!file) {
		            showMessage("Please select a file!", "error","research");
		            return;
		        }

		        var allowedTypes = ["application/pdf"];
		        var maxSize = 1 * 1024 * 1024; // 2MB

		        if (!allowedTypes.includes(file.type)) {
		            showMessage("Only PDF file is allowed!", "error","research");
		            return;
		        }

		        if (file.size > maxSize) {
		            showMessage("File size must be less than 1MB!", "error","research");
		            return;
		        }

        		// Upload via AJAX
			 	var formData = new FormData(document.forms.namedItem("research"));
				$.ajax({						
				    type: 'POST',
				    url: js_site_base_url + 'ajax/ajaxSaveResearch.php',
				    data: formData,
				    async: false,
				    cache: false,
				    contentType: false,
				    processData: false,
				    beforeSend: function () {
				        showMessage("Uploading...", "info", "research");
				    },					
				    success: function (response) {
				        if (response.includes("View Uploaded File")) {
				            checkAllRequiredSections(js_aid, is_iitgn_emp_flg);
				            $('#resResetBtn').hide();
				            // Clear file input field
				            document.getElementById("researchfile").value = "";
				            // ✅ Clear or replace the message
				            showMessage(response, "success", "research");
				        } else {
				            showMessage(response, "error", "research");
				        }
				    },
				    error: function () {
				        // ✅ Clear the "Uploading..." message in case of an error
				        showMessage("Error uploading file!", "error", "research");
				    }
				});
			});

			$(document).on("click", ".delete-icon", function () {
			    var fileName = $(this).data("filename");

    			// Show confirmation dialog
    			var confirmDelete = confirm("Are you sure you want to delete this file?");

				if (confirmDelete) {
				    $.ajax({
				        url: "ajax/ajaxdeletefile.php",
				        type: "POST",
				        data: { filename: fileName, fieldtype:"research" },
				        success: function (response) {
				            showMessage(response, "success","research");
							$('#resResetBtn').show();
							$(".delete-icon[data-filename='" + fileName + "']").parent().remove();
							//$('#researchfile').filestyle('destroy');
							$('#researchfile').val(null);
							$('#researchfile').filestyle('clear');
							//$('#researchfile').filestyle(); // reinitialize plugin							
							//document.getElementById('researchfile').value = '';
							//clearFileInput();
				            checkAllRequiredSections(js_aid,is_iitgn_emp_flg);
				        },
				        error: function () {
				            showMessage("Error deleting file!", "error","research");
				        }
				    });
				}
			});


function clearFileInput() {
    var input = document.getElementById('researchfile');

    // If the element doesn't exist yet (e.g., due to AJAX replacement)
    if (!input) return;

    // Try clearing normally first
    input.value = null;

    // If value persists, replace with a clone
    if (input.value) {  
        var newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
    }

    // Optional: re-bind events if AJAX removed input listeners
    // Example:
    // newInput.addEventListener('change', myFileUploadHandler);
}



			//Teaching Tab
			$("#teaching").on("submit", function (e) {
			
			 	event.preventDefault();

				var fileInput = $("#teachingfile")[0];
        		var file = fileInput.files[0];

		        // Validation
		        if (!file) {
		            showMessage("Please select a file!", "error","teaching");
		            return;
		        }

		        var allowedTypes = ["application/pdf"];
		        var maxSize = 1 * 1024 * 1024; // 1MB

		        if (!allowedTypes.includes(file.type)) {
		            showMessage("Only PDF file is allowed!", "error","teaching");
		            return;
		        }

		        if (file.size > maxSize) {
		            showMessage("File size must be less than 1MB!", "error","teaching");
		            return;
		        }

        		// Upload via AJAX
			 	var formData = new FormData(document.forms.namedItem("teaching"));
				$.ajax({						
					type: 'POST',
					url: js_site_base_url + 'ajax/ajaxSaveTeaching.php',
					data: formData,
					async: false,
					cache: false,
					contentType: false,
					processData: false,
					beforeSend: function () {
                		showMessage("Uploading...", "info");
            		},
				    success: function (response) {
				        if (response.includes("View Uploaded File")) {
				            checkAllRequiredSections(js_aid, is_iitgn_emp_flg);
				            $('#teachingResetBtn3').hide();
				            // Clear file input field
				            document.getElementById("teachingfile").value = "";
				            //  Clear or replace the message
				            showMessage(response, "success", "teaching");
				        } else {
				            showMessage(response, "error", "teaching");
				        }
				    },
				    error: function () {
				        //  Clear the "Uploading..." message in case of an error
				        showMessage("Error uploading file!", "error", "teaching");
				    }
				});	
			});		

			$(document).on("click", ".delete-icon-teaching", function () {
			    var fileName = $(this).data("filename");

    			// Show confirmation dialog
    			var confirmDelete = confirm("Are you sure you want to delete this file?");

    			if (confirmDelete) {
				    $.ajax({
				        url: "ajax/ajaxdeletefile.php",
				        type: "POST",
				        data: { filename: fileName, fieldtype:"teaching" },
				        success: function (response) {
				            showMessage(response, "success","teaching");
							$('#teachingfile').val(null);
							$('#teachingfile').filestyle('clear');				            
							$('#teachingResetBtn3').show();			            
				            $(".delete-icon-teaching[data-filename='" + fileName + "']").parent().remove();
				            checkAllRequiredSections(js_aid,is_iitgn_emp_flg);
				        },
				        error: function () {
				            showMessage("Error deleting file!", "error","teaching");
				        }
				    });
				}
			});				




			
			// Indicate any special work done towards developing new course or laboratories
			$("#laboratories").validate({
			ignore: ":hidden:not(textarea)",
			rules : {        			
    				extralab : {    					
						wordCount: ['50']
												
    				}
    				
    			},
    			// Ajax form submition
    			submitHandler: function(form, event) {
        			
				 event.preventDefault();
				 var formData = new FormData(document.forms.namedItem("laboratories"));
    					$.ajax({						
    						type: 'POST',
    						url: js_site_base_url + 'ajax/ajaxsaveextracourse.php',
    						//data: $(form).serialize(),
							data: formData,
							async: false,
							cache: false,
							contentType: false,
							processData: false,
    						success: function (response) {							
							location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=thesislab&mode=exsavesuccess";    							
    						}
    					});	
    			},

    			// Do not change code below
    			errorElement: "span", 
    			errorPlacement : function(error, element) {
    				//error.insertAfter(element.parent());
    				error.insertAfter(element);							
    			}
    		});
			// Ends here
			//whyiitgn
					$("#whyiitgn").validate({
						ignore: ":hidden:not(textarea)",
    			// Rules for form validation
    			rules : {
        			
    				whyiitgnq : {
    					required : true,
						wordCount: ['350']
						
    				}  				
    		        
    			},

    			// Messages for form validation
    			messages : {				
					whyiitgnq : {
    					required : 'Required'
						
    				}    			
    			},
    		
    			// Ajax form submition
    			submitHandler: function(form, event) {
        			
				 event.preventDefault();
				 var formData = new FormData(document.forms.namedItem("whyiitgn"));
    					$.ajax({						
    						type: 'POST',
    						url: js_site_base_url + 'ajax/ajaxSavewhyiitgn.php',
    						//data: $(form).serialize(),
							data: formData,
							async: false,
							cache: false,
							contentType: false,
							processData: false,
    						success: function (response) {	
							if($.trim(response)=='success'){
							location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=wiitgn&mode=savesuccess";    							
							 } else {
							 location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=wiitgn&mode=savefailed";    							
							 }
    						}
    					});	
    			},

    			// Do not change code below
    			errorElement: "span", 
    			errorPlacement : function(error, element) {
    				//error.insertAfter(element.parent());
    				error.insertAfter(element);							
    			}
    		});
			
			//referees
					$("#referees").validate({

    			// Rules for form validation
    			rules : { 
						R1Title : 
						{
							required : true,
						},
						R2Title : 
						{
							required : true,
						},
						R3Title : 
						{
							required : true,
						},
    				R1Name : {
    					required : true,
						lettersonly:true,
						maxlength:50
							 },
					R2Name : {
    					required : true,
						lettersonly:true,
						maxlength:50
							 },
					R3Name : {
    					required : true,
						lettersonly:true,
						maxlength:50
							 },
					R1Designation : {
    					required : true,
						maxlength:50
							 },
					R2Designation : {
    					required : true,
						maxlength:50
							 },
					R3Designation : {
    					required : true,
						maxlength:50
							 },
					R1Organization : {
    					required : true,
						maxlength:100
							 },
					R2Organization : {
    					required : true,
						maxlength:100
							 },
					R3Organization : {
    					required : true,
						maxlength:100
							 },
					R1TelephoneCountryCode : {
    					required : true
							 },
					R2TelephoneCountryCode : {
    					required : true
							 },
					R3TelephoneCountryCode : {
    					required : true
							 },							 
					R1Telephone : {
    					required : true,
						phoneno : true,
						maxlength:50,
						//number : true,
						notEqualph :['#R1Telephone'],
						notEqualToph: ['#R2Telephone', '#R3Telephone', '#R4Telephone']
							 },
					R2Telephone : {
    					required : true,
						//number : true,
						phoneno : true,
						maxlength:50,
						notEqualph :['#R2Telephone'],
						notEqualToph: ['#R1Telephone', '#R3Telephone', '#R4Telephone']
							 },
					R3Telephone : {
    					required : true,
						//number : true,
						phoneno : true,
						maxlength:50,
						notEqualph :['#R3Telephone'],
						notEqualToph: ['#R1Telephone', '#R2Telephone', '#R4Telephone']
							 },
					R1Alternate : {
    					phoneno : true,
						//number : true,
						maxlength:50,
						notEqualph :['#R1Alternate'],
						notEqualToph: ['#R2Alternate', '#R3Alternate', '#R4Alternate']
							 },
					R2Alternate : {
    					phoneno : true,
						//number : true,
						maxlength:50,
						notEqualph :['#R2Alternate'],
						notEqualToph: ['#R1Alternate', '#R3Alternate', '#R4Alternate']
							 },		 
					R3Alternate : {
    					phoneno : true,
						//number : true,
						maxlength:50,
						notEqualph :['#R3Alternate'],
						notEqualToph: ['#R1Alternate', '#R2Alternate', '#R4Alternate']
							 },
					R1Email : {
    					required : true,
						email : true,
						maxlength:50,
						notEqual :js_session_email,
						notEqualTo: ['#R2Email', '#R3Email', '#R4Email']
							 },
					R2Email : {
    					required : true,
						email : true,
						maxlength:50,
						notEqual :js_session_email,
						notEqualTo: ['#R1Email', '#R3Email', '#R4Email']
							 },
					R3Email : {
					
    					required : true,
						email : true,
						maxlength:50,
						notEqual :js_session_email,
						notEqualTo: ['#R2Email', '#R1Email', '#R4Email']
							 },
					R1In : {
    					required : true,
						lettersnumonly:true,
						maxlength:50
							 },
					R2In : {
    					required : true,
						lettersnumonly:true,
						maxlength:50
							 },
					R3In : {
							required : true,
							lettersnumonly:true,
							maxlength:50						
							 }
    			},

    			// Messages for form validation
    			messages : {
						R1Title : 
						{
							required : 'Required',
						},
						R2Title : 
						{
							required : 'Required',
						},
						R3Title : 
						{
							required : 'Required',
						},
					R1Name : {
    					required : 'Required',
						maxlength:"Accept up to 50 characters only."
							 },
					R2Name : {
    					required : 'Required',
						maxlength:"Accept up to 50 characters only."
							 },
					R3Name : {
    					required : 'Required',
						maxlength:"Accept up to 50 characters only."
							 },
					R1Designation : {
    					required : 'Required',
						maxlength:"Accept up to 50 characters only."
							 },
					R2Designation : {
    					required : 'Required',
						maxlength:"Accept up to 50 characters only."
							 },
					R3Designation : {
    					required : 'Required',
						maxlength:"Accept up to 50 characters only."
							 },
					R1Organization : {
    					required : 'Required',
						maxlength:"Accept up to 100 characters only."
							 },
					R2Organization : {
    					required : 'Required',
						maxlength:"Accept up to 100 characters only."
							 },
					R3Organization : {
    					required : 'Required',
						maxlength:"Accept up to 100 characters only."
							 },
					R1TelephoneCountryCode : {
    					required : 'Required'
							 },
					R2TelephoneCountryCode : {
    					required : 'Required'
							 },
					R3TelephoneCountryCode : {
    					required : 'Required'
							 },
					R1Telephone : {
    					required : 'Required',
						maxlength:"Accept up to 50 digits only.",
						notEqualToph: 'Please specify a different Number',
						notEqualToph: 'Please specify a different Number',
						notEqualToph: 'Please specify a different Number'
							 },
					R2Telephone : {
    					required : 'Required',
						maxlength:"Accept up to 50 digits only.",
						notEqualToph: 'Please specify a different Number',
						notEqualToph: 'Please specify a different Number',
						notEqualToph: 'Please specify a different Number'
							 },
					R3Telephone : {
    					required : 'Required',
						maxlength:"Accept up to 50 digits only.",
						notEqualToph: 'Please specify a different Number',
						notEqualToph: 'Please specify a different Number',
						notEqualToph: 'Please specify a different Number'
							 },
				R1Alternate : { 
						maxlength:"Accept up to 50 digits only.",				
						notEqualToph: 'Please specify a different Number',
						notEqualToph: 'Please specify a different Number',
						notEqualToph: 'Please specify a different Number'
							 },
				R2Alternate : {
						maxlength:"Accept up to 50 digits only.",		
						notEqualToph: 'Please specify a different Number',
						notEqualToph: 'Please specify a different Number',
						notEqualToph: 'Please specify a different Number'
							 },
				R3Alternate : {
						maxlength:"Accept up to 50 digits only.",		
						notEqualToph: 'Please specify a different Number',
						notEqualToph: 'Please specify a different Number',
						notEqualToph: 'Please specify a different Number'
							 },
					R1Email : {
    					required : 'Required',
						maxlength:"Accept up to 50 characters only.",
						email : 'Enter Valid Email',
						notEqualTo: 'Please specify a different email id',
						notEqualTo: 'Please specify a different email id',
						notEqualTo: 'Please specify a different email id'
							 },
					R2Email : {
    					required : 'Required',
						maxlength:"Accept up to 50 characters only.",
						email : 'Enter Valid Email',
						notEqualTo: 'Please specify a different email id',
						notEqualTo: 'Please specify a different email id',
						notEqualTo: 'Please specify a different email id'
							 },
					R3Email : {
    					required : 'Required',
						maxlength:"Accept up to 50 characters only.",
						email : 'Please enter valid email',
						notEqualTo: 'Please specify a different email id',
						notEqualTo: 'Please specify a different email id',
						notEqualTo: 'Please specify a different email id'
							 },
					R1In : {
    					required : 'Required',
						maxlength:"Accept up to 50 characters only.",
						lettersnumonly:"Accept only characters and numbers."
							 },
					R2In : {
    					required : 'Required',
						maxlength:"Accept up to 50 characters only.",
						lettersnumonly:"Accept only characters and numbers."
							 },
					R3In : {
    					required : 'Required',
						maxlength:"Accept up to 50 characters only.",
						lettersnumonly:"Accept only characters and numbers."					
							 }
    			},
    		
    			// Ajax form submition
    			submitHandler: function(form, event) {
        			
				 event.preventDefault();
				 var formData = new FormData(document.forms.namedItem("referees"));
    					$.ajax({						
    						type: 'POST',
    						url: js_site_base_url + 'ajax/ajaxSaveReferees.php',
    						//data: $(form).serialize(),
							data: formData,
							async: false,
							cache: false,
							contentType: false,
							processData: false,
    						success: function (response) {						
							if($.trim(response)=='success'){
								location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=referee&mode=savesuccess";
							} else {
								location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=referee&mode=savefailed";
    						}
    						}
    					});	
    			},

    			// Do not change code below
    			errorElement: "span", 
    			errorPlacement : function(error, element) {
    				//error.insertAfter(element.parent());
    				error.insertAfter(element);							
    			}
    		});
			
			
			//Save Qualifications
					$("#tab2_data_education").validate({

    			// Rules for form validation
    			rules : {
        			
    				Degree : {
    					required : true
						},  
					Specialization : {
    					required : true
						},  
					College : {
    					required : true
						}, 	
					YJ : {
    					required : true,
						
						}, 
					YL : {
    					required : true,
						}
    			},

    			// Messages for form validation
    			messages : {
				
					Degree : {
    					required : 'Required'
						},  
					Specialization : {
    					required : 'Required'
						},  
					College : {
    					required : 'Required'
						}, 	
					YJ : {
    					required : 'Required',
						
						}, 
					YL : {
    					required : 'Required',
						
						}
    			},
    		
    			// Ajax form submition
    			submitHandler: function(form, event) {
        			
				 event.preventDefault();
				 var formData = new FormData(document.forms.namedItem("tab2_data_education"));
    			},

    			// Do not change code below
    			errorElement: "span", 
    			errorPlacement : function(error, element) {
    				//error.insertAfter(element.parent());
    				error.insertAfter(element);							
    			}
    		});
			
			
			//Save Tab2
			$("#tab2_data").validate({
    			// Rules for form validation
    			rules : {
					optradio:{
						required : true,
					},
						phdyear : {
							required : true
						},
						phdsupervisor:{
							required : true,
							maxlength:200
						},
						phdthesis:{	
							required : true,						
							maxlength:200
						},
						DocInst:{
							required : true,
							maxlength:200
						},
						date_defense_phd_thesis : {
    						required : true,
						},
						postphd : {
    						required : true,
    						maxlength:200
						}						
    			},

    			// Messages for form validation
    			messages : {
						phdsupervisor:{
							maxlength:'Accept only 200 characters'
						},
						phdthesis:{							
							maxlength:'Accept only 200 characters'
						},
						DocInst:{
							maxlength:'Accept only 200 characters'
						},
						date_defense_phd_thesis : {
    						required : 'Required',
						},
						postphd : {
    						required : 'Required',
    						maxlength: 'Accept only 200 characters'
						}
    			},
    		
    			// Ajax form submition
    			submitHandler: function(form, event) {
				 event.preventDefault();

				 var formData = new FormData(document.forms.namedItem("tab2_data"));
    					$.ajax({						
    						type: 'POST',
    						url: js_site_base_url + 'ajax/ajaxSaveTab2.php',
    						//data: $(form).serialize(),
							data: formData,
							async: false,
							cache: false,
							contentType: false,
							processData: false,
    						success: function (response) {	
								location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=phd&mode=savesuccess";    							
    						}
    					});	
    			},

    			// Do not change code below
    			errorElement: "span", 
    			errorPlacement : function(error, element) {
    				//error.insertAfter(element.parent());
    				error.insertAfter(element);							
    			}
    		});
			
			$('#submit1').click( function() {
					$.alert({
                                    				title: 'Attention',
                                    				content: 'Your response was successfully saved',
                                    				confirmButton: 'Okay',
                                    				confirmButtonClass: 'btn-primary',
                                    				icon: 'fa fa-thumbs-o-up faa-bounce animated',
                                    				animation: 'rotateX',
                                    				autoClose: 'confirm|2000',
    								confirm: function(){
        								//alert('confirmed');
    										},
    									cancel:function(){
       									// alert('canceled');
    										}
                               				});
				} );
			
			//Save Tab3
			$(".js_blur_employment").blur(function(){				
				var desig1 = $("#tab3_data select[name=designation1]").val();
				var org1 = $("#organization1").val();
				var yeofj1 = $("#eyj1").val();
				var yeofl1 = $("#eyl1").val();
				var dura1 = $("#duration1").val();
				var duramon1 = $("#duration_months1").val();
				var plac1 = $("#place1").val();
				var sala1 = $("#salary1").val();
				
			 
				if($.trim(desig1) != '' || $.trim(org1) || $.trim(yeofj1) || $.trim(yeofl1) || $.trim(dura1) || $.trim(duramon1) || $.trim(plac1) || $.trim(sala1)){
					$(".js_employment_frm_save").attr("disabled", false);
					$(".js_employment_frm_reset").attr("disabled", false);
				}else{
					$(".js_employment_frm_save").attr("disabled", true);
					$(".js_employment_frm_reset").attr("disabled", true);
				}
			});


			//Save Publication
			$(".js_blur_pub").blur(function(){
				var pub_title1 = $("#publication input[name=pub_title1]").val();
				var pub_authors1 = $("#pub_authors1").val();
				var jc1 = $("#jc1").val();
				var doa1 = $("#doa1").val();
				var c1 = $("#c1").val();
				var q1 = $("#q1").val();
			 
				if($.trim(pub_title1) != '' || $.trim(pub_authors1) || $.trim(jc1) || $.trim(doa1) || $.trim(c1) || $.trim(q1)){
					$(".js_pub_frm_save").attr("disabled", false);
					$(".js_pub_frm_reset").attr("disabled", false);
				}else{
					$(".js_pub_frm_save").attr("disabled", true);
					$(".js_pub_frm_reset").attr("disabled", true);
				}
			});


			//Save Other
			$(".js_blur_pub").blur(function(){
				var pub_title1 = $("#publication input[name=pub_title1]").val();
				var pub_authors1 = $("#pub_authors1").val();
				var jc1 = $("#jc1").val();
				var doa1 = $("#doa1").val();
				var c1 = $("#c1").val();
				var q1 = $("#q1").val();
			 
				if($.trim(pub_title1) != '' || $.trim(pub_authors1) || $.trim(jc1) || $.trim(doa1) || $.trim(c1) || $.trim(q1)){
					$(".js_pub_frm_save").attr("disabled", false);
					$(".js_pub_frm_reset").attr("disabled", false);
				}else{
					$(".js_pub_frm_save").attr("disabled", true);
					$(".js_pub_frm_reset").attr("disabled", true);
				}
			});



			//Save Conference
			$(".js_blur_conf").blur(function(){
				var conf_title1 = $("#conference input[name=confpub_title1]").val();
				var conf_authors1 = $("#conf_authors1").val();
				var conf_name1 = $("#conf_name1").val();
				var conf_c1 = $("#conf_c1").val();
				var conf_q1 = $("#conf_q1").val();
			 
				if($.trim(conf_title1) != '' || $.trim(conf_authors1) || $.trim(conf_name1) || $.trim(conf_c1) || $.trim(conf_q1)){
					$(".js_conf_frm_save").attr("disabled", false);
					$(".js_conf_frm_reset").attr("disabled", false);
				}else{
					$(".js_conf_frm_save").attr("disabled", true);
					$(".js_conf_frm_reset").attr("disabled", true);
				}
			});


			//Save Patent
			$(".js_blur_pat").blur(function(){
				var pat_title1 = $("#patent input[name=pat_title1]").val();
				var pat_authors1 = $("#pat_authors1").val();
				var pat_c1 = $("#pat_c1").val();
				var pat_type1 = $("#pat_type1").val();
				var pat_country1 = $("#pat_country1").val();
			 
				if($.trim(pat_title1) != '' || $.trim(pat_authors1) || $.trim(pat_c1) || $.trim(pat_type1) || $.trim(pat_country1)){
					$(".js_pat_frm_save").attr("disabled", false);
					$(".js_pat_frm_reset").attr("disabled", false);
				}else{
					$(".js_pat_frm_save").attr("disabled", true);
					$(".js_pat_frm_reset").attr("disabled", true);
				}
			});

			//Save Book
			$(".js_blur_book").blur(function(){
				var book_title1 = $("#book input[name=book_title1]").val();
				var book_authors1 = $("#book_authors1").val();
				var book_c1 = $("#book_c1").val();
				var book_fbc1 = $("#book_fbc1").val();
				var dof1 = $("#dof1").val();
			 
				if($.trim(book_title1) != '' || $.trim(book_authors1) || $.trim(book_c1) || $.trim(book_fbc1) || $.trim(dof1)){
					$(".js_book_frm_save").attr("disabled", false);
					$(".js_book_frm_reset").attr("disabled", false);
				}else{
					$(".js_book_frm_save").attr("disabled", true);
					$(".js_book_frm_reset").attr("disabled", true);
				}
			});			
				
				
	$("[id ^= 'employmentAdd']").on("click", function(){

		var lastid = $("#employmentBlk tr:last").find("[id^= 'designation']").attr("id");
		console.log(lastid);

		if (lastid) {
		    // Extract the numeric part from the ID
		    var match = lastid.match(/\d+$/); // Finds the last number in the string

		    if (match) {
		        var lastChar = parseInt(match[0]) + 1; // Increment the extracted number
		        console.log("Next ID number: " + lastChar);
		    } else {
		        var lastChar = 1; // Default to 1 if no number is found
		    }
		}	    

	    

	   	var data = '<tr><td><select id="designation'+lastChar+'" name="designation'+lastChar+'" class="form-control" onchange="javascript:showdesignother('+lastChar+');"><option value="">Please Select</option></select><input type="text" placeholder="Designation" class="form-control js_blur_employment" name="designation_other'+lastChar+'" id="designation_other'+lastChar+'" style="display:none;"></td><td><input type="text" id="organization'+lastChar+'" name="organization'+lastChar+'" class="form-control" placeholder="Organization/Institution"></td><td><input type="text"  data-joindate-id="'+lastChar+'" id="eyj'+lastChar+'" name="eyj'+lastChar+'" class="form-control emp_join" placeholder="Date of Joining" value="" ></td><td><input type="text" id="eyl'+lastChar+'" name="eyl'+lastChar+'" class="form-control emp_join" placeholder="Date of Leaving" ></td><td class="vertical__align_js"><input type="text" id="duration'+lastChar+'" name="duration'+lastChar+'" class="form-control" placeholder="Duration" readonly></td><td><input type="text" id="place'+lastChar+'" name="place'+lastChar+'" class="form-control" placeholder="Place"></td><td><input type="text" id="salary'+lastChar+'" name="salary'+lastChar+'" class="form-control" placeholder="Approximate Salary" maxlength="7"></td><td><a id="empDelete'+lastChar+'" data-original-title="Delete" href="javascript:void(0)" class="btn btn-alt btn-sm btn-danger btn-option newTooltip border__radius_js" data-toggle="tooltip" ><i class="fa fa-times"></i></a></td></tr>'; 
	   	$("#employmentBlk").append(data);
	  	$("#designation"+lastChar).rules("add", {maxlength:50,required:true, messages: {required:'Required',maxlength:"Accept only 50 characters"}});
		$("#organization"+lastChar).rules("add", {maxlength:50,required:true, messages: {required:'Required',maxlength:"Accept only 50 characters"}});     	        				
		$("#eyj"+lastChar).rules("add", {minlength:4,required:true, messages: {required:'Required',minlength:"Minimum 4 characters"}});
		$("#eyl"+lastChar).rules("add", {minlength:4,required:true, messages: {required:'Required',minlength:"Minimum 4 characters"}});       	        				
		$("#place"+lastChar).rules("add", {maxlength:50,required:true, messages: {required:'Required',maxlength:"Accept only 50 characters"}});
		
		
        $.ajax({
            type: 'post',
            url: js_site_base_url + 'ajax/ajaxLoadDesg.php',
            data: "",
            dataType: "json",
			success: function(data){
				console.log(data);
				$('#designation'+lastChar).append(data);
            },
			error: function () {
        		alert('Failed to load data');
    		}
        });

		bindJoinDatepickers();

		$('.emp_join').on('keydown paste', function(e) {
		  e.preventDefault(); // block manual typing and pasting
		});		

		$(document).on("click", ".ui-datepicker-calendar a", function (event) {
        	event.preventDefault(); // Prevent unintended navigation
        	//event.stopPropagation(); // Stop the event from bubbling
    	});		

		$('body').tooltip({
			selector: '.newTooltip'
		});
	});


        	
	$("[id ^= 'empDelete']").live("click", function(){
	   $(this).closest("tr").remove();            
	});

	$("[id ^= 'pubDelete']").live("click", function(){
		var actualId = $(this).attr("id");
		if(actualId == 'pubDelete1'){
		    var row = $(this).closest("tr");
		    var token = $("input[name='token']").val();
		    // Clear all input, select, textarea fields in this row
		    row.find("input, select, textarea").val("");
		    $("#doi_url1").removeAttr('readonly');
		    $("#user_fillpub_quartile_flag1").val('0');
		    $("#user_filldata_flag1").val('0');
		    $("input[name='token']").val(token);
		    $("#"+actualId).remove();			
		}
		else{
			$(this).closest("tr").remove();
		}
	});
	$("[id ^= 'other_pubDelete']").live("click", function(){
	   $(this).closest("tr").remove();            
	});	
	$("[id ^= 'confDelete']").live("click", function(){
	   $(this).closest("tr").remove();            
	});
	$("[id ^= 'doi_confDelete']").live("click", function(){
		var actualId = $(this).attr("id");
		if(actualId == 'doi_confDelete1'){
		    var row = $(this).closest("tr");
		    var token = $("input[name='token']").val();
		    // Clear all input, select, textarea fields in this row
		    row.find("input, select, textarea").val("");
		    $("#doi_conf_url1").removeAttr('readonly');
		    $("#user_fillconf_quartile_flag1").val('0');
		    $("input[name='token']").val(token);
		    $("#"+actualId).remove();			
		}
		else{
			$(this).closest("tr").remove();
		}
	});	
	$("[id ^= 'patDelete']").live("click", function(){
	   $(this).closest("tr").remove();            
	});
	$("[id ^= 'bookDelete']").live("click", function(){
	   $(this).closest("tr").remove();            
	});		


	/*
	$(document).on("focusin", ".emp_join", function() {
		$(this).prop('readonly', true);  
	});
	$(document).on("focusout", ".emp_join", function() {
   		$(this).prop('readonly', false); 
	});
	*/

				/* Starts here */
		var tab3_datavalidator = $("#tab3_data").validate({		
			
        rules: {
        	 designation1:{
				required:true,
				maxlength:50
			},
			organization1:{
				required:true,
				maxlength:50
			},		
        	eyj1: {
				required:true,
				minlength:4
            },
            eyl1: {
				required:true,
				maxlength:50,
            },
			place1:{
				required:true,				
				maxlength:50
			},
			salary1:{
				required:true
			},
			postphd:{
				required: {
                    depends: function(element) {
                      return ($("input[name='optradio']:checked").val() == 'Graduated' || $("input[name='optradio']:checked").val() == 'Completed');
                    }
                },
				maxlength:200
			}
          
        },
        messages: {
        	designation1:{
				required:'Required',
				maxlength:'Accept up to 50 chatacters only.'
			},
			organization1:{
				required:"Required",
				maxlength:"Accept up to 50 chatacters only."
			},
        	eyj1: {
				required:"Required",
				minlength:"Minimum 4 characters"				
            },
			eyl1: {
			   required:'Required',
			   minlength:"Minimum 4 characters"			   
            },
			place1:{
				required:'Required',				
				maxlength:"Accept up to 50 chatacters only."
			},
			salary1:{
				required:'Required'
			},
			postphd:{
				required:'Required'
			}
           
        },
        // Ajax form submition
        submitHandler: function(form) {
        	$('#loadingmessage').show();
    		$.ajax({
                type: 'post',
                url: js_site_base_url + 'ajax/ajaxSaveemployment.php',
                data: $(form).serialize(),
                success: function (response) {	
                	if($.trim(response)=='success'){
                		location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=employment&mode=savesuccessedu";	
                	}
                	else{
                		location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=employment&mode=bassavefailed";
                	}
                }
            }); 
		}
	});
		 
				/*Ends here */
	/*Phd work experience */		
	$("#phd_exp").validate({	
        rules: {
			postphd:{
				required: {
                    depends: function(element) {
                      return ($("input[name='optradio']:checked").val() == 'Graduated' || $("input[name='optradio']:checked").val() == 'Completed' || $("input[name='optradio']:checked").val() == '');
                    }
                },
				maxlength:200
			}
          
        },
        messages: {
			postphd:{
				required:'Required',
				maxlength:'Accept only 200 characters'
			}
           
        },
        // Ajax form submition
        submitHandler: function(form) {
        	 $('#loadingmessage').show(); 
					$.ajax({
						type: 'post',
						url: js_site_base_url + 'ajax/ajaxSavePhdExp.php',
						data: $(form).serialize(),
						success: function (response) {				
						location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=employment&mode=savesuccess";	
						}
					}); 
				//}
			}
		});
		/*Ends here */	

				//Save Tab9
			$("#attachments" ).submit(function( event ) {
				if($('#attachments input:checked').length == 0) {
					$('#showerror').css('display','block');
					//$('.check_box')[0].focus(); //Auto focus when checkbox empty
					return false;
				} else {
					$('#showerror').css('display','none');
				}
			});
			
			$('.check_box').click(function() {
				var check_id = $(this).attr("id");
				$('#'+check_id).val(1);
				if($(this).is(":checked")) {				
					$('#showerror').css('display','none');
					if(check_id == 'othersources'){
						$('#othersourcedata').css('display','block');
						$('#othersourcedata').prop('required',true);
					} 
					if(check_id == 'socialothers'){
						$('#socialothersdata').css('display','block');
						$('#socialothersdata').prop('required',true);
					} 
					if(check_id == 'websiteothers'){
						$('#webothersdata').css('display','block');
						$('#webothersdata').prop('required',true);
					} 
					
				} else {
					$('#'+check_id).val(0);
					if($('#attachments input:checked').length == 0) {
						$('#showerror').css('display','block');
						//return false;
					}
					
					if(check_id == 'othersources'){
						$('#othersourcedata').css('display','none');
						$('#othersourcedata').val('');
						$('#othersourcedata').prop('required',false);
						$('#othersourcedata-error').css('display','none');
					} 
					if(check_id == 'socialothers'){
						$('#socialothersdata').css('display','none');
						$('#socialothersdata').val('');
						$('#socialothersdata').prop('required',false);
						$('#socialothersdata-error').css('display','none');
					} 
					if(check_id == 'websiteothers'){
						$('#webothersdata').css('display','none');
						$('#webothersdata').val('');
						$('#webothersdata').prop('required',false);
						$('#webothersdata-error').css('display','none');
					} 
				
				}					
			});


	//Resume File Upload...
			$("#resumefrm").on("submit", function (e) {
			
			 	event.preventDefault();

				var fileInput = $("#resume")[0];
        		var file = fileInput.files[0];

		        // Validation
		        if (!file) {
		            showMessage("Please select a file!", "error","resume");
		            return;
		        }

		        var allowedTypes = ["application/pdf"];
		        var maxSize = 2 * 1024 * 1024; // 2MB

		        if (!allowedTypes.includes(file.type)) {
		            showMessage("Only PDF file is allowed!", "error","resume");
		            return;
		        }

		        if (file.size > maxSize) {
		            showMessage("File size must be less than 1MB!", "error","resume");
		            return;
		        }

        		// Upload via AJAX
			 	var formData = new FormData(document.forms.namedItem("resumefrm"));
				$.ajax({						
					type: 'POST',
					url: js_site_base_url + 'ajax/ajaxSaveTab9.php',
					//data: $(form).serialize(),
					data: formData,
					async: false,
					cache: false,
					contentType: false,
					processData: false,
					beforeSend: function () {
                		showMessage("Uploading...", "info","resume");
            		},
					success: function (response) {
						if (response.includes("View Uploaded File")) {
							checkAllRequiredSections(js_aid, is_iitgn_emp_flg);
							resetForm('attachments');
							// Clear file input field
							document.getElementById("resume").value = "";
							//  Clear or replace the message
							showMessage(response, "success", "resume");
						} else {
							showMessage(response, "error", "resume");
						}
					},
					error: function () {
						//  Clear the "Uploading..." message in case of an error
						showMessage("Error uploading file!", "error", "resume");
					}
				});	
			});

			$(document).on("click", ".delete-icon-resume", function () {
			    var fileName = $(this).data("filename");

				// Show confirmation dialog
				var confirmDelete = confirm("Are you sure you want to delete this file?");

				if (confirmDelete) {				
				    $.ajax({
				        url: "ajax/ajaxdeletefile.php",
				        type: "POST",
				        data: { filename: fileName, fieldtype:"resume" },
				        success: function (response) {
				        	showMessage(response, "success","resume");
							$('#resume').val(null);
							$('#resume').filestyle('clear');
							//$('#attachResetBtn').show();			            
				            $(".delete-icon-resume[data-filename='" + fileName + "']").parent().remove();
				            checkAllRequiredSections(js_aid,is_iitgn_emp_flg);
				        },
				        error: function () {
				            showMessage("Error deleting file!", "error","resume");
				        }
				    });
				}
			});


	//Other Academic (10th,12th) File Upload...
			$("#otheracadmarksheetfrm").on("submit", function (e) {
			
			 	event.preventDefault();

				var fileInput = $("#Otheracadmarksheet")[0];
        		var file = fileInput.files[0];

		        // Validation
		        if (!file) {
		            showMessage("Please select a file!", "error","otheracadmarksheet");
		            return;
		        }

		        var allowedTypes = ["application/pdf"];
		        var maxSize = 2 * 1024 * 1024; // 2MB

		        if (!allowedTypes.includes(file.type)) {
		            showMessage("Only PDF file is allowed!", "error","otheracadmarksheet");
		            return;
		        }

		        if (file.size > maxSize) {
		            showMessage("File size must be less than 1MB!", "error","otheracadmarksheet");
		            return;
		        }

        		// Upload via AJAX
			 	var formData = new FormData(document.forms.namedItem("otheracadmarksheetfrm"));
				$.ajax({						
					type: 'POST',
					url: js_site_base_url + 'ajax/ajaxSaveTab9.php',
					//data: $(form).serialize(),
					data: formData,
					async: false,
					cache: false,
					contentType: false,
					processData: false,
					beforeSend: function () {
                		showMessage("Uploading...", "info","otheracadmarksheet");
            		},					
					success: function (response) {
						if (response.includes("View Uploaded File")) {
							checkAllRequiredSections(js_aid,is_iitgn_emp_flg);
							resetForm('attachments');
							//  Clear file input field
                			document.getElementById("Otheracadmarksheet").value = "";
		                    showMessage(response, "success","otheracadmarksheet");
		                } else {
		                    showMessage(response, "error","otheracadmarksheet");
		                }
					},
					error: function () {
     					showMessage("Error uploading file!", "error","otheracadmarksheet");
    				}
				});	
			});

			$(document).on("click", ".delete-icon-Otheracadmarksheet", function () {
			    var fileName = $(this).data("filename");

				// Show confirmation dialog
				var confirmDelete = confirm("Are you sure you want to delete this file?");

				if (confirmDelete) {
				    $.ajax({
				        url: "ajax/ajaxdeletefile.php",
				        type: "POST",
				        data: { filename: fileName, fieldtype:"Otheracadmarksheet" },
				        success: function (response) {
				            showMessage(response, "success","otheracadmarksheet");
							$('#Otheracadmarksheet').val(null);
							$('#Otheracadmarksheet').filestyle('clear');
							//$('#attachResetBtn').show();			            
				            $(".delete-icon-Otheracadmarksheet[data-filename='" + fileName + "']").parent().remove();
				            checkAllRequiredSections(js_aid,is_iitgn_emp_flg);
				        },
				        error: function () {
				            showMessage("Error deleting file!", "error","otheracadmarksheet");
				        }
				    });
				}
			});

	//Certificate (Transcript/Cards) File Upload...
			$("#certificatefrm").on("submit", function (e) {
			
			 	event.preventDefault();

				var fileInput = $("#certificate")[0];
        		var file = fileInput.files[0];

		        // Validation
		        if (!file) {
		            showMessage("Please select a file!", "error","certificate");
		            return;
		        }

		        var allowedTypes = ["application/pdf"];
		        var maxSize = 10 * 1024 * 1024; // 10MB

		        if (!allowedTypes.includes(file.type)) {
		            showMessage("Only PDF file is allowed!", "error","certificate");
		            return;
		        }

		        if (file.size > maxSize) {
		            showMessage("File size must be less than 10MB!", "error","certificate");
		            return;
		        }

        		// Upload via AJAX
			 	var formData = new FormData(document.forms.namedItem("certificatefrm"));
				$.ajax({						
					type: 'POST',
					url: js_site_base_url + 'ajax/ajaxSaveTab9.php',
					//data: $(form).serialize(),
					data: formData,
					async: false,
					cache: false,
					contentType: false,
					processData: false,
					beforeSend: function () {
                		showMessage("Uploading...", "info","certificate");
            		},					
					success: function (response) { 
						if (response.includes("View Uploaded File")) {
							checkAllRequiredSections(js_aid,is_iitgn_emp_flg);
							resetForm('attachments');
							//  Clear file input field
                			document.getElementById("certificate").value = "";
		                    showMessage(response, "success","certificate");
		                }		                
		                else {
		                    showMessage(response, "error","certificate");
		                }
					},
					error: function () {
     					showMessage("Error uploading file!", "error","certificate");
    				}
				});	
			});

			$(document).on("click", ".delete-icon-certificate", function () {
			    var fileName = $(this).data("filename");

				// Show confirmation dialog
				var confirmDelete = confirm("Are you sure you want to delete this file?");

				if (confirmDelete) {
				    $.ajax({
				        url: "ajax/ajaxdeletefile.php",
				        type: "POST",
				        data: { filename: fileName, fieldtype:"certificate" },
				        success: function (response) {
				            showMessage(response, "success","certificate");
							$('#certificate').val(null);
							$('#certificate').filestyle('clear');
							//$('#attachResetBtn').show();
				            $(".delete-icon-certificate[data-filename='" + fileName + "']").parent().remove();
				            checkAllRequiredSections(js_aid,is_iitgn_emp_flg);
				        },
				        error: function () {
				            showMessage("Error deleting file!", "error","certificate");
				        }
				    });
				}
			});			



	//Degree Certificate File Upload...
			$("#deg_certificatefrm").on("submit", function (e) {
			
			 	event.preventDefault();

				var fileInput = $("#deg_certificate")[0];
        		var file = fileInput.files[0];

		        // Validation
		        if (!file) {
		            showMessage("Please select a file!", "error","deg_certificate");
		            return;
		        }

		        var allowedTypes = ["application/pdf"];
		        var maxSize = 10 * 1024 * 1024; // 2MB

		        if (!allowedTypes.includes(file.type)) {
		            showMessage("Only PDF file is allowed!", "error","deg_certificate");
		            return;
		        }

		        if (file.size > maxSize) {
		            showMessage("File size must be less than 10MB!", "error","deg_certificate");
		            return;
		        }

        		// Upload via AJAX
			 	var formData = new FormData(document.forms.namedItem("deg_certificatefrm"));
				$.ajax({						
					type: 'POST',
					url: js_site_base_url + 'ajax/ajaxSaveTab9.php',
					//data: $(form).serialize(),
					data: formData,
					async: false,
					cache: false,
					contentType: false,
					processData: false,
					beforeSend: function () {
                		showMessage("Uploading...", "info","deg_certificate");
            		},					
					success: function (response) { 
						if (response.includes("View Uploaded File")) {
							checkAllRequiredSections(js_aid,is_iitgn_emp_flg);
							resetForm('attachments');
							//  Clear file input field
                			document.getElementById("deg_certificate").value = "";
		                    showMessage(response, "success","deg_certificate");
		                }
		                else {
		                    showMessage(response, "error","deg_certificate");
		                }
					},
					error: function () {
     					showMessage("Error uploading file!", "error","deg_certificate");
    				}
				});	
			});

			$(document).on("click", ".delete-icon-deg_certificate", function () {
			    var fileName = $(this).data("filename");

				// Show confirmation dialog
				var confirmDelete = confirm("Are you sure you want to delete this file?");

				if (confirmDelete) {
				    $.ajax({
				        url: "ajax/ajaxdeletefile.php",
				        type: "POST",
				        data: { filename: fileName, fieldtype:"deg_certificate" },
				        success: function (response) {
				            showMessage(response, "success","deg_certificate");
							$('#deg_certificate').val(null);
							$('#deg_certificate').filestyle('clear');
							$('#attachResetBtn').show();			            
				            $(".delete-icon-deg_certificate[data-filename='" + fileName + "']").parent().remove();
				            checkAllRequiredSections(js_aid,is_iitgn_emp_flg);
				        },
				        error: function () {
				            showMessage("Error deleting file!", "error","deg_certificate");
				        }
				    });
				}
			});


	//Certificate of SC/ST/OBC/EWS/PwD File Upload...
			$("#catcertificatefrm").on("submit", function (e) {
			
			 	event.preventDefault();

				var fileInput = $("#catcertificate")[0];
        		var file = fileInput.files[0];

		        // Validation
		        if (!file) {
		            showMessage("Please select a file!", "error","catcertificate");
		            return;
		        }

		        var allowedTypes = ["application/pdf"];
		        var maxSize = 1 * 1024 * 1024; // 1MB

		        if (!allowedTypes.includes(file.type)) {
		            showMessage("Only PDF file is allowed!", "error","catcertificate");
		            return;
		        }

		        if (file.size > maxSize) {
		            showMessage("File size must be less than 1MB!", "error","catcertificate");
		            return;
		        }

        		// Upload via AJAX
			 	var formData = new FormData(document.forms.namedItem("catcertificatefrm"));
				$.ajax({						
					type: 'POST',
					url: js_site_base_url + 'ajax/ajaxSaveTab9.php',
					//data: $(form).serialize(),
					data: formData,
					async: false,
					cache: false,
					contentType: false,
					processData: false,
					beforeSend: function () {
                		showMessage("Uploading...", "info","catcertificate");
            		},					
					success: function (response) { 
						if (response.includes("View Uploaded File")) {
							checkAllRequiredSections(js_aid,is_iitgn_emp_flg);
							resetForm('attachments');
							//  Clear file input field
                			document.getElementById("catcertificate").value = "";
		                    showMessage(response, "success","catcertificate");
		                }		                
		                else {
		                    showMessage(response, "error","catcertificate");
		                }
					},
					error: function () {
     					showMessage("Error uploading file!", "error","catcertificate");
    				}
				});	
			});

			$(document).on("click", ".delete-icon-catcertificate", function () {
			    var fileName = $(this).data("filename");

				// Show confirmation dialog
				var confirmDelete = confirm("Are you sure you want to delete this file?");

				if (confirmDelete) {
				    $.ajax({
				        url: "ajax/ajaxdeletefile.php",
				        type: "POST",
				        data: { filename: fileName, fieldtype:"catcertificate" },
				        success: function (response) {
				            showMessage(response, "success","catcertificate");
							$('#catcertificate').val(null);
							$('#catcertificate').filestyle('clear');
							$('#attachResetBtn').show();			            
				            $(".delete-icon-catcertificate[data-filename='" + fileName + "']").parent().remove();
				        },
				        error: function () {
				            showMessage("Error deleting file!", "error","catcertificate");
				        }
				    });
				}
			});

			$("#workexpdocfrm").on("submit", function (e) {
			 
			 	event.preventDefault();

				var fileInput = $("#workexpdoc")[0];
        		var file = fileInput.files[0];

		        // Validation
		        if (!file) {
		            showMessage("Please select a file!", "error","workexpdoc");
		            return;
		        }

		        var allowedTypes = ["application/pdf"];
		        var maxSize = 1 * 1024 * 1024; // 1MB

		        if (!allowedTypes.includes(file.type)) {
		            showMessage("Only PDF file is allowed!", "error","workexpdoc");
		            return;
		        }

		        if (file.size > maxSize) {
		            showMessage("File size must be less than 1MB!", "error","workexpdoc");
		            return;
		        }

        		// Upload via AJAX
			 	var formData = new FormData(document.forms.namedItem("workexpdocfrm"));
				$.ajax({						
					type: 'POST',
					url: js_site_base_url + 'ajax/ajaxSaveTab9.php',
					//data: $(form).serialize(),
					data: formData,
					async: false,
					cache: false,
					contentType: false,
					processData: false,
					beforeSend: function () {
                		showMessage("Uploading...", "info","workexpdoc");
            		},					
					success: function (response) { 
						if (response.includes("View Uploaded File")) {
							checkAllRequiredSections(js_aid,is_iitgn_emp_flg);
							resetForm('attachments');
							//  Clear file input field
                			document.getElementById("workexpdoc").value = "";
		                    showMessage(response, "success","workexpdoc");
		                }
		                else {
		                    showMessage(response, "error","workexpdoc");
		                }
					},
					error: function () {
     					showMessage("Error uploading file!", "error","workexpdoc");
    				}
				});	
			});

			$(document).on("click", ".delete-icon-workexpdoc", function () {
			    var fileName = $(this).data("filename");

				// Show confirmation dialog
				var confirmDelete = confirm("Are you sure you want to delete this file?");

				if (confirmDelete) {
				    $.ajax({
				        url: "ajax/ajaxdeletefile.php",
				        type: "POST",
				        data: { filename: fileName, fieldtype:"workexpdoc" },
				        success: function (response) {
				            showMessage(response, "success","workexpdoc");
							$('#workexpdoc').val(null);
							$('#workexpdoc').filestyle('clear');				            
							$('#attachResetBtn').show();			            
				            $(".delete-icon-workexpdoc[data-filename='" + fileName + "']").parent().remove();
				            checkAllRequiredSections(js_aid,is_iitgn_emp_flg);
				        },
				        error: function () {
				            showMessage("Error deleting file!", "error","workexpdoc");
				        }
				    });
				}
			});	


			$("#Final").validate({ 				
					
				
    			// Rules for form validation
    			rules : {
					check3 : {
    					required : true
						}
    			},

    			// Messages for form validation
    			messages : {
					check3 : {
    					required : 'Required'
						
					},
    			}, 
				
    		
    			// Ajax form submition
    			submitHandler: function(form, event) {
        			
				 event.preventDefault();
				 var formData = new FormData(document.forms.namedItem("Final"));
    					$.ajax({						
    						type: 'POST',
    						url: js_site_base_url + 'ajax/ajaxSaveAll.php',
							data: formData,
							async: false,
							cache: false,
							contentType: false,
							processData: false,
    						success: function (response) {				
							 $.alert({
                                    				title: 'Attention',
                                    				content: response,
                                    				confirmButton: 'Okay',
                                    				confirmButtonClass: 'btn-primary',
                                    				icon: 'fa fa-thumbs-o-up faa-bounce animated',
                                    				animation: 'rotateX',
                                    				autoClose: 'confirm|2000',
    								confirm: function(){
    										},
    									cancel:function(){
    										}
                               				});    							
    						}
    					});	
    			},

    			// Do not change code below
    			errorElement: "span", 
    			errorPlacement : function(error, element) {
    				//error.insertAfter(element.parent());
    				error.insertAfter(element);							
    			}
    		});
		
			//Save All
			
			$("#save_all").on('click', function (event) {

    			$("#faq2_q1").addClass("in");
        		$("#faq2_q2").addClass("in");
        		$("#faq2_q3").addClass("in");
				$("#faq2_q5").addClass("in");
        		$("#faq2_q51").addClass("in");
				$("#faq2_q52").addClass("in");
        		$("#faq2_q53").addClass("in");
        		$("#faq2_q6").addClass("in");
				$("#faq2_q7").addClass("in");
				$("#faq2_q531").addClass("in");
        		if($("#biographdata1").valid() && $("#academicFrm").valid() && $("#tab2_data").valid() && $("#publication").valid() && $("#research_grants").valid() && $("#research").valid() && $("#teaching").valid() && $("#whyiitgn").valid() && $("#referees").valid() && $("#attachments").valid() && $("#Final").valid())
					{
					location.href = js_site_base_url + "application_download.php?aid=" + js_aid;
				//}
			}
			});
			
			$("#save").click(function(e) {
      			  e.preventDefault();
       			 //alert("1");
   			 })
			
			
			$("div#accordion > h4 > a").click(function(e) { // when we click a link

            e.preventDefault(); // prevent the click from bubbling

            var parenth3 = $(this).parent(); // find the parent h3 the sender is in

            //this selector then finds the first textbox that is in the div adjacent to the parent h3.
            $("#" + parenth3[0].id + " + div > form > fieldset.inside > input[type=text]:first").focus();

        });
			
			$(function() {
			$(".delbutton").click(function(){
			var del_id = $(this).attr("rowid");			
			var del_id1 = $(this).attr("id");
			var info = 'id=' + del_id;
			if(confirm("Are you sure you want to delete this row?"))
			{
			$.ajax({
					   type: 'post',
					   url: js_site_base_url + 'ajax/aq_delete.php',                           
					   data: info,
					   type: "POST",                           
					   success: function (response) { 
					   	
					   }
				   });
				$(this).closest("tr").remove();
			}			
			return false;
			});
		});
		
			$(function() {
			$(".pgdelbutton").click(function(){
			var del_id = $(this).attr("rowid");			
			var del_id1 = $(this).attr("id");
			var info = 'id=' + del_id;
			if(confirm("Are you sure you want to delete this row?"))
			{
			$.ajax({
					   type: 'post',
					   url: js_site_base_url + 'ajax/pg_delete.php',                           
					   data: info,
					   type: "POST",                           
					   success: function (response) { 
							if ($(".pgdelbutton").length == 0) {
							    var data = '<tr><td><input type="text" id="student1" name="student1" class="form-control" placeholder="Name of student/research scholar" required></td><td><input type="text" id="doctorate1" name="doctorate1" class="form-control" placeholder="Doctorate/Master\'s"></td><td><input type="text" id="pyl1" name="pyl1" class="form-control emp_join" placeholder="Date of Submission" ></td><td><input type="number" min="0" max="5" id="coguide1" name="coguide1" class="form-control" placeholder="No. of Supervisors"></td><input type="hidden" name="uid1" value="' + js_userid + '"><input type="hidden" name="id1" value="0"><input type="hidden" name="appid1" value="' + js_aid + '"><input type="hidden" name="uappid1" value="' + js_aid + '"></tr>'; 

							    // Append the new row to the table first
							    $("#pgBlk").append(data);

							    // Reinitialize datepicker for dynamically added elements
								bindDatepickers();

							    // Add validation rules after the input fields exist
							    $("#student1").rules("add", { required: true, maxlength: 200, messages: { required: "Required", maxlength: "Accept only 200 characters" } });
							    $("#doctorate1").rules("add", { maxlength: 200, messages: { maxlength: "Accept only 200 characters" } });
							    $("#coguide1").rules("add", { maxlength: 200, messages: { maxlength: "Accept only 200 characters" } });
							}
					   }
				   });
				$(this).closest("tr").remove();
			}			
			return false;
			});
		});
		

		
		
		$(function() {

			$(".edelbutton").click(function(){
			var del_id = $(this).attr("rowid");
			var del_id1 = $(this).attr("id");
			var info = 'empdelid=' + del_id;
			if(confirm("Are you sure you want to delete this row?"))
			{
				$.ajax({
				type: "POST",
				url: js_site_base_url + "ajax/eq_delete.php",
				data: info,
				success: function(response){
					//alert(response);

					if($(".edelbutton").length == 0){
						var data = '<tr><td><input type="text" id="designation1" name="designation1" class="form-control" placeholder="Designation"></td><td><input type="text" id="organization1" name="organization1" class="form-control" placeholder="Organization/Institution"></td><td><input type="text" id="eyj1" name="eyj1" class="form-control emp_join" placeholder="Date of Joining" maxlength="7" data-joindate-id="1" ></td><td><input type="text" id="eyl1" name="eyl1" class="form-control emp_join" placeholder="Date of Leaving" data-leavedate-id="1" ></td><td ><input type="text" id="duration1" name="duration1" class="form-control" placeholder="Duration" readonly></td><td><input type="text" id="place1" name="place1" class="form-control" placeholder="Place" ></td><td><input type="text"  id="salary1" name="salary1" class="form-control" placeholder="Approximate Salary" maxlength="7"></td><input type="hidden" name="uid1" value="' + js_userid + '"><input type="hidden" name="id1" value="0"><input type="hidden" name="appid1" value="' + js_aid + '"><input type="hidden" name="uappid1" value="' + js_aid + '"></tr>'; 
						$("#employmentBlk").append(data);
						var lastChar="1";
						$("#designation"+lastChar).rules("add", {maxlength:50,required:true, messages: {required:'Required',maxlength:"Accept up to 50 characters only."}});
						$("#organization"+lastChar).rules("add", {maxlength:50,required:true, messages: {required:'Required',maxlength:"Accept up to 50 characters only."}});     	        				
						$("#place"+lastChar).rules("add", {maxlength:50,required:true, messages: {required:'Required',maxlength:"Accept up to 50 characters only."}});
						$("#salary"+rowid).rules("add", {maxlength:7,messages: {maxlength:'Accept up to 7 digits only.'}});

						bindDatepickers();
						$('.emp_join').on('keydown paste', function(e) {
						  e.preventDefault(); // block manual typing and pasting
						});						
					} 				    
				}
			});
			$(this).closest("tr").remove();
		}
		return false;
		});
		});
		
		if($(".box_success").length > 0)
        {
             $(".box_success").fadeOut(3000);
        }
			var url_string = window.location.href
			var url = new URL(url_string);
			var c = url.searchParams.get("c");
			var js_tab=document.getElementById('js_tab').value;
		 	if(url.searchParams.get("tab")== "basic") {
	        $("#faq2_q1").addClass("in");
	        location.hash = "#basicAddressTab";
        }
	
		if(js_tab == "qua") {
	        $("#faq2_q2").addClass("in");
	        location.hash = "#academicBlk";
        }

		/************ IPS-44183 Other Academic Details 10th & 12th Start *********/
		if(js_tab == "faq2_otheracd") {
	        $("#faq2_otheracd").addClass("in");
	        location.hash = "#otheracademicBlk";
        }
        /************ IPS-44183 Other Academic Details 10th & 12th End *********/
		
		if(js_tab == "phd") {
	        $("#faq2_q2").addClass("in");
	        location.hash = "#phdBlk";
        }
		
		
		 if(js_tab == "employment") {
	        $("#faq2_q3").addClass("in");
	        location.hash = "#employmentBlk";
        }
		
		if(js_tab == "publication") {
	        $("#faq2_q51").addClass("in");
	        location.hash = "#publicationBlk";
        }

		if(js_tab == "other_publication") {
	        $("#faq2_q51").addClass("in");
	        location.hash = "#other_publicationBlk";
        }

		if(js_tab == "conference") {
	        $("#faq2_q51").addClass("in");
	        location.hash = "#conferenceBlk";
        }   


		if(js_tab == "doi_conference") {
	        $("#faq2_q51").addClass("in");
	        location.hash = "#doi_conferenceBlk";
        }                

		if(js_tab == "patent") {
	        $("#faq2_q51").addClass("in");
	        location.hash = "#patentBlk";
        }

		if(js_tab == "book") {
	        $("#faq2_q51").addClass("in");
	        location.hash = "#bookBlk";
        }        
		
		
		if(js_tab == "thesisteach") {
	        $("#faq2_q52").addClass("in");
	        location.hash = "#labBlk";
        }
		
		if(js_tab == "thesis") {
	        $("#faq2_q52").addClass("in");
	        location.hash = "#pgBlk";
        }
		
		if(js_tab == "thesislab") {
	        $("#faq2_q52").addClass("in");
	        location.hash = "#lab1Blk";
        }
		
		if(js_tab == "thesislabpg") {
	        $("#faq2_q52").addClass("in");
	        location.hash = "#lab2Blk";
        }
		
		if(js_tab == "research_grants") {
	        $("#faq2_q8").addClass("in");
	       location.hash = "#research_grants";
        }
		
		if(js_tab == "research") {
	        $("#faq2_q5").addClass("in");
	        location.hash = "#researchBlk";
        }
		
		if(js_tab == "wiitgn") {
	        $("#faq2_q53").addClass("in");
	        location.hash = "#whyBlk";
        }
		
		if(js_tab == "referee") {
	        $("#faq2_q6").addClass("in");
	        location.hash = "#refereeBlk";
        }
		
		if(js_tab == "additional") {
	        $("#faq2_q7").addClass("in");
	        location.hash = "#additionalBlk";
        }		
     });

	 function resetForm(frm){  
		if(frm == 'research_grants') {
			var research_san = $("#research_sanction").val();
			var research_sub = $("#research_submitted").val();
			$("#"+frm).get(0).reset();// add this line for reset functinality replace with below line
			if(research_sub == 0){
				$("#research_sanction").val('');
			}
			if(research_san == 0){
				$("#research_submitted").val('');
			}
		}
		else if(frm == 'attachments'){
			$("#resumefrm").get(0).reset();
			$("#otheracadmarksheetfrm").get(0).reset();
			$("#certificatefrm").get(0).reset();
			$("#deg_certificatefrm").get(0).reset();
			$("#catcertificatefrm").get(0).reset();
			$("#workexpdocfrm").get(0).reset();
		}
		else {
			$("#"+frm).get(0).reset();
			if(frm == 'academicFrm') {

			}
		}
	}
	
	jQuery.validator.addMethod("PercentageRule", function(value, element) {
			return this.optional(element) || value === "NA" ||
			value.match(/^[0-9\.]+$/);
		}, "Invalid Percentage/CGPA");
	 			
	/* checking for joining and leaving year condition starts here */
	 $.validator.addMethod("quagreaterstartyear", function(value, element) {	 
        var attrname = $(element).attr("id");	
		var id =  attrname.substr(2, 1);
		var start_year = $("#yj"+id).val();		
		
		if(start_year != '')
        {
            if(start_year > value)
                return false;
        }
        return true;
    }, "Must be greater <br/>than or equal to <br/>from date");
	
    
	
	// Employement date of joining and date of leaving calculation starts here

$.validator.addMethod("greaterstartdate", function(value, element) {
            var id = $(element).attr("id");
            //nid = id.substr(15, 1);
            var enddate = value;
			var nid = id.replace("eyl","");
			if(!nid) var nid = id.replace("eyj","");
			  
				var startdate = $("#eyj"+nid).val(); 
				if(startdate == 'undefined') var startdate = $("#eyj"+nid).val(); 
				var enddatearr = enddate.split("/");
				var startdatearr = startdate.split("/");
				startdate = startdatearr[1]+"/"+startdatearr[0]+"/"+startdatearr[2];
				enddate = enddatearr[1]+"/"+enddatearr[0]+"/"+enddatearr[2];
				var From_date = new Date(startdate);
				var To_date = new Date(enddate);
				var diff_date =  To_date - From_date;
				var days = Math.floor(((diff_date % 31536000000) % 2628000000)/86400000);   //console.log(days)        
				 if(days >= 0)
				{                
					return true;
				}
			
            return false;
			 
        }, "Must be greater than or <br/>equal to from date");
        $.validator.addMethod("greaterendstartdate", function(value, element) {
		//alert("hi");
            var id = $(element).attr("id");
            //nid = id.substr(8, 1);
            var enddate = value;
			var nid = id.replace("eyl","");
            var startdate = $("#eyj"+nid).val();
            var enddatearr = enddate.split("/");
            var startdatearr = startdate.split("/");
            startdate = startdatearr[1]+"/"+startdatearr[0]+"/"+startdatearr[2];
            enddate = enddatearr[1]+"/"+enddatearr[0]+"/"+enddatearr[2];
            var From_date = new Date(startdate);
            var To_date = new Date(enddate);
            var diff_date =  To_date - From_date;
            var days = Math.floor(((diff_date % 31536000000) % 2628000000)/86400000);            
            if(days <= 0)
            {                
                return false;
            }
            return true;
        }, "Must be greater than start date");
		
        $.validator.addMethod("greaterequalstartdate", function(value, element) {
		// alert("hi");
            var id = $(element).attr("id");
            //nid = id.substr(8, 1);
            var enddate = value;
			var nid = id.replace("eyl","");
            var startdate = $("#eyj"+nid).val();
            var enddatearr = enddate.split("/");
            var startdatearr = startdate.split("/");
            startdate = startdatearr[1]+"/"+startdatearr[0]+"/"+startdatearr[2];
            enddate = enddatearr[1]+"/"+enddatearr[0]+"/"+enddatearr[2];
            var From_date = new Date(startdate);
            var To_date = new Date(enddate);
            var diff_date =  To_date - From_date;
            var days = Math.floor(((diff_date % 31536000000) % 2628000000)/86400000);            
            if(days < 0)
            {                
                return false;
            }
			$(this).closest('tr').find("[name ^= 'duration']").val('')
            return true;
        }, "Must be greater than <br/>or equal to start date");		
      
	
	

// Ends here
	
	
	 $.validator.addMethod("empgreaterstartyear", function(value, element) {	 
        var attrname = $(element).attr("id");	
		var id =  attrname.substr(3, 1);
		var start_year = $("#eyj"+id).val();		
		
		if(start_year != '')
        {
            if(start_year > value)
                return false;
        }
        return true;
    }, "Must be greater <br/>than year of<br/>joining");
	
	jQuery.validator.addMethod("lettersonly", function(value, element) {
  return this.optional(element) || /^[a-z\s]+$/i.test(value);
}, "Accept only Characters");

jQuery.validator.addMethod("lettersnumonly", function(value, element) {
  return this.optional(element) || /^[a-zA-Z0-9\s]+$/i.test(value);
}, "Accept only Characters and Numbers");

 jQuery.validator.addMethod( 'emailMatch', function(value, element) {
    
    // The two email inputs
    var email = $("#txtemail").val();
    var optionemail = $("#aemail").val();

    // Check for equality with the email inputs
    if (email == optionemail ) {
        return false;
    } else {
        return true;
    }

}, "Please use different email");

jQuery.validator.addMethod( 'phoneMatch', function(value, element) {
    
    // The two contact no inputs
    var contactnum = $("#conno").val();
    var alternacnum = $("#aconno").val();

    // Check for equality with the contact no inputs
    if (contactnum == alternacnum ) {
        return false;
    } else {
        return true;
    }

}, "Please use different contact number");


	
   
	
	(function() {
	    var msg = "";
	    var messager = function() {
	       return msg;
	    };
			jQuery.validator.addMethod('check_date_of_birth', function(value, element) {    
			// The two contact no inputs
			var intage = $("#age").val();
			var agelim = "21";

			// Check for equality with the contact no inputs
			if (parseInt(intage) < parseInt(agelim) ) {        
				 msg = 'Age should be greater than 21 years';
				 $("label[for='dob']").focus();
				return false;
			} 
			return true;
			}, messager);
	 })();		
	
	function calc_patent_total()
	{
		granted=$('#pat_granted').val();
		filed=$('#pat_filed').val();
		total =(parseFloat(granted) || 0) + (parseFloat(filed) || 0);
		$('#nq5').val(total);
		$('#book_patent_required').val(total);
	}
	function calc_book_total()
	{
		publish=$('#no_book_publish').val();
		accept=$('#no_book_accept').val();
		submitted=$('#no_book_submited').val();
		total =(parseFloat(publish) || 0) + (parseFloat(accept) || 0) + (parseFloat(submitted) || 0);
		$('#no_of_books').val(total);
		$('#book_required').val(total);
	}
	
	function calc_book_chap_total()
	{
		publish=$('#no_book_chap_publish').val();
		accept=$('#no_book_chap_accept').val();
		submitted=$('#no_book_chap_submited').val();
		total =(parseFloat(publish) || 0) + (parseFloat(accept) || 0) + (parseFloat(submitted) || 0);
		$('#nq1').val(total);
		$('#book_chapters_required').val(total);
	}
	
	function calc_journal_total()
	{
		publish=$('#no_journal_publish').val();
		accept=$('#no_journal_accept').val();
		submitted=$('#no_journal_submited').val();
		total =(parseFloat(publish) || 0) + (parseFloat(accept) || 0) + (parseFloat(submitted) || 0);
		$('#nq2').val(total);
		$('#book_journal_required').val(total);
	}
	
	function calc_conf_total()
	{
		publish=$('#no_conf_publish').val();
		accept=$('#no_conf_accept').val();
		submitted=$('#no_conf_submited').val();
		total =(parseFloat(publish) || 0) + (parseFloat(accept) || 0) + (parseFloat(submitted) || 0);
		$('#nq3').val(total);
		$('#book_conf_required').val(total);
	}
	
	function calc_duration_years(from_date_id, to_date_id){

		var From_date = $("#" + from_date_id).val();
		var To_date = $("#" + to_date_id).val();

		if (From_date != '' && To_date != '') {

		    var result1 = From_date.split('/');
		    var result2 = To_date.split('/');

		    var day1 = parseInt(result1[0]); // Extract day
		    var month1 = parseInt(result1[1]); // Extract month
		    var year1 = parseInt(result1[2]); // Extract year

		    var day2 = parseInt(result2[0]);
		    var month2 = parseInt(result2[1]);
		    var year2 = parseInt(result2[2]);

		    // Create Date objects for accurate calculations
		    var date1 = new Date(year1, month1 - 1, day1); // Months are 0-based in JavaScript
		    var date2 = new Date(year2, month2 - 1, day2);

		    // Calculate the difference using the getTime() method
		    var timeDiff = date2.getTime() - date1.getTime();
		    var daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

		    // Calculate years, months, and days using Date object
		    var diffYears = date2.getFullYear() - date1.getFullYear();
		    var diffMonths = date2.getMonth() - date1.getMonth();
		    var diffDays = date2.getDate() - date1.getDate();

		    // Adjust months and days if needed
		    if (diffDays < 0) {
		        diffMonths--; // Borrow from months
		        var prevMonth = new Date(year2, month2 - 1, 0).getDate(); // Get days in the previous month
		        diffDays += prevMonth;
		    }

		    if (diffMonths < 0) {
		        diffYears--; // Borrow from years
		        diffMonths += 12;
		    }

		    // Construct the experience duration string
		    var total_exp = "";

		    if (diffYears > 0) {
		        total_exp += diffYears + " year(s) ";
		    }
		    if (diffMonths > 0) {
		        total_exp += diffMonths + " month(s) ";
		    }
		    if (diffDays > 0) {
		        total_exp += diffDays + " day(s)";
		    }

		    let len_of_id = from_date_id.length;
		    let durationid = from_date_id.substr(3, parseInt(len_of_id) - 3);
		    $("#duration" + durationid).val(total_exp.trim());
		}
	}	
	
	$(document).ready(function(){		

			$("#biographdata1").validate({
    			// Rules for form validation
    			
    			rules : {
        			
    				firstname : {
    					required : true,
						lettersonly:true,
						maxlength:150
    				},
					middlename:{
					required:false,
					lettersonly:true,
					maxlength:150
					},
    				lastname : {
    					required : true,
						lettersonly:true,
						maxlength:150
    				},
					txtemail : {
    		        	required : true,
						email : true
    		        },
					aemail:{
					required:true,
					emailMatch: true,
					maxlength:150
					},
					dob : {
    		        	required : true
    		        },
    		        gender : {
    		        	required : true
    		        },
    		        category : {
    		        	required : true
    		        },
    		        subcat : {
    		        	required : true
    		        },
    		        nationality : {
    		        	required : true
    		        },
					maritalstatus : {
    		        	required : true
    		        },
					country_code : {
    		        	required : true
    		        },					
					conno : {
    		        	required : true,
						phoneno : true,
						maxlength:50
    		        },
					aconno : {    		        	
						phoneno : true,
						//number:true,
						phoneMatch:true,
						maxlength:50
    		        },
					mail_add : {
    		        	required : true,
						maxlength:500
    		        },
					mail_per : {
    		        	required : true,
						maxlength:500
    		        },
					position : {
    		        	required : true
    		        },
					discipline : {
    		        	required : true
    		        },
					
    		        /*Start Set Flag IITGN Emp*/
					is_iitgn_emp : {
    		        	required : true
    		        },
    		        /*End Set Flag IITGN Emp*/
    		        					
					POther: { required: function(element){
                            return $("#discipline option:selected").text() == "Other";
                            },
							lettersonly:true,
							maxlength:250
					},
					
					sOther: { required: function(element){
                            return $("#sdiscipline option:selected").text() == "Other";
                            },
							lettersonly:true,
							maxlength:250
					},
					secdecip:{
					required : true,
					wordCount: ['100']
					},    		        
					"c_r[]" : {
						characterCount: 120
    		        },
					Curr: {
    		        	required : true,
						wordCount: ['300']
    		        },
					photo: {
												//required: true,
												required: {
												 depends: function(element) {												
													 if($(".pho span").text() !=''){
														return false;
													 }else{
														 return true;
													 } 
												}
											},
												extension: "jpg|jpeg|png",
												filesize: 1048576												
											}    		        
    			},

    			// Messages for form validation
    			messages : {
				
					firstname : {
    					required : 'Required',
						lettersonly:"Accept only Characters",
						maxlength:"Accept only 150 characters"
    				},
    				
    				lastname : {
    					required : 'Required',
						lettersonly:"Accept only Characters",
						maxlength:"Accept only 150 characters"
    				},
					middlename : {
    					lettersonly:"Accept only Characters",
						maxlength:"Accept only 150 characters"
    				},
    				txtemail : {
    		        	required : 'Required',
						email : 'Required'
    		        },
					aemail:{	
					required : 'Required',					
					emailMatch: "Please use different email",
					maxlength:"Accept only 150 characters"
					},
					dob : {
    		        	required : 'Required'
    		        },
					gender : {
    		        	required : 'Required'
    		        },
    		        category : {
    		        	required : 'Required'
    		        },
    		        subcat : {
    		        	required : 'Required'
    		        },
					nationality : {
    		        	required : 'Required'
    		        },
    		        maritalstatus : {
    		        	required : 'Required'
    		        },
					country_code : {
    		        	required : 'Required'
    		        },					    		        
					conno : {
    		        	required : 'Required',
						phoneno : "Please Enter Valid Phone Number",
						maxlength:"Accept up to 50 digits only."
    		        },
					aconno : {
    		        	
						phoneno : "Please Enter Valid Phone Number",
						phoneMatch:"Please use different Phone Number",
						maxlength:"Accept up to 50 digits only."
    		        },			
					
					mail_add : {
    		        	required : 'Required',
						maxlength:"Accept only 500 characters"
    		        },
					mail_per : {
    		        	required : 'Required',
						maxlength:"Accept only 500 characters"
    		        },
					position : {
    		        	required : 'Required'
    		        },
					discipline : {
    		        	required : 'Required'
    		        },
					
					POther: { 
					required: "Please enter a valid other value",
					lettersonly:"Accept only Characters",
					maxlength:"Accept only 250 characters"
					},
					sOther: { 
					required: "Please enter a valid other value",
					lettersonly:"Accept only Characters",
					maxlength:"Accept only 250 characters"
					},

    		        //"c_a[]" : {
					//	characterCount: "Please enter no more than 120 characters."
    		        //},

					"c_r[]" : {
						characterCount: "Please enter no more than 120 characters."
    		        },
					secdecip:{					
					required : 'Required'
					},
					Curr : {
    		        	required : 'Required'
						//maxlength:"Current Research Interests Accept only 300 characters"
    		        },
					photo : {
    					required : 'Required',	
    					extension: 'Please upload a valid file.',					
						filesize: "File size must be less than 1 MB"
						} 
    				
    				
    			},
    		
    			// Ajax form submition
    				submitHandler: function(form, event) {   
				 	event.preventDefault();
				 	location.hash = "#basicInfoTab";
                 	//  $('#loadingmessage').show();
				 	var formData = new FormData(document.forms.namedItem("biographdata1"));				
					$.ajax({
						type: 'POST',
						url: js_site_base_url + 'ajax/ajaxSaveTab1.php',
						//data: $(form).serialize(),
						data: formData,
						async: false,
						cache: false,
						contentType: false,
						processData: false,
							success: function (response) {
								if($.trim(response)=='wimg'){
									$('#photodiv').html('<label>Allowed format png,jpg and jpeg</label>');
									location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=basic&mode=wimgfailed";
								}					
								else if($.trim(response)=='success'){
									location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=basic&mode=bassavesuccess";	
								} else {
									location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=basic&mode=bassavefailed";
								}
							//$('#loadingmessage').hide();								
						}
					});	
    			},

    			// Do not change code below
    			/*errorElement: "span", 
    			errorPlacement : function(error, element) {
    				//error.insertAfter(element.parent());
    				error.insertAfter(element);							
    			}*/
    		});
		
		if ($('#exp_not_applicable').is(':checked')) {
			 // $('#research_grants_section').find('input, textarea, button').attr('disabled',true);
			  //$('.research_grants_section').find('button,submit').attr('disabled',true);
			  //$('#Rsanction_text').find('iframe').attr('disabled',true);
			  //$("#research_grants_section").find('.text').css("display","none");
			 //$("#research_grants_section").find('input, textarea, button').css("display","");
			   
			  //$('#research_frame').find('iframe').toggle();
			 /* $('#research_sanction').val('');
			  $('#research_submitted').val('');
			  $('#research_frame').find('iframe').contents().find("body").html('');
			  $('.research_grants_section').hide();
			  /*$('#research_sanction').prop('required',false);
			  $('#research_submitted').prop('required',false);
			  $('#Rsanction_text').prop('required',false);
			  $("#research_sanction-error").remove();
			  $("#research_submitted-error").remove();
			  $("#Rsanction_text-error").remove();*/
			  $('#grants_section').hide();
			  $('.rgsubbtn').hide();
			  $('.rgresetbtn').hide();
		}

		// Add custom method to validate character count
		$.validator.addMethod("characterCount", function(value, element, param) {
		    return this.optional(element) || value.length <= param;
		}, "The input exceeds the maximum allowed characters.");


			//const departmentId = 6; // Replace with the dynamic department ID if available
			// Get existing data from localStorage
			//const existedCoreData = JSON.parse(localStorage.getItem('existedCoreData'));
			//console.log('Existing Core Data:', existedCoreData);

			// API URLs
			//const coreApiUrl = `https://portalstaging.iitgn.ac.in/pgadmission/get_research_area_list?department_id=${departmentId}`;
			//const coreApiUrl = `https://admissions.iitgn.ac.in/pgadmission/get_research_area_list?department_id=${departmentId}`;
			// Call the function for core areas
			//fetchAndPopulateDropdown(coreApiUrl, 'select[name="c_a[]"]', existedCoreData, 'research_area');

    });

/* third code */

 	// Function to make the AJAX call and populate dropdowns
	

	function callFinalSubmit(){
		if($("#Final").valid()){	
			let aid = $('#js_aid').val();
			let uid = $('#js_userid').val();

			// start calculate Gap from Education and Employment.

			$(".submitBtn").attr("disabled", true);
				Swal.fire({
				    title: 'Are you sure you want to proceed?',
				    text: 'On clicking OK, you will not be able to edit any information.',
				    icon: 'warning',
				    showCancelButton: true,
				    confirmButtonText: 'OK',
				    cancelButtonText: 'Cancel',
				    reverseButtons: true
				}).then((result) => {
				    if (result.isConfirmed) {
				        // If confirmed, show the loading message and submit the form
				        $('#loadingmessage').show();
				        submitfinal();
				    } else {
				        // If canceled, re-enable the submit button
				        $(".submitBtn").attr("disabled", false);
				    }
				});
			// end calculate Gap from Education and Employment.
		}
		else{
			 location.href = js_request_uri + '#Final';
		}
	}
	
	
	// academic
function academic(){
var academicData = $("#academicFrm").serialize();

var strsuccess=0;
	$.ajax({
	type: 'post',
	async:false,
	//global: false,
	url: js_site_base_url + 'ajax/ajaxQualifications.php',
	data: academicData+"&Save=Save&final_submit=1",
		success: function (response) {
		//alert(response);
			$("#faq2_q2").addClass("in");
			if($.trim(response)=='success'){
			//alert(response);
			strsuccess=1;
			} 			
		}
	}); 
	return strsuccess;
	}
//
//console.log(academic());
// Publication
function publication(){
var publicationData = $("#publication").serialize();
//var publicationData = new FormData(document.forms.namedItem("publication"));
var strpubsuccess=0;
	$.ajax({						
		type: 'POST',		
		url: js_site_base_url + 'ajax/ajaxSavePublication.php',													
		data: publicationData,
		async: false,		
		success: function (pubresponse) {
		//alert(response);
			$("#faq2_q51").addClass("in");
			if($.trim(pubresponse)=='success'){
			//alert("public"+pubresponse);
			strpubsuccess=1;
			} 
		}
	});	
	return strpubsuccess;
	}
// Ends here
// Whyiitgn
function whyiitgn(){
var whyiitgnData = $("#whyiitgn").serialize();
var strwhysuccess=0;
$.ajax({						
	type: 'POST',
	url: js_site_base_url + 'ajax/ajaxSavewhyiitgn.php',													
	data: whyiitgnData+"&Save=Save&final_submit=1",
async: false,	
	success: function (response) {		
//alert(response);	
		$("#faq2_q53").addClass("in");
			if($.trim(response)=='success'){
			//alert(response);
			 strwhysuccess=1;
			}
	}
});	
return strwhysuccess;
}
//Ends here
//research
function research(){
var researchData = new FormData(document.forms.namedItem("research"));
//var researchData = $("#research").serialize();
var strresearchsuccess=0;
$.ajax({						
	type: 'POST',
	url: js_site_base_url + 'ajax/ajaxSaveResearch.php',													
	data: researchData,
	async: false,
	cache: false,
	contentType: false,
	processData: false,														
	success: function (response) {
		
		$("#faq2_q5").addClass("in");
		if($.trim(response)=='success'){
		//alert(response);
			 strresearchsuccess=1;
			}
	}
});	
return strresearchsuccess;
}
// Ends here
// Referees starts here
function referees(){
	var refereesData = $("#referees").serialize();
	var strrefsuccess=0;
		$.ajax({						
			type: 'POST',
			url: js_site_base_url + 'ajax/ajaxSaveReferees.php',															
			data: refereesData+"&Save=Save&final_submit=1",	
			async: false,			
			success: function (response) {
//alert(response);			
				$("#faq2_q6").addClass("in");
				if($.trim(response)=='success'){
			//	alert(response);
				 strrefsuccess=1;
				}															
			}
		});	
		return strrefsuccess;
		}
// Ends here
// Laboratories
function laboratories(){
	var labData = $("#laboratories").serialize();
	var strlabsuccess=0;
	$.ajax({						
		type: 'POST',
		url: js_site_base_url + 'ajax/ajaxsaveextracourse.php',															
		data: labData+"&Save=Save&final_submit=1",
		async: false,
		success: function (response) {			
//alert(response);		
			$("#faq2_q52").addClass("in");
			if($.trim(response)=='success'){
			//alert(response);
				strlabsuccess=1;
				}	  							
		}
	});	
	return strlabsuccess;
	}
// Ends here
// Teaching starts here
function teaching(){
	var teachingData = $("#teaching").serialize();
	//var teachingData = new FormData(document.forms.namedItem("teaching"));
	var strteachsuccess=0;
	 teach_check=0;pg_check=0;
	 if ($('#tena').is(':checked'))
	 {
		teach_check=1;
	 }	
	if ($('#tepg').is(':checked'))
	 {
	   pg_check=1;
	 }
	$.ajax({						
			type: 'POST',
			url: js_site_base_url + 'ajax/ajaxSaveTeaching.php',																
			data: teachingData+"&Save=Save&final_submit=1&teach_check="+teach_check+"&pg_check="+pg_check,																
			async: false,
			success: function (response) {
			//alert(response);
				$("#faq2_q52").addClass("in");
				if($.trim(response)=='success'){
			//	alert(response);
				 strteachsuccess=1;
				}										
			}
		});
		return strteachsuccess;
		}
// Ends here
// PG Starts here
function pgform(){
		var postgrData = $("#pgFrm").serialize();
		var strpgsuccess=0;
		$.ajax({
			type: 'post',
			url: js_site_base_url + 'ajax/ajaxpostgraduate.php',
			data: postgrData+"&Save=Save&final_submit=1",
			async: false,			
			success: function (response) {
			//alert(response);
				 $("#faq2_q52").addClass("in");
				if($.trim(response)=='success'){
				//alert(response);
				 strpgsuccess=1;
				}
			}
		});
		return strpgsuccess;
		}
// PG Form ends here
// Labfrom starts here
function labform(){
			 teach_check=0;
			 if ($('#tena').is(':checked'))
			  {
				teach_check=1;
			  }	
			var teachcouData = $("#LabFrm").serialize();
			var strteachcosuccess=0;
			 $.ajax({
						type: 'post',
						url: js_site_base_url + 'ajax/ajaxlab.php',
						data: teachcouData+"&Save=Save&final_submit=1&teach_check="+teach_check,
						async: false,
						success: function (response) {
						//alert(response);
							$("#faq2_q52").addClass("in");														
							if($.trim(response)=='success'){
					//		alert(response);
							 strteachcosuccess=1;
							}                          
						}
					});
					return strteachcosuccess;
	}
	// Ends here
	
	 function phdthesis(){
		 var tab2Data = $("#tab2_data").serialize();
		 var strphdsuccess=0;
			$.ajax({						
				type: 'POST',
				url: js_site_base_url + 'ajax/ajaxSaveTab2.php',														
				data: tab2Data+"&Save=Save&final_submit=1",	
				async: false,				
				success: function (response) {

					$("#faq2_q2").addClass("in");														
					if($.trim(response)=='success'){
					//alert(response);
					 strphdsuccess=1;
					}  							
				}
			});	
			return strphdsuccess;
			}
	
	
	function employement(){
			var tab3Data = $("#tab3_data").serialize();
			var strempsuccess=0;
			$.ajax({
				type: 'post',
			   url: js_site_base_url + 'ajax/ajaxSaveemployment.php',
				data: tab3Data,
				async: false,
				success: function (response) {
					$("#faq2_q2").addClass("in");
					if($.trim(response)=='success'){
						strempsuccess=1;
					}
					else if($.trim(response)=='failed'){
						strempsuccess=0;
					}
				}
			});
			return strempsuccess;
	}
	
	function phpExperience(){
			var tab3Data = $("#phd_exp").serialize();
			var strempsuccess=0;
			$.ajax({
				type: 'post',
			   url: js_site_base_url + 'ajax/ajaxSavePhdExp.php',
				data: tab3Data,
				async: false,
				success: function (response) {
					 $("#faq2_q2").addClass("in");	
					 if($.trim(response)=='success'){
					// alert(response);
						 strempsuccess=1;
						}	
				}
			});
			return strempsuccess;
	}
	// Ends here
	// Basic details
	function basicdetails(){
		var bioData = new FormData(document.forms.namedItem("biographdata1"));
		var strbasicsuccess=0;	
		//alert(bioData);

		$.ajax({
			type: 'POST',
			url: js_site_base_url + 'ajax/ajaxSaveTab1.php',
			data: bioData,
			async: false,
			cache: false,
			contentType: false,
			processData: false,																									
			success: function (response) {  
			//alert(response);
				$("#faq2_q1").addClass("in");
				if($.trim(response)=='success'){
				//alert(response);
				 strbasicsuccess=1;
				}								
			}												
		});	
		return strbasicsuccess;
	}
	// Ends here
	// Post attachments application block
	function attachment(){
	 
	  var attachmentData = new FormData(document.forms.namedItem("attachments"));
	  var strattachsuccess=0;
	  //var attachmentData = $("#attachments").serialize();
	  
		$.ajax({						
			type: 'POST',
			url: js_site_base_url + 'ajax/ajaxSaveTab9.php',												
			data: attachmentData,
			async: false,
			cache: false,
			contentType: false,
			processData: false,												
			success: function (response) {
			//alert(response);
			
			$("#faq2_q7").addClass("in");
			if($.trim(response)=='success'  ||  $.trim(response)=='successsuccess'){
				strattachsuccess=1;
				}					
			}
		}); 
		return strattachsuccess;	
	}
	//End of attachments block
	function submitfinal(){
		var declarationData = $("#Final").serialize();
		$.ajax({
			type: 'POST',
			url: js_site_base_url + 'ajax/ajaxSaveAll.php',
			data: declarationData+"&save=save&final_submit=1",
			success: function (response) {
				location.href = js_site_base_url + "application_download.php?aid=" + js_aid;    							
			}
		});
	}

	$("#exp_not_applicable").change(function() {
		var applicable = $(this).filter(':checked').val();
		if(applicable == 'on') {
			  /*$('#research_grants_section').find('input, textarea, button').attr('disabled',true);
			  //$("#research_grants_section").find('.text').css("display","none");
			  //$("#research_grants_section").find('input, textarea, button').css("display","");
			  //$("#Rsanction_text").css("display","none");
			  $('#research_frame').find('iframe').toggle( "slow" );*/
			  /*$('#research_sanction').val('');
			  $('#research_submitted').val('');
			  $('#research_frame').find('iframe').contents().find("body").html('');
			  $('.research_grants_section').hide();
			  $("#research_sanction-error").remove();
			  $("#research_submitted-error").remove();
			  $("#Rsanction_text-error").remove();*/
			  			  
			  $('#grants_section').hide();
			  $('.rgsubbtn').hide();
			  $('.rgresetbtn').hide();
			  var formData = $("#research_grants").serialize();
				 $.ajax({						
					type: 'POST',
					url: js_site_base_url + 'ajax/ajaxSaveResearchGrants.php',   						
					data: formData,							
					success: function (response) {
						
					}
				});	
		
			} else {
				$('#grants_section').show();
				$('.research_grants_section').show();
			  	$('.rgsubbtn').show();
			  	$('.rgresetbtn').show();				
				$('#research_grants_section').find('input, textarea, button').attr('disabled',false);
				 $('.research_grants_section').show();
				  var formData = $("#research_grants").serialize();
				 $.ajax({						
					type: 'POST',
					url: js_site_base_url + 'ajax/ajaxSaveResearchGrants.php',   						
					data: formData,							
					success: function (response) {
						
					}
				});	
			}	
	});

	$("#category").change(function() {
		var selcategory = $(this).val();
		if(selcategory == 'PWD' || selcategory == 'PwD')
			$('#subcatDIV').show();
		else{
			$('#subcat').val('');
			$('#subcatDIV').hide();
		}
	});


		/************ IPS-44183 Other Academic Details 10th & 12th Start *********/
	$("#otheracademicFrm").validate({
    // Rules for form validation
    	rules : {
    		tenthprg : {
    			required : true,
				maxlength:500
    		},
			tenthboard:{
				required:true,
				maxlength:500
			},
    		tenthyear : {
    			required : true
    		},
			tenthper : {
            	required : true,
            	number:true
            },
    		twprg : {
    			required : true,
				maxlength:500
    		},
			twboard:{
				required:true,
				maxlength:500
			},
    		twyear : {
    			required : true
    		},
			twper : {
            	required : true,
            	number:true
            }
        },    		        
    	messages : {
			tenthprg : {
    			required : 'Required',
				maxlength:"Accept only 500 characters"
    		},
    		tenthboard : {
    			required : 'Required',
				maxlength:"Accept only 500 characters"
    		},
			tenthyear : {
    			required : 'Required'
    		},
    		tenthper : {
            	required : 'Required',
            	number:'Please enter a valid number.'
            },
			twprg : {
    			required : 'Required',
				maxlength:"Accept only 500 characters"
    		},
    		twboard : {
    			required : 'Required',
				maxlength:"Accept only 500 characters"
    		},
			twyear : {
    			required : 'Required'
    		},
    		twper : {
            	required : 'Required',
            	number:'Please enter a valid number.'
            }
        },
   		submitHandler: function(form, event) {
			
			var formData = new FormData(document.forms.namedItem("otheracademicFrm"));
    		$.ajax({						
    			type: 'POST',
    			url: js_site_base_url + 'ajax/ajaxSaveOtherQual.php',
    			//data: $(form).serialize(),
				data: formData,
				async: false,
				cache: false,
				contentType: false,
				processData: false,
    			success: function (response) {
					if($.trim(response)=='success'){
  						location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=faq2_otheracd&mode=saveotheracadsuccess";
					}
					else {
						if($.trim(response)=='failed'){
							location.href=js_site_base_url + "facultyapply/" + js_aid + "&tab=faq2_otheracd&mode=saveotheracadfailed";
						}
					}
					return false;
				}
    		});	
    	},
	// Do not change code below
    	errorElement: "span", 
    	errorPlacement : function(error, element) {
    		//error.insertAfter(element.parent());
    		error.insertAfter(element);							
    	}        
   	});

   			/************ IPS-44183 Other Academic Details 10th & 12th End *********/


	/************************ NEW Publications Block START -------- ***************/
	$("[id ^= 'publicationAdd']").on("click", function(){

		var lastid = $("#publicationBlk tr:last").find("[id^='doi_url']").attr("id");

		if (lastid) {
		    // Extract the numeric part from the ID
		    var match = lastid.match(/\d+$/); // Finds the last number in the string
		    if (match) {
		        var lastChar = parseInt(match[0]) + 1; // Increment the extracted number
		    } else {
		        var lastChar = 1; // Default to 1 if no number is found
		    }
		}


	   	var data = '<tr><td><textarea cols="2" rows="2" id="doi_url'+lastChar+'" name="doi_url'+lastChar+'" class="form-control" placeholder="DOI URL: https://doi.org/xx.xxxx/journal.pone.xxxxxxx" oninput="javascript:doitodata(this.value,'+lastChar+',\'pub\');" required></textarea><label style="font-size: 12px;">Max. 1000 Characters are allowed.</label></td><td><textarea cols="2" rows="2" id="pub_title'+lastChar+'" name="pub_title'+lastChar+'" class="form-control" placeholder="Title" required></textarea><label style="font-size: 12px;">Max. 1000 Characters are allowed.</label></td><td><textarea cols="2" rows="2" id="pub_authors'+lastChar+'" name="pub_authors'+lastChar+'" class="form-control" placeholder="Authors"></textarea><label style="font-size: 12px;">Max. 1000 Characters are allowed.</label></td><td><textarea cols="2" rows="2" placeholder="Type min 3 letters to display publication name." class="form-control js_blur_employment " name="jc'+lastChar+'" id="jc'+lastChar+'" required="" aria-required="true" required></textarea><label style="font-size: 12px;">Max. 500 Characters are allowed.</label></td><td><select id="doa'+lastChar+'" name="doa'+lastChar+'" class="form-control" placeholder="Year of Acceptance" required ><option val="">Please Select</option></select></td><td><input type="number" id="c'+lastChar+'" name="c'+lastChar+'" min="1" max="100" class="form-control" placeholder="Your Contribution" required></td> <td onchange="javascript:changeQuartile('+lastChar+',\'pub\');" class="vertical__align_js"><select placeholder="Quartile" class="form-control valid" name="q'+lastChar+'" id="q'+lastChar+'" required="" aria-required="true" aria-invalid="false"><option value="">Please Select</option><option value="Q1">Q1</option><option value="Q2">Q2</option><option value="Q3">Q3</option><option value="NA">NA</option></select></td><td id="lastpubtd'+lastChar+'"><input type="hidden" name="user_fillpub_quartile_flag'+lastChar+'" id="user_fillpub_quartile_flag'+lastChar+'" value="0"><input type="hidden" name="user_filldata_flag'+lastChar+'" id="user_filldata_flag'+lastChar+'" value="0"><a id="pubDelete'+lastChar+'" data-original-title="Delete" href="javascript:void(0)" class="btn btn-alt pubdelbutton btn-sm btn-danger btn-option newTooltip border__radius_js" data-toggle="tooltip" ><i class="fa fa-times"></i></a></td></tr>'; 
	   	$("#publicationBlk").append(data);
	   	$("#doi_url"+lastChar).rules("add", {required:true,maxlength:500, messages: {required:'Required',maxlength:'Max. 1000 Characters are allowed.'}});
	   	$("#pub_title"+lastChar).rules("add", {required:true,maxlength:500, messages: {required:'Required',maxlength:'Max. 1000 Characters are allowed.'}});
		$("#pub_authors"+lastChar).rules("add", {required:true,maxlength:500, messages: {required:'Required',maxlength:'Max. 1000 Characters are allowed.'}});
		$("#jc"+lastChar).rules("add", {required:true,maxlength:500, messages: {required:'Required',maxlength:'Max. 1000 Characters are allowed.'}});
		$("#doa"+lastChar).rules("add", {required:true, messages: {required:'Required'}});
		$("#c"+lastChar).rules("add", {required:true, messages: {required:'Required'}});
		$("#q"+lastChar).rules("add", {required:true, messages: {required:'Required'}});

	   	publication_title_autofill(lastChar);
		// Listen for input changes in pub_title1
	    $("#jc"+lastChar).on("input", function () {
	        if ($(this).val().trim() === "") {
	            resetQuartileField(lastChar);
	        }
	    });

		var currentYear = new Date().getFullYear(); // Get the current year
		var startYear = currentYear - 70; // Define the start year

		// Populate the dropdown
		for (var i = currentYear; i >= startYear; i--) {
		    $('#doa'+lastChar).append($('<option>', {
		        value: i,
		        text: i
		    }));
		}		

	});

	$(".pubdelbutton").click(function () {
	    var del_id = $(this).attr("rowid");
	    var del_id1 = $(this).attr("id");
	    var token = $("input[name='token']").val();
	    var info = 'pubdelid=' + del_id;
	    var row = $(this).closest("tr");
	    var table = row.closest("table");

	    if (confirm("Are you sure you want to delete this row?")) {
	        $.ajax({
	            type: "POST",
	            url: js_site_base_url + "ajax/pub_delete.php",
	            data: info,
	            success: function (response) {
	                row.remove(); // Remove row after successful deletion

	                // Check if the table is now empty (excluding header)
	                if (table.find("tbody tr").length === 0) {
	                    var newRow = `<tr>
                                             <td>
                                                <textarea cols="2" rows="2" placeholder="DOI URL: https://doi.org/xx.xxxx/journal.pone.xxxxxxx" class="form-control js_blur_pub valid" name="doi_url1" id="doi_url1" oninput="javascript:doitodata(this.value,1,'pub');" required="" aria-required="true" aria-invalid="false"></textarea>
                                             </td>                                             
                                             <td>
                                                <textarea cols="2" rows="2" placeholder="Title" class="form-control js_blur_pub valid" name="pub_title1" id="pub_title1" aria-required="true" aria-invalid="false" required ></textarea>
                                             </td>
                                             <td>
                                                <textarea cols="2" rows="2" placeholder="Authors" class="form-control js_blur_pub valid" name="pub_authors1" id="pub_authors1" aria-required="true" aria-invalid="false" required ></textarea>
                                             </td>
                                             <td>
                                                <textarea cols="2" rows="2" placeholder="Type min 3 letters to display publication name." class="form-control js_blur_pub valid" name="jc1" id="jc1" aria-required="true" aria-invalid="false" onchange="javascript:publication_title_autofill('<?php echo $k; ?>');" required ></textarea>
                                             </td>
                                             <td>
                                                <select class="form-control js_blur_pub" name="doa1" id="doa1" required>
                                                   <option value="">Please Select</option>
                                                </select>
                                             </td>
                                             <td>
                                                <input type="number" placeholder="Your Contribution" class="form-control js_blur_pub" name="c1" id="c1" min="1" max="100" required >
                                             </td>
                                             <td>
                                               <select name="q1" id="q1" class="form-control" onchange="javascript:changeQuartile('1','pub');" required>
                                                   <option value="">Please Select</option>
                                                   <option value="Q1">Q1</option>
                                                   <option value="Q2">Q2</option>
                                                   <option value="Q3">Q3</option>
                                                   <option value="NA">NA</option>
                                                </select>
                                             </td>
                                             <td id="lastpubtd1">
                                                <input type="hidden" name="user_fillpub_quartile_flag1" id="user_fillpub_quartile_flag1" value="0">
                                                <input type="hidden" name="user_filldata_flag1" id="user_filldata_flag1" value="0">
                                                <!-- CSRF Token -->
                                                <input type="hidden" name="token" value="`+token+`" />
                                             </td>
                                          </tr>`;

										// Populate the dropdown
										setTimeout(function() {
											var currentYear = new Date().getFullYear(); // Get the current year
											var startYear = currentYear - 70; // Define the start year

										    for (var i = currentYear; i >= startYear; i--) {
										        $('#doa1').append($('<option>', { value: i, text: i }));
										    }
										}, 500); // Adjust delay if needed

	                    table.find("tbody").append(newRow);
	                }
	            }
	        });
	    }
	    return false;
	});
 	/***************************** NEW Publications Block END -------- ********************/





	/************************ NEW Other Publications Block START -------- ***************/
	$("[id ^= 'other_publicationAdd']").on("click", function(){

	    var lastid = $("#other_publicationBlk tr:last").find("[id^='other_pub_title']").attr("id");
		if (lastid) {
		    // Extract the numeric part from the ID
		    var match = lastid.match(/\d+$/); // Finds the last number in the string

		    if (match) {
		        var lastChar = parseInt(match[0]) + 1; // Increment the extracted number
		    } else {
		        var lastChar = 1; // Default to 1 if no number is found
		    }
		}


	   	var data = '<tr><td><textarea cols="2" rows="2" id="other_pub_title'+lastChar+'" name="other_pub_title'+lastChar+'" class="form-control" placeholder="Title" required></textarea><label style="font-size: 12px;">Max. 500 Characters are allowed.</label></td><td><textarea cols="2" rows="2" id="other_pub_authors'+lastChar+'" name="other_pub_authors'+lastChar+'" class="form-control" placeholder="Authors"></textarea><label style="font-size: 12px;">Max. 500 Characters are allowed.</label></td><td><textarea cols="2" rows="2" placeholder="Type min 3 letters to display publication name." class="form-control js_blur_employment " name="other_jc'+lastChar+'" id="other_jc'+lastChar+'" required="" aria-required="true" required></textarea><label style="font-size: 12px;">Max. 500 Characters are allowed.</label></td><td><select id="other_doa'+lastChar+'" name="other_doa'+lastChar+'" class="form-control" required><option value="">Please Select</option></select></td><td><input type="number" id="other_c'+lastChar+'" name="other_c'+lastChar+'" min="1" max="100" class="form-control" placeholder="Your Contribution" required></td><td><input type="hidden" name="user_filldata_flag'+lastChar+'" id="user_filldata_flag'+lastChar+'" value="0"><a id="other_pubDelete'+lastChar+'" data-original-title="Delete" href="javascript:void(0)" class="btn btn-alt other_pubdelbutton btn-sm btn-danger btn-option newTooltip border__radius_js" data-toggle="tooltip" ><i class="fa fa-times"></i></a></td></tr>'; 
	   	$("#other_publicationBlk").append(data);
	   	
	   	$("#other_pub_title"+lastChar).rules("add", {required:true,maxlength:500, messages: {required:'Required',maxlength:"Max. 500 Characters are allowed"}});
		$("#other_pub_authors"+lastChar).rules("add", {required:true,maxlength:500, messages: {required:'Required',maxlength:"Max. 500 Characters are allowed"}});
		$("#other_jc"+lastChar).rules("add", {required:true,maxlength:500, messages: {required:'Required',maxlength:"Max. 500 Characters are allowed"}});
		$("#other_doa"+lastChar).rules("add", {required:true, messages: {required:'Required'}});
		$("#other_c"+lastChar).rules("add", {required:true, messages: {required:'Required'}});

		var currentYear = new Date().getFullYear(); // Get the current year
		var startYear = currentYear - 70; // Define the start year

		// Populate the dropdown
		for (var i = currentYear; i >= startYear; i--) {
		    $('#other_doa'+lastChar).append($('<option>', {
		        value: i,
		        text: i
		    }));
		}
	});

	$(".other_pubdelbutton").click(function(){
			var del_id = $(this).attr("rowid");
			var del_id1 = $(this).attr("id");
			var info = 'other_pubdelid=' + del_id;
			if(confirm("Are you sure you want to delete this row?")){
				$.ajax({
				type: "POST",
				url: js_site_base_url + "ajax/other_pub_delete.php",
				data: info,
				success: function(response){
					
				}
			});
			$(this).closest("tr").remove();
		}
		return false;
	});	

 	/***************************** NEW Publications Block END -------- ********************/





/************************ NEW Conference (Without DOI)  Block START -------- ***************/
	$("[id ^= 'conferenceAdd']").on("click", function(){

	    var lastid = $("#conferenceBlk tr:last").find("[id^='confpub_title']").attr("id");
		console.log(lastid);

		if (lastid) {
		    // Extract the numeric part from the ID
		    var match = lastid.match(/\d+$/); // Finds the last number in the string

		    if (match) {
		        var lastChar = parseInt(match[0]) + 1; // Increment the extracted number
		        console.log("Next ID number: " + lastChar);
		    } else {
		        var lastChar = 1; // Default to 1 if no number is found
		    }
		}

		
	   	var data = '<tr><td><input type="text" id="confpub_title'+lastChar+'" name="confpub_title'+lastChar+'" class="form-control" placeholder="Title" required><label style="font-size: 12px;">Max. 500 Characters are allowed.</label></td><td><input type="text" id="conf_authors'+lastChar+'" name="conf_authors'+lastChar+'" class="form-control" placeholder="Authours"><label style="font-size: 12px;">Max. 500 Characters are allowed.</label></td><td><input type="text" placeholder="Conference" class="form-control js_blur_employment " name="conf_name'+lastChar+'" id="conf_name'+lastChar+'" required="" aria-required="true" onchange="javascript:conf_name_autofill('+lastChar+');"><label style="font-size: 12px;">Max. 500 Characters are allowed.</label></td><td><select data-joindate-id="'+lastChar+'" id="conf_yoa'+lastChar+'" name="conf_yoa'+lastChar+'" class="form-control" placeholder="Year of Acceptance" required></select></td><td><input type="number" id="conf_c'+lastChar+'" name="conf_c'+lastChar+'" min="1" max="100" class="form-control" placeholder="Your Contribution"></td> <td class="vertical__align_js"><select class="form-control valid" name="conf_q'+lastChar+'" id="conf_q'+lastChar+'" required="" aria-required="true" aria-invalid="false"><option value="">Please Select</option><option value="A*">A*</option><option value="A">A</option><option value="B">B</option><option value="NA">NA</option></select></td><td><a id="confDelete'+lastChar+'" data-original-title="Delete" href="javascript:void(0)" class="btn btn-alt confdelbutton btn-sm btn-danger btn-option newTooltip border__radius_js" data-toggle="tooltip" ><i class="fa fa-times"></i></a></td></tr>'; 
	   	$("#conferenceBlk").append(data);
	   	$("#confpub_title"+lastChar).rules("add", {required:true,maxlength:500, messages: {required:'Required',maxlength:"Max. 500 Characters are allowed."}});
		$("#conf_authors"+lastChar).rules("add", {required:true,maxlength:500, messages: {required:'Required',maxlength:"Max. 500 Characters are allowed."}});
		$("#conf_name"+lastChar).rules("add", {required:true,maxlength:500, messages: {required:'Required',maxlength:"Max. 500 Characters are allowed."}});
		$("#conf_yoa"+lastChar).rules("add", {required:true, messages: {required:'Required'}});
		$("#conf_c"+lastChar).rules("add", {required:true, messages: {required:'Required'}});
		$("#conf_q"+lastChar).rules("add", {required:true, messages: {required:'Required'}});

	   	conf_name_autofill(lastChar);
		// Listen for input changes in pub_title1
	    $("#conf_name"+lastChar).on("input", function () {
	        if ($(this).val().trim() === "") {
	            resetconfQuartileField(lastChar);
	        }
	    });

		var currentYear = new Date().getFullYear(); // Get the current year
		var startYear = currentYear - 70; // Define the start year

		// Populate the dropdown
		for (var confyear = currentYear; confyear >= startYear; confyear--) {
		    $('#conf_yoa'+lastChar).append($('<option>', {
		        value: confyear ,
		        text: confyear
		    }));
		}
	});

	$(".confdelbutton").click(function(){
			var del_id = $(this).attr("rowid");
			var del_id1 = $(this).attr("id");
			var info = 'confdelid=' + del_id;
			if(confirm("Are you sure you want to delete this row?")){
				$.ajax({
				type: "POST",
				url: js_site_base_url + "ajax/conf_delete.php",
				data: info,
				success: function(response){
					//alert(response);
				}
			});
			$(this).closest("tr").remove();
		}
		return false;
	});	

 	/***************************** NEW Conference (Without DOI)  Block END -------- ********************/







/************************ NEW Conference (With DOI) Block START -------- ***************/
	$("[id ^= 'doi_conferenceAdd']").on("click", function(){

	    var lastid = $("#doi_conferenceBlk tr:last").find("[id^='doi_confpub_title']").attr("id");
		console.log(lastid);

		if (lastid) {
		    // Extract the numeric part from the ID
		    var match = lastid.match(/\d+$/); // Finds the last number in the string

		    if (match) {
		        var lastChar = parseInt(match[0]) + 1; // Increment the extracted number
		        console.log("Next ID number: " + lastChar);
		    } else {
		        var lastChar = 1; // Default to 1 if no number is found
		    }
		}

		
	   	var data = '<tr><td><textarea cols="2" rows="2" placeholder="DOI URL: https://doi.org/xx.xxxx/journal.pone.xxxxxxx" class="form-control js_blur_pub valid" name="doi_conf_url'+lastChar+'" id="doi_conf_url'+lastChar+'" onchange="javascript:doitodata(this.value,'+lastChar+',\'conf\');" required="" aria-required="true" aria-invalid="false"></textarea><label style="font-size: 12px;">Max. 500 Characters are allowed.</label></td><td><textarea id="doi_confpub_title'+lastChar+'" name="doi_confpub_title'+lastChar+'" class="form-control" placeholder="Title" required></textarea><label style="font-size: 12px;">Max. 500 Characters are allowed.</label></td><td><textarea id="doi_conf_authors'+lastChar+'" name="doi_conf_authors'+lastChar+'" class="form-control" placeholder="Authours"></textarea><label style="font-size: 12px;">Max. 500 Characters are allowed.</label></td><td><textarea placeholder="Conference" class="form-control js_blur_employment " name="doi_conf_name'+lastChar+'" id="doi_conf_name'+lastChar+'" required="" aria-required="true" onchange="javascript:conf_name_autofill('+lastChar+');"></textarea><label style="font-size: 12px;">Max. 500 Characters are allowed.</label></td><td><select data-joindate-id="'+lastChar+'" id="doi_conf_yoa'+lastChar+'" name="doi_conf_yoa'+lastChar+'" class="form-control" placeholder="Year of Acceptance" required></select></td><td><input type="number" id="doi_conf_c'+lastChar+'" name="doi_conf_c'+lastChar+'" min="1" max="100" class="form-control" placeholder="Your Contribution"></td> <td class="vertical__align_js"><select onchange="javascript:changeQuartile('+lastChar+',\'conf\');" class="form-control valid" name="doi_conf_q'+lastChar+'" id="doi_conf_q'+lastChar+'" required="" aria-required="true" aria-invalid="false"><option value="">Please Select</option><option value="A*">A*</option><option value="A">A</option><option value="B">B</option><option value="NA">NA</option></select></td><td id="lastconftd'+lastChar+'"><input type="hidden" name="user_fillconf_quartile_flag'+lastChar+'" id="user_fillconf_quartile_flag'+lastChar+'" value="0"><a id="doi_confDelete'+lastChar+'" data-original-title="Delete" href="javascript:void(0)" class="btn btn-alt doi_confdelbutton btn-sm btn-danger btn-option newTooltip border__radius_js" data-toggle="tooltip" ><i class="fa fa-times"></i></a></td></tr>'; 
	   	$("#doi_conferenceBlk").append(data);
	   	$("#doi_conf_url"+lastChar).rules("add", {required:true, maxlength: 500, messages: {required:'Required', maxlength:'Max. 500 Characters are allowed.'}});
	   	$("#doi_confpub_title"+lastChar).rules("add", {required:true, maxlength: 500, messages: {required:'Required', maxlength:'Max. 500 Characters are allowed.'}});
		$("#doi_conf_authors"+lastChar).rules("add", {required:true, maxlength: 500,  messages: {required:'Required', maxlength:'Max. 500 Characters are allowed.'}});
		$("#doi_conf_name"+lastChar).rules("add", {required:true, maxlength: 500,  messages: {required:'Required', maxlength:'Max. 500 Characters are allowed.'}});
		$("#doi_conf_yoa"+lastChar).rules("add", {required:true, messages: {required:'Required'}});
		$("#doi_conf_c"+lastChar).rules("add", {required:true, messages: {required:'Required'}});
		$("#doi_conf_q"+lastChar).rules("add", {required:true, messages: {required:'Required'}});

	   	conf_name_autofill(lastChar);
		// Listen for input changes in pub_title1
	    $("#doi_conf_name"+lastChar).on("input", function () {
	        if ($(this).val().trim() === "") {
	            resetconfQuartileField(lastChar);
	        }
	    });

		var currentYear = new Date().getFullYear(); // Get the current year
		var startYear = currentYear - 70; // Define the start year

		// Populate the dropdown
		for (var confyear = currentYear; confyear >= startYear; confyear--) {
		    $('#doi_conf_yoa'+lastChar).append($('<option>', {
		        value: confyear ,
		        text: confyear
		    }));
		}
	});

	$(".doi_confdelbutton").click(function(){
			var del_id = $(this).attr("rowid");
			var del_id1 = $(this).attr("id");
			var token = $("input[name='token']").val();
			var info = 'doi_confdelid=' + del_id;
	    	var row = $(this).closest("tr");
	    	var table = row.closest("table");

			if(confirm("Are you sure you want to delete this row?")){
				$.ajax({
				type: "POST",
				url: js_site_base_url + "ajax/doi_conf_delete.php",
				data: info,
				success: function(response){
					row.remove(); // Remove row after successful deletion

					// Check if the table is now empty (excluding header)
	                if (table.find("tbody tr").length === 0) {
	                	 var newRow = `<tr>
                                             <td>
                                             <textarea cols="2" rows="2" placeholder="DOI URL: https://doi.org/xx.xxxx/journal.pone.xxxxxxx" class="form-control js_blur_pub valid" name="doi_conf_url1" id="doi_conf_url1" onchange="javascript:doitodata(this.value,1,'conf');" required="" aria-required="true" aria-invalid="false"></textarea>
                                          </td>
                                             <td>
                                                <textarea cols="2" rows="2" placeholder="Title" class="form-control js_blur_conf" name="doi_confpub_title1" id="doi_confpub_title1" required></textarea>
                                             </td>
                                             <td>
                                                <textarea cols="2" rows="2" type="text" placeholder="Authors" class="form-control js_blur_conf" name="doi_conf_authors1" id="doi_conf_authors1" required></textarea>
                                             </td>
                                             <td>
                                                <textarea cols="2" rows="2" placeholder="Conference" class="form-control js_blur_conf" name="doi_conf_name1" id="doi_conf_name1" data-joindate-id="1" onchange="javascript:conf_name_autofill(1);" required></textarea>
                                             </td>
                                             <td>
                                                <select name="doi_conf_yoa1" id="doi_conf_yoa1" class="form-control" required>
                                                   <option value="">Please Select</option>
                                                </select>
                                             </td>
                                             <td>
                                                <input type="number" placeholder="Your Contribution" class="form-control js_blur_conf" name="doi_conf_c1" id="doi_conf_c1" min="1" max="100" required>
                                             </td>
                                             <td>
                                                <select class="form-control" name="doi_conf_q1" id="doi_conf_q1" onchange="javascript:changeQuartile('1','conf');" required>
                                                   <option value="">Please Select</option>
                                                   <option value="A*">A*</option>
                                                   <option value="A">A</option>
                                                   <option value="B">B</option>
                                                   <option value="NA">NA</option>
                                                </select>
                                             </td>
                                             <td id="lastconftd1">
                                                <input type="hidden" name="user_fillpub_quartile_flag1" id="user_fillpub_quartile_flag1" value="0">
                                                <!-- CSRF Token -->
                                                <input type="hidden" name="token" value="`+token+`" />
                                             </td>
                                          </tr>`;

							// Populate the dropdown
							setTimeout(function() {
								var currentYear = new Date().getFullYear(); // Get the current year
								var startYear = currentYear - 70; // Define the start year

							    for (var i = currentYear; i >= startYear; i--) {
							        $('#doi_conf_yoa1').append($('<option>', { value: i, text: i }));
							    }
							}, 500); // Adjust delay if needed

	                    table.find("tbody").append(newRow);
	                }					
				}
			});
			$(this).closest("tr").remove();
		}
		return false;
	});	

 	/***************************** NEW Conference (With DOI)  Block END -------- ********************/





/************************ NEW Patent Block START -------- ***************/
	$("[id ^= 'patentAdd']").on("click", function(){
	    var lastid = $("#patentBlk tr:last").find("[id^='pat_title']").attr("id");

		if (lastid) {
		    // Extract the numeric part from the ID
		    var match = lastid.match(/\d+$/); // Finds the last number in the string

		    if (match) {
		        var lastChar = parseInt(match[0]) + 1; // Increment the extracted number
		    } else {
		        var lastChar = 1; // Default to 1 if no number is found
		    }
		}

	   	var data = '<tr><td><input type="text" id="pat_title'+lastChar+'" name="pat_title'+lastChar+'" class="form-control" placeholder="Title"><label style="font-size: 12px;">Max. 500 Characters are allowed.</label></td><td><input type="text" id="pat_authors'+lastChar+'" name="pat_authors'+lastChar+'" class="form-control" placeholder="Authours"><label style="font-size: 12px;">Max. 500 Characters are allowed.</label></td><td><input type="number" id="pat_c'+lastChar+'" name="pat_c'+lastChar+'" min="1" max="100" class="form-control" placeholder="Your Contribution"></td><td class="vertical__align_js"><select class="form-control valid" name="pat_type'+lastChar+'" id="pat_type'+lastChar+'" required="" aria-required="true" aria-invalid="false"><option value="">Please Select</option><option value="Patent">Patent</option><option value="Copyright">Copyright</option><option value="Trademark">Trademark</option></select></td><td><input type="text" data-joindate-id="'+lastChar+'" id="pat_dof'+lastChar+'" name="pat_dof'+lastChar+'" class="form-control datefields" placeholder="Date of Filing" value="" required ></td><td><select class="form-control" id="pat_country'+lastChar+'" name="pat_country'+lastChar+'"><option value=""> Select</option><option value="National">National</option><option value="International">International</option></select></td><td><a id="patDelete'+lastChar+'" data-original-title="Delete" href="javascript:void(0)" class="btn btn-alt patdelbutton btn-sm btn-danger btn-option newTooltip border__radius_js" data-toggle="tooltip" ><i class="fa fa-times"></i></a></td></tr>'; 
	   	$("#patentBlk").append(data);
	  	$("#pat_title"+lastChar).rules("add", {required:true, maxlength: 500, messages: {required:'Required', maxlength: 'Max. 500 Characters are allowed.'}});
		$("#pat_authors"+lastChar).rules("add", {required:true, maxlength: 500, messages: {required:'Required', maxlength: 'Max. 500 Characters are allowed.'}});
		$("#pat_c"+lastChar).rules("add", {required:true, messages: {required:'Required'}});
		$("#pat_type"+lastChar).rules("add", {required:true, messages: {required:'Required'}});
		$("#pat_dof"+lastChar).rules("add", {required:true, messages: {required:'Required'}});
		$("#pat_country"+lastChar).rules("add", {required:true, messages: {required:'Required'}});

		bindDatepickers();
		$('.datefields').on('keydown paste', function(e) {
		  e.preventDefault(); // block manual typing and pasting
		});

	});

	$(".patdelbutton").click(function(){
			var del_id = $(this).attr("rowid");
			var del_id1 = $(this).attr("id");
			var info = 'patdelid=' + del_id;
			if(confirm("Are you sure you want to delete this row?"))
			{
				$.ajax({
				type: "POST",
				url: js_site_base_url + "ajax/pat_delete.php",
				data: info,
				success: function(response){
					//alert(response);
				}
			});
			$(this).closest("tr").remove();
		}
		return false;
	});	

 	/***************************** NEW Patent Block END -------- ********************/ 	


/************************ NEW Book Block START -------- ***************/
	$("[id ^= 'bookAdd']").on("click", function(){
	    var lastid = $("#bookBlk tr:last").find("[id^='book_title']").attr("id");

		if (lastid) {
		    // Extract the numeric part from the ID
		    var match = lastid.match(/\d+$/); // Finds the last number in the string

		    if (match) {
		        var lastChar = parseInt(match[0]) + 1; // Increment the extracted number
		    } else {
		        var lastChar = 1; // Default to 1 if no number is found
		    }
		}

	   	var data = '<tr><td><input type="text" id="book_title'+lastChar+'" name="book_title'+lastChar+'" class="form-control" placeholder="Title" required><label style="font-size: 12px;">Max. 500 Characters are allowed.</label></td><td><input type="text" id="book_authors'+lastChar+'" name="book_authors'+lastChar+'" class="form-control" placeholder="Authours" required><label style="font-size: 12px;">Max. 500 Characters are allowed.</label></td><td><input type="number" id="book_c'+lastChar+'" name="book_c'+lastChar+'" min="1" max="100" class="form-control" placeholder="Your Contribution" required></td><td class="vertical__align_js"><select class="form-control valid" name="book_fbc'+lastChar+'" id="book_fbc'+lastChar+'" required="required" aria-required="true" aria-invalid="false"><option value="">Please Select</option><option value="Full Book">Full Book</option><option value="Chapter">Chapter</option><option value="Editing a book">Editing a book</option></select></td><td><input type="text" data-joindate-id="'+lastChar+'" id="book_dop'+lastChar+'" name="book_dop'+lastChar+'" class="form-control datefields" placeholder="Date of Publication" value="" required ></td><td><a id="bookDelete'+lastChar+'" data-original-title="Delete" href="javascript:void(0)" class="btn btn-alt bookdelbutton btn-sm btn-danger btn-option newTooltip border__radius_js" data-toggle="tooltip" ><i class="fa fa-times"></i></a></td></tr>'; 
	   	$("#bookBlk").append(data);
	  	$("#book_title"+lastChar).rules("add", {required:true, maxlength: 500, messages: {required:'Required', maxlength: 'Max. 500 Characters are allowed.'}});
		$("#book_authors"+lastChar).rules("add", {required:true, maxlength: 500, messages: {required:'Required', maxlength: 'Max. 500 Characters are allowed.'}});
		$("#book_c"+lastChar).rules("add", {required:true, messages: {required:'Required'}});
		$("#book_fbc"+lastChar).rules("add", {required:true, messages: {required:'Required'}});
		$("#book_dop"+lastChar).rules("add", {required:true, messages: {required:'Required'}});

		bindDatepickers();
		$('.datefields').on('keydown paste', function(e) {
		  e.preventDefault(); // block manual typing and pasting
		});
	});

	$(".bookdelbutton").click(function(){
			var del_id = $(this).attr("rowid");
			var del_id1 = $(this).attr("id");
			var info = 'bookdelid=' + del_id;
			if(confirm("Are you sure you want to delete this row?"))
			{
				$.ajax({
				type: "POST",
				url: js_site_base_url + "ajax/book_delete.php",
				data: info,
				success: function(response){
					//alert(response);
				}
			});
			$(this).closest("tr").remove();
		}
		return false;
	});	

 	/***************************** NEW Book Block END -------- ********************/ 	 	



/***************************** For Publications Auto-fill START -------- ********************/

	function publication_title_autofill(pub_title_id){
		$("#jc"+pub_title_id).autocomplete({
		    source: function (request, response) {
	            $.ajax({
	                url: "ajax/fetch_titles.php",
	                dataType: "json",
	                data: { term: request.term },
	                success: function (data) {
	                	console.log(data);
	                   response(data);
	                },
	                error: function (data){
	                	$("#q"+pub_title_id).val('');
	                }
	            });
		    },
		    minLength: 3,
		    select: function (event, ui) {
		        // Populate the input field with the selected title
		        $(this).val(ui.item.label);

		        // Fetch sjr_best_quartile for the selected title
		        $.ajax({
		            url: "ajax/fetch_quartile.php",
		            dataType: "json",
		            data: { title: ui.item.label },
		            success: function (data) {
		        	    if (data && data.sjr_best_quartile) {
		                    const quartileValue = data.sjr_best_quartile;
		                    const dropdown = $("#q"+pub_title_id);

		                    // Check if the value exists in the dropdown options
		                    //if (dropdown.is("select") && dropdown.find(`option[value="${quartileValue}"]`).length > 0) {
		                        dropdown.val(quartileValue); // Set value in the dropdown
		                    //}
		                        /*
		                    else {
		                       // Replace dropdown with a text box
		                    	
		                        dropdown.replaceWith(
		                    	   `<input type="text" class="form-control" name="q`+pub_title_id+`" id="q`+pub_title_id+`" value="${quartileValue}" required="" aria-required="true" placeholder="Quartile" readonly>`
		                        );
		                        
		                    }
		                    */
		                }
		                else {
		                        // Reset dropdown if no match is found
		                        resetQuartileField(pub_title_id);
		                }
		            }
		        });
		            // Close the autocomplete dropdown to remove <ul><li> elements
		            //$(this).autocomplete("close");
		            //return false;
		    },
			close: function () {
            	// Remove <ul> elements manually if they persist
            	//$(".ui-autocomplete").remove();
        	}		    
		});
	}

    // Listen for input changes in pub_title1
    $("#jc1").on("input", function () {
        if ($(this).val().trim() === "") {
            resetQuartileField(1);
        }
    });

    // Function to reset the q1 field
    function resetQuartileField(pub_title_id) {
        const quartileField = $("#q"+pub_title_id);

        // Replace text box with dropdown if it was replaced
        if (quartileField.is("input")) {
            quartileField.replaceWith(`
                <select class="form-control" name="q`+pub_title_id+`" id="q`+pub_title_id+`" required="" aria-required="true">
                    <option value="">Please Select</option>
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="NA">NA</option>
                </select>
            `);
        } else {
            quartileField.val(""); // Reset dropdown to default state
        }
    }	

/***************************** For Publications Auto-fill END -------- ********************/




function showdesignother(rowkey){
	var selectedopt = $('#designation'+rowkey).val();
	if(selectedopt == 'Other' ){
		$('#designation_other'+rowkey).show();
	}
	else if(selectedopt == 'In between jobs' ){
		$('#salary'+rowkey).val('N/A');
	}
	else{
		$('#designation_other'+rowkey).val('');
		$('#designation_other'+rowkey).hide();
	}	
}


function filldatafordegreeother(rowkey){
	var selectedopt = $('#degree'+rowkey).val();
	if(selectedopt == 'Other' ){
		$('#specialization'+rowkey).val('In Transit/Gap');
		$('#college'+rowkey).val('N/A');
		$('#university'+rowkey).val('N/A');
		$('#grade_type'+rowkey).val('Other');
		$('#percentage'+rowkey).val('0');
		$('#college'+rowkey).attr('readonly', 'readonly');
		$('#university'+rowkey).attr('readonly', 'readonly');
		$('#grade_type'+rowkey).attr('readonly', 'readonly');
		$('#percentage'+rowkey).attr('readonly', 'readonly');		
	}
	else {
		$('#specialization'+rowkey).val('');
		$('#college'+rowkey).val('');
		$('#university'+rowkey).val('');
		$('#grade_type'+rowkey).val('');
		$('#percentage'+rowkey).val('');
	}
}


function filldataforprogram(rowkey){
	var selectedopt = $('#specialization'+rowkey).val();
	if(selectedopt == 'In Transit/Gap' ){
		$('#college'+rowkey).attr('readonly', 'readonly');
		$('#university'+rowkey).attr('readonly', 'readonly');
		$('#grade_type'+rowkey).attr('readonly', 'readonly');		
		$('#percentage'+rowkey).attr('readonly', 'readonly');
	}
	else {
		$('#college'+rowkey).val('');
		$('#university'+rowkey).val('');
		$('#grade_type'+rowkey).val('');
		$('#percentage'+rowkey).val('');		
		$('#college'+rowkey).removeAttr('readonly');
		$('#university'+rowkey).removeAttr('readonly');
		$('#grade_type'+rowkey).removeAttr('readonly');
		$('#percentage'+rowkey).removeAttr('readonly');
	}
}


function doitodata(doi_url,key,block_flg){
	$.ajax({
        type: 'post',
        url: js_site_base_url + 'ajax/ajaxDOItocitation.php',
        data: "doi="+doi_url,
        dataType: "json",
		success: function(data){
			if(data.status == 'NF'){
				alert('Failed to fetch your details. Please fill them manually.');
				if(block_flg == 'pub'){
					$('#pub_title'+key).val('');
					$('#pub_authors'+key).val('');
					$('#jc'+key).val('');
					$('#doa'+key).val('');
					$('#c'+key).val('');
					$('#q'+key).val('');
					$('#user_filldata_flag'+key).val('1');
				}
				else if(block_flg == 'conf'){
					$('#doi_confpub_title'+key).val('');
					$('#doi_conf_authors'+key).val('');
					$('#doi_conf_name'+key).val('');
					$('#doi_conf_yoa'+key).val('');
					$('#doi_conf_c'+key).val('');
					$('#doi_conf_q'+key).val('');
				}
			}
			else{
				if(block_flg == 'pub'){
					$('#pub_title'+key).val(data.pub_title);
					$('#pub_authors'+key).val(data.pub_authors);
					$('#jc'+key).val(data.jc);
					$('#doa'+key).val(data.doa);
					$('#c'+key).val(data.c);
					$('#q'+key).val(data.q);
					$('#user_filldata_flag'+key).val('0');
					if(data.q != ''){
						$('#user_fillpub_quartile_flag'+key).val('0');
						$('#lastpubtd'+key+' .caret-symbol').remove();
					}
					$('#doi_url' + key).attr("readonly", "readonly");
					if(key == 1){
						$('#lastpubtd'+key).append('<a id="pubDelete'+key+'" data-original-title="Delete" href="javascript:void(0)" class="btn btn-alt btn-sm btn-danger btn-option newTooltip border__radius_js" data-toggle="tooltip" ><i class="fa fa-times"></i></a>');
					}
				}
				else if(block_flg == 'conf'){
					$('#doi_confpub_title'+key).val(data.pub_title);
					$('#doi_conf_authors'+key).val(data.pub_authors);
					$('#doi_conf_name'+key).val(data.jc);
					$('#doi_conf_yoa'+key).val(data.doa);
					$('#doi_conf_c'+key).val(data.c);
					$('#doi_conf_q'+key).val(data.q);
					if(data.q != ''){
						$('#lastconftd'+key+' .caret-symbol').remove();
					}
					$('#doi_conf_url' + key).attr("readonly", "readonly");
					if(key == 1){
						$('#lastconftd'+key).append('<a id="doi_confDelete'+key+'" data-original-title="Delete" href="javascript:void(0)" class="btn btn-alt btn-sm btn-danger btn-option newTooltip border__radius_js" data-toggle="tooltip" ><i class="fa fa-times"></i></a>');
					}					
				}
			}
			if(data.status == 'NF'){

				// Year Dropdown --- START
				var $textbox_doa = $('#doa' + key); // Select the textbox using the ID
				var currentYear = new Date().getFullYear(); // Get the current year
				var startYear = currentYear - 70; // Define the start year

				// Create a new dropdown element
				var $dropdown_doa = $('<select>', {
				    id: 'doa' + key, // Use the same ID as the textbox
				    name: 'doa' + key, // Use the same name attribute
				    class: 'form-control', // Add a class to the dropdown
				    required: true // Add required attribute
				});

				// Add a default "Please Select" option
				$dropdown_doa.append($('<option>', {
				    value: '',
				    text: 'Please Select'
				}));

				// Populate the dropdown with year options
				for (var i = currentYear; i >= startYear; i--) {
				    $dropdown_doa.append($('<option>', {
				        value: i,
				        text: i
				    }));
				}

				// Replace the textbox with the dropdown
				$textbox_doa.replaceWith($dropdown_doa);
				// Year Dropdown --- END



				// Get the textbox by ID
				var $textbox = $('#q'+key);

				// Create a new dropdown element
		        var $dropdown = $('<select>', {
		            id: 'q'+key, // Use the same ID as the textbox
		            name: 'q'+key, // Use the same name attribute
		            class: 'form-control', // Add a class to the dropdown
		            required: true
		        });

		        // Add options to the dropdown
		        var options = [
		            { value: '', text: 'Please Select' },
		            { value: 'Q1', text: 'Q1' },
		            { value: 'Q2', text: 'Q2' },
		            { value: 'Q3', text: 'Q3' },
		            { value: 'NA', text: 'NA' }
		        ];

		        $.each(options, function (index, optionData) {
		            $dropdown.append($('<option>', {
		                value: optionData.value,
		                text: optionData.text
		            }));
		        });

		        // Replace the textbox with the dropdown
		        $textbox.replaceWith($dropdown);				
			}
			else{
				$('#q'+key).val(data.q);
				//$('#q'+key).attr('readonly', 'readonly');
			}
        },
		error: function () {
    		alert('Failed to load data');
		}
    });
}



/***************************** For Conference Auto-fill START -------- ********************/

	function conf_name_autofill(inc_id){
		/*
		$("#conf_name"+inc_id).autocomplete({
		    source: function (request, response) {
	            $.ajax({
	                url: "ajax/fetch_titles.php",
	                dataType: "json",
	                data: { term: request.term },
	                success: function (data) {
	                	console.log(data);
	                   response(data);
	                },
	                error: function (data){
	                	$("#conf_q"+inc_id).val('');
	                }
	            });
		    },
		    minLength: 3,
		    select: function (event, ui) {
		        // Populate the input field with the selected title
		        $(this).val(ui.item.label);

		        // Fetch sjr_best_quartile for the selected title
		        $.ajax({
		            url: "ajax/fetch_quartile.php",
		            dataType: "json",
		            data: { title: ui.item.label },
		            success: function (data) {
		        	    if (data && data.sjr_best_quartile) {
		                    const quartileValue = data.sjr_best_quartile;
		                    const dropdown = $("#conf_q"+inc_id);

		                    // Check if the value exists in the dropdown options
		                    if (dropdown.is("select") && dropdown.find(`option[value="${quartileValue}"]`).length > 0) {
		                        dropdown.val(quartileValue); // Set value in the dropdown
		                    }
		                    else {
		                       // Replace dropdown with a text box
		                        dropdown.replaceWith(
		                    	   `<input type="text" class="form-control" name="conf_q`+inc_id+`" id="conf_q`+inc_id+`" value="${quartileValue}" required="" aria-required="true" placeholder="Quartile" readonly>`
		                        );
		                    }
		                }
		                else {
		                        // Reset dropdown if no match is found
		                        resetconfQuartileField(inc_id);
		                }
		            }
		        });
		            // Close the autocomplete dropdown to remove <ul><li> elements
		            //$(this).autocomplete("close");
		            //return false;
		    },
			close: function () {
            	// Remove <ul> elements manually if they persist
            	//$(".ui-autocomplete").remove();
        	}		    
		});
		*/
	}

    // Listen for input changes in confpub_title1
    $("#conf_name1").on("input", function () {
        if ($(this).val().trim() === "") {
            resetconfQuartileField(1);
        }
    });

    // Function to reset the q1 field
    function resetconfQuartileField(inc_id) {
        const quartileField = $("#conf_q"+inc_id);

        // Replace text box with dropdown if it was replaced
        if (quartileField.is("input")) {
            quartileField.replaceWith(`
                <select class="form-control" name="conf_q`+inc_id+`" id="conf_q`+inc_id+`" required="" aria-required="true">
                    <option value="">Please Select</option>
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                </select>
            `);
        } else {
            quartileField.val(""); // Reset dropdown to default state
        }
    }	

/***************************** For Conference Auto-fill END -------- ********************/


/***************************** Next Button Logic for each Sections START 24.01.2025*************/


function checkBasicTab(js_aid) {
  return $.ajax({
    type: 'post',
    url: js_site_base_url + 'ajax/ajaxcheckBasicTab.php',
    data: "aid=" + js_aid,
    success: function (data) {
      //console.log("Response from server:", data);
    },
    error: function () {
      alert('Failed to load data');
    }
  });
}
function edustep(js_aid) {
  checkBasicTab(js_aid).done(function (response) {
    const trimmedResponse = $.trim(response);

    if (trimmedResponse === 'success') {
      // Proceed with enabling educational tab
	  $(".edu_div").attr("disabled", false);
      $('.edu_div').find('*').prop('disabled', false); // Enable child elements
      $('#eduInfoTab').removeClass('collapsed');
      $("#eduInfoTab").attr("href", "#faq2_q2");
      $('#faq2_q2').addClass('in');
      //$('#basicInfoTab').addClass('collapsed');
      //$('#faq2_q1').removeClass('in');
    } else {
      alert("Please make sure to save your work before continuing.");
      return false;
    }
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.error("AJAX call failed:", textStatus, errorThrown);
  });
}



function checkEduTab(js_aid){
 	let successeduflg = 0;
 	return  $.ajax({
        type: 'post',
        url: js_site_base_url + 'ajax/ajaxcheckEduTab.php',
        data: "aid="+js_aid,
		success: function(data){
			if($.trim(data)=='success'){
				successeduflg = 1;
			}
			else{
				successeduflg = 0;
			}
        },
		error: function () {
    		//alert('Failed to load data');
    		successeduflg = 0;
		}
    });
    return successeduflg;
}
function empstep(js_aid) {
  checkEduTab(js_aid).done(function (response) {
    const trimmedResponse = $.trim(response);

    if (trimmedResponse === 'success') {
      // Proceed with enabling educational tab
	  $(".emp_div").attr("disabled", false);
      $('.emp_div').find('*').prop('disabled', false); // Enable child elements
      $('#empInfoTab').removeClass('collapsed');
      $("#empInfoTab").attr("href", "#faq2_q3");
      $('#faq2_q3').addClass('in');
    } else {
      alert("Please make sure to save your work before continuing.");
      return false;
    }
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.error("AJAX call failed:", textStatus, errorThrown);
  });
}



function checkEmpTab(js_aid){
 	let successeduflg = 0;
 	return  $.ajax({
        type: 'post',
        url: js_site_base_url + 'ajax/ajaxcheckEmpTab.php',
        data: "aid="+js_aid,
		success: function(data){
			if($.trim(data)=='success'){
				successeduflg = 1;
			}
			else{
				successeduflg = 0;
			}
        },
		error: function () {
    		//alert('Failed to load data');
    		successeduflg = 0;
		}
    });
}
function pubstep(js_aid) {
  checkEmpTab(js_aid).done(function (response) {
    const trimmedResponse = $.trim(response);
    if (trimmedResponse != 'success') {
    	alert("Please make sure to save your work before continuing.");
    }
     // Proceed with enabling educational tab
	  $(".pub_div").attr("disabled", false);
      $('.pub_div').find('*').prop('disabled', false); // Enable child elements
      $('#pubInfoTab').removeClass('collapsed');
      $("#pubInfoTab").attr("href", "#faq2_q51");
      $('#faq2_q51').addClass('in');
    
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.error("AJAX call failed:", textStatus, errorThrown);
  });
}


function checkPubTab(js_aid){
 	let successeduflg = 0;
 	return  $.ajax({
        type: 'post',
        url: js_site_base_url + 'ajax/ajaxcheckPubTab.php',
        data: "aid="+js_aid,
		success: function(data){
			if($.trim(data)=='success'){
				successeduflg = 1;
			}
			else{
				successeduflg = 0;
			}
        },
		error: function () {
    		//alert('Failed to load data');
    		successeduflg = 0;
		}
    });
}
function resgrantstep(js_aid) {
  checkPubTab(js_aid).done(function (response) {
    //const trimmedResponse = $.trim(response);
	const trimmedResponse = 'success';
    if (trimmedResponse === 'success') {
      // Proceed with enabling educational tab
	  $(".rg_div").attr("disabled", false);
      $('.rg_div').find('*').prop('disabled', false); // Enable child elements
      $('#rgInfoTab').removeClass('collapsed');
      $("#rgInfoTab").attr("href", "#faq2_q8");
      $('#faq2_q8').addClass('in');
    } else {
      alert("Please make sure to save your work before continuing.");
      return false;
    }
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.error("AJAX call failed:", textStatus, errorThrown);
  });
}



function checkRGTab(js_aid){
 	let successeduflg = 0;
 	return  $.ajax({
        type: 'post',
        url: js_site_base_url + 'ajax/ajaxcheckRGTab.php',
        data: "aid="+js_aid,
		success: function(data){
			if($.trim(data)=='success'){
				successeduflg = 1;
			}
			else{
				successeduflg = 0;
			}
        },
		error: function () {
    		//alert('Failed to load data');
    		successeduflg = 0;
		}
    });
    return successeduflg;
}
function researchstep(js_aid) {
checkRGTab(js_aid).done(function (response) {
    const trimmedResponse = $.trim(response);
    if (trimmedResponse !== 'success') {
      alert("Please make sure to save your work before continuing.");
    }
	  // Proceed with enabling tab
	  $(".research_div").attr("disabled", false);
	  $('.research_div').find('*').prop('disabled', false); // Enable child elements
	  $('#researchInfoTab').removeClass('collapsed');
	  $("#researchInfoTab").attr("href", "#faq2_q5");
	  $('#faq2_q5').addClass('in');
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.error("AJAX call failed:", textStatus, errorThrown);
  });	
}





function checkResTab(js_aid){
 	let successeduflg = 0;
 	return  $.ajax({
        type: 'post',
        url: js_site_base_url + 'ajax/ajaxcheckResTab.php',
        data: "aid="+js_aid,
		success: function(data){
			if($.trim(data)=='success'){
				successeduflg = 1;
			}
			else{
				successeduflg = 0;
			}
        },
		error: function () {
    		//alert('Failed to load data');
    		successeduflg = 0;
		}
    });
    return successeduflg;
}
function teachingstep(js_aid) {
  checkResTab(js_aid).done(function (response) {
    const trimmedResponse = $.trim(response);

    if (trimmedResponse === 'success') {
      // Proceed with enabling educational tab
	  $(".teaching_div").attr("disabled", false);
      $('.teaching_div').find('*').prop('disabled', false); // Enable child elements
      $('#teachingInfoTab').removeClass('collapsed');
      $("#teachingInfoTab").attr("href", "#faq2_q52");
      $('#faq2_q52').addClass('in');
    } else {
      alert("Please make sure to save your work before continuing.");
      return false;
    }
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.error("AJAX call failed:", textStatus, errorThrown);
  });
}



function checkTeachingTab(js_aid){
 	let successeduflg = 0;
 	return  $.ajax({
        type: 'post',
        url: js_site_base_url + 'ajax/ajaxcheckTeachingTab.php',
        data: "aid="+js_aid,
		success: function(data){
			if($.trim(data)=='success'){
				successeduflg = 1;
			}
			else{
				successeduflg = 0;
			}
        },
		error: function () {
    		//alert('Failed to load data');
    		successeduflg = 0;
		}
    });
    return successeduflg;
}
function refereestep(js_aid) {
  checkTeachingTab(js_aid).done(function (response) {
    const trimmedResponse = $.trim(response);

    if (trimmedResponse === 'success') {
      // Proceed with enabling educational tab
	  $(".referee_div").attr("disabled", false);
      $('.referee_div').find('*').prop('disabled', false); // Enable child elements
      $('#refereeInfoTab').removeClass('collapsed');
      $("#refereeInfoTab").attr("href", "#faq2_q6");
      $('#faq2_q6').addClass('in');
    } else {
      alert("Please make sure to save your work before continuing. PDF file for Teaching Statement needs to be uploaded.");
      return false;
    }
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.error("AJAX call failed:", textStatus, errorThrown);
  });
}



function checkRefereeTab(js_aid){
 	let successeduflg = 0;
 	return  $.ajax({
        type: 'post',
        url: js_site_base_url + 'ajax/ajaxcheckRefereeTab.php',
        data: "aid="+js_aid,
		success: function(data){
			if($.trim(data)=='success'){
				successeduflg = 1;
			}
			else{
				successeduflg = 0;
			}
        },
		error: function () {
    		//alert('Failed to load data');
    		successeduflg = 0;
		}
    });
    return successeduflg;
}
function attachstep(js_aid) {
  checkRefereeTab(js_aid).done(function (response) {
    const trimmedResponse = $.trim(response);

    if (trimmedResponse === 'success') {
      // Proceed with enabling educational tab
	  $(".attach_div").attr("disabled", false);
      $('.attach_div').find('*').prop('disabled', false); // Enable child elements
      $('#attachInfoTab').removeClass('collapsed');
      $("#attachInfoTab").attr("href", "#faq2_q7");
      $('#faq2_q7').addClass('in');
    } else {
      alert("Please make sure to save your work before continuing.");
      return false;
    }
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.error("AJAX call failed:", textStatus, errorThrown);
  });
}



function checkAttachTab(js_aid,is_iitgn_emp_flg,employmentucounts){
 	let successeduflg = 0;
 	return  $.ajax({
        type: 'post',
        url: js_site_base_url + 'ajax/ajaxcheckAttachTab.php',
        data: "aid="+js_aid+"&is_iitgn_emp_flg="+is_iitgn_emp_flg+"&employmentucounts="+employmentucounts,
		success: function(data){
			if($.trim(data)=='success'){
				successeduflg = 1;
			}
			else{
				successeduflg = 0;
			}
        },
		error: function () {
    		//alert('Failed to load data');
    		successeduflg = 0;
		}
    });
    return successeduflg;
}

function laststep(js_aid) {
	var is_iitgn_emp_flg = document.getElementById("is_iitgn_emp").value;
	var employmentucounts = parseInt(document.getElementById("employmentucounts").value);

	var isEmployee = (is_iitgn_emp_flg === 'Yes');
	var hasEmployment = (employmentucounts > 0);

	// Condition: Only allow direct access when Yes & employment count = 0
	if (isEmployee && !hasEmployment) {
		console.log('1. IF condition');
	    // ✅ Enable directly
	    enableFinalSection();
	} else {
		console.log('2. ELSE condition');
	    // ❌ Disable, check for mandatory attachments
	    checkAttachTab(js_aid, is_iitgn_emp_flg, employmentucounts).done(function (response) {
	        const trimmedResponse = $.trim(response);
	        if (trimmedResponse === 'success') {
	        	console.log('3. IF condition');
	            enableFinalSection();
	        } else {
	        	console.log('4. IF condition');
	            alert("Please make sure to upload and save mandatory files in attachment before continuing.");
	            return false;
	        }
	    }).fail(function (jqXHR, textStatus, errorThrown) {
	        console.error("AJAX call failed:", textStatus, errorThrown);
	    });
	}
}

// Reusable utility function
function enableFinalSection() {
    $(".final_div").attr("disabled", false);
    $('.final_div').find('*').prop('disabled', false); // Enable child elements
    $('#declartaionTab').removeClass('collapsed');
    $("#declartaionTab").attr("href", "#faq2_q531");
    $('#faq2_q531').addClass('in');
}



function checkResetButtons(js_aid){
  	checkBasicTab(js_aid).done(function (response) {
    	const trimmedResponse = $.trim(response);
		if (trimmedResponse === 'success') {
			$('#basicResetBtn').hide();
    	}
    });

  	checkEduTab(js_aid).done(function (response) {
    	const trimmedResponse = $.trim(response);
		if (trimmedResponse === 'success') {
			$('#eduResetBtn1').hide();
			$('#eduResetBtn2').hide();
    	}
    });

  	checkEmpTab(js_aid).done(function (response) {
    	const trimmedResponse = $.trim(response);
		if (trimmedResponse === 'success') {
			$('#empResetBtn').hide();
    	}
    }); 

  	checkPubTab(js_aid).done(function (response) {
  		console.log(response);
    	const trimmedResponse = $.trim(response);
		if (trimmedResponse === 'success') {
			$('#pubResetBtn1').hide();
			$('#pubResetBtn2').hide();
			$('#pubResetBtn3').hide();
			$('#pubResetBtn4').hide();
			$('#pubResetBtn5').hide();
			$('#pubResetBtn6').hide();
    	}
    });


  	checkResTab(js_aid).done(function (response) {
    	const trimmedResponse = $.trim(response);
		if (trimmedResponse === 'success') {
			$('#rgResetBtn').hide();
			$('#resResetBtn').hide();
    	}
    });            


  	checkTeachingTab(js_aid).done(function (response) {
    	const trimmedResponse = $.trim(response);
		if (trimmedResponse === 'success') {
			$('#teachingResetBtn1').hide();
			$('#teachingResetBtn2').hide();
			$('#teachingResetBtn3').hide();
    	}
    });


  	checkRefereeTab(js_aid).done(function (response) {
    	const trimmedResponse = $.trim(response);
		if (trimmedResponse === 'success') {
			$('#refereeResetBtn').hide();
    	}
    });    

  	checkAttachTab(js_aid).done(function (response) {
    	const trimmedResponse = $.trim(response);
		if (trimmedResponse === 'success') {
			$('#attachResetBtn').hide();
    	}
    });
}



function changeQuartile(quartile_id,block_flg){
	if(block_flg == 'pub'){
		$('#lastpubtd'+quartile_id+' .caret-symbol').remove();
		$('#user_fillpub_quartile_flag'+quartile_id).val('1');
		$('#lastpubtd'+quartile_id).append('<span class="caret-symbol"> #</span>').show();
	}
	else if(block_flg == 'conf'){
		$('#lastconftd'+quartile_id+' .caret-symbol').remove();
		$('#user_fillconf_quartile_flag'+quartile_id).val('1');
		$('#lastconftd'+quartile_id).append('<span class="caret-symbol"> #</span>').show();
	}
}


function checkAllRequiredSections(js_aid,is_iitgn_emp_flg){

 	//Check mandatory details are available unless Submit Button is enabled.
 	$.ajax({
        type: 'post',
        url: js_site_base_url + 'ajax/ajaxcheckSections.php',
        data: "aid="+js_aid+"&flg="+is_iitgn_emp_flg,
		success: function(data){
			if($.trim(data)=='success'){
				$(".submitBtn").attr("disabled", false);
			}
			else{
				$(".submitBtn").attr("disabled", true);
			}
        },
		error: function () {
    		//alert('Failed to load data');
		}
    });
}
