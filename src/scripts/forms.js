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
    
    // Clear checkbox group errors when any checkbox is checked
    const checkboxGroups = form.querySelectorAll('[data-required-group]')
    checkboxGroups.forEach(group => {
      const checkboxes = group.querySelectorAll('input[type="checkbox"]')
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          if (e.target.checked) {
            // Clear error for the entire group
            const groupName = group.getAttribute('data-required-group')
            const errorElement = document.querySelector(`.error-message[data-field="${groupName}"]`)
            if (errorElement) {
              errorElement.textContent = ''
              errorElement.setAttribute('aria-hidden', 'true')
              const groupContainer = group.closest('.form-group--checkboxes')
              if (groupContainer) {
                groupContainer.classList.remove('error')
              }
            }
          }
        })
      })
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
  
  // Add error class to fieldset for CSS targeting
  const fieldset = field.closest('fieldset.form-group')
  if (fieldset) {
    fieldset.classList.add('error')
  }
  
  // Find error message element using data-field attribute
  // For checkbox groups, use the group name; for other fields, use field id
  const fieldId = field.type === 'checkbox' && field.closest('[data-required-group]') 
    ? field.closest('[data-required-group]').getAttribute('data-required-group')
    : field.id
  
  const errorElement = document.querySelector(`.error-message[data-field="${fieldId}"]`)
  if (errorElement) {
    errorElement.textContent = message
    errorElement.setAttribute('aria-hidden', 'false')
  }
}

function clearFieldError(e) {
  const field = e.target
  field.classList.remove('error')
  
  // Remove error class from fieldset
  const fieldset = field.closest('fieldset.form-group')
  if (fieldset) {
    fieldset.classList.remove('error')
  }
  
  // Hide error message but keep in DOM to prevent layout shift
  // For checkbox groups, use the group name; for other fields, use field id
  const fieldId = field.type === 'checkbox' && field.closest('[data-required-group]')
    ? field.closest('[data-required-group]').getAttribute('data-required-group')
    : field.id
  
  const errorElement = document.querySelector(`.error-message[data-field="${fieldId}"]`)
  if (errorElement) {
    errorElement.textContent = ''
    errorElement.setAttribute('aria-hidden', 'true')
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
  
  // Validate checkbox groups
  const checkboxGroups = form.querySelectorAll('[data-required-group]')
  checkboxGroups.forEach(group => {
    const checkboxes = group.querySelectorAll('input[type="checkbox"]')
    const checked = Array.from(checkboxes).some(cb => cb.checked)
    if (!checked) {
      isValid = false
      // Use the group name for error message lookup
      const groupName = group.getAttribute('data-required-group')
      const errorElement = document.querySelector(`.error-message[data-field="${groupName}"]`)
      if (errorElement) {
        errorElement.textContent = 'Please select at least one option'
        errorElement.setAttribute('aria-hidden', 'false')
        // Add error class to the group container
        const groupContainer = group.closest('.form-group--checkboxes')
        if (groupContainer) {
          groupContainer.classList.add('error')
        }
      }
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
          <h3>Thank you for reaching out!</h3>
          <p>Your message has been received. Tyler will get back to you within 24-48 hours.</p>
        </div>
      `
      // Scroll to form if needed
      form.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      // Update URL hash to match redirect
      if (window.location.pathname === '/contact.html' || window.location.pathname === '/creatorarq.html') {
        window.history.replaceState(null, '', `${window.location.pathname}#success`)
      }
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

// Handle form success hash (in case JavaScript didn't run and Netlify redirected)
if (window.location.hash === '#success') {
  const form = document.querySelector('#contact-form')
  if (form && !form.querySelector('.form-success')) {
    // Form was submitted but JavaScript didn't run - show success message
    form.innerHTML = `
      <div class="form-success">
        <h3>Thank you for reaching out!</h3>
        <p>Your message has been received. Tyler will get back to you within 24-48 hours.</p>
      </div>
    `
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
}

