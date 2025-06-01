As a senior JS fullstack developer specialized in React and ExpressJS, generate an ATS (Applicant Tracking System) based on the project setup (@README.md)

## Frontend

### UI description

The frontend will consist of a header, a search section below and then an infinite scroll list (look at @https://findwork.dev/?search=category:frontend&date_range__gte=30 for UI reference/guidelines).

### Header

The header will consist of the app name on the left and a button on the right that will prompt a modal whit a candidate form to submit a new application.

#### Search

Add a search section with options to filter by: name, email, company name, role, industry, minimum years of experience, maximum years of experience, education degree, degree title and if it is available or not. Add consistent validations and input types for them.

#### Candidates list

Show the candidate name, role, company, industry, years of experience, maximum degree and title and if it is available or not. When clicking on an entry, open a modal with the full candidate information ready to edit.

#### Candidate form

Will be shown in a modal accessible from the app header and will share the UI with the edition functionality.

Should have inputs to gather the next information: name, last name, email, address, education, experience, availability and an optional .pdf or .docx file.

Education will be a list consistent of Institution, Title, Degree and Years as optional field. Entries can be added, edited, deleted.

Experience will be a list consistent of Role, Company, Industry, Start date, End date. Entries can be added, edited, deleted.

Once a candidate is submitted, show a success toast.

If there's a general error, show the error in a toast. If there's a validation error or a BE error related to an specific field, highlight the wrong input and show the error below it.

On creation mode, the form will show Create and Cancel Buttons
On edition mode, the form will show Save, Cancel/Close (Cancel in case form is dirty) and Delete buttons

### Technical specifications

Use tailwind as css framework, tanstack/react-query as fetching library, react-hook-form with Yup to handle form with consistent validations, react-dropzone for file attachment.

## Backend

Implement migrations, models, relations, endpoints and resources to support the frontend functionalities.

Candidates submission must implement validations consistent with the UI.

## Guidelines

- Use SOLID principles and clean architecture design
- All features must have proper unit tests
- Use semantic and accessible html
- UI must follow a mobile first design but must look professional and readable on desktop screens as well
- Ask any question you need

# Corrections

Needed to explain that education and experience are optionals, which also caused an error on list, that the assistant was able to fix easily

The file dropzone was only show on candidate edition. Asking the assistant to fix. I had some concerns bc the initial BE implementation was tied to having a candidate created on the DB, so it needed to update FE & BE at the same time. Luckily it worked whit only one prompt!
