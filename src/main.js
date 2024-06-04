import inquirer from 'inquirer';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

//SECTION -  Firebase configuration
// Note: These values are taken from the Firebase console configuration.
const firebaseConfig = {
  apiKey: "AIzaSyCTbfyIf_t2pBFfWxYeowM9RhUtTONWu7k",
  authDomain: "sdv-502.firebaseapp.com",
  projectId: "sdv-502",
  storageBucket: "sdv-502.appspot.com",
  messagingSenderId: "378639683287",
  appId: "1:378639683287:web:28f8ddd9f1a20a088c2a92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//SECTION -  Main function to run the prompts
(async () => {
  try {
    // Step 1: Ask if the user is a Patient or Health Care Provider
    const userType = await askUserType();

    if (userType === 'Patient') {
      // Step 2: Ask if the patient is new or existing
      const patientType = await askPatientType(); // use await to wait for askPatientType to complete before moving on and storing the result in patientType variable

      if (patientType === 'New Patient') {
        // If new patient, ask for detailed profile information
        const newPatientInfo = await getNewPatientInfo(); // use await to wait for getNewPatientInfo to complete before moving on and storing the result in newPatientInfo variable
        await createPatientProfile(newPatientInfo); // use await to wait for createPatientProfile to complete before moving on and storing the result in newPatientInfo variable. This function will create a new patient profile in Firestore
        console.log('New patient profile created successfully.');
      } else {
        // If existing patient, ask for username and password
        const credentials = await askForCredentials();
        const isAuthenticated = await authenticatePatient(credentials);  // use await to wait for authenticatePatient to complete before moving on and storing the result in isAuthenticated variable

        if (isAuthenticated) {
          console.log('Authentication successful.');
          // TODO: Add functionality for existing patients
        } else {
          console.log('Authentication failed. Please check your username and password.');
        }
      }
    } else {
      // display a message (feature not implemented yet)
      console.log('You selected Health Care Provider. This feature is not implemented yet.'); // TODO: Add functionality for Health Care Provider
    }
  } catch (err) {
    // Handle errors 
    console.error(`There was an error: ${err.message}`, err);
  }
})();

//SECTION Function to ask if the user is a Patient or Health Care Provider
async function askUserType() {
  const answers = await inquirer.prompt([
    {
      name: 'userType',
      message: 'Are you a Patient or Health Care Provider?',
      type: 'list',
      choices: ['Patient', 'Health Care Provider']
    }
  ]);
  return answers.userType;
}

//SECTION -  Function to ask if the user is a new or existing patient
async function askPatientType() {
  const answers = await inquirer.prompt([
    {
      name: 'patientType',
      message: 'Are you a new or existing patient?',
      type: 'list',
      choices: ['New Patient', 'Existing Patient']
    }
  ]);
  return answers.patientType;
}

//SECTION -  Function to ask user for their username and password
async function askForCredentials() {
  const answers = await inquirer.prompt([
    {
      name: 'username',
      message: 'Enter your username:',
      type: 'input',
      validate: validateUsername
    },
    {
      name: 'password',
      message: 'Enter your password:',
      type: 'password',
      mask: '*',
      validate: validatePassword
    }
  ]);
  return answers;
}

//SECTION -  Function to prompt the user for new patient information
async function getNewPatientInfo() {
  const answers = await inquirer.prompt([
    { name: 'firstName', message: 'First name:', type: 'input' },
    { name: 'lastName', message: 'Last name:', type: 'input' },
    { name: 'nhi', message: 'NHI:', type: 'input' },
    { name: 'streetNumber', message: 'Street number:', type: 'input' },
    { name: 'streetName', message: 'Street name:', type: 'input' },
    { name: 'postalCode', message: 'Postal code:', type: 'input' },
    { name: 'phoneNumber', message: 'Phone number:', type: 'input' },
    { name: 'age', message: 'Age:', type: 'input' },
    { name: 'gender', message: 'Gender:', type: 'input' },
    { name: 'username', message: 'Create a username:', type: 'input', validate: validateUsername },
    { name: 'password', message: 'Create a password:', type: 'password', mask: '*', validate: validatePassword },
    { name: 'securityQuestion1', message: 'Security question 1:', type: 'input' },
    { name: 'securityAnswer1', message: 'Answer to security question 1:', type: 'input' },
    { name: 'securityQuestion2', message: 'Security question 2:', type: 'input' },
    { name: 'securityAnswer2', message: 'Answer to security question 2:', type: 'input' }
  ]);
  return answers;
}

//SECTION -  Function to create a new patient profile in Firestore
async function createPatientProfile(profile) {
  try {
    // Save the new patient profile to Firestore
    const docRef = await addDoc(collection(db, 'patients'), profile);
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    // Log any errors that occur
    console.error('Error adding document: ', e);
  }
}

//SECTION -  Function to authenticate an existing patient
async function authenticatePatient({ username, password }) {
  // Query Firestore for the username and password
  const q = query(collection(db, 'patients'), where('username', '==', username), where('password', '==', password));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

//SECTION -  Username validation function
function validateUsername(username) {
  if (!username.length) {
    return 'Please provide a username';
  }
  if (username.length <= 3 || username.length > 20) {
    return 'Please provide a username between 4 and 20 characters long';
  }
  return true;
}

//SECTION -  Password validation function
function validatePassword(password) {
  if (!password.length) {
    return 'Please provide a password';
  }
  if (password.length <= 5 || password.length > 20) {
    return 'Please provide a password between 6 and 20 characters long';
  }
  return true;
}

// TODO: Add functionality for existing patients
// TODO: Add functionality for Health Care Providers
// TODO: Encrypt passwords before storing them in Firestore
// TODO: Implement password reset functionality using security questions
// TODO: Add more detailed validation for user inputs
