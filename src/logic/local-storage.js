
let storage = null;

const currentURL = new URL(window.location);
let fileKey = currentURL.searchParams.get('filekey');

if (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') || window.location.href.startsWith('file://')) {
  fileKey = 'local'
}

// dont use local storage if no filekey
if (fileKey) {
  const localStorageKey = `savedState-${fileKey}`;

  storage = {
    formValues: {},
    formResults: {},
    formComplete: false,
    outputURL: false,
  }

  const updateStorage = () => {
    const storedParams = ['formValues', 'formComplete', 'outputURL'];

    const storedState = storedParams.reduce((acc, key) => {
      acc[key] = storage[key];
      return acc;
    }, {});
    window.localStorage.setItem(localStorageKey, JSON.stringify(storedState));  
  }

  storage.setFormValues = (values) => {
    storage.formValues = values;
    updateStorage();
  }

  storage.setFormResults = (results) => {
    storage.formResults = results;
    updateStorage();
  }

  storage.setComplete = (complete) => {
    storage.formComplete = complete;
    updateStorage();
  }

  storage.setOutputURL = (outputURL) => {
    storage.outputURL = outputURL;
    updateStorage();
  }


  if (window.localStorage.getItem(localStorageKey)) {
    try {
      const storedJSON = window.localStorage.getItem(localStorageKey);

      if (storedJSON) {
        const storedState = JSON.parse(storedJSON);
        storage.setFormValues(storedState.formValues);
        storage.setFormResults(storedState.formResults);
        storage.setComplete(storedState.complete);
        storage.setOutputURL(storedState.outputURL);
      }
    } catch (err) {
      console.log(err);
      //console.log (unable to get field answers from local storage);
    }
  }
}

export default storage;