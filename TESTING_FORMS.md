# Testing Forms on Netlify

## Option 1: Test Locally with Netlify Dev (Recommended)

This simulates the Netlify environment locally and processes forms correctly.

### Steps:

1. **Build the project first:**
   ```bash
   npm run build
   ```

2. **Start Netlify Dev:**
   ```bash
   netlify dev
   ```
   
   This will:
   - Start a local server (usually at `http://localhost:8888`)
   - Process Netlify forms locally
   - Show form submissions in the terminal

3. **Test the forms:**
   - Open `http://localhost:8888/contact.html` and submit the contact form
   - Open `http://localhost:8888/creatorarq.html` and submit the creatorarq form
   - Check the terminal output for form submission confirmations

4. **Verify in Netlify Dashboard:**
   - Go to your Netlify site dashboard
   - Navigate to **Forms** section
   - You should see two separate forms:
     - `contact` (from contact.html)
     - `creatorarq` (from creatorarq.html)

---

## Option 2: Deploy to Netlify and Test on Live Site

### Steps:

1. **Commit and push your changes:**
   ```bash
   git add creatorarq.html src/scripts/forms.js
   git commit -m "fix(forms): separate creatorarq form from contact form in Netlify"
   git push origin feature/creatorarq-form-netlify-fix
   ```

2. **Create a Pull Request:**
   - This will trigger a Netlify preview deployment
   - You'll get a preview URL like: `https://[random-name]--[site-name].netlify.app`

3. **Test on Preview URL:**
   - Visit `https://[preview-url]/contact.html` and submit the form
   - Visit `https://[preview-url]/creatorarq.html` and submit the form
   - Both should redirect to the thank-you page

4. **Check Netlify Dashboard:**
   - Go to your Netlify site dashboard
   - Navigate to **Forms** section
   - You should see two separate forms listed
   - Click on each form to see submissions

5. **Merge to develop/main:**
   - Once verified, merge the PR
   - Test again on production URL

---

## What to Look For

### ✅ Success Indicators:

1. **In Netlify Dashboard → Forms:**
   - Two separate forms appear: `contact` and `creatorarq`
   - Each form shows its own submission count
   - Submissions are categorized under the correct form name

2. **When Submitting Forms:**
   - Form validates correctly (required fields)
   - Shows "Sending..." state
   - Redirects to `/thank-you.html` after submission
   - No console errors

3. **Form Data:**
   - All fields are captured correctly
   - Form name appears in submission data
   - Honeypot field (`bot-field`) is empty (spam protection working)

### ❌ If Forms Still Show as One:

- Check that both forms have unique `name` attributes
- Verify the hidden `form-name` input matches the form's `name` attribute
- Ensure `data-netlify="true"` is present on both forms
- Check browser console for any JavaScript errors
- Verify the form is posting to the correct page URL

---

## Quick Test Checklist

- [ ] Build completes successfully (`npm run build`)
- [ ] Netlify Dev runs without errors (`netlify dev`)
- [ ] Contact form submits successfully
- [ ] CreatorArq form submits successfully
- [ ] Both forms redirect to thank-you page
- [ ] Netlify dashboard shows two separate forms
- [ ] Form submissions appear under correct form names
- [ ] No console errors during submission

---

## Troubleshooting

### Forms not appearing in dashboard:
- Wait a few minutes for Netlify to process
- Check that forms have `data-netlify="true"` attribute
- Verify form names are unique and don't contain special characters

### Form submission fails:
- Check browser console for errors
- Verify form JavaScript is loading correctly
- Ensure form is posting to the current page URL (not action URL)
- Check Netlify Dev terminal for error messages

### Forms still showing as one:
- Double-check `name` attributes are different
- Verify `form-name` hidden input matches form `name`
- Clear browser cache and try again

