document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("contact-form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const commentsInput = document.getElementById("comments");
    
    const errorOutput = document.getElementById("error-output");
    const infoOutput = document.getElementById("info-output");

    const charCountWrapper = document.getElementById("char-count-wrapper");
    const charCountSpan = document.getElementById("char-count");
    
    const commentsMaxLength = commentsInput.maxLength;
    const initialRemaining = commentsMaxLength - commentsInput.value.length;
    charCountSpan.textContent = initialRemaining;

    let nameFlashTimeout = null;

    const namePattern = new RegExp(nameInput.getAttribute('pattern'));

    nameInput.addEventListener('beforeinput', (e) => {
        const inserted = e.data;
        if (!inserted) {
            return; 
        }

        if (!/^[a-zA-Z\s'-]+$/.test(inserted)) {
            nameInput.classList.add('is-flashing');

            errorOutput.textContent = 'Disallowed character: Please use only letters, spaces, hyphens, or apostrophes.';

            if (nameFlashTimeout) {
                clearTimeout(nameFlashTimeout);
            }

            nameFlashTimeout = setTimeout(() => {
                nameInput.classList.remove('is-flashing');
                if (errorOutput.textContent && errorOutput.textContent.startsWith('Disallowed character')) {
                    errorOutput.textContent = '';
                }
                nameFlashTimeout = null;
            }, 1500);
        }
    });


    commentsInput.addEventListener("input", () => {
        const currentLength = commentsInput.value.length;
        const remaining = commentsMaxLength - currentLength;

        charCountSpan.textContent = remaining;

        const wrapper = charCountSpan.parentElement;

        wrapper.classList.remove("warning", "error");

        if (remaining < 0) {
            wrapper.classList.add("error");
        } else if (remaining < commentsMaxLength * 0.1) {
            wrapper.classList.add("warning");
        }
    });


    form.addEventListener("submit", (event) => {
        event.preventDefault();

        errorOutput.innerHTML = ""; 
        infoOutput.textContent = "";

        let form_errors = [];

        if (nameInput.validity.valueMissing) {
            form_errors.push({ field: 'name', message: 'Name is required.' });
            nameInput.setCustomValidity('Name is required.'); 
        } else if (nameInput.validity.tooShort) {
            form_errors.push({ field: 'name', message: 'Name must be at least 2 characters.' });
            nameInput.setCustomValidity('Name must be at least 2 characters.');
        } else if (nameInput.validity.patternMismatch) {
            form_errors.push({ field: 'name', message: 'Name contains invalid characters.' });
            nameInput.setCustomValidity('Name contains invalid characters.');
        } else {
            nameInput.setCustomValidity(''); 
        }

        if (emailInput.validity.valueMissing) {
            form_errors.push({ field: 'email', message: 'Email is required.' });
            emailInput.setCustomValidity('Email is required.');
        } else if (emailInput.validity.typeMismatch) {
            form_errors.push({ field: 'email', message: 'Please enter a valid email address.' });
            emailInput.setCustomValidity('Please enter a valid email address.');
        } else {
            emailInput.setCustomValidity('');
        }

        if (commentsInput.validity.valueMissing) {
            form_errors.push({ field: 'comments', message: 'Comments are required.' });
            commentsInput.setCustomValidity('Comments are required.');
        } else if (commentsInput.validity.tooShort) {
            form_errors.push({ field: 'comments', message: 'Comments must be at least 10 characters.' });
            commentsInput.setCustomValidity('Comments must be at least 10 characters.');
        } else if (commentsInput.validity.tooLong) {
            form_errors.push({ field: 'comments', message: `Comments have exceeded the ${commentsMaxLength} character limit.` });
            commentsInput.setCustomValidity(`Comments have exceeded the ${commentsMaxLength} character limit.`);
        } else {
            commentsInput.setCustomValidity('');
        }

        let errorsInput = form.querySelector('input[name="form-errors"]');
        if (!errorsInput) {
            errorsInput = document.createElement('input');
            errorsInput.type = 'hidden';
            errorsInput.name = 'form-errors';
            form.appendChild(errorsInput);
        }
        errorsInput.value = JSON.stringify(form_errors);


        if (form_errors.length > 0) {
            const errorList = document.createElement('ul');
            errorList.style.paddingLeft = '1.25rem';
            form_errors.forEach(error => {
                const li = document.createElement('li');
                li.textContent = error.message;
                errorList.appendChild(li);
            });
            errorOutput.appendChild(errorList);
            
            const firstInvalidField = form.querySelector(':invalid');
            if(firstInvalidField) {
                firstInvalidField.focus();
            }

        } else {
            infoOutput.textContent = "Submitting your message...";
            
            submitForm(form);
        }
    });

    async function submitForm(formElement) {
        const formData = new FormData(formElement);
        const url = formElement.action;
        const method = formElement.method;

        try {
            const response = await fetch(url, {
                method: method,
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            infoOutput.textContent = "Success! Your form has been submitted.";
            console.log("Submission success:", result);
            
            formElement.reset();
            
            charCountSpan.textContent = commentsMaxLength;
            charCountWrapper.classList.remove("warning", "error");

        } catch (error) {
            errorOutput.textContent = "Submission failed. Please check your network and try again.";
            console.error("Submission error:", error);
        }
    }
});