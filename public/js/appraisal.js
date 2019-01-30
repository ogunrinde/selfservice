$(function(){
  $('.start').css('display', 'block');
  $('.start h4').text('Staff');
  var $slide = $("#slides");      // Cache the elements you plan to reuse!
  var $pages = $slide.children(); // Get the actual slides pages
  var slideW = $slide.width();
  var c = 0;                      // Use a counter
  let title = ['Appraisal Details', 'Performance Evaluation'];
  let curr = c;
  $(".head_title").text(title[c]);
  // Use classes instead of ID!
  $('.prev, .next').click(function( e ){
  	e.preventDefault();
    c = $(this).is(".next") ? ++c : --c;       
    if(c > curr) $(".head_title").text(title[1]);
    else $(".head_title").text(title[0]);
    $slide.animate({scrollLeft: slideW * c }, 600);  // Anim by multiplying
  });
  $('#upload').on('click', function(){
    $('#file').trigger('click');
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