document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('inputForm');
    const submitButton = document.getElementById('signUpBtn');
    const inputs = form.querySelectorAll('input');

    function checkInputs() {
        let allFilled = true;

        inputs.forEach(input => {
            if (input.value === '') {
                allFilled = false;
            }
        });

        if (allFilled) {
            submitButton.classList.add('enabled');
            submitButton.disabled = false;
        } else {
            submitButton.classList.remove('enabled');
            submitButton.disabled = true;
        }
    }

    inputs.forEach(input => {
        input.addEventListener('input', checkInputs);
    });

    checkInputs();
});