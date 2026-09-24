// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datetime/css/react-datetime.css';
import './assets/scss/main.scss';
import { Provider } from 'react-redux';
import { store } from './Redux/Store.js';

// Load qz-tray (classic script, not a module) at runtime so Vite doesn't try to bundle it.
const qzScript = document.createElement('script');
qzScript.src = `${import.meta.env.BASE_URL}qz-tray.js`; // BASE_URL accounts for GitHub Pages' /<repo-name>/ subpath
qzScript.async = false;
document.head.appendChild(qzScript);
// import FirebaseNotifaction from './components/FirebaseNotification.jsx';

createRoot(document.getElementById('root')).render(
  <>
    <Provider store={store}>
      <App />
      {/* <FirebaseNotifaction /> */}
    </Provider>
  </>
);