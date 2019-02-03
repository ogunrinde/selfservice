$(function(){ 
  //alert('as');
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
    if($("#staff_remarks"+curr+"").val() === '') return false;
    if($("#justify"+curr+"").val() === '') return false;
    //alert($("#all_grades").val());
    //alert("ol");
  	e.preventDefault();
    c = $(this).is(".next") ? ++c : --c;       
    if(c > curr) $(".head_title").text(title[1]);
    else $(".head_title").text(title[0]);
    $slide.animate({scrollLeft: slideW * c }, 600);  // Anim by multiplying
  });
  $('.prev_review, .next_review').click(function( e ){
  	e.preventDefault();
    c = $(this).is(".next_review") ? ++c : --c;       
    if(c > curr) $(".head_title").text(title[1]);
    else $(".head_title").text(title[0]);
    $slide.animate({scrollLeft: slideW * c }, 600);  // Anim by multiplying
  });
 /* $('.prev_admin, .next_admin').click(function( e ){
    //alert("am");
  	e.preventDefault();
    c = $(this).is(".next_admin") ? ++c : --c;       
    if(c > curr) $(".head_title").text(title[1]);
    else $(".head_title").text(title[0]);
    $slide.animate({scrollLeft: slideW * c }, 600);  // Anim by multiplying
  });*/
  $("#submit_btn").on('click', function(){
     if(justification.length === 0) return false;
     if(remark.length === 0) return false;
     let year = $('#app_year').val();
     let app_id = $('#app_id').val();
     $('#submit_btn').val('<i class ="fa fa-spinner"></i>');
     $.ajax({
       method: 'post',
       url : '/process_data',
       data : {justification : justification, remark : remark, year : year, appraisal_id:app_id},
       success: function(data){
          if(data.success == true){
            Swal.fire({
              position: 'top-end',
              type: 'success',
              title: 'Appraisal will be sent to your line Manager',
              showConfirmButton: false,
              timer: 1500
            });
            window.location.href = '/responsemsg';
          }
       }
     });
  });
  $("#manager_btn").on('click', function(){
    if(justification.length === 0) return false;
    if(remark.length === 0) return false;
    let year = $('#app_year').val();
    let app_id = $('#app_id').val();
    let staff_id = $('#staff_id').val();
    let manager = $('#manager').val();
    let manager_email = $('#manager_email').val();
    $.ajax({
      method: 'post',
      url : '/process_manager_remark',
      data : {manager_email : manager_email, justification : justification, remark : remark, year : year, app_id : app_id, staff_id :staff_id, manager : manager},
      success: function(data){
         if(data.success == true){
           Swal.fire({
             position: 'top-end',
             type: 'success',
             title: '',
             showConfirmButton: false,
             timer: 1500
           });
           window.location.href = '/responsemsg';
         }
      }
    })
 });
  $('.justify').on('focusout', function(req,res){
    let curr =  $("#"+this.id+"").attr("curr");
    justification[curr] = $("#"+this.id+"").val();
  });
  $('.bjustify').on('focusout', function(req,res){
    let curr =  $("#"+this.id+"").attr("curr");
    $('.bjustify').val($("#"+this.id+"").val());
    remark[curr] = ['0'];
    justification[curr] = $("#"+this.id+"").val();
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
    //alert(val);
    $("#addyear").val(val);
    $('#user_id').val();
    $("#submityear").trigger('click');
});
$('.getleave').on('click', function(e){
  let val = $("#"+this.id+"").attr('leave_id');
  window.location.href = '/each_request/'+val+'';
});
  $('.return').on('click', function(e){
    e.preventDefault();
      window.location.href = "/filled_appraisal";
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
    $('.dgroup').append('<li class="list-group-item" style = "text-transform: capitalize">'+val+'</li>');
    $("#company_dept").val('');
    //alert($('.dgroup > li').length);
    if($('.dgroup > li').length ==  1) 
      $('.dgroup').prepend('<li class="list-group-item bg-primary" style ="color:#fff;">Departments</li>');
  });
  $("#AddBranch").on("click", function(e){
    e.preventDefault();
    let rand = Math.random() * 9999999999;
    let val = $("#company_branch").val().toLowerCase();
    if(val == "") return false; 
    let list = $("#branch").val();
    if(list == ''){
      $("#branch").val(val);
    }else {
      $("#branch").val(list+";"+val);
    }
    //alert($("#dept_list").val());
    $('.head_branch').text('BRANCH');
    $('.lgroup').append('<li class="list-group-item" style = "text-transform: capitalize">'+val+'</li>');
    $("#company_branch").val('');
    if($('.lgroup > li').length ==  1) 
      $('.lgroup').prepend('<li class="list-group-item bg-danger" style ="color:#fff;">Branches</li>');
  });
  $('#uploadimg').on('click', function(e){
     $("#file").trigger('click');
  });
  $('#uploadprofile').on('click', function(e){
    $("#profile").trigger('click');
 });
 $('.grade').on('click', function(e){
   let curr =  $("#"+this.id+"").attr("curr");
   //alert(this.id.charAt(0));
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
    $("#a"+curr+"").addClass('btn-outline-secondary');
    $("#c"+curr+"").addClass('btn-outline-secondary');
    $("#d"+curr+"").addClass('btn-outline-secondary');
    $("#e"+curr+"").addClass('btn-outline-secondary');
    $("#"+this.id+"").addClass('btn-success');
    $("#staff_remarks"+curr+"").val('b');
   }else if(this.id.charAt(0) == 'c') {
    $("#"+this.id+"").removeClass('btn-outline-secondary');
    $("#b"+curr+"").addClass('btn-outline-secondary');
    $("#a"+curr+"").addClass('btn-outline-secondary');
    $("#d"+curr+"").addClass('btn-outline-secondary');
    $("#e"+curr+"").addClass('btn-outline-secondary');
    $("#"+this.id+"").addClass('btn-primary');
    $("#staff_remarks"+curr+"").val('c');
   }else if(this.id.charAt(0) == 'd') {
    $("#"+this.id+"").removeClass('btn-outline-secondary');
    $("#b"+curr+"").addClass('btn-outline-secondary');
    $("#c"+curr+"").addClass('btn-outline-secondary');
    $("#a"+curr+"").addClass('btn-outline-secondary');
    $("#e"+curr+"").addClass('btn-outline-secondary');
    $("#"+this.id+"").addClass('btn-danger');
    $("#staff_remarks"+curr+"").val('d');
   }else if(this.id.charAt(0) == 'e') {
    $("#"+this.id+"").removeClass('btn-outline-secondary');
    $("#b"+curr+"").addClass('btn-outline-secondary');
    $("#c"+curr+"").addClass('btn-outline-secondary');
    $("#d"+curr+"").addClass('btn-outline-secondary');
    $("#a"+curr+"").addClass('btn-outline-secondary');
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
  $(".card").on('click', function(){
    let r = $("#"+this.id+"").attr('user_id');
    let code = btoa(r);
     window.location.href = "/view_staff/"+code+"";
  });
  $(".drop").on('click', function(){
    let r = $("#"+this.id+"").attr('data');
    let code = btoa(r);
     window.location.href = "/drop_appraisal/"+code+"";
    });
    $(".suspend").on('click', function(){
      let r = $("#"+this.id+"").attr('data');
      let code = btoa(r);
       window.location.href = "/suspend_appraisal/"+code+"";
      });
});