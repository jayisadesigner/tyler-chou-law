/**
 * Form Handling
 * Client-side validation and submission handling
 */

export function initForms() {
  const forms = document.querySelectorAll('form[data-netlify="true"]')
  
  forms.forEach(form => {
    form.addEventListener('submit', handleFormSubmit)
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea, select')
    inputs.forEach(input => {
      input.addEventListener('blur', validateField)
      input.addEventListener('input', clearFieldError)
    })
  })
}

function validateField(e) {
  const field = e.target
  const value = field.value.trim()
  
  // Remove existing error
  clearFieldError(e)
  
  // Required field validation
  if (field.hasAttribute('required') && !value) {
    showFieldError(field, 'This field is required')
    return false
  }
  
  // Email validation
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      showFieldError(field, 'Please enter a valid email address')
      return false
    }
  }
  
  return true
}

function showFieldError(field, message) {
  field.classList.add('error')
  
  let errorElement = field.parentElement.querySelector('.error-message')
  if (!errorElement) {
    errorElement = document.createElement('span')
    errorElement.className = 'error-message'
    field.parentElement.appendChild(errorElement)
  }
  errorElement.textContent = message
}

function clearFieldError(e) {
  const field = e.target
  field.classList.remove('error')
  const errorElement = field.parentElement.querySelector('.error-message')
  if (errorElement) {
    errorElement.remove()
  }
}

function handleFormSubmit(e) {
  e.preventDefault()
  
  const form = e.target
  const formData = new FormData(form)
  
  // Validate all fields
  let isValid = true
  const requiredFields = form.querySelectorAll('[required]')
  requiredFields.forEach(field => {
    if (!validateField({ target: field })) {
      isValid = false
    }
  })
  
  if (!isValid) {
    return false
  }
  
  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]')
  const originalText = submitButton.textContent
  submitButton.disabled = true
  submitButton.textContent = 'Sending...'
  
  // Submit to Netlify
  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(formData).toString(),
  })
    .then(() => {
      // Show success message
      form.innerHTML = `
        <div class="form-success">
          <h3>Thank you!</h3>
          <p>Your message has been sent. We'll get back to you soon.</p>
        </div>
      `
    })
    .catch((error) => {
      console.error('Form submission error:', error)
      submitButton.disabled = false
      submitButton.textContent = originalText
      alert('There was an error sending your message. Please try again.')
    })
  
  return false
}

// Initialize forms when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initForms)
} else {
  initForms()
}

