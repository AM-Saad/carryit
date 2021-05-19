const slidePage = document.querySelector(".slide-page");
const nextBtnFirst = document.querySelector(".firstNext");
const prevBtnSec = document.querySelector(".prev-1");
const nextBtnSec = document.querySelector(".next-1");
const prevBtnThird = document.querySelector(".prev-2");
const nextBtnThird = document.querySelector(".next-2");
const prevBtnFourth = document.querySelector(".prev-3");
const submitBtn = document.querySelector(".submit");
const progressText = document.querySelectorAll(".step p");
const progressCheck = document.querySelectorAll(".step .check");
const bullet = document.querySelectorAll(".step .bullet");
let current = 1;

nextBtnFirst.addEventListener("click", function (event) {
  event.preventDefault();
  const valid = validateForm(event)
  if (valid) {

    slidePage.style.marginLeft = "-25%";
    bullet[current - 1].classList.add("active");
    progressCheck[current - 1].classList.add("active");
    progressText[current - 1].classList.add("active");
    $(event.target).parents('.page').addClass('visible-page')
    current += 1;
  }

});
nextBtnSec.addEventListener("click", function (event) {
  event.preventDefault();
  const valid = validateForm(event)
  console.log(valid);

  if (valid) {

    slidePage.style.marginLeft = "-50%";
    bullet[current - 1].classList.add("active");
    progressCheck[current - 1].classList.add("active");
    progressText[current - 1].classList.add("active");
    current += 1;
  }

});
nextBtnThird.addEventListener("click", function (event) {
  event.preventDefault();
  const valid = validateForm(event)
  if (valid) {

    slidePage.style.marginLeft = "-75%";
    bullet[current - 1].classList.add("active");
    progressCheck[current - 1].classList.add("active");
    progressText[current - 1].classList.add("active");
    current += 1;
  }
});


submitBtn.addEventListener("click", function () {
  bullet[current - 1].classList.add("active");
  progressCheck[current - 1].classList.add("active");
  progressText[current - 1].classList.add("active");
  current += 1;

});


prevBtnSec.addEventListener("click", function (event) {
  event.preventDefault();
  slidePage.style.marginLeft = "0%";
  bullet[current - 2].classList.remove("active");
  progressCheck[current - 2].classList.remove("active");
  progressText[current - 2].classList.remove("active");
  current -= 1;
});

prevBtnThird.addEventListener("click", function (event) {
  event.preventDefault();
  slidePage.style.marginLeft = "-25%";
  bullet[current - 2].classList.remove("active");
  progressCheck[current - 2].classList.remove("active");
  progressText[current - 2].classList.remove("active");
  current -= 1;
});

prevBtnFourth.addEventListener("click", function (event) {
  event.preventDefault();
  slidePage.style.marginLeft = "-50%";
  bullet[current - 2].classList.remove("active");
  progressCheck[current - 2].classList.remove("active");
  progressText[current - 2].classList.remove("active");
  current -= 1;
});


function validateForm(e) {
  // This function deals with validation of the form fields
  var x, y, i, valid = true;
  // x = document.getElementsByClassName("tab");
  // y = x[currentTab].getElementsByTagName("input");
  const inputs = $(e.target).parents('.page').find('input')
  // A loop that checks every input field in the current tab:
  inputs.each(function () {
    if ($(this).hasClass('required')) {

      const val = $(this).val()
      // If a field is empty...
      if (val == "") {
        // add an "invalid" class to the field:
        $(this).removeClass("valid")
        $(this).addClass("invalid")
        // and set the current valid status to false:
        valid = false;
      } else {
        $(this).removeClass("invalid")
        $(this).addClass("valid")
      }
    }

  })

  // If the valid status is true, mark the step as finished and valid:
  if (valid) {
    // document.getElementsByClassName("step")[currentTab].className += " finish";
  }
  return valid; // return the valid status
}


$("input").on('input', function () {
  const val = $(this).val()
  console.log('here');

  if (val == "") {
    // add an "invalid" class to the field:
    $(this).removeClass("valid")
    $(this).addClass("invalid")
    // and set the current valid status to false:
  } else {
    $(this).removeClass("invalid")
    $(this).addClass("valid")
  }
})