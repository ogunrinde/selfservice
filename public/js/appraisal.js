$(function(){
  $('.start').css('display', 'block');
  $('.start h4').text('Staff');
  var $slide = $("#slides");      // Cache the elements you plan to reuse!
  var $pages = $slide.children(); // Get the actual slides pages
  var slideW = $slide.width();
  var c = 0;                      // Use a counter
  let title = ['Appraisal Details', 'Performance Evaluation'];
  let curr = c;
  let remark = [];
  let list ="";
  let justification = [];
  $(".head_title").text(title[c]);
  // Use classes instead of ID!
  $('.prev, .next').click(function( e ){
    let curr =  $("#"+this.id+"").attr("curr");
    //alert($("#staff_remarks"+curr+"").val());
    if($("#staff_remarks"+curr+"").val() === undefined) return;
    //alert($("#all_grades").val());
  	e.preventDefault();
    c = $(this).is(".next") ? ++c : --c;       
    if(c > curr) $(".head_title").text(title[1]);
    else $(".head_title").text(title[0]);
    $slide.animate({scrollLeft: slideW * c }, 600);  // Anim by multiplying
  });
  $('#upload').on('click', function(){
    $('#file').trigger('click');
  });
  $("#submit_btn").on('click', function(){
     if(justification.length === 0) return false;
     if(remark === 0) return false;
     let year = $('#app_year').val();
     $.ajax({
       method: 'post',
       url : '/process_data',
       data : {justification : justification, remark : remark, year : year},
       success: function(data){

       }
     })
  });
  $('.justify').on('focusout', function(req,res){
    justification.push($("#"+this.id+"").val() == undefined ? '' : $("#"+this.id+"").val());
  });
  $("input[name='radio']").click(function(e){
    const radio = $("input[name='radio']:checked").val();
    $.ajax({
      method: 'post',
      url: '/usercategory',
      data: {category: radio},
      success: function(data){
         if(data.success == true) {
          Swal.fire({
            position: 'top-end',
            type: 'success',
            title: 'Your Updated has been Noted.',
            showConfirmButton: false,
            timer: 2500
          })
         }
      }
    })
  });
  function remove(){
    alert("s");
  }
  $('.getdata').on('click', function(e){
      let val = $("#"+this.id+"").attr('year');
      alert(val);
      $("#addyear").val(val);
      $("#submityear").trigger('click');
  });
  $(".list-group .list-group-item .remove").click(function(e){
     let data = $("#"+this.id+"").attr(data);
     let dataInArr = [];
     dataInArr = $("#dept_list").val().split(";");
     let index = dataInArr.indexOf(data);
     //alert(index);
  });
  $("#AddDept").on("click", function(e){
    e.preventDefault();
    let rand = Math.random() * 9999999999;
    let val = $("#company_dept").val().toLowerCase();
    if(val == "") return false; 
    let list = $("#dept_list").val();
    if(list == ''){
      $("#dept_list").val(val);
    }else {
      $("#dept_list").val(list+";"+val);
    }
    //alert($("#dept_list").val());
    $('.list-group').append('<li class="list-group-item" style = "text-transform: capitalize">'+val+'</li>');
    $("#company_dept").val('');
  });
  $('#uploadimg').on('click', function(e){
     $("#file").trigger('click');
  });
  $('#uploadprofile').on('click', function(e){
    $("#profile").trigger('click');
 });
 $('.grade').on('click', function(e){
   let curr =  $("#"+this.id+"").attr("curr");
   if(this.id.charAt(0) == 'a') {
    $("#"+this.id+"").removeClass('btn-outline-secondary');
    $("#b"+curr+"").addClass('btn-outline-secondary');
    $("#c"+curr+"").addClass('btn-outline-secondary');
    $("#d"+curr+"").addClass('btn-outline-secondary');
    $("#e"+curr+"").addClass('btn-outline-secondary');
    $("#staff_remarks"+curr+"").val('a');
    $("#"+this.id+"").addClass('btn-success');
   }else if(this.id.charAt(0) == 'b') {
    $("#"+this.id+"").removeClass('btn-outline-secondary');
    $("#a").addClass('btn-outline-secondary');
    $("#c").addClass('btn-outline-secondary');
    $("#d").addClass('btn-outline-secondary');
    $("#e").addClass('btn-outline-secondary');
    $("#"+this.id+"").addClass('btn-success');
    $("#staff_remarks"+curr+"").val('b');
   }else if(this.id.charAt(0) == 'c') {
    $("#"+this.id+"").removeClass('btn-outline-secondary');
    $("#b").addClass('btn-outline-secondary');
    $("#a").addClass('btn-outline-secondary');
    $("#d").addClass('btn-outline-secondary');
    $("#e").addClass('btn-outline-secondary');
    $("#"+this.id+"").addClass('btn-primary');
    $("#staff_remarks"+curr+"").val('c');
   }else if(this.id.charAt(0) == 'd') {
    $("#"+this.id+"").removeClass('btn-outline-secondary');
    $("#b").addClass('btn-outline-secondary');
    $("#c").addClass('btn-outline-secondary');
    $("#a").addClass('btn-outline-secondary');
    $("#e").addClass('btn-outline-secondary');
    $("#"+this.id+"").addClass('btn-danger');
    $("#staff_remarks"+curr+"").val('d');
   }else if(this.id.charAt(0) == 'e') {
    $("#"+this.id+"").removeClass('btn-outline-secondary');
    $("#b").addClass('btn-outline-secondary');
    $("#c").addClass('btn-outline-secondary');
    $("#d").addClass('btn-outline-secondary');
    $("#a").addClass('btn-outline-secondary');
    $("#"+this.id+"").addClass('btn-danger');
    $("#staff_remarks"+curr+"").val('e');
   }
   remark[curr] = $("#staff_remarks"+curr+"").val();
});

  $("input[name='share']").click(function(e){
    let value = $("input[name='share']:checked").val();
    if(value === undefined) return;
 });
  $('.role').focusout(function(e){
    let rand = Math.random() * 9999999999;
    let val = $("#"+this.id+"").val();
    if(val == "") return false; 
    let list = $("#appraisal_flow").val();
    if(list == ''){
      $("#appraisal_flow").val(val);
    }else {
      $("#appraisal_flow").val(list+";"+val);
    }
  });
});