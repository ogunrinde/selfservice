$(function(){
    function isValidEmailAddress(emailAddress) {
        var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
        if(pattern.test(emailAddress) === false) {
            $("#msgemail").text('Please enter a valid email address');
        }
        return pattern.test(emailAddress);
    };
    function passMatch(password, cpassword){
        if (password.length == 0 && cpassword.length >= 8) {
            $("#errpassword1").text('Password field is empty');
            return false;
        }else if (password.length > 8 && cpassword.length == 0){
            $("#errpassword2").text('Password field is empty');
            return false;
        }else if (password.length < 8 && cpassword.length >= 8){
            $("#errpassword1").text('Password field required 8 characters');
            return false;
        }else if (password.length < 8 && cpassword.length >= 8){
            $("#errpassword2").text('Password field required 8 characters');
            return false;
        }else if(password === cpassword) return true;
        else {
            $("#errpassword1").text('Password Mismatch');
            $("#errpassword2").text('Password Mismatch');
            return false;
        }
    }
    function Company(company_name) {
      if (company_name === "") {
        $("#company").text('Please select company name');
        return false;
      }
      return true;
    }
    function clearData(){
        $("#email").val('');
        $("#cpassword").val('');
        $("#company_name").val('');
    }
    function myFunction(){
        alert("as");
        /*var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", '/profile', false );
        xmlHttp.setRequestHeader("Ocp-Apim-Subscription-Key",'wwwwwwwwwwwwwww');
        xmlHttp.send(null);
        return xmlHttp.responseText;*/
    }
    $("#click").on('click', function(e){
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", '/profile', false );
        xmlHttp.setRequestHeader("Ocp-Apim-Subscription-Key",'wwwwwwwwwwwwwww');
        xmlHttp.send(null);
        //return xmlHttp.responseText;
        alert("as");
    })
   $("input").keydown(function(){ 
      $(".errpassword").text('');
      $("#msgemail").text('');
   });
   $('#LogIn').on('click', function(e){
      e.preventDefault();
      const data = {
        email : $("#email").val(),
        password : $("#password").val()
      }
      if(data.email === "") {
          $('#msgemail').text('Email is empty');
          return false;
      }else if(data.password === ""){
        $('#errpassword').text('Password is empty');
          return false;
      }
      $('#Login').val("Processing...");
      $('#Login').attr('disable',true);
      $.ajax({
        method: 'POST',
        url: '/login',
        data: data,
        success : function(data){
            console.log(data);
           if(data.success === true) {
             clearData();  
             $('#Login').val("Log In");  
           }else {
               alert(data.message);
               $('.message').addClass('bg-danger');
               $('.message').css({
                   'text-align': 'center',
                   'padding': '7px',
                    'color' : '#fff'
               });
               $('.message').text(data.message);
           }
        }
    })
   });
   $('#submitData').on('click', function(e){
       e.preventDefault();
       const data = {
           email : $("#email").val(),
           password : $("#password").val(),
           cpassword : $("#cpassword").val(),
           company_name : $("#company_name").val()
       }
       const validemail = isValidEmailAddress(data.email);
       const passwordmatch = passMatch(data.password, data.cpassword);
       const isCompanySelected = Company(data.company_name);
       if (validemail === false || passwordmatch === false || isCompanySelected === false) return false;
       $('#submitData').val("Processing...");
       $('#submitData').attr('disable',true);
       $.ajax({
           method: 'POST',
           url: '/register',
           data: data,
           success : function(data){
              if(data.success === true) {
                clearData();  
                $('#submitData').val("Create Account");  
                Swal.fire({
                    position: 'top-end',
                    type: 'success',
                    title: 'Account Created',
                    showConfirmButton: false,
                    timer: 3500
                  })
              }
           }
       })

   })
});